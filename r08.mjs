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

  // Navigate to /patients
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const patientsText = await page.textContent('body').catch(() => '');
  const hasJohnDoe = patientsText.includes('John Doe');
  console.log('John Doe visible on patients list:', hasJohnDoe);

  if (!hasJohnDoe) {
    // Create patient first
    await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="dob"]').fill('1980-01-15');
    await page.locator('input[name="phone"]').fill('555-0100');
    await page.locator('select[name="procedureType"]').selectOption({ index: 1 });
    const today = new Date().toISOString().split('T')[0];
    await page.locator('input[name="dischargeDate"]').fill(today);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(3000);
    await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
  }

  // Click on first patient detail link (href matches /patients/{cuid})
  const patientDetailLinks = await page.locator('a[href*="/patients/c"]').all();
  console.log('Patient detail links found:', patientDetailLinks.length);
  if (patientDetailLinks.length > 0) {
    await patientDetailLinks[0].click();
  } else {
    throw new Error('No patient detail links found');
  }

  await page.waitForTimeout(2000);
  console.log('Patient detail URL:', page.url());

  const detailText = await page.textContent('body').catch(() => '');
  console.log('Detail page snippet:', detailText.substring(0, 600));

  // Check for scheduled calls
  const hasDay1 = detailText.includes('Day 1') || detailText.match(/day\s*1/i) || detailText.includes('1 Day');
  const hasDay3 = detailText.includes('Day 3') || detailText.match(/day\s*3/i) || detailText.includes('3 Day');
  const hasDay7 = detailText.includes('Day 7') || detailText.match(/day\s*7/i) || detailText.includes('7 Day');
  const hasPending = detailText.toLowerCase().includes('pending') || detailText.toLowerCase().includes('scheduled');
  const hasFollowUp = detailText.toLowerCase().includes('follow') || detailText.toLowerCase().includes('call');

  console.log('Has Day 1:', hasDay1);
  console.log('Has Day 3:', hasDay3);
  console.log('Has Day 7:', hasDay7);
  console.log('Has Pending/Scheduled status:', hasPending);
  console.log('Has follow-up/call mention:', hasFollowUp);

  // Count pending/scheduled call status items
  const allTextItems = await page.locator('td, li, span, div').allTextContents().catch(() => []);
  const pendingItems = allTextItems.filter(t => t.toLowerCase().includes('pending') || t.toLowerCase().includes('scheduled'));
  console.log('Pending/Scheduled items count:', pendingItems.length);

  if ((hasDay1 || hasDay3 || hasDay7) && hasPending) {
    const allDays = [hasDay1 && 'Day 1', hasDay3 && 'Day 3', hasDay7 && 'Day 7'].filter(Boolean);
    if (allDays.length >= 3) {
      console.log('RESULT: pass - Patient detail page shows Day 1, Day 3, Day 7 follow-up calls with Pending/Scheduled status');
    } else {
      console.log('RESULT: partial - Patient detail page shows ' + allDays.join(', ') + ' with Pending/Scheduled status but not all 3 days');
    }
  } else if (hasFollowUp && pendingItems.length >= 3) {
    console.log('RESULT: pass - Patient detail page shows at least 3 scheduled follow-up calls');
  } else if (hasFollowUp || hasPending) {
    console.log('RESULT: partial - Some follow-up info present but could not verify 3 scheduled calls with status. Days: D1=' + hasDay1 + ' D3=' + hasDay3 + ' D7=' + hasDay7 + ' Pending=' + hasPending);
  } else {
    console.log('RESULT: fail - No scheduled follow-up calls visible on patient detail page');
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
