const fs = require('fs');
const path = require('path');

const { PATHS } = require('./constants');
const { toCamelCase, isTypeScriptProject } = require('./utils');
const { addSiteData, removeSiteData, renameSiteData } = require('./updateData');
const { addPageBlock, removePageBlock, renamePageBlock } = require('./pageComponents');
const { getCurrentOutputPath } = require('./updateOutputPath');

function getPageArtifacts(pageName) {
    const camelName  = toCamelCase(pageName);
    const usesTs     = isTypeScriptProject();
    const scriptDir  = usesTs ? PATHS.tsPages : PATHS.jsPages;
    const scriptExt  = usesTs ? 'ts' : 'js';
    const outputRoot = path.join(PATHS.root, getCurrentOutputPath() || 'out');

    return {
        camelName,
        source: {
            scss:   path.join(PATHS.scssPages, `${camelName}.scss`),
            script: path.join(scriptDir, `${camelName}.${scriptExt}`),
            route:  path.join(PATHS.routes, `${pageName}.njk`),
        },
        output: {
            files: [
                path.join(outputRoot, 'js', 'pages',  `${camelName}.js`),
                path.join(outputRoot, 'css', 'pages', `${camelName}.css`),
                path.join(outputRoot, `${pageName}.html`),
                path.join(outputRoot, 'pages', `${pageName}.html`),
            ],
            folders: [
                path.join(outputRoot, pageName),
                path.join(outputRoot, 'pages', pageName),
            ],
        },
    };
}

function pageExists(pageName) {
    return fs.existsSync(path.join(PATHS.routes, `${pageName}.njk`));
}

function applyRouteFrontMatter(filePath, camelName, pageName) {
    const content = fs.readFileSync(filePath, 'utf8')
        .replace(/^title:.*$/m,     `title: "${camelName}"`)
        .replace(/^permalink:.*$/m, `permalink: "/${pageName}/"`);
    fs.writeFileSync(filePath, content);
}

function addPage(pageName) {
    if (pageExists(pageName)) {
        console.log(`[skip] page "${pageName}" already exists`);
        return;
    }

    const { camelName, source } = getPageArtifacts(pageName);
    const usesTs = isTypeScriptProject();

    const creations = [
        { dest: source.scss,   template: 'template.scss',                       isRoute: false },
        { dest: source.script, template: usesTs ? 'template.ts' : 'template.js', isRoute: false },
        { dest: source.route,  template: 'template.njk',                        isRoute: true  },
    ];

    try {
        creations.forEach(({ dest, template, isRoute }) => {
            const templatePath = path.join(PATHS.templates, template);
            if (!fs.existsSync(templatePath)) {
                console.log(`[skip] template not found: ${templatePath}`);
                return;
            }

            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(templatePath, dest);
            if (isRoute) applyRouteFrontMatter(dest, camelName, pageName);

            console.log(`[created] ${dest}`);
        });
    } catch (err) {
        console.log(`[error] could not create page files: ${err.message}`);
        return;
    }

    addPageBlock(pageName);
    addSiteData(pageName);
}

function renamePage(oldName, newName) {
    if (!pageExists(oldName)) {
        console.log(`[skip] page "${oldName}" does not exist`);
        return;
    }
    if (pageExists(newName)) {
        console.log(`[skip] target page "${newName}" already exists`);
        return;
    }

    const oldArtifacts = getPageArtifacts(oldName);
    const newArtifacts = getPageArtifacts(newName);

    const moves = [
        { src: oldArtifacts.source.scss,   dest: newArtifacts.source.scss   },
        { src: oldArtifacts.source.script, dest: newArtifacts.source.script },
        { src: oldArtifacts.source.route,  dest: newArtifacts.source.route  },
    ];

    try {
        moves.forEach(({ src, dest }) => {
            if (!fs.existsSync(src)) {
                console.log(`[skip] not found: ${src}`);
                return;
            }
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.renameSync(src, dest);
            console.log(`[renamed] ${src} → ${dest}`);

            if (dest.endsWith('.njk')) applyRouteFrontMatter(dest, newArtifacts.camelName, newName);
        });
    } catch (err) {
        console.log(`[error] could not rename page files: ${err.message}`);
        return;
    }

    renamePageBlock(oldName, newName);
    renameSiteData(oldName, newName);
}

function removePage(pageName) {
    if (!pageExists(pageName)) {
        console.log(`[skip] page "${pageName}" does not exist`);
    }

    const { source, output } = getPageArtifacts(pageName);
    const filesToDelete = [source.scss, source.script, source.route, ...output.files];

    filesToDelete.forEach((file) => {
        try {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
                console.log(`[deleted] ${file}`);
            }
        } catch (err) {
            console.log(`[error] ${file}: ${err.message}`);
        }
    });

    output.folders.forEach((folder) => {
        try {
            if (fs.existsSync(folder)) {
                fs.rmSync(folder, { recursive: true, force: true });
                console.log(`[deleted] ${folder}`);
            }
        } catch (err) {
            console.log(`[error] ${folder}: ${err.message}`);
        }
    });

    removePageBlock(pageName);
    removeSiteData(pageName);
}

module.exports = { addPage, removePage, renamePage, pageExists };