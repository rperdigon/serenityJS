import { Given, Then, When } from '@cucumber/cucumber';
import { Ensure, equals, includes } from '@serenity-js/assertions';
import { Actor, actorInTheSpotlight, AssertionError, Wait } from '@serenity-js/core';
import { Click, Enter, isClickable, isEnabled, isVisible, Navigate } from '@serenity-js/web';

import { PageFactory, SetCurrentPage } from '../../test/pages/factory/PageFactory';
import { resolveElementExpectation, Timeouts } from '../../test/waits';

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
 * Automatically waits up to default timeout for the page root element to appear.
 *
 * @param {string} page - The locator key registered in the current page object.
 * @example Then check to "Chat" has loaded
 */
Then('check to {string} has loaded', async (page: string) => {
    PageFactory.setCurrentPage(page);
    const pageElement = PageFactory.getCurrentPage().getElement(page);

    await actorInTheSpotlight().attemptsTo(
        SetCurrentPage.to(page),
        Wait.upTo(Timeouts.DEFAULT).until(pageElement, isVisible()),
        Ensure.that(
            pageElement,
            isVisible(),
        ).otherwiseFailWith(AssertionError, `Page "${page}" has not loaded within ${Timeouts.DEFAULT}.`),
    );
});


/**
 * Verifies that an element matches the expected state.
 * Waits up to Timeouts.DEFAULT before checking to avoid race conditions.
 *
 * @param {string} element - Element locator key.
 * @param {string} state - Expected state (visible, invisible, present, clickable, enabled, etc.).
 * @example Then verify the element "Message" is "visible"
 */
Then('verify the element {string} is {string}', async (element: string, state: string) => {
    const target = PageFactory.getCurrentPage().getElement(element);
    const expectation = resolveElementExpectation(state);

    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Timeouts.DEFAULT).until(target, expectation),
        Ensure.that(target, expectation),
    );
});

/**
 * Verifies that an element's text contains the expected value.
 * Synchronizes with dynamic updates before asserting.
 *
 * @param {string} element - Element locator key.
 * @param {string} text - Expected substring.
 * @example Then verify the text element "Room" include "lobby"
 */
Then('verify the text element {string} include {string}', async (element: string, text: string) => {
    const target = PageFactory.getCurrentPage().getElement(element);

    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Timeouts.DEFAULT).until(target.text(), includes(text)),
        Ensure.that(target.text(), includes(text)),
    );
});

/**
 * Verifies that an element's text exactly equals the expected value.
 * Synchronizes with dynamic updates before asserting.
 *
 * @param {string} element - Element locator key.
 * @param {string} text - Expected exact text.
 * @example Then verify the text element "Message" is "Test joined"
 */
Then('verify the text element {string} is {string}', async (element: string, text: string) => {
    const target = PageFactory.getCurrentPage().getElement(element);

    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Timeouts.DEFAULT).until(target.text(), equals(text)),
        Ensure.that(target.text(), equals(text)),
    );
});

// ==========================================
// INTERACTION STEPS (RESILIENT)
// ==========================================

/**
 * Clicks on a named element on the current page.
 * Waits for the element to be clickable first.
 *
 * @param {string} element - The locator key registered in the current page object.
 * @example When click on "loginButton"
 */
When('click on {string}', async (element: string) => {
    const target = PageFactory.getCurrentPage().getElement(element);

    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Timeouts.DEFAULT).until(target, isClickable()),
        Click.on(target),
    );
});

/**
 * Selects a radio button by clicking on it.
 * Waits for the element to be clickable first.
 *
 * @param {string} element - The locator key registered in the current page object.
 * @example When select radio button "genderRadio"
 */
When('select radio button {string}', async (element: string) => {
    const target = PageFactory.getCurrentPage().getElement(element);

    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Timeouts.DEFAULT).until(target, isClickable()),
        Click.on(target),
    );
});

/**
 * Selects a checkbox by clicking on it.
 * Waits for the element to be clickable first.
 *
 * @param {string} element - The locator key registered in the current page object.
 * @example When select checkbox "rememberMeCheckbox"
 */
When('select checkbox {string}', async (element: string) => {
    const target = PageFactory.getCurrentPage().getElement(element);

    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Timeouts.DEFAULT).until(target, isClickable()),
        Click.on(target),
    );
});

/**
 * Sends text into an element.
 * Waits for the element to be enabled first.
 *
 * @param {string} text - The text to send.
 * @param {string} element - The locator key of the element.
 * @example When send text "John Doe" into "nameInput"
 */
When('send text {string} into {string}', async (text: string, element: string) => {
    const target = PageFactory.getCurrentPage().getElement(element);

    await actorInTheSpotlight().attemptsTo(
        Wait.upTo(Timeouts.DEFAULT).until(target, isEnabled()),
        Enter.theValue(text).into(target),
    );
});
