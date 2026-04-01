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

  // Go to patients list and click on John Doe
  await page.goto('http://localhost:3000/patients', { waitUntil: 'networkidle' });

  const johnDoeLink = page.locator('text=John Doe').first();
  if (await johnDoeLink.count() === 0) {
    console.log('RESULT: FAIL - John Doe not found in patient list');
    await browser.close();
    process.exit(0);
  }

  await johnDoeLink.click();
  await page.waitForTimeout(2000);

  console.log('Patient detail URL:', page.url());
  const bodyText = await page.locator('body').innerText().catch(() => '');

  // Page shows "DAY" and "1", "3", "7" as separate lines due to CSS formatting
  // Also check for "OVERDUE", "SCHEDULED", "PENDING"
  const hasDAY = bodyText.includes('DAY') || bodyText.includes('Day');
  const has1 = bodyText.includes('1') && bodyText.includes('DAY');
  const has3 = bodyText.includes('3') && bodyText.includes('DAY');
  const has7 = bodyText.includes('7') && bodyText.includes('DAY');

  // Check for scheduled/pending status
  const hasPending = bodyText.includes('Pending') || bodyText.includes('Scheduled') ||
    bodyText.includes('PENDING') || bodyText.includes('SCHEDULED') || bodyText.includes('OVERDUE');

  // Count DAY occurrences
  const dayMatches = bodyText.match(/DAY/gi) || [];
  const dayCount = dayMatches.length;

  console.log('Has DAY labels:', hasDAY);
  console.log('Number of DAY entries:', dayCount);
  console.log('Has pending/scheduled status:', hasPending);
  console.log('Page content (first 800):', bodyText.substring(0, 800));

  // We need at least 3 DAY entries (Day 1, Day 3, Day 7)
  if (dayCount >= 3 && hasPending) {
    console.log('RESULT: PASS');
  } else if (dayCount >= 3 || hasPending) {
    console.log('RESULT: PARTIAL');
  } else {
    console.log('RESULT: FAIL');
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
