# POM Architecture with Factory — Intuitive Guide

> **POM** = Page Object Model. A design pattern that separates *where elements are* from *what the test does with them*.

---

## Why POM?

Without POM, every test knows too much:

```ts
// ❌ Without POM: the test finds the element itself
await page.locator('#username').fill('admin');
await page.locator('#password').fill('1234');
await page.locator('button[type="submit"]').click();
```

If the button's selector changes tomorrow, you'd have to track it down in **every test** that uses it.

With POM, the test only says *what it wants to do*, and the page knows *how to find the element*:

```ts
// ✅ With POM: the test speaks in business terms, not HTML
actor.attemptsTo(
    Authenticate.using('admin', '1234')
)
```

---

## The Restaurant Metaphor

Think of the system as a restaurant:

| Restaurant          | This project                   |
|---------------------|-------------------------------|
| **The waiter**      | Step definition (Cucumber)    |
| **The maître d'**   | `PageFactory`                 |
| **The dining room** | `LoginPage`, `HomePage`...    |
| **The menu**        | The registered locators       |
| **The kitchen**     | Serenity-JS + Playwright       |

The waiter **doesn't go to the kitchen** to fetch ingredients. They tell the maître d' which table is active, and the table knows which dishes (elements) it offers.

---

## Folder Structure

```
test/pages/
│
├── factory/
│   ├── AbstractPage.ts     ← The base template for every page
│   ├── PageFactory.ts      ← The maître d': manages which page is active
│   └── SelectorFactory.ts  ← The contract: every page must know how to find elements
│
├── LoginPage.ts            ← Concrete page: registers its own locators
├── HomePage.ts             ← (example of a new page)
│
└── PomArchitectureEN.md    ← This file
```

---

## The Complete Flow, Step by Step

```
Feature .feature
    │
    │  "Given actor starts with the Login example"
    ▼
Step Definition  (the-internet.steps.ts)
    │
    │  SetCurrentPage.to('Login')   ← activates the page by STRING
    ▼
PageFactory
    │
    │  pageMap.get('Login') → LoginPage instance
    │  currentPage = LoginPage
    ▼
Authenticate.using(user, pass)
    │
    │  PageFactory.getCurrentPage().getElement('usernameField')
    ▼
AbstractPage  (LoginPage inherits from here)
    │
    │  locators.get('usernameField')
    │  → { element: PageElement.located(By.css('#username')) }
    ▼
Serenity-JS + Playwright
    │
    │  Finds #username in the browser DOM
    │  Types the value
    ▼
✅ Test executed
```

---

## How Each Piece Works

### 1. `LoginPage.ts` — The page menu

Here you **only declare** which elements exist on the page and how to find them.
No logic. Just names and selectors.

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

The key point is that the **name** (`'usernameField'`) is a free string you choose yourself.
That same string is what you'll use later to request the element.

> 💡 You can also use XPath. `AbstractPage` detects it automatically:
> - Starts with `//` or `/` → XPath
> - Anything else → CSS

---

### 2. `AbstractPage.ts` — The translator

Receives the `name → selector` pair and converts it into a Serenity-JS `PageElement`.

```
'#username'  (string)
     ↓  By.css('#username')          ← Serenity creates a search descriptor
     ↓  PageElement.located(...)     ← LAZY object: doesn't touch the DOM yet
     ↓  Stored in an internal Map
```

**Important — lazy loading**: `PageElement.located()` **searches nothing** in the browser
when created. It only describes *how to find* the element when the time comes.
Playwright searches the DOM only when the actor executes an action (`Click`, `Enter`, etc.).

---

### 3. `PageFactory.ts` — The maître d'

Keeps a registry of all available pages and knows which one is currently active.

```ts
// Registry of available pages (once, at startup)
static {
    PageFactory.pageMap.set('Login', new LoginPage());
    PageFactory.pageMap.set('Home',  new HomePage());
}
```

```ts
// Activate a page (from the step definition)
PageFactory.setCurrentPage('Login');

// Request an element from the active page (from a Task)
PageFactory.getCurrentPage().getElement('usernameField');
```

It also exposes a Serenity `Interaction` for use inside `actor.attemptsTo()`:

```ts
// In the step definition
actor.attemptsTo(
    SetCurrentPage.to('Login'),   // ← this is a Serenity-JS Interaction
    Authenticate.using(user, pass),
)
```

---

### 4. `SelectorFactory.ts` — The contract

A minimal interface that guarantees any object posing as a page
knows how to respond to `getElement(name)`.

```ts
interface SelectorFactory {
    getElement(name: string): QuestionAdapter<PageElement>;
}
```

`AbstractPage` implements this interface, so all pages that inherit from it
satisfy it automatically.

---

## How to Add a New Page

**1.** Create the page file:

```ts
// test/pages/HomePage.ts
import { AbstractPage } from './factory/AbstractPage';

export class HomePage extends AbstractPage {
    constructor() {
        super({
            ['searchInput']:  '#search',
            ['userMenu']:     '.user-menu',
            ['logoutButton']: '//button[text()="Logout"]',  // XPath works too
        });
    }
}
```

**2.** Register it in `PageFactory.ts`:

```ts
import { HomePage } from '../HomePage';

static {
    PageFactory.pageMap.set('Login', new LoginPage());
    PageFactory.pageMap.set('Home',  new HomePage());  // ← add it here
}
```

**3.** Use it from the step definition:

```ts
actor.attemptsTo(
    SetCurrentPage.to('Home'),
    SearchFor.theProduct('sneakers'),
)
```

---

## Golden Rules

| ✅ Do this | ❌ Avoid this |
|---|---|
| Keep selectors only in Page Objects | Putting `By.css(...)` in Tasks or Steps |
| Use business-meaningful names (`loginButton`, `searchInput`) | Using technical names (`btn1`, `input_3`) |
| Activate the page with `SetCurrentPage.to(string)` before interacting | Calling `getElement()` without having activated the page |
| Register every new page in `PageFactory` | Creating page instances directly in tests |

---

## One-Line Summary

> The **page** knows where the elements are.
> The **factory** knows which page is active.
> The **task** says what to do.
> The **step** orchestrates everything with readable strings.
