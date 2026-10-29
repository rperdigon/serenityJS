import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Project, SyntaxKind } from 'ts-morph';

interface ProjectPaths {
    constantsFilePath: string;
    pagesDirectoryPath: string;
    pageFactoryPath: string;
}

interface GeneratePageInput {
    pageClassName: string;
    constantKey: string;
    constantValue: string;
    selector: string;
}

interface FileChange {
    filePath: string;
    content: string;
    replaceExisting: boolean;
}

interface StagedFile extends FileChange {
    temporaryPath: string;
    backupPath: string;
}

async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch (error: unknown) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return false;
        }

        throw error;
    }
}

async function assertFileExists(
    filePath: string,
    description: string,
): Promise<void> {
    if (!(await fileExists(filePath))) {
        throw new Error(
            `No se encuentra ${description}: ${filePath}`,
        );
    }
}

/**
 * Guarda varios archivos con copias temporales y recuperación
 * ante errores de escritura. No constituye una transacción de
 * sistema de archivos resistente a cualquier caída del proceso.
 */
async function commitFiles(changes: FileChange[]): Promise<void> {
    const token = randomUUID();

    const staged: StagedFile[] = changes.map((change, index) => ({
        ...change,
        temporaryPath: `${change.filePath}.tmp-${token}-${index}`,
        backupPath: `${change.filePath}.bak-${token}-${index}`,
    }));

    const backedUp: StagedFile[] = [];
    const installed: StagedFile[] = [];

    try {
        // Primero se preparan todas las versiones nuevas.
        for (const file of staged) {
            await fs.writeFile(
                file.temporaryPath,
                file.content,
                { encoding: 'utf8', flag: 'wx' },
            );
        }

        // Se conservan los archivos originales antes de reemplazarlos.
        for (const file of staged) {
            if (file.replaceExisting) {
                await fs.rename(file.filePath, file.backupPath);
                backedUp.push(file);
            }
        }

        // Se instalan las nuevas versiones.
        for (const file of staged) {
            await fs.rename(file.temporaryPath, file.filePath);
            installed.push(file);
        }
    } catch (error: unknown) {
        const rollbackErrors: string[] = [];

        // Retira las versiones nuevas que llegaron a instalarse.
        for (const file of [...installed].reverse()) {
            try {
                await fs.rm(file.filePath, { force: true });
            } catch (rollbackError: unknown) {
                rollbackErrors.push(
                    `${file.filePath}: ${String(rollbackError)}`,
                );
            }
        }

        // Restaura las versiones originales.
        for (const file of [...backedUp].reverse()) {
            try {
                await fs.rename(file.backupPath, file.filePath);
            } catch (rollbackError: unknown) {
                rollbackErrors.push(
                    `${file.backupPath}: ${String(rollbackError)}`,
                );
            }
        }

        for (const file of staged) {
            await fs.rm(file.temporaryPath, { force: true }).catch(
                () => undefined,
            );
        }

        const originalMessage =
            error instanceof Error ? error.message : String(error);

        if (rollbackErrors.length > 0) {
            throw new Error(
                `Falló la escritura y la recuperación no fue completa. ` +
                `Error original: ${originalMessage}. ` +
                `Errores de recuperación: ${rollbackErrors.join('; ')}`,
            );
        }

        throw error;
    }

    // Un fallo al eliminar una copia de seguridad no invalida
    // los archivos que ya se han instalado correctamente.
    for (const file of backedUp) {
        try {
            await fs.rm(file.backupPath, { force: true });
        } catch (error: unknown) {
            console.warn(
                `⚠️ No se pudo eliminar la copia temporal ${file.backupPath}: ` +
                `${String(error)}`,
            );
        }
    }
}

export class PageScaffoldGenerator {
    constructor(private readonly paths: ProjectPaths) { }

