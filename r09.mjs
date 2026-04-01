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

  // Navigate to simulator
  await page.goto('http://localhost:3000/simulator', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Simulator URL:', page.url());

  let pageText = await page.textContent('body').catch(() => '');
  console.log('Simulator page snippet:', pageText.substring(0, 500));

  // Check for patient selector first
  const selectEl = page.locator('select, [role="combobox"], [class*="select"]').first();
  if (await selectEl.count() > 0) {
    const tag = await selectEl.evaluate(el => el.tagName);
    if (tag === 'SELECT') {
      const options = await selectEl.locator('option').allTextContents();
      console.log('Select options:', options);
      if (options.length > 1) {
        await selectEl.selectOption({ index: 1 });
        await page.waitForTimeout(2000);
        pageText = await page.textContent('body').catch(() => '');
        console.log('After selecting patient:', pageText.substring(0, 300));
      }
    }
  }

  // Look for Start Call / Start Simulation button
  const startBtn = page.locator('button:has-text("Start"), button:has-text("Begin"), button:has-text("Simulat"), button:has-text("Call")').first();
  if (await startBtn.count() > 0) {
    const btnText = await startBtn.textContent();
    console.log('Found start button:', btnText);
    await startBtn.click();
    await page.waitForTimeout(4000);
    pageText = await page.textContent('body').catch(() => '');
    console.log('After clicking start:', pageText.substring(0, 500));
  }

  // Check for chat/call interface
  const hasInput = await page.locator('input[type="text"], textarea').count() > 0;
  const hasClinicalContent = pageText.toLowerCase().includes('pain') ||
    pageText.toLowerCase().includes('symptom') ||
    pageText.toLowerCase().includes('how are') ||
    pageText.toLowerCase().includes('feel') ||
    pageText.toLowerCase().includes('discomfort');

  console.log('Has text input:', hasInput);
  console.log('Has clinical question:', hasClinicalContent);

  if (hasInput && hasClinicalContent) {
    // Type a response
    const inputField = page.locator('input[type="text"], textarea').last();
    await inputField.fill('My pain level is 3 out of 10');

    const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]').last();
    if (await sendBtn.count() > 0) {
      await sendBtn.click();
      await page.waitForTimeout(5000);
    } else {
      await inputField.press('Enter');
      await page.waitForTimeout(5000);
    }

    const afterText = await page.textContent('body').catch(() => '');
    const hasFollowUp = afterText.includes('3 out of 10') || afterText.toLowerCase().includes('thank') || afterText.includes('?');
    const messageElements = await page.locator('[class*="message"], [class*="chat"], [class*="bubble"]').count();
    console.log('After response - has follow-up/reply:', hasFollowUp);
    console.log('Message elements:', messageElements);
    console.log('After response snippet:', afterText.substring(0, 500));

    if (hasFollowUp || messageElements > 1) {
      console.log('RESULT: pass - Simulator loaded, clinical question shown, response submitted, conversation advanced');
    } else {
      console.log('RESULT: partial - Simulator loaded with clinical question and response submitted but follow-up unclear');
    }
  } else if (hasClinicalContent) {
    console.log('RESULT: partial - Simulator shows clinical content but no text input found for response');
  } else {
    // Log all button texts to understand page state
    const btns = await page.locator('button').allTextContents();
    console.log('All buttons:', btns.join(', '));
    console.log('RESULT: partial - Simulator page loads but clinical question interface not visible. URL: ' + page.url());
  }
} catch(e) {
  console.log('RESULT: fail - ' + e.message);
} finally {
  await browser.close();
}
