const { MAX_PAGE_NAME_LENGTH, PROTECTED_PAGES } = require('./constants');

function validatePageName(name) {
    if (!name)                              return 'Invalid name.';
    if (name.length > MAX_PAGE_NAME_LENGTH) return `Name must be ${MAX_PAGE_NAME_LENGTH} characters or fewer.`;
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

module.exports = { validatePageName, validateOutputPath };