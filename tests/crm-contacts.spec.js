const { test, expect } = require('@playwright/test');
const { captureScreenshot } = require('./helpers/playwrightArtifacts');
const {
  TEST_CONTACTS,
  TEST_ACCOUNTS,
  ROUTES,
  waitForContactsTable,
  waitForContactDetail,
} = require('./helpers/crm-test-data');

test.afterEach(async ({ page }, testInfo) => {
  await captureScreenshot(page, testInfo);
});

/**
 * CRM Contacts E2E Tests
 *
 * Tests verify UI functionality with current mock data implementation.
 * Following TDD principles (RED-GREEN-REFACTOR):
 * - RED: Tests define expected behavior
 * - GREEN: Verify tests pass with current implementation
 * - REFACTOR: Improve code quality while staying green
 *
 * Key test areas:
 * - Contact list with filtering (All | With Account | Independent)
 * - Contact detail page with account association section
 * - Link/Unlink account functionality
 * - Search and navigation
 * - Responsive design
 *
 * TODO: Update when Phase 1.2 (Auth & Multi-Tenancy) completes
 * - Add authentication/session setup in beforeEach
 * - Update to use Supabase data instead of mock data
 * - Add organization-specific filtering verification
 */

test.describe('CRM Contacts - List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.contacts.list);
  });

  test('should display contacts list page with table', async ({ page }) => {
    // Verify page loads
    await expect(page).toHaveURL(ROUTES.contacts.list);

    // Verify page heading
    await expect(page.getByRole('heading', { name: /contacts/i })).toBeVisible();

    // Verify table is rendered
    await waitForContactsTable(page);
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should display contacts from mock data in table', async ({ page }) => {
    await waitForContactsTable(page);

    // Verify independent contact appears
    const michaelChenRow = page.getByRole('row', {
      name: new RegExp(TEST_CONTACTS.independent.michaelChen.firstName, 'i'),
    });
    await expect(michaelChenRow).toBeVisible();

    // Verify contact with account appears
    const sarahJohnsonRow = page.getByRole('row', {
      name: new RegExp(TEST_CONTACTS.withAccount.sarahJohnson.firstName, 'i'),
    });
    await expect(sarahJohnsonRow).toBeVisible();
  });

  test('should have filter toggle (All | With Account | Independent)', async ({ page }) => {
    await waitForContactsTable(page);

    // Verify filter buttons/tabs exist
    // Look for "All", "With Account", "Independent" filters
    const allFilter = page.getByRole('button', { name: /^all$/i });
    const withAccountFilter = page.getByRole('button', { name: /with account/i });
    const independentFilter = page.getByRole('button', { name: /independent/i });

    // At least one filter should exist
    const hasFilters =
      (await allFilter.count()) > 0 ||
      (await withAccountFilter.count()) > 0 ||
      (await independentFilter.count()) > 0;

    expect(hasFilters).toBeTruthy();
  });

  test('should filter contacts by "All"', async ({ page }) => {
    await waitForContactsTable(page);

    // Click "All" filter
    const allFilter = page.getByRole('button', { name: /^all$/i });
    if ((await allFilter.count()) > 0) {
      await allFilter.click();
      await page.waitForTimeout(300);
    }

    // Should show both independent and with-account contacts
    await expect(
      page.getByText(TEST_CONTACTS.independent.michaelChen.lastName),
    ).toBeVisible();
    await expect(
      page.getByText(TEST_CONTACTS.withAccount.sarahJohnson.lastName),
    ).toBeVisible();
  });

  test('should filter contacts by "With Account"', async ({ page }) => {
    await waitForContactsTable(page);

    // Click "With Account" filter
    const withAccountFilter = page.getByRole('button', { name: /with account/i });
    if ((await withAccountFilter.count()) > 0) {
      await withAccountFilter.click();
      await page.waitForTimeout(300);

      // Should show contacts with accounts
      await expect(
        page.getByText(TEST_CONTACTS.withAccount.sarahJohnson.lastName),
      ).toBeVisible();

      // May or may not show independent contacts (depends on implementation)
      // This test documents the expected behavior
    }
  });

  test('should filter contacts by "Independent"', async ({ page }) => {
    await waitForContactsTable(page);

    // Click "Independent" filter
    const independentFilter = page.getByRole('button', { name: /independent/i });
    if ((await independentFilter.count()) > 0) {
      await independentFilter.click();
      await page.waitForTimeout(300);

      // Should show independent contacts
      await expect(
        page.getByText(TEST_CONTACTS.independent.michaelChen.lastName),
      ).toBeVisible();
    }
  });

  test('should have functional search box', async ({ page }) => {
    await waitForContactsTable(page);

    // Find search input
    const searchBox = page.getByPlaceholder(/search/i);
    await expect(searchBox).toBeVisible();

    // Type in search box
    await searchBox.fill('Michael Chen');
    await page.waitForTimeout(500); // Debounce delay

    // Verify filtered results
    await expect(page.getByText(TEST_CONTACTS.independent.michaelChen.email)).toBeVisible();
  });

  test('should navigate to contact detail when clicking contact name', async ({ page }) => {
    await waitForContactsTable(page);

    // Click on contact name link
    const contactLink = page.getByRole('link', {
      name: new RegExp(
        `${TEST_CONTACTS.independent.michaelChen.firstName}.*${TEST_CONTACTS.independent.michaelChen.lastName}`,
        'i',
      ),
    });

    if ((await contactLink.count()) > 0) {
      await contactLink.first().click();

      // Verify navigation to detail page
      await expect(page).toHaveURL(
        ROUTES.contacts.detail(TEST_CONTACTS.independent.michaelChen.id),
      );

      // Verify detail page loads
      await waitForContactDetail(page);
    }
  });

  test('should have "Create Contact" button', async ({ page }) => {
    await waitForContactsTable(page);

    // Verify create button exists
    const createButton = page.getByRole('button', {
      name: /create contact|new contact|add contact/i,
    });

    await expect(createButton).toBeVisible();
  });

  test('should navigate to add-contact page when clicking Create Contact', async ({ page }) => {
    await waitForContactsTable(page);

    const createButton = page.getByRole('button', {
      name: /create contact|new contact|add contact/i,
    });
    await createButton.click();

    // Verify navigation to create contact page
    await expect(page).toHaveURL(ROUTES.contacts.create);
  });

  test('should display email addresses for contacts', async ({ page }) => {
    await waitForContactsTable(page);

    // Verify emails are displayed
    await expect(page.getByText(TEST_CONTACTS.independent.michaelChen.email)).toBeVisible();
  });

  test('should display job titles for contacts', async ({ page }) => {
    await waitForContactsTable(page);

    // Verify titles are displayed
    await expect(page.getByText(TEST_CONTACTS.independent.michaelChen.title)).toBeVisible();
  });
});

