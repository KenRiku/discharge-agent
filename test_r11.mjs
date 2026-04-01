import { chromium } from 'playwright';

const browser = await chromium.launch();
const testEmail = `r11_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  const page = await browser.newPage();

  // Sign up
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'R11 Nurse');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPass);
  const rs = await page.$('select');
  if (rs) await page.selectOption('select', 'NURSE');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Navigate to add patient page
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const initialUrl = page.url();
  console.log('Initial URL (patients/new):', initialUrl);

  // Click submit without filling any fields
  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) {
    await submitBtn.click();
    await page.waitForTimeout(2000);
  }

  const urlAfterSubmit = page.url();
  const visibleText = await page.evaluate(() => document.body.innerText);

  console.log('URL after empty submit:', urlAfterSubmit);
  console.log('Did NOT navigate away:', urlAfterSubmit === initialUrl || urlAfterSubmit.includes('/patients/new'));
  console.log('Visible text after submit:', visibleText.substring(0, 800));

  // Check for browser validation (HTML5 required attribute - no navigation but also no JS error messages necessarily)
  // Check for custom validation error messages
  const hasValidationMsg = /required|invalid|error|field|fill|please|must/i.test(visibleText);
  const hasHtmlValidation = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input, select, textarea');
    for (const input of inputs) {
      if (input.validity && !input.validity.valid) return true;
      if (input.required && !input.value) return true;
    }
    return false;
  });

  // Check if there are visible error messages via DOM
  const errorElements = await page.$$('[class*="error"], [class*="invalid"], .text-red, [aria-invalid="true"]');
  console.log('Has validation text in page:', hasValidationMsg);
  console.log('Has HTML5 validation (required fields empty):', hasHtmlValidation);
  console.log('Error element count:', errorElements.length);

  // Most importantly: did the form stay on the same page (not navigate away)?
  const stayedOnPage = urlAfterSubmit.includes('/patients/new');

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r11-validation.png' });

  if (stayedOnPage && (hasHtmlValidation || hasValidationMsg || errorElements.length > 0)) {
    console.log('RESULT: PASS');
  } else if (stayedOnPage) {
    console.log('RESULT: PARTIAL');
    console.log('NOTES: Form did not navigate away on empty submit (good), but no visible validation error messages detected');
  } else {
    console.log('RESULT: FAIL');
    console.log('NOTES: Form navigated away to', urlAfterSubmit, 'without validation');
  }
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
