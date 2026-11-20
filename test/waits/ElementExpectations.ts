import { isPresent, not } from '@serenity-js/assertions';
import { Expectation } from '@serenity-js/core';
import { isClickable, isEnabled, isSelected, isVisible, PageElement } from '@serenity-js/web';

export type ElementState =
    | 'visible'
    | 'invisible'
    | 'present'
    | 'not present'
    | 'clickable'
    | 'not clickable'
    | 'enabled'
    | 'disabled'
    | 'selected'
    | 'not selected';

/**
 * Resolves a human-readable state string into a Serenity/JS Expectation.
 *
 * @param state The expected state (e.g. 'visible', 'clickable', 'present')
 * @returns An Expectation that can be used with Wait.until(...) or Ensure.that(...)
 */
export function resolveElementExpectation(state: string): Expectation<any> {
    switch (state.trim().toLowerCase()) {
        case 'visible':
            return isVisible();

        case 'invisible':
            return not(isVisible());

        case 'present':
            return isPresent();

        case 'not present':
            return not(isPresent());

        case 'clickable':
            return isClickable();

        case 'not clickable':
            return not(isClickable());

        case 'enabled':
            return isEnabled();

        case 'disabled':
            return not(isEnabled());

        case 'selected':
            return isSelected();

        case 'not selected':
            return not(isSelected());

        default:
            throw new Error(
                `Unsupported element state: "${state}". Supported states are: visible, invisible, present, not present, clickable, not clickable, enabled, disabled, selected, not selected.`
            );
    }
}
