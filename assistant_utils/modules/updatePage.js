const fileSystem = require("fs");
const path = require("path");

const { addSiteData, removeSiteData } = require("./updateData");
const { addLayout, removeLayout } = require("./updateIncludes");

const TEMPLATE_FILE_PATH = path.join(__dirname, '..', 'res', 'templates.json');

/**
 * Converte kebab-case in camelCase gestendo anche i numeri.
 * Esempio: "mia-pagina-1" -> "miaPagina1"
 */
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
            // Usiamo camelName per il title in modo che base.njk trovi CSS/JS corretti
            processedContent = processedContent.replace(/^title:\s*.*$/m, `title: "${camelName}"`);
            
            // Permalink rimane kebab-case per URL puliti
            if (processedContent.includes('permalink:')) {
                processedContent = processedContent.replace(/^permalink:\s*.*$/m, `permalink: "/${kebabName}/"`);
            } else {
                processedContent = processedContent.replace(`title: "${camelName}"`, `title: "${camelName}"\npermalink: "/${kebabName}/"`);
            }
        }

        return processedContent;
    } catch (error) {
        console.error(`[errore] ${error.message}`);
        return "";
    }
}

function addPage(pageName) {
    const camelName = toCamelCase(pageName);
    
    const targets = [
        { folder: "src/scss/pages", extension: ".scss", fileName: camelName }, // camelCase
        { folder: "src/js/pages", extension: ".js", fileName: camelName },     // camelCase
        { folder: "src/pages", extension: ".njk", fileName: pageName },        // kebab-case
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

function removePage(pageName) {
    const camelName = toCamelCase(pageName);
    
    const filesToDelete = [
        `src/scss/pages/${camelName}.scss`,
        `src/js/pages/${camelName}.js`,
        `src/pages/${pageName}.njk`,
        `out/js/pages/${camelName}.js`,
        `out/css/pages/${camelName}.css`,
    ];

    const pageFolder = path.join("out", pageName);

    filesToDelete.forEach(f => { 
        if (fileSystem.existsSync(f)) {
            fileSystem.unlinkSync(f); 
            console.log(`[deleted] ${f}`);
        }
    });

    if (fileSystem.existsSync(pageFolder)) {
        fileSystem.rmSync(pageFolder, { recursive: true, force: true });
        console.log(`[deleted folder] ${pageFolder}`);
    }

    removeLayout(pageName);
    removeSiteData(pageName);
}

module.exports = { addPage, removePage };