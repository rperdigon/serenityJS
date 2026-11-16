import { TEXT_BASE } from '../Constants';
import { AbstractPage } from './factory/AbstractPage';

export class RadioButtonsPage extends AbstractPage {
    constructor() {
        super({
            [TEXT_BASE.RADIO_BUTTONS]: "#content",
            ["Green"]: "#green",
            ["message"]: "#result",
            ["Football"]: "input[value='football']",
        });
    }
}
