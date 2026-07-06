#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { writeSync } = require('fs');
const { spawnSync } = require('child_process');
const { color } = require('../_tools/modules/constants');

// ── PATHS ────────────────────────────────────────────────────────────────────

const targetDir  = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const templateDir = path.join(__dirname, '..');
const SELF_VERSION = require('../package.json').version;

// ── ENUMS ────────────────────────────────────────────────────────────────────

const LANGUAGE = Object.freeze({
    JAVASCRIPT: 'javascript',
    TYPESCRIPT: 'typescript',
});

const FRAMEWORK = Object.freeze({
    BOOTSTRAP:  'bootstrap',
    BULMA:      'bulma',
    FOUNDATION: 'foundation',
    UIKIT:      'uikit',
    NONE:       'none',
});

// ── CHOICES ──────────────────────────────────────────────────────────────────

const LANGUAGE_CHOICES = [
    { label: 'JavaScript (default)', value: LANGUAGE.JAVASCRIPT },
    { label: 'TypeScript',           value: LANGUAGE.TYPESCRIPT },
];

const FRAMEWORK_CHOICES = [
    { label: 'Bootstrap (default)', value: FRAMEWORK.BOOTSTRAP  },
    { label: 'Bulma',               value: FRAMEWORK.BULMA      },
    { label: 'Foundation',          value: FRAMEWORK.FOUNDATION },
    { label: 'UIkit',               value: FRAMEWORK.UIKIT      },
    { label: 'None',                value: FRAMEWORK.NONE       },
];

// ── COPY CONFIG ───────────────────────────────────────────────────────────────

const MANDATORY_COPY = [
    'docs',
    '.eleventy.js',
    '.eleventyignore',
    'nginx.conf',
    'src/backend',
    'src/frontend',
];

const FRONTEND_EXCLUDE = {
    [LANGUAGE.JAVASCRIPT]: ['ts'],
    [LANGUAGE.TYPESCRIPT]: ['js'],
};

const CREATE_DIRS = [
    'src/frontend/_routes',
];

// ── FRAMEWORK CONFIG ──────────────────────────────────────────────────────────

const ALL_FRAMEWORKS = Object.values(FRAMEWORK).filter(f => f !== FRAMEWORK.NONE);

const FRAMEWORKS = {
    [FRAMEWORK.BOOTSTRAP]: {
        scss:     'bootstrap',
        njk:      ['<script src="/js/bootstrap.bundle.min.js" defer></script>'],
        eleventy: [
            '"node_modules/bootstrap/dist/js/bootstrap.bundle.min.js": "js/bootstrap.bundle.min.js",',
            '"node_modules/bootstrap-icons/font/fonts": "css/fonts",',
        ],
    },
    [FRAMEWORK.BULMA]: {
        scss:     'bulma',
        njk:      [],
        eleventy: [],
    },
    [FRAMEWORK.FOUNDATION]: {
        scss:     'foundation',
        njk:      ['<script src="/js/foundation.min.js" defer></script>'],
        eleventy: ['"node_modules/foundation-sites/dist/js/foundation.min.js": "js/foundation.min.js",'],
    },
    [FRAMEWORK.UIKIT]: {
        scss:     'uikit',
        njk:      [
            '<script src="/js/uikit.min.js" defer></script>',
            '<script src="/js/uikit-icons.min.js" defer></script>',
        ],
        eleventy: [
            '"node_modules/uikit/dist/js/uikit.min.js": "js/uikit.min.js",',
            '"node_modules/uikit/dist/js/uikit-icons.min.js": "js/uikit-icons.min.js",',
        ],
    },
    [FRAMEWORK.NONE]: {
        scss:     null,
        njk:      [],
        eleventy: [],
    },
};

// ── LANGUAGE CONFIG ───────────────────────────────────────────────────────────

const LANGUAGE_ELEVENTY = Object.freeze({
    jsEntry: 'const entryPoints = glob.sync("src/frontend/js/pages/*.js");',
    tsEntry: 'const entryPoints = glob.sync("src/frontend/ts/pages/*.ts");',
});

// ── GENERATED FILE CONTENTS ───────────────────────────────────────────────────

