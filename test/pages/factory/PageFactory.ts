import { Interaction } from '@serenity-js/core';
import { randomUUID } from 'crypto';

import { LoginPage } from '../LoginPage';
import { AbstractPage } from './AbstractPage';

// Todo lo que exporta el barrel

export class PageFactory {

    // Map of registered pages
    private static pageMap = new Map<string, AbstractPage>();

    // Currently active page
    private static currentPage?: AbstractPage;

    // Unique execution ID for the test run
    private static runId: string = PageFactory.generateRunId();

    // Static block to register all available pages
    static {
        PageFactory.pageMap.set("Login", new LoginPage());
    }

    /**
     * Sets the active page context based on the provided name.
     * @param pageName - The key name of the page to activate (e.g., 'LoginPage').
     */
    static setCurrentPage(pageName: string): void {
        const page = this.pageMap.get(pageName);

        if (!page) {
            throw new Error(`❌ Page not registered: ${pageName}`);
        }

        this.currentPage = page;
    }

    /**
     * Retrieves the currently active page instance.
     * @template T - The specific type of the AbstractPage.
     * @returns The current page instance cast to type T.
     */
    static getCurrentPage<T extends AbstractPage>(): T {
        if (!this.currentPage) {
            throw new Error('❌ Current page not set');
        }
        return this.currentPage as T;
    }

    /**
     * Retrieves the name of the currently active page.
     * @returns The name of the current page or 'UNKNOWN' if not set.
     */
    static getCurrentPageName(): string {
        return this.currentPage?.getPageName() ?? 'UNKNOWN';
    }

    /**
     * Returns a unique execution identifier for this test run.
     */
    static getRunId(): string {
        return this.runId;
    }

    /**
     * Generates a run ID (used internally once per test run).
     */
    private static generateRunId(): string {
        return (
            process.env.RUN_ID ||
            process.env.GITHUB_RUN_ID ||
            process.env.CI_PIPELINE_ID ||
            process.env.HOSTNAME ||
            randomUUID()
        );
    }
}

/**
 * Sets the active page context based on the provided name.
 * @param pageName - The key name of the page to activate (e.g., 'LoginPage').
 */
export const SetCurrentPage = {
    to: (pageName: string): Interaction =>
        Interaction.where(`set current page to "${pageName}"`, async () => {
            PageFactory.setCurrentPage(pageName);
        }),
};