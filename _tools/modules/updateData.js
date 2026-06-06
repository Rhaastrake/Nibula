const fileSystem = require('fs');
const { toCamelCase, toNiceTitle } = require('./utils');

const SITE_DATA_PATH = 'src/frontend/data/site.json';

// Returns the parsed site.json content, or null if the file doesn't exist
function readSiteData() {
    if (!fileSystem.existsSync(SITE_DATA_PATH)) return null;
    return JSON.parse(fileSystem.readFileSync(SITE_DATA_PATH, 'utf8'));
}

// Serializes and writes the data object back to site.json
function writeSiteData(data) {
    fileSystem.writeFileSync(SITE_DATA_PATH, JSON.stringify(data, null, 2));
}

// --- Public API ---

// Adds a new page record to site.json
// Skips silently if the file doesn't exist or the record is already present
function addSiteData(pageName) {
    const data = readSiteData();
    if (!data) return;

    const camelName = toCamelCase(pageName);

    if (data.pages[camelName]) {
        console.log(`[SKIP] Record "${camelName}" already exists.`);
        return;
    }

    // Build the default page record with SEO metadata and empty CDN arrays
    data.pages[camelName] = {
        seo: {
            title: toNiceTitle(pageName),
            description: 'description',
        },
        cdn: {
            css: [],
            js: []
        }
    };

    writeSiteData(data);
    console.log(`[UPDATED] Record "${camelName}" added.`);
}

// Removes a page record from site.json
// Skips silently if the file doesn't exist or the record is not found
function removeSiteData(pageName) {
    const data = readSiteData();
    if (!data) return;

    const camelName = toCamelCase(pageName);

    if (!data.pages[camelName]) {
        console.log(`[SKIP] Record "${camelName}" not found.`);
        return;
    }

    delete data.pages[camelName];

    writeSiteData(data);
    console.log(`[CLEANED] Record "${camelName}" removed.`);
}

// Renames a page record in site.json
// Preserves all existing fields (cdn, etc.) and only updates the SEO title
// Skips if the source record doesn't exist or the target name is already taken
function renameSiteData(oldName, newName) {
    const data = readSiteData();
    if (!data) return;

    const oldCamel = toCamelCase(oldName);
    const newCamel = toCamelCase(newName);

    if (!data.pages[oldCamel]) {
        console.log(`[SKIP] Record "${oldCamel}" not found.`);
        return;
    }

    if (data.pages[newCamel]) {
        console.log(`[SKIP] Record "${newCamel}" already exists.`);
        return;
    }

    // Spread the existing record to preserve cdn and any future fields,
    // then override only the seo.title with the new page name
    data.pages[newCamel] = {
        ...data.pages[oldCamel],
        seo: {
            ...data.pages[oldCamel].seo,
            title: toNiceTitle(newName),
        }
    };

    delete data.pages[oldCamel];

    writeSiteData(data);
    console.log(`[UPDATED] Record "${oldCamel}" renamed to "${newCamel}".`);
}

module.exports = { addSiteData, removeSiteData, renameSiteData };