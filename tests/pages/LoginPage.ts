import { Page, Locator } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly username: Locator;
    readonly password: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.username = page.locator('input[name="username"]');
        this.password = page.locator('input[name="password"]');
        this.submitButton = page.getByRole('button', { name: /^continue$/i });
    }

    async enterUsernameAndPassword() {
        if (!process.env.TEST_USERNAME || !process.env.PASSWORD) {
            throw new Error(
                'TEST_USERNAME and PASSWORD environment variables are required. See .env.example',
            );
        }
        await this.username.fill(process.env.TEST_USERNAME);
        await this.password.fill(process.env.PASSWORD);
    }

    async submit() {
        await this.submitButton.click();
    }
}
