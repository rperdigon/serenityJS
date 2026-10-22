import { TEXT_BASE } from '../Constants';
import { AbstractPage } from './factory/AbstractPage';

export class SecureAreaPage extends AbstractPage {
    constructor() {
        super({
            [TEXT_BASE.SECURE_AREA]: '#content',
            ['advice']: '#flash',
            ['welcome message']: 'h4.subheader'
        });
    }
}