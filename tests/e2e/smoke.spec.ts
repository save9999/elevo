import { test, expect } from '@playwright/test';

test.describe('smoke — post-refonte Fondations', () => {
  test('homepage affiche "Station Elevo"', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/La Station Elevo/i).first()).toBeVisible();
  });

  test('page login est accessible', async ({ page }) => {
    await page.goto('/login');
    const emailInputs = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInputs.first()).toBeVisible({ timeout: 10_000 });
  });

  test('page register est accessible', async ({ page }) => {
    await page.goto('/register');
    const emailInputs = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInputs.first()).toBeVisible({ timeout: 10_000 });
  });

  test('homepage contient un lien vers /register', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Rejoindre la station/i })).toBeVisible();
  });

  test('homepage contient un lien vers /login', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Se connecter/i })).toBeVisible();
  });
});
