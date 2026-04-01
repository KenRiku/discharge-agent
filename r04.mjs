import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  // Login with existing user
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[name="email"]').first().fill('r03login@test.com');
  await page.locator('input[type="password"]').first().fill('TestPass123!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(5000);
  console.log('After login URL:', page.url());

  if (!page.url().includes('/dashboard')) {
    throw new Error('Login failed, not at dashboard');
  }

  // Find and click logout
  const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Log out"), a:has-text("Logout"), a:has-text("Sign out"), a:has-text("Log out")');
  const logoutCount = await logoutBtn.count();
  console.log('Logout buttons found:', logoutCount);

  if (logoutCount === 0) {
    const allBtnText = await page.locator('button, a[href]').allTextContents();
    console.log('All buttons/links:', allBtnText.filter(t => t.trim()).join(' | '));
    throw new Error('No logout button found');
  }

  await logoutBtn.first().click();
  await page.waitForTimeout(3000);

  const urlAfterLogout = page.url();
  console.log('URL after logout:', urlAfterLogout);
  const redirectedToLogin = urlAfterLogout.includes('/login') || urlAfterLogout.includes('/signin');

  // Try to navigate to dashboard
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const urlAfterDashboardNav = page.url();
  console.log('URL after navigating to /dashboard:', urlAfterDashboardNav);
  const redirectedFromDashboard = urlAfterDashboardNav.includes('/login') || urlAfterDashboardNav.includes('/signin');

  if (redirectedToLogin && redirectedFromDashboard) {
    console.log('RESULT: pass - Logout redirected to /login and /dashboard also redirects to /login');
  } else if (redirectedToLogin) {
    console.log('RESULT: partial - Logout redirected to login but /dashboard did not redirect back to login. URL: ' + urlAfterDashboardNav);
  } else {
    console.log('RESULT: fail - Logout did not redirect to login. URL after logout: ' + urlAfterLogout);
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
