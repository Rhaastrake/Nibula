const fs = require('fs');
const path = require('path');

const PACKAGE_JSON = path.resolve(__dirname, '../package.json');

const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf-8'));

if (!pkg.outputDir) {
    console.log('(!) outputDir not found in package.json');
    process.exit(1);
}

const outputDir = path.resolve(__dirname, '..', pkg.outputDir);

if (fs.existsSync(outputDir)) {
    fs.rmSync(outputDir, { recursive: true, force: true });
    console.log(`(✓) cleaned → ${outputDir}`);
} else {
    console.log(`(i) nothing to clean → ${outputDir}`);
}
