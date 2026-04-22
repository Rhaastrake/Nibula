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
    readerInterface.question('\n> inserisci il nome della nuova pagina: ', (inputName) => {
        const kebabName = toKebabCase(inputName);
        if (!kebabName) {
            console.log('(!) nome non valido.');
        } else if (PROTECTED_PAGES.includes(kebabName)) {
            console.log(`(!) "${kebabName}" è una pagina protetta e non può essere creata.`);
        } else {
            addPage(kebabName);
        }
        displayMainMenu();
    });
}

function handleRemoveRequest() {
    readerInterface.question('\n> inserisci il nome della pagina da rimuovere: ', (inputName) => {
        const kebabName = toKebabCase(inputName);
        if (!kebabName) {
            console.log('(!) nome non valido.');
        } else if (PROTECTED_PAGES.includes(kebabName)) {
            console.log(`(!) "${kebabName}" è una pagina protetta e non può essere rimossa.`);
        } else {
            removePage(kebabName);
        }
        displayMainMenu();
    });
}

function handleOutputPathRequest() {
    readerInterface.question('\n> inserisci il nuovo path di output (es. C:/laragon/www o . per la root): ', (inputPath) => {
        if (!inputPath.trim()) {
            console.log('(!) path non valido.');
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
    console.log('1. crea pagina');
    console.log('2. rimuovi pagina');
    console.log('3. configura output path');
    console.log('0. esci');

    readerInterface.question('\nscegli un\'opzione: ', (choice) => {
        const cleanChoice = choice.trim();
        if (cleanChoice === '1') {
            handleCreateRequest();
        } else if (cleanChoice === '2') {
            handleRemoveRequest();
        } else if (cleanChoice === '3') {
            handleOutputPathRequest();
        } else if (cleanChoice === '0') {
            console.log('ciao!');
            readerInterface.close();
            process.exit(0);
        } else {
            console.log('(!) opzione non valida.');
            displayMainMenu();
        }
    });
}

console.log('--- inizializzazione in corso... ---');
displayMainMenu();