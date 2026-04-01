import { chromium } from 'playwright';

const browser = await chromium.launch();
const testEmail = `logout_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  // Create user and login
  const page = await browser.newPage();

  // Sign up
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'Logout Tester');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPass);
  const roleSelect = await page.$('select');
  if (roleSelect) await page.selectOption('select', 'NURSE');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('After signup URL:', page.url());

  // Find and click logout
  const bodyText = await page.textContent('body');
  console.log('Looking for sign out / logout button...');

  // Try common logout selectors
  const logoutBtn = await page.$('button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("Log Out"), a:has-text("Sign Out"), a:has-text("Logout"), a:has-text("Log Out")');
  console.log('Logout button found:', !!logoutBtn);

  if (!logoutBtn) {
    // Maybe it's in a menu - look for all buttons/links
    const allBtns = await page.$$eval('button, a', els => els.map(el => el.textContent?.trim()).filter(t => t));
    console.log('All buttons/links:', allBtns.slice(0, 20));
  }

  if (logoutBtn) {
    await logoutBtn.click();
    await page.waitForTimeout(3000);
  }

  const urlAfterLogout = page.url();
  console.log('URL after logout click:', urlAfterLogout);

  // Navigate to dashboard while unauthenticated
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const urlAfterDashboardNav = page.url();
  console.log('URL after navigating to /dashboard unauthenticated:', urlAfterDashboardNav);

  const logoutWorked = urlAfterLogout.includes('/login') || urlAfterLogout.includes('/signin') || urlAfterLogout.includes('localhost:3000/login');
  const redirectWorked = urlAfterDashboardNav.includes('/login') || urlAfterDashboardNav.includes('/signin');

  console.log('Logout redirected to login:', logoutWorked);
  console.log('Dashboard redirected to login:', redirectWorked);

  if (logoutWorked && redirectWorked) {
    console.log('RESULT: PASS');
  } else if (logoutWorked || redirectWorked) {
    console.log('RESULT: PARTIAL');
  } else {
    console.log('RESULT: FAIL');
  }

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r04-screenshot.png' });
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
