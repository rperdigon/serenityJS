import { AbstractPage } from './factory/AbstractPage';
import { TEXT_BASE } from '../Constants';

export class LoginPage extends AbstractPage {
    constructor() {
        super({
            // Login form fields
            ['usernameField']: '#username',
            ['passwordField']: '#password',
            ['loginButton']: 'button[type="submit"]',
            [TEXT_BASE.LOGIN]: '#login',
        });
    }
}