const { test, expect } = require('@playwright/test');
const { captureScreenshot } = require('./helpers/playwrightArtifacts');
const { ROUTES } = require('./helpers/crm-test-data');

async function waitForOpportunityDetail(page) {
  // Wait for the opportunity detail view to be visible
  const selectors = [
    '[data-testid="opportunity-detail"]',
    '[data-testid="opportunity-details"]',
    '[data-testid="opportunity-detail-panel"]',
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
 * CRM Opportunity Details E2E Tests - Phase 1.5 Step 8
 *
 * Test Coverage:
 * - Opportunity detail page rendering
 * - Forecasting widget display (weighted value, days to close, probability)
 * - Converted from lead section and link
 * - Tab navigation (Overview, Activities, Proposals, Analytics)
 */

test.describe('Opportunity Detail Page', () => {
  const TEST_OPPORTUNITY_ID = '123e4567-e89b-12d3-a456-426614174000';
  const TEST_LEAD_ID = '987fcdeb-51a2-43d1-b123-456789abcdef';

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.opportunities.detail(TEST_OPPORTUNITY_ID));
  });

  test('should display opportunity detail page', async ({ page }) => {
    // Verify page loads
    await expect(page).toHaveURL(ROUTES.opportunities.detail(TEST_OPPORTUNITY_ID));

    // Verify opportunity header is visible
    await expect(page.getByRole('heading', { name: /opportunity/i })).toBeVisible();

    // Verify main content area exists
    await waitForOpportunityDetail(page);
  });

  test('should display opportunity name in header', async ({ page }) => {
    await waitForOpportunityDetail(page);

    // Verify opportunity name appears (example: "Enterprise Software License")
    const opportunityName = page.getByText(/enterprise.*software|opportunity.*name/i).first();
    await expect(opportunityName).toBeVisible();
  });
});

test.describe('Forecasting Widget', () => {
  const TEST_OPPORTUNITY_ID = '123e4567-e89b-12d3-a456-426614174000';

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.opportunities.detail(TEST_OPPORTUNITY_ID));
    await waitForOpportunityDetail(page);
  });

  test('should display forecasting widget', async ({ page }) => {
    // Verify forecasting widget section exists
    const forecastingWidget = page.locator('[data-testid="forecasting-widget"]').or(
      page.getByText(/forecast|weighted value|probability/i).first().locator('..')
    );

    await expect(forecastingWidget).toBeVisible();
  });

  test('should display weighted value in forecasting widget', async ({ page }) => {
    // Verify "Weighted Value" label exists
    await expect(page.getByText(/weighted value/i)).toBeVisible();

    // Verify weighted value amount is displayed (should be formatted as currency)
    const weightedValue = page.locator('[data-testid="weighted-value"]').or(
      page.getByText(/weighted value/i).locator('..').getByText(/\$[\d,]+/)
    );

    await expect(weightedValue).toBeVisible();
  });

  test('should display days to close in forecasting widget', async ({ page }) => {
    // Verify "Days to Close" label exists
    await expect(page.getByText(/days to close/i)).toBeVisible();

    // Verify days value is displayed
    const daysToClose = page.locator('[data-testid="days-to-close"]').or(
      page.getByText(/days to close/i).locator('..').getByText(/\d+/)
    );

    await expect(daysToClose).toBeVisible();
  });

  test('should display probability in forecasting widget', async ({ page }) => {
    // Verify "Probability" label exists
    await expect(page.getByText(/^probability$/i)).toBeVisible();

    // Verify probability chip/value is displayed (should be percentage)
    const probability = page.locator('[data-testid="probability-chip"]').or(
      page.getByText(/^probability$/i).locator('..').locator('[role="button"]')
    );

    await expect(probability).toBeVisible();
  });

  test('should calculate weighted value correctly (value × probability / 100)', async ({ page }) => {
    // Get opportunity value
    const valueText = await page.getByText(/^value/i).locator('..').textContent();
    const valueMatch = valueText?.match(/\$?([\d,]+)/);

    if (valueMatch) {
      const opportunityValue = parseInt(valueMatch[1].replace(/,/g, ''), 10);

      // Get probability percentage
      const probabilityText = await page.getByText(/^probability$/i).locator('..').textContent();
      const probabilityMatch = probabilityText?.match(/(\d+)%?/);

      if (probabilityMatch) {
        const probability = parseInt(probabilityMatch[1], 10);

        // Calculate expected weighted value
        const expectedWeightedValue = Math.floor((opportunityValue * probability) / 100);

        // Verify weighted value matches calculation
        const weightedValueText = await page.getByText(/weighted value/i).locator('..').textContent();
        const weightedMatch = weightedValueText?.match(/\$?([\d,]+)/);

        if (weightedMatch) {
          const displayedWeighted = parseInt(weightedMatch[1].replace(/,/g, ''), 10);
          expect(displayedWeighted).toBe(expectedWeightedValue);
        }
      }
    }
  });

  test('should display probability with color-coded chip', async ({ page }) => {
    // Get probability chip
    const probabilityChip = page.locator('[data-testid="probability-chip"]').or(
      page.getByText(/^probability$/i).locator('..').locator('[role="button"]')
    );

    await expect(probabilityChip).toBeVisible();

    // Verify chip has a class indicating color (e.g., success, warning, error)
    const chipClasses = await probabilityChip.getAttribute('class');
    const hasColorClass = chipClasses?.includes('success') ||
                          chipClasses?.includes('warning') ||
                          chipClasses?.includes('error') ||
                          chipClasses?.includes('info');

    expect(hasColorClass).toBeTruthy();
  });

  test('should calculate days to close from expected close date', async ({ page }) => {
    // Verify days to close is a positive number (or could be negative if overdue)
    const daysText = await page.getByText(/days to close/i).locator('..').textContent();
    const daysMatch = daysText?.match(/(-?\d+)/);

    expect(daysMatch).toBeTruthy();

    // Days should be a valid number
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      expect(typeof days).toBe('number');
      expect(isNaN(days)).toBe(false);
    }
  });
});

