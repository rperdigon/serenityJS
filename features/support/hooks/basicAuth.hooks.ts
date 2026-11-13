import { Before } from '@cucumber/cucumber';
import { Duration, engage } from '@serenity-js/core';

import { Actors } from '../../../test';
import { browser } from '../serenity.config';

const timeouts = {
    defaultNavigationTimeout: Duration.ofSeconds(10).inMilliseconds(),
    defaultTimeout: Duration.ofSeconds(5).inMilliseconds(),
};

/**
 * Hook exclusivo para escenarios etiquetados con @basicAuth.
 * Reemplaza el Cast global con uno que incluye las credenciales
 * de HTTP Basic Authentication para the-internet.herokuapp.com.
 *
 * Para añadir Basic Auth de otra web, crea un nuevo Before con
 * su propio tag (ej: @basicAuthOtraWeb) y sus credenciales.
 */
Before({ tags: '@basicAuth' }, async () => {
    engage(
        new Actors(
            browser,
            {
                baseURL: 'https://the-internet.herokuapp.com',
                httpCredentials: {
                    username: process.env.BASIC_AUTH_USER ?? 'admin',
                    password: process.env.BASIC_AUTH_PASSWORD ?? 'admin',
                    origin: 'https://the-internet.herokuapp.com',
                },
            },
            timeouts,
        )
    );
});

