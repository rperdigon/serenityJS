import { QuestionAdapter } from '@serenity-js/core';
import { PageElement } from '@serenity-js/web';

export interface SelectorFactory {
    /**
     * @param name logical name of the element
     * @returns a lazily resolved page element
     * @throws if no element is registered under `name`
     */
    getElement(name: string): QuestionAdapter<PageElement>;
}