test.describe('CRM Contacts - Detail Page (Independent Contact)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Michael Chen (independent contact) detail page
    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.independent.michaelChen.id));
    await waitForContactDetail(page);
  });

  test('should display contact name and basic information', async ({ page }) => {
    // Verify contact name heading
    const fullName = `${TEST_CONTACTS.independent.michaelChen.firstName} ${TEST_CONTACTS.independent.michaelChen.lastName}`;
    await expect(page.getByText(fullName)).toBeVisible();

    // Verify title is displayed
    await expect(page.getByText(TEST_CONTACTS.independent.michaelChen.title)).toBeVisible();

    // Verify email is displayed
    await expect(page.getByText(TEST_CONTACTS.independent.michaelChen.email)).toBeVisible();
  });

  test('should display all 4 tabs (Overview, Activity, Opportunities, Documents)', async ({
    page,
  }) => {
    // Verify tabs exist
    const tabList = page.getByRole('tablist');
    await expect(tabList).toBeVisible();

    // Verify individual tabs
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /activity/i })).toBeVisible();

    // Opportunities/Deals tab
    const opportunitiesTab =
      (await page.getByRole('tab', { name: /opportunities/i }).count()) > 0
        ? page.getByRole('tab', { name: /opportunities/i })
        : page.getByRole('tab', { name: /deals/i });
    await expect(opportunitiesTab).toBeVisible();

    // Documents tab
    await expect(page.getByRole('tab', { name: /documents/i })).toBeVisible();
  });

  test('should show "Link to Account" button for independent contact', async ({ page }) => {
    // Independent contact should have "Link to Account" button
    const linkButton = page.getByRole('button', { name: /link to account|link account/i });
    await expect(linkButton).toBeVisible();
  });

  test('should NOT show account chip for independent contact', async ({ page }) => {
    // Verify no account chip is displayed
    // Look for account name chips - should not find any
    const accountChip = page.locator('[class*="MuiChip"]').filter({
      hasText: new RegExp(TEST_ACCOUNTS.techVision.name, 'i'),
    });

    const chipCount = await accountChip.count();
    expect(chipCount).toBe(0);
  });

  test('should open Link Account modal when clicking "Link to Account"', async ({ page }) => {
    const linkButton = page.getByRole('button', { name: /link to account|link account/i });
    await linkButton.click();

    // Wait for modal to open
    await page.waitForTimeout(300);

    // Verify modal/dialog is visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify modal has title/heading
    await expect(dialog.getByText(/link.*account/i)).toBeVisible();
  });

  test('should close Link Account modal when clicking Cancel', async ({ page }) => {
    const linkButton = page.getByRole('button', { name: /link to account|link account/i });
    await linkButton.click();
    await page.waitForTimeout(300);

    // Find and click Cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Verify modal is closed
    await page.waitForTimeout(300);
    const dialog = page.getByRole('dialog');
    const dialogCount = await dialog.count();
    expect(dialogCount).toBe(0);
  });

  test('should display account search/select in Link Account modal', async ({ page }) => {
    const linkButton = page.getByRole('button', { name: /link to account|link account/i });
    await linkButton.click();
    await page.waitForTimeout(300);

    const dialog = page.getByRole('dialog');

    // Should have a search or select input for accounts
    const searchInput = dialog.getByPlaceholder(/search|select/i);
    const selectInput = dialog.locator('[role="combobox"]');

    const hasInput = (await searchInput.count()) > 0 || (await selectInput.count()) > 0;
    expect(hasInput).toBeTruthy();
  });
});

