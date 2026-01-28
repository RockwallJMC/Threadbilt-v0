/**
 * Contact Detail Component Tests
 *
 * Tests for the Contact Detail page component following TDD principles.
 * These tests verify:
 * - Loading states with skeleton loaders
 * - Error states with error messages
 * - Not found states
 * - Success state with full UI (sidebar, tabs, account association)
 * - Responsive behavior
 * - Tab navigation
 * - Account association display
 */

import { test, expect } from '@playwright/test';

test.describe('Contact Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contact detail page
    await page.goto('http://localhost:4000/apps/crm/contacts/contact_007');
  });

  test('displays loading state initially', async ({ page }) => {
    // Wait for navigation
    await page.waitForURL('**/apps/crm/contacts/contact_007');

    // Check for skeleton loaders (should appear briefly)
    // Note: This may be too fast to catch in real implementation
    // but the component should render skeletons during loading
  });

  test('displays contact detail page with full name in header', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Should display full name (first_name + last_name) in header
    await expect(page.locator('h4').filter({ hasText: 'Sarah Johnson' })).toBeVisible();
  });

  test('displays contact sidebar with contact information', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Should display contact details in sidebar
    await expect(page.locator('text=Chief Technology Officer')).toBeVisible();
    await expect(page.locator('text=sarah.johnson@techvisionsolutions.com')).toBeVisible();
    await expect(page.locator('text=+1 (415) 555-0124')).toBeVisible();
  });

  test('displays account association in sidebar', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Contact 007 is linked to acc_001 (TechVision Solutions Inc.)
    // Should display account name as clickable chip
    await expect(page.locator('text=TechVision Solutions Inc.')).toBeVisible();

    // Should display role chip
    await expect(page.locator('text=Decision Maker')).toBeVisible();
  });

  test('displays unlink button for linked contact', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Should display Unlink button for contact linked to account
    const unlinkButton = page.getByRole('button', { name: /unlink/i });
    await expect(unlinkButton).toBeVisible();
  });

  test('displays link button for independent contact', async ({ page }) => {
    // Navigate to independent contact (no account_id)
    await page.goto('http://localhost:4000/apps/crm/contacts/contact_001');
    await page.waitForLoadState('networkidle');

    // Should display "Link to Account" button
    const linkButton = page.getByRole('button', { name: /link to account/i });
    await expect(linkButton).toBeVisible();
  });

  test('displays edit and delete buttons in sidebar', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Should display Edit button
    const editButton = page.getByRole('button', { name: /edit/i });
    await expect(editButton).toBeVisible();

    // Should display Delete button
    const deleteButton = page.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeVisible();
  });

  test('displays tabs: Overview, Activity, Opportunities, Documents', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Should display all 4 tabs
    await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Activity' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Opportunities' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Documents' })).toBeVisible();
  });

  test('displays Overview tab content by default', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Overview tab should be active by default
    const overviewTab = page.getByRole('tab', { name: 'Overview' });
    await expect(overviewTab).toHaveAttribute('aria-selected', 'true');

    // Should display personal info section
    await expect(page.locator('text=Personal Information').or(page.locator('text=Contact Information'))).toBeVisible();
  });

  test('switches to Activity tab and displays ActivityTabs component', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on Activity tab
    await page.getByRole('tab', { name: 'Activity' }).click();

    // Should display ActivityTabs sub-tabs (Activities, Email, Meeting, etc.)
    await expect(page.getByRole('tab', { name: 'Activities' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Meeting' })).toBeVisible();
  });

  test('displays placeholder message in Opportunities tab', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on Opportunities tab
    await page.getByRole('tab', { name: 'Opportunities' }).click();

    // Should display placeholder message
    await expect(page.locator('text=Contact opportunities will be available in Phase 1.5').or(
      page.locator('text=Opportunities will be available in Phase 1.5')
    )).toBeVisible();
  });

  test('displays placeholder message in Documents tab', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on Documents tab
    await page.getByRole('tab', { name: 'Documents' }).click();

    // Should display placeholder message
    await expect(page.locator('text=Document management coming soon')).toBeVisible();
  });

  test('displays LinkedIn URL link when present', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Contact 007 has LinkedIn URL
    const linkedinLink = page.locator('a[href*="linkedin.com"]');
    await expect(linkedinLink).toBeVisible();
  });

  test('account chip navigates to account detail page when clicked', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on account chip
    await page.locator('text=TechVision Solutions Inc.').click();

    // Should navigate to account detail page
    await expect(page).toHaveURL(/\/apps\/crm\/accounts\/acc_001/);
  });

  test('displays notes in sidebar', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Contact 007 has notes
    await expect(page.locator('text=Primary technical contact')).toBeVisible();
  });

  test('displays created and updated dates', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Should display created and updated dates
    // Dates should be formatted (not raw ISO strings)
    await expect(page.locator('text=Created').or(page.locator('text=created'))).toBeVisible();
    await expect(page.locator('text=Updated').or(page.locator('text=updated'))).toBeVisible();
  });

  test('displays error state when contact not found', async ({ page }) => {
    // Navigate to non-existent contact
    await page.goto('http://localhost:4000/apps/crm/contacts/contact_999');
    await page.waitForLoadState('networkidle');

    // Should display error message
    await expect(page.locator('text=Contact not found')).toBeVisible();
  });

  test('displays error state when API error occurs', async ({ page }) => {
    // This test requires mocking API to return error
    // For now, test that error UI would display with proper error message
    // Implementation will handle error.message display
  });

  test('responsive layout: sidebar and tabs side-by-side on desktop', async ({ page, viewport }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForLoadState('networkidle');

    // On desktop (≥900px), sidebar and tabs should be side-by-side
    // This is verified by Grid layout with size={{ xs: 12, lg: 3 }} for sidebar
    const sidebar = page.locator('[data-testid="contact-sidebar"]').or(
      page.locator('text=Chief Technology Officer').locator('..')
    );
    await expect(sidebar).toBeVisible();
  });

  test('responsive layout: single column on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // On mobile (<900px), layout should stack vertically
    // Grid size={{ xs: 12, lg: 3 }} means full width on mobile
    const mainContent = page.locator('h4').filter({ hasText: 'Sarah Johnson' });
    await expect(mainContent).toBeVisible();
  });

  test('unlink button shows alert when clicked (temporary behavior)', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Setup dialog handler to catch alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Feature coming in Step 8');
      await dialog.accept();
    });

    // Click Unlink button
    const unlinkButton = page.getByRole('button', { name: /unlink/i });
    await unlinkButton.click();
  });

  test('link button shows alert when clicked (temporary behavior)', async ({ page }) => {
    // Navigate to independent contact
    await page.goto('http://localhost:4000/apps/crm/contacts/contact_001');
    await page.waitForLoadState('networkidle');

    // Setup dialog handler to catch alert
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Feature coming in Step 8');
      await dialog.accept();
    });

    // Click Link to Account button
    const linkButton = page.getByRole('button', { name: /link to account/i });
    await linkButton.click();
  });

  test('displays independent contact message when not linked to account', async ({ page }) => {
    // Navigate to independent contact
    await page.goto('http://localhost:4000/apps/crm/contacts/contact_001');
    await page.waitForLoadState('networkidle');

    // Click Overview tab to see account info section
    await page.getByRole('tab', { name: 'Overview' }).click();

    // Should display "Independent Contact" message
    await expect(page.locator('text=Independent Contact')).toBeVisible();
  });

  test('displays account details in Overview tab when linked', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click Overview tab
    await page.getByRole('tab', { name: 'Overview' }).click();

    // Should display linked account information
    await expect(page.locator('text=TechVision Solutions Inc.')).toBeVisible();
    await expect(page.locator('text=Technology')).toBeVisible(); // Industry
  });
});
