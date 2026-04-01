import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  // First create user via signup
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.locator('input[name="name"]').fill('Login Test User');
  await page.locator('input[type="email"]').fill('r03login@test.com');
  await page.locator('input[type="password"]').fill('TestPass123!');
  await page.locator('select[name="role"]').selectOption({ index: 1 });
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(5000);
  console.log('After signup URL:', page.url());

  // Logout if we are logged in
  const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Log out"), a:has-text("Logout"), a:has-text("Sign out")');
  if (await logoutBtn.count() > 0) {
    await logoutBtn.first().click();
    await page.waitForTimeout(2000);
  }

  // Navigate to login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[name="email"]').first().fill('r03login@test.com');
  await page.locator('input[type="password"]').first().fill('TestPass123!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  console.log('URL after login:', currentUrl);

  const atDashboard = currentUrl.includes('/dashboard');

  if (atDashboard) {
    console.log('RESULT: pass - Login authenticated user and redirected to /dashboard. URL: ' + currentUrl);
  } else {
    const errors = await page.locator('[role="alert"], .error').allTextContents().catch(() => []);
    console.log('RESULT: fail - Not at dashboard. URL: ' + currentUrl + ' Errors: ' + JSON.stringify(errors));
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
