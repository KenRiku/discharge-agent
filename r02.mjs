import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });

  const uniqueEmail = `r02test_${Date.now()}@test.com`;
  await page.locator('input[name="name"]').fill('Test Nurse');
  await page.locator('input[type="email"]').fill(uniqueEmail);
  await page.locator('input[type="password"]').fill('TestPass123!');
  await page.locator('select[name="role"]').selectOption({ index: 1 });

  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  const pageText = await page.textContent('body').catch(() => '');

  console.log('Current URL after signup:', currentUrl);
  console.log('Page contains Test Nurse:', pageText.includes('Test Nurse'));

  const atDashboard = currentUrl.includes('/dashboard');
  const showsUser = pageText.includes('Test Nurse');

  if (atDashboard && showsUser) {
    console.log('RESULT: pass - Signup created user, redirected to /dashboard, and shows user name "Test Nurse"');
  } else if (atDashboard) {
    console.log('RESULT: partial - Redirected to dashboard but user name not visible. URL: ' + currentUrl);
  } else {
    const errors = await page.locator('[role="alert"], .error, [class*="error"]').allTextContents().catch(() => []);
    console.log('RESULT: fail - Not at dashboard. Errors: ' + JSON.stringify(errors) + ' URL: ' + currentUrl);
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
