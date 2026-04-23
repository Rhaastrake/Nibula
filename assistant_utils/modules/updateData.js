const fileSystem = require('fs');
const SITE_DATA_PATH = 'src/data/site.json';

function addSiteData(pageName) {
    if (!fileSystem.existsSync(SITE_DATA_PATH)) return;

    const data = JSON.parse(fileSystem.readFileSync(SITE_DATA_PATH, 'utf8'));

    if (data.pages[pageName]) {
        console.log(`[SKIP] Record "${pageName}" già presente.`);
        return;
    }

    const niceTitle = pageName
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    data.pages[pageName] = {
        seo: {
            title: niceTitle,
            description: "description",
        },
    };

    fileSystem.writeFileSync(SITE_DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`[UPDATED] Record "${pageName}" aggiunto.`);
}

function removeSiteData(pageName) {
    if (!fileSystem.existsSync(SITE_DATA_PATH)) return;

    const data = JSON.parse(fileSystem.readFileSync(SITE_DATA_PATH, 'utf8'));

    if (!data.pages[pageName]) {
        console.log(`[SKIP] Record "${pageName}" non trovato.`);
        return;
    }

    delete data.pages[pageName];

    fileSystem.writeFileSync(SITE_DATA_PATH, JSON.stringify(data, null, 2));
    console.log(`[CLEANED] Record "${pageName}" rimosso.`);
}

module.exports = { addSiteData, removeSiteData };