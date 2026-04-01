import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  // Login first
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  await page.locator('input[type="email"], input[name="email"]').first().fill('login@test.com');
  await page.locator('input[type="password"]').first().fill('TestPass123!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  console.log('After login:', page.url());

  // Find logout button
  const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("Log Out"), a:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Log Out")');
  const logoutCount = await logoutBtn.count();
  console.log('Logout buttons found:', logoutCount);

  if (logoutCount > 0) {
    await logoutBtn.first().click();
    await page.waitForTimeout(3000);
    console.log('After logout URL:', page.url());

    const afterLogoutUrl = page.url();
    const isOnLogin = afterLogoutUrl.includes('/login') || afterLogoutUrl.includes('/signin');
    const bodyText = await page.locator('body').innerText().catch(() => '');
    const hasLoginForm = bodyText.includes('Sign In') || bodyText.includes('Log In') || bodyText.includes('Password');

    console.log('On login page:', isOnLogin);
    console.log('Has login form:', hasLoginForm);

    // Now try to access dashboard
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const dashboardUrl = page.url();
    console.log('Dashboard access after logout URL:', dashboardUrl);
    const redirectedToLogin = dashboardUrl.includes('/login') || dashboardUrl.includes('/signin');
    console.log('Redirected to login:', redirectedToLogin);

    if ((isOnLogin || hasLoginForm) && redirectedToLogin) {
      console.log('RESULT: PASS');
    } else if (isOnLogin || hasLoginForm || redirectedToLogin) {
      console.log('RESULT: PARTIAL');
    } else {
      console.log('RESULT: FAIL');
    }
  } else {
    // Try to find it - maybe it's in a menu
    const allButtons = await page.locator('button, a').allTextContents();
    console.log('All buttons/links:', allButtons.filter(t => t.trim()).slice(0, 20));
    console.log('RESULT: FAIL - No logout button found');
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
