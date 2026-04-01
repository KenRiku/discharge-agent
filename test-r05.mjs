import { chromium } from 'playwright';

const browser = await chromium.launch();
// Fresh context, no session
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  console.log('URL after navigating to /dashboard:', currentUrl);

  const isRedirectedToLogin = currentUrl.includes('/login') || currentUrl.includes('/signin');
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasLoginForm = bodyText.includes('Sign In') || bodyText.includes('Log In') || bodyText.includes('Email') || bodyText.includes('Password');
  const noDashboardContent = !bodyText.includes('Dashboard') || isRedirectedToLogin;

  console.log('Redirected to login:', isRedirectedToLogin);
  console.log('Has login form:', hasLoginForm);

  if (isRedirectedToLogin || (hasLoginForm && noDashboardContent)) {
    console.log('RESULT: PASS');
  } else {
    console.log('RESULT: FAIL');
    console.log('Page content (first 500):', bodyText.substring(0, 500));
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
