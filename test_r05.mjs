import { chromium } from 'playwright';

const browser = await chromium.launch();

try {
  // Fresh browser context - no session/cookies
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const finalUrl = page.url();
  console.log('Final URL after navigating to /dashboard unauthenticated:', finalUrl);

  const redirectedToLogin = finalUrl.includes('/login') || finalUrl.includes('/signin');
  console.log('Redirected to login:', redirectedToLogin);
  console.log('RESULT:', redirectedToLogin ? 'PASS' : 'FAIL');

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r05-screenshot.png' });
  await context.close();
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
