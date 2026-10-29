export interface PageNames {
    pageClassName: string;
    constantKey: string;
}

export function createPageNames(rawName: string): PageNames {
    const words =
        rawName
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .match(/[A-Za-z0-9]+/g) ?? [];

    if (words.length === 0) {
        throw new Error(
            'El nombre debe contener al menos una letra o un número.',
        );
    }

    const pascalName = words
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase(),
        )
        .join('');

    // Evita identificadores de clase que comiencen por un número.
    const classBase = /^\d/.test(pascalName)
        ? `Page${pascalName}`
        : pascalName;

    // Evita añadir Page dos veces cuando el nombre ya termina así.
    const pageClassName = classBase.endsWith('Page')
        ? classBase
        : `${classBase}Page`;

    let constantKey = words
        .map((word) => word.toUpperCase())
        .join('_');

    // Los accesos TEXT_BASE.KEY deben tener un identificador válido.
    if (!/^[A-Z_$]/.test(constantKey)) {
        constantKey = `PAGE_${constantKey}`;
    }

    return {
        pageClassName,
        constantKey,
    };
}