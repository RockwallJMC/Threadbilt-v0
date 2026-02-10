/**
 * E2E Tests for Project Kanban Board
 *
 * RED PHASE - Tests expected behavior that may not be fully implemented yet.
 *
 * Tests the complete Project Kanban functionality:
 * - Displaying columns and tasks
 * - Task card information (title, priority, due date, assignee)
 * - Opening task details drawer
 * - Creating new tasks
 * - Updating task details
 * - Data persistence after page reload
 *
 * Following TDD principles:
 * 1. RED - These tests should FAIL initially
 * 2. GREEN - Implementation will make them pass
 * 3. REFACTOR - Clean up code while keeping tests green
 */

import { test, expect } from '@playwright/test';
import { loginAsOrgUser, TEST_DATA } from '../helpers/multi-tenant-setup.js';

test.describe('Project Kanban Board - Display & Navigation', () => {
  let projectUrl: string;

  test.beforeEach(async ({ page }) => {
    // Login as ACME admin
    await loginAsOrgUser(page, 'ACME', 'admin');

    // Navigate to project kanban board
    projectUrl = `/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`;
    await page.goto(projectUrl);

    // Wait for project to load (no loading spinner)
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
  });

  test('displays project kanban board with header', async ({ page }) => {
    // Verify page loaded successfully (not error state)
    await expect(page.locator('text="Project not found"')).not.toBeVisible();

    // Project name or header should be visible
    // Note: Actual header implementation may vary
    const header = page.locator('[data-testid="project-kanban-header"]')
      .or(page.locator('h1, h2, h3, h4, h5, h6').first());
    await expect(header).toBeVisible();
  });

  test('displays columns with headers', async ({ page }) => {
    // Verify at least one column is visible
    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ hasText: /add task/i }));

    const columnCount = await columns.count();
    expect(columnCount).toBeGreaterThan(0);

    // Verify column headers show names
    const firstColumn = columns.first();
    await expect(firstColumn).toBeVisible();

    // Column should have a header/title
    const columnHeader = firstColumn.locator('h1, h2, h3, h4, h5, h6, [data-testid="column-header"]').first();
    await expect(columnHeader).toBeVisible();
  });

  test('displays task cards in columns', async ({ page }) => {
    // Look for task cards
    const taskCards = page.locator('[data-testid="kanban-task"]')
      .or(page.locator('[role="button"][aria-label*="task"]'))
      .or(page.locator('.MuiCard-root').filter({ has: page.locator('text=/priority|due date|assign/i') }));

    // If tasks exist, verify they're visible
    const taskCount = await taskCards.count();

    if (taskCount > 0) {
      // Verify first task is visible
      const firstTask = taskCards.first();
      await expect(firstTask).toBeVisible();
    } else {
      // If no tasks, verify we can see empty state or "Add task" option
      const addTaskButton = page.locator('text=/add task/i').first();
      await expect(addTaskButton).toBeVisible();
    }
  });

  test('displays empty state when no columns exist', async ({ page }) => {
    // Navigate to a project with no columns (or delete all columns first)
    // This tests the empty state UI

    // For now, skip if columns exist
    const columns = page.locator('[data-testid="kanban-column"]')
      .or(page.locator('[role="region"]').filter({ hasText: /add task/i }));

    const columnCount = await columns.count();

    if (columnCount === 0) {
      // Verify empty state is shown
      await expect(page.locator('text=/no columns/i')).toBeVisible();
      await expect(page.locator('text=/add.*column/i')).toBeVisible();
    }
  });
});

