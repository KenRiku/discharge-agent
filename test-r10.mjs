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

  // Navigate to escalations page
  await page.goto('http://localhost:3000/escalations', { waitUntil: 'networkidle' });
  console.log('Escalations URL:', page.url());

  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.log('Escalations content (first 600):', bodyText.substring(0, 600));

  const pageLoaded = !bodyText.includes('Error') && !bodyText.includes('500') && !bodyText.includes('not found');
  const hasEscalationContent = bodyText.includes('Escalation') || bodyText.includes('escalation');
  const hasEmptyState = bodyText.includes('No escalations') || bodyText.includes('empty') || bodyText.includes('no escalation');
  const hasSeverity = bodyText.includes('RED') || bodyText.includes('YELLOW') || bodyText.includes('red') || bodyText.includes('yellow');

  console.log('Page loaded without error:', pageLoaded);
  console.log('Has escalation content:', hasEscalationContent);
  console.log('Has empty state or severity indicators:', hasEmptyState || hasSeverity);

  if (pageLoaded && hasEscalationContent) {
    console.log('RESULT: PASS');
  } else if (pageLoaded) {
    console.log('RESULT: PARTIAL - Page loads but unclear escalation content');
  } else {
    console.log('RESULT: FAIL');
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
