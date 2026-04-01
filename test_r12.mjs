import { chromium } from 'playwright';

const browser = await chromium.launch();
const testEmail = `r12_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  const page = await browser.newPage();

  // Sign up
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'R12 Nurse');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPass);
  const rs = await page.$('select');
  if (rs) await page.selectOption('select', 'NURSE');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Navigate to dashboard
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const url = page.url();
  const visibleText = await page.evaluate(() => document.body.innerText);
  console.log('Dashboard URL:', url);
  console.log('Visible text:', visibleText.substring(0, 1500));

  // Check for stat cards with keywords
  const hasPatients = /patients?/i.test(visibleText);
  const hasCalls = /calls?/i.test(visibleText);
  const hasEscalations = /escalations?/i.test(visibleText);
  const hasEnrolled = /enrolled/i.test(visibleText);
  const hasNumericStats = /\b\d+\b/.test(visibleText);

  // Count stat-card-like elements
  const statCards = await page.$$('[class*="stat"], [class*="card"], [class*="metric"], [class*="summary"], [class*="count"]');
  console.log('Has Patients label:', hasPatients);
  console.log('Has Calls label:', hasCalls);
  console.log('Has Escalations label:', hasEscalations);
  console.log('Has Enrolled label:', hasEnrolled);
  console.log('Has numeric values:', hasNumericStats);
  console.log('Stat card elements count:', statCards.length);

  // Count how many summary keywords appear
  const summaryKeywords = [hasPatients, hasCalls, hasEscalations, hasEnrolled];
  const keywordCount = summaryKeywords.filter(Boolean).length;

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r12-dashboard.png' });

  const pass = keywordCount >= 3 && hasNumericStats;
  console.log('RESULT:', pass ? 'PASS' : (keywordCount >= 2 ? 'PARTIAL' : 'FAIL'));
  console.log('NOTES: Summary keywords found:', keywordCount, '/4 (Patients, Calls, Escalations, Enrolled). Numeric values present:', hasNumericStats);
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
