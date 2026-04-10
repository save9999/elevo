import { test, expect } from '@playwright/test';

test.describe('hub — login + vue Station', () => {
  async function login(page: import('@playwright/test').Page) {
    await page.goto('/login');
    await page.locator('input[type="email"]').first().fill('test@elevo.local');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/\/parent/, { timeout: 20_000 });
  }

  test('parent peut se connecter et voir son dashboard', async ({ page }) => {
    await login(page);
    await expect(page.getByText(/Bonjour/i).first()).toBeVisible();
    await expect(page.getByText(/Léa/i).first()).toBeVisible();
  });

  test('cliquer sur "Entrer dans la Station" pour Léa affiche le hub', async ({
    page,
  }) => {
    await login(page);
    await page.getByRole('link', { name: /Entrer dans la Station/i }).first().click();
    await page.waitForURL(/\/explorateurs\//, { timeout: 15_000 });

    // Le hub doit afficher au moins 4 des 6 noms de planètes
    const planetNames = ['Alphabos', 'Numeris', 'Scripta', 'Verbalia', 'Memoria', 'Geometra'];
    let visible = 0;
    for (const name of planetNames) {
      if (
        await page
          .getByText(name)
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        visible += 1;
      }
    }
    expect(visible).toBeGreaterThanOrEqual(4);

    // Le prénom de l'enfant doit apparaître
    await expect(page.getByText(/Léa/i).first()).toBeVisible();
  });
});
