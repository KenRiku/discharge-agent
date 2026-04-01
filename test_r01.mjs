import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  const emailInput = await page.$('input[type="email"], input[name="email"], input[placeholder*="email" i], input[placeholder*="Email" i]');
  const passwordInput = await page.$('input[type="password"]');
  const signInBtn = await page.$('button[type="submit"], button:has-text("Sign In"), button:has-text("Log In"), button:has-text("Login")');

  const title = await page.title();
  const headingText = await page.textContent('h1, h2, h3').catch(() => '');
  const bodyText = await page.textContent('body');

  console.log('Title:', title);
  console.log('Heading text:', headingText);
  console.log('Email input found:', !!emailInput);
  console.log('Password input found:', !!passwordInput);
  console.log('Sign In button found:', !!signInBtn);

  const hasAfterCall = bodyText.includes('AfterCall') || title.includes('AfterCall');
  const hasSignIn = bodyText.includes('Sign In') || bodyText.includes('Log In') || bodyText.includes('Login');

  console.log('Has AfterCall branding:', hasAfterCall);
  console.log('Has Sign In text:', hasSignIn);

  const pass = !!emailInput && !!passwordInput && !!signInBtn && (hasAfterCall || hasSignIn);
  console.log('RESULT:', pass ? 'PASS' : 'FAIL');

  // Screenshot for debugging
  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r01-screenshot.png' });
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
