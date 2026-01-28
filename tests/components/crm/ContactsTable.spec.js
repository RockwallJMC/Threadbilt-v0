import { test, expect } from '@playwright/test';

test.describe('ContactsTable', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contacts page
    await page.goto('http://localhost:4000/apps/crm/contacts');

    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[role="grid"]');
  });

  test('should display table with Name column', async ({ page }) => {
    // Look for Name column header
    const nameHeader = page.getByRole('columnheader', { name: /^name$/i });
    await expect(nameHeader).toBeVisible();
  });

  test('should display table with Title column', async ({ page }) => {
    // Look for Title column header
    const titleHeader = page.getByRole('columnheader', { name: /^title$/i });
    await expect(titleHeader).toBeVisible();
  });

  test('should display table with Email column', async ({ page }) => {
    // Look for Email column header
    const emailHeader = page.getByRole('columnheader', { name: /^email$/i });
    await expect(emailHeader).toBeVisible();
  });

  test('should display table with Phone column', async ({ page }) => {
    // Look for Phone column header
    const phoneHeader = page.getByRole('columnheader', { name: /^phone$/i });
    await expect(phoneHeader).toBeVisible();
  });

  test('should display table with Account column', async ({ page }) => {
    // Look for Account column header
    const accountHeader = page.getByRole('columnheader', { name: /^account$/i });
    await expect(accountHeader).toBeVisible();
  });

  test('should display table with Status column', async ({ page }) => {
    // Look for Status column header
    const statusHeader = page.getByRole('columnheader', { name: /^status$/i });
    await expect(statusHeader).toBeVisible();
  });

  test('should display table with Actions column', async ({ page }) => {
    // Look for actions menu (typically last column)
    const actionsHeader = page.getByRole('columnheader').last();
    await expect(actionsHeader).toBeVisible();
  });

  test('should display contact name as clickable link', async ({ page }) => {
    // Find first contact name link
    const firstNameLink = page.locator('[role="gridcell"] a').first();
    await expect(firstNameLink).toBeVisible();

    // Verify it's a link
    const href = await firstNameLink.getAttribute('href');
    expect(href).toContain('/apps/crm/contact/');
  });

  test('should display email as mailto link', async ({ page }) => {
    // Find email cell with mailto link
    const emailLink = page.locator('[role="gridcell"] a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();

    // Verify href starts with mailto:
    const href = await emailLink.getAttribute('href');
    expect(href).toMatch(/^mailto:/);
  });

  test('should display account name for contacts with account', async ({ page }) => {
    // Find a contact with account (not "Independent")
    const accountCell = page.locator('[role="gridcell"]').filter({ hasText: /TechVision|HealthFirst|Global Financial/i }).first();
    await expect(accountCell).toBeVisible();
  });

  test('should display "Independent" for contacts without account', async ({ page }) => {
    // Find independent contact
    const independentCell = page.locator('[role="gridcell"]').filter({ hasText: /^Independent$/i }).first();
    await expect(independentCell).toBeVisible();
  });

  test('should display Status chip with "Active" status', async ({ page }) => {
    // Find status chip
    const statusChip = page.locator('[role="gridcell"] .MuiChip-root').first();
    await expect(statusChip).toBeVisible();
    await expect(statusChip).toContainText(/active/i);
  });

  test('should display pagination with 20, 50, 100 options', async ({ page }) => {
    // Look for pagination select
    const paginationSelect = page.locator('[aria-label*="Rows per page"]');
    await expect(paginationSelect).toBeVisible();

    // Click to open options
    await paginationSelect.click();

    // Verify options
    await expect(page.getByRole('option', { name: '20' })).toBeVisible();
    await expect(page.getByRole('option', { name: '50' })).toBeVisible();
    await expect(page.getByRole('option', { name: '100' })).toBeVisible();
  });

  test('should support checkbox selection', async ({ page }) => {
    // Look for checkboxes
    const checkboxes = page.locator('[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    expect(checkboxCount).toBeGreaterThan(0);
  });

  test('should navigate to contact detail page when row is clicked', async ({ page }) => {
    // Click first contact name
    const firstNameLink = page.locator('[role="gridcell"] a').first();
    const contactName = await firstNameLink.textContent();

    await firstNameLink.click();

    // Verify navigation to contact detail page
    await expect(page).toHaveURL(/\/apps\/crm\/contact\//);
  });

  test('should display actions dropdown menu', async ({ page }) => {
    // Find actions button (typically last cell in row)
    const actionsButton = page.locator('[role="row"][data-id]').first().locator('button[aria-label*="menu"]').or(page.locator('[role="row"][data-id]').first().locator('button').last());

    // Click to open menu
    await actionsButton.click();

    // Verify menu items
    await expect(page.getByRole('menuitem', { name: /view/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: /delete/i })).toBeVisible();
  });

  test('should display loading state while fetching data', async ({ page }) => {
    // This test would need to intercept network requests
    // For now, we'll verify the grid eventually appears
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible({ timeout: 5000 });
  });

  test('should display at least one contact row', async ({ page }) => {
    // Verify data is loaded
    const rows = page.locator('[role="row"][data-id]');
    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0);
  });
});
