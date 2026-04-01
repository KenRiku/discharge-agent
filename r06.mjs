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
  console.log('After login:', page.url());

  // Go to add patient
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Add patient URL:', page.url());

  // Log all inputs
  const inputs = await page.locator('input, select, textarea').all();
  for (const inp of inputs) {
    const attrs = await inp.evaluate(el => ({ name: el.name, id: el.id, type: el.type, placeholder: el.placeholder }));
    console.log('Input:', JSON.stringify(attrs));
  }

  // Fill patient name
  await page.locator('input[name="name"], input[placeholder*="name" i]').first().fill('John Doe');

  // Fill date of birth
  const dobFields = await page.locator('input[type="date"]').all();
  console.log('Date inputs found:', dobFields.length);
  if (dobFields.length > 0) {
    await dobFields[0].fill('1980-01-15');
  }

  // Fill phone
  const phoneField = page.locator('input[name*="phone" i], input[type="tel"], input[placeholder*="phone" i]').first();
  if (await phoneField.count() > 0) {
    await phoneField.fill('555-0100');
  }

  // Select procedure type
  const procedureSelect = page.locator('select[name*="procedure" i], select[id*="procedure" i]').first();
  if (await procedureSelect.count() > 0) {
    const options = await procedureSelect.locator('option').allTextContents();
    console.log('Procedure options:', options);
    const firstNonEmpty = options.findIndex(o => o.trim() && o.toLowerCase() !== 'select' && o.toLowerCase() !== 'choose');
    await procedureSelect.selectOption({ index: firstNonEmpty >= 0 ? firstNonEmpty : 1 });
  }

  // Set discharge date to today
  const today = new Date().toISOString().split('T')[0];
  if (dobFields.length > 1) {
    await dobFields[1].fill(today);
  }
  // Also try by name
  const dischargeField = page.locator('input[name*="discharge" i], input[id*="discharge" i]').first();
  if (await dischargeField.count() > 0) {
    await dischargeField.fill(today);
  }

  // Submit
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(4000);
  console.log('After submit URL:', page.url());

  // Navigate to /patients
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const pageText = await page.textContent('body').catch(() => '');
  const hasJohnDoe = pageText.includes('John Doe');
  console.log('John Doe visible on /patients:', hasJohnDoe);

  if (hasJohnDoe) {
    console.log('RESULT: pass - Patient John Doe created and visible on /patients page');
  } else {
    const errors = await page.locator('[role="alert"], .error').allTextContents().catch(() => []);
    console.log('Errors:', errors);
    console.log('Page snippet:', pageText.substring(0, 400));
    console.log('RESULT: fail - John Doe not visible on /patients');
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