const GITIGNORE_CONTENT = `
node_modules/
src/backend/_core/vendor/
out/
src/backend/config.php
`;


const PROJECT_PACKAGE = {
    name:      path.basename(targetDir),
    version:   '2.6.0',
    private:   true,
    outputDir: 'out',
    "scripts": {
        "build:css": "sass src/frontend/scss:out/css --no-source-map --style=compressed --quiet --load-path=node_modules",
        "build:js": "bs build-js",
        "build:11ty": "eleventy",
        "build": "npm run clean && npm run build:css && npm run build:js && npm run build:11ty",
        "serve:css": "sass --watch src/frontend/scss:out/css --no-source-map --quiet --load-path=node_modules",
        "serve:js": "bs build-js --watch",
        "serve:11ty": "eleventy --serve --quiet",
        "clean": "bs clean",
        "serve": "npm run clean && concurrently \"npm run serve:11ty\" \"npm run serve:css\" \"npm run serve:js\"",
        "assistant": "bs cli"
    },
    dependencies: {
        '@11ty/eleventy':     '^3.1.2',
        '@11ty/eleventy-img': '^6.0.4',
        'bootstrap':          '^5.3.8',
        'bootstrap-icons':    '^1.13.1',
        'bulma':              '^1.0.4',
        'foundation-sites':   '^6.9.0',
        'github-markdown-css': '^5.9.0',
        'glob':               '^13.0.6',
        'uikit':              '^3.25.13',
    },
    devDependencies: {
        'berna-stencil': `^${SELF_VERSION}`,
        'concurrently':  '^9.2.1',
        'esbuild':       '^0.27.3',
        'sass':          '^1.77.0',
    },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────

function log(msg) {
    writeSync(1, msg + '\n');
}

function logAdd(name) {
    log(`${color.green}+${color.reset} ${name}`);
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function copyRecursive(src, dest, exclude = []) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const child of fs.readdirSync(src)) {
            if (child === '.git') continue;
            if (exclude.includes(child)) continue;
            copyRecursive(path.join(src, child), path.join(dest, child), exclude);
        }
    } else {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
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

function installDependencies() {
    const backendCore = path.join(targetDir, 'src', 'backend', '_core');

    log(`${color.blue}\n>> Installing Node modules...${color.reset}`);
    const npm = spawnSync('npm', ['install'], {
        cwd: targetDir,
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });

    if (npm.status !== 0) {
        log('\n(!) npm install failed. Finish manually:');
        if (process.argv[2]) log(`      cd ${process.argv[2]}`);
        log('      npm install\n');
        return false;
    }

    if (!fs.existsSync(path.join(backendCore, 'composer.json'))) {
        return true;
    }

    const probe = spawnSync('composer', ['--version'], {
        stdio: 'ignore',
        shell: process.platform === 'win32',
    });

    if (probe.status !== 0) {
        log('\n(!) Composer not found — skipping backend dependencies.');
        log('    Install Composer, then run: cd src/backend/_core && composer install\n');
        return true;
    }

    log(`\n${color.blue}>> Installing Composer modules...${color.reset}\n`);
    spawnSync('composer', ['install', '--quiet', '--no-interaction'], {
        cwd: backendCore,
        stdio: 'ignore',
        shell: process.platform === 'win32',
    });

    return true;
}

// ── APPLY ─────────────────────────────────────────────────────────────────────

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

    const baseNjkPath = path.join(targetDir, 'src/frontend/layouts/base.njk');
    if (fs.existsSync(baseNjkPath)) {
        let content = fs.readFileSync(baseNjkPath, 'utf8');
        ALL_FRAMEWORKS.forEach(fw => {
            FRAMEWORKS[fw].njk.forEach(line => { content = njkComment(content, line); });
        });
        config.njk.forEach(line => { content = njkUncomment(content, line); });
        fs.writeFileSync(baseNjkPath, content);
    }

    const eleventyPath = path.join(targetDir, '.eleventy.js');
    if (fs.existsSync(eleventyPath)) {
        let content = fs.readFileSync(eleventyPath, 'utf8');
        ALL_FRAMEWORKS.forEach(fw => {
            FRAMEWORKS[fw].eleventy.forEach(line => { content = slashComment(content, line); });
        });
        config.eleventy.forEach(line => { content = slashUncomment(content, line); });
        fs.writeFileSync(eleventyPath, content);
    }
}

