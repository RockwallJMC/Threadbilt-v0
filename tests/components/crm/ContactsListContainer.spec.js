import { test, expect } from '@playwright/test';

test.describe('ContactsListContainer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contacts page
    await page.goto('http://localhost:4000/apps/crm/contacts');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display page header with "Contacts" title', async ({ page }) => {
    // Look for "Contacts" heading
    const heading = page.getByRole('heading', { name: /contacts/i });
    await expect(heading).toBeVisible();
  });

  test('should display search bar for filtering contacts', async ({ page }) => {
    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();
  });

  test('should display "Create Contact" button', async ({ page }) => {
    // Look for create button
    const createButton = page.getByRole('link', { name: /create contact/i });
    await expect(createButton).toBeVisible();
  });

  test('"Create Contact" button should navigate to add-contact page', async ({ page }) => {
    // Click create button
    const createButton = page.getByRole('link', { name: /create contact/i });
    await createButton.click();

    // Verify navigation
    await expect(page).toHaveURL(/\/apps\/crm\/add-contact/);
  });

  test('should render ContactsTable component', async ({ page }) => {
    // Look for DataGrid (table) - it should have role="grid"
    const dataGrid = page.locator('[role="grid"]');
    await expect(dataGrid).toBeVisible();
  });

  test('search should filter contacts by name', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('[role="row"][data-id]').count();

    // Type in search box
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Michael Chen');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered results
    const filteredRows = await page.locator('[role="row"][data-id]').count();
    expect(filteredRows).toBeLessThan(initialRows);
    expect(filteredRows).toBeGreaterThan(0);
  });

  test('should display filter toggle buttons (All | With Account | Independent)', async ({ page }) => {
    // Look for toggle buttons
    const allButton = page.getByRole('button', { name: /^all$/i });
    const withAccountButton = page.getByRole('button', { name: /with account/i });
    const independentButton = page.getByRole('button', { name: /independent/i });

    await expect(allButton).toBeVisible();
    await expect(withAccountButton).toBeVisible();
    await expect(independentButton).toBeVisible();
  });

  test('should filter contacts when "Independent" toggle is clicked', async ({ page }) => {
    // Click "Independent" button
    const independentButton = page.getByRole('button', { name: /independent/i });
    await independentButton.click();

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify only independent contacts are shown (account column shows "Independent")
    const accountCells = page.locator('[role="gridcell"]').filter({ hasText: /independent/i });
    const accountCellCount = await accountCells.count();

    expect(accountCellCount).toBeGreaterThan(0);
  });
});
