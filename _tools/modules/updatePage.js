const fileSystem = require('fs');
const path = require('path');

const { addSiteData, removeSiteData, renameSiteData } = require('./updateData');
const { addLayout, removeLayout, renameLayout } = require('./updateIncludes');
const { getCurrentOutputPath } = require('./updateOutputPath');
const { toCamelCase } = require('./utils');

const TEMPLATES_DIR = path.join(__dirname, '..', 'res', 'templates');

// --- Helpers ---

// Returns the three file targets (scss, js, njk) for a given page name
function getPageTargets(pageName) {
    const camelName = toCamelCase(pageName);
    return [
        { folder: 'src/frontend/scss/pages', templateFile: 'template.scss', fileName: `${camelName}.scss` },
        { folder: 'src/frontend/js/pages',   templateFile: 'template.js',   fileName: `${camelName}.js`   },
        { folder: 'src/frontend/_routes',    templateFile: 'template.njk',  fileName: `${pageName}.njk`   },
    ];
}

// --- Public API ---

function addPage(pageName) {
    const camelName = toCamelCase(pageName);

    getPageTargets(pageName).forEach(({ folder, templateFile, fileName }) => {
        const destPath = path.join(folder, fileName);
        fileSystem.mkdirSync(folder, { recursive: true });

        if (fileSystem.existsSync(destPath)) return;

        const srcPath = path.join(TEMPLATES_DIR, templateFile);

        if (templateFile === 'template.njk') {
            // Patch the frontmatter placeholders with the actual page values
            const content = fileSystem.readFileSync(srcPath, 'utf8')
                .replace(/^title:.*$/m,     `title: "${camelName}"`)
                .replace(/^permalink:.*$/m, `permalink: "/${pageName}/"`);
            fileSystem.writeFileSync(destPath, content);
        } else {
            fileSystem.copyFileSync(srcPath, destPath);
        }

        console.log(`[created file] ${destPath}`);
    });

    addLayout(pageName);
    addSiteData(pageName);
}

function renamePage(oldName, newName) {
    const oldCamel = toCamelCase(oldName);
    const newCamel = toCamelCase(newName);

    // Use consistent src/frontend/ paths (matching addPage)
    const filesToRename = [
        { src: `src/frontend/scss/pages/${oldCamel}.scss`, dest: `src/frontend/scss/pages/${newCamel}.scss` },
        { src: `src/frontend/js/pages/${oldCamel}.js`,     dest: `src/frontend/js/pages/${newCamel}.js`     },
        { src: `src/frontend/_routes/${oldName}.njk`,      dest: `src/frontend/_routes/${newName}.njk`      },
    ];

    filesToRename.forEach(({ src, dest }) => {
        if (!fileSystem.existsSync(src)) {
            console.log(`[skip] not found: ${src}`);
            return;
        }
        fileSystem.renameSync(src, dest);
        console.log(`[renamed] ${src} → ${dest}`);
    });

    // Use atomic rename helpers instead of remove + add separately
    renameLayout(oldName, newName);
    renameSiteData(oldName, newName);
}

function removePage(pageName) {
    const camelName = toCamelCase(pageName);

    // Read the actual current output dir instead of hardcoding "out"
    const OUTPUT_DIR = getCurrentOutputPath() || 'out';

    const filesToDelete = [
        `src/frontend/scss/pages/${camelName}.scss`,
        `src/frontend/js/pages/${camelName}.js`,
        `src/frontend/_routes/${pageName}.njk`,
        path.join(OUTPUT_DIR, 'js/pages',  `${camelName}.js`),
        path.join(OUTPUT_DIR, 'css/pages', `${camelName}.css`),
        path.join(OUTPUT_DIR, `${pageName}.html`),
        path.join(OUTPUT_DIR, 'pages', `${pageName}.html`),
    ];

    const foldersToDelete = [
        path.join(OUTPUT_DIR, pageName),
        path.join(OUTPUT_DIR, 'pages', pageName),
    ];

    filesToDelete.forEach(f => {
        if (fileSystem.existsSync(f)) {
            fileSystem.unlinkSync(f);
            console.log(`[deleted file] ${f}`);
        }
    });

    foldersToDelete.forEach(folder => {
        if (fileSystem.existsSync(folder)) {
            fileSystem.rmSync(folder, { recursive: true, force: true });
            console.log(`[deleted folder] ${folder}`);
        }
    });

    removeLayout(pageName);
    removeSiteData(pageName);
}

module.exports = { addPage, removePage, renamePage };