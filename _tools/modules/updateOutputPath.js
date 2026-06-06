const fs = require('fs');
const path = require('path');

const ELEVENTY_CONFIG = path.resolve(__dirname, '../../.eleventy.js');
const PACKAGE_JSON    = path.resolve(__dirname, '../../package.json');
const TSCONFIG        = path.resolve(__dirname, '../../tsconfig.json');

const OUTPUT_DIR_REGEX = /const OUTPUT_DIR\s*=\s*['"`]([^'"`]*)['"`]/;

// --- Helpers ---

function parseOutputDir(content) {
    const match = content.match(OUTPUT_DIR_REGEX);
    return match ? match[1] : null;
}

function isTypeScriptProject() {
    return fs.existsSync(TSCONFIG);
}

// --- Updaters ---

function updateEleventyConfig(newPath) {
    const content = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');

    const updated = content.replace(
        OUTPUT_DIR_REGEX,
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
    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));

    pkg.outputDir = newPath;

    const usesTs = isTypeScriptProject();

    pkg.scripts['build:css'] = `sass src/frontend/scss:${newPath}/css --no-source-map --style=compressed --quiet`;
    pkg.scripts['serve:css'] = `sass --watch src/frontend/scss:${newPath}/css --no-source-map --quiet`;

    if (usesTs) {
        pkg.scripts['build:js']  = `esbuild "src/frontend/ts/pages/*.ts" --bundle --outdir=${newPath}/js/pages --minify`;
        pkg.scripts['serve:js']  = `esbuild "src/frontend/ts/pages/*.ts" --bundle --outdir=${newPath}/js/pages --watch`;
    } else {
        pkg.scripts['build:js']  = `esbuild "src/frontend/js/pages/*.js" --bundle --outdir=${newPath}/js/pages --minify`;
        pkg.scripts['serve:js']  = `esbuild "src/frontend/js/pages/*.js" --bundle --outdir=${newPath}/js/pages --watch`;
    }

    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2), 'utf-8');
    console.log(`(✓) package.json updated → ${newPath}`);
    return true;
}

const TSCONFIG_OUTDIR_REGEX = /"outDir"\s*:\s*"[^"]*"/;

function updateTsConfig(newPath) {
    if (!isTypeScriptProject()) return;

    const content = fs.readFileSync(TSCONFIG, 'utf-8');
    const updated = content.replace(TSCONFIG_OUTDIR_REGEX, `"outDir": "./${newPath}/ts"`);

    if (content === updated) {
        console.log('(!) outDir not found in tsconfig.json');
        return;
    }

    fs.writeFileSync(TSCONFIG, updated, 'utf-8');
    console.log(`(✓) tsconfig.json updated → ${newPath}/ts`);
}

// --- Public API ---

function updateOutputPath(newPath) {
    const trimmed = newPath.trim().replace(/\\/g, '/');

    const normalizedPath = trimmed === '.'
        ? 'out'
        : `${trimmed.replace(/\/$/, '')}/${path.basename(process.cwd())}-out`;

    const eleventyContent = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
    const oldPath = parseOutputDir(eleventyContent);

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
    updateTsConfig(normalizedPath);
}

function getCurrentOutputPath() {
    try {
        const content = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
        return parseOutputDir(content);
    } catch {
        return null;
    }
}

module.exports = { updateOutputPath, getCurrentOutputPath };