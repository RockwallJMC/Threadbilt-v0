import { test, expect } from '@playwright/test';

test.describe('OpportunitiesTable', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to opportunities page
    await page.goto('http://localhost:4000/apps/crm/opportunities');

    // Wait for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[role="grid"]');
  });

  test('should display table with Name column', async ({ page }) => {
    // Look for Name column header
    const nameHeader = page.getByRole('columnheader', { name: /^name$/i });
    await expect(nameHeader).toBeVisible();
  });

  test('should display table with Account column', async ({ page }) => {
    // Look for Account column header
    const accountHeader = page.getByRole('columnheader', { name: /^account$/i });
    await expect(accountHeader).toBeVisible();
  });

  test('should display table with Value column', async ({ page }) => {
    // Look for Value column header
    const valueHeader = page.getByRole('columnheader', { name: /^value$/i });
    await expect(valueHeader).toBeVisible();
  });

  test('should display table with Probability column', async ({ page }) => {
    // Look for Probability column header
    const probabilityHeader = page.getByRole('columnheader', { name: /^probability$/i });
    await expect(probabilityHeader).toBeVisible();
  });

  test('should display table with Stage column', async ({ page }) => {
    // Look for Stage column header
    const stageHeader = page.getByRole('columnheader', { name: /^stage$/i });
    await expect(stageHeader).toBeVisible();
  });

  test('should display table with Expected Close column', async ({ page }) => {
    // Look for Expected Close column header
    const expectedCloseHeader = page.getByRole('columnheader', { name: /expected close/i });
    await expect(expectedCloseHeader).toBeVisible();
  });

  test('should display table with Assigned To column', async ({ page }) => {
    // Look for Assigned To column header
    const assignedToHeader = page.getByRole('columnheader', { name: /assigned to/i });
    await expect(assignedToHeader).toBeVisible();
  });

  test('should display table with Actions column', async ({ page }) => {
    // Look for actions menu (typically last column)
    const actionsHeader = page.getByRole('columnheader').last();
    await expect(actionsHeader).toBeVisible();
  });

  test('should display opportunity name as clickable link', async ({ page }) => {
    // Find first opportunity name link
    const firstNameLink = page.locator('[role="gridcell"] a').first();
    await expect(firstNameLink).toBeVisible();

    // Verify it's a link to opportunity detail page
    const href = await firstNameLink.getAttribute('href');
    expect(href).toContain('/apps/crm/opportunities/');
  });

  test('should display account name with logo', async ({ page }) => {
    // Find account cell with company name
    const accountCell = page.locator('[role="gridcell"]').filter({ hasText: /Victory Outfitters|Bean Brew|BrightWave/i }).first();
    await expect(accountCell).toBeVisible();
  });

  test('should display formatted currency value', async ({ page }) => {
    // Find value cell with currency format
    const valueCell = page.locator('[role="gridcell"]').filter({ hasText: /\$[\d,]+/ }).first();
    await expect(valueCell).toBeVisible();
  });

  test('should display probability as percentage', async ({ page }) => {
    // Find probability cell with percentage
    const probabilityCell = page.locator('[role="gridcell"]').filter({ hasText: /\d+%/ }).first();
    await expect(probabilityCell).toBeVisible();
  });

  test('should display Stage chip with color', async ({ page }) => {
    // Find stage chip
    const stageChip = page.locator('[role="gridcell"] .MuiChip-root').first();
    await expect(stageChip).toBeVisible();
  });

  test('should display formatted expected close date', async ({ page }) => {
    // Find date cell with format "MMM DD, YYYY"
    const dateCell = page.locator('[role="gridcell"]').filter({ hasText: /[A-Z][a-z]{2} \d{2}, \d{4}/ }).first();
    await expect(dateCell).toBeVisible();
  });

  test('should display assigned user with avatar', async ({ page }) => {
    // Find avatar in grid cell
    const avatar = page.locator('[role="gridcell"] .MuiAvatar-root').first();
    await expect(avatar).toBeVisible();
  });

  test('should display filter tabs', async ({ page }) => {
    // Verify all filter tabs exist
    await expect(page.getByRole('tab', { name: /^all$/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /qualification/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /proposal/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /negotiation/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /won/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /lost/i })).toBeVisible();
  });

  test('should filter opportunities when tab is clicked', async ({ page }) => {
    // Click Qualification tab
    const qualificationTab = page.getByRole('tab', { name: /qualification/i });
    await qualificationTab.click();

    // Wait for filter to apply
    await page.waitForLoadState('networkidle');

    // Verify only qualification opportunities are shown
    const stageChips = page.locator('[role="gridcell"] .MuiChip-root');
    const chipCount = await stageChips.count();

    if (chipCount > 0) {
      const firstChipText = await stageChips.first().textContent();
      expect(firstChipText.toLowerCase()).toContain('qualification');
    }
  });

  test('should display pagination with 25, 50, 100 options', async ({ page }) => {
    // Look for pagination select
    const paginationSelect = page.locator('[aria-label*="Rows per page"]');
    await expect(paginationSelect).toBeVisible();

    // Click to open options
    await paginationSelect.click();

    // Verify options
    await expect(page.getByRole('option', { name: '25' })).toBeVisible();
    await expect(page.getByRole('option', { name: '50' })).toBeVisible();
    await expect(page.getByRole('option', { name: '100' })).toBeVisible();
  });

  test('should support checkbox selection', async ({ page }) => {
    // Look for checkboxes
    const checkboxes = page.locator('[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    expect(checkboxCount).toBeGreaterThan(0);
  });

  test('should navigate to opportunity detail page when name is clicked', async ({ page }) => {
    // Click first opportunity name
    const firstNameLink = page.locator('[role="gridcell"] a').first();
    const opportunityName = await firstNameLink.textContent();

    await firstNameLink.click();

    // Verify navigation to opportunity detail page
    await expect(page).toHaveURL(/\/apps\/crm\/opportunities\//);
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

  test('should display at least one opportunity row', async ({ page }) => {
    // Verify data is loaded
    const rows = page.locator('[role="row"][data-id]');
    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0);
  });

  test('should sort by value column when header is clicked', async ({ page }) => {
    // Click value column header to sort
    const valueHeader = page.getByRole('columnheader', { name: /^value$/i });
    await valueHeader.click();

    // Wait for sort to apply
    await page.waitForTimeout(500);

    // Verify sort indicator appears
    const sortIcon = valueHeader.locator('svg');
    await expect(sortIcon).toBeVisible();
  });

  test('should sort by expected close date when header is clicked', async ({ page }) => {
    // Click expected close column header to sort
    const expectedCloseHeader = page.getByRole('columnheader', { name: /expected close/i });
    await expectedCloseHeader.click();

    // Wait for sort to apply
    await page.waitForTimeout(500);

    // Verify sort indicator appears
    const sortIcon = expectedCloseHeader.locator('svg');
    await expect(sortIcon).toBeVisible();
  });
});
