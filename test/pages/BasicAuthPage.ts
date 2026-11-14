import { TEXT_BASE } from '../Constants';
import { AbstractPage } from './factory/AbstractPage';

export class BasicAuthPage extends AbstractPage {
    constructor() {
        super({
            [TEXT_BASE.BASIC_AUTH]: "div.example",
            ["message"]: "div.example > p",
        });
    }
}
