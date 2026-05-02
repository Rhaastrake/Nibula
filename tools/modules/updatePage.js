const fileSystem = require("fs");
const path = require("path");

const { addSiteData, removeSiteData } = require("./updateData");
const { addLayout, removeLayout } = require("./updateIncludes");

const TEMPLATE_FILE_PATH = path.join(__dirname, '..', 'res', 'templates.json');

function toCamelCase(str) {
    return str.toLowerCase().replace(/[-_][a-z0-9]/g, (group) =>
        group.toUpperCase().replace('-', '').replace('_', '')
    );
}

function getFileInitialContent(pageName, extension) {   
    try {
        const rawData = fileSystem.readFileSync(TEMPLATE_FILE_PATH, "utf8");
        const templates = JSON.parse(rawData);
        let selectedTemplate = templates[extension];
        if (!selectedTemplate) return "";

        const content = Array.isArray(selectedTemplate) ? selectedTemplate.join("\n") : selectedTemplate;
        
        const kebabName = pageName; 
        const camelName = toCamelCase(pageName); 

        let processedContent = content
            .replace(/{{pageName}}/g, kebabName)
            .replace(/{{camelName}}/g, camelName);

        if (extension === '.njk') {
            processedContent = processedContent.replace(/^title:\s*.*$/m, `title: "${camelName}"`);
            
            if (processedContent.includes('permalink:')) {
                processedContent = processedContent.replace(/^permalink:\s*.*$/m, `permalink: "/${kebabName}/"`);
            } else {
                processedContent = processedContent.replace(`title: "${camelName}"`, `title: "${camelName}"\npermalink: "/${kebabName}/"`);
            }
        }

        return processedContent;
    } catch (error) {
        console.error(`[error] ${error.message}`);
        return "";
    }
}

function addPage(pageName) {
    const camelName = toCamelCase(pageName);
    
    const targets = [
        { folder: "src/scss/pages", extension: ".scss", fileName: camelName },
        { folder: "src/js/pages", extension: ".js", fileName: camelName },
        { folder: "src/_routes", extension: ".njk", fileName: pageName },
    ];

    targets.forEach((target) => {
        const filePath = path.join(target.folder, `${target.fileName}${target.extension}`);
        fileSystem.mkdirSync(target.folder, { recursive: true });
        
        if (!fileSystem.existsSync(filePath)) {
            const fileContent = getFileInitialContent(pageName, target.extension);
            fileSystem.writeFileSync(filePath, fileContent);
            console.log(`[created file] ${filePath}`);
        }
    });

    addLayout(pageName);
    addSiteData(pageName);
}

function renamePage(oldName, newName) {
    const oldCamel = toCamelCase(oldName);
    const newCamel = toCamelCase(newName);

    const filesToRename = [
        {
            src: `src/scss/pages/${oldCamel}.scss`,
            dest: `src/scss/pages/${newCamel}.scss`,
        },
        {
            src: `src/js/pages/${oldCamel}.js`,
            dest: `src/js/pages/${newCamel}.js`,
        },
        {
            src: `src/_routes/${oldName}.njk`,
            dest: `src/_routes/${newName}.njk`,
        },
    ];

    filesToRename.forEach(({ src, dest }) => {
        if (!fileSystem.existsSync(src)) {
            console.log(`[skip] not found: ${src}`);
            return;
        }
        let content = fileSystem.readFileSync(src, 'utf8');
        content = content
            .replace(new RegExp(oldName, 'g'), newName)
            .replace(new RegExp(oldCamel, 'g'), newCamel);
        fileSystem.writeFileSync(dest, content);
        fileSystem.unlinkSync(src);
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
        
        path.join(OUTPUT_DIR, "js/pages", `${camelName}.js`),
        path.join(OUTPUT_DIR, "css/pages", `${camelName}.css`),
        
        path.join(OUTPUT_DIR, `${pageName}.html`),
        path.join(OUTPUT_DIR, "pages", `${pageName}.html`) 
    ];

    const foldersToDelete = [
        path.join(OUTPUT_DIR, pageName),
        path.join(OUTPUT_DIR, "pages", pageName)
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