import { chromium } from 'playwright';

const browser = await chromium.launch();
const testEmail = `patient_creator_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  const page = await browser.newPage();

  // Sign up and login
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'Nurse Creator');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPass);
  const roleSelect = await page.$('select');
  if (roleSelect) await page.selectOption('select', 'NURSE');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('After signup:', page.url());

  // Navigate to patient creation
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('Patient new page URL:', page.url());

  const bodyText = await page.textContent('body');
  console.log('Body snippet:', bodyText.substring(0, 600));

  // Capture all inputs
  const inputs = await page.$$eval('input, select, textarea', els => els.map(el => ({
    tag: el.tagName,
    type: el.getAttribute('type'),
    name: el.getAttribute('name'),
    placeholder: el.getAttribute('placeholder'),
    id: el.getAttribute('id'),
  })));
  console.log('Form fields:', JSON.stringify(inputs, null, 2));

  // Fill name
  const nameInput = await page.$('input[name="name"], input[placeholder*="name" i], input[placeholder*="Name" i]');
  if (nameInput) {
    await nameInput.fill('John Doe');
    console.log('Filled name: John Doe');
  }

  // Fill DOB - try common formats
  const dobInput = await page.$('input[name="dateOfBirth"], input[name="dob"], input[type="date"]');
  if (dobInput) {
    await dobInput.fill('1970-01-01');
    console.log('Filled DOB: 1970-01-01');
  }

  // Fill phone
  const phoneInput = await page.$('input[name="phone"], input[placeholder*="phone" i], input[type="tel"]');
  if (phoneInput) {
    await phoneInput.fill('555-0100');
    console.log('Filled phone: 555-0100');
  }

  // Select procedure type
  const procedureSelect = await page.$('select[name="procedureId"], select[name="procedure"], select');
  if (procedureSelect) {
    const options = await procedureSelect.$$eval('option', opts => opts.map(o => ({ value: o.value, text: o.textContent })));
    console.log('Procedure options:', options);
    // Select first non-empty option or Appendectomy
    const appendOption = options.find(o => o.text?.includes('Appendectomy'));
    if (appendOption) {
      await procedureSelect.selectOption(appendOption.value);
    } else if (options.length > 1) {
      await procedureSelect.selectOption({ index: 1 });
    }
    console.log('Selected procedure');
  }

  // Fill discharge date (today)
  const today = new Date().toISOString().split('T')[0];
  const dischargeDateInput = await page.$('input[name="dischargeDate"], input[name="discharge_date"]');
  if (dischargeDateInput) {
    await dischargeDateInput.fill(today);
    console.log('Filled discharge date:', today);
  }

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r06-before-submit.png' });

  // Submit
  const submitBtn = await page.$('button[type="submit"]');
  console.log('Submit button found:', !!submitBtn);
  if (submitBtn) {
    let patientApiStatus = null;
    page.on('response', r => {
      if (r.url().includes('/api/patients')) patientApiStatus = r.status();
    });
    await submitBtn.click();
    await page.waitForTimeout(5000);
    console.log('Patient API status:', patientApiStatus);
  }

  const urlAfterSubmit = page.url();
  console.log('URL after submit:', urlAfterSubmit);

  // Navigate to /patients and check for John Doe
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  const patientsBody = await page.textContent('body');
  console.log('Has John Doe on patients list:', patientsBody.includes('John Doe'));

  const success = patientsBody.includes('John Doe') && (urlAfterSubmit.includes('/patients') || urlAfterSubmit.includes('/dashboard'));
  console.log('RESULT:', success ? 'PASS' : (patientsBody.includes('John Doe') ? 'PARTIAL' : 'FAIL'));

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r06-patients-list.png' });
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
