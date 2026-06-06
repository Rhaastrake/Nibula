const fs   = require('fs');
const path = require('path');

const TSCONFIG = path.resolve(__dirname, '../../tsconfig.json');

// Shared utility functions used across modules

// Converts a kebab-case or snake_case string to camelCase.
// Uses slice(1) to remove the delimiter, avoiding the double-replace bug
// that occurs when using .replace('-', '') without the /g flag.
function toCamelCase(str) {
    return str.toLowerCase().replace(/[-_][a-z0-9]/g, (group) =>
        group.slice(1).toUpperCase()
    );
}

// Converts a kebab-case page name to a human-readable title
// e.g. "about-us" → "About Us"
function toNiceTitle(pageName) {
    return pageName
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function isTypeScriptProject() {
    return fs.existsSync(TSCONFIG);
}

module.exports = { toCamelCase, toNiceTitle, isTypeScriptProject };