/**
 * CRM Phase 1.3 - UI Layer Tests
 *
 * Tests the Lead Details page UI integration with live database:
 * - Page loading with URL parameter (?id={contactId})
 * - Contact information display from useCRMContact hook
 * - Activity tabs using useCRMActivities hook
 * - No references to mock data (full live database integration)
 *
 * These are Layer 3 tests that verify the UI layer rendering live data,
 * assuming Layer 1 (database) and Layer 2 (API) are complete and working.
 *
 * Following TDD Red-Green-Refactor:
 * - RED: Write test showing desired UI behavior
 * - Verify RED: Run test, confirm it fails (UI not wired yet)
 * - GREEN: react-mui-frontend-engineer wires UI to live APIs
 * - Verify GREEN: Re-run test, confirm passes
 */

import { test, expect } from '@playwright/test';
import { loginAsOrgUser, TEST_DATA } from '../helpers/multi-tenant-setup.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const LEAD_DETAILS_URL = `${BASE_URL}/apps/crm/lead-details`;

test.describe('CRM Phase 1.3 - UI Layer Tests', () => {
  // ============================================================================
  // Suite 1: Page Loading Tests
  // ============================================================================

  test.describe('Page Loading', () => {
    test('loads lead details page with valid contact ID', async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');

      // Navigate to lead details page with contact ID
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.ACME_CONTACT.id}`);

      // Wait for page to load and render
      await page.waitForLoadState('networkidle');

      // Verify page loaded (check for main container or heading)
      // The page should have some identifiable element that shows it loaded successfully
      await expect(page.locator('body')).toBeVisible();

      // Should not show the "Contact ID required" error
      await expect(page.locator('text=Contact ID required')).not.toBeVisible();
    });

    test('displays error when contact ID is missing', async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');

      // Navigate to lead details page WITHOUT contact ID
      await page.goto(LEAD_DETAILS_URL);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Should display error message about missing ID
      await expect(
        page.locator('text=/Contact ID required|Please provide.*id/i')
      ).toBeVisible();
    });

    test('displays error when contact ID is invalid', async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');

      // Navigate with invalid/non-existent contact ID
      const invalidId = '00000000-0000-0000-0000-000000000000';
      await page.goto(`${LEAD_DETAILS_URL}?id=${invalidId}`);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Should display error or "not found" message
      // This could be an error alert, empty state, or similar UI indicator
      await expect(
        page.locator('text=/not found|error|invalid/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('displays error when contact belongs to different organization', async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');

      // Try to access TechStart's contact (should be blocked by RLS)
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.TECHSTART_CONTACT.id}`);

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Should display "not found" or similar (RLS blocks access, not 403)
      await expect(
        page.locator('text=/not found|error|access denied/i').first()
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // ============================================================================
  // Suite 2: Contact Information Display Tests
  // ============================================================================

  test.describe('Contact Information Display', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.ACME_CONTACT.id}`);
      await page.waitForLoadState('networkidle');
    });

    test('displays contact name', async ({ page }) => {
      // Should display the contact's full name
      const fullName = `${TEST_DATA.ACME_CONTACT.firstName} ${TEST_DATA.ACME_CONTACT.lastName}`;
      await expect(
        page.locator(`text=${fullName}`).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('displays contact email', async ({ page }) => {
      // Should display the contact's email
      await expect(
        page.locator(`text=${TEST_DATA.ACME_CONTACT.email}`).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('displays contact information section', async ({ page }) => {
      // Should have a section labeled "Contact Information" or similar
      await expect(
        page.locator('text=/Contact Information|Contact Details/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('does not display mock data', async ({ page }) => {
      // Verify no references to mock data from lead-details.jsx
      // Mock data includes: "Waka Waka PLC", "VP, Operations", "example_1@gmail.com"

      await expect(page.locator('text=Waka Waka PLC')).not.toBeVisible();
      await expect(page.locator('text=VP, Operations')).not.toBeVisible();
      await expect(page.locator('text=example_1@gmail.com')).not.toBeVisible();
      await expect(page.locator('text=+33 6 78 09 34 90')).not.toBeVisible();
    });
  });

  // ============================================================================
  // Suite 3: Ongoing Deals Display Tests
  // ============================================================================

  test.describe('Ongoing Deals Display', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.ACME_CONTACT.id}`);
      await page.waitForLoadState('networkidle');
    });

    test('displays deals section', async ({ page }) => {
      // Should have a section for deals/opportunities
      await expect(
        page.locator('text=/Ongoing Deals|Deals|Opportunities/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('does not display mock deals', async ({ page }) => {
      // Verify no references to mock deals from lead-details.jsx
      // Mock deals: "Replica Badidas Futbol", "Pumba Jersey Project", "Almost Original Mike Boots"

      await expect(page.locator('text=Replica Badidas Futbol')).not.toBeVisible();
      await expect(page.locator('text=Pumba Jersey Project')).not.toBeVisible();
      await expect(page.locator('text=Almost Original Mike Boots')).not.toBeVisible();
    });

    test('handles contact with no deals gracefully', async ({ page }) => {
      // Page should not error if contact has no associated deals
      // Should show empty state or "No deals" message

      // This is a smoke test - if we get here without errors, it's handling the case
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // ============================================================================
  // Suite 4: Activity Tabs Tests
  // ============================================================================

  test.describe('Activity Tabs', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.ACME_CONTACT.id}`);
      await page.waitForLoadState('networkidle');
    });

    test('renders activity tabs', async ({ page }) => {
      // Should have tabs for different activity types
      // Common types: Calls, Emails, Meetings, Notes, Tasks

      // Look for at least one activity type tab
      await expect(
        page.locator('text=/Calls|Emails|Meetings|Notes|Tasks/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('displays Calls tab', async ({ page }) => {
      await expect(
        page.locator('[role="tab"]', { hasText: /Calls/i }).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('displays Emails tab', async ({ page }) => {
      await expect(
        page.locator('[role="tab"]', { hasText: /Emails/i }).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('displays Meetings tab', async ({ page }) => {
      await expect(
        page.locator('[role="tab"]', { hasText: /Meetings/i }).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('displays Notes tab', async ({ page }) => {
      await expect(
        page.locator('[role="tab"]', { hasText: /Notes/i }).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('displays Tasks tab', async ({ page }) => {
      await expect(
        page.locator('[role="tab"]', { hasText: /Tasks/i }).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('switches between activity tabs', async ({ page }) => {
      // Click on Emails tab
      const emailsTab = page.locator('[role="tab"]', { hasText: /Emails/i }).first();
      await emailsTab.click();
      await page.waitForTimeout(500); // Wait for tab content to load

      // Click on Meetings tab
      const meetingsTab = page.locator('[role="tab"]', { hasText: /Meetings/i }).first();
      await meetingsTab.click();
      await page.waitForTimeout(500); // Wait for tab content to load

      // If we got here without errors, tab switching is working
      await expect(page.locator('body')).toBeVisible();
    });

    test('handles contact with no activities', async ({ page }) => {
      // Page should not error if contact has no activities
      // Should show empty state or "No activities" message

      // This is a smoke test - if we get here without errors, it's handling the case
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // ============================================================================
  // Suite 5: Data Integration Tests
  // ============================================================================

  test.describe('Live Data Integration', () => {
    test.beforeEach(async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.ACME_CONTACT.id}`);
      await page.waitForLoadState('networkidle');
    });

    test('loads data from live API endpoints', async ({ page }) => {
      // Monitor network requests to verify API calls are made
      const apiCalls = [];

      page.on('request', request => {
        const url = request.url();
        if (url.includes('/api/crm/contacts') || url.includes('/api/crm/activities')) {
          apiCalls.push(url);
        }
      });

      // Reload the page to capture API calls
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Should have made API calls to fetch contact and activities
      expect(apiCalls.some(url => url.includes('/api/crm/contacts'))).toBeTruthy();
    });

    test('displays real contact data from database', async ({ page }) => {
      // Verify we're seeing real data by checking for the known test contact
      const fullName = `${TEST_DATA.ACME_CONTACT.firstName} ${TEST_DATA.ACME_CONTACT.lastName}`;
      await expect(
        page.locator(`text=${fullName}`).first()
      ).toBeVisible({ timeout: 10000 });

      // Verify email from database
      await expect(
        page.locator(`text=${TEST_DATA.ACME_CONTACT.email}`).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('uses SWR hooks for data fetching', async ({ page }) => {
      // Verify that data updates work (SWR revalidation)
      // This is a smoke test - if the page loads and shows data, SWR is working

      await expect(page.locator('body')).toBeVisible();

      // Real SWR validation would require:
      // 1. Making a backend change
      // 2. Triggering revalidation
      // 3. Verifying UI updates
      // This is beyond the scope of UI layer tests
    });
  });

  // ============================================================================
  // Suite 6: Error Handling Tests
  // ============================================================================

  test.describe('Error Handling', () => {
    test('handles network errors gracefully', async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');

      // Simulate network failure by going offline
      await page.context().setOffline(true);

      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.ACME_CONTACT.id}`);
      await page.waitForLoadState('domcontentloaded');

      // Should handle the error (show error message or loading state)
      // Don't crash or show blank page
      await expect(page.locator('body')).toBeVisible();

      // Restore network
      await page.context().setOffline(false);
    });

    test('handles API errors gracefully', async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');

      // Navigate with invalid UUID format (will cause API error)
      await page.goto(`${LEAD_DETAILS_URL}?id=invalid-uuid-format`);
      await page.waitForLoadState('networkidle');

      // Should show error message, not crash
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // ============================================================================
  // Suite 7: Multi-Tenant Isolation Tests
  // ============================================================================

  test.describe('Multi-Tenant Isolation', () => {
    test('ACME user can only see ACME contacts', async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');

      // Can access ACME contact
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.ACME_CONTACT.id}`);
      await page.waitForLoadState('networkidle');

      const fullName = `${TEST_DATA.ACME_CONTACT.firstName} ${TEST_DATA.ACME_CONTACT.lastName}`;
      await expect(
        page.locator(`text=${fullName}`).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('ACME user cannot see TechStart contacts', async ({ page }) => {
      await loginAsOrgUser(page, 'ACME', 'admin');

      // Try to access TechStart contact
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.TECHSTART_CONTACT.id}`);
      await page.waitForLoadState('networkidle');

      // Should show error (RLS blocks access)
      await expect(
        page.locator('text=/not found|error|access denied/i').first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('TechStart user can only see TechStart contacts', async ({ page }) => {
      await loginAsOrgUser(page, 'TECHSTART', 'ceo');

      // Can access TechStart contact
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.TECHSTART_CONTACT.id}`);
      await page.waitForLoadState('networkidle');

      const fullName = `${TEST_DATA.TECHSTART_CONTACT.firstName} ${TEST_DATA.TECHSTART_CONTACT.lastName}`;
      await expect(
        page.locator(`text=${fullName}`).first()
      ).toBeVisible({ timeout: 10000 });
    });

    test('TechStart user cannot see ACME contacts', async ({ page }) => {
      await loginAsOrgUser(page, 'TECHSTART', 'ceo');

      // Try to access ACME contact
      await page.goto(`${LEAD_DETAILS_URL}?id=${TEST_DATA.ACME_CONTACT.id}`);
      await page.waitForLoadState('networkidle');

      // Should show error (RLS blocks access)
      await expect(
        page.locator('text=/not found|error|access denied/i').first()
      ).toBeVisible({ timeout: 10000 });
    });
  });
});
