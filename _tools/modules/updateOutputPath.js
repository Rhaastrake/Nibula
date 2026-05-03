const fs = require('fs');
const path = require('path');

const ELEVENTY_CONFIG = path.resolve(__dirname, '../../.eleventy.js');
const PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

function updateEleventyConfig(newPath) {
    let content = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');

    const updated = content.replace(
        /const OUTPUT_DIR\s*=\s*['"`][^'"`]*['"`]/,
        `const OUTPUT_DIR = "${newPath}"`
    );

    if (content === updated) {
        console.log('(!) OUTPUT_DIR not found in .eleventy.js');
        return false;
    }

    fs.writeFileSync(ELEVENTY_CONFIG, updated, 'utf-8');
    console.log(`(✓) .eleventy.js updated → ${newPath}`);
    return true;
}

function updatePackageJson(newPath) {
    const raw = fs.readFileSync(PACKAGE_JSON, 'utf-8');
    const pkg = JSON.parse(raw);

    pkg.scripts['build:css'] = `sass src/scss:${newPath}/css --no-source-map --style=compressed --quiet`;
    pkg.scripts['build:js'] = `esbuild "src/js/pages/*.js" --bundle --outdir=${newPath}/js/pages --minify`;
    pkg.scripts['serve:css'] = `sass --watch src/scss:${newPath}/css --no-source-map --quiet`;
    pkg.scripts['serve:js'] = `esbuild "src/js/pages/*.js" --bundle --outdir=${newPath}/js/pages --watch`;

    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2), 'utf-8');
    console.log(`(✓) package.json updated → ${newPath}`);
    return true;
}

function updateOutputPath(newPath) {
    const trimmed = newPath.trim().replace(/\\/g, '/');

    let normalizedPath;
    if (trimmed === '.') {
        normalizedPath = 'out';
    } else {
        const projectName = path.basename(process.cwd());
        normalizedPath = trimmed.replace(/\/$/, '') + '/' + projectName + '-out';
    }

    const eleventyContent = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
    const match = eleventyContent.match(/const OUTPUT_DIR\s*=\s*['"`]([^'"`]*)['"`]/);
    const oldPath = match ? match[1] : null;

    if (oldPath) {
        const oldAbsPath = path.resolve(__dirname, '../../', oldPath);
        if (fs.existsSync(oldAbsPath)) {
            fs.rmSync(oldAbsPath, { recursive: true, force: true });
            console.log(`(✓) folder deleted → ${oldAbsPath}`);
        } else {
            console.log(`(i) folder not found, nothing to delete → ${oldAbsPath}`);
        }
    }

    console.log(`\nupdating output path → "${normalizedPath}"...`);

    updatePackageJson(normalizedPath);
    updateEleventyConfig(normalizedPath);
}

function getCurrentOutputPath() {
    try {
        const content = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
        const match = content.match(/const OUTPUT_DIR\s*=\s*['"`]([^'"`]*)['"`]/);
        if (!match) return null;

        const outputDir = match[1];

        if (!path.isAbsolute(outputDir)) {
            return 'project root/out';
        }

        const parent = path.dirname(outputDir);
        const projectName = path.basename(outputDir);

        return `${parent}/${projectName}`;
    } catch {
        return null;
    }
}

module.exports = { updateOutputPath, getCurrentOutputPath };