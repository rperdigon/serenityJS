import * as fs from 'fs';
import * as path from 'path';
import { stdin as input, stdout as output } from 'process';
import * as readline from 'readline/promises';

const CONSTANTS_FILE_PATH = path.resolve(__dirname, '../test/Constants.ts');
const PAGES_DIR_PATH = path.resolve(__dirname, '../test/pages');
const PAGE_FACTORY_PATH = path.resolve(__dirname, '../test/pages/factory/PageFactory.ts');

async function promptUser() {
    const rl = readline.createInterface({ input, output });

    try {
        console.log('\n--- 🛠️ Serenity/JS Page, Constant & Factory Generator ---');

        // 1. Datos para la constante y la página
        const pageNameInput = await rl.question('¿Qué nombre tendrá la página? (ej: Home, User Profile, Checkout): ');
        const pageNameRaw = pageNameInput.trim();

        if (!pageNameRaw) {
            console.error('❌ Error: El nombre de la página no puede estar vacío.');
            return;
        }

        // Transformar espacios a UPPER_SNAKE_CASE para la constante (ej: "User Profile" -> "USER_PROFILE")
        const formattedConstantKey = pageNameRaw.toUpperCase().replace(/\s+/g, '_');

        // Transformar espacios a PascalCase sin espacios para la clase y el fichero (ej: "User Profile" -> "UserProfile")
        const capitalizedClassName = pageNameRaw
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        const constantValueInput = await rl.question(`¿Qué texto mostrará la constante ${formattedConstantKey}? (ej: Login): `);
        const constantValue = constantValueInput.trim();

        // 2. Datos para el selector de la Page
        const selectorInput = await rl.question(`¿Qué selector CSS/XPath tendrá el elemento principal para ${capitalizedClassName}Page? (ej: #login, .dashboard-form): `);
        const selectorValue = selectorInput.trim();

        if (!constantValue || !selectorValue) {
            console.error('❌ Error: Todos los campos son obligatorios.');
            return;
        }

        // Ejecutar acciones encadenadas
        insertConstant(formattedConstantKey, constantValue);
        generatePageFile(capitalizedClassName, formattedConstantKey, selectorValue);
        updatePageFactory(capitalizedClassName, formattedConstantKey);

    } catch (error) {
        console.error('❌ Ocurrió un error al procesar la entrada:', error);
    } finally {
        rl.close();
    }
}

function insertConstant(key: string, value: string) {
    if (!fs.existsSync(CONSTANTS_FILE_PATH)) {
        console.error(`❌ No se encuentra el fichero de constantes en: ${CONSTANTS_FILE_PATH}`);
        return;
    }

    let fileContent = fs.readFileSync(CONSTANTS_FILE_PATH, 'utf-8');

    if (fileContent.includes(`${key}:`)) {
        console.warn(`⚠️ La constante '${key}' ya existía en Constants.ts, omitiendo inserción.`);
        return;
    }

    const targetPattern = /export const TEXT_BASE = \{([^]*?)\}\s*as const;/;
    const match = fileContent.match(targetPattern);

    if (!match) {
        console.error('❌ No se pudo encontrar la estructura de `TEXT_BASE` en el fichero Constants.ts');
        return;
    }

    const innerContent = match[1];
    const newEntry = `    ${key}: "${value}",\n`;
    const updatedInnerContent = innerContent + newEntry;

    fileContent = fileContent.replace(
        targetPattern,
        `export const TEXT_BASE = {${updatedInnerContent}} as const;`
    );

    fs.writeFileSync(CONSTANTS_FILE_PATH, fileContent, 'utf-8');
    console.log(`✨ Constante '${key}' añadida en test/Constants.ts`);
}

function generatePageFile(capitalizedClassName: string, constantKey: string, selector: string) {
    const fileName = `${capitalizedClassName}Page.ts`;
    const fullFilePath = path.join(PAGES_DIR_PATH, fileName);

    if (fs.existsSync(fullFilePath)) {
        console.warn(`⚠️ El fichero ${fileName} ya existe en test/pages/. No se ha sobrescrito.`);
        return;
    }

    const fileContent = `import { TEXT_BASE } from '../Constants';
import { AbstractPage } from './factory/AbstractPage';

export class ${capitalizedClassName}Page extends AbstractPage {
    constructor() {
        super({
            // Element mapping for ${capitalizedClassName}
            [TEXT_BASE.${constantKey}]: '${selector}',
        });
    }
}
`;

    if (!fs.existsSync(PAGES_DIR_PATH)) {
        fs.mkdirSync(PAGES_DIR_PATH, { recursive: true });
    }

    fs.writeFileSync(fullFilePath, fileContent, 'utf-8');
    console.log(`✨ Clase creada con éxito en: test/pages/${fileName}`);
}

function updatePageFactory(capitalizedClassName: string, constantKey: string) {
    if (!fs.existsSync(PAGE_FACTORY_PATH)) {
        console.error(`❌ No se encuentra PageFactory en: ${PAGE_FACTORY_PATH}`);
        return;
    }

    let factoryContent = fs.readFileSync(PAGE_FACTORY_PATH, 'utf-8');
    const importStatement = `import { ${capitalizedClassName}Page } from '../${capitalizedClassName}Page';`;
    const registrationLine = `        PageFactory.pageMap.set(TEXT_BASE.${constantKey}, new ${capitalizedClassName}Page());`;

    if (factoryContent.includes(importStatement)) {
        console.warn(`⚠️ La página '${capitalizedClassName}Page' ya está registrada en PageFactory.ts`);
        return;
    }

    const abstractPageImportRegex = /import \{ AbstractPage \} from '\.\/AbstractPage';/;
    if (!abstractPageImportRegex.test(factoryContent)) {
        console.error('❌ No se pudo encontrar la referencia de importación de AbstractPage en PageFactory.ts');
        return;
    }
    factoryContent = factoryContent.replace(
        abstractPageImportRegex,
        `${importStatement}\nimport { AbstractPage } from './AbstractPage';`
    );

    const staticBlockRegex = /(static\s*\{[^]*?)(\n\s*\})/s;
    const match = factoryContent.match(staticBlockRegex);

    if (!match) {
        console.error('❌ No se pudo localizar el bloque estático en PageFactory.ts');
        return;
    }

    const blockBody = match[1];
    const blockEnd = match[2];
    const updatedBlockBody = blockBody + `\n${registrationLine}`;

    factoryContent = factoryContent.replace(
        staticBlockRegex,
        `${updatedBlockBody}${blockEnd}`
    );

    fs.writeFileSync(PAGE_FACTORY_PATH, factoryContent, 'utf-8');
    console.log(`✨ PageFactory.ts actualizada con la importación y el registro de ${capitalizedClassName}Page`);
}

promptUser();