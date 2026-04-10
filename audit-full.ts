import { chromium, Page, BrowserContext } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE = 'https://elevo-five.vercel.app';
const SCREENSHOT_DIR = '/Users/superbot/elevo/audit-screenshots/full';

// Ensure screenshot dir exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

interface Finding {
  area: string;
  step: string;
  status: 'OK' | 'WARN' | 'FAIL';
  detail?: string;
}

const findings: Finding[] = [];

function log(area: string, step: string, status: 'OK' | 'WARN' | 'FAIL', detail?: string) {
  const icon = status === 'OK' ? '✅' : status === 'WARN' ? '⚠️ ' : '❌';
  console.log(`${icon} [${area}] ${step}${detail ? ' — ' + detail : ''}`);
  findings.push({ area, step, status, detail });
}

async function screenshot(page: Page, name: string) {
  try {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true });
  } catch {}
}

async function safeClick(page: Page, selector: string, description: string): Promise<boolean> {
  try {
    const el = await page.$(selector);
    if (!el) return false;
    await el.click({ timeout: 5000 });
    return true;
  } catch (err: any) {
    console.log(`   ⚠️ click failed: ${description} — ${err.message?.slice(0, 60)}`);
    return false;
  }
}

async function waitForNav(page: Page, ms = 2000) {
  await page.waitForTimeout(ms);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context: BrowserContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();

  const jsErrors: string[] = [];
  page.on('pageerror', (err: Error) => jsErrors.push(`PAGE: ${err.message.slice(0, 150)}`));
  page.on('console', (msg: any) => {
    if (msg.type() === 'error' && !msg.text().includes('Extra attributes')) {
      jsErrors.push(`CONSOLE: ${msg.text().slice(0, 150)}`);
    }
  });

  console.log('\n🔍 AUDIT COMPLET ELEVO — PROD\n');

  // ═══ 1. PAGES PUBLIQUES ═══
  console.log('\n── 1. Pages publiques ──');
  try {
    const r = await page.goto(`${BASE}/`, { timeout: 30000 });
    await waitForNav(page);
    log('public', 'Landing page', r?.status() === 200 ? 'OK' : 'FAIL', `HTTP ${r?.status()}`);
    await screenshot(page, '01-landing');
  } catch (e: any) { log('public', 'Landing', 'FAIL', e.message?.slice(0, 80)); }

  try {
    const r = await page.goto(`${BASE}/login`, { timeout: 30000 });
    await waitForNav(page);
    log('public', 'Login page', r?.status() === 200 ? 'OK' : 'FAIL');
    await screenshot(page, '02-login');
  } catch (e: any) { log('public', 'Login', 'FAIL', e.message?.slice(0, 80)); }

  try {
    const r = await page.goto(`${BASE}/register`, { timeout: 30000 });
    await waitForNav(page);
    log('public', 'Register page', r?.status() === 200 ? 'OK' : 'FAIL');
  } catch (e: any) { log('public', 'Register', 'FAIL', e.message?.slice(0, 80)); }

  // ═══ 2. REGISTER + LOGIN ═══
  console.log('\n── 2. Auth ──');
  const email = `audit_full_${Date.now()}@test.com`;
  try {
    const r = await page.request.post(`${BASE}/api/auth/register`, {
      data: { name: 'Audit Full', email, password: 'Test1234!' },
    });
    log('auth', 'Register API', r.status() === 201 ? 'OK' : 'FAIL', `HTTP ${r.status()}`);
  } catch (e: any) { log('auth', 'Register API', 'FAIL', e.message?.slice(0, 80)); }

  try {
    await page.goto(`${BASE}/login`, { timeout: 30000 });
    await waitForNav(page, 1500);
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await waitForNav(page, 4000);
    const url = page.url();
    log('auth', 'Login', url.includes('/parent') ? 'OK' : 'WARN', `→ ${url.replace(BASE, '')}`);
    await screenshot(page, '03-parent-dashboard');
  } catch (e: any) { log('auth', 'Login', 'FAIL', e.message?.slice(0, 80)); }

  // ═══ 3. CREATE CHILD ═══
  console.log('\n── 3. Créer enfant ──');
  let childId = '';
  try {
    const r = await page.request.post(`${BASE}/api/children`, {
      data: { name: 'Emma Audit', birthDate: '2018-05-15', ageGroup: 'primaire' },
    });
    if (r.status() === 201 || r.status() === 200) {
      const body = await r.text();
      const data = JSON.parse(body);
      childId = data.id || data.child?.id || '';
      log('child', 'Create child API', 'OK', `id: ${childId.slice(0, 8)}...`);
    } else {
      log('child', 'Create child API', 'FAIL', `HTTP ${r.status()}`);
    }
  } catch (e: any) { log('child', 'Create child API', 'FAIL', e.message?.slice(0, 80)); }

  if (!childId) {
    console.log('\n❌ Pas d enfant, abandon des tests suivants');
    await browser.close();
    printReport();
    return;
  }

  // ═══ 4. LUMO HOUSE (child hub) ═══
  console.log('\n── 4. LumoHouse ──');
  try {
    const r = await page.goto(`${BASE}/child/${childId}`, { timeout: 30000 });
    await waitForNav(page, 3000);
    log('hub', 'Child hub page', r?.status() === 200 ? 'OK' : 'FAIL', `HTTP ${r?.status()}`);
    await screenshot(page, '04-lumohouse');

    // Check LumoHouse SVG rendered
    const svgCount = await page.locator('svg').count();
    log('hub', 'LumoHouse SVG rendered', svgCount > 0 ? 'OK' : 'FAIL', `${svgCount} SVGs`);

    // Check stats bar
    const hasStatsFaim = await page.locator('text=Faim').count() > 0;
    log('hub', 'Lumo stats visible', hasStatsFaim ? 'OK' : 'WARN');
  } catch (e: any) { log('hub', 'LumoHouse', 'FAIL', e.message?.slice(0, 80)); }

  // ═══ 5. NAVIGATION PIÈCES ═══
  console.log('\n── 5. Navigation pièces ──');
  const rooms = ['chambre', 'bureau', 'atelier', 'jardin', 'salon', 'cour', 'grenier', 'classe', 'labo'];
  for (const room of rooms) {
    try {
      const r = await page.goto(`${BASE}/child/${childId}/room/${room}`, { timeout: 30000 });
      await waitForNav(page, 2500);
      await screenshot(page, `05-room-${room}`);
      const status = r?.status() === 200 ? 'OK' : 'FAIL';
      log('rooms', `Pièce: ${room}`, status, `HTTP ${r?.status()}`);

      // Check "Jouer avec Lumo" button exists
      const playBtn = await page.locator('text=/Jouer avec Lumo/i').count();
      if (playBtn === 0) {
        log('rooms', `${room}: bouton Jouer`, 'WARN', 'Non trouvé');
      }
    } catch (e: any) { log('rooms', `Pièce: ${room}`, 'FAIL', e.message?.slice(0, 80)); }
  }

  // ═══ 6. MODULES (jeux lancés depuis les pièces) ═══
  console.log('\n── 6. Modules / jeux ──');
  const modules = ['reading', 'math', 'memory', 'emotional', 'social', 'creativity', 'physical', 'writing'];
  for (const mod of modules) {
    try {
      const r = await page.goto(`${BASE}/child/${childId}/module/${mod}`, { timeout: 30000 });
      await waitForNav(page, 3000);
      await screenshot(page, `06-module-${mod}`);
      const status = r?.status() === 200 ? 'OK' : 'FAIL';
      log('modules', `Module: ${mod}`, status, `HTTP ${r?.status()}`);
    } catch (e: any) { log('modules', `Module: ${mod}`, 'FAIL', e.message?.slice(0, 80)); }
  }

  // ═══ 7. DYS ASSESSMENT ═══
  console.log('\n── 7. Bilan dys ──');
  try {
    const r = await page.goto(`${BASE}/child/${childId}/dys-assessment`, { timeout: 30000 });
    await waitForNav(page, 2500);
    await screenshot(page, '07-dys-intro');
    log('dys', 'Page bilan dys', r?.status() === 200 ? 'OK' : 'FAIL', `HTTP ${r?.status()}`);

    // Check "Commencer" button
    const startBtn = await page.locator('button:has-text("Commencer")').first();
    const startExists = await startBtn.count() > 0;
    log('dys', 'Bouton Commencer visible', startExists ? 'OK' : 'FAIL');

    if (startExists) {
      await startBtn.click();
      await waitForNav(page, 2000);
      await screenshot(page, '07-dys-test1-reading');

      // Should now be on reading test
      const hasReadingTest = await page.locator('text=/Test de lecture/i').count() > 0
        || await page.locator('text=/lire à voix haute/i').count() > 0;
      log('dys', 'Test 1: Reading speed', hasReadingTest ? 'OK' : 'WARN');
    }
  } catch (e: any) { log('dys', 'Bilan dys', 'FAIL', e.message?.slice(0, 80)); }

  // ═══ 8. PARENT DYS REPORT ═══
  console.log('\n── 8. Rapport parent dys ──');
  try {
    const r = await page.goto(`${BASE}/parent/child/${childId}/dys-report`, { timeout: 30000 });
    await waitForNav(page, 2500);
    await screenshot(page, '08-dys-report');
    log('parent', 'Rapport dys parent', r?.status() === 200 ? 'OK' : 'FAIL', `HTTP ${r?.status()}`);

    // Check for "Aucun bilan" or actual results
    const hasContent = await page.locator('text=/Aucun bilan|bilan/i').count() > 0;
    log('parent', 'Contenu rapport', hasContent ? 'OK' : 'WARN');
  } catch (e: any) { log('parent', 'Rapport dys', 'FAIL', e.message?.slice(0, 80)); }

  // ═══ 9. PARENT PROFILE avec bannière dys ═══
  console.log('\n── 9. Parent profile ──');
  try {
    const r = await page.goto(`${BASE}/parent/child/${childId}`, { timeout: 30000 });
    await waitForNav(page, 2500);
    await screenshot(page, '09-parent-profile');
    log('parent', 'Page profil parent', r?.status() === 200 ? 'OK' : 'FAIL');

    // Check dys banner
    const hasDysBanner = await page.locator('text=/Bilan d.apprentissage/i').count() > 0;
    log('parent', 'Bannière bilan dys', hasDysBanner ? 'OK' : 'WARN');
  } catch (e: any) { log('parent', 'Parent profile', 'FAIL', e.message?.slice(0, 80)); }

  // ═══ 10. QUESTS / SHOP / INVENTORY ═══
  console.log('\n── 10. Navigation secondaire ──');
  for (const [path, name] of [
    ['quests', 'Quêtes'],
    ['shop', 'Boutique'],
    ['inventory', 'Inventaire'],
    ['lumo', 'Lumo chat'],
    ['avatar', 'Avatar'],
  ] as const) {
    try {
      const r = await page.goto(`${BASE}/child/${childId}/${path}`, { timeout: 30000 });
      await waitForNav(page, 2000);
      log('nav', name, r?.status() === 200 ? 'OK' : 'FAIL', `HTTP ${r?.status()}`);
    } catch (e: any) { log('nav', name, 'FAIL', e.message?.slice(0, 80)); }
  }

  // ═══ 11. ERREURS JS ═══
  if (jsErrors.length) {
    console.log(`\n── Erreurs JS détectées (${jsErrors.length}) ──`);
    const unique = [...new Set(jsErrors)];
    unique.slice(0, 15).forEach((e) => {
      console.log(`   ⚠️ ${e}`);
      findings.push({ area: 'js', step: 'Runtime error', status: 'WARN', detail: e });
    });
  }

  await browser.close();
  printReport();
}

