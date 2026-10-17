import { Ensure, includes } from '@serenity-js/assertions';
import { Task } from '@serenity-js/core';
import { isVisible, Text } from '@serenity-js/web';

import { LoginPage } from '../pages';

/**
 * VerifyAuthentication aggregates several tasks to make them easier to find:
 * - VerifyAuthentication.succeeded()
 * - VerifyAuthentication.failed()
 *
 * Note how both those tasks reuse VerifyAuthentication.hasFlashAlert()
 * to avoid code duplication.
 */
export class VerifyAuthentication {
    private static hasFlashAlert = () =>
        Task.where(`#actor verifies that flash alert is present`,
            Ensure.that(LoginPage.flashAlert(), isVisible()),
        )

    static succeeded = () =>
        Task.where(`#actor verifies that authentication has succeeded`,
            VerifyAuthentication.hasFlashAlert(),
            Ensure.that(Text.of(LoginPage.flashAlert()), includes('You logged into a secure area!')),
        )

    static failed = () =>
        Task.where(`#actor verifies that authentication has failed`,
            VerifyAuthentication.hasFlashAlert(),
            Ensure.that(Text.of(LoginPage.flashAlert()), includes('Your username is invalid!')),
        )
}