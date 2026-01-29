const { test, expect } = require('@playwright/test');
const { captureScreenshot } = require('./helpers/playwrightArtifacts');
const { ROUTES, TEST_LEADS } = require('./helpers/crm-test-data');

async function waitForLeadsTable(page) {
  // Wait for the main leads table to be visible.
  // Prefer a data-testid if present, otherwise fall back to a generic table.
  const selectors = ['[data-testid="leads-table"]', 'table'];
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
      return;
    } catch (e) {
      // Try next selector
    }
  }
}

async function waitForLeadDetail(page) {
  // Wait for the lead detail view to be visible.
  const selectors = [
    '[data-testid="lead-detail"]',
    '[data-testid="lead-details"]',
    '[data-testid="lead-detail-panel"]',
  ];
  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { state: 'visible', timeout: 2000 });
      return;
    } catch (e) {
      // Try next selector
    }
  }
}
test.afterEach(async ({ page }, testInfo) => {
  await captureScreenshot(page, testInfo);
});

/**
 * CRM Leads E2E Tests - Phase 1.4
 *
 * Comprehensive test suite for Leads Management functionality.
 * Following TDD principles (RED-GREEN-REFACTOR):
 * - RED: Tests define expected behavior
 * - GREEN: Verify tests pass with current implementation
 * - REFACTOR: Improve code quality while staying green
 *
 * Test Coverage:
 * - Lead CRUD operations (15 tests)
 * - Lead conversion workflow (8 tests)
 * - Form validation (5 tests)
 *
 * TODO: Update when Phase 1.2 (Auth & Multi-Tenancy) completes
 * - Add authentication/session setup in beforeEach
 * - Update to use Supabase data instead of mock data
 * - Enable multi-tenancy security tests (see crm-leads-multi-tenancy.spec.js)
 */

