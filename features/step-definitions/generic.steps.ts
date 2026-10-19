import { Given, Then } from '@cucumber/cucumber';
import { Ensure } from '@serenity-js/assertions';
import { Actor, actorInTheSpotlight } from '@serenity-js/core';
import { isVisible, Navigate } from '@serenity-js/web';

import { PageFactory, SetCurrentPage } from '../../test/pages/factory/PageFactory';

/**
 * Navigates to a specified website URL.
 * @param {string} url - The URL to navigate to.
 * @example Given go to web "https://example.com"
 */
Given('{actor} go to web {string}', async (actor: Actor, url: string) =>
    await actor.attemptsTo(
        Navigate.to(url),
    )
);

/**
 * Verifies that a named element on the current page is visible.
 *
 * @param {string} elementName - The locator key registered in the current page object.
 * @example Then I should see "loginButton" element
 */
Then('check to {string} has loaded', async (page: string) => {
    await actorInTheSpotlight().attemptsTo(
        SetCurrentPage.to(page),
        Ensure.that(
            PageFactory.getCurrentPage().getElement(page),
            isVisible(),
        ),
    );
});