function printReport() {
  console.log('\n═══════════════════════════════════════════');
  console.log('📋 RAPPORT FINAL');
  console.log('═══════════════════════════════════════════\n');

  const byArea: Record<string, Finding[]> = {};
  for (const f of findings) {
    if (!byArea[f.area]) byArea[f.area] = [];
    byArea[f.area].push(f);
  }

  let totalOk = 0, totalWarn = 0, totalFail = 0;
  for (const [area, items] of Object.entries(byArea)) {
    const ok = items.filter((i) => i.status === 'OK').length;
    const warn = items.filter((i) => i.status === 'WARN').length;
    const fail = items.filter((i) => i.status === 'FAIL').length;
    totalOk += ok; totalWarn += warn; totalFail += fail;
    console.log(`[${area.toUpperCase()}] ${ok}✓ ${warn}⚠️  ${fail}❌`);
    for (const item of items) {
      if (item.status !== 'OK') {
        console.log(`   ${item.status === 'WARN' ? '⚠️ ' : '❌'} ${item.step}${item.detail ? ' — ' + item.detail : ''}`);
      }
    }
  }

  console.log(`\nTOTAL: ${totalOk}✓  ${totalWarn}⚠️  ${totalFail}❌`);
  console.log(`Screenshots: ${SCREENSHOT_DIR}`);
}

main().catch((err) => {
  console.error('Audit crashed:', err);
  printReport();
});