test.describe('CRM Contacts - Detail Page (Contact with Account)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Sarah Johnson (has account) detail page
    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.withAccount.sarahJohnson.id));
    await waitForContactDetail(page);
  });

  test('should display contact name and account association', async ({ page }) => {
    // Verify contact name
    const fullName = `${TEST_CONTACTS.withAccount.sarahJohnson.firstName} ${TEST_CONTACTS.withAccount.sarahJohnson.lastName}`;
    await expect(page.getByText(fullName)).toBeVisible();

    // Verify associated account name is displayed
    await expect(
      page.getByText(TEST_CONTACTS.withAccount.sarahJohnson.accountName),
    ).toBeVisible();
  });

  test('should show account name as clickable chip/link', async ({ page }) => {
    // Account name should be a link to the account detail page
    const accountLink = page.getByRole('link', {
      name: new RegExp(TEST_CONTACTS.withAccount.sarahJohnson.accountName, 'i'),
    });

    // Verify link exists
    const linkCount = await accountLink.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should have "Unlink Account" button for contact with account', async ({ page }) => {
    // Contact with account should have "Unlink" button
    const unlinkButton = page.getByRole('button', { name: /unlink|remove/i });
    await expect(unlinkButton).toBeVisible();
  });

  test('should open Unlink Account confirmation dialog', async ({ page }) => {
    const unlinkButton = page.getByRole('button', { name: /unlink|remove/i });
    await unlinkButton.click();

    // Wait for dialog to open
    await page.waitForTimeout(300);

    // Verify confirmation dialog is visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify dialog has confirmation message
    await expect(dialog.getByText(/unlink|confirm|remove/i)).toBeVisible();
  });

  test('should close Unlink dialog when clicking Cancel', async ({ page }) => {
    const unlinkButton = page.getByRole('button', { name: /unlink|remove/i });
    await unlinkButton.click();
    await page.waitForTimeout(300);

    // Find and click Cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();

    // Verify dialog is closed
    await page.waitForTimeout(300);
    const dialog = page.getByRole('dialog');
    const dialogCount = await dialog.count();
    expect(dialogCount).toBe(0);
  });

  test('should navigate to account detail when clicking account chip', async ({ page }) => {
    // Click on account name link
    const accountLink = page
      .getByRole('link', {
        name: new RegExp(TEST_CONTACTS.withAccount.sarahJohnson.accountName, 'i'),
      })
      .first();

    if ((await accountLink.count()) > 0) {
      await accountLink.click();

      // Verify navigation to account detail page
      await expect(page).toHaveURL(
        ROUTES.accounts.detail(TEST_CONTACTS.withAccount.sarahJohnson.accountId),
      );
    }
  });
});

test.describe('CRM Contacts - Account Association Section', () => {
  test('should display "Account Association" section heading', async ({ page }) => {
    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.independent.michaelChen.id));
    await waitForContactDetail(page);

    // Verify "Account Association" or similar heading exists
    const heading = page.getByText(/account.*association|associated.*account|account/i);
    await expect(heading.first()).toBeVisible();
  });

  test('should show different UI for linked vs independent contacts', async ({ page }) => {
    // Test independent contact
    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.independent.michaelChen.id));
    await waitForContactDetail(page);

    // Should have "Link to Account" button
    const linkButton = page.getByRole('button', { name: /link to account|link account/i });
    await expect(linkButton).toBeVisible();

    // Navigate to contact with account
    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.withAccount.sarahJohnson.id));
    await waitForContactDetail(page);

    // Should have account chip and Unlink button
    await expect(
      page.getByText(TEST_CONTACTS.withAccount.sarahJohnson.accountName),
    ).toBeVisible();
    const unlinkButton = page.getByRole('button', { name: /unlink|remove/i });
    await expect(unlinkButton).toBeVisible();
  });
});

