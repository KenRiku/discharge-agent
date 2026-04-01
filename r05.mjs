import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
// Fresh context - no cookies/session
const context = await browser.newContext();
const page = await context.newPage();
try {
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  console.log('URL after navigating to /dashboard without auth:', currentUrl);

  const redirectedToAuth = currentUrl.includes('/login') || currentUrl.includes('/signin');

  if (redirectedToAuth) {
    console.log('RESULT: pass - Unauthenticated access to /dashboard redirected to: ' + currentUrl);
  } else {
    const pageText = await page.textContent('body').catch(() => '');
    // Check if it's showing actual dashboard content or a login form
    const hasLoginForm = await page.locator('input[type="password"]').count() > 0;
    if (hasLoginForm) {
      console.log('RESULT: partial - /dashboard shows login form inline without redirect. URL: ' + currentUrl);
    } else {
      console.log('RESULT: fail - /dashboard accessible without auth. URL: ' + currentUrl + ' Content snippet: ' + pageText.substring(0, 200));
    }
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await context.close();
  await browser.close();
}
