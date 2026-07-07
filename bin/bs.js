#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');
const { spawnSync } = require('child_process');
const { findProjectRoot, color, NOT_INSIDE_PROJECT_MESSAGE } = require('../_tools/modules/constants');

const pkg = require('../package.json');

const [, , cmd, ...rest] = process.argv;

const CREATE = path.join(__dirname, 'create.js');
const ASSISTANT = path.join(__dirname, '..', '_tools', 'assistant.js');
const BUILDJS   = path.join(__dirname, '..', '_tools', 'buildJs.js');
const CLEAN     = path.join(__dirname, '..', '_tools', 'cleanOutput.js');

const REGISTRY = 'https://registry.npmjs.org/berna-stencil/latest';
const CHECK_TIMEOUT = 2500;

function run(script, args) {
    const res = spawnSync('node', [script, ...args], {
        stdio: 'inherit',
        cwd: process.cwd(),
    });
    process.exit(res.status ?? 0);
}

function requireProjectRoot() {
    const root = findProjectRoot(process.cwd());
    if (!root) {
        console.error(NOT_INSIDE_PROJECT_MESSAGE);
        process.exit(1);
    }
    return root;
}

function maybeDelegateToLocal(root) {
    const local = path.join(root, 'node_modules', 'berna-stencil', 'bin', 'bs.js');
    if (!fs.existsSync(local)) return;

    // Compare REAL paths so symlinks (e.g. from `npm link`) resolve to the same
    // physical file; otherwise the guard would loop forever under npm link.
    let localReal;
    let selfReal;
    try { localReal = fs.realpathSync(local); } catch { return; }
    try { selfReal = fs.realpathSync(__filename); } catch { selfReal = __filename; }

    if (localReal !== selfReal) {
        const res = spawnSync('node', [localReal, ...process.argv.slice(2)], {
            stdio: 'inherit',
            cwd: process.cwd(),
        });
        process.exit(res.status ?? 0);
    }
}

function enterProject() {
    const root = requireProjectRoot();
    maybeDelegateToLocal(root);
    return root;
}

function runNpm(root, scriptName) {
    const res = spawnSync('npm', ['run', scriptName], {
        stdio: 'inherit',
        cwd: root,
        shell: process.platform === 'win32',
    });
    if (res.error) console.error(res.error.message);
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

function updateGlobal(version) {
    const target = version ? `berna-stencil@${version}` : 'berna-stencil@latest';
    const res = spawnSync('npm', ['install', '-g', target, '--prefer-online'], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
    return res.status ?? 0;
}

function findExistingProject(baseDir, projectName) {
    let entries;
    try {
        entries = fs.readdirSync(baseDir, { withFileTypes: true });
    } catch {
        return null;
    }
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const pkgPath = path.join(baseDir, entry.name, 'package.json');
        if (!fs.existsSync(pkgPath)) continue;
        try {
            const data = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
            if (data && data.name === projectName) {
                return path.join(baseDir, entry.name);
            }
        } catch {
            // package.json non valido → ignoro
        }
    }
    return null;
}

function usage(currentVersion) {
    console.log(`
${color.bold}${color.cyan}Berna-Stencil (${currentVersion})${color.reset} ${color.bold}by Michele Garofalo${color.reset}

${color.yellow}bs new <project-name>${color.reset}   Create your new project
${color.yellow}bs cli${color.reset}                  Open the page-management assistant
${color.yellow}bs run${color.reset}                  Start the dev server and builds out folder runtime
${color.yellow}bs build${color.reset}                Build the site out folder to publish
${color.yellow}bs clean${color.reset}                Remove the output directory
${color.yellow}bs update${color.reset}               Update to the latest version
`);
}

async function main() {
    const info = await checkVersion();
    switch (cmd) {
        case 'new': {
            if (!rest[0]) {
                console.error('Missing project name. Usage: bs new <project-name>');
                process.exit(1);
            }
            if (info.behind) {
                console.log(`\nA newer version of berna-stencil is available: ${info.current} → ${info.latest}`);
                if (process.stdin.isTTY) {
                    const answer = await ask('Update before creating the project? [Y/n] ');
                    if (answer === '' || answer === 'y' || answer === 'yes') {
                        const code = updateGlobal(info.latest);
                        if (code === 0) {
                            console.log(`\nUpdated. Re-run "bs new ${rest[0]}" to scaffold with the latest version.`);
                        }
                        process.exit(code);
                    }
                } else {
                    console.log('Run "bs update" to update.\n');
                }
            }

            // Controllo progetto già esistente con lo stesso "name" nel package.json
            const existing = findExistingProject(process.cwd(), rest[0]);
            if (existing) {
                console.log(`\n${color.yellow}A project named "${rest[0]}" already exists:${color.reset} ${existing}`);
                let overwrite = false;
                if (process.stdin.isTTY) {
                    const answer = await ask('Do you want to overwrite it? [y/N] ');
                    overwrite = (answer === 'y' || answer === 'yes');
                } else {
                    console.log('Run in a TTY to confirm overwrite.');
                }
                if (!overwrite) {
                    console.log('Stopped creating the new project');
                    process.exit(0);
                }
                // Sovrascrittura: cancello completamente la cartella preesistente
                try {
                    fs.rmSync(existing, { recursive: true, force: true });
                    console.log(`${color.green}Removed existing project.${color.reset}`);
                } catch (err) {
                    console.error(`${color.red}Failed to remove existing project:${color.reset} ${err.message}`);
                    process.exit(1);
                }
            }

            run(CREATE, [rest[0]]);
            break;
        }
        case 'cli': {
            enterProject();
            run(ASSISTANT, []);
            break;
        }
        case 'run': {
            const root = enterProject();
            runNpm(root, 'serve');
            break;
        }
        case 'build': {
            const root = enterProject();
            runNpm(root, 'build');
            break;
        }
        case 'build-js': {
            enterProject();
            run(BUILDJS, rest);
            break;
        }
        case 'clean': {
            enterProject();
            run(CLEAN, []);
            break;
        }
        case 'update': {
            if (info.latest !== null && !info.behind) {
                console.log(`Already on the latest version (${info.current}).`);
                process.exit(0);
            }
            process.exit(updateGlobal(info.latest));
        }
        case undefined:
        case 'help':
        case '-help':
        case '--help':
        case 'h':
        case '-h': {
            usage(info.current);
            if (info.behind) {
                console.log(`A newer version is available: ${info.current} → ${info.latest}. Run "bs update".`);
            }
            break;
        }
        default:
            console.error(`${color.red}\nUnknown command:${color.reset} ${cmd}`);
            usage(info.current);
            process.exit(1);
    }
}

main();