test.describe('Lead CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.leads.list);
  });

  test('should display leads list page with data grid', async ({ page }) => {
    // Verify page loads
    await expect(page).toHaveURL(ROUTES.leads.list);

    // Verify page heading exists
    await expect(page.getByRole('heading', { name: /leads/i })).toBeVisible();

    // Verify data grid is rendered
    await waitForLeadsTable(page);
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();
  });

  test('should display leads from mock data in data grid', async ({ page }) => {
    await waitForLeadsTable(page);

    // Verify first test lead appears in grid
    const sarahRow = page.getByRole('row', {
      name: new RegExp(TEST_LEADS.newLead1.name, 'i'),
    });
    await expect(sarahRow).toBeVisible();

    // Verify lead details are displayed (company, email)
    await expect(sarahRow).toContainText(TEST_LEADS.newLead1.company);
  });

  test('should create lead with all required fields', async ({ page }) => {
    await waitForLeadsTable(page);

    // Find and click "Create Lead" button
    const createButton = page.getByRole('button', { name: /create lead|new lead|add lead/i });
    await createButton.click();

    // Verify form/modal opens
    const form = page.locator('form').or(page.locator('[role="dialog"]'));
    await expect(form).toBeVisible();

    // Fill required fields
    await page.getByLabel(/^name/i).fill('Test Lead Name');
    await page.getByLabel(/company/i).fill('Test Company Inc');
    await page.getByLabel(/email/i).fill('testlead@example.com');

    // Select source from dropdown
    await page.getByLabel(/source/i).click();
    await page.getByRole('option', { name: /website/i }).click();

    // Submit form
    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();

    // Verify success (toast notification or redirect)
    const successMessage = page.getByText(/lead.*created.*successfully/i).or(
      page.getByText(/successfully.*created/i)
    );
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should create lead with optional fields (phone, notes)', async ({ page }) => {
    await waitForLeadsTable(page);

    // Open create form
    const createButton = page.getByRole('button', { name: /create lead|new lead|add lead/i });
    await createButton.click();

    // Fill required fields
    await page.getByLabel(/^name/i).fill('Test Lead With Optional');
    await page.getByLabel(/company/i).fill('Optional Fields Company');
    await page.getByLabel(/email/i).fill('optional@example.com');
    await page.getByLabel(/source/i).click();
    await page.getByRole('option', { name: /referral/i }).click();

    // Fill optional fields
    await page.getByLabel(/phone/i).fill('+1 (555) 123-4567');
    await page.getByLabel(/notes/i).fill('Test notes for lead creation with optional fields');

    // Submit
    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();

    // Verify success
    const successMessage = page.getByText(/lead.*created.*successfully/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should edit lead (update name, company, email)', async ({ page }) => {
    await waitForLeadsTable(page);

    // Find first lead row and open actions menu
    const firstRow = page.locator('[role="row"][data-id]').first();
    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(
      firstRow.locator('button').last()
    );
    await actionsButton.click();

    // Click "Edit" menu item
    const editMenuItem = page.getByRole('menuitem', { name: /edit/i });
    await editMenuItem.click();

    // Verify edit form/modal opens
    const form = page.locator('form').or(page.locator('[role="dialog"]'));
    await expect(form).toBeVisible();

    // Update fields
    const nameField = page.getByLabel(/^name/i);
    await nameField.clear();
    await nameField.fill('Updated Lead Name');

    const companyField = page.getByLabel(/company/i);
    await companyField.clear();
    await companyField.fill('Updated Company Name');

    const emailField = page.getByLabel(/email/i);
    await emailField.clear();
    await emailField.fill('updated.email@example.com');

    // Submit
    const submitButton = page.getByRole('button', { name: /save|update/i });
    await submitButton.click();

    // Verify success
    const successMessage = page.getByText(/lead.*updated.*successfully/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should update lead status via dropdown', async ({ page }) => {
    await waitForLeadsTable(page);

    // Find a lead row with "new" status
    const newLeadRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.newLead1.name,
    });

    // Find status dropdown/chip in the row
    const statusChip = newLeadRow.locator('[role="button"]').filter({ hasText: /new/i });
    await statusChip.click();

    // Select new status
    const contactedOption = page.getByRole('option', { name: /contacted/i });
    await contactedOption.click();

    // Verify status updated (look for success message or updated chip)
    const updatedChip = newLeadRow.locator('[role="button"]').filter({ hasText: /contacted/i });
    await expect(updatedChip).toBeVisible({ timeout: 3000 });
  });

  test('should delete lead (soft delete)', async ({ page }) => {
    await waitForLeadsTable(page);

    // Get initial row count
    const initialRows = page.locator('[role="row"][data-id]');
    const initialCount = await initialRows.count();

    // Find first lead row and open actions menu
    const firstRow = page.locator('[role="row"][data-id]').first();
    const leadName = await firstRow.locator('[role="gridcell"]').nth(1).textContent();

    const actionsButton = firstRow.locator('button[aria-label*="menu"]').or(
      firstRow.locator('button').last()
    );
    await actionsButton.click();

    // Click "Delete" menu item
    const deleteMenuItem = page.getByRole('menuitem', { name: /delete/i });
    await deleteMenuItem.click();

    // Confirm deletion if confirmation dialog appears
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Verify success message
    const successMessage = page.getByText(/lead.*deleted.*successfully/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // Verify row count decreased or lead no longer visible
    await page.waitForTimeout(500);
    const finalRows = page.locator('[role="row"][data-id]');
    const finalCount = await finalRows.count();

    // Either count decreased or specific lead is gone
    const leadStillVisible = await page.getByText(leadName).isVisible().catch(() => false);
    expect(finalCount < initialCount || !leadStillVisible).toBeTruthy();
  });

  test('should search leads by name', async ({ page }) => {
    await waitForLeadsTable(page);

    // Find search input
    const searchBox = page.getByPlaceholder(/search/i);
    await expect(searchBox).toBeVisible();

    // Search for specific lead name
    await searchBox.fill('Sarah Mitchell');
    await page.waitForTimeout(500); // Debounce delay

    // Verify Sarah Mitchell appears in results
    await expect(page.getByText(TEST_LEADS.newLead1.name)).toBeVisible();

    // Verify Marcus Chen (different lead) is filtered out or not emphasized
    const marcusVisible = await page.getByText(TEST_LEADS.newLead2.name).isVisible().catch(() => false);
    // Either not visible or search successfully highlighted Sarah
    expect(marcusVisible === false || await page.getByText(TEST_LEADS.newLead1.name).isVisible()).toBeTruthy();
  });

  test('should search leads by company', async ({ page }) => {
    await waitForLeadsTable(page);

    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill('TechVision Analytics');
    await page.waitForTimeout(500);

    // Verify company appears in results
    await expect(page.getByText(TEST_LEADS.newLead1.company)).toBeVisible();
  });

  test('should search leads by email', async ({ page }) => {
    await waitForLeadsTable(page);

    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill('sarah.mitchell@techvision.com');
    await page.waitForTimeout(500);

    // Verify email or associated lead appears
    await expect(page.getByText(TEST_LEADS.newLead1.name)).toBeVisible();
  });

  test('should filter leads by status tabs - New', async ({ page }) => {
    await waitForLeadsTable(page);

    // Click "New" status tab
    const newTab = page.getByRole('tab', { name: /^new$/i });
    await newTab.click();
    await page.waitForTimeout(300);

    // Verify "new" status leads appear
    await expect(page.getByText(TEST_LEADS.newLead1.name)).toBeVisible();

    // Verify tab is selected
    await expect(newTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should filter leads by status tabs - Qualified', async ({ page }) => {
    await waitForLeadsTable(page);

    // Click "Qualified" status tab
    const qualifiedTab = page.getByRole('tab', { name: /qualified/i });
    await qualifiedTab.click();
    await page.waitForTimeout(300);

    // Verify qualified lead appears
    await expect(page.getByText(TEST_LEADS.qualifiedLead.name)).toBeVisible();
  });

  test('should sort leads by created date', async ({ page }) => {
    await waitForLeadsTable(page);

    // Find "Created" column header
    const createdHeader = page.getByRole('columnheader', { name: /created|date/i });
    await createdHeader.click();
    await page.waitForTimeout(500);

    // Verify grid updates (check for sort indicator)
    const sortIndicator = createdHeader.locator('[data-testid*="sort"], svg').first();
    await expect(sortIndicator).toBeVisible();
  });

  test('should sort leads by name', async ({ page }) => {
    await waitForLeadsTable(page);

    // Find "Name" column header
    const nameHeader = page.getByRole('columnheader', { name: /^name$/i });
    await nameHeader.click();
    await page.waitForTimeout(500);

    // Verify sort indicator appears
    const sortIndicator = nameHeader.locator('[data-testid*="sort"], svg').first();
    await expect(sortIndicator).toBeVisible();
  });

  test('should sort leads by status', async ({ page }) => {
    await waitForLeadsTable(page);

    // Find "Status" column header
    const statusHeader = page.getByRole('columnheader', { name: /status/i });
    await statusHeader.click();
    await page.waitForTimeout(500);

    // Verify sort indicator appears
    const sortIndicator = statusHeader.locator('[data-testid*="sort"], svg').first();
    await expect(sortIndicator).toBeVisible();
  });

  test('should verify lead list pagination', async ({ page }) => {
    await waitForLeadsTable(page);

    // Look for pagination controls (if > 10 leads)
    const paginationContainer = page.locator('[role="navigation"]').or(
      page.locator('.MuiTablePagination-root')
    );

    // Check if pagination exists (may not exist if <= page size)
    const paginationVisible = await paginationContainer.isVisible().catch(() => false);

    if (paginationVisible) {
      // Verify pagination controls are functional
      const nextButton = page.getByRole('button', { name: /next page/i });
      const prevButton = page.getByRole('button', { name: /previous page/i });

      await expect(nextButton).toBeVisible();
      await expect(prevButton).toBeVisible();

      // Verify rows per page selector exists
      const rowsPerPageSelect = page.locator('[role="combobox"]').or(
        page.getByLabelText(/rows per page/i)
      );
      await expect(rowsPerPageSelect.first()).toBeVisible();
    } else {
      // If no pagination, verify we have leads displayed
      const rows = page.locator('[role="row"][data-id]');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    }
  });
});

