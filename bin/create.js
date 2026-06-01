#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const templateDir = path.join(__dirname, '..');

const COPY_TARGETS = [
    'src',
    '_tools',
    '.eleventy.js',
    '.eleventyignore',
];

const PROJECT_PACKAGE = {
    name: path.basename(targetDir),
    version: '2.0.4',
    private: true,
    scripts: {
        "build:css": "sass src/frontend/scss:out/css --no-source-map --style=compressed --quiet --load-path=node_modules",
        "build:js": "esbuild \"src/frontend/js/pages/*.js\" --bundle --outdir=out/js/pages --minify",
        "build:11ty": "eleventy",
        "build": "npm run clean && npm run build:css && npm run build:js && npm run build:11ty",
        "serve:css": "sass --watch src/frontend/scss:out/css --no-source-map --quiet --load-path=node_modules",
        "serve:js": "esbuild \"src/frontend/js/pages/*.js\" --bundle --outdir=out/js/pages --watch",
        "serve:11ty": "eleventy --serve --quiet",
        "clean": "node _tools/cleanOutput.js",
        "serve": "npm run clean && concurrently \"npm run serve:11ty\" \"npm run serve:css\" \"npm run serve:js\"",
        "assistant": "node _tools/assistant.js",
        "postinstall": "cd src/backend/_core && composer install --quiet"
    },
    dependencies: {
        '@11ty/eleventy': '^3.1.2',
        '@11ty/eleventy-img': '^6.0.4',
        'bootstrap': '^5.3.8',
        'bootstrap-icons': '^1.13.1',
        'bulma': '^1.0.4',
        'foundation-sites': '^6.9.0',
        'glob': '^13.0.6',
        'uikit': '^3.25.13',
    },
    devDependencies: {
        'concurrently': '^9.2.1',
        'esbuild': '^0.27.3',
        'sass': '^1.77.0',
    },
};

const GITIGNORE_CONTENT = `
node_modules/
src/backend/_core/vendor/
out/
src/backend/config.php
`;

const { writeSync } = require('fs');

function log(msg) {
    writeSync(1, msg + '\n');
}

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const child of fs.readdirSync(src)) {
            if (child === '.git') continue;
            copyRecursive(path.join(src, child), path.join(dest, child));
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

function deleteFileRecursive(dir, filename) {
    for (const child of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, child);
        if (fs.statSync(fullPath).isDirectory()) {
            deleteFileRecursive(fullPath, filename);
        } else if (child === filename) {
            fs.unlinkSync(fullPath);
        }
    }
}

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

log(`\n>> Creating berna-stencil project in ${targetDir}\n`);

for (const target of COPY_TARGETS) {
    const src = path.join(templateDir, target);
    const dest = path.join(targetDir, target);
    if (fs.existsSync(src)) {
        copyRecursive(src, dest);
        log(`+ ${target}`);
    }
}

// config.php
const configDest = path.join(targetDir, 'src/backend/config.php');
const configExample = path.join(targetDir, 'src/backend/config.example.php');
if (!fs.existsSync(configDest) && fs.existsSync(configExample)) {
    fs.copyFileSync(configExample, configDest);
    log('+ src/backend/config.php');
}
deleteFileRecursive(targetDir, 'config.example.php');

fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    JSON.stringify(PROJECT_PACKAGE, null, 2)
);
log('+ package.json');

fs.writeFileSync(
    path.join(targetDir, '.gitignore'),
    GITIGNORE_CONTENT
);
log('+ .gitignore');

log(`\n>> Done! Now run:\n`);
if (process.argv[2]) {
    log(`cd ${process.argv[2]}`);
}
log('npm install');
log('npm run serve\n');