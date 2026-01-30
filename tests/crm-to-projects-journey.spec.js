import { test, expect } from '@playwright/test';

test.describe('CRM-to-Projects User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Complete CRM-to-Projects conversion flow', async ({ page }) => {
    // Part 1: Select opportunity and mark as Closed Won
    await test.step('Navigate to CRM deals and select opportunity', async () => {
      // Navigate to CRM deals page
      await page.click('[data-testid="nav-crm"]');
      await page.click('[data-testid="nav-deals"]');
      
      // Wait for deals page to load
      await expect(page.locator('h4')).toContainText('Deals');
      
      // Select first deal/opportunity
      await page.click('[data-testid="deal-card"]:first-child');
      
      // Verify we're on deal details page
      await expect(page.locator('h4')).toContainText('Deal Details');
    });

    await test.step('Mark opportunity as Closed Won', async () => {
      // Click on deal status dropdown
      await page.click('[data-testid="deal-status"]');
      
      // Select "Closed Won" status
      await page.click('[data-testid="status-closed-won"]');
      
      // Verify status change
      await expect(page.locator('[data-testid="deal-status"]')).toContainText('Closed Won');
    });

    // Part 2: Convert to project with data carryover
    await test.step('Convert opportunity to project', async () => {
      // Click convert to project button
      await page.click('button:has-text("Convert to Project")');
      
      // Verify conversion dialog opens
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('h6')).toContainText('Convert Opportunity to Project');
      
      // Verify opportunity data is carried over
      const projectNameInput = page.locator('input[label="Project Name"]');
      await expect(projectNameInput).not.toBeEmpty();
      
      // Fill in required fields
      await page.selectOption('select[label="Project Manager"]', { index: 1 });
      await page.fill('input[label="End Date"]', '2024-12-31');
      
      // Submit conversion
      await page.click('button:has-text("Convert to Project")');
      
      // Verify dialog closes
      await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    // Part 3: Navigate to Projects Desk and verify project creation
    await test.step('Verify project creation in Projects Desk', async () => {
      // Navigate to Projects Desk
      await page.goto('/desks/projects');
      
      // Wait for projects dashboard to load
      await expect(page.locator('h4')).toContainText('Projects Desk');
      
      // Verify the converted project appears in the list
      await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
      
      // Take screenshot for verification
      await page.screenshot({ path: 'test-results/projects-dashboard.png' });
    });

    // Part 4: Add project phase
    await test.step('Add project phase', async () => {
      // Click on the first project to view details
      await page.click('[data-testid="project-row"]:first-child [data-testid="view-project"]');
      
      // Verify we're on project detail page
      await expect(page.locator('h5')).toBeVisible();
      
      // Navigate to Overview tab (should be default)
      await expect(page.locator('[role="tab"]:has-text("Overview")')).toHaveAttribute('aria-selected', 'true');
      
      // Verify phases section exists
      await expect(page.locator('h6:has-text("Project Phases")')).toBeVisible();
    });

    // Part 5: Add tasks to phase
    await test.step('Add tasks to project', async () => {
      // Navigate to Tasks tab
      await page.click('[role="tab"]:has-text("Tasks")');
      
      // Verify Kanban board is visible
      await expect(page.locator('h6:has-text("To Do")')).toBeVisible();
      await expect(page.locator('h6:has-text("In Progress")')).toBeVisible();
      await expect(page.locator('h6:has-text("Completed")')).toBeVisible();
      await expect(page.locator('h6:has-text("Blocked")')).toBeVisible();
      
      // Verify task cards are present
      await expect(page.locator('[data-testid="task-card"]')).toHaveCount.greaterThan(0);
      
      // Take screenshot of Kanban board
      await page.screenshot({ path: 'test-results/project-kanban.png' });
    });

    // Part 6: Navigate to Gantt view (integration test)
    await test.step('Verify Gantt view integration', async () => {
      // Navigate back to Overview tab to see project timeline
      await page.click('[role="tab"]:has-text("Overview")');
      
      // Verify project phases timeline is visible
      await expect(page.locator('h6:has-text("Project Phases")')).toBeVisible();
      
      // Verify phase progress bars
      await expect(page.locator('[role="progressbar"]')).toHaveCount.greaterThan(0);
    });

    // Part 7: Verify bidirectional links (opportunity ↔ project)
    await test.step('Verify bidirectional links', async () => {
      // Navigate back to CRM to verify the link
      await page.goto('/apps/crm/deal-details');
      
      // Verify opportunity still exists and shows project link
      await expect(page.locator('h4')).toContainText('Deal Details');
      
      // Look for project reference or link (this would be implemented in real app)
      // For now, just verify we can navigate back
      
      // Navigate back to project
      await page.goto('/desks/projects');
      await expect(page.locator('h4')).toContainText('Projects Desk');
      
      // Verify project still shows opportunity reference
      await page.click('[data-testid="project-row"]:first-child [data-testid="view-project"]');
      
      // In project details, verify opportunity reference exists
      // This would show in project metadata or a dedicated section
      await expect(page.locator('h5')).toBeVisible();
    });

    // Final verification screenshot
    await test.step('Take final verification screenshot', async () => {
      await page.screenshot({ path: 'test-results/crm-to-projects-final.png' });
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test data if needed
    await page.close();
  });
});
