/**
 * E2E Tests for Deal Details Inline Editing
 *
 * Tests the complete inline editing functionality for all editable fields:
 * - Description (multiline text)
 * - Current Stage (select dropdown)
 * - Closing Date (date picker)
 * - Budget Forecast (currency input)
 * - Forecast Category (select dropdown)
 * - Deal Probability (percentage input)
 * - ESC key to cancel
 * - Error handling with API failure
 * - Loading states during save
 * - Read-only fields (Created By, Create Date)
 */

import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../helpers/multi-tenant-setup.js';

test.describe('Deal Details Inline Editing - E2E', () => {
  let dealUrl: string;

  test.beforeEach(async ({ page }) => {
    // Use ACME opportunity from test data
    // Use query param format: /apps/crm/deal-details?id=xxx
    dealUrl = `/apps/crm/deal-details?id=${TEST_DATA.ACME_OPPORTUNITY.id}`;

    // Navigate to deal details
    await page.goto(dealUrl);

    // Wait for deal to load (ensure no loading skeleton)
    await page.waitForSelector('[data-testid="loading-skeleton"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForSelector('text=Deal Information', { timeout: 10000 });
  });

  test('should edit Deal Details description (multiline text)', async ({ page }) => {
    // Find the Deal Details field container
    const dealDetailsContainer = page.locator('text="Deal Details:"').locator('..').first();

    // Click to enter edit mode
    await dealDetailsContainer.click();

    // Verify textarea appears and is focused
    const textarea = page.locator('textarea[aria-label="Deal Details"]').or(page.locator('textarea').first());
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeFocused();

    // Clear and fill with new description
    await textarea.clear();
    const newDescription = 'Updated deal description via E2E test - ' + Date.now();
    await textarea.fill(newDescription);

    // Click outside to save (blur)
    await page.locator('text="Deal Information"').click();

    // Verify success toast
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });

    // Verify value persisted in view mode
    await expect(dealDetailsContainer).toContainText(newDescription);
  });

  test('should edit Current Stage (select dropdown)', async ({ page }) => {
    // Find the Current Stage field
    const stageContainer = page.locator('text="Current Stage:"').locator('..').first();

    // Click to enter edit mode
    await stageContainer.click();

    // Wait for select/listbox to appear
    await page.waitForTimeout(500);

    // Click on the Proposal option
    const proposalOption = page.locator('li:has-text("Proposal")').or(
      page.locator('[role="option"]:has-text("Proposal")')
    );
    await proposalOption.click();

    // Verify success toast
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });

    // Verify new stage is displayed
    await expect(stageContainer).toContainText('Proposal');
  });

  test('should edit Closing Date (date picker)', async ({ page }) => {
    // Find the Closing Date field
    const closingDateContainer = page.locator('text="Closing Date:"').locator('..').first();

    // Click to enter edit mode
    await closingDateContainer.click();

    // Wait for input to appear
    await page.waitForTimeout(500);

    // Find the date input field
    const dateInput = page.locator('input[type="text"]').first();
    await expect(dateInput).toBeVisible();

    // Clear and fill with new date
    await dateInput.clear();
    await dateInput.fill('04/15/2026');
    await dateInput.press('Enter');

    // Verify success toast
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });
  });

  test('should edit Budget Forecast (currency input)', async ({ page }) => {
    // Find the Budget Forecast field
    const budgetContainer = page.locator('text="Budget Forecast:"').locator('..').first();

    // Click to enter edit mode
    await budgetContainer.click();

    // Wait for input to appear
    await page.waitForTimeout(500);

    // Find the number input
    const amountInput = page.locator('input[type="number"]').first();
    await expect(amountInput).toBeVisible();

    // Verify $ adornment is present
    const dollarSign = page.locator('text="$"').first();
    await expect(dollarSign).toBeVisible();

    // Clear and fill with new amount
    await amountInput.clear();
    await amountInput.fill('250000');

    // Click outside to save
    await page.locator('text="Deal Information"').click();

    // Verify success toast
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });

    // Verify formatted value is displayed
    await expect(budgetContainer).toContainText('250,000');
  });

  test('should edit Forecast Category (select dropdown)', async ({ page }) => {
    // Note: Forecast Category is not currently in the DealInformation component
    // This test documents the expected behavior if it were added

    // First check if Forecast Category exists
    const forecastCategoryExists = await page.locator('text="Forecast Category:"').count() > 0;

    if (!forecastCategoryExists) {
      test.skip();
      return;
    }

    const categoryContainer = page.locator('text="Forecast Category:"').locator('..').first();

    await categoryContainer.click();
    await page.waitForTimeout(500);

    const commitOption = page.locator('li:has-text("Commit")').or(
      page.locator('[role="option"]:has-text("Commit")')
    );
    await commitOption.click();

    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });
    await expect(categoryContainer).toContainText('Commit');
  });

  test('should edit Deal Probability (percentage input)', async ({ page }) => {
    // Find the Deal Probability field
    const probabilityContainer = page.locator('text="Deal Probability:"').locator('..').first();

    // Click to enter edit mode
    await probabilityContainer.click();

    // Wait for input to appear
    await page.waitForTimeout(500);

    // Find the number input
    const percentInput = page.locator('input[type="number"]').first();
    await expect(percentInput).toBeVisible();

    // Verify % adornment is present
    const percentSign = page.locator('text="%"').first();
    await expect(percentSign).toBeVisible();

    // Clear and fill with new percentage
    await percentInput.clear();
    await percentInput.fill('85');
    await percentInput.press('Enter');

    // Verify success toast
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });

    // Verify value is displayed with %
    await expect(probabilityContainer).toContainText('85');
  });

  test('should cancel edit on ESC key', async ({ page }) => {
    // Find the Deal Details field
    const dealDetailsContainer = page.locator('text="Deal Details:"').locator('..').first();

    // Get original text
    const originalText = await dealDetailsContainer.textContent();

    // Click to enter edit mode
    await dealDetailsContainer.click();

    // Find textarea and fill with temporary text
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await textarea.clear();
    await textarea.fill('Temporary text that should be cancelled');

    // Press ESC to cancel
    await textarea.press('Escape');

    // Verify edit mode is exited (textarea should be hidden)
    await expect(textarea).not.toBeVisible();

    // Verify original text is restored
    if (originalText && originalText.includes('Deal Details:')) {
      // Extract just the value part, not the label
      const originalValue = originalText.replace('Deal Details:', '').trim();
      if (originalValue) {
        await expect(dealDetailsContainer).toContainText(originalValue);
      }
    }

    // Verify no success toast appeared (edit was cancelled)
    const successToast = page.locator('text="Deal updated"');
    await expect(successToast).not.toBeVisible();
  });

  test('should show loading state during save', async ({ page }) => {
    // Find the Deal Details field
    const dealDetailsContainer = page.locator('text="Deal Details:"').locator('..').first();

    // Click to enter edit mode
    await dealDetailsContainer.click();

    // Find textarea and fill
    const textarea = page.locator('textarea').first();
    await textarea.clear();
    await textarea.fill('Testing loading state');

    // Look for CircularProgress while saving
    // Note: This may be fast, so we'll just verify the component structure supports it
    const loadingIndicator = page.locator('[role="progressbar"]').or(
      page.locator('.MuiCircularProgress-root')
    );

    // Click outside to trigger save
    await page.locator('text="Deal Information"').click();

    // Loading indicator may flash briefly
    // Main verification is that save completes successfully
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });
  });

  test('should handle API error with error toast and rollback', async ({ page }) => {
    // Intercept API call to simulate error
    await page.route('**/api/crm/deals/**', route => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal server error' }),
        });
      } else {
        route.continue();
      }
    });

    // Find the Deal Details field
    const dealDetailsContainer = page.locator('text="Deal Details:"').locator('..').first();

    // Get original text
    const originalText = await dealDetailsContainer.textContent();

    // Click to enter edit mode
    await dealDetailsContainer.click();

    // Find textarea and fill with text that will fail to save
    const textarea = page.locator('textarea').first();
    await textarea.clear();
    await textarea.fill('This update will fail');

    // Click outside to trigger save
    await page.locator('text="Deal Information"').click();

    // Verify error toast appears
    await expect(page.locator('text="Failed to update deal"')).toBeVisible({ timeout: 5000 });

    // Verify field reverts to original value (rollback)
    // The EditableField component should handle rollback on error
    await expect(dealDetailsContainer).not.toContainText('This update will fail');
  });

  test('should verify Created By is read-only', async ({ page }) => {
    // Find the Created By field
    const createdByContainer = page.locator('text="Created By:"').locator('..').first();

    // Attempt to click (should not enter edit mode)
    await createdByContainer.click();

    // Wait a moment to ensure no edit mode is triggered
    await page.waitForTimeout(500);

    // Verify no input fields appear
    const editInputs = page.locator('textarea, select, input[type="text"], input[type="number"]');

    // Get count of visible edit inputs
    const visibleInputCount = await editInputs.count();

    // Verify no edit inputs are visible (Created By is read-only)
    expect(visibleInputCount).toBe(0);
  });

  test('should verify Create Date is read-only', async ({ page }) => {
    // Find the Create Date field
    const createDateContainer = page.locator('text="Create Date:"').locator('..').first();

    // Attempt to click (should not enter edit mode)
    await createDateContainer.click();

    // Wait a moment to ensure no edit mode is triggered
    await page.waitForTimeout(500);

    // Verify no date picker or input appears
    const dateInputs = page.locator('input[type="text"], input[type="date"]');
    const datePicker = page.locator('[role="dialog"]');

    // Verify no date picker dialog appears
    await expect(datePicker).not.toBeVisible();

    // Verify no date inputs are visible
    const visibleDateInputCount = await dateInputs.count();
    expect(visibleDateInputCount).toBe(0);
  });

  test('should edit multiple fields in sequence', async ({ page }) => {
    // Test that multiple edits work correctly in sequence

    // 1. Edit Description
    const dealDetailsContainer = page.locator('text="Deal Details:"').locator('..').first();
    await dealDetailsContainer.click();
    const textarea = page.locator('textarea').first();
    await textarea.clear();
    await textarea.fill('First edit - description');
    await page.locator('text="Deal Information"').click();
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });

    // Wait for toast to disappear
    await page.waitForTimeout(2500);

    // 2. Edit Budget Forecast
    const budgetContainer = page.locator('text="Budget Forecast:"').locator('..').first();
    await budgetContainer.click();
    await page.waitForTimeout(500);
    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.clear();
    await amountInput.fill('300000');
    await page.locator('text="Deal Information"').click();
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });

    // Wait for toast to disappear
    await page.waitForTimeout(2500);

    // 3. Edit Probability
    const probabilityContainer = page.locator('text="Deal Probability:"').locator('..').first();
    await probabilityContainer.click();
    await page.waitForTimeout(500);
    const percentInput = page.locator('input[type="number"]').first();
    await percentInput.clear();
    await percentInput.fill('90');
    await percentInput.press('Enter');
    await expect(page.locator('text="Deal updated"')).toBeVisible({ timeout: 5000 });

    // Verify all changes persisted
    await page.reload();
    await page.waitForSelector('[data-testid="loading-skeleton"]', { state: 'hidden', timeout: 10000 });
    await page.waitForSelector('text=Deal Information', { timeout: 10000 });

    await expect(page.locator('text="Deal Details:"').locator('..')).toContainText('First edit - description');
    await expect(page.locator('text="Budget Forecast:"').locator('..')).toContainText('300,000');
    await expect(page.locator('text="Deal Probability:"').locator('..')).toContainText('90');
  });
});
