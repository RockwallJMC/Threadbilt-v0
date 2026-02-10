/**
 * E2E Tests for Project Kanban Drag and Drop
 *
 * RED PHASE - Tests expected drag-and-drop behavior.
 *
 * Tests drag-and-drop functionality:
 * - Dragging tasks between columns
 * - Reordering tasks within a column
 * - Reordering columns
 * - Persistence of drag operations
 *
 * Following TDD principles:
 * 1. RED - These tests should FAIL initially (or may pass if DnD already works)
 * 2. GREEN - Implementation/fixes will make them pass consistently
 * 3. REFACTOR - Optimize DnD code while keeping tests green
 *
 * Note: Drag-and-drop testing can be flaky. Tests include proper waits and retries.
 */

import { test, expect } from '@playwright/test';
import { loginAsOrgUser, TEST_DATA } from '../helpers/multi-tenant-setup.js';

test.describe('Project Kanban Drag and Drop - Task Movement', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOrgUser(page, 'ACME', 'admin');
    await page.goto(`/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`);
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});

    // Wait for DnD kit to initialize
    await page.waitForTimeout(1000);
  });

  test('drags task between columns', async ({ page }) => {
    // Find columns
    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const columnCount = await columns.count();

    // Need at least 2 columns for this test
    if (columnCount < 2) {
      test.skip();
      return;
    }

    // Find first task in first column
    const firstColumn = columns.first();
    const firstTask = firstColumn.locator('[data-testid="kanban-task"]')
      .or(firstColumn.locator('.MuiCard-root').filter({ has: page.locator('[data-testid="task-title"]') }))
      .first();

    if (await firstTask.count() === 0) {
      test.skip();
      return;
    }

    // Get task title for verification
    const taskTitle = await firstTask.locator('[data-testid="task-title"]')
      .or(firstTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    // Get second column
    const secondColumn = columns.nth(1);

    // Drag task from first column to second column
    await firstTask.hover();
    await page.mouse.down();

    // Get second column bounding box
    const secondColumnBox = await secondColumn.boundingBox();
    if (secondColumnBox) {
      // Move to center of second column
      await page.mouse.move(
        secondColumnBox.x + secondColumnBox.width / 2,
        secondColumnBox.y + secondColumnBox.height / 2,
        { steps: 10 }
      );
    }

    await page.waitForTimeout(500);
    await page.mouse.up();

    // Wait for animation and state update
    await page.waitForTimeout(1000);

    // Verify task is now in second column
    const taskInSecondColumn = secondColumn.locator(`text="${taskTitle}"`);
    await expect(taskInSecondColumn).toBeVisible({ timeout: 5000 });

    // Verify task is NOT in first column anymore
    const taskInFirstColumn = firstColumn.locator(`text="${taskTitle}"`);
    await expect(taskInFirstColumn).not.toBeVisible();
  });

  test('task moved between columns persists after reload', async ({ page }) => {
    // This test verifies the database update after drag-and-drop

    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const columnCount = await columns.count();

    if (columnCount < 2) {
      test.skip();
      return;
    }

    // Find first task
    const firstColumn = columns.first();
    const firstTask = firstColumn.locator('[data-testid="kanban-task"]').first();

    if (await firstTask.count() === 0) {
      test.skip();
      return;
    }

    const taskTitle = await firstTask.locator('[data-testid="task-title"]')
      .or(firstTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    const secondColumn = columns.nth(1);

    // Perform drag
    await firstTask.hover();
    await page.mouse.down();

    const secondColumnBox = await secondColumn.boundingBox();
    if (secondColumnBox) {
      await page.mouse.move(
        secondColumnBox.x + secondColumnBox.width / 2,
        secondColumnBox.y + secondColumnBox.height / 2,
        { steps: 10 }
      );
    }

    await page.mouse.up();
    await page.waitForTimeout(1500);

    // Reload page
    await page.reload();
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Verify task is still in second column after reload
    const reloadedColumns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const reloadedSecondColumn = reloadedColumns.nth(1);
    const taskInSecondColumn = reloadedSecondColumn.locator(`text="${taskTitle}"`);

    await expect(taskInSecondColumn).toBeVisible({ timeout: 5000 });
  });

  test('uses Playwright dragTo API for task movement', async ({ page }) => {
    // Alternative drag implementation using Playwright's dragTo

    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const columnCount = await columns.count();

    if (columnCount < 2) {
      test.skip();
      return;
    }

    const firstColumn = columns.first();
    const firstTask = firstColumn.locator('[data-testid="kanban-task"]').first();

    if (await firstTask.count() === 0) {
      test.skip();
      return;
    }

    const taskTitle = await firstTask.locator('[data-testid="task-title"]')
      .or(firstTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    const secondColumn = columns.nth(1);

    // Use Playwright's dragTo API
    await firstTask.dragTo(secondColumn);
    await page.waitForTimeout(1000);

    // Verify task moved
    const taskInSecondColumn = secondColumn.locator(`text="${taskTitle}"`);
    await expect(taskInSecondColumn).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Project Kanban Drag and Drop - Task Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOrgUser(page, 'ACME', 'admin');
    await page.goto(`/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`);
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('reorders tasks within same column', async ({ page }) => {
    // Find first column with at least 2 tasks
    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    let targetColumn = null;
    let firstTask = null;
    let secondTask = null;

    // Find column with at least 2 tasks
    for (let i = 0; i < await columns.count(); i++) {
      const column = columns.nth(i);
      const tasks = column.locator('[data-testid="kanban-task"]')
        .or(column.locator('.MuiCard-root').filter({ has: page.locator('[data-testid="task-title"]') }));

      const taskCount = await tasks.count();

      if (taskCount >= 2) {
        targetColumn = column;
        firstTask = tasks.first();
        secondTask = tasks.nth(1);
        break;
      }
    }

    // Skip if no suitable column found
    if (!targetColumn || !firstTask || !secondTask) {
      test.skip();
      return;
    }

    // Get task titles for verification
    const firstTaskTitle = await firstTask.locator('[data-testid="task-title"]')
      .or(firstTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    const secondTaskTitle = await secondTask.locator('[data-testid="task-title"]')
      .or(secondTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    // Get initial positions
    const firstTaskBox = await firstTask.boundingBox();
    const secondTaskBox = await secondTask.boundingBox();

    if (!firstTaskBox || !secondTaskBox) {
      test.skip();
      return;
    }

    // Verify initial order (first task should be above second task)
    expect(firstTaskBox.y).toBeLessThan(secondTaskBox.y);

    // Drag first task below second task
    await firstTask.hover();
    await page.mouse.down();

    // Move to below second task
    await page.mouse.move(
      secondTaskBox.x + secondTaskBox.width / 2,
      secondTaskBox.y + secondTaskBox.height + 10,
      { steps: 10 }
    );

    await page.waitForTimeout(500);
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Verify order changed
    // Re-query tasks after drag
    const updatedTasks = targetColumn.locator('[data-testid="kanban-task"]')
      .or(targetColumn.locator('.MuiCard-root').filter({ has: page.locator('[data-testid="task-title"]') }));

    const firstUpdatedTask = updatedTasks.first();
    const firstUpdatedTitle = await firstUpdatedTask.locator('[data-testid="task-title"]')
      .or(firstUpdatedTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    // First task should now be the one that was previously second
    expect(firstUpdatedTitle).toBe(secondTaskTitle);
  });

  test('reordering tasks persists after reload', async ({ page }) => {
    // Find column with at least 2 tasks
    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    let targetColumn = null;
    let firstTask = null;
    let secondTask = null;
    let columnIndex = -1;

    for (let i = 0; i < await columns.count(); i++) {
      const column = columns.nth(i);
      const tasks = column.locator('[data-testid="kanban-task"]');

      if (await tasks.count() >= 2) {
        targetColumn = column;
        firstTask = tasks.first();
        secondTask = tasks.nth(1);
        columnIndex = i;
        break;
      }
    }

    if (!targetColumn || !firstTask || !secondTask || columnIndex === -1) {
      test.skip();
      return;
    }

    const secondTaskTitle = await secondTask.locator('[data-testid="task-title"]')
      .or(secondTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    // Perform drag
    const secondTaskBox = await secondTask.boundingBox();
    if (!secondTaskBox) {
      test.skip();
      return;
    }

    await firstTask.hover();
    await page.mouse.down();
    await page.mouse.move(
      secondTaskBox.x + secondTaskBox.width / 2,
      secondTaskBox.y + secondTaskBox.height + 10,
      { steps: 10 }
    );
    await page.mouse.up();
    await page.waitForTimeout(1500);

    // Reload
    await page.reload();
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Verify order persisted
    const reloadedColumns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const reloadedColumn = reloadedColumns.nth(columnIndex);
    const reloadedTasks = reloadedColumn.locator('[data-testid="kanban-task"]');

    const firstReloadedTask = reloadedTasks.first();
    const firstReloadedTitle = await firstReloadedTask.locator('[data-testid="task-title"]')
      .or(firstReloadedTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    expect(firstReloadedTitle).toBe(secondTaskTitle);
  });
});

test.describe('Project Kanban Drag and Drop - Column Reordering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOrgUser(page, 'ACME', 'admin');
    await page.goto(`/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`);
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('reorders columns by dragging header', async ({ page }) => {
    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const columnCount = await columns.count();

    // Need at least 2 columns
    if (columnCount < 2) {
      test.skip();
      return;
    }

    // Get first and second column headers
    const firstColumn = columns.first();
    const secondColumn = columns.nth(1);

    const firstColumnHeader = firstColumn.locator('[data-testid="column-header"]')
      .or(firstColumn.locator('h1, h2, h3, h4, h5, h6').first());

    const secondColumnHeader = secondColumn.locator('[data-testid="column-header"]')
      .or(secondColumn.locator('h1, h2, h3, h4, h5, h6').first());

    // Get column titles
    const firstColumnTitle = await firstColumnHeader.textContent();
    const secondColumnTitle = await secondColumnHeader.textContent();

    // Drag first column header to position of second column
    const secondColumnBox = await secondColumn.boundingBox();

    if (!secondColumnBox) {
      test.skip();
      return;
    }

    await firstColumnHeader.hover();
    await page.mouse.down();

    await page.mouse.move(
      secondColumnBox.x + secondColumnBox.width / 2,
      secondColumnBox.y + 50,
      { steps: 10 }
    );

    await page.waitForTimeout(500);
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Verify column order changed
    const updatedColumns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const newFirstColumn = updatedColumns.first();
    const newFirstColumnHeader = newFirstColumn.locator('[data-testid="column-header"]')
      .or(newFirstColumn.locator('h1, h2, h3, h4, h5, h6').first());

    const newFirstColumnTitle = await newFirstColumnHeader.textContent();

    // The new first column should be what was previously the second column
    expect(newFirstColumnTitle).toBe(secondColumnTitle);
  });

  test('column reordering persists after reload', async ({ page }) => {
    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const columnCount = await columns.count();

    if (columnCount < 2) {
      test.skip();
      return;
    }

    const firstColumn = columns.first();
    const secondColumn = columns.nth(1);

    const firstColumnHeader = firstColumn.locator('[data-testid="column-header"]')
      .or(firstColumn.locator('h1, h2, h3, h4, h5, h6').first());

    const secondColumnHeader = secondColumn.locator('[data-testid="column-header"]')
      .or(secondColumn.locator('h1, h2, h3, h4, h5, h6').first());

    const secondColumnTitle = await secondColumnHeader.textContent();

    // Perform drag
    const secondColumnBox = await secondColumn.boundingBox();

    if (!secondColumnBox) {
      test.skip();
      return;
    }

    await firstColumnHeader.hover();
    await page.mouse.down();
    await page.mouse.move(
      secondColumnBox.x + secondColumnBox.width / 2,
      secondColumnBox.y + 50,
      { steps: 10 }
    );
    await page.mouse.up();
    await page.waitForTimeout(1500);

    // Reload page
    await page.reload();
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Verify order persisted
    const reloadedColumns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const newFirstColumn = reloadedColumns.first();
    const newFirstColumnHeader = newFirstColumn.locator('[data-testid="column-header"]')
      .or(newFirstColumn.locator('h1, h2, h3, h4, h5, h6').first());

    const newFirstColumnTitle = await newFirstColumnHeader.textContent();

    expect(newFirstColumnTitle).toBe(secondColumnTitle);
  });
});

test.describe('Project Kanban Drag and Drop - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOrgUser(page, 'ACME', 'admin');
    await page.goto(`/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`);
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);
  });

  test('cancels drag when released outside drop zone', async ({ page }) => {
    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const firstColumn = columns.first();
    const firstTask = firstColumn.locator('[data-testid="kanban-task"]').first();

    if (await firstTask.count() === 0) {
      test.skip();
      return;
    }

    const taskTitle = await firstTask.locator('[data-testid="task-title"]')
      .or(firstTask.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    // Start drag
    await firstTask.hover();
    await page.mouse.down();

    // Move far outside the board area
    await page.mouse.move(10, 10, { steps: 10 });

    // Release
    await page.mouse.up();
    await page.waitForTimeout(1000);

    // Verify task is still in original position
    const taskStillInColumn = firstColumn.locator(`text="${taskTitle}"`);
    await expect(taskStillInColumn).toBeVisible();
  });

  test('handles dragging task to empty column', async ({ page }) => {
    // This test verifies dropping a task into a column that has no tasks

    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ has: page.locator('text=/add task/i') }));

    const columnCount = await columns.count();

    if (columnCount < 2) {
      test.skip();
      return;
    }

    // Find a column with tasks and one that might be empty
    let sourceColumn = null;
    let targetColumn = null;
    let taskToMove = null;

    for (let i = 0; i < columnCount; i++) {
      const column = columns.nth(i);
      const tasks = column.locator('[data-testid="kanban-task"]');
      const taskCount = await tasks.count();

      if (taskCount > 0 && !sourceColumn) {
        sourceColumn = column;
        taskToMove = tasks.first();
      } else if (taskCount === 0 && !targetColumn) {
        targetColumn = column;
      }

      if (sourceColumn && targetColumn) break;
    }

    // If no empty column found, just use second column
    if (!targetColumn) {
      targetColumn = columns.nth(1);
    }

    if (!sourceColumn || !taskToMove) {
      test.skip();
      return;
    }

    const taskTitle = await taskToMove.locator('[data-testid="task-title"]')
      .or(taskToMove.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    // Drag to target column
    await taskToMove.dragTo(targetColumn);
    await page.waitForTimeout(1000);

    // Verify task is in target column
    const taskInTargetColumn = targetColumn.locator(`text="${taskTitle}"`);
    await expect(taskInTargetColumn).toBeVisible({ timeout: 5000 });
  });
});
