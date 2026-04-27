const fs = require('fs');
const path = require('path');

const ELEVENTY_CONFIG = path.resolve(__dirname, '../../.eleventy.js');
const PACKAGE_JSON = path.resolve(__dirname, '../../package.json');

function updateEleventyConfig(newPath) {
    let content = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');

    // Sostituisce qualsiasi valore di OUTPUT_DIR
    const updated = content.replace(
        /const OUTPUT_DIR\s*=\s*['"`][^'"`]*['"`]/,
        `const OUTPUT_DIR = "${newPath}"`
    );

    if (content === updated) {
        console.log('(!) OUTPUT_DIR non trovata in .eleventy.js');
        return false;
    }

    fs.writeFileSync(ELEVENTY_CONFIG, updated, 'utf-8');
    console.log(`(✓) .eleventy.js aggiornato → ${newPath}`);
    return true;
}

function updatePackageJson(newPath) {
    const raw = fs.readFileSync(PACKAGE_JSON, 'utf-8');
    const pkg = JSON.parse(raw);

    // Trova il path attuale leggendolo da eleventy.config.js
    const eleventyContent = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
    const match = eleventyContent.match(/const OUTPUT_DIR\s*=\s*['"`]([^'"`]*)['"`]/);
    const oldPath = match ? match[1] : null;

    let changed = false;

    for (const [key, value] of Object.entries(pkg.scripts)) {
        let updated = value;

        if (oldPath) {
            // Sostituisce il vecchio path con il nuovo
            updated = updated.split(oldPath).join(newPath);
        } else {
            updated = updated.replace(
                /([A-Za-z]:\/[^\s:]+|\.\.\/[^\s:]+)(?=\/css|\/js|\/assets)/g,
                newPath
            );
        }

        if (updated !== value) {
            pkg.scripts[key] = updated;
            changed = true;
        }
    }

    if (!changed) {
        console.log('(!) nessun path trovato negli script di package.json');
        return false;
    }

    fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2), 'utf-8');
    console.log(`(✓) package.json aggiornato → ${newPath}`);
    return true;
}

function updateOutputPath(newPath) {
    const trimmed = newPath.trim().replace(/\\/g, '/');

    let normalizedPath;
    if (trimmed === '.') {
        normalizedPath = 'out';
    } else {
        const projectName = path.basename(process.cwd());
        normalizedPath = trimmed.replace(/\/$/, '') + '/' + projectName;
    }

    // Legge il vecchio path da .eleventy.js prima di sovrascriverlo
    const eleventyContent = fs.readFileSync(ELEVENTY_CONFIG, 'utf-8');
    const match = eleventyContent.match(/const OUTPUT_DIR\s*=\s*['"`]([^'"`]*)['"`]/);
    const oldPath = match ? match[1] : null;

    // Elimina la vecchia cartella di output
    if (oldPath) {
        const oldAbsPath = path.resolve(__dirname, '../../', oldPath);
        if (fs.existsSync(oldAbsPath)) {
            fs.rmSync(oldAbsPath, { recursive: true, force: true });
            console.log(`(✓) cartella eliminata → ${oldAbsPath}`);
        } else {
            console.log(`(i) cartella non trovata, niente da eliminare → ${oldAbsPath}`);
        }
    }

    console.log(`\naggiornamento path di output → "${normalizedPath}"...`);

    updatePackageJson(normalizedPath);
    updateEleventyConfig(normalizedPath);
}

module.exports = { updateOutputPath };