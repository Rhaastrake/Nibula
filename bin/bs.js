#!/usr/bin/env node

const path = require('path');
const https = require('https');
const readline = require('readline');
const { spawnSync } = require('child_process');
const { findProjectRoot } = require('../_tools/modules/constants');

const pkg = require('../package.json');

const [, , cmd, ...rest] = process.argv;

const CREATE = path.join(__dirname, 'create.js');
const ASSISTANT = path.join(__dirname, '..', '_tools', 'assistant.js');

const REGISTRY = 'https://registry.npmjs.org/berna-stencil/latest';
const CHECK_TIMEOUT = 2500;

function run(script, args) {
    const res = spawnSync('node', [script, ...args], {
        stdio: 'inherit',
        cwd: process.cwd(),
    });
    process.exit(res.status ?? 0);
}

function runNpm(scriptName) {
    const root = findProjectRoot(process.cwd());
    if (!root) {
        console.error('Not inside a Berna-Stencil project (no .eleventy.js found).');
        process.exit(1);
    }
    const res = spawnSync('npm', ['run', scriptName], {
        stdio: 'inherit',
        cwd: root,
        shell: process.platform === 'win32',
    });
    process.exit(res.status ?? 0);
}

function fetchLatest() {
    return new Promise((resolve) => {
        const req = https.get(REGISTRY, (res) => {
            if (res.statusCode !== 200) {
                res.resume();
                resolve(null);
                return;
            }
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data).version ?? null);
                } catch {
                    resolve(null);
                }
            });
        });
        req.on('error', () => resolve(null));
        req.setTimeout(CHECK_TIMEOUT, () => {
            req.destroy();
            resolve(null);
        });
    });
}

function isOlder(current, latest) {
    const parse = (v) => String(v).split('-')[0].split('.').map(Number);
    const a = parse(current);
    const b = parse(latest);
    for (let i = 0; i < 3; i++) {
        const na = a[i] || 0;
        const nb = b[i] || 0;
        if (na < nb) return true;
        if (na > nb) return false;
    }
    return false;
}

async function checkVersion() {
    const latest = await fetchLatest();
    return {
        current: pkg.version,
        latest,
        behind: latest !== null && isOlder(pkg.version, latest),
    };
}

function ask(question) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase());
        });
    });
}

function updateGlobal() {
    const res = spawnSync('npm', ['install', '-g', 'berna-stencil@latest'], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
    return res.status ?? 0;
}

function usage() {
    console.log(`
berna-stencil (bs)

Usage:
  bs new <project-name>   Scaffold a new project
  bs cli                  Open the page-management assistant
  bs run                  Start the dev server (npm run serve)
  bs build                Build the site (npm run build)
  bs update               Update the CLI to the latest version
  bs ver                  Show the installed and latest version
  bs help                 Show this message
`);
}

async function main() {
    switch (cmd) {
        case 'new': {
            if (!rest[0]) {
                console.error('Missing project name. Usage: bs new <project-name>');
                process.exit(1);
            }
            const info = await checkVersion();
            if (info.behind) {
                console.log(`\nA newer version of berna-stencil is available: ${info.current} → ${info.latest}`);
                if (process.stdin.isTTY) {
                    const answer = await ask('Update before creating the project? [Y/n] ');
                    if (answer === '' || answer === 'y' || answer === 'yes') {
                        const code = updateGlobal();
                        if (code === 0) {
                            console.log(`\nUpdated. Re-run "bs new ${rest[0]}" to scaffold with the latest version.`);
                        }
                        process.exit(code);
                    }
                } else {
                    console.log('Run "bs update" to update.\n');
                }
            }
            run(CREATE, [rest[0]]);
            break;
        }
        case 'cli':
            run(ASSISTANT, []);
            break;
        case 'run':
            runNpm('serve');
            break;
        case 'build':
            runNpm('build');
            break;
        case 'update':
            process.exit(updateGlobal());
            break;
        case 'ver':
        case 'version':
        case '--version':
        case '-v': {
            const info = await checkVersion();
            console.log(`berna-stencil ${info.current} (installed)`);
            if (info.latest === null) {
                console.log('Could not reach the npm registry to check for updates.');
            } else if (info.behind) {
                console.log(`Latest: ${info.latest} — run "bs update" to update.`);
            } else {
                console.log('You are on the latest version.');
            }
            break;
        }
        case undefined:
        case 'help':
        case '--help':
        case '-h': {
            usage();
            const info = await checkVersion();
            if (info.behind) {
                console.log(`A newer version is available: ${info.current} → ${info.latest}. Run "bs update".`);
            }
            break;
        }
        default:
            console.error(`Unknown command: ${cmd}`);
            usage();
            process.exit(1);
    }
}

main();