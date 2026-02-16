import { defineConfig, devices } from '@playwright/test';
import { AUTH_FILE } from './tests/auth.config';
import dotenv from 'dotenv';
import path from 'node:path';

const envFile = process.env.TEST_ENV ? `.env.${process.env.TEST_ENV}` : '.env';
dotenv.config({ path: path.resolve(envFile) });

export default defineConfig({
    testDir: './tests',

    timeout: 60_000,
    expect: { timeout: 10_000 },

    fullyParallel: true,
    workers: process.env.CI ? 2 : undefined,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,

    reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

    use: {
        baseURL: process.env.BASE_URL,

        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        actionTimeout: 15_000,
        navigationTimeout: 30_000,
    },

    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium',
            testDir: './tests/authenticated',
            use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
            dependencies: ['setup'],
        },
        {
            name: 'firefox',
            testDir: './tests/authenticated',
            use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
            dependencies: ['setup'],
        },
        {
            name: 'webkit',
            testDir: './tests/authenticated',
            use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
            dependencies: ['setup'],
        },
    ],
});
