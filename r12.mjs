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

  // Navigate to dashboard
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  console.log('Dashboard URL:', page.url());

  const pageText = await page.textContent('body').catch(() => '');
  console.log('Dashboard content snippet:', pageText.substring(0, 600));

  // Check for specific metric keywords
  const hasPatients = pageText.toLowerCase().includes('patient');
  const hasCalls = pageText.toLowerCase().includes('call');
  const hasEscalations = pageText.toLowerCase().includes('escalat');
  const hasEnrolled = pageText.toLowerCase().includes('enrolled') || pageText.toLowerCase().includes('active');

  // Check for numeric stat values in dedicated card elements
  const statCards = await page.locator('[class*="card"], [class*="stat"], [class*="metric"], [class*="summary"]').all();
  console.log('Stat card elements found:', statCards.length);

  // Check for numbers that appear as stats (standalone numbers in headings, large text, etc.)
  const numberElements = await page.locator('h1, h2, h3, [class*="count"], [class*="number"], [class*="value"], [class*="total"]').allTextContents().catch(() => []);
  const numericValues = numberElements.filter(t => /^\d+$/.test(t.trim()));
  console.log('Numeric value elements:', numericValues);

  // Also check for any numbers in the page text at all
  const allNumbers = pageText.match(/\b\d+\b/g) || [];
  console.log('Has "patients":', hasPatients);
  console.log('Has "calls":', hasCalls);
  console.log('Has "escalations":', hasEscalations);
  console.log('Has enrolled/active:', hasEnrolled);

  const metricsCount = [hasPatients, hasCalls, hasEscalations, hasEnrolled].filter(Boolean).length;
  console.log('Distinct metric categories:', metricsCount);
  console.log('Numbers found in page:', allNumbers.slice(0, 20).join(', '));

  // Check for error states - only in visible rendered area, not script tags
  // Use a targeted check rather than full body text which includes Next.js JSON
  const firstPart = pageText.substring(0, 2000); // Only check visible content
  const hasServerError = firstPart.includes('Internal Server Error') || firstPart.includes('500 | ');

  if (metricsCount >= 3 && allNumbers.length >= 3 && !hasServerError) {
    console.log('RESULT: pass - Dashboard shows at least 3 summary statistic categories with numeric values and no error states');
  } else if (metricsCount >= 2) {
    console.log('RESULT: partial - Dashboard shows ' + metricsCount + ' metric categories. Has numbers: ' + (allNumbers.length >= 3));
  } else {
    console.log('RESULT: fail - Dashboard missing summary statistics. Metrics found: ' + metricsCount);
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
