import { test, expect } from '@playwright/test';

test.describe('Public Feed Page', () => {
    test('feed page loads', async ({ page }) => {
        await page.goto('/feed');
        await expect(page).toHaveTitle(/Astra|Project/i);
    });

    test('home page loads', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('body')).toBeVisible();
    });
});
