import { test, expect } from '@playwright/test';

test.describe('SplitScreenLayout', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a test page that uses SplitScreenLayout
    // This will be created in Task 2, but we'll create a test route for testing
    await page.goto('/test/split-screen-layout');
  });

  test('should render left and right content side by side on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for layout to render
    await page.waitForSelector('[data-testid="split-screen-left"]');
    await page.waitForSelector('[data-testid="split-screen-right"]');

    // Get bounding boxes for both sides
    const leftBox = await page.locator('[data-testid="split-screen-left"]').boundingBox();
    const rightBox = await page.locator('[data-testid="split-screen-right"]').boundingBox();

    // Verify both sides are visible
    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();

    // Verify they are side by side (roughly same Y position)
    expect(Math.abs(leftBox!.y - rightBox!.y)).toBeLessThan(5);

    // Verify they are roughly 50% width each (with some tolerance for scrollbars and sidebar)
    // The sidebar on desktop takes about 280px, so we need to account for that
    const totalWidth = page.viewportSize()!.width;

    // Each side should be roughly equal width to each other
    const widthDifference = Math.abs(leftBox!.width - rightBox!.width);
    expect(widthDifference).toBeLessThan(20); // Allow small difference for scrollbars

    // Each side should be at least 35% of viewport (accounting for sidebar)
    expect(leftBox!.width).toBeGreaterThan(totalWidth * 0.35);
    expect(rightBox!.width).toBeGreaterThan(totalWidth * 0.35);
  });

  test('should stack vertically on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for layout to render
    await page.waitForSelector('[data-testid="split-screen-left"]');
    await page.waitForSelector('[data-testid="split-screen-right"]');

    // Get bounding boxes for both sides
    const leftBox = await page.locator('[data-testid="split-screen-left"]').boundingBox();
    const rightBox = await page.locator('[data-testid="split-screen-right"]').boundingBox();

    // Verify both sides are visible
    expect(leftBox).not.toBeNull();
    expect(rightBox).not.toBeNull();

    // Verify they are stacked vertically (right side should be below left side)
    expect(rightBox!.y).toBeGreaterThan(leftBox!.y + leftBox!.height - 10);

    // Verify they are full width on mobile
    const totalWidth = page.viewportSize()!.width;
    expect(leftBox!.width).toBeGreaterThan(totalWidth * 0.9);
    expect(rightBox!.width).toBeGreaterThan(totalWidth * 0.9);
  });

  test('should have independent scrolling on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for layout to render
    await page.waitForSelector('[data-testid="split-screen-left"]');
    await page.waitForSelector('[data-testid="split-screen-right"]');

    // Check if left side has overflow-y: auto or scroll
    const leftOverflow = await page.locator('[data-testid="split-screen-left"]').evaluate((el) => {
      return window.getComputedStyle(el).overflowY;
    });

    // Check if right side has overflow-y: auto or scroll
    const rightOverflow = await page.locator('[data-testid="split-screen-right"]').evaluate((el) => {
      return window.getComputedStyle(el).overflowY;
    });

    // Verify both sides have independent scrolling
    expect(['auto', 'scroll']).toContain(leftOverflow);
    expect(['auto', 'scroll']).toContain(rightOverflow);
  });

  test('should account for topbar height in total height', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for layout to render
    await page.waitForSelector('[data-testid="split-screen-left"]');

    // Get the container height
    const containerHeight = await page.locator('[data-testid="split-screen-container"]').evaluate((el) => {
      return window.getComputedStyle(el).height;
    });

    // The height should be less than viewport height (accounting for topbar)
    const viewportHeight = page.viewportSize()!.height;
    const heightValue = parseInt(containerHeight);

    // Should be less than full viewport height (topbar takes space)
    expect(heightValue).toBeLessThan(viewportHeight);

    // But should still be substantial (at least 80% of viewport)
    expect(heightValue).toBeGreaterThan(viewportHeight * 0.8);
  });

  test('should render custom content in left and right children', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1280, height: 720 });

    // Wait for layout to render
    await page.waitForSelector('[data-testid="split-screen-left"]');
    await page.waitForSelector('[data-testid="split-screen-right"]');

    // Verify left content renders (test page should have specific content)
    await expect(page.locator('[data-testid="split-screen-left"]')).toContainText('Left Content');

    // Verify right content renders (test page should have specific content)
    await expect(page.locator('[data-testid="split-screen-right"]')).toContainText('Right Content');
  });
});
