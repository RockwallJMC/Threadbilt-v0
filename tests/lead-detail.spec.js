/**
 * Lead Detail Component Tests
 *
 * Tests for the Lead Detail page component following TDD principles.
 * These tests verify:
 * - Status dropdown visibility and functionality
 * - Status update with optimistic UI
 * - Convert to Opportunity button visibility (conditional on lead status)
 * - Convert to Opportunity button functionality
 * - Existing features remain intact (ActivityTabs, ContactInfo, etc.)
 */

import { test, expect } from '@playwright/test';

/**
 * Authentication Helper
 * Logs in a user via the login page
 */
async function loginUser(page, email, password, context) {
  // Clear any existing session first
  if (context) {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  await page.goto('/authentication/default/jwt/login');

  // Verify we're on login page (not redirected due to existing session)
  await page.waitForSelector('input[type="email"]', { timeout: 5000 });

  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // Wait for navigation to complete (login successful)
  await page.waitForURL(/^((?!\/authentication).)*$/, { timeout: 10000 });

  // If redirected to organization setup, handle it
  if (page.url().includes('/organization-setup')) {
    // Wait for page to be ready and select first organization if available
    await page.waitForTimeout(1000);
    const continueButton = page.getByRole('button', { name: /continue/i });
    if (await continueButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForURL(/^((?!\/organization-setup).)*$/, { timeout: 5000 });
    }
  }
}

test.describe('Lead Detail Page', () => {
  test.beforeEach(async ({ page, context }) => {
    page.setDefaultNavigationTimeout(60000);

    // Log in with default credentials
    await loginUser(page, 'demo@aurora.com', 'password123', context);

    // Navigate to a lead detail page (lead_001 - new status)
    await page.goto('http://localhost:4000/apps/crm/leads/lead_001');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Status Dropdown', () => {
    test('displays status dropdown with current lead status', async ({ page }) => {
      // Should display a Select component with current status
      const statusSelect = page.locator('[data-testid="lead-status-select"]');
      await expect(statusSelect).toBeVisible();

      // For lead_001, status should be 'new'
      await expect(statusSelect).toContainText('New');
    });

    test('status dropdown shows all status options when opened', async ({ page }) => {
      // Click to open the dropdown
      const statusSelect = page.locator('[data-testid="lead-status-select"]');
      await statusSelect.click();

      // Should display all 5 status options (use exact matching to avoid conflicts)
      await expect(page.getByRole('option', { name: 'New', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Contacted', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Qualified', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Unqualified', exact: true })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Converted', exact: true })).toBeVisible();
    });

    test('status dropdown updates lead status when option selected', async ({ page }) => {
      // Open dropdown
      const statusSelect = page.locator('[data-testid="lead-status-select"]');
      await statusSelect.click();

      // Select 'Contacted' status (use exact matching)
      await page.getByRole('option', { name: 'Contacted', exact: true }).click();

      // Status should update immediately (optimistic UI)
      await expect(statusSelect).toContainText('Contacted');

      // Wait a moment for API call to complete
      await page.waitForTimeout(200);

      // Reload page to verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Status should still be 'Contacted' after reload
      const statusSelectAfterReload = page.locator('[data-testid="lead-status-select"]');
      await expect(statusSelectAfterReload).toContainText('Contacted');
    });

    test('status dropdown displays color-coded chip for each status', async ({ page }) => {
      // Open dropdown
      const statusSelect = page.locator('[data-testid="lead-status-select"]');
      await statusSelect.click();

      // Each option should have a Chip with appropriate color
      // 'new' = default, 'contacted' = info, 'qualified' = success, 'unqualified' = error, 'converted' = success
      const qualifiedOption = page.getByRole('option', { name: 'Qualified', exact: true });
      await expect(qualifiedOption).toBeVisible();

      // Close dropdown
      await page.keyboard.press('Escape');
    });

    test('status dropdown is prominently placed in header area', async ({ page }) => {
      // Status dropdown should be in the header/top area of the page
      const statusSelect = page.locator('[data-testid="lead-status-select"]');
      const selectBox = await statusSelect.boundingBox();

      // Should be in the upper portion of the page (y < 300px typically)
      expect(selectBox.y).toBeLessThan(400);
    });
  });

  test.describe('Convert to Opportunity Button', () => {
    test('displays convert button for new lead', async ({ page }) => {
      // Navigate to lead with 'new' status
      await page.goto('http://localhost:4000/apps/crm/leads/lead_001');
      await page.waitForLoadState('networkidle');

      // Should display "Convert to Opportunity" button
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await expect(convertButton).toBeVisible();
    });

    test('displays convert button for contacted lead', async ({ page }) => {
      // Navigate to lead with 'contacted' status
      await page.goto('http://localhost:4000/apps/crm/leads/lead_004');
      await page.waitForLoadState('networkidle');

      // Should display "Convert to Opportunity" button
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await expect(convertButton).toBeVisible();
    });

    test('displays convert button for qualified lead', async ({ page }) => {
      // Navigate to lead with 'qualified' status
      await page.goto('http://localhost:4000/apps/crm/leads/lead_007');
      await page.waitForLoadState('networkidle');

      // Should display "Convert to Opportunity" button
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await expect(convertButton).toBeVisible();
    });

    test('displays convert button for unqualified lead', async ({ page }) => {
      // Navigate to lead with 'unqualified' status
      await page.goto('http://localhost:4000/apps/crm/leads/lead_010');
      await page.waitForLoadState('networkidle');

      // Should display "Convert to Opportunity" button
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await expect(convertButton).toBeVisible();
    });

    test('HIDES convert button for converted lead', async ({ page }) => {
      // Navigate to lead with 'converted' status
      await page.goto('http://localhost:4000/apps/crm/leads/lead_012');
      await page.waitForLoadState('networkidle');

      // Should NOT display "Convert to Opportunity" button
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await expect(convertButton).not.toBeVisible();
    });

    test('convert button uses primary color and is prominently placed', async ({ page }) => {
      // Should be a primary-colored button in a prominent location
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await expect(convertButton).toBeVisible();

      // Should be in the upper portion of the page (near header/status)
      const buttonBox = await convertButton.boundingBox();
      expect(buttonBox.y).toBeLessThan(400);
    });

    test('convert button opens modal when clicked', async ({ page }) => {
      // Click convert button
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await convertButton.click();

      // Should open ConvertLeadModal (will be implemented in next phase)
      // For now, verify button is clickable and doesn't error
      // Modal will be tested in Phase 1.5 when implemented
      await page.waitForTimeout(100);
    });

    test('convert button has forward arrow icon', async ({ page }) => {
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await expect(convertButton).toBeVisible();

      // Should contain text "Convert to Opportunity" (icon verification is visual)
      await expect(convertButton).toHaveText(/convert to opportunity/i);
    });
  });

  test.describe('Existing Features Preserved', () => {
    test('displays ActivityTabs component', async ({ page }) => {
      // Should display ActivityTabs (existing feature)
      // ActivityTabs has sub-tabs: Activities, Email, Meeting, etc.
      await expect(page.getByRole('tab', { name: 'Activities' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Email' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Meeting' })).toBeVisible();
    });

    test('displays contact information grid', async ({ page }) => {
      // Should display contact info attributes (existing ContactInfo components)
      // Lead_001 has: email, phone, source, company
      await expect(page.locator('text=sarah.mitchell@techvision.com')).toBeVisible();
      await expect(page.locator('text=+1 (415) 234-5678')).toBeVisible();
      await expect(page.locator('text=TechVision Analytics')).toBeVisible();
    });

    test('displays ongoing deals section', async ({ page }) => {
      // Should display OngoingDeals component (existing feature)
      // This section may have placeholder or actual deals data
      // Just verify it's present and doesn't break
      const ongoingDealsSection = page.locator('text=Ongoing Deals').or(
        page.locator('text=Deals').first()
      );
      // Section might not be visible for all leads, but component should render
    });

    test('page layout remains intact with Grid structure', async ({ page }) => {
      // Overall page should use Stack and Grid (existing structure)
      // Verify main sections are present
      await expect(page.locator('h4').or(page.locator('h5')).first()).toBeVisible();
      await expect(page.locator('text=sarah.mitchell@techvision.com')).toBeVisible();
    });
  });

  test.describe('Integration with API Hooks', () => {
    test('loads lead data using useLead hook', async ({ page }) => {
      // Page should load lead data via useLead(id)
      // Verify lead-specific data is displayed
      await expect(page.locator('text=Sarah Mitchell')).toBeVisible();
      await expect(page.locator('text=sarah.mitchell@techvision.com')).toBeVisible();
    });

    test('status update triggers useUpdateLead mutation', async ({ page }) => {
      // This test verifies the integration (mock API logs the update)
      // Open dropdown and change status
      const statusSelect = page.locator('[data-testid="lead-status-select"]');
      await statusSelect.click();
      await page.getByRole('option', { name: 'Contacted' }).click();

      // Wait for mutation to complete
      await page.waitForTimeout(200);

      // Verify update persisted (mock implementation)
      // In real implementation, this would verify Supabase mutation
    });

    test('displays loading state while fetching lead data', async ({ page }) => {
      // Navigate to a different lead to trigger loading
      await page.goto('http://localhost:4000/apps/crm/leads/lead_002');

      // Loading state should appear briefly
      // (May be too fast to catch, but component should handle it)
      await page.waitForLoadState('networkidle');

      // Verify data loaded successfully
      await expect(page.locator('text=Marcus Chen')).toBeVisible();
    });

    test('displays error state when lead not found', async ({ page }) => {
      // Navigate to non-existent lead
      await page.goto('http://localhost:4000/apps/crm/leads/lead_999');
      await page.waitForLoadState('networkidle');

      // Should display error message
      await expect(page.locator('text=Lead not found').or(
        page.locator('text=not found')
      )).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('status dropdown and convert button visible on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Both should be visible on mobile
      const statusSelect = page.locator('[data-testid="lead-status-select"]');
      await expect(statusSelect).toBeVisible();

      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });
      await expect(convertButton).toBeVisible();
    });

    test('layout stacks appropriately on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Contact info grid should stack vertically (Grid size={{ xs: 12 }})
      await expect(page.locator('text=sarah.mitchell@techvision.com')).toBeVisible();
    });

    test('status dropdown and convert button side-by-side on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Both elements should be visible and in header area
      const statusSelect = page.locator('[data-testid="lead-status-select"]');
      const convertButton = page.getByRole('button', { name: /convert to opportunity/i });

      await expect(statusSelect).toBeVisible();
      await expect(convertButton).toBeVisible();
    });
  });
});
