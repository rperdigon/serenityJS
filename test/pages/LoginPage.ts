import { TEXT_BASE } from '../Constants';
import { AbstractPage } from './factory/AbstractPage';

export class LoginPage extends AbstractPage {
    constructor() {
        super({
            // Login form fields
            [TEXT_BASE.LOGIN]: '#login',
            ['usernameField']: '#username',
            ['passwordField']: '#password',
            ['loginButton']: 'button[type="submit"]',
        });
    }
}