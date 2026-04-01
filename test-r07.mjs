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

  // Navigate to patients and reload
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });

  const bodyText = await page.locator('body').innerText().catch(() => '');
  const hasJohnDoe = bodyText.includes('John Doe');
  console.log('John Doe in patient list after reload:', hasJohnDoe);

  if (!hasJohnDoe) {
    console.log('RESULT: FAIL - John Doe not found after reload');
    console.log('Page content:', bodyText.substring(0, 500));
    await browser.close();
    process.exit(0);
  }

  // Click on John Doe to go to detail page
  const johnDoeLink = page.locator('text=John Doe').first();
  await johnDoeLink.click();
  await page.waitForTimeout(2000);

  console.log('Patient detail URL:', page.url());
  const detailBodyText = await page.locator('body').innerText().catch(() => '');

  // Check for procedure type and discharge date
  const hasProcedure = detailBodyText.includes('Appendectomy') || detailBodyText.includes('appendectomy') ||
    detailBodyText.includes('procedure') || detailBodyText.includes('Procedure');
  const hasDischargeDate = detailBodyText.includes('2026') || detailBodyText.includes('Mar') || detailBodyText.includes('March') || detailBodyText.includes('discharge') || detailBodyText.includes('Discharge');

  console.log('Has procedure info:', hasProcedure);
  console.log('Has discharge date:', hasDischargeDate);
  console.log('Detail page content (first 500):', detailBodyText.substring(0, 500));

  if (hasJohnDoe && hasProcedure) {
    console.log('RESULT: PASS');
  } else if (hasJohnDoe) {
    console.log('RESULT: PARTIAL - Found in list but detail page incomplete');
  } else {
    console.log('RESULT: FAIL');
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
