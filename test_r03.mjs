import { chromium } from 'playwright';

const browser = await chromium.launch();
const testEmail = `login_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  // Step 1: Create user via signup
  const signupPage = await browser.newPage();
  await signupPage.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await signupPage.fill('input[name="name"], input[placeholder*="name" i]', 'Login Test User');
  await signupPage.fill('input[type="email"]', testEmail);
  await signupPage.fill('input[type="password"]', testPass);
  const roleSelect = await signupPage.$('select');
  if (roleSelect) await signupPage.selectOption('select', 'NURSE');

  let signupStatus = null;
  signupPage.on('response', r => {
    if (r.url().includes('/api/signup')) signupStatus = r.status();
  });

  await signupPage.click('button[type="submit"]');
  await signupPage.waitForTimeout(3000);
  console.log('Signup status:', signupStatus, '| Signup URL after:', signupPage.url());
  await signupPage.close();

  // Step 2: Login with created user
  const loginPage = await browser.newPage();
  await loginPage.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  await loginPage.fill('input[type="email"]', testEmail);
  await loginPage.fill('input[type="password"]', testPass);

  await loginPage.click('button[type="submit"]');
  await loginPage.waitForTimeout(5000);

  const finalUrl = loginPage.url();
  const finalBody = await loginPage.textContent('body');

  console.log('Final URL:', finalUrl);
  console.log('Has Login Test User:', finalBody.includes('Login Test User'));
  console.log('Is dashboard:', finalUrl.includes('/dashboard') || finalUrl === 'http://localhost:3000/');

  const pass = finalUrl.includes('/dashboard') || finalUrl === 'http://localhost:3000/';
  console.log('RESULT:', pass ? 'PASS' : 'FAIL');

  await loginPage.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r03-screenshot.png' });
  await loginPage.close();
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
