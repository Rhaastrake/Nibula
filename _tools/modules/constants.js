const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
const TEMPLATES_DIR = path.join(PACKAGE_ROOT, '_tools', 'res', 'templates');

const PROJECT_MARKER = '.eleventy.js';

const PROTECTED_PAGES = Object.freeze(['homepage', '404']);

function findProjectRoot(start) {
    let dir = path.resolve(start ?? process.cwd());
    while (true) {
        if (fs.existsSync(path.join(dir, PROJECT_MARKER))) return dir;
        const parent = path.dirname(dir);
        if (parent === dir) return null;
        dir = parent;
    }
}

let cachedRoot = null;

function projectRoot() {
    if (cachedRoot) return cachedRoot;
    const root = findProjectRoot();
    if (!root) {
        console.error(`Not inside a Berna-Stencil project (no ${PROJECT_MARKER} found up from ${process.cwd()}).`);
        process.exit(1);
    }
    cachedRoot = root;
    return root;
}

function frontendDir() {
    return path.join(projectRoot(), 'src', 'frontend');
}

const PATHS = Object.freeze({
    get root()           { return projectRoot(); },
    get routes()         { return path.join(frontendDir(), '_routes'); },
    get scssPages()      { return path.join(frontendDir(), 'scss', 'pages'); },
    get jsPages()        { return path.join(frontendDir(), 'js', 'pages'); },
    get tsPages()        { return path.join(frontendDir(), 'ts', 'pages'); },
    get siteData()       { return path.join(frontendDir(), 'data', 'site.json'); },
    get pageComponents() { return path.join(frontendDir(), 'layouts', 'pageComponents.njk'); },
    get eleventyConfig() { return path.join(projectRoot(), '.eleventy.js'); },
    get packageJson()    { return path.join(projectRoot(), 'package.json'); },
    get tsconfig()       { return path.join(projectRoot(), 'tsconfig.json'); },
    templates:           TEMPLATES_DIR,
});

module.exports = { PATHS, PROTECTED_PAGES, findProjectRoot };