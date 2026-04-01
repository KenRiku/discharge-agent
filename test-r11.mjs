import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

async function login() {
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[name="email"]').first().fill('login@test.com');
  await page.locator('input[type="password"]').first().fill('TestPass123!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);
}

try {
  await login();

  // Navigate to patient creation page without filling anything
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  const urlBefore = page.url();
  console.log('Patient new page:', urlBefore);

  // Click submit without filling in any fields
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(1500);

  const urlAfter = page.url();
  console.log('URL after empty submit:', urlAfter);

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const stayedOnPage = urlAfter.includes('/patients/new') || urlAfter === urlBefore;
  const hasValidationError = bodyText.includes('required') || bodyText.includes('Required') ||
    bodyText.includes('invalid') || bodyText.includes('Invalid') ||
    bodyText.includes('must') || bodyText.includes('error') || bodyText.includes('Error');

  // Also check for red borders / validation classes in HTML
  const pageHTML = await page.content();
  const hasRedBorder = pageHTML.includes('border-red') || pageHTML.includes('ring-red') ||
    pageHTML.includes('error') || pageHTML.includes('invalid');

  console.log('Stayed on page:', stayedOnPage);
  console.log('Has validation error text:', hasValidationError);
  console.log('Has visual validation indicator:', hasRedBorder);
  console.log('Page content (first 500):', bodyText.substring(0, 500));

  if (stayedOnPage && (hasValidationError || hasRedBorder)) {
    console.log('RESULT: PASS');
  } else if (stayedOnPage) {
    console.log('RESULT: PARTIAL - Stayed on page but no visible validation errors');
  } else {
    console.log('RESULT: FAIL - Form navigated away without validation');
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
