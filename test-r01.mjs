import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

try {
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  // Check page title/heading
  const title = await page.title();
  const headingText = await page.locator('h1, h2, h3').first().textContent().catch(() => '');

  // Check for email input
  const emailInput = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').count();

  // Check for password input
  const passwordInput = await page.locator('input[type="password"]').count();

  // Check for sign in button
  const signInBtn = await page.locator('button:has-text("Sign In"), button:has-text("Log In"), button:has-text("Login"), button:has-text("Sign in")').count();

  // Check URL
  const url = page.url();

  console.log('URL:', url);
  console.log('Title:', title);
  console.log('Heading:', headingText);
  console.log('Email inputs:', emailInput);
  console.log('Password inputs:', passwordInput);
  console.log('Sign In buttons:', signInBtn);

  const hasAfterCallOrSignIn = title.includes('AfterCall') || title.includes('Sign In') ||
    headingText.includes('AfterCall') || headingText.includes('Sign In') || headingText.includes('Log In');

  if (emailInput > 0 && passwordInput > 0 && signInBtn > 0 && hasAfterCallOrSignIn) {
    console.log('RESULT: PASS');
  } else {
    console.log('RESULT: FAIL');
    console.log('Missing:', {
      emailInput: emailInput > 0,
      passwordInput: passwordInput > 0,
      signInBtn: signInBtn > 0,
      hasAfterCallOrSignIn
    });
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
