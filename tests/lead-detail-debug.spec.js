import { test, expect } from '@playwright/test';

test('debug lead detail page', async ({ page }) => {
  const errors = [];
  const consoleMessages = [];

  // Capture console messages
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
  });

  // Capture page errors
  page.on('pageerror', error => {
    errors.push(error.toString());
  });

  await page.goto('http://localhost:4000/apps/crm/leads/lead_001');
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({ path: 'debug-lead-detail.png', fullPage: true });

  // Get page content
  const content = await page.content();
  console.log('Page title:', await page.title());
  console.log('Page has "Lead Details":', content.includes('Lead Details'));
  console.log('Page has "Status":', content.includes('Status'));
  console.log('Page has error text:', content.includes('error') || content.includes('Error'));

  // Log errors and console messages
  console.log('\n=== ERRORS ===');
  errors.forEach(err => console.log(err));

  console.log('\n=== CONSOLE MESSAGES (last 10) ===');
  consoleMessages.slice(-10).forEach(msg => console.log(msg));

  // Check for specific error elements
  const errorElement = page.locator('text=/error|not found/i').first();
  if (await errorElement.isVisible()) {
    console.log('\n=== ERROR MESSAGE ON PAGE ===');
    console.log(await errorElement.textContent());
  }
});
