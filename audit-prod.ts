import { chromium } from 'playwright';

const BASE = 'https://elevo-five.vercel.app';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  const jsErrors: string[] = [];
  page.on('pageerror', (err: Error) => jsErrors.push(`PAGE: ${err.message.slice(0, 120)}`));
  page.on('console', (msg: any) => {
    if (msg.type() === 'error' && !msg.text().includes('Extra attributes') && !msg.text().includes('Download the React')) {
      jsErrors.push(`CONSOLE: ${msg.text().slice(0, 120)}`);
    }
  });

  console.log('AUDIT PRODUCTION — elevo-five.vercel.app\n');

  // Pages publiques
  console.log('-- Pages publiques --');
  for (const [path, name] of [['/', 'Landing'], ['/login', 'Login'], ['/register', 'Register']] as const) {
    try {
      const res = await page.goto(`${BASE}${path}`, { timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `audit-screenshots/prod_${name}.png`, fullPage: true });
      console.log(`OK ${name} (${res?.status()})`);
    } catch (e: any) {
      console.log(`FAIL ${name}: ${e.message.slice(0, 80)}`);
    }
  }

  // Register
  console.log('\n-- Auth --');
  const email = `audit${Date.now()}@test.com`;
  try {
    const r = await page.request.post(`${BASE}/api/auth/register`, {
      data: { name: 'Audit', email, password: 'Test1234!' },
    });
    console.log(`  Register API: ${r.status()}`);
    const body = await r.text();
    if (r.status() !== 200 && r.status() !== 201) console.log(`  Body: ${body.slice(0, 100)}`);
  } catch (e: any) {
    console.log(`  Register: ${e.message.slice(0, 80)}`);
  }

  // Login
  await page.goto(`${BASE}/login`, { timeout: 30000 });
  await page.waitForTimeout(1500);
  try {
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    console.log(`  Login -> ${page.url()}`);
    await page.screenshot({ path: 'audit-screenshots/prod_after_login.png', fullPage: true });
  } catch (e: any) {
    console.log(`  Login: ${e.message.slice(0, 80)}`);
  }

  // Parent dashboard
  try {
    await page.goto(`${BASE}/parent`, { timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'audit-screenshots/prod_parent.png', fullPage: true });
    console.log(`OK Parent dashboard`);
  } catch (e: any) {
    console.log(`FAIL Parent: ${e.message.slice(0, 80)}`);
  }

  // Find children
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
        console.log(`  Premier: ${children[0].name} (${children[0].ageGroup})`);
      }
    } else {
      console.log(`  API: ${r.status()}`);
    }
  } catch (e: any) {
    console.log(`  API: ${e.message.slice(0, 80)}`);
  }

  // If no children, create one
  if (!cid) {
    console.log('  Trying to create a child...');
    try {
      const r = await page.request.post(`${BASE}/api/children`, {
        data: { name: 'Emma Audit', birthDate: '2018-05-15', ageGroup: 'primaire' },
      });
      console.log(`  Create child: ${r.status()}`);
      if (r.status() === 200 || r.status() === 201) {
        const body = await r.text();
        const child = JSON.parse(body);
        cid = child.id || child.child?.id || '';
        console.log(`  Created: ${cid}`);
      }
    } catch {}
  }

  if (cid) {
    console.log('\n-- Pages enfant --');
    const childPages: [string, string][] = [
      [`/child/${cid}`, 'prod_child_hub'],
      [`/child/${cid}/lumo`, 'prod_lumo'],
      [`/child/${cid}/quests`, 'prod_quests'],
      [`/child/${cid}/shop`, 'prod_shop'],
      [`/child/${cid}/module/reading`, 'prod_reading'],
      [`/child/${cid}/module/math`, 'prod_math'],
      [`/child/${cid}/module/memory`, 'prod_memory'],
      [`/child/${cid}/module/emotional`, 'prod_emotional'],
      [`/child/${cid}/module/creativity`, 'prod_creativity'],
    ];

    for (const [path, name] of childPages) {
      try {
        const res = await page.goto(`${BASE}${path}`, { timeout: 30000 });
        await page.waitForTimeout(2500);
        await page.screenshot({ path: `audit-screenshots/${name}.png`, fullPage: true });
        console.log(`OK ${name.replace('prod_','')} (${res?.status()})`);
      } catch (e: any) {
        console.log(`FAIL ${name.replace('prod_','')}: ${e.message.slice(0, 80)}`);
      }
    }

    // Design check
    console.log('\n-- Design check --');
    await page.goto(`${BASE}/child/${cid}`, { timeout: 30000 });
    await page.waitForTimeout(3000);

    const html = await page.content();
    console.log(`  ${html.includes('lc-fur') || html.includes('s-iris') ? 'OK' : 'FAIL'} Nouveau Lumo SVG`);
    console.log(`  ${!html.includes('>😊<') && !html.includes('>😄<') ? 'OK' : 'FAIL'} Ancien emoji supprime`);
  } else {
    console.log('  Pas d enfant disponible pour tester');
  }

  // Errors
  if (jsErrors.length) {
    console.log(`\n-- JS Errors (${jsErrors.length}) --`);
    [...new Set(jsErrors)].slice(0, 10).forEach(e => console.log(`  ${e}`));
  } else {
    console.log('\nAucune erreur JS');
  }

  await browser.close();
  console.log('\nScreenshots: audit-screenshots/');
}

main().catch(console.error);
