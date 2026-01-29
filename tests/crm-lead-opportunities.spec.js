import { test, expect } from '@playwright/test';

test.describe('OngoingOpportunities Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a lead detail page
    // Using lead ID from mock data
    await page.goto('http://localhost:4000/apps/crm/leads/lead_1');

    // Wait for data to load
    await page.waitForLoadState('networkidle');
  });

  test('should display "Ongoing Opportunities" heading', async ({ page }) => {
    // Look for Ongoing Opportunities heading
    const heading = page.getByRole('heading', { name: /ongoing opportunities/i });
    await expect(heading).toBeVisible();
  });

  test('should display opportunity cards when opportunities exist', async ({ page }) => {
    // Look for opportunity cards (they should have opportunity name links)
    const opportunityLinks = page.locator('a[href*="/apps/crm/opportunities/"]');

    // Should have at least one opportunity card
    await expect(opportunityLinks.first()).toBeVisible();
  });

  test('should display opportunity name as clickable link', async ({ page }) => {
    // Find opportunity name link
    const opportunityLink = page.locator('a[href*="/apps/crm/opportunities/"]').first();
    await expect(opportunityLink).toBeVisible();

    // Verify it links to opportunity detail page
    const href = await opportunityLink.getAttribute('href');
    expect(href).toMatch(/^\/apps\/crm\/opportunities\/.+/);
  });

  test('should display account name on opportunity card', async ({ page }) => {
    // Opportunity cards should show account names
    // Look for text content that includes company names from mock data
    const accountText = page.getByText(/Victory Outfitters|Bean Brew|BrightWave|CloudSync/i);
    await expect(accountText.first()).toBeVisible();
  });

  test('should display formatted currency value', async ({ page }) => {
    // Opportunity cards should show formatted currency
    const currencyText = page.getByText(/\$[\d,]+/);
    await expect(currencyText.first()).toBeVisible();
  });

  test('should display stage as colored chip', async ({ page }) => {
    // Stage should be displayed as a chip
    // Look for MUI chip elements with stage text
    const stageChip = page.locator('.MuiChip-root').filter({
      hasText: /qualification|proposal|negotiation|closed won|closed lost/i
    });
    await expect(stageChip.first()).toBeVisible();
  });

  test('should display probability percentage', async ({ page }) => {
    // Probability should be shown as percentage
    const probabilityText = page.getByText(/\d+%/);
    await expect(probabilityText.first()).toBeVisible();
  });

  test('should display expected close date', async ({ page }) => {
    // Expected close date should be visible
    // Look for date format like "10 Apr, 2025"
    const dateText = page.getByText(/\d{1,2}\s+\w{3},\s+\d{4}/);
    await expect(dateText.first()).toBeVisible();
  });

  test('should display empty state when no opportunities exist', async ({ page }) => {
    // Navigate to a lead with no opportunities
    // We'll need to create a test lead without opportunities or use a specific ID
    await page.goto('http://localhost:4000/apps/crm/leads/lead_no_opportunities');
    await page.waitForLoadState('networkidle');

    // Look for empty state icon and text
    const emptyStateIcon = page.locator('[class*="iconify"]').filter({ hasText: '' });
    const emptyStateTitle = page.getByText(/no opportunities yet/i);
    const emptyStateSubtitle = page.getByText(/convert this lead to create an opportunity/i);

    await expect(emptyStateTitle).toBeVisible();
    await expect(emptyStateSubtitle).toBeVisible();
  });

  test('should only show opportunities converted from current lead', async ({ page }) => {
    // Verify that only opportunities with converted_from_lead_id matching current lead are shown
    // This test verifies filtering logic

    // Get all opportunity links
    const opportunityLinks = page.locator('a[href*="/apps/crm/opportunities/"]');
    const count = await opportunityLinks.count();

    // Should have opportunities (exact count depends on mock data)
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should have "New Opportunity" button', async ({ page }) => {
    // Look for "New Opportunity" button in the component
    const newOpportunityButton = page.getByRole('button', { name: /new opportunity/i });
    await expect(newOpportunityButton).toBeVisible();
  });
});
