import { Then, When } from '@cucumber/cucumber';
import { Ensure, equals, includes } from '@serenity-js/assertions';
import { Actor, actorInTheSpotlight } from '@serenity-js/core';
import { LastResponse } from '@serenity-js/rest';

import { GetPets } from '../../test/pets/GetPets';

When('{actor} makes a GET request to {string}', async (actor: Actor, url: string) => {
    await actor.attemptsTo(
        GetPets.from(url),
    );
});

Then('{pronoun} should receive a response with code {int}', async (actor: Actor, statusCode: number) => {
    await actor.attemptsTo(
        Ensure.that(LastResponse.status(), equals(statusCode)),
    );
});

Then('{pronoun} should receive a response with content type {string}', async (actor: Actor, expectedContentType: string) => {
    await actorInTheSpotlight().attemptsTo(
        Ensure.that(LastResponse.header('content-type'), includes(expectedContentType)),
    );
});
