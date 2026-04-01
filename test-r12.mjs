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

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Dashboard URL:', page.url());
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('Dashboard content (first 800):', bodyText.substring(0, 800));

  // Look for stat keywords
  const hasPatients = bodyText.includes('Patient') || bodyText.includes('Patients');
  const hasCalls = bodyText.includes('Call') || bodyText.includes('Calls');
  const hasEscalations = bodyText.includes('Escalation') || bodyText.includes('Escalations');
  const hasEnrolled = bodyText.includes('Enrolled');
  const hasNumbers = /\d+/.test(bodyText);

  // Count how many stat categories are present
  const statCount = [hasPatients, hasCalls, hasEscalations, hasEnrolled].filter(Boolean).length;

  console.log('Has Patients:', hasPatients);
  console.log('Has Calls:', hasCalls);
  console.log('Has Escalations:', hasEscalations);
  console.log('Has Enrolled:', hasEnrolled);
  console.log('Has numbers:', hasNumbers);
  console.log('Stat category count:', statCount);

  // Check for error state
  const hasError = bodyText.includes('Error') || bodyText.includes('failed') || bodyText.includes('500');

  if (statCount >= 3 && hasNumbers && !hasError) {
    console.log('RESULT: PASS');
  } else if (statCount >= 2 || hasNumbers) {
    console.log('RESULT: PARTIAL');
  } else {
    console.log('RESULT: FAIL');
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
