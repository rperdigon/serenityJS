import { AbstractPage } from './factory/AbstractPage';

export class LoginPage extends AbstractPage {
    constructor() {
        super({
            // Login form fields
            ['usernameField']: '#username',
            ['passwordField']: '#password',
            ['loginButton']: 'button[type="submit"]',
            ['Login']: 'button[type="submit"]',
        });
    }
}