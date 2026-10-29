import * as path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';

import { createPageNames } from './page-naming';
import { PageScaffoldGenerator } from './page-scaffold-generator';

async function main(): Promise<void> {
    const rl = readline.createInterface({ input, output });
    const ask = (query: string): Promise<string> =>
        new Promise((resolve) => rl.question(query, resolve));

    try {
        console.log(
            '\n--- Serenity/JS Page, Constant & Factory Generator ---',
        );

        const pageName = (
            await ask('¿Qué nombre tendrá la página?: ')
        ).trim();

        if (!pageName) {
            throw new Error('El nombre de la página es obligatorio.');
        }

        const names = createPageNames(pageName);

        console.log(`\nClase: ${names.pageClassName}`);
        console.log(`Constante: ${names.constantKey}`);

        const constantValue = (
            await ask(
                `¿Qué texto mostrará ${names.constantKey}?: `,
            )
        ).trim();

        const selector = (
            await ask(
                `¿Qué selector CSS/XPath tendrá ${names.pageClassName}?: `,
            )
        ).trim();

        if (!constantValue || !selector) {
            throw new Error(
                'El texto de la constante y el selector son obligatorios.',
            );
        }

        const generator = new PageScaffoldGenerator({
            constantsFilePath: path.resolve(
                __dirname,
                '../test/Constants.ts',
            ),
            pagesDirectoryPath: path.resolve(
                __dirname,
                '../test/pages',
            ),
            pageFactoryPath: path.resolve(
                __dirname,
                '../test/pages/factory/PageFactory.ts',
            ),
        });

        await generator.generate({
            pageClassName: names.pageClassName,
            constantKey: names.constantKey,
            constantValue,
            selector,
        });
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : String(error);

        console.error(`\n❌ ${message}`);
        process.exitCode = 1;
    } finally {
        rl.close();
    }
}

void main();