import { equals, includes } from '@serenity-js/assertions';
import { Answerable, Duration, Task, Wait } from '@serenity-js/core';
import { PageElement } from '@serenity-js/web';

import { resolveElementExpectation } from './ElementExpectations';
import { Timeouts } from './Timeouts';

/**
 * Screenplay Tasks for synchronizing dynamic web elements.
 */
export class WaitFor {

    /**
     * Waits until the target element reaches the expected state (e.g., 'visible', 'clickable').
     *
     * @param element The target element (Answerable<PageElement>)
     * @param state The expected state ('visible', 'clickable', 'invisible', etc.)
     * @param timeout The maximum duration to wait (defaults to Timeouts.DEFAULT)
     */
    static elementToBecome(
        element: Answerable<PageElement>,
        state: string,
        timeout: Duration = Timeouts.DEFAULT
    ): Task {
        return Task.where(
            `#actor waits up to ${timeout} until element is ${state}`,
            Wait.upTo(timeout).until(element, resolveElementExpectation(state)),
        );
    }

    /**
     * Waits until the target element's text includes the expected string.
     *
     * @param element The target element (PageElement with .text())
     * @param expectedText The text expected to be included
     * @param timeout The maximum duration to wait (defaults to Timeouts.DEFAULT)
     */
    static textToInclude(
        element: any,
        expectedText: string,
        timeout: Duration = Timeouts.DEFAULT
    ): Task {
        return Task.where(
            `#actor waits up to ${timeout} until text includes "${expectedText}"`,
            Wait.upTo(timeout).until(element.text(), includes(expectedText)),
        );
    }

    /**
     * Waits until the target element's text exactly equals the expected string.
     *
     * @param element The target element (PageElement with .text())
     * @param expectedText The expected text
     * @param timeout The maximum duration to wait (defaults to Timeouts.DEFAULT)
     */
    static textToEqual(
        element: any,
        expectedText: string,
        timeout: Duration = Timeouts.DEFAULT
    ): Task {
        return Task.where(
            `#actor waits up to ${timeout} until text equals "${expectedText}"`,
            Wait.upTo(timeout).until(element.text(), equals(expectedText)),
        );
    }

    /**
     * Explicit pause for a fixed duration.
     * Use sparingly; state-based waits (e.g. elementToBecome) are strongly preferred.
     *
     * @param duration The duration to wait
     */
    static pauseFor(duration: Duration): Task {
        return Task.where(
            `#actor pauses for ${duration}`,
            Wait.for(duration),
        );
    }
}
