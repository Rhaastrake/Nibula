const fs = require('fs');
const path = require('path');

const ELEVENTY_CONFIG = path.resolve(__dirname, '../../.eleventy.js');
const PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

// Regex to locate the OUTPUT_DIR declaration in .eleventy.js.
// Extracted as a constant to avoid writing it by hand in multiple places.
const OUTPUT_DIR_REGEX = /const OUTPUT_DIR\s*=\s*['"`]([^'"`]*)['"`]/;

// --- Helpers ---

// Reads OUTPUT_DIR value from a given file content string, or returns null
function parseOutputDir(content) {
    const match = content.match(OUTPUT_DIR_REGEX);
    return match ? match[1] : null;
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

    // Reconstruct all output-dependent scripts from scratch to avoid
    // partial string replacement bugs on the outdir flag
    pkg.scripts['build:css'] = `sass src/frontend/scss:${newPath}/css --no-source-map --style=compressed --quiet`;
    pkg.scripts['build:js']  = `esbuild "src/frontend/js/pages/*.js" --bundle --outdir=${newPath}/js/pages --minify`;
    pkg.scripts['serve:css'] = `sass --watch src/frontend/scss:${newPath}/css --no-source-map --quiet`;
    pkg.scripts['serve:js']  = `esbuild "src/frontend/js/pages/*.js" --bundle --outdir=${newPath}/js/pages --watch`;

    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2), 'utf-8');
    console.log(`(✓) package.json updated → ${newPath}`);
    return true;
}

// --- Public API ---

function updateOutputPath(newPath) {
    const trimmed = newPath.trim().replace(/\\/g, '/');

    // Normalize the path: bare "." becomes "out", everything else gets a
    // project-scoped suffix to avoid collisions
    const normalizedPath = trimmed === '.'
        ? 'out'
        : `${trimmed.replace(/\/$/, '')}/${path.basename(process.cwd())}-out`;

    // Read the config once and reuse it to get the old path —
    // avoids a second disk read inside updateEleventyConfig
    const eleventyContent = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
    const oldPath = parseOutputDir(eleventyContent);

    // Delete the old output folder if it exists
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

// Returns the current OUTPUT_DIR value from .eleventy.js, or null on failure
function getCurrentOutputPath() {
    try {
        const content = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
        return parseOutputDir(content);
    } catch {
        return null;
    }
}

module.exports = { updateOutputPath, getCurrentOutputPath };