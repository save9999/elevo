import { chromium } from 'playwright';

const BASE = 'http://localhost:3002';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  const jsErrors: string[] = [];
  page.on('pageerror', (err: Error) => jsErrors.push(`PAGE: ${err.message.slice(0, 120)}`));
  page.on('console', (msg: any) => {
    if (msg.type() === 'error' && !msg.text().includes('Extra attributes')) {
      jsErrors.push(`CONSOLE: ${msg.text().slice(0, 120)}`);
    }
  });

  console.log('AUDIT RAPIDE ELEVO\n');

  // Pages publiques
  for (const [path, name] of [['/', 'Landing'], ['/login', 'Login'], ['/register', 'Register']]) {
    try {
      const res = await page.goto(`${BASE}${path}`, { timeout: 20000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `audit-screenshots/${name}.png`, fullPage: true });
      console.log(`OK ${name} (${res?.status()})`);
    } catch (e: any) {
      console.log(`FAIL ${name}: ${e.message.slice(0, 80)}`);
    }
  }

  // Register + Login
  console.log('\n-- Auth --');
  const email = `audit${Date.now()}@test.com`;
  try {
    const r = await page.request.post(`${BASE}/api/auth/register`, {
      data: { name: 'Audit', email, password: 'Test1234!' },
    });
    console.log(`  Register API: ${r.status()}`);
  } catch {}

  await page.goto(`${BASE}/login`, { timeout: 20000 });
  await page.waitForTimeout(1000);
  try {
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    console.log(`  Login -> ${page.url()}`);
  } catch {}

  // Parent
  try {
    await page.goto(`${BASE}/parent`, { timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `audit-screenshots/Parent.png`, fullPage: true });
    console.log(`OK Parent`);
  } catch (e: any) {
    console.log(`FAIL Parent: ${e.message.slice(0, 80)}`);
  }

  // Children
  console.log('\n-- Enfants --');
  let cid = '';
  try {
    const r = await page.request.get(`${BASE}/api/children`);
    if (r.status() === 200) {
      const body = await r.text();
      const data = JSON.parse(body);
      const children = Array.isArray(data) ? data : data.children || [];
      console.log(`  ${children.length} enfant(s)`);
      if (children.length > 0) {
        cid = children[0].id;
        console.log(`  ID: ${cid}, Name: ${children[0].name}, Age: ${children[0].ageGroup}`);
      }
    }
  } catch {}

  if (cid) {
    const childPages: [string, string][] = [
      [`/child/${cid}`, 'Child_hub'],
      [`/child/${cid}/lumo`, 'Lumo'],
      [`/child/${cid}/quests`, 'Quests'],
      [`/child/${cid}/shop`, 'Shop'],
      [`/child/${cid}/inventory`, 'Inventory'],
      [`/child/${cid}/avatar`, 'Avatar'],
      [`/child/${cid}/module/reading`, 'Mod_reading'],
      [`/child/${cid}/module/math`, 'Mod_math'],
      [`/child/${cid}/module/memory`, 'Mod_memory'],
      [`/child/${cid}/module/emotional`, 'Mod_emotional'],
      [`/child/${cid}/module/social`, 'Mod_social'],
      [`/child/${cid}/module/creativity`, 'Mod_creativity'],
      [`/child/${cid}/module/physical`, 'Mod_physical'],
      [`/child/${cid}/chapter/1`, 'Chapter_1'],
    ];

    for (const [path, name] of childPages) {
      try {
        const res = await page.goto(`${BASE}${path}`, { timeout: 20000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `audit-screenshots/${name}.png`, fullPage: true });
        console.log(`OK ${name} (${res?.status()})`);
      } catch (e: any) {
        console.log(`FAIL ${name}: ${e.message.slice(0, 80)}`);
      }
    }

    // Design verification
    console.log('\n-- Design check --');
    await page.goto(`${BASE}/child/${cid}`, { timeout: 20000 });
    await page.waitForTimeout(2000);

    const svgs = await page.locator('svg').count();
    console.log(`  SVGs: ${svgs}`);

    const pageHtml = await page.content();
    const hasNewLumo = pageHtml.includes('lc-fur') || pageHtml.includes('s-fur') || pageHtml.includes('s-iris');
    console.log(`  ${hasNewLumo ? 'OK' : 'FAIL'} Nouveau SVG Lumo`);

    const hasOldEmoji = pageHtml.includes('>😊<') || pageHtml.includes('>😄<') || pageHtml.includes('>🤩<');
    console.log(`  ${!hasOldEmoji ? 'OK' : 'FAIL'} Ancien emoji Lumo supprime`);
  }

  // Summary
  if (jsErrors.length) {
    console.log(`\n-- JS Errors (${jsErrors.length}) --`);
    [...new Set(jsErrors)].slice(0, 15).forEach(e => console.log(`  ${e}`));
  } else {
    console.log('\nAucune erreur JS');
  }

  await browser.close();
  console.log('\nScreenshots: audit-screenshots/');
}

main().catch(console.error);
