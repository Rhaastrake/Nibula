const fileSystem = require('fs');
const { toCamelCase } = require('./utils');

const PAGE_COMPONENTS_PATH = 'src/frontend/layouts/pageComponents.njk';

// --- Helpers ---

function readIncludes() {
    if (!fileSystem.existsSync(PAGE_COMPONENTS_PATH)) return null;
    return fileSystem.readFileSync(PAGE_COMPONENTS_PATH, 'utf8');
}

function writeIncludes(content) {
    fileSystem.writeFileSync(PAGE_COMPONENTS_PATH, content);
}

function buildElifRegex(camelName) {
    return new RegExp(
        `[ \\t]*\\{%\\s*elif\\s+title\\s*==\\s*"${camelName}"\\s*%\\}[\\s\\S]*?(?=[ \\t]*\\{%\\s*(?:elif|else|endif))`,
    );
}

// --- Public API ---

function addLayout(pageName) {
    const content = readIncludes();
    if (!content) return;

    const camelName = toCamelCase(pageName);

    if (content.includes(`{% elif title == "${camelName}" %}`)) return;

    const newElif =
        `{% elif title == "${camelName}" %}\n` +
        `  {# Insert your components under this page #}\n` +
        `  {#{% include "component.njk" %}#}\n\n`;

    writeIncludes(content.replace('{% else %}', `${newElif}{% else %}`));
    console.log(`[UPDATED] Layout block added for "${camelName}".`);
}

function removeLayout(pageName) {
    const content = readIncludes();
    if (!content) return;

    const camelName = toCamelCase(pageName);
    const regex = buildElifRegex(camelName);

    if (!regex.test(content)) {
        console.log(`[DEBUG] Layout block for "${camelName}" not found. Skipped.`);
        return;
    }

    const updated = content
        .replace(buildElifRegex(camelName), '')
        .replace(/\n\s*\n\s*\n/g, '\n\n');

    writeIncludes(updated);
    console.log(`[CLEANED] Layout block removed for "${camelName}".`);
}

function renameLayout(oldName, newName) {
    const content = readIncludes();
    if (!content) return;

    const oldCamel = toCamelCase(oldName);
    const newCamel = toCamelCase(newName);

    const oldLine = `{% elif title == "${oldCamel}" %}`;
    const newLine = `{% elif title == "${newCamel}" %}`;

    if (!content.includes(oldLine)) {
        console.log(`[DEBUG] Layout block for "${oldCamel}" not found. Skipped.`);
        return;
    }

    writeIncludes(content.replace(oldLine, newLine));
    console.log(`[RENAMED] Layout block renamed from "${oldCamel}" to "${newCamel}".`);
}

module.exports = { addLayout, removeLayout, renameLayout };