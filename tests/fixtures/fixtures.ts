import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';

type Fixtures = {
    dashboardPage: DashboardPage;
};

export const test = base.extend<Fixtures>({
    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },
});

export { expect } from '@playwright/test';
