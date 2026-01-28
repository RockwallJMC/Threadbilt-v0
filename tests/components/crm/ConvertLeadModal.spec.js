import { test, expect } from '@playwright/test';

// Local login helper to replace missing '../../helpers/authHelper'
async function loginUser(page, email, password, context) {
  // Navigate to login page
  await page.goto('http://localhost:4000/login');

  // Fill in credentials using accessible labels
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);

  // Submit the login form
  const submitButton = page.getByRole('button', { name: /log in|login|sign in/i });
  await submitButton.click();

  // Wait for navigation and network to be idle after login
  await page.waitForLoadState('networkidle');
}
test.describe('ConvertLeadModal', () => {
  test.beforeEach(async ({ page, context }) => {
    page.setDefaultNavigationTimeout(60000);

    // Login as demo user
    await loginUser(page, 'demo@aurora.com', 'password123', context);

    // Navigate to leads page
    await page.goto('http://localhost:4000/apps/crm/leads');

    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[role="grid"]', { timeout: 10000 });
  });

  test('should open convert modal when "Convert to Opportunity" action is clicked', async ({ page }) => {
    // Find first lead row and open actions menu
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());

    await actionsButton.click();

    // Click "Convert to Opportunity" menu item
    const convertMenuItem = page.getByRole('menuitem', { name: /convert to opportunity/i });
    await expect(convertMenuItem).toBeVisible();
    await convertMenuItem.click();

    // Verify modal opens
    const modal = page.getByRole('dialog', { name: /convert lead to opportunity/i });
    await expect(modal).toBeVisible();
  });

  test('should display modal title "Convert Lead to Opportunity"', async ({ page }) => {
    // Open modal (reusing logic from above)
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Verify title
    const title = page.getByRole('heading', { name: /convert lead to opportunity/i });
    await expect(title).toBeVisible();
  });

  test('should display close button', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Verify close button exists (by aria-label)
    const closeButton = page.locator('[role="dialog"]').getByRole('button', { name: 'close' });
    await expect(closeButton).toBeVisible();
  });

  test('should pre-fill Contact Name from lead data', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();

    // Get lead name from the Name column (skip checkbox column)
    const leadNameCell = firstRow.locator('[role="gridcell"]').nth(1); // Second cell (after checkbox)
    const leadName = await leadNameCell.textContent();

    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Verify Contact Name is displayed in the Lead Information section
    const leadInfoSection = page.locator('[role="dialog"]').getByText('Lead Information');
    await expect(leadInfoSection).toBeVisible();

    // Look for the lead name anywhere in the dialog
    const nameDisplay = page.locator('[role="dialog"]').getByText(leadName.trim(), { exact: false });
    await expect(nameDisplay).toBeVisible();
  });

  test('should display all required input fields', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Verify required fields
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByLabel(/opportunity name/i)).toBeVisible();
    await expect(dialog.getByLabel(/value/i)).toBeVisible();
    await expect(dialog.getByLabel(/stage/i)).toBeVisible();
    await expect(dialog.getByLabel(/expected close date/i)).toBeVisible();
    await expect(dialog.getByLabel(/probability/i)).toBeVisible();
  });

  test('should display optional Notes field', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Verify notes field
    const notesField = page.locator('[role="dialog"]').getByLabel(/notes/i);
    await expect(notesField).toBeVisible();
  });

  test('should display Stage dropdown with valid options', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Click stage dropdown
    const stageField = page.locator('[role="dialog"]').getByLabel(/stage/i);
    await stageField.click();

    // Verify options (use proper labels)
    await expect(page.getByRole('option', { name: /qualification/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /proposal/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /negotiation/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /closed won/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /closed lost/i })).toBeVisible();
  });

  test('should display Cancel and Convert buttons', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Verify buttons
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(dialog.getByRole('button', { name: /convert to opportunity/i })).toBeVisible();
  });

  test('should show validation error when Opportunity Name is empty', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Clear the opportunity name field (it may be pre-filled)
    const opportunityNameField = page.locator('[role="dialog"]').getByLabel(/opportunity name/i);
    await opportunityNameField.clear();

    // Try to submit without filling required field
    const submitButton = page.locator('[role="dialog"]').getByRole('button', { name: /convert to opportunity/i });
    await submitButton.click();

    // Wait a moment for validation to trigger
    await page.waitForTimeout(500);

    // Verify validation error appears or field has required attribute
    const hasError = await page.locator('[role="dialog"]').getByText(/opportunity name is required/i).isVisible().catch(() => false);
    const isRequired = await opportunityNameField.getAttribute('required');

    // Either error message shows or field is marked as required
    expect(hasError || isRequired !== null).toBeTruthy();
  });

  test('should show validation error when Value is empty', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Fill only opportunity name
    const opportunityNameField = page.locator('[role="dialog"]').getByLabel(/opportunity name/i);
    await opportunityNameField.fill('Test Opportunity');

    // Clear value field
    const valueField = page.locator('[role="dialog"]').getByLabel(/^value/i);
    await valueField.clear();

    // Try to submit
    const submitButton = page.locator('[role="dialog"]').getByRole('button', { name: /convert to opportunity/i });
    await submitButton.click();

    // Wait a moment for validation
    await page.waitForTimeout(500);

    // Verify validation error appears or field is required
    const hasError = await page.locator('[role="dialog"]').getByText(/value is required/i).isVisible().catch(() => false);
    const isRequired = await valueField.getAttribute('required');

    expect(hasError || isRequired !== null).toBeTruthy();
  });

  test('should close modal when Cancel button is clicked', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Click cancel
    const cancelButton = page.locator('[role="dialog"]').getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Verify modal is closed
    const modal = page.getByRole('dialog', { name: /convert lead to opportunity/i });
    await expect(modal).not.toBeVisible();
  });

  test('should close modal when close button is clicked', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Click close button (by aria-label)
    const closeButton = page.locator('[role="dialog"]').getByRole('button', { name: 'close' });
    await closeButton.click();

    // Verify modal is closed
    const modal = page.getByRole('dialog', { name: /convert lead to opportunity/i });
    await expect(modal).not.toBeVisible();
  });

  test('should successfully convert lead when valid data is submitted', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Fill required fields
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByLabel(/opportunity name/i).fill('Test Opportunity Conversion');
    await dialog.getByLabel(/value/i).fill('50000');

    // Select stage
    await dialog.getByLabel(/stage/i).click();
    await page.getByRole('option', { name: /qualification/i }).click();

    // Fill probability
    await dialog.getByLabel(/probability/i).fill('25');

    // Submit form
    const submitButton = dialog.getByRole('button', { name: /convert to opportunity/i });
    await submitButton.click();

    // Wait for success notification
    const successMessage = page.getByText(/lead.*converted.*successfully/i).or(page.getByText(/opportunity.*created.*successfully/i));
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // Verify modal closes
    const modal = page.getByRole('dialog', { name: /convert lead to opportunity/i });
    await expect(modal).not.toBeVisible();
  });

  test('should display loading state during conversion', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Fill required fields
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByLabel(/opportunity name/i).fill('Test Loading State');
    await dialog.getByLabel(/value/i).fill('25000');
    await dialog.getByLabel(/stage/i).click();
    await page.getByRole('option', { name: /proposal/i }).click();
    await dialog.getByLabel(/probability/i).fill('50');

    // Submit and check for loading state
    const submitButton = dialog.getByRole('button', { name: /convert to opportunity/i });
    await submitButton.click();

    // Button should be disabled or show loading text
    await expect(submitButton).toBeDisabled();
  });

  test('should disable all inputs during conversion', async ({ page }) => {
    // Open modal
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(firstRow.locator('button').last());
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Fill required fields
    const dialog = page.locator('[role="dialog"]');
    await dialog.getByLabel(/opportunity name/i).fill('Test Disabled Inputs');
    await dialog.getByLabel(/value/i).fill('75000');
    await dialog.getByLabel(/stage/i).click();
    await page.getByRole('option', { name: /negotiation/i }).click();
    await dialog.getByLabel(/probability/i).fill('75');

    // Submit
    const submitButton = dialog.getByRole('button', { name: /convert to opportunity/i });
    await submitButton.click();

    // Verify inputs are disabled
    await expect(dialog.getByLabel(/opportunity name/i)).toBeDisabled();
    await expect(dialog.getByLabel(/value/i)).toBeDisabled();
  });
});
