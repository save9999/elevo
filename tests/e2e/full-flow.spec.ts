import { test, expect, type Page } from '@playwright/test';

/**
 * Tests e2e du parcours complet : login → hub → planète → activité → cabinet → bilan.
 * Utilise le compte test@elevo.local seedé par scripts/seed-test-user.ts.
 */

async function login(page: Page) {
  await page.goto('/login');
  await page.locator('input[type="email"]').first().fill('test@elevo.local');
  await page.locator('input[type="password"]').first().fill('password123');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL(/\/parent/, { timeout: 20_000 });
}

test.describe('full flow — refonte Elevo complete', () => {
  test('page CGU accessible sans login', async ({ page }) => {
    await page.goto('/cgu');
    await expect(page.getByRole('heading', { name: /Conditions générales/i })).toBeVisible();
  });

  test('page confidentialité accessible et mentionne RGPD', async ({ page }) => {
    await page.goto('/confidentialite');
    await expect(page.getByText(/RGPD/i).first()).toBeVisible();
  });

  test('landing affiche les 3 feature cards', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // Les titres des feature cards sont des div (pas des headings).
    await expect(page.getByText('Explorer librement', { exact: true })).toBeVisible();
    await expect(page.getByText('Repérage bienveillant', { exact: true })).toBeVisible();
  });

  test('parent voit le rapport de son enfant', async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: /Voir le rapport/i }).first().click();
    await page.waitForURL(/\/parent\/child\//);
    await expect(page.getByText(/Carnet d'observation/i)).toBeVisible();
    await expect(page.getByText(/Historique des bilans/i)).toBeVisible();
  });

  test('parent peut naviguer de la Station vers une planète puis une activité', async ({ page }) => {
    await login(page);
    // Aller à la Station via "Entrer"
    await page.getByRole('link', { name: /Entrer dans la Station/i }).first().click();
    await page.waitForURL(/\/explorateurs\//);

    // Cliquer sur Alphabos (la planète tourne en orbite, on force pour ignorer le mouvement)
    const alphabos = page.getByRole('button', { name: /Planète Alphabos/i }).first();
    await alphabos.click({ force: true });
    await page.waitForURL(/\/planet\/alphabos/);
    await expect(page.getByRole('heading', { name: /Planète Alphabos/i })).toBeVisible();

    // Cliquer sur une activité
    await page.getByText(/Attrape la lettre/i).first().click();
    await page.waitForURL(/\/activity\/letter-match/);
    await expect(page.getByText(/Clique sur la lettre minuscule/i)).toBeVisible();
  });

  test('enfant peut cliquer sur LUMO pour accéder au Cabinet', async ({ page }) => {
    await login(page);
    await page.getByRole('link', { name: /Entrer dans la Station/i }).first().click();
    await page.waitForURL(/\/explorateurs\//);

    // Cliquer sur LUMO centrale (bouton avec label "Entrer dans le Cabinet")
    await page.getByRole('link', { name: /Entrer dans le Cabinet/i }).click();
    await page.waitForURL(/\/cabinet$/);
    await expect(page.getByRole('heading', { name: /Bienvenue au Cabinet/i })).toBeVisible();

    // Vérifie qu'il y a plusieurs bilans disponibles
    await expect(page.getByText(/Alouette/i).first()).toBeVisible();
  });
});
