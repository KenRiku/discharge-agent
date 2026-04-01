import { chromium } from 'playwright';

const browser = await chromium.launch();
const testEmail = `r07_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  const page = await browser.newPage();

  // Sign up
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'R07 Nurse');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPass);
  const roleSelect = await page.$('select');
  if (roleSelect) await page.selectOption('select', 'NURSE');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Create patient
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="dob"]', '1970-01-01');
  await page.fill('input[name="phone"]', '555-0100');
  await page.selectOption('select[name="procedureType"]', 'Appendectomy');
  const today = new Date().toISOString().split('T')[0];
  await page.fill('input[name="dischargeDate"]', today);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const urlAfterCreate = page.url();
  console.log('After patient create URL:', urlAfterCreate);

  // Navigate to /patients
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Reload the page
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const bodyAfterReload = await page.textContent('body');
  console.log('John Doe visible after reload:', bodyAfterReload.includes('John Doe'));

  // Click on John Doe's row
  const patientRow = await page.$('tr:has-text("John Doe"), a:has-text("John Doe"), [data-patient]:has-text("John Doe")');
  console.log('Patient row/link found:', !!patientRow);

  if (patientRow) {
    await patientRow.click();
    await page.waitForTimeout(2000);
    const detailUrl = page.url();
    console.log('Detail page URL:', detailUrl);

    const detailBody = await page.textContent('body');
    console.log('Has Appendectomy:', detailBody.includes('Appendectomy'));
    console.log('Has discharge date:', detailBody.includes(today) || detailBody.includes('Apr') || detailBody.includes('2026'));

    const pass = bodyAfterReload.includes('John Doe') && detailBody.includes('Appendectomy');
    console.log('RESULT:', pass ? 'PASS' : 'PARTIAL');
    console.log('Notes: Reloaded patients list shows John Doe:', bodyAfterReload.includes('John Doe'),
                '| Detail shows Appendectomy:', detailBody.includes('Appendectomy'),
                '| Detail shows date:', detailBody.includes(today) || detailBody.includes('Apr') || detailBody.includes('2026'));

    await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r07-detail.png' });
  } else {
    console.log('Could not click patient row');
    console.log('RESULT:', bodyAfterReload.includes('John Doe') ? 'PARTIAL' : 'FAIL');
    await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r07-patients.png' });
  }
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
