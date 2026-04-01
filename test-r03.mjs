import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  // Step 1: Create user via signup
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });

  const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name" i]').first();
  await nameInput.fill('Login Test User');

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await emailInput.fill('login@test.com');

  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill('TestPass123!');

  const roleSelect = page.locator('select[name="role"]');
  if (await roleSelect.count() > 0) {
    await roleSelect.selectOption('NURSE');
  }

  const signUpBtn = page.locator('button[type="submit"]').first();
  await signUpBtn.click();
  await page.waitForTimeout(2000);
  console.log('After signup:', page.url());

  // Step 2: Now go to login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  const loginEmail = page.locator('input[type="email"], input[name="email"]').first();
  await loginEmail.fill('login@test.com');

  const loginPass = page.locator('input[type="password"]').first();
  await loginPass.fill('TestPass123!');

  const signInBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In")').first();
  await signInBtn.click();

  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log('After login URL:', currentUrl);

  const isDashboard = currentUrl.includes('/dashboard') || currentUrl === 'http://localhost:3000/' || currentUrl.endsWith('/');
  const bodyText = await page.locator('body').innerText().catch(() => '');
  const isAuthenticated = bodyText.includes('Login Test User') || bodyText.includes('Dashboard') || bodyText.includes('Patients') || bodyText.includes('dashboard');

  console.log('Is dashboard:', isDashboard);
  console.log('Is authenticated:', isAuthenticated);

  if (isDashboard && isAuthenticated) {
    console.log('RESULT: PASS');
  } else if (isDashboard || isAuthenticated) {
    console.log('RESULT: PARTIAL');
    console.log('Page content (first 500):', bodyText.substring(0, 500));
  } else {
    console.log('RESULT: FAIL');
    console.log('Page content (first 500):', bodyText.substring(0, 500));
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