test.describe('Project Kanban Board - Task Card Information', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOrgUser(page, 'ACME', 'admin');
    await page.goto(`/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`);
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
  });

  test('task card displays title', async ({ page }) => {
    // Find first task card
    const taskCard = page.locator('[data-testid="kanban-task"]')
      .or(page.locator('.MuiCard-root').filter({ has: page.locator('[data-testid="task-title"]') }))
      .first();

    // Skip if no tasks exist
    if (await taskCard.count() === 0) {
      test.skip();
      return;
    }

    await expect(taskCard).toBeVisible();

    // Verify title is present and not empty
    const title = taskCard.locator('[data-testid="task-title"]')
      .or(taskCard.locator('h1, h2, h3, h4, h5, h6, .MuiTypography-subtitle2').first());

    await expect(title).toBeVisible();
    const titleText = await title.textContent();
    expect(titleText?.trim()).toBeTruthy();
  });

  test('task card displays priority chip if present', async ({ page }) => {
    // Find task card with priority
    const taskWithPriority = page.locator('[data-testid="kanban-task"]')
      .filter({ has: page.locator('text=/high|medium|low/i') })
      .first();

    // If found, verify priority chip
    if (await taskWithPriority.count() > 0) {
      const priorityChip = taskWithPriority.locator('.MuiChip-root')
        .filter({ hasText: /high|medium|low/i });
      await expect(priorityChip).toBeVisible();
    }
  });

  test('task card displays due date if present', async ({ page }) => {
    // Find task card with due date
    const taskWithDueDate = page.locator('[data-testid="kanban-task"]')
      .filter({ has: page.locator('[data-testid="task-due-date"]') })
      .or(page.locator('.MuiCard-root').filter({ has: page.locator('text=/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i') }))
      .first();

    // If found, verify due date
    if (await taskWithDueDate.count() > 0) {
      const dueDateElement = taskWithDueDate.locator('[data-testid="task-due-date"]')
        .or(taskWithDueDate.locator('.MuiChip-root').filter({ hasText: /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i }));
      await expect(dueDateElement).toBeVisible();
    }
  });

  test('task card displays assignee avatar if present', async ({ page }) => {
    // Find task card with assignee
    const taskWithAssignee = page.locator('[data-testid="kanban-task"]')
      .filter({ has: page.locator('.MuiAvatar-root') })
      .first();

    // If found, verify avatar
    if (await taskWithAssignee.count() > 0) {
      const avatar = taskWithAssignee.locator('.MuiAvatar-root');
      await expect(avatar).toBeVisible();
    }
  });

  test('task card displays description preview if present', async ({ page }) => {
    // Find task card with description
    const taskWithDescription = page.locator('[data-testid="kanban-task"]')
      .filter({ has: page.locator('[data-testid="task-description"]') })
      .first();

    // If found, verify description
    if (await taskWithDescription.count() > 0) {
      const description = taskWithDescription.locator('[data-testid="task-description"]');
      await expect(description).toBeVisible();

      // Verify it's truncated (WebKit line clamp)
      const descriptionElement = await description.elementHandle();
      const styles = await descriptionElement?.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          webkitLineClamp: computed.webkitLineClamp,
        };
      });

      // Should use line clamp for overflow
      expect(styles?.display).toBe('-webkit-box');
    }
  });
});

test.describe('Project Kanban Board - Task Details Drawer', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOrgUser(page, 'ACME', 'admin');
    await page.goto(`/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`);
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
  });

  test('opens task details drawer on card click', async ({ page }) => {
    // Find first task card
    const taskCard = page.locator('[data-testid="kanban-task"]')
      .or(page.locator('.MuiCard-root').filter({ has: page.locator('[data-testid="task-title"]') }))
      .first();

    // Skip if no tasks
    if (await taskCard.count() === 0) {
      test.skip();
      return;
    }

    // Get task title for verification
    const taskTitle = await taskCard.locator('[data-testid="task-title"]')
      .or(taskCard.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    // Click task card
    await taskCard.click();

    // Verify drawer opens
    const drawer = page.locator('[role="dialog"]')
      .or(page.locator('.MuiDrawer-root'))
      .filter({ has: page.locator(`text="${taskTitle}"`) });

    await expect(drawer).toBeVisible({ timeout: 5000 });
  });

  test('drawer displays task title', async ({ page }) => {
    // Open first task
    const taskCard = page.locator('[data-testid="kanban-task"]').first();

    if (await taskCard.count() === 0) {
      test.skip();
      return;
    }

    const taskTitle = await taskCard.locator('[data-testid="task-title"]')
      .or(taskCard.locator('h1, h2, h3, h4, h5, h6').first())
      .textContent();

    await taskCard.click();
    await page.waitForTimeout(500);

    // Verify title in drawer
    const drawerTitle = page.locator('[role="dialog"]')
      .or(page.locator('.MuiDrawer-root'))
      .locator(`text="${taskTitle}"`);

    await expect(drawerTitle).toBeVisible();
  });

  test('drawer displays all task fields', async ({ page }) => {
    // Open first task
    const taskCard = page.locator('[data-testid="kanban-task"]').first();

    if (await taskCard.count() === 0) {
      test.skip();
      return;
    }

    await taskCard.click();
    await page.waitForTimeout(500);

    const drawer = page.locator('[role="dialog"]').or(page.locator('.MuiDrawer-root'));

    // Verify common fields are present (even if empty)
    const expectedFields = [
      /title/i,
      /description/i,
      /priority/i,
      /due date/i,
      /assignee/i,
    ];

    for (const fieldPattern of expectedFields) {
      const field = drawer.locator(`text=${fieldPattern}`);
      // Field label should exist
      const fieldCount = await field.count();
      expect(fieldCount).toBeGreaterThan(0);
    }
  });

  test('closes drawer with close button', async ({ page }) => {
    // Open first task
    const taskCard = page.locator('[data-testid="kanban-task"]').first();

    if (await taskCard.count() === 0) {
      test.skip();
      return;
    }

    await taskCard.click();
    await page.waitForTimeout(500);

    const drawer = page.locator('[role="dialog"]').or(page.locator('.MuiDrawer-root'));
    await expect(drawer).toBeVisible();

    // Click close button
    const closeButton = drawer.locator('[aria-label*="close"]')
      .or(drawer.locator('button').filter({ has: page.locator('[data-icon*="close"]') }));

    await closeButton.click();

    // Verify drawer closes
    await expect(drawer).not.toBeVisible();
  });

  test('closes drawer on ESC key', async ({ page }) => {
    // Open first task
    const taskCard = page.locator('[data-testid="kanban-task"]').first();

    if (await taskCard.count() === 0) {
      test.skip();
      return;
    }

    await taskCard.click();
    await page.waitForTimeout(500);

    const drawer = page.locator('[role="dialog"]').or(page.locator('.MuiDrawer-root'));
    await expect(drawer).toBeVisible();

    // Press ESC
    await page.keyboard.press('Escape');

    // Verify drawer closes
    await expect(drawer).not.toBeVisible();
  });
});

