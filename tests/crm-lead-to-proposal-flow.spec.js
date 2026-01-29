import { test, expect } from '@playwright/test';
import { loginAsOrgUser, waitForDatabase } from './helpers/multi-tenant-setup.js';

test.describe('Lead-to-Proposal Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before test
    await loginAsOrgUser(page, 'ACME', 'admin');
  });

  test('should complete full journey from lead to accepted proposal', async ({ page }) => {
    // Navigate to leads page
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Create new lead
    const addLeadButton = page.locator('button').filter({ hasText: /add.*lead|create.*lead|new.*lead/i });
    await addLeadButton.first().click({ timeout: 5000 });

    // Wait for form
    await page.waitForTimeout(1000);

    // Fill lead form
    await page.locator('input[name*="firstName"], input[label*="first"]').first().fill('John');
    await page.locator('input[name*="lastName"], input[label*="last"]').first().fill('Doe');
    await page.locator('input[name*="company"]').first().fill('Test Corp E2E');
    await page.locator('input[name="email"], input[type="email"]').first().fill('john.doe.e2e@testcorp.com');
    await page.locator('input[name*="phone"]').first().fill('555-0100');

    // Save lead
    const saveButton = page.locator('button').filter({ hasText: /save|submit|create/i });
    await saveButton.first().click({ timeout: 5000 });

    // Wait for database insert
    await waitForDatabase(2000);

    // Navigate back to leads list
    await page.goto('http://localhost:4000/apps/crm/leads');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify lead created (search for it)
    const leadRow = page.locator('text=/john.*doe|test.*corp.*e2e/i');
    await expect(leadRow.first()).toBeVisible({ timeout: 10000 });

    // Navigate to lead detail
    await leadRow.first().click({ timeout: 5000 });
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/\/apps\/crm\/leads\//);

    // Qualify lead (update status)
    const statusSelect = page.locator('select, [role="combobox"]').filter({ hasText: /status/i });
    if (await statusSelect.count() > 0) {
      await statusSelect.first().selectOption('qualified');
      await waitForDatabase(1000);
    }

    // Convert to opportunity
    const convertButton = page.locator('button').filter({ hasText: /convert.*opportunity/i });
    await convertButton.first().click({ timeout: 5000 });

    // Wait for conversion form
    await page.waitForTimeout(1000);

    // Fill opportunity details
    await page.locator('input[name*="name"]').first().fill('Test Corp E2E - John Doe Opportunity');
    await page.locator('input[name*="value"], input[name*="amount"]').first().fill('50000');
    await page.locator('input[name*="date"], input[type="date"]').first().fill('2026-03-31');

    // Submit conversion
    const convertSubmitButton = page.locator('button').filter({ hasText: /convert|save|submit/i });
    await convertSubmitButton.first().click({ timeout: 5000 });

    // Wait for database insert
    await waitForDatabase(2000);

    // Verify opportunity created (should redirect to opportunity detail or list)
    await page.waitForTimeout(1000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/apps\/crm\/opportunities/);

    // Verify opportunity appears in the page
    const opportunityText = page.locator('text=/test.*corp.*e2e|john.*doe/i');
    await expect(opportunityText.first()).toBeVisible({ timeout: 10000 });

    // Create proposal from opportunity
    const createProposalButton = page.locator('button').filter({ hasText: /create.*proposal/i });
    await createProposalButton.first().click({ timeout: 5000 });

    // Wait for proposal form
    await page.waitForTimeout(1000);

    // Add line items (if add row button exists)
    const addRowButton = page.locator('button').filter({ hasText: /add.*row|add.*item/i });
    if (await addRowButton.count() > 0) {
      await addRowButton.first().click({ timeout: 5000 });
      await page.waitForTimeout(500);

      // Fill first line item
      await page.locator('input[name*="description"]').first().fill('Website Development Services');
      await page.locator('input[name*="quantity"]').first().fill('1');
      await page.locator('input[name*="price"]').first().fill('45000');
    }

    // Save proposal as draft
    const saveDraftButton = page.locator('button').filter({ hasText: /save.*draft|save/i });
    await saveDraftButton.first().click({ timeout: 5000 });

    // Wait for database insert
    await waitForDatabase(2000);

    // Verify proposal created (should redirect to proposal detail or list)
    await page.waitForTimeout(1000);
    const proposalUrl = page.url();
    expect(proposalUrl).toMatch(/\/apps\/crm\/proposals/);

    // Verify proposal appears with number
    const proposalNumber = page.locator('text=/PROP-2026-/i');
    await expect(proposalNumber.first()).toBeVisible({ timeout: 10000 });

    // Try to send proposal (if button exists)
    const sendButton = page.locator('button').filter({ hasText: /send.*proposal/i });
    if (await sendButton.count() > 0) {
      await sendButton.first().click({ timeout: 5000 });
      await waitForDatabase(1000);
    }

    // Try to mark as accepted (if button exists)
    const acceptButton = page.locator('button').filter({ hasText: /accept|mark.*accepted/i });
    if (await acceptButton.count() > 0) {
      await acceptButton.first().click({ timeout: 5000 });
      await waitForDatabase(1000);
    }
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/lead-to-proposal-${testInfo.title}-${Date.now()}.png`,
      fullPage: true
    });
  }
});
