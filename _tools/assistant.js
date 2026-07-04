const readline = require('readline');

const { addPage, removePage, renamePage, pageExists } = require('./modules/updatePage');
const { updateOutputPath, getCurrentOutputPath } = require('./modules/updateOutputPath');
const { validatePageName, validateOutputPath } = require('./modules/validation');
const { toKebabCase } = require('./modules/utils');

const color = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    red:     '\x1b[31m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    magenta: '\x1b[35m',
    cyan:    '\x1b[36m',
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
});

function sanitizeInput(value) {
    return (value ?? '').replace(/[\x00-\x1F\x7F]/g, '').trim();
}

function ask(prompt) {
    return new Promise((resolve) => {
        const onClose = () => resolve(null);
        rl.once('close', onClose);
        rl.question(prompt, (answer) => {
            rl.off('close', onClose);
            resolve(sanitizeInput(answer));
        });
    });
}

async function confirm(prompt) {
    const answer = await ask(`${prompt} ${color.dim}[y/N]${color.reset} `);
    return /^y(es)?$/i.test((answer ?? '').trim());
}

async function askPageName(prompt) {
    const raw = await ask(prompt);
    if (raw === null) return null;

    const name = toKebabCase(raw);
    const error = validatePageName(name);
    if (error) {
        console.log(`\n${color.red}✖ ${error}${color.reset}`);
        return null;
    }
    return name;
}

async function handleCreate() {
    const name = await askPageName(`\n${color.green}❯${color.reset} Name of the new page: `);
    if (name) addPage(name);
}

async function handleRemove() {
    const name = await askPageName(`\n${color.red}❯${color.reset} Name of the page to remove: `);
    if (!name) return;

    if (!pageExists(name)) {
        console.log(`\n${color.yellow}⚠ Page "${name}" does not exist.${color.reset}`);
        return;
    }

    const confirmed = await confirm(`This permanently deletes all files for "${name}".`);
    if (!confirmed) {
        console.log(`\n${color.dim}Cancelled.${color.reset}`);
        return;
    }
    removePage(name);
}

async function handleRename() {
    const oldName = await askPageName(`\n${color.yellow}❯${color.reset} Page to rename: `);
    if (!oldName) return;

    const newName = await askPageName(`${color.yellow}❯${color.reset} New name: `);
    if (!newName) return;

    if (oldName === newName) {
        console.log(`\n${color.yellow}⚠ Old and new name are the same.${color.reset}`);
        return;
    }
    renamePage(oldName, newName);
}

async function handleOutputPath() {
    const current = getCurrentOutputPath();
    const label = current ? `\n${color.dim}Current path: "${current}"${color.reset}\n` : '\n';

    const input = await ask(`${label}${color.magenta}❯${color.reset} New output path: `);
    if (input === null) return;

    const error = validateOutputPath(input);
    if (error) {
        console.log(`\n${color.red}✖ ${error}${color.reset}`);
        return;
    }
    updateOutputPath(input);
}

const MENU_ACTIONS = {
    '1': handleCreate,
    '2': handleRemove,
    '3': handleRename,
    '4': handleOutputPath,
};

function renderMenu() {
    console.log(`\n${color.cyan}${color.bold}╭────────────────────────╮`);
    console.log(`│    Berna-Stencil CLI   │`);
    console.log(`╰────────────────────────╯${color.reset}\n`);
    console.log(`  ${color.green}1.${color.reset} Create page`);
    console.log(`  ${color.red}2.${color.reset} Remove page`);
    console.log(`  ${color.yellow}3.${color.reset} Rename page`);
    console.log(`  ${color.magenta}4.${color.reset} Configure output path`);
    console.log(`  ${color.dim}CTRL + C to exit\n`);
}

async function main() {
    while (true) {
        renderMenu();

        const choice = await ask(`${color.cyan}❯${color.reset} Choose an option: `);
        if (choice === null) break;

        const action = MENU_ACTIONS[choice];
        if (!action) {
            console.log(`\n${color.red}✖ Invalid option.${color.reset}`);
            continue;
        }

        try {
            await action();
        } catch (err) {
            console.log(`\n${color.red}✖ Unexpected error: ${err.message}${color.reset}`);
        }
    }

    rl.close();
    process.exit(0);
}

main();