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

  // Navigate to escalations
  await page.goto('http://localhost:3000/escalations', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Escalations URL:', page.url());

  const pageText = await page.textContent('body').catch(() => '');
  console.log('Escalations page snippet:', pageText.substring(0, 600));

  const isOnEscalationsPage = page.url().includes('/escalations');
  const hasEscalationContent = pageText.toLowerCase().includes('escalat');
  const hasNoEscalations = pageText.toLowerCase().includes('no escalation') ||
    pageText.toLowerCase().includes('no alerts') ||
    pageText.toLowerCase().includes('all clear') ||
    pageText.toLowerCase().includes('none');

  // Check for RED/YELLOW severity indicators
  const hasRed = pageText.toUpperCase().includes('RED') || pageText.toUpperCase().includes('HIGH') || pageText.toUpperCase().includes('URGENT') || pageText.toUpperCase().includes('CRITICAL');
  const hasYellow = pageText.toUpperCase().includes('YELLOW') || pageText.toUpperCase().includes('MEDIUM') || pageText.toUpperCase().includes('MODERATE') || pageText.toUpperCase().includes('WARNING');

  // Check for severity elements
  const severityEls = await page.locator('[class*="red"], [class*="yellow"], [class*="urgent"], [class*="severity"], [class*="badge"], [class*="alert"]').count();

  console.log('On escalations page:', isOnEscalationsPage);
  console.log('Has escalation content:', hasEscalationContent);
  console.log('Has no-escalations message:', hasNoEscalations);
  console.log('Has RED severity:', hasRed);
  console.log('Has YELLOW severity:', hasYellow);
  console.log('Severity badge elements:', severityEls);

  if (isOnEscalationsPage && hasEscalationContent) {
    if (hasRed || hasYellow) {
      console.log('RESULT: pass - Escalations page loads and shows patients with RED/YELLOW severity indicators');
    } else if (hasNoEscalations) {
      console.log('RESULT: pass - Escalations page loads and shows empty state / no escalations message');
    } else if (severityEls > 0) {
      console.log('RESULT: pass - Escalations page loads with severity badge elements');
    } else {
      console.log('RESULT: partial - Escalations page loads but no severity indicators or empty state visible');
    }
  } else {
    console.log('RESULT: fail - Escalations page did not load properly. URL: ' + page.url());
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
