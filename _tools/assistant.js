const readline = require('readline');
const { addPage, removePage, renamePage } = require('./modules/updatePage');
const { updateOutputPath, getCurrentOutputPath } = require('./modules/updateOutputPath');

const c = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
};

const readerInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

const PROTECTED_PAGES  = ['homepage', '404'];
const MAX_NAME_LENGTH  = 50;

function toKebabCase(str) {
    return str.trim().toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function validatePageName(name) {
    if (!name)                                 return 'Invalid name.';
    if (name.length > MAX_NAME_LENGTH)         return `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
    if (!/^[a-z0-9-]+$/.test(name))            return 'Page name can only contain lowercase letters, numbers, and hyphens.';
    if (/^\d/.test(name))                      return 'Page name cannot start with a number.';
    if (PROTECTED_PAGES.includes(name))        return `"${name}" is a protected page name.`;
    return null;
}

function validateOutputPath(input) {
    if (!input.trim())           return 'Invalid path.';
    if (input.includes('..'))    return 'Path cannot contain "..".';
    if (/[<>|?*"']/.test(input)) return 'Path contains invalid characters.';
    return null;
}

function sanitizeInput(str) {
    return str.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

function ask(prompt) {
    return new Promise(resolve =>
        readerInterface.question(prompt, answer => resolve(sanitizeInput(answer)))
    );
}

async function askPageName(prompt) {
    const raw = await ask(prompt);
    const name = toKebabCase(raw);
    const error = validatePageName(name);
    if (error) {
        console.log(`\n${c.red}✖ ${error}${c.reset}`);
        return null;
    }
    return name;
}

async function handleCreateRequest() {
    const name = await askPageName(`\n${c.green}❯${c.reset} Enter the name of the new page: `);
    if (name) addPage(name, null);
}

async function handleRemoveRequest() {
    const name = await askPageName(`\n${c.red}❯${c.reset} Enter the name of the page to remove: `);
    if (name) removePage(name);
}

async function handleRenameRequest() {
    const oldName = await askPageName(`\n${c.yellow}❯${c.reset} Enter the name of the page to rename: `);
    if (!oldName) return;

    const newName = await askPageName(`${c.yellow}❯${c.reset} Enter the new name: `);
    if (!newName) return;

    if (oldName === newName) {
        console.log(`\n${c.yellow}⚠ Old and new name are the same.${c.reset}`);
        return;
    }

    renamePage(oldName, newName);
}

async function handleOutputPathRequest() {
    const current = getCurrentOutputPath();
    const label   = current ? `\n${c.dim}Current path: "${current}"${c.reset}\n` : '\n';
    const input   = await ask(`${label}${c.magenta}❯${c.reset} Enter the new output path: `);

    const error = validateOutputPath(input);
    if (error) {
        console.log(`\n${c.red}✖ ${error}${c.reset}`);
    } else {
        updateOutputPath(input);
    }
}

const MENU_ACTIONS = {
    '1': handleCreateRequest,
    '2': handleRemoveRequest,
    '3': handleRenameRequest,
    '4': handleOutputPathRequest,
};

async function displayMainMenu() {
    console.log(`\n${c.cyan}${c.bold}╭────────────────────────╮`);
    console.log(`│    Berna-Stencil CLI   │`);
    console.log(`╰────────────────────────╯${c.reset}\n`);
    console.log(`  ${c.green}1.${c.reset} Create page`);
    console.log(`  ${c.red}2.${c.reset} Remove page`);
    console.log(`  ${c.yellow}3.${c.reset} Rename page`);
    console.log(`  ${c.magenta}4.${c.reset} Configure output path`);
    console.log(`\n  ${c.dim}CTRL/CMD + C to exit${c.reset}\n`);

    const choice = (await ask(`${c.cyan}❯${c.reset} Choose an option: `)).trim();

    if (choice === '0') {
        readerInterface.close();
        process.exit(0);
    }

    const action = MENU_ACTIONS[choice];
    if (action) {
        try {
            await action();
        } catch (err) {
            console.log(`\n${c.red}✖ Unexpected error: ${err.message}${c.reset}`);
        }
    } else {
        console.log(`\n${c.red}✖ Invalid option.${c.reset}`);
    }

    displayMainMenu();
}

displayMainMenu();