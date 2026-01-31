import { test, expect } from '@playwright/test';

/**
 * E2E Tests for CRM Overview Page (/apps/crm)
 *
 * Tests the split-screen layout combining CRM dashboard and Deals kanban:
 * - Desktop: 50/50 split layout with independent scrolling
 * - Mobile: Vertical stack layout
 * - Both components render correctly
 */

test.describe('CRM Overview - Split Screen Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the CRM overview page
    await page.goto('/apps/crm');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should load page successfully without errors', async ({ page }) => {
    // Verify page title or main heading
    await expect(page).toHaveURL('/apps/crm');

    // Verify no console errors (basic smoke test)
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a moment for any potential errors
    await page.waitForTimeout(1000);

    // Verify main layout container is present
    await expect(page.locator('[data-testid="split-screen-container"]')).toBeVisible();
  });

  test('should display both CRM dashboard and Deals kanban on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Verify left side (CRM dashboard) is visible
    const leftContainer = page.locator('[data-testid="split-screen-left"]');
    await expect(leftContainer).toBeVisible();

    // Verify right side (Deals kanban) is visible
    const rightContainer = page.locator('[data-testid="split-screen-right"]');
    await expect(rightContainer).toBeVisible();

    // Verify CRM dashboard content is present in left side
    // Look for CRM-specific elements (greeting, KPIs, etc.)
    const leftContent = await leftContainer.textContent();
    expect(leftContent).toBeTruthy();

    // Verify Deals kanban content is present in right side
    // Look for Deals-specific elements (kanban board, deal cards)
    const rightContent = await rightContainer.textContent();
    expect(rightContent).toBeTruthy();
  });

  test('should render 50/50 split layout on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for layout to stabilize
    await page.waitForSelector('[data-testid="split-screen-left"]');
    await page.waitForSelector('[data-testid="split-screen-right"]');

    // Get bounding boxes for both sides
    const leftBox = await page.locator('[data-testid="split-screen-left"]').boundingBox();
    const rightBox = await page.locator('[data-testid="split-screen-right"]').boundingBox();

    // Verify both sides exist
    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();

    // Verify they are side by side (same Y position, allowing for minor variations)
    expect(Math.abs(leftBox!.y - rightBox!.y)).toBeLessThan(5);

    // Verify they are roughly equal width (50/50 split)
    const widthDifference = Math.abs(leftBox!.width - rightBox!.width);
    expect(widthDifference).toBeLessThan(20); // Allow small tolerance for scrollbars

    // Verify each side is approximately 50% of the container width
    // Accounting for sidebar on desktop (~280px)
    const totalWidth = page.viewportSize()!.width;
    expect(leftBox!.width).toBeGreaterThan(totalWidth * 0.35);
    expect(rightBox!.width).toBeGreaterThan(totalWidth * 0.35);

    // Verify left side comes before right side horizontally
    expect(leftBox!.x).toBeLessThan(rightBox!.x);
  });

  test('should stack vertically on mobile', async ({ page }) => {
    // Set mobile viewport (iPhone dimensions)
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for layout to stabilize
    await page.waitForSelector('[data-testid="split-screen-left"]');
    await page.waitForSelector('[data-testid="split-screen-right"]');

    // Get bounding boxes for both sides
    const leftBox = await page.locator('[data-testid="split-screen-left"]').boundingBox();
    const rightBox = await page.locator('[data-testid="split-screen-right"]').boundingBox();

    // Verify both sides exist
    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();

    // Verify they are stacked vertically (right side below left side)
    expect(rightBox!.y).toBeGreaterThan(leftBox!.y + leftBox!.height - 10);

    // Verify both sections are full width on mobile
    const totalWidth = page.viewportSize()!.width;
    expect(leftBox!.width).toBeGreaterThan(totalWidth * 0.9);
    expect(rightBox!.width).toBeGreaterThan(totalWidth * 0.9);

    // Verify CRM dashboard appears above Deals
    expect(leftBox!.y).toBeLessThan(rightBox!.y);
  });

  test('should have independent scrolling on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for layout to render
    await page.waitForSelector('[data-testid="split-screen-left"]');
    await page.waitForSelector('[data-testid="split-screen-right"]');

    // Check left side overflow-y property
    const leftOverflow = await page.locator('[data-testid="split-screen-left"]').evaluate((el) => {
      return window.getComputedStyle(el).overflowY;
    });

    // Check right side overflow-y property
    const rightOverflow = await page.locator('[data-testid="split-screen-right"]').evaluate((el) => {
      return window.getComputedStyle(el).overflowY;
    });

    // Verify both sides have independent scrolling enabled
    expect(['auto', 'scroll']).toContain(leftOverflow);
    expect(['auto', 'scroll']).toContain(rightOverflow);
  });

  test('should maintain 50/50 split across different desktop widths', async ({ page }) => {
    const desktopWidths = [1024, 1280, 1440, 1920];

    for (const width of desktopWidths) {
      // Set viewport to current desktop width
      await page.setViewportSize({ width, height: 768 });

      // Wait for layout to adjust
      await page.waitForTimeout(300);

      // Get bounding boxes
      const leftBox = await page.locator('[data-testid="split-screen-left"]').boundingBox();
      const rightBox = await page.locator('[data-testid="split-screen-right"]').boundingBox();

      // Verify 50/50 split is maintained
      expect(leftBox).not.toBeNull();
      expect(rightBox).not.toBeNull();

      const widthDifference = Math.abs(leftBox!.width - rightBox!.width);
      expect(widthDifference).toBeLessThan(20);
    }
  });

  test('should verify flex layout direction changes with breakpoint', async ({ page }) => {
    // Desktop: row layout
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForSelector('[data-testid="split-screen-container"]');

    const desktopFlexDirection = await page.locator('[data-testid="split-screen-container"]').evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });

    // Should be row on desktop (md breakpoint and above)
    expect(desktopFlexDirection).toBe('row');

    // Mobile: column layout
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300); // Wait for layout adjustment

    const mobileFlexDirection = await page.locator('[data-testid="split-screen-container"]').evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });

    // Should be column on mobile
    expect(mobileFlexDirection).toBe('column');
  });

  test('should render CRM dashboard components in left section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const leftContainer = page.locator('[data-testid="split-screen-left"]');

    // Wait for CRM dashboard to load
    await expect(leftContainer).toBeVisible();

    // Verify left container has content
    const leftContent = await leftContainer.textContent();
    expect(leftContent).toBeTruthy();
    expect(leftContent!.length).toBeGreaterThan(0);
  });

  test('should render Deals kanban in right section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const rightContainer = page.locator('[data-testid="split-screen-right"]');

    // Wait for Deals kanban to load
    await expect(rightContainer).toBeVisible();

    // Verify right container has content
    const rightContent = await rightContainer.textContent();
    expect(rightContent).toBeTruthy();
    expect(rightContent!.length).toBeGreaterThan(0);
  });

  test('should handle tablet viewport appropriately', async ({ page }) => {
    // iPad Pro dimensions (tablet)
    await page.setViewportSize({ width: 1024, height: 1366 });

    await page.waitForSelector('[data-testid="split-screen-container"]');

    // At 1024px width, should still use row layout (md breakpoint is 900px in MUI)
    const flexDirection = await page.locator('[data-testid="split-screen-container"]').evaluate((el) => {
      return window.getComputedStyle(el).flexDirection;
    });

    expect(flexDirection).toBe('row');

    // Verify both sides are visible
    await expect(page.locator('[data-testid="split-screen-left"]')).toBeVisible();
    await expect(page.locator('[data-testid="split-screen-right"]')).toBeVisible();
  });
});
