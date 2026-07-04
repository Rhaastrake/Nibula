#!/usr/bin/env node

const path = require('path');
const { spawnSync } = require('child_process');
const { findProjectRoot } = require('../_tools/modules/constants');

const [, , cmd, ...rest] = process.argv;

const CREATE = path.join(__dirname, 'create.js');
const ASSISTANT = path.join(__dirname, '..', '_tools', 'assistant.js');

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

function usage() {
    console.log(`
\x1b[35m Berna-Stencil (bs) by Michele Garofalo

Usage:
  bs new <project-name>   Scaffold a new project
  bs cli                  Open the page-management assistant
  bs run                  Start the dev server (npm run serve)
  bs build                Build the site (npm run build)
  bs help                 Show this message
`);
}

switch (cmd) {
    case 'new':
        if (!rest[0]) {
            console.error('Missing project name. Usage: bs new <project-name>');
            process.exit(1);
        }
        run(CREATE, [rest[0]]);
        break;
    case 'cli':
        run(ASSISTANT, []);
        break;
    case 'run':
        runNpm('serve');
        break;
    case 'build':
        runNpm('build');
        break;
    case undefined:
    case 'help':
    case '--help':
    case '-h':
        usage();
        break;
    default:
        console.error(`Unknown command: ${cmd}`);
        usage();
        process.exit(1);
}