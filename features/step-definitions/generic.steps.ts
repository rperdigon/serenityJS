import { Given, Then } from '@cucumber/cucumber';
import { Ensure, equals, includes } from '@serenity-js/assertions';
import { Actor, actorInTheSpotlight, AssertionError } from '@serenity-js/core';
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
    PageFactory.setCurrentPage(page);
    await actorInTheSpotlight().attemptsTo(
        SetCurrentPage.to(page),
        Ensure.that(
            PageFactory.getCurrentPage().getElement(page),
            isVisible(),
        ).otherwiseFailWith(AssertionError, 'Page ' + page + ' has not loaded.'),
    );
});

/**
 * Verifies that an element's text contains the expected value.
 * Supports special tags like [empty] or [blank].
 * @param {string} element - Element locator key or identifier.
 * @param {string} text - Expected text value.
 * @example Then verify the text element "title" is "Welcome"
 */
Then('verify the text element {string} include {string}', async (element: string, text: string) => {
    await actorInTheSpotlight().attemptsTo(
        // Log.the(PageFactory.getCurrentPage().getElement(element).text()),//enable to debug
        Ensure.that(
            PageFactory.getCurrentPage().getElement(element).text(),
            includes(text),
        ),
    );
});

/**
 * Verifies that an element's text exactly equals the expected value.
 * Supports special tags like [empty] or [blank].
 * @param {string} element - Element locator key or identifier.
 * @param {string} text - Expected text value.
 * @example Then verify the text element "title" is "Welcome"
 */
Then('verify the text element {string} is {string}', async (element: string, text: string) => {
    await actorInTheSpotlight().attemptsTo(
        // Log.the(PageFactory.getCurrentPage().getElement(element).text()),//enable to debug
        Ensure.that(
            PageFactory.getCurrentPage().getElement(element).text(),
            equals(text),
        ),
    );
});