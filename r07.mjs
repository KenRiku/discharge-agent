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

  // Create a patient
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  await page.locator('input[name="name"]').fill('John Doe');
  await page.locator('input[name="dob"]').fill('1980-01-15');
  await page.locator('input[name="phone"]').fill('555-0100');
  const procedureSelect = page.locator('select[name="procedureType"]');
  await procedureSelect.selectOption({ index: 1 }); // Appendectomy
  const today = new Date().toISOString().split('T')[0];
  await page.locator('input[name="dischargeDate"]').fill(today);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForTimeout(3000);

  // Navigate to /patients
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  let pageText = await page.textContent('body').catch(() => '');
  let hasJohnDoe = pageText.includes('John Doe');
  console.log('John Doe visible before reload:', hasJohnDoe);

  if (!hasJohnDoe) {
    console.log('Page content:', pageText.substring(0, 500));
    throw new Error('John Doe not visible before reload');
  }

  // Reload the page
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  pageText = await page.textContent('body').catch(() => '');
  hasJohnDoe = pageText.includes('John Doe');
  console.log('John Doe visible after reload:', hasJohnDoe);

  if (!hasJohnDoe) {
    console.log('RESULT: fail - John Doe not visible after reload');
    await browser.close();
    process.exit(0);
  }

  // Click on View → link in John Doe's row - use href pattern /patients/[id]
  const viewLinks = await page.locator('a[href*="/patients/c"]').all();
  console.log('Patient detail links found:', viewLinks.length);

  if (viewLinks.length > 0) {
    await viewLinks[0].click();
    await page.waitForTimeout(2000);
    console.log('Patient detail URL:', page.url());

    const detailText = await page.textContent('body').catch(() => '');
    const hasProcedureType = detailText.toLowerCase().includes('appendectomy') || detailText.toLowerCase().includes('procedure') || detailText.toLowerCase().includes('surgery');
    const hasDischargeDate = detailText.toLowerCase().includes('discharge');
    console.log('Detail page has procedure type:', hasProcedureType);
    console.log('Detail page has discharge date:', hasDischargeDate);
    console.log('Detail page snippet:', detailText.substring(0, 500));

    if (hasJohnDoe && hasProcedureType && hasDischargeDate) {
      console.log('RESULT: pass - John Doe persists after reload and detail page shows procedure type and discharge date');
    } else if (hasJohnDoe) {
      const missing = [];
      if (!hasProcedureType) missing.push('procedure type');
      if (!hasDischargeDate) missing.push('discharge date');
      console.log('RESULT: partial - John Doe persists but detail page missing: ' + missing.join(', '));
    }
  } else {
    console.log('RESULT: partial - John Doe persists after reload but could not find clickable link to detail page');
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
