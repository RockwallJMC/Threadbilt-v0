# Project Kanban E2E Tests

## Overview

This directory contains comprehensive Playwright E2E tests for the Project Kanban Board feature, following Test-Driven Development (TDD) principles.

## Test Files

### 1. `project-kanban.spec.ts`

Main test suite covering core kanban board functionality:

**Test Suites:**

- **Display & Navigation**
  - Displays project kanban board with header
  - Displays columns with headers
  - Displays task cards in columns
  - Displays empty state when no columns exist

- **Task Card Information**
  - Task card displays title
  - Task card displays priority chip (if present)
  - Task card displays due date (if present)
  - Task card displays assignee avatar (if present)
  - Task card displays description preview (if present)

- **Task Details Drawer**
  - Opens task details drawer on card click
  - Drawer displays task title
  - Drawer displays all task fields
  - Closes drawer with close button
  - Closes drawer on ESC key

- **Create Task**
  - Creates new task in column
  - Creates task with all fields filled
  - Validates required fields on task creation

- **Update Task**
  - Updates task title and saves
  - Updates task priority
  - Changes persist after page reload

### 2. `project-kanban-dnd.spec.ts`

Drag-and-drop test suite covering DnD functionality:

**Test Suites:**

- **Task Movement**
  - Drags task between columns
  - Task moved between columns persists after reload
  - Uses Playwright dragTo API for task movement

- **Task Reordering**
  - Reorders tasks within same column
  - Reordering tasks persists after reload

- **Column Reordering**
  - Reorders columns by dragging header
  - Column reordering persists after reload

- **Edge Cases**
  - Cancels drag when released outside drop zone
  - Handles dragging task to empty column

## TDD Approach

### RED Phase (Current)

Tests are written to specify expected behavior. Many tests may FAIL initially or SKIP if preconditions aren't met (e.g., no test data). This is expected and demonstrates:

1. What the feature should do
2. How users will interact with it
3. Edge cases to handle
4. What data needs to persist

### GREEN Phase (Next)

Implementation work will focus on making tests pass:

1. Ensure test data exists (seed database with test projects)
2. Fix any component issues identified by tests
3. Verify drag-and-drop persistence
4. Ensure all user flows work end-to-end

### REFACTOR Phase (Final)

Once tests pass, optimize and clean up:

1. Improve DnD performance
2. Enhance error handling
3. Optimize database queries
4. Clean up component code

## Test Data

Tests use the multi-tenant test data from `tests/helpers/multi-tenant-setup.js`:

```javascript
TEST_DATA.ACME_PROJECT = {
  id: 'pr100000-0000-0000-0000-000000000001',
  name: 'Website Redesign Project',
};

TEST_DATA.TECHSTART_PROJECT = {
  id: 'pr200000-0000-0000-0000-000000000001',
  name: 'Mobile App Development',
};
```

**Note:** These project IDs need to be seeded in the Supabase database with:
- At least 2 columns
- Several tasks across columns
- Task data with titles, descriptions, priorities, due dates, and assignees

## Data-TestID Attributes

Components have been enhanced with `data-testid` attributes for reliable test selectors:

- `data-testid="project-kanban-header"` - Kanban board header
- `data-testid="kanban-column"` - Column container
- `data-testid="column-header"` - Column header (for drag operations)
- `data-testid="kanban-task"` - Task card
- `data-testid="task-title"` - Task title text
- `data-testid="task-description"` - Task description text
- `data-testid="task-due-date"` - Task due date chip

## Running Tests

### Run all Project Kanban tests

```bash
npx playwright test tests/e2e/project-kanban.spec.ts
npx playwright test tests/e2e/project-kanban-dnd.spec.ts
```

### Run with UI mode (interactive)

```bash
npx playwright test tests/e2e/project-kanban.spec.ts --ui
```

### Run specific test

```bash
npx playwright test -g "drags task between columns"
```

### Debug tests

```bash
npx playwright test tests/e2e/project-kanban.spec.ts --debug
```

## Test Prerequisites

Before running tests, ensure:

1. Development server is running on port 4000
2. Supabase database has test data seeded
3. Test organizations exist (ACME, TechStart)
4. Test projects exist with columns and tasks
5. Users can authenticate (see multi-tenant-setup.js)

## Expected Test Results (RED Phase)

Many tests will currently:

- **SKIP** - If test data doesn't exist (columns, tasks)
- **FAIL** - If expected behavior isn't implemented
- **PASS** - If some functionality already works

This is expected in the RED phase of TDD. The goal is to document expected behavior, not to have all tests pass initially.

## Known Limitations

### Drag-and-Drop Testing

DnD tests can be flaky due to timing issues. Tests include:
- Explicit waits after drag operations
- Multiple selector strategies (data-testid, role, text)
- Fallback locators for flexibility

### Test Data Dependencies

Tests depend on seeded data existing. Some tests will skip if:
- No columns exist
- No tasks exist
- Columns have fewer than 2 tasks (for reordering tests)

### Authentication

Tests use the multi-tenant login helper which:
- Logs in as ACME admin user
- Handles organization setup redirects
- Clears session between tests

## Future Enhancements

1. Add tests for column creation
2. Add tests for task deletion
3. Add tests for task assignment
4. Add tests for filtering/searching tasks
5. Add tests for multi-tenant isolation (ensure users can't access other org's projects)
6. Add visual regression tests (screenshot comparison)
7. Add performance tests (measure drag-and-drop latency)

## Contributing

When adding new tests:

1. Follow TDD principles (RED-GREEN-REFACTOR)
2. Write descriptive test names
3. Use data-testid selectors when possible
4. Include fallback selectors for robustness
5. Add waits for animations/async operations
6. Document test data requirements
7. Handle skip conditions gracefully

## References

- [Playwright Documentation](https://playwright.dev/)
- [TDD Skill](.claude/skills/TDD/skill.md)
- [Multi-Tenant Setup](../helpers/multi-tenant-setup.js)
- [Project Kanban Components](../../src/components/sections/projects/project-kanban/)
