const fileSystem = require('fs');
const { toCamelCase } = require('./utils');

const INCLUDES_PATH = 'src/frontend/components/layouts/includes.njk';

// --- Helpers ---

// Returns the file content as a string, or null if the file doesn't exist
function readIncludes() {
    if (!fileSystem.existsSync(INCLUDES_PATH)) return null;
    return fileSystem.readFileSync(INCLUDES_PATH, 'utf8');
}

// Writes updated content back to the includes file
function writeIncludes(content) {
    fileSystem.writeFileSync(INCLUDES_PATH, content);
}

// Builds the regex that matches the elif block for a given camelCase page name.
// Defined once here to avoid duplication and the stateful /g flag bug:
// using /g with .test() advances lastIndex, making a subsequent .replace() start
// from the wrong position. A fresh non-/g regex avoids this entirely.
function buildElifRegex(camelName) {
    return new RegExp(
        `[ \\t]*\\{%\\s*elif\\s+title\\s*==\\s*"${camelName}"\\s*%\\}[\\s\\S]*?(?=[ \\t]*\\{%\\s*(?:elif|else|endif))`,
    );
}

// --- Public API ---

// Inserts a new elif block before {% else %} for the given page
function addLayout(pageName) {
    const content = readIncludes();
    if (!content) return;

    const camelName = toCamelCase(pageName);

    // Skip if the block already exists
    if (content.includes(`{% elif title == "${camelName}" %}`)) return;

    const newElif =
        `{% elif title == "${camelName}" %}\n` +
        `  {# Insert your includes under this page #}\n` +
        `  {#{% include "component.njk" %}#}\n\n`;

    writeIncludes(content.replace('{% else %}', `${newElif}{% else %}`));
    console.log(`[UPDATED] Layout block added for "${camelName}".`);
}

// Removes the elif block for the given page, then collapses extra blank lines
function removeLayout(pageName) {
    const content = readIncludes();
    if (!content) return;

    const camelName = toCamelCase(pageName);
    const regex = buildElifRegex(camelName);

    if (!regex.test(content)) {
        console.log(`[DEBUG] Layout block for "${camelName}" not found. Skipped.`);
        return;
    }

    // Build a fresh regex instance for replace to avoid stale lastIndex
    const updated = content
        .replace(buildElifRegex(camelName), '')
        .replace(/\n\s*\n\s*\n/g, '\n\n');

    writeIncludes(updated);
    console.log(`[CLEANED] Layout block removed for "${camelName}".`);
}

// Renames a layout block by removing the old one and inserting a new one
function renameLayout(oldName, newName) {
    removeLayout(oldName);
    addLayout(newName);
}

module.exports = { addLayout, removeLayout, renameLayout };