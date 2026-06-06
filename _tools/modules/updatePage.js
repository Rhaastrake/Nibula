const fileSystem = require('fs');
const path = require('path');

const { addSiteData, removeSiteData, renameSiteData } = require('./updateData');
const { addLayout, removeLayout, renameLayout } = require('./updateIncludes');
const { getCurrentOutputPath } = require('./updateOutputPath');
const { toCamelCase, isTypeScriptProject } = require('./utils');

const TEMPLATES_DIR = path.join(__dirname, '..', 'res', 'templates');

function getPageTargets(pageName) {
    const camelName = toCamelCase(pageName);
    const usesTs    = isTypeScriptProject();

    return [
        {
            folder:       'src/frontend/scss/pages',
            templateFile: 'template.scss',
            fileName:     `${camelName}.scss`,
        },
        {
            folder:       usesTs ? 'src/frontend/ts/pages' : 'src/frontend/js/pages',
            templateFile: usesTs ? 'template.ts'           : 'template.js',
            fileName:     usesTs ? `${camelName}.ts`       : `${camelName}.js`,
        },
        {
            folder:       'src/frontend/_routes',
            templateFile: 'template.njk',
            fileName:     `${pageName}.njk`,
        },
    ];
}

function addPage(pageName) {
    const camelName = toCamelCase(pageName);

    getPageTargets(pageName).forEach(({ folder, templateFile, fileName }) => {
        const destPath = path.join(folder, fileName);
        fileSystem.mkdirSync(folder, { recursive: true });

        if (fileSystem.existsSync(destPath)) return;

        const srcPath = path.join(TEMPLATES_DIR, templateFile);

        if (templateFile === 'template.njk') {
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
    const usesTs   = isTypeScriptProject();
    const ext      = usesTs ? 'ts' : 'js';
    const jsFolder = usesTs ? 'src/frontend/ts/pages' : 'src/frontend/js/pages';

    const filesToRename = [
        { src: `src/frontend/scss/pages/${oldCamel}.scss`, dest: `src/frontend/scss/pages/${newCamel}.scss` },
        { src: `${jsFolder}/${oldCamel}.${ext}`,           dest: `${jsFolder}/${newCamel}.${ext}`           },
        { src: `src/frontend/_routes/${oldName}.njk`,      dest: `src/frontend/_routes/${newName}.njk`      },
    ];

    filesToRename.forEach(({ src, dest }) => {
        if (!fileSystem.existsSync(src)) {
            console.log(`[skip] not found: ${src}`);
            return;
        }
        
        fileSystem.renameSync(src, dest);
        console.log(`[renamed] ${src} → ${dest}`);

        if (dest.endsWith('.njk')) {
            const content = fileSystem.readFileSync(dest, 'utf8')
                .replace(/^title:.*$/m,     `title: "${newCamel}"`)
                .replace(/^permalink:.*$/m, `permalink: "/${newName}/"`);
            fileSystem.writeFileSync(dest, content);
        }
    });

    renameLayout(oldName, newName);
    renameSiteData(oldName, newName);
}

function removePage(pageName) {
    const camelName  = toCamelCase(pageName);
    const usesTs     = isTypeScriptProject();
    const ext        = usesTs ? 'ts' : 'js';
    const jsFolder   = usesTs ? 'src/frontend/ts/pages' : 'src/frontend/js/pages';
    const OUTPUT_DIR = getCurrentOutputPath() || 'out';

    const filesToDelete = [
        `src/frontend/scss/pages/${camelName}.scss`,
        `${jsFolder}/${camelName}.${ext}`,
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