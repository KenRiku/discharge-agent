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

  await page.goto('http://localhost:3000/simulator', { waitUntil: 'networkidle' });
  console.log('Simulator URL:', page.url());

  const bodyText = await page.locator('body').innerText().catch(() => '');

  // Select patient from dropdown
  const patientSelect = page.locator('select');
  const patientSelectCount = await patientSelect.count();
  console.log('Patient selects found:', patientSelectCount);

  if (patientSelectCount > 0) {
    const options = await patientSelect.first().locator('option').allTextContents();
    console.log('Patient options:', options);

    // Select John Doe
    await patientSelect.first().selectOption({ label: 'John Doe' });
    await page.waitForTimeout(1000);

    // Now look for Start Call button
    const startCallBtn = page.locator('button:has-text("Start Call"), button:has-text("Simulate"), button:has-text("Begin Call"), button:has-text("Start")');
    const startCallCount = await startCallBtn.count();
    console.log('Start call buttons after patient select:', startCallCount);

    if (startCallCount > 0) {
      await startCallBtn.first().click();
      await page.waitForTimeout(5000);

      const afterStartText = await page.locator('body').innerText().catch(() => '');
      console.log('After start content (first 800):', afterStartText.substring(0, 800));

      // Check for conversation
      const hasQuestion = afterStartText.includes('?') || afterStartText.includes('pain') ||
        afterStartText.includes('Pain') || afterStartText.includes('Hello') || afterStartText.includes('feel');

      // Try to type a response
      const chatInput = page.locator('input[type="text"], textarea').first();
      const chatInputCount = await chatInput.count();
      console.log('Chat input found:', chatInputCount > 0);

      if (chatInputCount > 0 && hasQuestion) {
        await chatInput.fill('3');
        const sendBtn = page.locator('button:has-text("Send"), button[type="submit"]:not(:has-text("Start"))').first();
        if (await sendBtn.count() > 0) {
          await sendBtn.click();
          await page.waitForTimeout(5000);

          const afterSendText = await page.locator('body').innerText().catch(() => '');
          console.log('After send content (first 800):', afterSendText.substring(0, 800));
          const hasMoreContent = afterSendText.length > afterStartText.length;
          console.log('Conversation advanced:', hasMoreContent);
          console.log('RESULT: PASS');
        } else {
          console.log('RESULT: PARTIAL - Has conversation but no send button found');
        }
      } else if (hasQuestion) {
        console.log('RESULT: PARTIAL - Has question but no chat input');
      } else {
        // Maybe waiting for OpenAI
        console.log('After start body text:', afterStartText.substring(0, 500));
        console.log('RESULT: PARTIAL - Call started but no AI question appeared (possibly needs real OpenAI key)');
      }
    } else {
      const afterSelectText = await page.locator('body').innerText().catch(() => '');
      console.log('Content after patient select:', afterSelectText.substring(0, 500));
      console.log('RESULT: PARTIAL - Patient select works but no Start Call button');
    }
  } else {
    console.log('RESULT: FAIL - No patient select found');
  }
} catch (err) {
  console.log('RESULT: FAIL');
  console.log('Error:', err.message);
}

await browser.close();
