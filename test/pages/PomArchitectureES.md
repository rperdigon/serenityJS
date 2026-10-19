# Arquitectura POM con Factory — Guía intuitiva

> **POM** = Page Object Model. Un patrón de diseño que separa *dónde están los elementos* de *qué hace el test con ellos*.

---

## ¿Por qué POM?

Sin POM, cada test sabe demasiado:

```ts
// ❌ Sin POM: el test busca el elemento él mismo
await page.locator('#username').fill('admin');
await page.locator('#password').fill('1234');
await page.locator('button[type="submit"]').click();
```

Si el día de mañana el botón cambia de selector, tendrías que buscarlo en **cada test** que lo usa.

Con POM, el test solo dice *qué quiere hacer*, y la página sabe *cómo encontrar el elemento*:

```ts
// ✅ Con POM: el test habla en negocio, no en HTML
actor.attemptsTo(
    Authenticate.using('admin', '1234')
)
```

---

## La metáfora del restaurante

Piensa en el sistema como un restaurante:

| Restaurante         | Este proyecto                  |
|---------------------|-------------------------------|
| **El camarero**     | Step definition (Cucumber)    |
| **El maitre**       | `PageFactory`                 |
| **La sala/mesa**    | `LoginPage`, `HomePage`...    |
| **La carta**        | Los locators registrados      |
| **La cocina**       | Serenity-JS + Playwright       |

El camarero **no va a la cocina** a buscar los ingredientes. Le dice al maitre qué mesa está activa, y la mesa sabe qué platos (elementos) ofrece.

---

## Estructura de carpetas

```
test/pages/
│
├── factory/
│   ├── AbstractPage.ts     ← La plantilla base de toda página
│   ├── PageFactory.ts      ← El maitre: gestiona qué página está activa
│   └── SelectorFactory.ts  ← El contrato: toda página debe saber buscar elementos
│
├── LoginPage.ts            ← Página concreta: registra sus propios locators
├── HomePage.ts             ← (ejemplo de nueva página)
│
└── PomArchitecture.md      ← Este archivo
```

---

## El flujo completo, paso a paso

```
Feature .feature
    │
    │  "Given actor starts with the Login example"
    ▼
Step Definition  (the-internet.steps.ts)
    │
    │  SetCurrentPage.to('Login')   ← activa la página por STRING
    ▼
PageFactory
    │
    │  pageMap.get('Login') → instancia de LoginPage
    │  currentPage = LoginPage
    ▼
Authenticate.using(user, pass)
    │
    │  PageFactory.getCurrentPage().getElement('usernameField')
    ▼
AbstractPage  (LoginPage hereda de aquí)
    │
    │  locators.get('usernameField')
    │  → { element: PageElement.located(By.css('#username')) }
    ▼
Serenity-JS + Playwright
    │
    │  Busca #username en el DOM del navegador
    │  Escribe el valor
    ▼
✅ Test ejecutado
```

---

## Cómo funciona cada pieza

### 1. `LoginPage.ts` — El menú de una página

Aquí **solo declaras** qué elementos hay en la página y cómo encontrarlos.
No hay lógica. Solo nombres y selectores.

```ts
export class LoginPage extends AbstractPage {
    constructor() {
        super({
            ['usernameField']: '#username',            // CSS selector
            ['passwordField']: '#password',            // CSS selector
            ['loginButton']:   'button[type="submit"]' // CSS selector
        });
    }
}
```

La clave es que el **nombre** (`'usernameField'`) es un string libre que tú eliges.
Ese mismo string es el que usarás después para pedir el elemento.

> 💡 También puedes usar XPath. `AbstractPage` lo detecta automáticamente:
> - Empieza por `//` o `/` → XPath
> - Cualquier otra cosa → CSS

---

### 2. `AbstractPage.ts` — El traductor

Recibe el par `nombre → selector` y lo convierte en un `PageElement` de Serenity-JS.

```
'#username'  (string)
     ↓  By.css('#username')          ← Serenity crea un descriptor de búsqueda
     ↓  PageElement.located(...)     ← Objeto LAZY: aún no toca el DOM
     ↓  Guardado en un Map interno
```

**Importante — lazy loading**: `PageElement.located()` **no busca nada** en el navegador
al crearse. Solo describe *cómo encontrar* el elemento cuando llegue el momento.
Playwright lo busca en el DOM únicamente cuando el actor ejecuta una acción (`Click`, `Enter`, etc.).

---

### 3. `PageFactory.ts` — El maitre

Mantiene un registro de todas las páginas disponibles y sabe cuál está activa.

```ts
// Registro de páginas disponibles (una vez, al arrancar)
static {
    PageFactory.pageMap.set('Login', new LoginPage());
    PageFactory.pageMap.set('Home',  new HomePage());
}
```

```ts
// Activar una página (desde el step definition)
PageFactory.setCurrentPage('Login');

// Pedir un elemento de la página activa (desde una Task)
PageFactory.getCurrentPage().getElement('usernameField');
```

También expone un `Interaction` de Serenity para usarlo dentro de `actor.attemptsTo()`:

```ts
// En el step definition
actor.attemptsTo(
    SetCurrentPage.to('Login'),   // ← esto es una Interaction de Serenity-JS
    Authenticate.using(user, pass),
)
```

---

### 4. `SelectorFactory.ts` — El contrato

Una interfaz mínima que garantiza que cualquier objeto que se haga pasar por una página
sabe responder a `getElement(nombre)`.

```ts
interface SelectorFactory {
    getElement(name: string): QuestionAdapter<PageElement>;
}
```

`AbstractPage` implementa esta interfaz, por lo que todas las páginas que hereden
de ella la cumplen automáticamente.

---

## Cómo añadir una nueva página

**1.** Crea el archivo de página:

```ts
// test/pages/HomePage.ts
import { AbstractPage } from './factory/AbstractPage';

export class HomePage extends AbstractPage {
    constructor() {
        super({
            ['searchInput']:  '#search',
            ['userMenu']:     '.user-menu',
            ['logoutButton']: '//button[text()="Logout"]',  // XPath también funciona
        });
    }
}
```

**2.** Regístrala en `PageFactory.ts`:

```ts
import { HomePage } from '../HomePage';

static {
    PageFactory.pageMap.set('Login', new LoginPage());
    PageFactory.pageMap.set('Home',  new HomePage());  // ← añadir aquí
}
```

**3.** Úsala desde el step definition:

```ts
actor.attemptsTo(
    SetCurrentPage.to('Home'),
    SearchFor.theProduct('zapatillas'),
)
```

---

## Reglas de oro

| ✅ Haz esto | ❌ Evita esto |
|---|---|
| Pon los selectores solo en los Page Objects | Poner `By.css(...)` en Tasks o Steps |
| Usa nombres descriptivos en negocio (`loginButton`, `searchInput`) | Usar nombres técnicos (`btn1`, `input_3`) |
| Activa la página con `SetCurrentPage.to(string)` antes de interactuar | Llamar a `getElement()` sin haber activado la página |
| Registra cada nueva página en `PageFactory` | Crear instancias de páginas directamente en los tests |

---

## Resumen en una línea

> La **página** sabe dónde están los elementos.
> La **factory** sabe qué página está activa.
> La **task** dice qué hacer.
> El **step** lo orquesta todo con strings legibles.
