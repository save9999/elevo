import { test, expect } from '@playwright/test';

test('homepage répond', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toBeAttached();
});
