import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });

  const timestamp = Date.now();
  const testEmail = `nurse_${timestamp}@test.com`;

  // Fill in name
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'Test Nurse');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', 'TestPass123!');

  // Select role
  const roleSelect = await page.$('select');
  if (roleSelect) await page.selectOption('select', 'NURSE');

  // Listen for API response
  let signupStatus = null;
  page.on('response', r => {
    if (r.url().includes('/api/signup')) signupStatus = r.status();
  });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);

  const finalUrl = page.url();
  const finalBody = await page.textContent('body');

  console.log('Signup API status:', signupStatus);
  console.log('Final URL:', finalUrl);
  console.log('Body snippet:', finalBody.substring(0, 400));
  console.log('Has Test Nurse:', finalBody.includes('Test Nurse'));
  console.log('URL is dashboard or root:', finalUrl.includes('/dashboard') || finalUrl === 'http://localhost:3000/');

  const pass = (finalUrl.includes('/dashboard') || finalUrl === 'http://localhost:3000/' || finalUrl.endsWith(':3000/'));
  console.log('RESULT:', pass ? 'PASS' : 'FAIL');
  console.log('NOTES: Redirected to:', finalUrl, '| Signup API status:', signupStatus);

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r02-screenshot.png' });
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
