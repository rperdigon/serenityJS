import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Ruta absoluta o relativa al fichero de constantes
const CONSTANTS_FILE_PATH = path.resolve(
    __dirname,
    '../test/Constants.ts'
);

async function promptUser() {
    const rl = readline.createInterface({ input, output });

    try {
        console.log('\n--- 🛠️ Serenity/JS Constant Generator ---');

        // Preguntar la clave y el valor
        const keyInput = await rl.question('¿Qué clave de constante deseas añadir? (ej: DASHBOARD_TITLE): ');
        const valueInput = await rl.question('¿Qué texto o valor tendrá esta constante?: ');

        const formattedKey = keyInput.trim().toUpperCase().replace(/\s+/g, '_');
        const formattedValue = valueInput.trim();

        if (!formattedKey || !formattedValue) {
            console.error('❌ Error: La clave y el valor no pueden estar vacíos.');
            return;
        }

        insertConstantToasts(formattedKey, formattedValue);

    } catch (error) {
        console.error('❌ Ocurrió un error al procesar la entrada:', error);
    } finally {
        rl.close();
    }
}

function insertConstantToasts(key: string, value: string) {
    if (!fs.existsSync(CONSTANTS_FILE_PATH)) {
        console.error(`❌ No se encuentra el fichero de constantes en: ${CONSTANTS_FILE_PATH}`);
        return;
    }

    let fileContent = fs.readFileSync(CONSTANTS_FILE_PATH, 'utf-8');

    // Comprobamos si ya existe la clave para evitar duplicados exactos
    if (fileContent.includes(`${key}:`)) {
        console.warn(`⚠️ La constante '${key}' ya existe en el fichero.`);
        return;
    }

    // Buscamos el cierre del objeto TEXT_BASE (o el bloque `} as const;`) para insertar antes
    // Buscamos la última ocurrencia de '}' antes de 'as const' o al final del bloque TEXT_BASE
    const targetPattern = /export const TEXT_BASE = \{([^]*?)\}\s*as const;/;
    const match = fileContent.match(targetPattern);

    if (!match) {
        console.error('❌ No se pudo encontrar la estructura de `TEXT_BASE` en el fichero Constants.ts');
        return;
    }

    const innerContent = match[1];
    // Añadimos la nueva línea con la indentación adecuada (4 espacios por convenio)
    const newEntry = `    ${key}: "${value}",\n`;
    const updatedInnerContent = innerContent + newEntry;

    // Reemplazamos en el contenido original
    fileContent = fileContent.replace(
        targetPattern,
        `export const TEXT_BASE = {${updatedInnerContent}} as const;`
    );

    fs.writeFileSync(CONSTANTS_FILE_PATH, fileContent, 'utf-8');
    console.log(`\n✨ ¡Constante añadida con éxito!`);
    console.log(`   ➡️  ${key}: "${value}" en ${path.relative(process.cwd(), CONSTANTS_FILE_PATH)}`);
}

promptUser();