const esbuild = require('esbuild');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const { findProjectRoot, NOT_INSIDE_PROJECT_MESSAGE } = require('./modules/constants');

const root = findProjectRoot(process.cwd());
if (!root) {
    console.error(NOT_INSIDE_PROJECT_MESSAGE);
    process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
const outputDir = pkg.outputDir || 'out';
const isWatch = process.argv.includes('--watch');

const posix = (p) => p.split(path.sep).join('/');
const jsFiles = glob.sync(posix(path.join(root, 'src/frontend/js/pages/*.js')));
const tsFiles = glob.sync(posix(path.join(root, 'src/frontend/ts/pages/*.ts')));
const entryPoints = [...jsFiles, ...tsFiles];

if (entryPoints.length === 0) {
    process.exit(0);
}

const options = {
    entryPoints,
    bundle: true,
    outdir: path.join(root, outputDir, 'js/pages'),
    minify: !isWatch,
};

if (isWatch) {
    esbuild.context(options).then((ctx) => ctx.watch()).catch(() => process.exit(1));
} else {
    esbuild.build(options).catch(() => process.exit(1));
}