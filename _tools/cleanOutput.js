const fs = require('fs');
const path = require('path');

const ELEVENTY_CONFIG = path.resolve(__dirname, '../.eleventy.js');

const content = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
const match = content.match(/const OUTPUT_DIR\s*=\s*['"`]([^'"`]*)['"`]/);

if (!match) {
    console.log('(!) OUTPUT_DIR not found in .eleventy.js');
    process.exit(1);
}

const outputDir = match[1];
const absPath = path.isAbsolute(outputDir)
    ? outputDir
    : path.resolve(__dirname, '..', outputDir);

if (fs.existsSync(absPath)) {
    fs.rmSync(absPath, { recursive: true, force: true });
    console.log(`(✓) cleaned → ${absPath}`);
} else {
    console.log(`(i) nothing to clean → ${absPath}`);
}