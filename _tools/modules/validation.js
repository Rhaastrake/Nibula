const fs = require('fs');
const { PATHS, PROTECTED_PAGES } = require('./constants');

function validatePageName(name) {
    if (!name)                              return 'Invalid name.';
    if (!/^[a-z0-9-]+$/.test(name))         return 'Page name can only contain lowercase letters, numbers, and hyphens.';
    if (/^\d/.test(name))                   return 'Page name cannot start with a number.';
    if (PROTECTED_PAGES.includes(name))     return `"${name}" is a protected page name.`;
    return null;
}

function validateOutputPath(input) {
    const value = (input ?? '').trim();
    if (!value)                    return 'Invalid path.';
    if (value.includes('..'))      return 'Path cannot contain "..".';
    if (/[<>|?*"']/.test(value))   return 'Path contains invalid characters.';
    return null;
}

function checkRequiredFiles() {
    const required = [
        { label: '.eleventy.js',                 path: PATHS.eleventyConfig },
        { label: 'package.json',                 path: PATHS.packageJson    },
        { label: 'src/frontend/data/site.json',  path: PATHS.siteData       },
        { label: 'src/frontend/layouts/page-components.njk', path: PATHS.pageComponents },
        { label: 'CLI page templates',           path: PATHS.templates      },
    ];
    return required.filter((item) => !fs.existsSync(item.path));
}

module.exports = { validatePageName, validateOutputPath, checkRequiredFiles };