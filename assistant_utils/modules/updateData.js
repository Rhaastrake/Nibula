const fileSystem = require('fs');
const SITE_DATA_PATH = 'src/data/site.json';

function toCamelCase(str) {
    return str.toLowerCase().replace(/[-_][a-z0-9]/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
}

function addSiteData(pageName) {
    if (!fileSystem.existsSync(SITE_DATA_PATH)) return;

    const data = JSON.parse(fileSystem.readFileSync(SITE_DATA_PATH, 'utf8'));
    const camelName = toCamelCase(pageName);

    if (data.pages[camelName]) {
        console.log(`[SKIP] Record "${camelName}" già presente.`);
        return;
    }

    const niceTitle = pageName
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    data.pages[camelName] = {
        seo: {
            title: niceTitle,
            description: "description",
        },
        cdn: {
            css: [],
            js: []
        }
    };

    fileSystem.writeFileSync(SITE_DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`[UPDATED] Record "${camelName}" aggiunto.`);
}

function removeSiteData(pageName) {
    if (!fileSystem.existsSync(SITE_DATA_PATH)) return;

    const data = JSON.parse(fileSystem.readFileSync(SITE_DATA_PATH, 'utf8'));
    const camelName = toCamelCase(pageName);

    if (!data.pages[camelName]) {
        console.log(`[SKIP] Record "${camelName}" non trovato.`);
        return;
    }

    delete data.pages[camelName];

    fileSystem.writeFileSync(SITE_DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`[CLEANED] Record "${camelName}" rimosso.`);
}

module.exports = { addSiteData, removeSiteData };