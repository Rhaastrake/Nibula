const fileSystem = require('fs');
const INCLUDES_PATH = 'src/components/layouts/includes.njk';

function toCamelCase(str) {
    return str.toLowerCase().replace(/[-_][a-z0-9]/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
}

function addLayout(pageName) {
    const camelName = toCamelCase(pageName);
    if (!fileSystem.existsSync(INCLUDES_PATH)) return;

    let content = fileSystem.readFileSync(INCLUDES_PATH, 'utf8');

    if (content.includes(`{% elif title == "${camelName}" %}`)) return;

    const newElif = `{% elif title == "${camelName}" %}\n  {#{% include "component.njk" %}#}\n\n`;
    const updatedContent = content.replace('{% else %}', `${newElif}{% else %}`);

    fileSystem.writeFileSync(INCLUDES_PATH, updatedContent);
    console.log(`[UPDATED] Layout block added for "${camelName}".`);
}

function removeLayout(pageName) {
    const camelName = toCamelCase(pageName);
    if (!fileSystem.existsSync(INCLUDES_PATH)) return;

    let content = fileSystem.readFileSync(INCLUDES_PATH, 'utf8');

    const regex = new RegExp(`[ \\t]*\\{%\\s*elif\\s+title\\s*==\\s*"${camelName}"\\s*%\\}[\\s\\S]*?(?=[ \\t]*\\{%\\s*(?:elif|else|endif))`, 'g');

    if (!regex.test(content)) {
        console.log(`[DEBUG] Layout block for "${camelName}" not found. Skipped.`);
        return;
    }

    let updatedContent = content.replace(regex, '');
    updatedContent = updatedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    fileSystem.writeFileSync(INCLUDES_PATH, updatedContent);
    console.log(`[CLEANED] Layout block removed for "${camelName}".`);
}

module.exports = { addLayout, removeLayout };