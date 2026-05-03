const readline = require('readline');
const { addPage, removePage, renamePage } = require('./modules/updatePage');
const { updateOutputPath, getCurrentOutputPath } = require('./modules/updateOutputPath');

const readerInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
});

const PROTECTED_PAGES = ['homepage', '404'];

function toKebabCase(str) {
    return str.trim().toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-');
}

function handleCreateRequest() {
    readerInterface.question('\n> Enter the name of the new page: ', (inputName) => {
        const kebabName = toKebabCase(inputName);
        if (!kebabName) {
            console.log('(!) Invalid name.');
        } else if (/^\d/.test(kebabName)) {
            console.log('(!) Invalid name. Page name cannot start with a number.');
        } else if (PROTECTED_PAGES.includes(kebabName)) {
            console.log(`(!) "${kebabName}" is a protected page and cannot be created.`);
        } else {
            addPage(kebabName, null);
        }
        displayMainMenu();
    });
}

function handleRenameRequest() {
    readerInterface.question('\n> Enter the name of the page to rename: ', (inputOld) => {
        const oldName = toKebabCase(inputOld);
        if (!oldName) {
            console.log('(!) Invalid name.');
            return displayMainMenu();
        }
        if (PROTECTED_PAGES.includes(oldName)) {
            console.log(`(!) "${oldName}" is a protected page and cannot be renamed.`);
            return displayMainMenu();
        }
        readerInterface.question('> enter the new name: ', (inputNew) => {
            const newName = toKebabCase(inputNew);
            if (!newName) {
                console.log('(!) invalid name.');
            } else if (/^\d/.test(newName)) {
                console.log('(!) Invalid name. Page name cannot start with a number.');
            } else if (PROTECTED_PAGES.includes(newName)) {
                console.log(`(!) "${newName}" is a protected page name.`);
            } else if (oldName === newName) {
                console.log('(!) Old and new name are the same.');
            } else {
                renamePage(oldName, newName);
            }
            displayMainMenu();
        });
    });
}

function handleRemoveRequest() {
    readerInterface.question('\n> Enter the name of the page to remove: ', (inputName) => {
        const kebabName = toKebabCase(inputName);
        if (!kebabName) {
            console.log('(!) Invalid name.');
        } else if (PROTECTED_PAGES.includes(kebabName)) {
            console.log(`(!) "${kebabName}" Is a protected page and cannot be removed.`);
        } else {
            removePage(kebabName);
        }
        displayMainMenu();
    });
}

function handleOutputPathRequest() {
    const current = getCurrentOutputPath();
    const currentLabel = current ? ` (current: "${current}")` : '';

    readerInterface.question(`\n> Enter the new output path${currentLabel}\n  (e.g. C:/laragon/www or . for root): `, (inputPath) => {
        if (!inputPath.trim()) {
            console.log('(!) Invalid path.');
        } else {
            updateOutputPath(inputPath);
        }
        displayMainMenu();
    });
}

function displayMainMenu() {
    console.log('\n========================');
    console.log('  Berna-Stencil CLI      ');
    console.log('========================\n');
    console.log('1. Create page');
    console.log('2. Rename page');
    console.log('3. Remove page');
    console.log('4. Configure output path');
    console.log('\nCTRL/CMD + C to exit');

    readerInterface.question('\nChoose an option: ', (choice) => {
        const cleanChoice = choice.trim();
        if (cleanChoice === '1') {
            handleCreateRequest();
        } else if (cleanChoice === '2') {
            handleRenameRequest();
        } else if (cleanChoice === '3') {
            handleRemoveRequest();
        } else if (cleanChoice === '4') {
            handleOutputPathRequest();
        } else if (cleanChoice === '0') {
            readerInterface.close();
            process.exit(0);
        } else {
            console.log('(!) Invalid option.');
            displayMainMenu();
        }
    });
}

displayMainMenu();