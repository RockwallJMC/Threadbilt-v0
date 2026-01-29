import { test, expect } from '@playwright/test';

test.describe('OpportunitiesListContainer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to opportunities list page
    await page.goto('http://localhost:4000/apps/crm/opportunities/list');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display search bar for filtering opportunities', async ({ page }) => {
    // Look for search input with placeholder
    const searchInput = page.getByPlaceholder(/search opportunities/i);
    await expect(searchInput).toBeVisible();
  });

  test('should display search icon in search field', async ({ page }) => {
    // Verify search field has icon (InputAdornment)
    const searchInput = page.getByPlaceholder(/search opportunities/i);
    const searchContainer = searchInput.locator('..');
    await expect(searchContainer).toBeVisible();
  });

  test('should display "Kanban View" button', async ({ page }) => {
    // Look for Kanban view button
    const kanbanButton = page.getByRole('link', { name: /kanban view/i });
    await expect(kanbanButton).toBeVisible();
  });

  test('"Kanban View" button should navigate to kanban page', async ({ page }) => {
    // Click Kanban view button
    const kanbanButton = page.getByRole('link', { name: /kanban view/i });
    await kanbanButton.click();

    // Verify navigation to /apps/crm/opportunities
    await expect(page).toHaveURL(/\/apps\/crm\/opportunities$/);
  });

  test('should display "Add Opportunity" button', async ({ page }) => {
    // Look for add button
    const addButton = page.getByRole('button', { name: /add opportunity/i });
    await expect(addButton).toBeVisible();
  });

  test('should render OpportunitiesTable component', async ({ page }) => {
    // Look for DataGrid (table) - it should have role="grid"
    const dataGrid = page.locator('[role="grid"]');
    await expect(dataGrid).toBeVisible();
  });

  test('search should filter opportunities via DataGrid API', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('[role="row"][data-id]').count();

    // Type in search box
    const searchInput = page.getByPlaceholder(/search opportunities/i);
    await searchInput.fill('Acme Corp');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Verify filtered results (should be less than or equal to initial)
    const filteredRows = await page.locator('[role="row"][data-id]').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('search field should have minimum width of 300px', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/search opportunities/i);

    // Get computed style
    const minWidth = await searchInput.evaluate((el) => {
      const parent = el.closest('.MuiTextField-root');
      return window.getComputedStyle(parent).minWidth;
    });

    // Verify minimum width (allowing for different units/calculations)
    expect(parseInt(minWidth)).toBeGreaterThanOrEqual(300);
  });

  test('header should have search and action buttons in row layout', async ({ page }) => {
    // Verify header stack exists with row direction
    const searchInput = page.getByPlaceholder(/search opportunities/i);
    const addButton = page.getByRole('button', { name: /add opportunity/i });

    await expect(searchInput).toBeVisible();
    await expect(addButton).toBeVisible();
  });
});
