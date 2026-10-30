export interface PageNames {
    pageClassName: string;
    constantKey: string;
}

export function createPageNames(rawName: string): PageNames {
    const cleaned = rawName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

    const words = cleaned.match(/[A-Za-z0-9]+/g) ?? [];

    if (words.length === 0) {
        throw new Error(
            'El nombre debe contener al menos una letra o un número.',
        );
    }

    const pascalWords = words.map(
        (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1).toLowerCase(),
    );

    const pascalName = pascalWords.join('');

    // Evita identificadores de clase que comiencen por un número.
    const classBase = /^\d/.test(pascalName)
        ? `Page${pascalName}`
        : pascalName;

    // Evita añadir Page dos veces cuando el nombre ya termina así.
    const pageClassName = classBase.endsWith('Page')
        ? classBase
        : `${classBase}Page`;

    // Si el usuario especificó "Page" al final de un nombre compuesto,
    // se omite en la clave de constante (ej: LoginPage -> LOGIN).
    const constantWords =
        words.length > 1 && words[words.length - 1].toLowerCase() === 'page'
            ? words.slice(0, -1)
            : words;

    let constantKey = constantWords
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