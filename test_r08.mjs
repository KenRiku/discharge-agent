import { chromium } from 'playwright';

const browser = await chromium.launch();
const testEmail = `r08c_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  const page = await browser.newPage();

  // Sign up
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'R08 Nurse');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPass);
  const roleSelect = await page.$('select');
  if (roleSelect) await page.selectOption('select', 'NURSE');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Create patient
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'Call Schedule Test');
  await page.fill('input[name="dob"]', '1970-01-01');
  await page.fill('input[name="phone"]', '555-0100');
  await page.selectOption('select[name="procedureType"]', 'Appendectomy');
  const today = new Date().toISOString().split('T')[0];
  await page.fill('input[name="dischargeDate"]', today);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Navigate to patients list and get detail link
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const patientDetailLinks = await page.$$eval('a[href*="/patients/"]', links =>
    links
      .map(l => ({ href: l.getAttribute('href'), text: l.textContent?.trim() }))
      .filter(l => !l.href.endsWith('/new'))
  );

  if (patientDetailLinks.length > 0) {
    await page.goto(`http://localhost:3000${patientDetailLinks[0].href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
  }

  const detailUrl = page.url();
  const detailBody = await page.textContent('body');
  console.log('Detail URL:', detailUrl);
  console.log('Detail body snippet:', detailBody.substring(0, 1200));

  // The detail page shows "Day1", "Day3", "Day7" (no spaces) - check both variants
  const hasDay1 = /Day\s*1/i.test(detailBody);
  const hasDay3 = /Day\s*3/i.test(detailBody);
  const hasDay7 = /Day\s*7/i.test(detailBody);
  const hasPending = /pending|scheduled/i.test(detailBody);

  // Count actual follow-up call entries
  const scheduledMatches = detailBody.match(/Scheduled/g) || [];
  console.log('Has Day1 pattern:', hasDay1);
  console.log('Has Day3 pattern:', hasDay3);
  console.log('Has Day7 pattern:', hasDay7);
  console.log('Has Pending/Scheduled status:', hasPending);
  console.log('Number of Scheduled statuses:', scheduledMatches.length);

  const callCount = [hasDay1, hasDay3, hasDay7].filter(Boolean).length;
  const pass = callCount >= 3 && hasPending;
  console.log('RESULT:', pass ? 'PASS' : (callCount >= 1 ? 'PARTIAL' : 'FAIL'));
  console.log('NOTES: Found', callCount, 'day markers and', scheduledMatches.length, 'Scheduled statuses on detail page at', detailUrl);

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r08-detail.png' });
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
