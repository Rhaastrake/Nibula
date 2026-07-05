const fs = require('fs');
const { PATHS } = require('./constants');
const { toCamelCase } = require('./utils');

function readPageComponents() {
    if (!fs.existsSync(PATHS.pageComponents)) {
        console.log(`[skip] not found: ${PATHS.pageComponents}`);
        return null;
    }
    return fs.readFileSync(PATHS.pageComponents, 'utf8');
}

function writePageComponents(content) {
    fs.writeFileSync(PATHS.pageComponents, content);
}

function elifBlockRegex(camelName) {
    return new RegExp(
        `[ \\t]*\\{%\\s*elif\\s+title\\s*==\\s*"${camelName}"\\s*%\\}[\\s\\S]*?(?=[ \\t]*\\{%\\s*(?:elif|else|endif))`,
    );
}

function addPageBlock(pageName) {
    const content = readPageComponents();
    if (!content) return;

    const camelName = toCamelCase(pageName);
    if (content.includes(`{% elif title == "${camelName}" %}`)) return;

    if (!content.includes('{% else %}')) {
        console.log('[skip] no {% else %} anchor in page-components.njk');
        return;
    }

    const block =
        `{% elif title == "${camelName}" %}\n` +
        `  {#{% include "component.njk" %}#}\n\n`;

    writePageComponents(content.replace('{% else %}', `${block}{% else %}`));
    console.log(`[updated] page block added for "${camelName}"`);
}

function removePageBlock(pageName) {
    const content = readPageComponents();
    if (!content) return;

    const camelName = toCamelCase(pageName);
    if (!elifBlockRegex(camelName).test(content)) {
        console.log(`[skip] page block for "${camelName}" not found`);
        return;
    }

    const updated = content
        .replace(elifBlockRegex(camelName), '')
        .replace(/\n\s*\n\s*\n/g, '\n\n');

    writePageComponents(updated);
    console.log(`[cleaned] page block removed for "${camelName}"`);
}

function renamePageBlock(oldName, newName) {
    const content = readPageComponents();
    if (!content) return;

    const oldLine = `{% elif title == "${toCamelCase(oldName)}" %}`;
    const newLine = `{% elif title == "${toCamelCase(newName)}" %}`;

    if (!content.includes(oldLine)) {
        console.log(`[skip] page block for "${toCamelCase(oldName)}" not found`);
        return;
    }

    writePageComponents(content.replace(oldLine, newLine));
    console.log(`[renamed] page block "${toCamelCase(oldName)}" → "${toCamelCase(newName)}"`);
}

module.exports = { addPageBlock, removePageBlock, renamePageBlock };