function applyLanguage(language) {
    const eleventyPath = path.join(targetDir, '.eleventy.js');
    if (!fs.existsSync(eleventyPath)) return;

    let content = fs.readFileSync(eleventyPath, 'utf8');

    if (language === LANGUAGE.TYPESCRIPT) {
        content = slashComment(content,   LANGUAGE_ELEVENTY.jsEntry);
        content = slashUncomment(content, LANGUAGE_ELEVENTY.tsEntry);
    } else {
        content = slashUncomment(content, LANGUAGE_ELEVENTY.jsEntry);
        content = slashComment(content,   LANGUAGE_ELEVENTY.tsEntry);
    }

    fs.writeFileSync(eleventyPath, content);
}

// ── UI ────────────────────────────────────────────────────────────────────────

function askChoice(question, choices) {
    return new Promise((resolve) => {
        let selectedIndex = 0;

        log(`\n>> ${question} (Use arrow keys and press Enter):\n`);

        const render = (firstTime = false) => {
            if (!firstTime) process.stdout.write(`\x1B[${choices.length}A`);
            const output = choices.map((choice, index) =>
                index === selectedIndex
                    ? `  \x1b[36m◉ ${choice.label}\x1b[0m\x1B[K\n`
                    : `  * ${choice.label}\x1B[K\n`
            ).join('');
            process.stdout.write(output);
        };

        readline.emitKeypressEvents(process.stdin);
        if (process.stdin.isTTY) process.stdin.setRawMode(true);
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
                if (process.stdin.isTTY) process.stdin.setRawMode(false);
                process.stdin.pause();
                resolve(choices[selectedIndex].value);
            }
        };

        process.stdin.on('keypress', onKeyPress);
        render(true);
    });
}

// ── INIT ──────────────────────────────────────────────────────────────────────

async function init() {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    log(`\n>> ${color.magenta}Creating berna-stencil project in ${targetDir}\n${color.reset}`);

    const language  = await askChoice('Select a language',      LANGUAGE_CHOICES);
    const framework = await askChoice('Select a CSS framework', FRAMEWORK_CHOICES);

    log('');

    for (const target of MANDATORY_COPY) {
        const src  = path.join(templateDir, target);
        const dest = path.join(targetDir, target);
        if (!fs.existsSync(src)) continue;
        const exclude = target === 'src/frontend' ? FRONTEND_EXCLUDE[language] : [];
        copyRecursive(src, dest, exclude);
        logAdd(target);
    }

    const configDest    = path.join(targetDir, 'src/backend/config.php');
    const configExample = path.join(targetDir, 'src/backend/example.config.php');
    if (!fs.existsSync(configDest) && fs.existsSync(configExample)) {
        fs.copyFileSync(configExample, configDest);
        logAdd('src/backend/config.php');
    }

    const pkg = { ...PROJECT_PACKAGE };

    if (language === LANGUAGE.TYPESCRIPT) {
        const tsSrc  = path.join(templateDir, 'tsconfig.json');
        const tsDest = path.join(targetDir, 'tsconfig.json');
        fs.copyFileSync(tsSrc, tsDest);
        logAdd('tsconfig.json');
        pkg.devDependencies = { ...pkg.devDependencies, typescript: 'latest' };
    }

    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify(pkg, null, 2));
    logAdd('package.json');

    fs.writeFileSync(path.join(targetDir, '.gitignore'), GITIGNORE_CONTENT);
    logAdd('.gitignore');

    for (const dir of CREATE_DIRS) {
        fs.mkdirSync(path.join(targetDir, dir), { recursive: true });
    }

    applyFramework(framework);
    applyLanguage(language);

    installDependencies();

    log(`\n${color.green}>> Done!${color.reset}`);
    log(`${color.yellow}\nNow run:\n${color.reset}`);
    if (process.argv[2]) log(`  ${color.yellow}cd ${process.argv[2]}${color.reset}`);
    log(`  ${color.yellow}bs run${color.reset}`);
    log('');
}

init();