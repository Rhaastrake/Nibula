// Shared utility functions used across modules

// Converts a kebab-case or snake_case string to camelCase.
// Uses slice(1) to remove the delimiter, avoiding the double-replace bug
// that occurs when using .replace('-', '') without the /g flag.
function toCamelCase(str) {
    return str.toLowerCase().replace(/[-_][a-z0-9]/g, (group) =>
        group.slice(1).toUpperCase()
    );
}

module.exports = { toCamelCase };