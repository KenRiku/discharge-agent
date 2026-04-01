import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  console.log('Signup page loaded:', page.url());

  // Fill in name
  const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name" i]').first();
  await nameInput.fill('Test Nurse');

  // Fill in email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  await emailInput.fill('nurse@test.com');

  // Fill in password
  const passwordInput = page.locator('input[type="password"]').first();
  await passwordInput.fill('TestPass123!');

  // Check if role dropdown exists and select NURSE
  const roleSelect = page.locator('select[name="role"], select[id*="role" i]');
  const roleCount = await roleSelect.count();
  if (roleCount > 0) {
    await roleSelect.selectOption('NURSE');
    console.log('Selected NURSE role');
  }

  // Click sign up button
  const signUpBtn = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register"), button:has-text("Create Account")').first();
  await signUpBtn.click();

  // Wait for navigation
  await page.waitForTimeout(3000);

  const currentUrl = page.url();
  console.log('After signup URL:', currentUrl);

  const pageContent = await page.content();
  const hasWelcome = pageContent.includes('Test Nurse') || pageContent.includes('Welcome') || pageContent.includes('Dashboard') || pageContent.includes('dashboard');
  const isDashboard = currentUrl.includes('/dashboard') || currentUrl === 'http://localhost:3000/' || currentUrl.endsWith('/');

  console.log('URL is dashboard:', isDashboard);
  console.log('Has welcome/name:', hasWelcome);

  if (isDashboard && hasWelcome) {
    console.log('RESULT: PASS');
  } else if (isDashboard || hasWelcome) {
    console.log('RESULT: PARTIAL');
  } else {
    console.log('RESULT: FAIL');
    // Show page text for debug
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log('Page text (first 500):', bodyText.substring(0, 500));
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
