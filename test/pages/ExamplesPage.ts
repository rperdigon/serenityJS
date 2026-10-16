import { By, PageElements } from '@serenity-js/web';

export const ExamplesPage = {
    all: () =>
        PageElements.located(By.css('ul li a')).describedAs('available examples'),
};