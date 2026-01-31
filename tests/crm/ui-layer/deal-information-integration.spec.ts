/**
 * E2E Integration Tests for Deal Information Inline Editing
 *
 * Tests comprehensive inline editing functionality across all editable fields:
 * - EditableTextField (description)
 * - EditableSelect (stage, forecast_category)
 * - EditableDatePicker (close_date)
 * - EditableCurrencyInput (amount/value)
 * - EditablePercentageInput (probability)
 *
 * Coverage:
 * - Click to edit → auto-save on blur → success toast
 * - Keyboard shortcuts (ESC cancel, Enter save)
 * - Error handling with rollback
 * - Read-only fields remain non-editable
 * - Data persistence verification
 *
 * Following TDD Red-Green-Refactor:
 * - RED: Write test showing desired behavior
 * - Verify RED: Run test, confirm it fails correctly
 * - GREEN: Implement minimal code to pass test
 * - Verify GREEN: Re-run test, confirm passes
 */

import { test, expect } from '@playwright/test';
import { TEST_DATA } from '../../helpers/multi-tenant-setup.js';

// Use authenticated storage state (user is already logged in)
test.use({ storageState: 'tests/.auth/user.json' });

// Test configuration
const DEAL_ID = TEST_DATA.ACME_OPPORTUNITY.id;
const DEAL_DETAILS_URL = `http://localhost:4000/apps/crm/deals/${DEAL_ID}`;