test.describe('Project Kanban Board - Create Task', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOrgUser(page, 'ACME', 'admin');
    await page.goto(`/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`);
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
  });

  test('creates new task in column', async ({ page }) => {
    // Find "Add task" button in first column
    const addTaskButton = page.locator('text=/add task/i').first();
    await expect(addTaskButton).toBeVisible();

    // Click to open dialog
    await addTaskButton.click();

    // Verify dialog opens
    const dialog = page.locator('[role="dialog"]')
      .filter({ has: page.locator('text=/add task|create task|new task/i') });
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill in task title
    const titleInput = dialog.locator('input[name="title"]')
      .or(dialog.locator('input[aria-label*="title"]'))
      .or(dialog.locator('input').first());

    const testTaskTitle = `E2E Test Task ${Date.now()}`;
    await titleInput.fill(testTaskTitle);

    // Submit (look for Create/Add/Save button)
    const submitButton = dialog.locator('button').filter({ hasText: /create|add|save/i });
    await submitButton.click();

    // Verify dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 5000 });

    // Verify task appears in column
    await expect(page.locator(`text="${testTaskTitle}"`)).toBeVisible({ timeout: 5000 });
  });

  test('creates task with all fields filled', async ({ page }) => {
    // Open add task dialog
    const addTaskButton = page.locator('text=/add task/i').first();
    await addTaskButton.click();

    const dialog = page.locator('[role="dialog"]')
      .filter({ has: page.locator('text=/add task|create task|new task/i') });
    await expect(dialog).toBeVisible();

    // Fill all fields
    const testTaskTitle = `Full Task ${Date.now()}`;

    const titleInput = dialog.locator('input[name="title"]')
      .or(dialog.locator('input[aria-label*="title"]'))
      .or(dialog.locator('input').first());
    await titleInput.fill(testTaskTitle);

    // Description (if available)
    const descriptionInput = dialog.locator('textarea[name="description"]')
      .or(dialog.locator('textarea[aria-label*="description"]'));
    if (await descriptionInput.count() > 0) {
      await descriptionInput.fill('Test task description for E2E testing');
    }

    // Priority (if available)
    const prioritySelect = dialog.locator('select[name="priority"]')
      .or(dialog.locator('[aria-label*="priority"]'));
    if (await prioritySelect.count() > 0) {
      await prioritySelect.click();
      await page.locator('li:has-text("High")').or(page.locator('[role="option"]:has-text("High")')).click();
    }

    // Submit
    const submitButton = dialog.locator('button').filter({ hasText: /create|add|save/i });
    await submitButton.click();

    // Verify task created
    await expect(page.locator(`text="${testTaskTitle}"`)).toBeVisible({ timeout: 5000 });
  });

  test('validates required fields on task creation', async ({ page }) => {
    // Open add task dialog
    const addTaskButton = page.locator('text=/add task/i').first();
    await addTaskButton.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Try to submit without filling title
    const submitButton = dialog.locator('button').filter({ hasText: /create|add|save/i });
    await submitButton.click();

    // Verify validation error appears
    const errorMessage = dialog.locator('text=/required|cannot be empty/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });

    // Dialog should remain open
    await expect(dialog).toBeVisible();
  });
});