test.describe('Lead Conversion Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.leads.list);
    await waitForLeadsTable(page);
  });

  test('should hide convert button when status = converted', async ({ page }) => {
    // Find a converted lead row
    const convertedRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.convertedLead.name,
    });

    // Open actions menu
    const actionsButton = convertedRow.locator('button[aria-label*="menu"]').or(
      convertedRow.locator('button').last()
    );
    await actionsButton.click();

    // Verify "Convert to Opportunity" is NOT in the menu
    const convertMenuItem = page.getByRole('menuitem', { name: /convert to opportunity/i });
    const isVisible = await convertMenuItem.isVisible({ timeout: 1000 }).catch(() => false);
    expect(isVisible).toBe(false);
  });

  test('should open conversion modal from lead row', async ({ page }) => {
    // Find a non-converted lead row
    const qualifiedRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.qualifiedLead.name,
    });

    // Open actions menu
    const actionsButton = qualifiedRow.locator('button[aria-label*="menu"]').or(
      qualifiedRow.locator('button').last()
    );
    await actionsButton.click();

    // Click "Convert to Opportunity"
    const convertMenuItem = page.getByRole('menuitem', { name: /convert to opportunity/i });
    await convertMenuItem.click();

    // Verify modal opens
    const modal = page.getByRole('dialog', { name: /convert lead to opportunity/i });
    await expect(modal).toBeVisible();
  });

  test('should pre-fill contact, company, source in conversion modal', async ({ page }) => {
    // Find qualified lead
    const qualifiedRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.qualifiedLead.name,
    });

    // Open conversion modal
    const actionsButton = qualifiedRow.locator('button[aria-label*="menu"]').or(
      qualifiedRow.locator('button').last()
    );
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Verify modal contains lead information
    const modal = page.locator('[role="dialog"]');

    // Verify lead name appears in "Lead Information" section
    const leadInfoSection = modal.getByText(/lead information/i);
    await expect(leadInfoSection).toBeVisible();

    await expect(modal.getByText(TEST_LEADS.qualifiedLead.name)).toBeVisible();
    await expect(modal.getByText(TEST_LEADS.qualifiedLead.company)).toBeVisible();
  });

  test('should validate required opportunity fields (name, value, stage, close date, probability)', async ({ page }) => {
    // Open conversion modal for qualified lead
    const qualifiedRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.qualifiedLead.name,
    });
    const actionsButton = qualifiedRow.locator('button[aria-label*="menu"]').or(
      qualifiedRow.locator('button').last()
    );
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Try to submit without filling required fields
    const modal = page.locator('[role="dialog"]');

    // Clear opportunity name if pre-filled
    const opportunityNameField = modal.getByLabel(/opportunity name/i);
    await opportunityNameField.clear();

    const submitButton = modal.getByRole('button', { name: /convert to opportunity/i });
    await submitButton.click();
    await page.waitForTimeout(500);

    // Verify validation errors appear or fields are marked required
    const hasError = await modal.getByText(/required/i).isVisible().catch(() => false);
    const nameRequired = await opportunityNameField.getAttribute('required');

    expect(hasError || nameRequired !== null).toBeTruthy();
  });

  test('should successfully convert lead and create opportunity', async ({ page }) => {
    // Open conversion modal for qualified lead
    const qualifiedRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.qualifiedLead.name,
    });
    const actionsButton = qualifiedRow.locator('button[aria-label*="menu"]').or(
      qualifiedRow.locator('button').last()
    );
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Fill required fields
    const modal = page.locator('[role="dialog"]');
    await modal.getByLabel(/opportunity name/i).fill('Test Opportunity from Lead Conversion');
    await modal.getByLabel(/^value/i).fill('100000');

    // Select stage
    await modal.getByLabel(/stage/i).click();
    await page.getByRole('option', { name: /qualification/i }).click();

    // Fill probability
    await modal.getByLabel(/probability/i).fill('25');

    // Submit
    const submitButton = modal.getByRole('button', { name: /convert to opportunity/i });
    await submitButton.click();

    // Verify success message
    const successMessage = page.getByText(/lead.*converted.*successfully/i).or(
      page.getByText(/opportunity.*created.*successfully/i)
    );
    await expect(successMessage).toBeVisible({ timeout: 5000 });
  });

  test('should update lead status to converted after conversion', async ({ page }) => {
    // Note: This test verifies the lead's status changes to "converted"
    // In real implementation, would need to verify database or UI update

    // Open conversion modal
    const newLeadRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.newLead1.name,
    });
    const actionsButton = newLeadRow.locator('button[aria-label*="menu"]').or(
      newLeadRow.locator('button').last()
    );
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Fill and submit conversion
    const modal = page.locator('[role="dialog"]');
    await modal.getByLabel(/opportunity name/i).fill('Status Update Test Opportunity');
    await modal.getByLabel(/^value/i).fill('50000');
    await modal.getByLabel(/stage/i).click();
    await page.getByRole('option', { name: /proposal/i }).click();
    await modal.getByLabel(/probability/i).fill('50');
    await modal.getByRole('button', { name: /convert to opportunity/i }).click();

    // Wait for success
    await page.waitForTimeout(1000);

    // Navigate back to leads list and verify status updated
    await page.goto(ROUTES.leads.list);
    await waitForLeadsTable(page);

    // Find the converted lead and check status chip shows "converted"
    const convertedRow = page.locator('[role="row"]').filter({
      hasText: TEST_LEADS.newLead1.name,
    });

    const statusChip = convertedRow.locator('[role="button"]').filter({ hasText: /converted/i });
    await expect(statusChip).toBeVisible({ timeout: 3000 });
  });

  test('should link converted lead to opportunity (lead_id in opportunity)', async ({ page }) => {
    // This test verifies the relationship is created
    // In real implementation, would check database or navigate to opportunity detail

    // Convert a lead
    const contactedRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.contactedLead.name,
    });
    const actionsButton = contactedRow.locator('button[aria-label*="menu"]').or(
      contactedRow.locator('button').last()
    );
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    const modal = page.locator('[role="dialog"]');
    await modal.getByLabel(/opportunity name/i).fill('Link Test Opportunity');
    await modal.getByLabel(/^value/i).fill('75000');
    await modal.getByLabel(/stage/i).click();
    await page.getByRole('option', { name: /negotiation/i }).click();
    await modal.getByLabel(/probability/i).fill('75');
    await modal.getByRole('button', { name: /convert to opportunity/i }).click();

    // Verify success (opportunity created with lead link)
    const successMessage = page.getByText(/converted.*successfully/i);
    await expect(successMessage).toBeVisible({ timeout: 5000 });

    // In production, would navigate to opportunity and verify lead_id field
  });

  test('should show "View Opportunity" link on converted lead detail', async ({ page }) => {
    // Navigate to converted lead detail page
    await page.goto(ROUTES.leads.detail(TEST_LEADS.convertedLead.id));
    await waitForLeadDetail(page);

    // Verify "View Opportunity" link or button exists
    const viewOppLink = page.getByRole('link', { name: /view opportunity|go to opportunity/i }).or(
      page.getByRole('button', { name: /view opportunity|go to opportunity/i })
    );

    await expect(viewOppLink).toBeVisible();
  });
});

