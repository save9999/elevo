import { chromium } from 'playwright';

const BASE = 'http://localhost:3002';
const RESULTS: { page: string; status: string; issues: string[] }[] = [];

async function auditPage(page: any, url: string, name: string) {
  const issues: string[] = [];
  try {
    const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    const status = response?.status() || 0;

    if (status >= 400) {
      issues.push(`HTTP ${status}`);
      RESULTS.push({ page: name, status: `❌ HTTP ${status}`, issues });
      return;
    }

    await page.waitForTimeout(2000);

    // Check for broken images
    const brokenImgs = await page.$$eval('img', (imgs: HTMLImageElement[]) =>
      imgs.filter(img => !img.complete || img.naturalWidth === 0).length
    );
    if (brokenImgs > 0) issues.push(`${brokenImgs} broken image(s)`);

    // Take screenshot
    const screenshotName = name.replace(/[^a-zA-Z0-9]/g, '_');
    await page.screenshot({ path: `audit-screenshots/${screenshotName}.png`, fullPage: true });

    RESULTS.push({
      page: name,
      status: issues.length ? '⚠️ Issues' : '✅ OK',
      issues
    });

  } catch (err: any) {
    issues.push(`Navigation error: ${err.message?.slice(0, 100)}`);
    RESULTS.push({ page: name, status: '❌ Error', issues });
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });

  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 150));
  });
  page.on('pageerror', (err: Error) => consoleErrors.push(`PAGE ERROR: ${err.message.slice(0, 150)}`));

  console.log('🔍 AUDIT ELEVO — Playwright\n');

  // 1. Pages publiques
  console.log('── Pages publiques ──');
  await auditPage(page, BASE, 'Landing');
  await auditPage(page, `${BASE}/login`, 'Login');
  await auditPage(page, `${BASE}/register`, 'Register');

  // 2. Inscription + Login
  console.log('── Inscription test ──');
  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
  const testEmail = `audit_${Date.now()}@test.com`;

  try {
    await page.fill('input[name="name"], input[placeholder*="nom"], input[type="text"]', 'Audit Parent');
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', 'AuditTest123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`  ${url.includes('/parent') || url.includes('/login') ? '✅' : '⚠️'} Register → ${url}`);
  } catch (e: any) {
    console.log(`  ⚠️ Register: ${e.message?.slice(0, 80)}`);
  }

  console.log('── Login ──');
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  try {
    await page.fill('input[name="email"], input[type="email"]', testEmail);
    await page.fill('input[name="password"], input[type="password"]', 'AuditTest123!');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const url = page.url();
    console.log(`  ${url.includes('/parent') ? '✅' : '⚠️'} Login → ${url}`);
  } catch (e: any) {
    console.log(`  ⚠️ Login: ${e.message?.slice(0, 80)}`);
  }

  // 3. Dashboard parent
  console.log('── Parent ──');
  await auditPage(page, `${BASE}/parent`, 'Parent dashboard');

  // 4. Enfants
  console.log('── Enfants ──');
  let childIds: string[] = [];
  try {
    const res = await page.goto(`${BASE}/api/children`, { waitUntil: 'networkidle' });
    if (res?.status() === 200) {
      const body = await res.text();
      const data = JSON.parse(body);
      childIds = (Array.isArray(data) ? data : data.children || []).map((c: any) => c.id);
      console.log(`  Found ${childIds.length} child(ren)`);
    }
  } catch {
    console.log('  ⚠️ API children unreachable');
  }

  if (childIds.length > 0) {
    const cid = childIds[0];

    await auditPage(page, `${BASE}/child/${cid}`, 'Child hub');
    await auditPage(page, `${BASE}/child/${cid}/lumo`, 'Lumo page');
    await auditPage(page, `${BASE}/child/${cid}/avatar`, 'Avatar');
    await auditPage(page, `${BASE}/child/${cid}/quests`, 'Quests');
    await auditPage(page, `${BASE}/child/${cid}/shop`, 'Shop');
    await auditPage(page, `${BASE}/child/${cid}/inventory`, 'Inventory');
    await auditPage(page, `${BASE}/child/${cid}/chat`, 'Chat');

    const modules = ['reading', 'math', 'memory', 'emotional', 'social', 'creativity', 'physical', 'orientation', 'assessment'];
    for (const mod of modules) {
      await auditPage(page, `${BASE}/child/${cid}/module/${mod}`, `Module: ${mod}`);
    }

    await auditPage(page, `${BASE}/child/${cid}/chapter/1`, 'Chapter 1');

    // Design checks
    console.log('\n── Vérifications design ──');
    await page.goto(`${BASE}/child/${cid}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const hasSvgLumo = await page.$$eval('svg', (svgs: SVGElement[]) =>
      svgs.some(svg => svg.outerHTML.includes('lc-fur') || svg.outerHTML.includes('s-fur') || svg.outerHTML.includes('t-head'))
    );
    console.log(`  ${hasSvgLumo ? '✅' : '❌'} SVG Lumo creature (not emoji)`);

    const hasEmojiLumo = await page.$$eval('span', (spans: HTMLSpanElement[]) => {
      const emojis = ['😊', '😄', '🤩', '😴', '🥳'];
      return spans.some(s => emojis.includes(s.textContent?.trim() || ''));
    });
    console.log(`  ${!hasEmojiLumo ? '✅' : '⚠️'} Old emoji Lumo ${hasEmojiLumo ? 'still present' : 'removed'}`);
  }

  // REPORT
  console.log('\n══════════════════════════════════════════');
  console.log('📋 RAPPORT FINAL');
  console.log('══════════════════════════════════════════\n');

  let ok = 0, warn = 0, err = 0;
  for (const r of RESULTS) {
    const icon = r.status.includes('OK') ? '✅' : r.status.includes('Issue') ? '⚠️' : '❌';
    console.log(`${icon} ${r.page}`);
    r.issues.forEach(i => console.log(`   └─ ${i}`));
    if (r.status.includes('OK')) ok++;
    else if (r.status.includes('Issue')) warn++;
    else err++;
  }

  console.log(`\n✅ OK: ${ok}  ⚠️ Warnings: ${warn}  ❌ Errors: ${err}`);
  console.log(`📸 Screenshots: audit-screenshots/`);

  if (consoleErrors.length) {
    console.log(`\n── Console errors (${consoleErrors.length}) ──`);
    [...new Set(consoleErrors)].slice(0, 15).forEach(e => console.log(`  ⚠️ ${e}`));
  }

  await browser.close();
}

main().catch(console.error);
