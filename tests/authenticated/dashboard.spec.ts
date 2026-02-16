import { test, expect } from '../fixtures/fixtures';
import { normalizeCurrencyToNumber } from '../utils/number';

test.describe('Verify portfolio', () => {
    test.beforeEach(async ({ dashboardPage }) => {
        await dashboardPage.goTo();
        await dashboardPage.waitForLoad();
        
        // Dismiss add balance popup if present
        await dashboardPage.dismissRemediationModalIfPresent();
    });

    test('Verify portfolio value matches expected balance', { tag: ['@smoke', '@portfolio'] }, async ({ dashboardPage }) => {
        const expectedValue = process.env.EXPECTED_PORTFOLIO_VALUE;
        if (!expectedValue) {
            throw new Error(
                'EXPECTED_PORTFOLIO_VALUE environment variable is required. See .env.example',
            );
        }

        await expect(dashboardPage.portfolioValue).toBeVisible();

        const displayedText = (await dashboardPage.portfolioValue.textContent()) ?? '';
        const displayedNumber = normalizeCurrencyToNumber(displayedText);
        const expectedNumber = normalizeCurrencyToNumber(expectedValue);

        expect(
            displayedNumber,
            `Portfolio value mismatch. Displayed: "${displayedText}" Expected: "${expectedValue}"`,
        ).toBe(expectedNumber);
    });
});
