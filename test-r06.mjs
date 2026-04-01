import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

async function login() {
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.locator('input[type="email"], input[name="email"]').first().fill('login@test.com');
  await page.locator('input[type="password"]').first().fill('TestPass123!');
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);
  console.log('Logged in, URL:', page.url());
}

try {
  await login();

  // Navigate to patient creation
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  console.log('Patient new page:', page.url());

  // If not at /patients/new, try /patients and click Add Patient
  if (!page.url().includes('/patients/new')) {
    await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
    const addBtn = page.locator('a:has-text("Add Patient"), button:has-text("Add Patient"), a:has-text("New Patient"), button:has-text("New Patient")').first();
    if (await addBtn.count() > 0) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  console.log('Patient form page:', page.url());

  // Fill in patient name
  const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[id*="name" i]').first();
  await nameInput.fill('John Doe');

  // Fill in date of birth
  const dobInput = page.locator('input[name="dob"], input[type="date"][name*="dob" i], input[type="date"]').first();
  await dobInput.fill('1980-01-15');

  // Fill in phone
  const phoneInput = page.locator('input[name="phone"], input[placeholder*="phone" i], input[type="tel"]').first();
  await phoneInput.fill('555-0100');

  // Select procedure type
  const procedureSelect = page.locator('select[name="procedureType"], select[name="procedure"]');
  if (await procedureSelect.count() > 0) {
    // Get options and select the first one or Appendectomy
    const options = await procedureSelect.locator('option').allTextContents();
    console.log('Procedure options:', options);
    const hasAppendectomy = options.some(o => o.includes('Appendectomy'));
    if (hasAppendectomy) {
      await procedureSelect.selectOption({ label: options.find(o => o.includes('Appendectomy')) });
    } else {
      await procedureSelect.selectOption({ index: 1 }); // Skip placeholder option
    }
  }

  // Fill in discharge date
  const dischargeDateInput = page.locator('input[name="dischargeDate"], input[type="date"]:not([name="dob"])').first();
  await dischargeDateInput.fill('2026-03-31');

  // Submit the form
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(3000);

  console.log('After submit URL:', page.url());

  const currentUrl = page.url();
  const bodyText = await page.locator('body').innerText().catch(() => '');

  const hasSuccess = bodyText.includes('success') || bodyText.includes('Success') || bodyText.includes('created') || bodyText.includes('John Doe');
  const isPatientList = currentUrl.includes('/patients') && !currentUrl.includes('/new');

  console.log('URL after create:', currentUrl);
  console.log('Has success indicator:', hasSuccess);

  // Navigate to /patients and check for John Doe
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  const patientsBodyText = await page.locator('body').innerText().catch(() => '');
  const hasJohnDoe = patientsBodyText.includes('John Doe');
  console.log('John Doe in patient list:', hasJohnDoe);

  if (hasJohnDoe) {
    console.log('RESULT: PASS');
  } else {
    console.log('RESULT: FAIL');
    console.log('Patient list content (first 500):', patientsBodyText.substring(0, 500));
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('Page content:', bodyText.substring(0, 500));
}

await browser.close();
