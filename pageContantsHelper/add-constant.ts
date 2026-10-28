import * as fs from 'fs';
import * as path from 'path';
import { stdin as input, stdout as output } from 'process';
import * as readline from 'readline/promises';

// Ruta absoluta o relativa al fichero de constantes
const CONSTANTS_FILE_PATH = path.resolve(
    __dirname,
    '../test/Constants.ts'
);

async function promptUser() {
    const rl = readline.createInterface({ input, output });

    try {
        console.log('\n--- 🛠️ Serenity/JS Constant Generator ---');

        // Ask for the key and value
        const keyInput = await rl.question('What constant key do you want to add? (e.g., DASHBOARD_TITLE): ');
        const valueInput = await rl.question('What text or value will this constant have?: ');
        const formattedKey = keyInput.trim().toUpperCase().replace(/\s+/g, '_');
        const formattedValue = valueInput.trim();

        if (!formattedKey || !formattedValue) {
            console.error('❌ Error: Key and value cannot be empty.');
            return;
        }

        insertConstantToasts(formattedKey, formattedValue);

    } catch (error) {
        console.error('❌ An error occurred while processing the input:', error);
    } finally {
        rl.close();
    }
}

function insertConstantToasts(key: string, value: string) {
    if (!fs.existsSync(CONSTANTS_FILE_PATH)) {
        console.error(`❌ The constants file could not be found at: ${CONSTANTS_FILE_PATH}`);
        return;
    }

    let fileContent = fs.readFileSync(CONSTANTS_FILE_PATH, 'utf-8');

    // Comprobamos si ya existe la clave para evitar duplicados exactos
    if (fileContent.includes(`${key}:`)) {
        console.warn(`⚠️ The constant '${key}' already exists in the file.`);
        return;
    }

    // We look for the closing of the TEXT_BASE object (or the `} as const;` block) in order to insert before it
    // We search for the last occurrence of '}' before 'as const' or at the end of the TEXT_BASE block
    const targetPattern = /export const TEXT_BASE = \{([^]*?)\}\s*as const;/;
    const match = fileContent.match(targetPattern);

    if (!match) {
        console.error('❌ Could not find the `TEXT_BASE` structure in the Constants.ts file');
        return;
    }

    const innerContent = match[1];
    // We add the new line with the appropriate indentation (4 spaces by convention)
    const newEntry = `    ${key}: "${value}",\n`;
    const updatedInnerContent = innerContent + newEntry;

    // We replace it in the original content
    fileContent = fileContent.replace(
        targetPattern,
        `export const TEXT_BASE = {${updatedInnerContent}} as const;`
    );

    fs.writeFileSync(CONSTANTS_FILE_PATH, fileContent, 'utf-8');
    console.log(`\n✨ Constant added successfully!`);
    console.log(`   ➡️  ${key}: "${value}" in ${path.relative(process.cwd(), CONSTANTS_FILE_PATH)}`);
}

promptUser();