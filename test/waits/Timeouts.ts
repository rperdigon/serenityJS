import { Duration } from '@serenity-js/core';

/**
 * Standard timeouts used across test suites and wait interactions.
 */
export const Timeouts = {
    EXTRA_SHORT: Duration.ofSeconds(1),
    SHORT: Duration.ofSeconds(2),
    DEFAULT: Duration.ofSeconds(5),
    MEDIUM: Duration.ofSeconds(10),
    LONG: Duration.ofSeconds(30),
} as const;

