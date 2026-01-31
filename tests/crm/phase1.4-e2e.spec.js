import { test, expect } from '@playwright/test';

test.describe('Phase 1.4 - Deal Details E2E', () => {
  const testDealId = '00000000-0000-0000-0000-000000000001';

  test.beforeEach(async ({ page }) => {
    // Navigate to deal details page
    await page.goto(`/apps/crm/deal-details?id=${testDealId}`);
    await page.waitForLoadState('networkidle');
  });

  test('deal details page loads with all sections', async ({ page }) => {
    // Verify page header
    await expect(page.locator('[data-testid="deal-name"]')).toContainText('Replica Badidas Futbol');

    // Verify sidebar sections
    await expect(page.locator('text=Deal Information')).toBeVisible();
    await expect(page.locator('text=Activity Summary')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();

    // Verify main content sections
    await expect(page.locator('text=Sales Pipeline')).toBeVisible();
    await expect(page.locator('text=Assigned To')).toBeVisible();
    await expect(page.locator('text=Associated Contact')).toBeVisible();
    await expect(page.locator('text=Account')).toBeVisible();
    await expect(page.locator('text=Activity Monitoring')).toBeVisible();
  });

  test('deal information displays correct data', async ({ page }) => {
    // Verify deal metadata
    await expect(page.locator('text=Current Stage')).toBeVisible();
    await expect(page.locator('text=proposal')).toBeVisible();

    await expect(page.locator('text=Budget Forecast')).toBeVisible();
    await expect(page.locator('text=$105,000')).toBeVisible();

    await expect(page.locator('text=Deal Probability')).toBeVisible();
    await expect(page.locator('text=35%')).toBeVisible();
  });

  test('collaborators section shows owner, collaborators, followers', async ({ page }) => {
    // Verify deal owner
    await expect(page.locator('text=Deal Owner')).toBeVisible();
    await expect(page.locator('[data-testid="deal-owner"]')).toBeVisible();

    // Verify collaborators
    await expect(page.locator('text=Collaborator')).toBeVisible();

    // Verify followers
    await expect(page.locator('text=Follower')).toBeVisible();
  });

  test('associated contact displays contact information', async ({ page }) => {
    // Verify contact section
    await expect(page.locator('[data-testid="associated-contact"]')).toBeVisible();

    // Verify contact has name, title, company
    await expect(page.locator('[data-testid="contact-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-company"]')).toBeVisible();
  });

  test('account section shows company with related deals', async ({ page }) => {
    // Verify company name
    await expect(page.locator('[data-testid="account-name"]')).toBeVisible();

    // Verify ongoing deals section
    await expect(page.locator('text=Ongoing Deals')).toBeVisible();

    // Verify past deals section
    await expect(page.locator('text=Past Deals')).toBeVisible();
  });

  test('activity summary shows correct counts', async ({ page }) => {
    // Wait for activity summary to load
    await expect(page.locator('text=Activity Summary')).toBeVisible();

    // Verify activity counts (based on seed data: 1 call, 1 email, 1 meeting)
    const callCount = await page.locator('text=Calls').locator('..').locator('text=/\\d+/').textContent();
    expect(parseInt(callCount)).toBeGreaterThanOrEqual(1);

    const emailCount = await page.locator('text=Emails').locator('..').locator('text=/\\d+/').textContent();
    expect(parseInt(emailCount)).toBeGreaterThanOrEqual(1);

    const meetingCount = await page.locator('text=Meeting').locator('..').locator('text=/\\d+/').textContent();
    expect(parseInt(meetingCount)).toBeGreaterThanOrEqual(1);
  });

  test('activity timeline displays recent activities', async ({ page }) => {
    // Verify timeline section
    await expect(page.locator('text=Activity Summary')).toBeVisible();

    // Should show at least 3 activities in timeline
    const timelineItems = page.locator('[data-testid="timeline-item"]');
    await expect(timelineItems).toHaveCount(4); // Shows 4 most recent
  });

  test('analytics section displays all metrics', async ({ page }) => {
    // Wait for analytics to load
    await expect(page.locator('text=Analytics')).toBeVisible();

    // Verify 4 analytics metrics
    await expect(page.locator('text=Deal Progress')).toBeVisible();
    await expect(page.locator('text=Win/Loss Ratio')).toBeVisible();
    await expect(page.locator('text=Conversion Rate')).toBeVisible();
    await expect(page.locator('text=Engagement Metrics')).toBeVisible();
  });

  test('activity monitoring tabs filter activities', async ({ page }) => {
    // Verify Activity Monitoring section
    await expect(page.locator('text=Activity Monitoring')).toBeVisible();

    // Verify tabs exist
    await expect(page.locator('role=tab[name="All"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Email"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Meeting"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Call Log"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Tasks"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Notes"]')).toBeVisible();

    // Click Email tab
    await page.click('role=tab[name="Email"]');
    await page.waitForTimeout(500);

    // Verify email activities shown
    await expect(page.locator('[data-testid="activity-type-email"]')).toBeVisible();

    // Click Meeting tab
    await page.click('role=tab[name="Meeting"]');
    await page.waitForTimeout(500);

    // Verify meeting activities shown
    await expect(page.locator('[data-testid="activity-type-meeting"]')).toBeVisible();
  });

  test('sales pipeline shows correct stage progress', async ({ page }) => {
    // Verify pipeline section
    await expect(page.locator('text=Sales Pipeline')).toBeVisible();

    // Deal is in "proposal" stage, so Contact, MQL, SQL should be done
    await expect(page.locator('[data-testid="stage-contact"]')).toHaveAttribute('data-status', 'done');
    await expect(page.locator('[data-testid="stage-mql"]')).toHaveAttribute('data-status', 'done');
    await expect(page.locator('[data-testid="stage-sql"]')).toHaveAttribute('data-status', 'done');
    await expect(page.locator('[data-testid="stage-chance"]')).toHaveAttribute('data-status', 'pending');
  });

  test('page handles non-existent deal gracefully', async ({ page }) => {
    await page.goto('/apps/crm/deal-details?id=00000000-0000-0000-0000-999999999999');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load deal details');
  });

  test('page handles missing deal ID parameter', async ({ page }) => {
    await page.goto('/apps/crm/deal-details');

    // Should show error message
    await expect(page.locator('text=Deal ID Required')).toBeVisible();
  });

  test('deep linking works with deal ID', async ({ page }) => {
    // Navigate away
    await page.goto('/dashboard');

    // Navigate directly to deal details with ID
    await page.goto(`/apps/crm/deal-details?id=${testDealId}`);

    // Should load correctly
    await expect(page.locator('[data-testid="deal-name"]')).toBeVisible();
  });

  test('data persists after page refresh', async ({ page }) => {
    // Get initial deal name
    const initialName = await page.locator('[data-testid="deal-name"]').textContent();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify same data loads
    const reloadedName = await page.locator('[data-testid="deal-name"]').textContent();
    expect(reloadedName).toBe(initialName);
  });
});
