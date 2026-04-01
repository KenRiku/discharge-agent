import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[name="email"]').first().fill('r03login@test.com');
  await page.locator('input[type="password"]').first().fill('TestPass123!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(5000);

  // Navigate to add patient page
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Add patient URL:', page.url());

  const urlBefore = page.url();

  // Click submit WITHOUT filling any fields
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(2000);

  const urlAfter = page.url();
  console.log('URL after submitting empty form:', urlAfter);

  const didNotNavigate = urlAfter === urlBefore || urlAfter.includes('/patients/new');

  // Check for validation errors
  const errorElements = await page.locator('[class*="error"], [class*="invalid"], [class*="required"], [role="alert"], .text-red-500, .text-destructive').allTextContents().catch(() => []);
  const hasValidationErrors = errorElements.filter(t => t.trim().length > 0).length > 0;

  // Check for HTML5 validation
  const invalidInputs = await page.evaluate(() => {
    return document.querySelectorAll('input:invalid, select:invalid, textarea:invalid').length;
  }).catch(() => 0);

  // Check for any visible error text in the page
  const pageText = await page.textContent('body').catch(() => '');
  const hasErrorText = pageText.toLowerCase().includes('required') ||
    pageText.toLowerCase().includes('invalid') ||
    pageText.toLowerCase().includes('must fill') ||
    pageText.toLowerCase().includes('please');

  console.log('Did not navigate away:', didNotNavigate);
  console.log('Validation error elements:', errorElements.filter(t => t.trim()).length, errorElements.filter(t => t.trim()).join(', '));
  console.log('Invalid inputs (HTML5):', invalidInputs);
  console.log('Has error text:', hasErrorText);

  if (didNotNavigate && (hasValidationErrors || invalidInputs > 0 || hasErrorText)) {
    console.log('RESULT: pass - Form stays on page and shows validation errors for empty required fields');
  } else if (didNotNavigate) {
    console.log('RESULT: partial - Form stays on page without navigating but no explicit validation error messages visible (likely HTML5 browser validation). Invalid fields: ' + invalidInputs);
  } else {
    console.log('RESULT: fail - Form navigated away from /patients/new without validation. URL: ' + urlAfter);
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
