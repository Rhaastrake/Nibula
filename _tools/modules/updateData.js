const fs = require('fs');
const { PATHS } = require('./constants');
const { toCamelCase, toNiceTitle } = require('./utils');

function readSiteData() {
    if (!fs.existsSync(PATHS.siteData)) {
        console.log(`[skip] not found: ${PATHS.siteData}`);
        return null;
    }
    try {
        const data = JSON.parse(fs.readFileSync(PATHS.siteData, 'utf8'));
        if (!data.pages || typeof data.pages !== 'object') data.pages = {};
        return data;
    } catch (err) {
        console.log(`[error] cannot parse site.json: ${err.message}`);
        return null;
    }
}

function writeSiteData(data) {
    fs.writeFileSync(PATHS.siteData, `${JSON.stringify(data, null, 2)}\n`);
}

function addSiteData(pageName) {
    const data = readSiteData();
    if (!data) return;

    const camelName = toCamelCase(pageName);
    if (data.pages[camelName]) {
        console.log(`[skip] record "${camelName}" already exists`);
        return;
    }

    data.pages[camelName] = {
        seo: { title: toNiceTitle(pageName), description: 'description' },
        cdn: { css: [], js: [] },
    };

    writeSiteData(data);
    console.log(`[updated] record "${camelName}" added`);
}

function removeSiteData(pageName) {
    const data = readSiteData();
    if (!data) return;

    const camelName = toCamelCase(pageName);
    if (!data.pages[camelName]) {
        console.log(`[skip] record "${camelName}" not found`);
        return;
    }

    delete data.pages[camelName];
    writeSiteData(data);
    console.log(`[cleaned] record "${camelName}" removed`);
}

function renameSiteData(oldName, newName) {
    const data = readSiteData();
    if (!data) return;

    const oldCamel = toCamelCase(oldName);
    const newCamel = toCamelCase(newName);

    if (!data.pages[oldCamel]) {
        console.log(`[skip] record "${oldCamel}" not found`);
        return;
    }
    if (data.pages[newCamel]) {
        console.log(`[skip] record "${newCamel}" already exists`);
        return;
    }

    data.pages[newCamel] = {
        ...data.pages[oldCamel],
        seo: { ...data.pages[oldCamel].seo, title: toNiceTitle(newName) },
    };
    delete data.pages[oldCamel];

    writeSiteData(data);
    console.log(`[updated] record "${oldCamel}" renamed to "${newCamel}"`);
}

module.exports = { addSiteData, removeSiteData, renameSiteData };