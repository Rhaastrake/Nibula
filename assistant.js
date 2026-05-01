const readline = require('readline');
const { addPage, removePage } = require('./assistant_utils/modules/updatePage');
const { updateOutputPath } = require('./assistant_utils/modules/updateOutputPath');

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
    readerInterface.question('\n> enter the name of the new page: ', (inputName) => {
        const kebabName = toKebabCase(inputName);
        if (!kebabName) {
            console.log('(!) invalid name.');
        } else if (PROTECTED_PAGES.includes(kebabName)) {
            console.log(`(!) "${kebabName}" is a protected page and cannot be created.`);
        } else {
            addPage(kebabName);
        }
        displayMainMenu();
    });
}

function handleRemoveRequest() {
    readerInterface.question('\n> enter the name of the page to remove: ', (inputName) => {
        const kebabName = toKebabCase(inputName);
        if (!kebabName) {
            console.log('(!) invalid name.');
        } else if (PROTECTED_PAGES.includes(kebabName)) {
            console.log(`(!) "${kebabName}" is a protected page and cannot be removed.`);
        } else {
            removePage(kebabName);
        }
        displayMainMenu();
    });
}

function handleOutputPathRequest() {
    readerInterface.question('\n> enter the new output path (e.g. C:/laragon/www or . for root): ', (inputPath) => {
        if (!inputPath.trim()) {
            console.log('(!) invalid path.');
        } else {
            updateOutputPath(inputPath);
        }
        displayMainMenu();
    });
}

function displayMainMenu() {
    console.log('\n========================');
    console.log('     assistant cli      ');
    console.log('========================');
    console.log('1. create page');
    console.log('2. remove page');
    console.log('3. configure output path');
    console.log('0. exit');

    readerInterface.question('\nchoose an option: ', (choice) => {
        const cleanChoice = choice.trim();
        if (cleanChoice === '1') {
            handleCreateRequest();
        } else if (cleanChoice === '2') {
            handleRemoveRequest();
        } else if (cleanChoice === '3') {
            handleOutputPathRequest();
        } else if (cleanChoice === '0') {
            console.log('bye!');
            readerInterface.close();
            process.exit(0);
        } else {
            console.log('(!) invalid option.');
            displayMainMenu();
        }
    });
}

console.log('--- initializing... ---');
displayMainMenu();