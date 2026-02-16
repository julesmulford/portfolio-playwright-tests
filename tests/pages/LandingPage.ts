import { Page, Locator } from '@playwright/test';

export class LandingPage {
    readonly page: Page;
    readonly loginButton: Locator;
    readonly acceptCookiesButton: Locator;
    readonly myAccountLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginButton = page.getByRole('link', { name: 'Log in' });
        this.acceptCookiesButton = page.locator('#onetrust-accept-btn-handler');
        this.myAccountLink = page.getByRole('navigation').getByTestId('My account');
    }

    async goTo() {
        await this.page.goto('/');
    }

    async acceptCookiesIfPresent() {
        try {
            await this.acceptCookiesButton.click({ timeout: 5000 });
            console.log('Cookie banner accepted');
        } catch {
            console.log('Cookie banner not present, continuing');
        }
    }

    async selectLogin() {
        await this.loginButton.click();
    }
}
