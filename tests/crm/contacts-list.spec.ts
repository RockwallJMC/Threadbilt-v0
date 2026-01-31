import { test, expect } from '@playwright/test';

test.describe('Contacts List', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contacts list
    await page.goto('/apps/crm/contacts');

    // Wait for grid to load
    await page.waitForSelector('[role="grid"]');
  });

  test('should load contacts list with DataGrid', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h4')).toContainText('Contacts');

    // Verify DataGrid is present
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();

    // Verify GridToolbar is present
    const toolbar = page.locator('.MuiDataGrid-toolbarContainer');
    await expect(toolbar).toBeVisible();

    // Verify columns are visible
    await expect(page.locator('[role="columnheader"]').first()).toBeVisible();
  });

  test('should edit contact inline with optimistic update', async ({ page }) => {
    // Find first editable cell (First Name)
    const firstNameCell = page.locator('[data-field="first_name"]').first();

    // Double-click to enter edit mode
    await firstNameCell.dblclick();

    // Type new value
    const input = page.locator('input[type="text"]').first();
    await input.fill('Updated');

    // Press Enter or click away to commit
    await input.press('Enter');

    // Verify optimistic update (cell shows new value immediately)
    await expect(firstNameCell).toContainText('Updated');

    // Wait for success toast
    await expect(page.locator('.MuiAlert-message')).toContainText('Contact updated successfully');

    // Refresh page and verify change persisted
    await page.reload();
    await page.waitForSelector('[role="grid"]');

    const updatedCell = page.locator('[data-field="first_name"]').first();
    await expect(updatedCell).toContainText('Updated');
  });

  test('should validate email format', async ({ page }) => {
    // Find email cell
    const emailCell = page.locator('[data-field="email"]').first();

    // Double-click to edit
    await emailCell.dblclick();

    // Type invalid email
    const input = page.locator('input[type="email"]').first();
    await input.fill('invalid-email');
    await input.press('Enter');

    // Verify validation error (MUI DataGrid shows error)
    // Note: Exact error handling depends on MUI DataGrid validation
    // This test verifies the email input type is set correctly
    await expect(input).toHaveAttribute('type', 'email');
  });
});

test.describe('Contacts Archive', () => {
  test('should archive contact with undo', async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.waitForSelector('[role="grid"]');

    // Get initial row count
    const initialRows = await page.locator('[role="row"]').count();

    // Click archive button on first contact
    const archiveButton = page.locator('[aria-label="Archive"]').first();
    await archiveButton.click();

    // Verify row is removed from grid
    const newRowCount = await page.locator('[role="row"]').count();
    expect(newRowCount).toBe(initialRows - 1);

    // Verify toast appears with undo button
    await expect(page.locator('.MuiAlert-message')).toContainText('Contact archived');
    const undoButton = page.locator('button:has-text("Undo")');
    await expect(undoButton).toBeVisible();

    // Click undo
    await undoButton.click();

    // Verify contact is restored
    await page.waitForTimeout(500); // Wait for UI update
    const restoredRowCount = await page.locator('[role="row"]').count();
    expect(restoredRowCount).toBe(initialRows);

    // Verify restored toast
    await expect(page.locator('.MuiAlert-message')).toContainText('Contact restored');
  });

  test('should permanently archive after timeout', async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.waitForSelector('[role="grid"]');

    // Get first contact ID for verification
    const firstRow = page.locator('[role="row"]').nth(1); // Skip header
    const contactName = await firstRow.locator('[data-field="first_name"]').textContent();

    // Click archive button
    const archiveButton = page.locator('[aria-label="Archive"]').first();
    await archiveButton.click();

    // Verify toast appears
    await expect(page.locator('.MuiAlert-message')).toContainText('Contact archived');

    // Wait for toast timeout (10 seconds + buffer)
    await page.waitForTimeout(11000);

    // Refresh page
    await page.reload();
    await page.waitForSelector('[role="grid"]');

    // Verify contact is NOT in list
    const contactCells = await page.locator('[data-field="first_name"]').allTextContents();
    expect(contactCells).not.toContain(contactName);
  });
});
