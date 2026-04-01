import { chromium } from 'playwright';

const browser = await chromium.launch();
const testEmail = `r10c_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  const page = await browser.newPage();

  // Sign up
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'R10 Nurse');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPass);
  const rs = await page.$('select');
  if (rs) await page.selectOption('select', 'NURSE');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Navigate to escalations
  await page.goto('http://localhost:3000/escalations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const url = page.url();

  // Use innerText to get only visible text (not JS chunks)
  const visibleText = await page.evaluate(() => document.body.innerText);
  console.log('Escalations URL:', url);
  console.log('Visible text:', visibleText.substring(0, 1000));

  const hasEscalationsPage = /escalation/i.test(visibleText);
  const hasRedIndicator = /\bRED\b|\bCritical\b/i.test(visibleText);
  const hasYellowIndicator = /\bYELLOW\b|\bWatch\b/i.test(visibleText);
  const hasEmptyState = /No escalation|no pending|all clear/i.test(visibleText);
  const hasActiveEscalation = /Active Escalation|escalation queue/i.test(visibleText);
  // Count the number of patient names with escalations
  const escalatedPatients = (visibleText.match(/RED|YELLOW/g) || []).filter(m => m === 'RED' || m === 'YELLOW');

  console.log('Has escalations page content:', hasEscalationsPage);
  console.log('Has RED/Critical indicator:', hasRedIndicator);
  console.log('Has YELLOW/Watch indicator:', hasYellowIndicator);
  console.log('Has empty state:', hasEmptyState);
  console.log('Has active escalations section:', hasActiveEscalation);
  console.log('Escalation indicators count:', escalatedPatients.length);

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r10-escalations.png' });

  const pass = hasEscalationsPage && (hasRedIndicator || hasYellowIndicator || hasEmptyState);
  console.log('RESULT:', pass ? 'PASS' : (hasEscalationsPage ? 'PARTIAL' : 'FAIL'));
  console.log('NOTES: Escalation queue loaded at /escalations. RED indicator:', hasRedIndicator,
              '| YELLOW indicator:', hasYellowIndicator,
              '| Active escalations:', hasActiveEscalation,
              '| Escalated patients:', escalatedPatients.length);
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
