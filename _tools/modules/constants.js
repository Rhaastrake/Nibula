const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FRONTEND_DIR = path.join(ROOT, 'src', 'frontend');

const MAX_PAGE_NAME_LENGTH = 50;
const PROTECTED_PAGES = Object.freeze(['homepage', '404']);

const PATHS = Object.freeze({
    root:           ROOT,
    routes:         path.join(FRONTEND_DIR, '_routes'),
    scssPages:      path.join(FRONTEND_DIR, 'scss', 'pages'),
    jsPages:        path.join(FRONTEND_DIR, 'js', 'pages'),
    tsPages:        path.join(FRONTEND_DIR, 'ts', 'pages'),
    siteData:       path.join(FRONTEND_DIR, 'data', 'site.json'),
    pageComponents: path.join(FRONTEND_DIR, 'layouts', 'pageComponents.njk'),
    templates:      path.join(ROOT, '_tools', 'res', 'templates'),
    eleventyConfig: path.join(ROOT, '.eleventy.js'),
    packageJson:    path.join(ROOT, 'package.json'),
    tsconfig:       path.join(ROOT, 'tsconfig.json'),
});

module.exports = { PATHS, MAX_PAGE_NAME_LENGTH, PROTECTED_PAGES };