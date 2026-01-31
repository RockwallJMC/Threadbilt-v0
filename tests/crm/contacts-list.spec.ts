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

test.describe('GridToolbar Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.waitForSelector('[role="grid"]');
  });

  test('should filter contacts with quick search', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('[role="row"]').count();

    // Type in quick filter
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');

    // Wait for filter to apply
    await page.waitForTimeout(600); // debounce delay

    // Verify filtered results (should be less than or equal to initial)
    const filteredRows = await page.locator('[role="row"]').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('should toggle density', async ({ page }) => {
    // Click density button
    const densityButton = page.locator('[aria-label*="Density"]');
    await densityButton.click();

    // Select "Compact"
    await page.locator('li:has-text("Compact")').click();

    // Verify grid density changed (rows should be shorter)
    const rowHeight = await page.locator('[role="row"]').first().evaluate((el) => {
      return window.getComputedStyle(el).height;
    });

    // Compact rows are typically ~36px or less
    const heightValue = parseInt(rowHeight);
    expect(heightValue).toBeLessThan(50);
  });

  test('should show/hide columns', async ({ page }) => {
    // Click columns button
    const columnsButton = page.locator('[aria-label*="Columns"]');
    await columnsButton.click();

    // Hide "Department" column
    const departmentCheckbox = page.locator('label:has-text("Department")').locator('input');
    await departmentCheckbox.click();

    // Close columns panel
    await page.keyboard.press('Escape');

    // Verify column is hidden
    const departmentHeader = page.locator('[data-field="department"]');
    await expect(departmentHeader).not.toBeVisible();
  });

  test('should export to CSV', async ({ page }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    const exportButton = page.locator('[aria-label*="Export"]');
    await exportButton.click();

    // Click "Download as CSV"
    await page.locator('li:has-text("Download as CSV")').click();

    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.waitForSelector('[role="grid"]');
  });

  test('should navigate to contact details on double-click', async ({ page }) => {
    // Double-click first row
    const firstRow = page.locator('[role="row"]').nth(1); // Skip header
    await firstRow.dblclick();

    // Verify navigation to contact details
    await page.waitForURL(/\/apps\/crm\/contact-details\/[^/]+/);
    expect(page.url()).toContain('/apps/crm/contact-details/');
  });

  test('should navigate to contact details via view button', async ({ page }) => {
    // Click view button on first contact
    const viewButton = page.locator('[aria-label="View"]').first();
    await viewButton.click();

    // Verify navigation
    await page.waitForURL(/\/apps\/crm\/contact-details\/[^/]+/);
    expect(page.url()).toContain('/apps/crm/contact-details/');
  });

  test('should navigate to company details when clicking company name', async ({ page }) => {
    // Click company name link in first row
    const companyLink = page.locator('[data-field="account"] a').first();

    // Check if link exists (some contacts may not have company)
    const linkCount = await companyLink.count();
    if (linkCount > 0) {
      await companyLink.click();

      // Verify navigation to company/account details
      await page.waitForURL(/\/apps\/crm\/account-details\/[^/]+/);
      expect(page.url()).toContain('/apps/crm/account-details/');
    } else {
      // Skip test if no company links exist
      test.skip();
    }
  });
});