    async generate(input: GeneratePageInput): Promise<void> {
        const {
            constantsFilePath,
            pagesDirectoryPath,
            pageFactoryPath,
        } = this.paths;

        const pageFilePath = path.join(
            pagesDirectoryPath,
            `${input.pageClassName}.ts`,
        );

        // 1. Comprobar los archivos base antes de modificar nada.
        await assertFileExists(
            constantsFilePath,
            'el archivo de constantes',
        );

        await assertFileExists(
            pageFactoryPath,
            'PageFactory.ts',
        );

        // 2. Leer TypeScript mediante su AST.
        const project = new Project({
            skipAddingFilesFromTsConfig: true,
        });

        const constantsSource =
            project.addSourceFileAtPath(constantsFilePath);

        const factorySource =
            project.addSourceFileAtPath(pageFactoryPath);

        const declaration =
            constantsSource.getVariableDeclaration('TEXT_BASE');

        const initializer = declaration?.getInitializer();

        const constantsObject = initializer
            ?.asKind(SyntaxKind.AsExpression)
            ?.getExpression()
            .asKind(SyntaxKind.ObjectLiteralExpression);

        if (!constantsObject) {
            throw new Error(
                'No se ha encontrado TEXT_BASE como objeto TypeScript ' +
                'con la estructura esperada.',
            );
        }

        const factoryClass = factorySource.getClass('PageFactory');

        if (!factoryClass) {
            throw new Error(
                'No se ha encontrado la clase PageFactory.',
            );
        }

        // 3. Detectar posibles inconsistencias antes de editar.
        const hasConstant =
            constantsObject.getProperty(input.constantKey) !== undefined;

        const hasPageFile = await fileExists(pageFilePath);

        const pageImportDeclaration =
            factorySource.getImportDeclarations().find((declaration) =>
                declaration.getNamedImports().some(
                    (specifier) =>
                        specifier.getName() === input.pageClassName,
                ),
            );

        const expectedModule = `../${input.pageClassName}`;

        const hasPageImport = Boolean(
            pageImportDeclaration &&
            pageImportDeclaration.getModuleSpecifierValue() ===
            expectedModule,
        );

        if (pageImportDeclaration && !hasPageImport) {
            throw new Error(
                `Ya existe un import con el nombre ${input.pageClassName}, ` +
                'pero apunta a otra ruta. No se han modificado los archivos.',
            );
        }

        const normalizeCode = (code: string | undefined): string =>
            (code ?? '').replace(/\s+/g, '');

        const registrationCalls = factorySource
            .getDescendantsOfKind(SyntaxKind.CallExpression)
            .filter((call) => {
                const isMapRegistration =
                    normalizeCode(call.getExpression().getText()) ===
                    'PageFactory.pageMap.set';

                const usesConstant =
                    normalizeCode(
                        call.getArguments()[0]?.getText(),
                    ) === `TEXT_BASE.${input.constantKey}`;

                return isMapRegistration && usesConstant;
            });

        if (registrationCalls.length > 1) {
            throw new Error(
                `La constante ${input.constantKey} tiene varios registros ` +
                'en PageFactory. No se ha modificado ningún archivo.',
            );
        }

        const registrationCall = registrationCalls[0];

        const hasRegistration = Boolean(
            registrationCall &&
            normalizeCode(
                registrationCall.getArguments()[1]?.getText(),
            ) === `new${input.pageClassName}()`,
        );

        if (registrationCall && !hasRegistration) {
            throw new Error(
                `La constante ${input.constantKey} ya está asociada ` +
                'a otra página en PageFactory.',
            );
        }

        const existingState = {
            constant: hasConstant,
            pageFile: hasPageFile,
            pageImport: hasPageImport,
            registration: hasRegistration,
        };

        const completed = Object.values(existingState).every(Boolean);
        const hasAnyExistingPart =
            Object.values(existingState).some(Boolean);

        if (completed) {
            console.log(
                `ℹ️ ${input.pageClassName} ya está creada y registrada. ` +
                'No se han realizado cambios.',
            );
            return;
        }

        if (hasAnyExistingPart) {
            const existingParts = Object.entries(existingState)
                .filter(([, exists]) => exists)
                .map(([name]) => name)
                .join(', ');

            throw new Error(
                `Se ha detectado una generación incompleta. ` +
                `Elementos existentes: ${existingParts}. ` +
                'No se han modificado los archivos. ' +
                'Revisa el estado del proyecto antes de continuar.',
            );
        }

        // 4. Validar el resto de las estructuras requeridas.
        const hasTextBaseImport = factorySource
            .getImportDeclarations()
            .some((declaration) =>
                declaration.getNamedImports().some(
                    (specifier) => specifier.getName() === 'TEXT_BASE',
                ),
            );

        if (!hasTextBaseImport) {
            throw new Error(
                'PageFactory no contiene el import nombrado de TEXT_BASE.',
            );
        }

        const staticBlock = factoryClass.getStaticBlocks()[0];

        if (!staticBlock) {
            throw new Error(
                'No se ha encontrado un bloque estático en PageFactory.',
            );
        }

        // 5. Preparar los cambios en memoria.
        constantsObject.addPropertyAssignment({
            name: input.constantKey,
            initializer: JSON.stringify(input.constantValue),
        });

        factorySource.addImportDeclaration({
            namedImports: [input.pageClassName],
            moduleSpecifier: expectedModule,
        });

        staticBlock.addStatements(
            `PageFactory.pageMap.set(` +
            `TEXT_BASE.${input.constantKey}, ` +
            `new ${input.pageClassName}()` +
            `);`,
        );

        // JSON.stringify evita que comillas o saltos de línea
        // introducidos en el selector rompan el código generado.
        const pageContent = `import { TEXT_BASE } from '../Constants';
import { AbstractPage } from './factory/AbstractPage';

export class ${input.pageClassName} extends AbstractPage {
    constructor() {
        super({
            [TEXT_BASE.${input.constantKey}]: ${JSON.stringify(input.selector)},
        });
    }
}
`;

        const pageSource = project.createSourceFile(
            pageFilePath,
            pageContent,
            { overwrite: false },
        );

        await fs.mkdir(pagesDirectoryPath, { recursive: true });

        // 6. Instalar los tres cambios solo después de completar
        // todas las comprobaciones.
        await commitFiles([
            {
                filePath: constantsFilePath,
                content: constantsSource.getFullText(),
                replaceExisting: true,
            },
            {
                filePath: pageFactoryPath,
                content: factorySource.getFullText(),
                replaceExisting: true,
            },
            {
                filePath: pageFilePath,
                content: pageSource.getFullText(),
                replaceExisting: false,
            },
        ]);

        console.log('\n✨ Generación completada correctamente.');
        console.log(`   Constante: ${input.constantKey}`);
        console.log(`   Página: ${pageFilePath}`);
        console.log(`   Factory: ${pageFactoryPath}`);
    }
}