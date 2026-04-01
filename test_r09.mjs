import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const testEmail = `r09b_${Date.now()}@test.com`;
const testPass = 'TestPass123!';

try {
  const page = await browser.newPage();

  // Sign up
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"], input[placeholder*="name" i]', 'R09 Nurse');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPass);
  const rs = await page.$('select');
  if (rs) await page.selectOption('select', 'NURSE');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Create a patient
  await page.goto('http://localhost:3000/patients/new', { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'Sim Patient');
  await page.fill('input[name="dob"]', '1970-01-01');
  await page.fill('input[name="phone"]', '555-0100');
  await page.selectOption('select[name="procedureType"]', 'Appendectomy');
  const today = new Date().toISOString().split('T')[0];
  await page.fill('input[name="dischargeDate"]', today);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Go to simulator
  await page.goto('http://localhost:3000/simulator', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Select a patient
  const patientSelect = await page.$('select');
  if (patientSelect) {
    const options = await patientSelect.$$eval('option', opts => opts.map(o => ({ value: o.value, text: o.textContent?.trim() })));
    console.log('Patient options:', options);
    // Select first non-empty option
    const validOpt = options.find(o => o.value && o.value !== '');
    if (validOpt) {
      await patientSelect.selectOption(validOpt.value);
      console.log('Selected patient:', validOpt.text);
    }
  }

  await page.waitForTimeout(2000);
  let bodyAfterSelect = await page.textContent('body');
  console.log('Body after patient select:', bodyAfterSelect.substring(0, 800));

  // Look for call start button
  const startBtn = await page.$('button:has-text("Start"), button:has-text("Call"), button:has-text("Simulate"), button:has-text("Begin")');
  console.log('Start button found:', !!startBtn);
  if (startBtn) {
    console.log('Start button text:', await startBtn.textContent());
    await startBtn.click();
    await page.waitForTimeout(5000);
  }

  let bodyAfterStart = await page.textContent('body');
  console.log('Body after start:', bodyAfterStart.substring(0, 1000));

  // Check for chat/call interface
  const hasChatInput = !!(await page.$('input[type="text"], textarea'));
  const hasMessages = bodyAfterStart.includes('pain') || bodyAfterStart.includes('feel') || bodyAfterStart.includes('symptom') || bodyAfterStart.includes('question');
  console.log('Has chat input:', hasChatInput);
  console.log('Has clinical question text:', hasMessages);

  if (hasChatInput) {
    const chatInput = await page.$('input[type="text"], textarea');
    await chatInput.fill('My pain level is 3 out of 10, I feel okay');
    const sendBtn = await page.$('button:has-text("Send"), button[type="submit"]');
    if (sendBtn) {
      await sendBtn.click();
      await page.waitForTimeout(8000); // OpenAI call might take a while
    }
    const bodyAfterReply = await page.textContent('body');
    console.log('Body after reply:', bodyAfterReply.substring(0, 1000));
    const conversationAdvanced = bodyAfterReply.length > bodyAfterStart.length;
    console.log('Conversation advanced:', conversationAdvanced);
  }

  await page.screenshot({ path: '/c/Users/fresh/src/fully-baked-projects/fully-baked-discharge-agent/r09-simulator-final.png' });

  const simLoaded = !!(await page.$('select')) && page.url().includes('/simulator');
  const hasInterface = hasChatInput || hasMessages || bodyAfterStart.includes('Call') || bodyAfterStart.includes('call');

  if (simLoaded && hasChatInput && hasMessages) {
    console.log('RESULT: PASS');
  } else if (simLoaded && hasInterface) {
    console.log('RESULT: PARTIAL');
    console.log('NOTES: Simulator loads and patient selection works; Start Call button behavior - chat input found:', hasChatInput);
  } else {
    console.log('RESULT: FAIL');
  }
} catch (e) {
  console.error('ERROR:', e.message);
  console.log('RESULT: FAIL');
} finally {
  await browser.close();
}
