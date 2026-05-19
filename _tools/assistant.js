const readline = require('readline');
const { addPage, removePage, renamePage } = require('./modules/updatePage');
const { updateOutputPath, getCurrentOutputPath } = require('./modules/updateOutputPath');

// --- Setup ---

const readerInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

const PROTECTED_PAGES = ['homepage', '404'];

// --- Utility ---

// Converts any string to kebab-case
function toKebabCase(str) {
    return str.trim().toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
}

// Returns an error message if the name is invalid, null otherwise
function validatePageName(name) {
    if (!name)                      return 'Invalid name.';
    if (/^\d/.test(name))           return 'Page name cannot start with a number.';
    if (PROTECTED_PAGES.includes(name)) return `"${name}" is a protected page name.`;
    return null;
}

// Wraps readerInterface.question in a Promise for use with async/await
function ask(prompt) {
    return new Promise(resolve =>
        readerInterface.question(prompt, answer => resolve(answer))
    );
}

// Asks for a page name, converts it to kebab-case, validates it,
// logs the error and returns null if invalid
async function askPageName(prompt) {
    const raw = await ask(prompt);
    const name = toKebabCase(raw);
    const error = validatePageName(name);
    if (error) {
        console.log(`(!) ${error}`);
        return null;
    }
    return name;
}

// --- Handlers ---

async function handleCreateRequest() {
    const name = await askPageName('\n> Enter the name of the new page: ');
    if (name) addPage(name, null);
}

async function handleRemoveRequest() {
    const name = await askPageName('\n> Enter the name of the page to remove: ');
    if (name) removePage(name);
}

async function handleRenameRequest() {
    const oldName = await askPageName('\n> Enter the name of the page to rename: ');
    if (!oldName) return;

    const newName = await askPageName('> Enter the new name: ');
    if (!newName) return;

    // Extra check: old and new name must differ
    if (oldName === newName) {
        console.log('(!) Old and new name are the same.');
        return;
    }

    renamePage(oldName, newName);
}

async function handleOutputPathRequest() {
    const current = getCurrentOutputPath();
    const label = current ? ` Current path: "${current}"\n` : '';
    const input = await ask(`${label} Enter the new output path: `);

    if (!input.trim()) {
        console.log('(!) Invalid path.');
    } else {
        updateOutputPath(input);
    }
}

// --- Menu ---

// Maps each menu choice to its handler function
const MENU_ACTIONS = {
    '1': handleCreateRequest,
    '2': handleRemoveRequest,
    '3': handleRenameRequest,
    '4': handleOutputPathRequest,
};

// Displays the menu, waits for input, executes the chosen action,
// then calls itself again to keep the CLI alive (async recursion, no stack buildup)
async function displayMainMenu() {
    console.log('\n========================');
    console.log('  Berna-Stencil CLI      ');
    console.log('========================\n');
    console.log('1. Create page');
    console.log('2. Remove page');
    console.log('3. Rename page');
    console.log('4. Configure output path');
    console.log('\nCTRL/CMD + C to exit');

    const choice = (await ask('\nChoose an option: ')).trim();

    if (choice === '0') {
        readerInterface.close();
        process.exit(0);
    }

    const action = MENU_ACTIONS[choice];
    if (action) {
        await action();
    } else {
        console.log('(!) Invalid option.');
    }

    // Recurse to redisplay the menu after each action.
    // Safe because each iteration fully resolves before the next one starts.
    displayMainMenu();
}

displayMainMenu();