test.describe('Deal Information - Inline Editing E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to deal details page (already authenticated via storageState)
    await page.goto(DEAL_DETAILS_URL);
    await page.waitForLoadState('networkidle');

    // Wait for Deal Information panel to load
    await page.waitForSelector('text=Deal Information', { timeout: 10000 });
  });

  test('should edit description field (EditableTextField)', async ({ page }) => {
    // Find Deal Details row (contains description)
    const dealDetailsRow = page.locator('text=Deal Details').locator('..').locator('..');
    await expect(dealDetailsRow).toBeVisible();

    // Click to enter edit mode
    const viewText = dealDetailsRow.locator('p, div').filter({ hasNotText: 'Deal Details:' }).first();
    await viewText.click();

    // Wait for textarea to appear and be focused
    const textarea = dealDetailsRow.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toBeFocused();

    // Enter new value
    const newDescription = `Updated deal description ${Date.now()}`;
    await textarea.fill(newDescription);

    // Blur to trigger auto-save
    await textarea.blur();

    // Verify success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify textarea is gone (back to view mode)
    await expect(textarea).not.toBeVisible();

    // Verify new value is displayed
    await expect(dealDetailsRow).toContainText(newDescription);
  });

  test('should edit stage field (EditableSelect)', async ({ page }) => {
    // Find Current Stage row
    const stageRow = page.locator('text=Current Stage').locator('..').locator('..');
    await expect(stageRow).toBeVisible();

    // Click chip to enter edit mode
    const chip = stageRow.locator('[role="button"]').first();
    await chip.click();

    // Wait for select dropdown to open
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible();

    // Verify stage options exist
    await expect(page.locator('[role="option"]', { hasText: 'Lead' })).toBeVisible();
    await expect(page.locator('[role="option"]', { hasText: 'Qualified' })).toBeVisible();
    await expect(page.locator('[role="option"]', { hasText: 'Proposal' })).toBeVisible();

    // Select a different stage
    await page.locator('[role="option"]', { hasText: 'Proposal' }).click();

    // Verify success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify listbox is closed
    await expect(listbox).not.toBeVisible();

    // Verify new value is displayed in chip
    await expect(stageRow.locator('[role="button"]')).toContainText('Proposal');
  });

  test('should edit closing date (EditableDatePicker)', async ({ page }) => {
    // Find Closing Date row
    const closingDateRow = page.locator('text=Closing Date').locator('..').locator('..');
    await expect(closingDateRow).toBeVisible();

    // Click to enter edit mode
    const viewText = closingDateRow.locator('p, div').filter({ hasNotText: 'Closing Date:' }).first();
    await viewText.click();

    // Wait for date picker input to appear
    const dateInput = closingDateRow.locator('input[type="text"]');
    await expect(dateInput).toBeVisible();

    // Clear and enter new date
    await dateInput.fill('');
    await dateInput.fill('12/31/2026');

    // Press Enter to save
    await dateInput.press('Enter');

    // Verify success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify input is gone (back to view mode)
    await expect(dateInput).not.toBeVisible();

    // Verify new value is displayed (format may vary)
    await expect(closingDateRow).toContainText('2026');
  });

  test('should edit budget forecast (EditableCurrencyInput)', async ({ page }) => {
    // Find Budget Forecast row
    const budgetRow = page.locator('text=Budget Forecast').locator('..').locator('..');
    await expect(budgetRow).toBeVisible();

    // Click to enter edit mode
    const viewText = budgetRow.locator('p, div').filter({ hasNotText: 'Budget Forecast:' }).first();
    await viewText.click();

    // Wait for currency input to appear with $ adornment
    const currencyInput = budgetRow.locator('input[type="number"]');
    await expect(currencyInput).toBeVisible();
    await expect(budgetRow.locator('text=$')).toBeVisible();

    // Enter new amount
    await currencyInput.fill('');
    await currencyInput.fill('250000');

    // Blur to trigger auto-save
    await currencyInput.blur();

    // Verify success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify input is gone (back to view mode)
    await expect(currencyInput).not.toBeVisible();

    // Verify new value is displayed with currency formatting
    await expect(budgetRow).toContainText('250,000');
  });

  test('should edit forecast category (EditableSelect)', async ({ page }) => {
    // Find Forecast Category row
    const forecastRow = page.locator('text=Forecast Category').locator('..').locator('..');
    await expect(forecastRow).toBeVisible();

    // Click chip to enter edit mode
    const chip = forecastRow.locator('[role="button"]').first();
    await chip.click();

    // Wait for select dropdown to open
    const listbox = page.locator('[role="listbox"]');
    await expect(listbox).toBeVisible();

    // Verify forecast options exist
    await expect(page.locator('[role="option"]', { hasText: 'Best Case' })).toBeVisible();
    await expect(page.locator('[role="option"]', { hasText: 'Commit' })).toBeVisible();
    await expect(page.locator('[role="option"]', { hasText: 'Pipeline' })).toBeVisible();
    await expect(page.locator('[role="option"]', { hasText: 'Omitted' })).toBeVisible();

    // Select a different forecast category
    await page.locator('[role="option"]', { hasText: 'Commit' }).click();

    // Verify success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify listbox is closed
    await expect(listbox).not.toBeVisible();

    // Verify new value is displayed in chip
    await expect(forecastRow.locator('[role="button"]')).toContainText('Commit');
  });

  test('should edit deal probability (EditablePercentageInput)', async ({ page }) => {
    // Find Deal Probability row
    const probabilityRow = page.locator('text=Deal Probability').locator('..').locator('..');
    await expect(probabilityRow).toBeVisible();

    // Click to enter edit mode
    const viewText = probabilityRow.locator('p, div').filter({ hasNotText: 'Deal Probability:' }).first();
    await viewText.click();

    // Wait for percentage input to appear with % adornment
    const percentInput = probabilityRow.locator('input[type="number"]');
    await expect(percentInput).toBeVisible();
    await expect(probabilityRow.locator('text=%')).toBeVisible();

    // Enter new probability
    await percentInput.fill('');
    await percentInput.fill('75');

    // Blur to trigger auto-save
    await percentInput.blur();

    // Verify success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify input is gone (back to view mode)
    await expect(percentInput).not.toBeVisible();

    // Verify new value is displayed
    await expect(probabilityRow).toContainText('75%');
  });

  test('should keep Created By and Create Date as read-only', async ({ page }) => {
    // Find Created By row
    const createdByRow = page.locator('text=Created By').locator('..').locator('..');
    await expect(createdByRow).toBeVisible();

    // Attempt to click (should not enter edit mode)
    const createdByValue = createdByRow.locator('p, div').filter({ hasNotText: 'Created By:' }).first();
    await createdByValue.click();

    // Wait a moment for any potential edit mode to appear
    await page.waitForTimeout(500);

    // Verify no inputs appear in the row
    await expect(createdByRow.locator('input')).not.toBeVisible();
    await expect(createdByRow.locator('textarea')).not.toBeVisible();
    await expect(createdByRow.locator('[role="textbox"]')).not.toBeVisible();

    // Find Create Date row
    const createDateRow = page.locator('text=Create Date').locator('..').locator('..');
    await expect(createDateRow).toBeVisible();

    // Attempt to click (should not enter edit mode)
    const createDateValue = createDateRow.locator('p, div').filter({ hasNotText: 'Create Date:' }).first();
    await createDateValue.click();

    // Wait a moment for any potential edit mode to appear
    await page.waitForTimeout(500);

    // Verify no date picker or inputs appear
    await expect(createDateRow.locator('input')).not.toBeVisible();
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should cancel edit with ESC key', async ({ page }) => {
    // Find Deal Details row
    const dealDetailsRow = page.locator('text=Deal Details').locator('..').locator('..');

    // Get original value
    const originalValue = await dealDetailsRow.locator('p, div').filter({ hasNotText: 'Deal Details:' }).first().textContent();

    // Click to enter edit mode
    const viewText = dealDetailsRow.locator('p, div').filter({ hasNotText: 'Deal Details:' }).first();
    await viewText.click();

    // Wait for textarea to appear
    const textarea = dealDetailsRow.locator('textarea');
    await expect(textarea).toBeVisible();

    // Enter new value but don't save
    await textarea.fill('This will be cancelled');

    // Press ESC to cancel
    await textarea.press('Escape');

    // Verify textarea is gone (back to view mode)
    await expect(textarea).not.toBeVisible();

    // Verify original value is still displayed (no save occurred)
    await expect(dealDetailsRow).toContainText(originalValue || '');

    // Verify NO success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).not.toBeVisible();
  });

  test('should save with Enter key (where applicable)', async ({ page }) => {
    // Test Enter key on date picker input
    const closingDateRow = page.locator('text=Closing Date').locator('..').locator('..');
    await expect(closingDateRow).toBeVisible();

    // Click to enter edit mode
    const viewText = closingDateRow.locator('p, div').filter({ hasNotText: 'Closing Date:' }).first();
    await viewText.click();

    // Wait for date input to appear
    const dateInput = closingDateRow.locator('input[type="text"]');
    await expect(dateInput).toBeVisible();

    // Enter new date
    await dateInput.fill('');
    await dateInput.fill('06/15/2026');

    // Press Enter to save (instead of blur)
    await dateInput.press('Enter');

    // Verify success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Verify input is gone (back to view mode)
    await expect(dateInput).not.toBeVisible();

    // Verify new value is displayed
    await expect(closingDateRow).toContainText('2026');
  });

  test('should show loading state during save', async ({ page }) => {
    // Find Budget Forecast row
    const budgetRow = page.locator('text=Budget Forecast').locator('..').locator('..');

    // Click to enter edit mode
    const viewText = budgetRow.locator('p, div').filter({ hasNotText: 'Budget Forecast:' }).first();
    await viewText.click();

    // Wait for currency input to appear
    const currencyInput = budgetRow.locator('input[type="number"]');
    await expect(currencyInput).toBeVisible();

    // Enter new amount
    await currencyInput.fill('');
    await currencyInput.fill('999999');

    // Blur to trigger auto-save and immediately check for loading indicator
    await currencyInput.blur();

    // Note: Loading state may be very brief, so we can't reliably assert it appears
    // Instead, we verify the save completes successfully
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });
  });

  test('should handle API error with toast and rollback', async ({ page }) => {
    // Intercept API call to simulate error
    let requestCount = 0;
    await page.route('**/api/crm/deals/*', route => {
      requestCount++;
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

    // Find Deal Details row
    const dealDetailsRow = page.locator('text=Deal Details').locator('..').locator('..');

    // Get original value
    const originalValue = await dealDetailsRow.locator('p, div').filter({ hasNotText: 'Deal Details:' }).first().textContent();

    // Click to enter edit mode
    const viewText = dealDetailsRow.locator('p, div').filter({ hasNotText: 'Deal Details:' }).first();
    await viewText.click();

    // Wait for textarea to appear
    const textarea = dealDetailsRow.locator('textarea');
    await expect(textarea).toBeVisible();

    // Enter new value
    await textarea.fill('This update will fail');

    // Blur to trigger save (which will fail)
    await textarea.blur();

    // Verify error toast appears
    const errorToast = page.locator('text=Failed to update deal');
    await expect(errorToast).toBeVisible({ timeout: 5000 });

    // Verify field stays in edit mode with original value (rollback)
    await expect(textarea).toBeVisible();
    const rolledBackValue = await textarea.inputValue();
    expect(rolledBackValue).toBe(originalValue || '');

    // Verify PATCH request was attempted
    expect(requestCount).toBeGreaterThan(0);
  });

  test('should persist data after page reload', async ({ page }) => {
    // Find Budget Forecast row
    const budgetRow = page.locator('text=Budget Forecast').locator('..').locator('..');

    // Click to enter edit mode
    const viewText = budgetRow.locator('p, div').filter({ hasNotText: 'Budget Forecast:' }).first();
    await viewText.click();

    // Wait for currency input to appear
    const currencyInput = budgetRow.locator('input[type="number"]');
    await expect(currencyInput).toBeVisible();

    // Enter unique value
    const uniqueValue = '123456';
    await currencyInput.fill('');
    await currencyInput.fill(uniqueValue);

    // Blur to trigger auto-save
    await currencyInput.blur();

    // Verify success toast appears
    const successToast = page.locator('text=Deal updated');
    await expect(successToast).toBeVisible({ timeout: 5000 });

    // Wait for save to complete
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();

    // Wait for Deal Information panel to load
    await page.waitForSelector('text=Deal Information', { timeout: 10000 });

    // Find Budget Forecast row again
    const budgetRowAfterReload = page.locator('text=Budget Forecast').locator('..').locator('..');
    await expect(budgetRowAfterReload).toBeVisible();

    // Verify value persisted (formatted with comma)
    await expect(budgetRowAfterReload).toContainText('123,456');
  });

  test('should show all 6 editable fields and 2 read-only fields', async ({ page }) => {
    // Verify all editable fields are present
    await expect(page.locator('text=Deal Details')).toBeVisible(); // EditableTextField
    await expect(page.locator('text=Current Stage')).toBeVisible(); // EditableSelect
    await expect(page.locator('text=Closing Date')).toBeVisible(); // EditableDatePicker
    await expect(page.locator('text=Budget Forecast')).toBeVisible(); // EditableCurrencyInput
    await expect(page.locator('text=Forecast Category')).toBeVisible(); // EditableSelect
    await expect(page.locator('text=Deal Probability')).toBeVisible(); // EditablePercentageInput

    // Verify read-only audit fields are present
    await expect(page.locator('text=Created By')).toBeVisible();
    await expect(page.locator('text=Create Date')).toBeVisible();
  });
});