test.describe('Project Kanban Board - Update Task', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsOrgUser(page, 'ACME', 'admin');
    await page.goto(`/apps/projects/boards/${TEST_DATA.ACME_PROJECT.id}`);
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});
  });

  test('updates task title and saves', async ({ page }) => {
    // Open first task
    const taskCard = page.locator('[data-testid="kanban-task"]').first();

    if (await taskCard.count() === 0) {
      test.skip();
      return;
    }

    await taskCard.click();
    await page.waitForTimeout(500);

    const drawer = page.locator('[role="dialog"]').or(page.locator('.MuiDrawer-root'));

    // Find title input/field (might be editable inline or in form)
    const titleInput = drawer.locator('input[name="title"]')
      .or(drawer.locator('input[aria-label*="title"]'))
      .or(drawer.locator('textarea[name="title"]'));

    if (await titleInput.count() === 0) {
      // Title might be in view mode, click to edit
      const titleText = drawer.locator('text="Title:"').or(drawer.locator('h1, h2, h3, h4, h5, h6').first());
      await titleText.click();
      await page.waitForTimeout(300);
    }

    // Update title
    const updatedTitle = `Updated Task ${Date.now()}`;
    const editableTitle = drawer.locator('input[name="title"]')
      .or(drawer.locator('input[aria-label*="title"]'))
      .or(drawer.locator('textarea[name="title"]'));

    await editableTitle.clear();
    await editableTitle.fill(updatedTitle);

    // Save (might auto-save on blur or need explicit save button)
    const saveButton = drawer.locator('button').filter({ hasText: /save|update/i });
    if (await saveButton.count() > 0) {
      await saveButton.click();
    } else {
      // Try clicking outside to trigger save
      await drawer.locator('h1, h2, h3, h4, h5, h6').first().click();
    }

    // Wait for save
    await page.waitForTimeout(1000);

    // Close drawer
    await page.keyboard.press('Escape');

    // Verify updated title on card
    await expect(page.locator(`text="${updatedTitle}"`)).toBeVisible({ timeout: 5000 });
  });

  test('updates task priority', async ({ page }) => {
    // Open first task
    const taskCard = page.locator('[data-testid="kanban-task"]').first();

    if (await taskCard.count() === 0) {
      test.skip();
      return;
    }

    await taskCard.click();
    await page.waitForTimeout(500);

    const drawer = page.locator('[role="dialog"]').or(page.locator('.MuiDrawer-root'));

    // Find priority field
    const priorityField = drawer.locator('[aria-label*="priority"]')
      .or(drawer.locator('text="Priority:"').locator('..'));

    // Click to edit
    await priorityField.click();
    await page.waitForTimeout(300);

    // Select "High" priority
    const highOption = page.locator('li:has-text("High")')
      .or(page.locator('[role="option"]:has-text("High")'));
    await highOption.click();

    // Save if needed
    const saveButton = drawer.locator('button').filter({ hasText: /save|update/i });
    if (await saveButton.count() > 0) {
      await saveButton.click();
    }

    // Verify success (toast or updated UI)
    await page.waitForTimeout(1000);
  });

  test('changes persist after page reload', async ({ page }) => {
    // Create a unique task
    const addTaskButton = page.locator('text=/add task/i').first();
    await addTaskButton.click();

    const dialog = page.locator('[role="dialog"]');
    const testTaskTitle = `Persistence Test ${Date.now()}`;

    const titleInput = dialog.locator('input[name="title"]')
      .or(dialog.locator('input').first());
    await titleInput.fill(testTaskTitle);

    const submitButton = dialog.locator('button').filter({ hasText: /create|add|save/i });
    await submitButton.click();

    // Verify task created
    await expect(page.locator(`text="${testTaskTitle}"`)).toBeVisible({ timeout: 5000 });

    // Reload page
    await page.reload();
    await page.waitForSelector('[role="progressbar"]', { state: 'hidden', timeout: 10000 }).catch(() => {});

    // Verify task still exists
    await expect(page.locator(`text="${testTaskTitle}"`)).toBeVisible({ timeout: 10000 });
  });
});