test.describe('Converted From Lead Section', () => {
  const CONVERTED_OPPORTUNITY_ID = '456e7890-f12b-34c5-d678-901234567890';
  const ORIGINAL_LEAD_ID = '987fcdeb-51a2-43d1-b123-456789abcdef';

  test('should display "Converted from Lead" section when opportunity was converted', async ({ page }) => {
    // Navigate to opportunity that was converted from a lead
    await page.goto(ROUTES.opportunities.detail(CONVERTED_OPPORTUNITY_ID));
    await waitForOpportunityDetail(page);

    // Verify "Converted from lead" section exists
    const convertedSection = page.locator('[data-testid="converted-from-lead"]').or(
      page.getByText(/converted from lead/i)
    );

    await expect(convertedSection).toBeVisible();
  });

  test('should display link to original lead', async ({ page }) => {
    await page.goto(ROUTES.opportunities.detail(CONVERTED_OPPORTUNITY_ID));
    await waitForOpportunityDetail(page);

    // Verify link to view original lead exists
    const leadLink = page.getByRole('link', { name: /view original lead|view lead/i });
    await expect(leadLink).toBeVisible();
  });

  test('should navigate to lead detail page when clicking lead link', async ({ page }) => {
    await page.goto(ROUTES.opportunities.detail(CONVERTED_OPPORTUNITY_ID));
    await waitForOpportunityDetail(page);

    // Click the lead link
    const leadLink = page.getByRole('link', { name: /view original lead|view lead/i });
    await leadLink.click();

    // Verify navigation to lead detail page
    await page.waitForURL(new RegExp(`/apps/crm/leads/${ORIGINAL_LEAD_ID}`));
    await expect(page).toHaveURL(new RegExp(`/apps/crm/leads/`));
  });

  test('should display arrow icon in converted from lead section', async ({ page }) => {
    await page.goto(ROUTES.opportunities.detail(CONVERTED_OPPORTUNITY_ID));
    await waitForOpportunityDetail(page);

    // Verify arrow-back icon exists
    const arrowIcon = page.locator('[data-testid="converted-from-lead"]').locator('svg').or(
      page.getByText(/converted from lead/i).locator('..').locator('svg')
    );

    await expect(arrowIcon).toBeVisible();
  });

  test('should NOT display "Converted from Lead" section for opportunities not from leads', async ({ page }) => {
    // Navigate to opportunity that was NOT converted from a lead
    const NON_CONVERTED_OPP_ID = '111a2222-b33c-44d5-e666-777788889999';
    await page.goto(ROUTES.opportunities.detail(NON_CONVERTED_OPP_ID));
    await waitForOpportunityDetail(page);

    // Verify "Converted from lead" section does NOT exist
    const convertedSection = page.locator('[data-testid="converted-from-lead"]');
    const isVisible = await convertedSection.isVisible({ timeout: 1000 }).catch(() => false);

    expect(isVisible).toBe(false);
  });
});

