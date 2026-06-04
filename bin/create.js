#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { writeSync } = require('fs');

const targetDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const templateDir = path.join(__dirname, '..');

const COPY_TARGETS = [
    'src',
    'docs',
    '_tools',
    '.eleventy.js',
    '.eleventyignore',
];

const GITIGNORE_CONTENT = `
node_modules/
src/backend/_core/vendor/
out/
src/backend/config.php
`;

const CREATE_DIRS = [
    'src/frontend/_routes',
];

const ALL_FRAMEWORKS = ['bootstrap', 'bulma', 'foundation', 'uikit'];

const FRAMEWORKS = {
    bootstrap: {
        label: 'Bootstrap',
        scss: 'bootstrap',
        njk: [
            '<script src="/js/bootstrap.bundle.min.js" defer></script>',
        ],
        eleventy: [
            '"node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "js/bootstrap.bundle.min.js",',
            '"node_modules/bootstrap-icons/font/fonts": "css/fonts",',
        ],
    },
    bulma: {
        label: 'Bulma',
        scss: 'bulma',
        njk: [],
        eleventy: [],
    },
    foundation: {
        label: 'Foundation',
        scss: 'foundation',
        njk: ['<script src="/js/foundation.min.js" defer></script>'],
        eleventy: ['"node_modules/foundation-sites/dist/js/foundation.min.js": "js/foundation.min.js",'],
    },
    uikit: {
        label: 'UIkit',
        scss: 'uikit',
        njk: [
            '<script src="/js/uikit.min.js" defer></script>',
            '<script src="/js/uikit-icons.min.js" defer></script>',
        ],
        eleventy: [
            '"node_modules/uikit/dist/js/uikit.min.js": "js/uikit.min.js",',
            '"node_modules/uikit/dist/js/uikit-icons.min.js": "js/uikit-icons.min.js",',
        ],
    },
    none: {
        label: 'None',
        scss: null,
        njk: [],
        eleventy: [],
    },
};

const PROJECT_PACKAGE = {
    name: path.basename(targetDir),
    version: '2.0.15',
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
        'github-markdown-css': '^5.9.0',
        'glob': '^13.0.6',
        'uikit': '^3.25.13',
    },
    devDependencies: {
        'concurrently': '^9.2.1',
        'esbuild': '^0.27.3',
        'sass': '^1.77.0',
    },
};

function log(msg) {
    writeSync(1, msg + '\n');
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function slashComment(content, line) {
    content = content.replace(new RegExp(`^([ \\t]*)// (${escapeRegex(line)})$`, 'gm'), '$1$2');
    return content.replace(new RegExp(`^([ \\t]*)(${escapeRegex(line)})$`, 'gm'), '$1// $2');
}

function slashUncomment(content, line) {
    return content.replace(new RegExp(`^([ \\t]*)// (${escapeRegex(line)})$`, 'gm'), '$1$2');
}

function njkComment(content, line) {
    content = content.split(`{# ${line} #}`).join(line);
    return content.split(line).join(`{# ${line} #}`);
}

function njkUncomment(content, line) {
    return content.split(`{# ${line} #}`).join(line);
}

function applyFramework(framework) {
    const config = FRAMEWORKS[framework];

    const globalScssPath = path.join(targetDir, 'src/frontend/scss/modules/_global.scss');
    if (fs.existsSync(globalScssPath)) {
        let content = fs.readFileSync(globalScssPath, 'utf8');
        ALL_FRAMEWORKS.forEach(fw => {
            content = slashComment(content, `@import "../modules/frameworks/${fw}";`);
        });
        if (config.scss) {
            content = slashUncomment(content, `@import "../modules/frameworks/${config.scss}";`);
        }
        fs.writeFileSync(globalScssPath, content);
    }

    const baseNjkPath = path.join(targetDir, 'src/frontend/components/layouts/base.njk');
    if (fs.existsSync(baseNjkPath)) {
        let content = fs.readFileSync(baseNjkPath, 'utf8');
        ALL_FRAMEWORKS.forEach(fw => {
            FRAMEWORKS[fw].njk.forEach(line => {
                content = njkComment(content, line);
            });
        });
        config.njk.forEach(line => {
            content = njkUncomment(content, line);
        });
        fs.writeFileSync(baseNjkPath, content);
    }

    const eleventyPath = path.join(targetDir, '.eleventy.js');
    if (fs.existsSync(eleventyPath)) {
        let content = fs.readFileSync(eleventyPath, 'utf8');
        ALL_FRAMEWORKS.forEach(fw => {
            FRAMEWORKS[fw].eleventy.forEach(line => {
                content = slashComment(content, line);
            });
        });
        config.eleventy.forEach(line => {
            content = slashUncomment(content, line);
        });
        fs.writeFileSync(eleventyPath, content);
    }
}

function askFramework() {
    return new Promise((resolve) => {
        const choices = [
            { label: 'Bootstrap (default)', value: 'bootstrap' },
            { label: 'Bulma', value: 'bulma' },
            { label: 'Foundation', value: 'foundation' },
            { label: 'UIkit', value: 'uikit' },
            { label: 'None', value: 'none' }
        ];
        let selectedIndex = 0;

        log('\n>> Select a CSS framework (Use arrow keys and press Enter):\n');

        const render = (firstTime = false) => {
            if (!firstTime) {
                process.stdout.write(`\x1B[${choices.length}A`);
            }
            let output = '';
            choices.forEach((choice, index) => {
                if (index === selectedIndex) {
                    output += `  \x1b[36m◉ ${choice.label}\x1b[0m\x1B[K\n`;
                } else {
                    output += `  * ${choice.label}\x1B[K\n`;
                }
            });
            process.stdout.write(output);
        };

        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
        process.stdin.resume();

        const onKeyPress = (str, key) => {
            if (key.ctrl && key.name === 'c') {
                process.exit();
            } else if (key.name === 'up') {
                selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : choices.length - 1;
                render();
            } else if (key.name === 'down') {
                selectedIndex = selectedIndex < choices.length - 1 ? selectedIndex + 1 : 0;
                render();
            } else if (key.name === 'return' || key.name === 'enter') {
                process.stdin.removeListener('keypress', onKeyPress);
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(false);
                }
                process.stdin.pause();
                resolve(choices[selectedIndex].value);
            }
        };

        process.stdin.on('keypress', onKeyPress);
        render(true);
    });
}

async function init() {
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

    for (const dir of CREATE_DIRS) {
    const dest = path.join(targetDir, dir);
    fs.mkdirSync(dest, { recursive: true });
    }

    const framework = await askFramework();
    applyFramework(framework);

    log(`\n>> Done! Now run:\n`);
    if (process.argv[2]) {
        log(`cd ${process.argv[2]}`);
    }
    log('npm install');
    log('npm run serve\n');
}

init();