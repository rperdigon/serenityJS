import { Task } from '@serenity-js/core';
import { Click, Enter } from '@serenity-js/web';

import { PageFactory } from '../pages/factory/PageFactory';

/**
 * This is called a "Task".
 * Use tasks to compose a sequence of one or more activities and give them domain meaning.
 *
 * Here, the actor performs three activities:
 * - enter username
 * - enter password
 * - click on the login button
 *
 * This sequence of activities together means to "log in".
 * Locators are resolved at runtime from the active page via PageFactory,
 * using the string keys registered in each Page Object (e.g. LoginPage).
 */
export const Authenticate = {
    using: (username: string, password: string) =>
        Task.where(`#actor logs in as ${ username }`,
            Enter.theValue(username).into(
                PageFactory.getCurrentPage().getElement('usernameField')
            ),
            Enter.theValue(password).into(
                PageFactory.getCurrentPage().getElement('passwordField')
            ),
            Click.on(
                PageFactory.getCurrentPage().getElement('loginButton')
            ),
        ),
};