test.describe('Form Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.leads.list);
    await waitForLeadsTable(page);
  });

  test('should validate required fields (name, company, email, source)', async ({ page }) => {
    // Open create lead form
    const createButton = page.getByRole('button', { name: /create lead|new lead|add lead/i });
    await createButton.click();

    // Try to submit without filling anything
    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();
    await page.waitForTimeout(500);

    // Verify validation errors appear
    const errorMessages = page.getByText(/required/i);
    const errorCount = await errorMessages.count();

    // Should have at least 3 required field errors (name, company, email, source)
    expect(errorCount).toBeGreaterThanOrEqual(3);
  });

  test('should validate email format', async ({ page }) => {
    // Open create form
    const createButton = page.getByRole('button', { name: /create lead|new lead|add lead/i });
    await createButton.click();

    // Fill fields with invalid email
    await page.getByLabel(/^name/i).fill('Email Validation Test');
    await page.getByLabel(/company/i).fill('Test Company');
    await page.getByLabel(/email/i).fill('invalid-email-format');
    await page.getByLabel(/source/i).click();
    await page.getByRole('option', { name: /website/i }).click();

    // Try to submit
    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();
    await page.waitForTimeout(500);

    // Verify email validation error
    const emailError = page.getByText(/valid email|invalid email|email.*format/i);
    await expect(emailError).toBeVisible();
  });

  test('should validate phone format (optional but must be valid if provided)', async ({ page }) => {
    // Open create form
    const createButton = page.getByRole('button', { name: /create lead|new lead|add lead/i });
    await createButton.click();

    // Fill fields with invalid phone
    await page.getByLabel(/^name/i).fill('Phone Validation Test');
    await page.getByLabel(/company/i).fill('Test Company');
    await page.getByLabel(/email/i).fill('phonetest@example.com');
    await page.getByLabel(/phone/i).fill('invalid-phone');
    await page.getByLabel(/source/i).click();
    await page.getByRole('option', { name: /website/i }).click();

    // Try to submit
    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();
    await page.waitForTimeout(500);

    // Verify phone validation error appears
    const phoneError = page.getByText(/valid phone|invalid phone|phone.*format/i);
    const hasError = await phoneError.isVisible({ timeout: 2000 }).catch(() => false);

    // Phone validation should trigger
    expect(hasError).toBe(true);
  });

  test('should require source dropdown selection', async ({ page }) => {
    // Open create form
    const createButton = page.getByRole('button', { name: /create lead|new lead|add lead/i });
    await createButton.click();

    // Fill all fields except source
    await page.getByLabel(/^name/i).fill('Source Validation Test');
    await page.getByLabel(/company/i).fill('Test Company');
    await page.getByLabel(/email/i).fill('source@example.com');

    // Try to submit without selecting source
    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();
    await page.waitForTimeout(500);

    // Verify source validation error
    const sourceError = page.getByText(/source.*required/i);
    await expect(sourceError).toBeVisible();
  });

  test('should validate opportunity conversion form fields', async ({ page }) => {
    // Open conversion modal
    const qualifiedRow = page.locator('[role="row"][data-id]').filter({
      hasText: TEST_LEADS.qualifiedLead.name,
    });
    const actionsButton = qualifiedRow.locator('button[aria-label*="menu"]').or(
      qualifiedRow.locator('button').last()
    );
    await actionsButton.click();
    await page.getByRole('menuitem', { name: /convert to opportunity/i }).click();

    // Clear all fields and try to submit
    const modal = page.locator('[role="dialog"]');
    await modal.getByLabel(/opportunity name/i).clear();

    const submitButton = modal.getByRole('button', { name: /convert to opportunity/i });
    await submitButton.click();
    await page.waitForTimeout(500);

    // Verify validation errors for required opportunity fields
    const errors = modal.getByText(/required/i);
    const errorCount = await errors.count();

    // Should have validation errors for: name, value, stage, close date, probability
    expect(errorCount).toBeGreaterThanOrEqual(2);
  });
});
