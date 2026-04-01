import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  const title = await page.title();
  const heading = await page.textContent('h1, h2, h3').catch(() => '');
  const pageText = await page.textContent('body');

  const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').count();
  const passwordInput = await page.locator('input[type="password"]').count();
  const signInBtn = await page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Log")').count();

  const hasAfterCall = pageText.includes('AfterCall') || title.includes('AfterCall');
  const hasSignIn = pageText.toLowerCase().includes('sign in') || pageText.toLowerCase().includes('log in') || pageText.toLowerCase().includes('login');

  console.log('Title:', title);
  console.log('Page heading:', heading);
  console.log('Email inputs:', emailInput);
  console.log('Password inputs:', passwordInput);
  console.log('Sign-in buttons:', signInBtn);
  console.log('Has AfterCall text:', hasAfterCall);
  console.log('Has sign-in text:', hasSignIn);

  if (emailInput > 0 && passwordInput > 0 && signInBtn > 0 && (hasAfterCall || hasSignIn)) {
    console.log('RESULT: pass - Login page renders with email input, password input, sign-in button, and relevant heading/title');
  } else {
    const missing = [];
    if (emailInput === 0) missing.push('email input');
    if (passwordInput === 0) missing.push('password input');
    if (signInBtn === 0) missing.push('sign-in button');
    if (!hasAfterCall && !hasSignIn) missing.push('AfterCall/Sign In text');
    console.log('RESULT: fail - Missing: ' + missing.join(', '));
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