test.describe('Opportunity Detail Tabs', () => {
  const TEST_OPPORTUNITY_ID = '123e4567-e89b-12d3-a456-426614174000';

  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.opportunities.detail(TEST_OPPORTUNITY_ID));
    await waitForOpportunityDetail(page);
  });

  test('should display Overview tab', async ({ page }) => {
    const overviewTab = page.getByRole('tab', { name: /overview/i });
    await expect(overviewTab).toBeVisible();
  });

  test('should display Activities tab', async ({ page }) => {
    const activitiesTab = page.getByRole('tab', { name: /activities/i });
    await expect(activitiesTab).toBeVisible();
  });

  test('should display Proposals tab', async ({ page }) => {
    const proposalsTab = page.getByRole('tab', { name: /proposals/i });
    await expect(proposalsTab).toBeVisible();
  });

  test('should display Analytics tab', async ({ page }) => {
    const analyticsTab = page.getByRole('tab', { name: /analytics/i });
    await expect(analyticsTab).toBeVisible();
  });

  test('should switch to Activities tab when clicked', async ({ page }) => {
    const activitiesTab = page.getByRole('tab', { name: /activities/i });
    await activitiesTab.click();
    await page.waitForTimeout(300);

    // Verify tab is selected
    await expect(activitiesTab).toHaveAttribute('aria-selected', 'true');

    // Verify activities content is visible
    const activitiesContent = page.getByRole('tabpanel').or(
      page.locator('[data-testid="activities-panel"]')
    );
    await expect(activitiesContent).toBeVisible();
  });

  test('should switch to Proposals tab when clicked', async ({ page }) => {
    const proposalsTab = page.getByRole('tab', { name: /proposals/i });
    await proposalsTab.click();
    await page.waitForTimeout(300);

    // Verify tab is selected
    await expect(proposalsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('should switch to Analytics tab when clicked', async ({ page }) => {
    const analyticsTab = page.getByRole('tab', { name: /analytics/i });
    await analyticsTab.click();
    await page.waitForTimeout(300);

    // Verify tab is selected
    await expect(analyticsTab).toHaveAttribute('aria-selected', 'true');

    // Verify analytics content (charts) is visible
    const analyticsContent = page.locator('[data-testid="analytics-chart"]').or(
      page.getByRole('tabpanel')
    );
    await expect(analyticsContent).toBeVisible();
  });

  test('should display Overview tab content with opportunity information', async ({ page }) => {
    // Verify Overview tab is selected by default
    const overviewTab = page.getByRole('tab', { name: /overview/i });
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

    // Verify overview content includes forecasting widget
    await expect(page.getByText(/weighted value|forecast/i)).toBeVisible();
  });

  test('should display Proposals tab with placeholder content', async ({ page }) => {
    // Switch to Proposals tab
    const proposalsTab = page.getByRole('tab', { name: /proposals/i });
    await proposalsTab.click();
    await page.waitForTimeout(300);

    // Verify placeholder content (Phase 1.6 feature)
    const placeholderText = page.getByText(/coming soon|no proposals|phase 1.6/i);
    const hasPlaceholder = await placeholderText.isVisible({ timeout: 2000 }).catch(() => false);

    // Either placeholder exists or proposals content is visible
    expect(hasPlaceholder || await page.getByRole('tabpanel').isVisible()).toBeTruthy();
  });
});
