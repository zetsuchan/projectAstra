import { test, expect } from '@playwright/test';

test.describe('Chat Page', () => {
    test('chat page loads with sign in prompt', async ({ page }) => {
        await page.goto('/chat');

        // Should show the chat interface
        await expect(page.locator('body')).toBeVisible();

        // Should have the input field
        const input = page.locator('input[placeholder*="Ask"]');
        await expect(input).toBeVisible();
    });

    test('chat page has header with Astra branding', async ({ page }) => {
        await page.goto('/chat');

        // Should show Astra header
        await expect(page.getByText('Astra')).toBeVisible();
    });
});