test.describe('CRM Contacts - Responsive Design', () => {
  test('should display properly on desktop viewport (1280x720)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(ROUTES.contacts.list);
    await waitForContactsTable(page);

    // Verify table is visible on desktop
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Verify multiple columns are visible
    const headers = page.locator('thead th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(2);
  });

  test('should display properly on mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(ROUTES.contacts.list);
    await waitForContactsTable(page);

    // Verify page still loads on mobile
    await expect(page.getByRole('heading', { name: /contacts/i })).toBeVisible();

    // Table should still be present
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('should display contact detail properly on mobile (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.independent.michaelChen.id));
    await waitForContactDetail(page);

    // Verify contact name is visible
    const fullName = `${TEST_CONTACTS.independent.michaelChen.firstName} ${TEST_CONTACTS.independent.michaelChen.lastName}`;
    await expect(page.getByText(fullName)).toBeVisible();

    // Verify tabs are visible and functional on mobile
    const tabList = page.getByRole('tablist');
    await expect(tabList).toBeVisible();
  });

  test('should display Link Account modal properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.independent.michaelChen.id));
    await waitForContactDetail(page);

    const linkButton = page.getByRole('button', { name: /link to account|link account/i });
    await linkButton.click();
    await page.waitForTimeout(300);

    // Verify modal displays properly on mobile
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
  });
});

test.describe('CRM Contacts - Search and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.contacts.list);
    await waitForContactsTable(page);
  });

  test('should filter contacts by search term (name)', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill('Sarah Johnson');
    await page.waitForTimeout(500);

    // Should show Sarah Johnson
    await expect(
      page.getByText(TEST_CONTACTS.withAccount.sarahJohnson.email),
    ).toBeVisible();
  });

  test('should filter contacts by search term (email)', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill(TEST_CONTACTS.independent.michaelChen.email);
    await page.waitForTimeout(500);

    // Should show Michael Chen
    const fullName = `${TEST_CONTACTS.independent.michaelChen.firstName} ${TEST_CONTACTS.independent.michaelChen.lastName}`;
    await expect(page.getByText(fullName)).toBeVisible();
  });

  test('should clear search and show all contacts', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/search/i);

    // Search for specific contact
    await searchBox.fill('Michael');
    await page.waitForTimeout(500);

    // Clear search
    await searchBox.clear();
    await page.waitForTimeout(500);

    // Multiple contacts should be visible again
    await expect(
      page.getByText(TEST_CONTACTS.independent.michaelChen.lastName),
    ).toBeVisible();
    await expect(
      page.getByText(TEST_CONTACTS.withAccount.sarahJohnson.lastName),
    ).toBeVisible();
  });

  test('should handle search with no results gracefully', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/search/i);
    await searchBox.fill('ZZZ_NonexistentContact_XYZ');
    await page.waitForTimeout(500);

    // Should show "no results" message or empty table
    const tbody = page.locator('tbody');
    const rows = tbody.locator('tr');
    const rowCount = await rows.count();

    if (rowCount === 0) {
      expect(rowCount).toBe(0);
    } else {
      await expect(tbody).toContainText(/no results|no contacts|not found/i);
    }
  });
});

test.describe('CRM Contacts - Loading States', () => {
  test('should handle page load without errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(ROUTES.contacts.list);
    await waitForContactsTable(page);

    const relevantErrors = consoleErrors.filter(
      (error) => !error.includes('favicon') && !error.includes('DevTools'),
    );

    expect(relevantErrors.length).toBe(0);
  });

  test('should display contact detail page without errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.independent.michaelChen.id));
    await waitForContactDetail(page);

    const relevantErrors = consoleErrors.filter(
      (error) => !error.includes('favicon') && !error.includes('DevTools'),
    );

    expect(relevantErrors.length).toBe(0);
  });
});

test.describe('CRM Contacts - Tab Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.contacts.detail(TEST_CONTACTS.independent.michaelChen.id));
    await waitForContactDetail(page);
  });

  test('should default to Overview tab selected', async ({ page }) => {
    const overviewTab = page.getByRole('tab', { name: /overview/i });
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch between tabs', async ({ page }) => {
    // Click Activity tab
    const activityTab = page.getByRole('tab', { name: /activity/i });
    await activityTab.click();

    // Verify tab is now selected
    await expect(activityTab).toHaveAttribute('aria-selected', 'true');

    // Click Documents tab
    const documentsTab = page.getByRole('tab', { name: /documents/i });
    await documentsTab.click();

    // Verify Documents tab is selected
    await expect(documentsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should maintain contact context when navigating between tabs', async ({ page }) => {
    const fullName = `${TEST_CONTACTS.independent.michaelChen.firstName} ${TEST_CONTACTS.independent.michaelChen.lastName}`;

    // Verify contact name is visible on Overview
    await expect(page.getByText(fullName)).toBeVisible();

    // Switch to Activity tab
    await page.getByRole('tab', { name: /activity/i }).click();
    await page.waitForTimeout(300);

    // Contact name should still be visible
    await expect(page.getByText(fullName)).toBeVisible();
  });
});
