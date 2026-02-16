import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly portfolioValue: Locator;
    readonly remediationModalDismiss: Locator;

    constructor(page: Page) {
        this.page = page;
        this.portfolioValue = page.getByTestId('portfolio-value').getByRole('status');
        this.remediationModalDismiss = page.getByTestId('remediation-modal-secondary-cta');
    }

    async goTo() {
        await this.page.goto('/c');
    }

    async waitForLoad() {
        await this.portfolioValue.waitFor({ state: 'visible' });
    }

    async dismissRemediationModalIfPresent() {
        try {
            await this.remediationModalDismiss.click({ timeout: 5000 });
            console.log('Remediation modal dismissed');
        } catch {
            console.log('Remediation modal not present, continuing');
        }
    }
}
