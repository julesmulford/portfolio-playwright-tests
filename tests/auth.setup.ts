import { test as setup, chromium } from '@playwright/test';
import { AUTH_FILE, PERSISTENT_PROFILE_DIR } from './auth.config';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';

setup('authenticate', async ({}, testInfo) => {
    if (!process.env.BASE_URL) {
        throw new Error('BASE_URL environment variable is required. See .env.example');
    }

    const headless = testInfo.project.use.headless ?? true;
    const context = await chromium.launchPersistentContext(PERSISTENT_PROFILE_DIR, {
        baseURL: process.env.BASE_URL,
        headless,
    });

    const page = context.pages()[0] || await context.newPage();
    const landingPage = new LandingPage(page);

    await page.goto('/');

    let isLoggedIn = false;
    try {
        await landingPage.myAccountLink.waitFor({ state: 'visible', timeout: 10_000 });
        isLoggedIn = true;
    } catch {
        console.log('My account not found, proceeding with login');
    }

    if (isLoggedIn) {
        console.log('Already logged in from persistent profile, skipping login');
    } else {
        const loginPage = new LoginPage(page);

        await landingPage.acceptCookiesIfPresent();
        await landingPage.selectLogin();
        await loginPage.enterUsernameAndPassword();
        await loginPage.submit();

        await page.waitForURL('**/c', { timeout: 30_000 });
    }

    await context.storageState({ path: AUTH_FILE });
    await context.close();
});
