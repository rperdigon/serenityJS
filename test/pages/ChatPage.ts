import { TEXT_BASE } from '../Constants';
import { AbstractPage } from './factory/AbstractPage';

export class ChatPage extends AbstractPage {
    constructor() {
        super({
            [TEXT_BASE.CHAT]: "#content",
            ["Room"]: "#content > div > p:nth-child(4)",
            ["Name"]: "#name",
            ["Join"]: "#join",
            ["Message"]: "#messages",
            ["Message box"]: "input#message",
            ["User message"]: "li.message",
            ["Send"]: "#send",
        });
    }
}
