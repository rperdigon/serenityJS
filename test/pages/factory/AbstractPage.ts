import { Answerable, QuestionAdapter } from '@serenity-js/core';
import { By, PageElement, PageElements } from '@serenity-js/web';
import { SelectorFactory } from './SelectorFactory';

type LocatorEntry = {
    element: Answerable<PageElement>;
    selector?: ReturnType<typeof By.css>;
    rawSelector?: string;
};

export abstract class AbstractPage<L extends string = string> implements SelectorFactory {

    /** Name of the page (derived from constructor name) */
    readonly pageName: string;

    /** Internal registry of locators mapped by name */
    private readonly locators = new Map<L, LocatorEntry>();

    /**
     * Determines if a selector string is an XPath expression
     * @param selector - CSS or XPath selector string
     * @returns True if selector appears to be XPath
     * @private
     */
    private isXPath(selector: string): boolean {
        const s = selector.trim();

        return s.startsWith('//')
            || s.startsWith('.//')
            || s.startsWith('/')
            || s.startsWith('(')
            || /::/.test(s)
            || (s.includes('@') && s.includes('['));
    }

    /**
     * Registers global locators available on all pages (sidebar, header, etc.)
     * Override in subclasses to add page-specific global locators
     * @protected
     */
    protected registerGlobalLocators(): void {
        // Loading & Saving
        // this.mapLocator('loading' as L, `#loading-container`); //non used, it is other element to learn about generic selectors
    }

    /**
     * Creates a new page object with registered locators
     * @param locators - Optional page-specific locators to register
     * @protected
     */
    protected constructor(
        locators?: Record<L, Answerable<PageElement> | string>
    ) {
        this.pageName = this.constructor.name;
        this.registerGlobalLocators();

        if (locators) {
            (Object.entries(locators) as [L, Answerable<PageElement> | string][])
                .forEach(([name, locator]) => {
                    this.mapLocator(name, locator);
                });
        }
    }

    /**
     * Registers a locator with automatic detection of CSS vs XPath
     * @param name - Unique identifier for the locator
     * @param locator - Selector string or SerenityJS PageElement
     * @protected
     */
    protected mapLocator(name: L, locator: Answerable<PageElement> | string): void {

        if (typeof locator !== 'string') {
            this.locators.set(name, {
                element: locator,
            });
            return;
        }

        const selector = this.isXPath(locator)
            ? By.xpath(locator)
            : By.css(locator);

        this.locators.set(name, {
            element: PageElement.located(selector),
            selector,
            rawSelector: locator,
        });
    }

    /**
     * Retrieves a registered locator by name
     * @param name - Name of the locator to retrieve
     * @returns SerenityJS PageElement for the specified locator
     * @throws Error if locator is not found
     * @example
     * const loginButton = page.getLocator('loginButton');
     * await actor.attemptsTo(Click.on(loginButton));
     */
    getLocator(name: L): Answerable<PageElement> {
        const entry = this.locators.get(name);

        if (!entry) {
            throw new Error(`❌ Locator "${String(name)}" not found on page ${this.pageName}`);
        }

        return entry.element;
    }

    /**
     * Satisfies the {@link SelectorFactory} interface.
     * Delegates to {@link getLocator}.
     */
    getElement(name: string): QuestionAdapter<PageElement> {
        return this.getLocator(name as L) as QuestionAdapter<PageElement>;
    }

    /**
     * Returns the list of Locators
     * @returns Page name
     */
    getLocatorsList(name: L): PageElements {
        const entry = this.locators.get(name);

        if (!entry || !entry.selector) {
            throw new Error(`❌ Locator "${String(name)}" does not support list usage on page ${this.pageName}`);
        }

        return PageElements.located(entry.selector);
    }

    /**
     * Returns the name of the page (typically the class name)
     * @returns Page name
     */
    getPageName(): string {
        return this.pageName;
    }
}