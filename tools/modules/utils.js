const fs = require('fs');
const { PATHS } = require('./constants');

function toCamelCase(value) {
    return value.toLowerCase().replace(/[-_][a-z0-9]/g, (group) => group.slice(1).toUpperCase());
}

function toKebabCase(value) {
    return value.trim().toLowerCase()
        .replace(/[^a-z0-9\s_-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function toNiceTitle(pageName) {
    return pageName.split('-')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function isTypeScriptProject() {
    return fs.existsSync(PATHS.tsconfig);
}

module.exports = { toCamelCase, toKebabCase, toNiceTitle, isTypeScriptProject };