const fs = require('fs');
const path = require('path');
const { findProjectRoot, NOT_INSIDE_PROJECT_MESSAGE } = require('./modules/constants');

const root = findProjectRoot(process.cwd());
if (!root) {
    console.error(NOT_INSIDE_PROJECT_MESSAGE);
    process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));

if (!pkg.outputDir) {
    console.log('(!) outputDir not found in package.json');
    process.exit(1);
}

const outputDir = path.resolve(root, pkg.outputDir);

if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log(`(✓) cleaned → ${outputDir}`);
} else {
    console.log(`(i) nothing to clean → ${outputDir}`);
}