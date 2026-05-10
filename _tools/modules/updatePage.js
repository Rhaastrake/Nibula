const fileSystem = require("fs");
const path = require("path");

const { addSiteData, removeSiteData } = require("./updateData");
const { addLayout, removeLayout } = require("./updateIncludes");

const TEMPLATES_DIR = path.join(__dirname, '..', 'res', 'templates');

function toCamelCase(str) {
    return str.toLowerCase().replace(/[-_][a-z0-9]/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
}

function addPage(pageName) {
    const camelName = toCamelCase(pageName);

    const targets = [
        { folder: "src/scss/pages", templateFile: "template.scss", fileName: `${camelName}.scss` },
        { folder: "src/js/pages",   templateFile: "template.js",   fileName: `${camelName}.js`   },
        { folder: "src/_routes",    templateFile: "template.njk",  fileName: `${pageName}.njk`   },
    ];

    targets.forEach(({ folder, templateFile, fileName }) => {
        const destPath = path.join(folder, fileName);
        fileSystem.mkdirSync(folder, { recursive: true });

        if (!fileSystem.existsSync(destPath)) {
            const srcPath = path.join(TEMPLATES_DIR, templateFile);

            if (templateFile === "template.njk") {
                let content = fileSystem.readFileSync(srcPath, 'utf8');
                content = content
                    .replace(/^title:.*$/m, `title: "${camelName}"`)
                    .replace(/^permalink:.*$/m, `permalink: "/${pageName}/"`);
                fileSystem.writeFileSync(destPath, content);
            } else {
                fileSystem.copyFileSync(srcPath, destPath);
            }

            console.log(`[created file] ${destPath}`);
        }
    });

    addLayout(pageName);
    addSiteData(pageName);
}

function renamePage(oldName, newName) {
    const oldCamel = toCamelCase(oldName);
    const newCamel = toCamelCase(newName);

    const filesToRename = [
        { src: `src/scss/pages/${oldCamel}.scss`, dest: `src/scss/pages/${newCamel}.scss` },
        { src: `src/js/pages/${oldCamel}.js`,     dest: `src/js/pages/${newCamel}.js`     },
        { src: `src/_routes/${oldName}.njk`,      dest: `src/_routes/${newName}.njk`      },
    ];

    filesToRename.forEach(({ src, dest }) => {
        if (!fileSystem.existsSync(src)) {
            console.log(`[skip] not found: ${src}`);
            return;
        }
        fileSystem.renameSync(src, dest);
        console.log(`[renamed] ${src} → ${dest}`);
    });

    removeLayout(oldName);
    addLayout(newName);
    removeSiteData(oldName);
    addSiteData(newName);
}

function removePage(pageName) {
    const camelName = toCamelCase(pageName);
    const OUTPUT_DIR = "out";

    const filesToDelete = [
        `src/scss/pages/${camelName}.scss`,
        `src/js/pages/${camelName}.js`,
        `src/_routes/${pageName}.njk`,
        path.join(OUTPUT_DIR, "js/pages",  `${camelName}.js`),
        path.join(OUTPUT_DIR, "css/pages", `${camelName}.css`),
        path.join(OUTPUT_DIR, `${pageName}.html`),
        path.join(OUTPUT_DIR, "pages", `${pageName}.html`),
    ];

    const foldersToDelete = [
        path.join(OUTPUT_DIR, pageName),
        path.join(OUTPUT_DIR, "pages", pageName),
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