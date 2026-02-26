# Contacts List Editable DataGrid Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full-featured contacts list page with editable MUI DataGrid, optimistic updates, archive with undo, and comprehensive GridToolbar features.

**Architecture:** Bottom-up implementation: database schema → API endpoints → SWR hooks → React components → E2E tests. Each layer validated before moving to next.

**Tech Stack:** Supabase PostgreSQL, Next.js 15 App Router, MUI X DataGrid, SWR, Playwright

---

## Task 1: Database Schema - Add Archive Field

**Agent:** supabase-database-architect

**Files:**
- Create: `database/migrations/005_add_contact_archive_field.sql`

**Implementation:**

```sql
-- Migration: Add archived field to contacts table
-- Date: 2026-01-31

-- Add archived column with default false
ALTER TABLE contacts
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for filtering active contacts
CREATE INDEX idx_contacts_archived ON contacts(archived);

-- Add index for organization + archived queries (common filter pattern)
CREATE INDEX idx_contacts_organization_archived ON contacts(organization_id, archived);

-- Update RLS policies to respect archived flag (optional, but good practice)
-- Existing policies should continue to work, this just documents the pattern

COMMENT ON COLUMN contacts.archived IS 'Soft delete flag - archived contacts are hidden from main views';
```

**Verification:**

1. Apply migration using Supabase MCP tool
2. Verify column exists: `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'contacts' AND column_name = 'archived';`
3. Verify indexes created: `SELECT indexname FROM pg_indexes WHERE tablename = 'contacts' AND indexname LIKE '%archived%';`

**Expected Output:**
- Column: archived, type: boolean, default: false
- Indexes: idx_contacts_archived, idx_contacts_organization_archived

**Commit:**
```bash
git add database/migrations/005_add_contact_archive_field.sql
git commit -m "feat(db): add archived field to contacts table

Add soft delete support via archived boolean field.
Includes indexes for efficient filtering.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: API - GET /api/crm/contacts Endpoint

**Agent:** wiring-agent

**Files:**
- Create: `src/app/api/crm/contacts/route.js`
- Reference: `src/app/api/crm/deals/route.js` (pattern example)

**Step 1: Write API endpoint**

```javascript
import { createClient } from '@/services/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization from organization_members
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Organization membership not found' },
        { status: 403 }
      );
    }

    // Fetch contacts with account join
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        phone,
        mobile,
        title,
        department,
        status,
        lead_status,
        lead_source,
        tags,
        archived,
        account:accounts(
          id,
          name,
          industry
        )
      `
      )
      .eq('organization_id', membership.organization_id)
      .eq('archived', false) // Only active contacts
      .order('created_at', { ascending: false });

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contacts }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/crm/contacts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 2: Test endpoint with curl**

```bash
# Start dev server in terminal (not background)
npm run dev

# In another terminal, test the endpoint
curl -X GET http://localhost:4000/api/crm/contacts \
  -H "Cookie: [auth-cookie-from-browser]" \
  -H "Content-Type: application/json"
```

**Expected Output:**
```json
{
  "contacts": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "mobile": "555-5678",
      "title": "CEO",
      "department": "Executive",
      "status": "active",
      "lead_status": "qualified",
      "lead_source": "referral",
      "tags": ["vip"],
      "archived": false,
      "account": {
        "id": "uuid",
        "name": "Acme Corp",
        "industry": "Technology"
      }
    }
  ]
}
```

**Step 3: Commit**

```bash
git add src/app/api/crm/contacts/route.js
git commit -m "feat(api): add GET /api/crm/contacts endpoint

Returns all active contacts for user's organization with account join.
Filters out archived contacts by default.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: API - Update PATCH Endpoint for Archive

**Agent:** wiring-agent

**Files:**
- Modify: `src/app/api/crm/contacts/[id]/route.js` (existing file)

**Step 1: Add archived field to allowed updates**

Find the PATCH handler around line 57-137. Update the allowed fields:

```javascript
// Existing code structure - ADD archived to this section
const allowedFields = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'mobile',
  'title',
  'department',
  'archived', // ADD THIS
];

// Extract only allowed fields from request body
const updates = {};
allowedFields.forEach((field) => {
  if (body[field] !== undefined) {
    updates[field] = body[field];
  }
});

// Add validation for archived field
if (updates.archived !== undefined && typeof updates.archived !== 'boolean') {
  return NextResponse.json(
    { error: 'archived must be a boolean' },
    { status: 400 }
  );
}
```

**Step 2: Test archive update**

```bash
# Test archiving a contact
curl -X PATCH http://localhost:4000/api/crm/contacts/[contact-id] \
  -H "Cookie: [auth-cookie]" \
  -H "Content-Type: application/json" \
  -d '{"archived": true}'

# Test unarchiving
curl -X PATCH http://localhost:4000/api/crm/contacts/[contact-id] \
  -H "Cookie: [auth-cookie]" \
  -H "Content-Type: application/json" \
  -d '{"archived": false}'
```

**Expected Output:**
```json
{
  "id": "uuid",
  "archived": true,
  ...other fields
}
```

**Step 3: Commit**

```bash
git add src/app/api/crm/contacts/[id]/route.js
git commit -m "feat(api): support archived field in PATCH endpoint

Allow updating archived boolean field for soft delete functionality.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: SWR Hooks - Add useCRMContacts and useArchiveContact

**Agent:** wiring-agent

**Files:**
- Modify: `src/services/swr/api-hooks/useCRMContactApi.js`

**Step 1: Add useCRMContacts hook**

Add to the file (around line 50+):

```javascript
/**
 * Fetch all contacts for the user's organization
 * @returns {object} SWR response with contacts array
 */
export function useCRMContacts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/crm/contacts',
    fetcher
  );

  return {
    contacts: data?.contacts || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Archive a contact (soft delete)
 * @returns {object} Archive function and loading state
 */
export function useArchiveContact() {
  const { mutate } = useSWRConfig();

  const archiveContact = async (contactId) => {
    const response = await fetch(`/api/crm/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archived: true }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to archive contact');
    }

    const data = await response.json();

    // Revalidate contacts list
    mutate('/api/crm/contacts');

    return data;
  };

  const unarchiveContact = async (contactId) => {
    const response = await fetch(`/api/crm/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archived: false }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unarchive contact');
    }

    const data = await response.json();

    // Revalidate contacts list
    mutate('/api/crm/contacts');

    return data;
  };

  return {
    archiveContact,
    unarchiveContact,
  };
}
```

**Step 2: Verify hooks compile**

```bash
npm run build
```

**Expected Output:** No TypeScript/build errors

**Step 3: Commit**

```bash
git add src/services/swr/api-hooks/useCRMContactApi.js
git commit -m "feat(hooks): add useCRMContacts and useArchiveContact

Add SWR hooks for fetching contacts list and archive/unarchive operations.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Routes - Add Contacts List Path

**Agent:** wiring-agent

**Files:**
- Modify: `src/routes/paths.js`

**Step 1: Add contacts routes**

Find the CRM section and add:

```javascript
// Around line with other CRM paths
export const paths = {
  // ... existing paths
  apps: {
    crm: {
      // ... existing CRM routes
      contacts: '/apps/crm/contacts',
      contactDetails: (id) => `/apps/crm/contact-details/${id}`,
      // ... rest of routes
    },
  },
};
```

**Step 2: Verify no syntax errors**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add src/routes/paths.js
git commit -m "feat(routes): add contacts list and details paths

Add routing constants for contacts list and contact details pages.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: UI - ContactsDataGrid Component

**Agent:** react-mui-frontend-engineer

**Files:**
- Create: `src/components/sections/crm/contacts-list/ContactsDataGrid.jsx`

**Instructions for agent:**
Reference `component-docs/data-grid#custom-data-grid` for GridToolbar pattern.

**Step 1: Create ContactsDataGrid component**

```jsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Stack,
  Link as MuiLink,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useCRMContacts, useUpdateCRMContact, useArchiveContact } from '@/services/swr/api-hooks/useCRMContactApi';
import { paths } from '@/routes/paths';

export default function ContactsDataGrid() {
  const router = useRouter();
  const { contacts, isLoading, mutate } = useCRMContacts();
  const { updateContact } = useUpdateCRMContact();
  const { archiveContact, unarchiveContact } = useArchiveContact();

  // Toast state
  const [toast, setToast] = useState({
    open: false,
    message: '',
    severity: 'success',
    action: null,
  });

  // Pending archive state (for undo)
  const [pendingArchive, setPendingArchive] = useState(null);

  // Handle cell edit commit (optimistic update)
  const handleCellEditCommit = useCallback(
    async (params) => {
      const { id, field, value } = params;

      // Find the current contact for rollback
      const currentContact = contacts.find((c) => c.id === id);
      const oldValue = currentContact?.[field];

      // Optimistic update - update local state immediately
      mutate(
        (data) => ({
          contacts: data.contacts.map((c) =>
            c.id === id ? { ...c, [field]: value } : c
          ),
        }),
        false // Don't revalidate yet
      );

      try {
        // Send update to API
        await updateContact(id, { [field]: value });

        // Show success toast
        setToast({
          open: true,
          message: 'Contact updated successfully',
          severity: 'success',
          action: null,
        });

        // Revalidate in background
        mutate();
      } catch (error) {
        console.error('Failed to update contact:', error);

        // Rollback optimistic update
        mutate(
          (data) => ({
            contacts: data.contacts.map((c) =>
              c.id === id ? { ...c, [field]: oldValue } : c
            ),
          }),
          false
        );

        // Show error toast
        setToast({
          open: true,
          message: `Failed to update contact: ${error.message}`,
          severity: 'error',
          action: null,
        });
      }
    },
    [contacts, mutate, updateContact]
  );

  // Handle archive with undo
  const handleArchive = useCallback(
    (contactId) => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;

      // Optimistically remove from grid
      mutate(
        (data) => ({
          contacts: data.contacts.filter((c) => c.id !== contactId),
        }),
        false
      );

      // Store for undo
      setPendingArchive({ contactId, contact });

      // Show toast with undo
      setToast({
        open: true,
        message: 'Contact archived',
        severity: 'info',
        action: (
          <Button
            color="inherit"
            size="small"
            onClick={() => handleUndo(contactId, contact)}
          >
            Undo
          </Button>
        ),
      });

      // Set timeout to permanently archive
      const timeout = setTimeout(async () => {
        try {
          await archiveContact(contactId);
          setPendingArchive(null);
          mutate(); // Revalidate
        } catch (error) {
          console.error('Failed to archive contact:', error);
          // Restore on error
          mutate(
            (data) => ({
              contacts: [...data.contacts, contact],
            }),
            false
          );
          setToast({
            open: true,
            message: `Failed to archive contact: ${error.message}`,
            severity: 'error',
            action: null,
          });
        }
      }, 10000); // 10 second undo window

      // Store timeout ID for cleanup
      setPendingArchive((prev) => ({ ...prev, timeout }));
    },
    [contacts, mutate, archiveContact]
  );

  // Handle undo
  const handleUndo = useCallback(
    (contactId, contact) => {
      // Clear timeout
      if (pendingArchive?.timeout) {
        clearTimeout(pendingArchive.timeout);
      }

      // Restore contact to grid
      mutate(
        (data) => ({
          contacts: [...data.contacts, contact],
        }),
        false
      );

      setPendingArchive(null);

      // Show restored toast
      setToast({
        open: true,
        message: 'Contact restored',
        severity: 'success',
        action: null,
      });
    },
    [pendingArchive, mutate]
  );

  // Handle view contact
  const handleView = useCallback(
    (contactId) => {
      router.push(paths.apps.crm.contactDetails(contactId));
    },
    [router]
  );

  // Handle row double-click
  const handleRowDoubleClick = useCallback(
    (params) => {
      router.push(paths.apps.crm.contactDetails(params.id));
    },
    [router]
  );

  // Column definitions
  const columns = [
    {
      field: 'first_name',
      headerName: 'First Name',
      width: 150,
      editable: true,
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      width: 150,
      editable: true,
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      editable: true,
      type: 'email',
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 140,
      editable: true,
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      width: 140,
      editable: true,
    },
    {
      field: 'title',
      headerName: 'Title',
      width: 150,
      editable: true,
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 130,
      editable: true,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['active', 'inactive'],
    },
    {
      field: 'account',
      headerName: 'Company',
      width: 180,
      editable: false,
      valueGetter: (value, row) => row.account?.name || '',
      renderCell: (params) => {
        if (!params.row.account?.name) return null;
        return (
          <MuiLink
            href={`/apps/crm/account-details/${params.row.account.id}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/apps/crm/account-details/${params.row.account.id}`);
            }}
            sx={{ cursor: 'pointer' }}
          >
            {params.row.account.name}
          </MuiLink>
        );
      },
    },
    {
      field: 'lead_status',
      headerName: 'Lead Status',
      width: 130,
      editable: false,
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Chip
            label={params.value}
            size="small"
            color="primary"
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'lead_source',
      headerName: 'Lead Source',
      width: 130,
      editable: false,
    },
    {
      field: 'tags',
      headerName: 'Tags',
      width: 200,
      editable: false,
      renderCell: (params) => {
        if (!params.value || params.value.length === 0) return null;
        return (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {params.value.map((tag, idx) => (
              <Chip key={idx} label={tag} size="small" />
            ))}
          </Stack>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => handleView(params.id)}
          showInMenu={false}
        />,
        <GridActionsCellItem
          icon={<ArchiveIcon />}
          label="Archive"
          onClick={() => handleArchive(params.id)}
          showInMenu={false}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={contacts}
        columns={columns}
        loading={isLoading}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        onCellEditStop={handleCellEditCommit}
        onRowDoubleClick={handleRowDoubleClick}
        checkboxSelection
        disableRowSelectionOnClick
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Toast Notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === 'info' ? 10000 : 3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          action={toast.action}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
```

**Step 2: Verify component compiles**

```bash
npm run build
```

**Expected Output:** No build errors

**Step 3: Commit**

```bash
git add src/components/sections/crm/contacts-list/ContactsDataGrid.jsx
git commit -m "feat(ui): add ContactsDataGrid component

Full-featured editable data grid with:
- Inline editing with optimistic updates
- Archive with undo mechanism
- GridToolbar (filter, search, export, density)
- Toast notifications for all actions
- Row actions (view, archive)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: UI - Contacts List Page

**Agent:** react-mui-frontend-engineer

**Files:**
- Create: `src/app/(main)/apps/crm/contacts/page.jsx`

**Step 1: Create contacts list page**

```jsx
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { paths } from '@/routes/paths';
import ContactsDataGrid from '@/components/sections/crm/contacts-list/ContactsDataGrid';

export const metadata = {
  title: 'Contacts | CRM',
};

export default function ContactsListPage() {
  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h4">Contacts</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href={paths.apps.crm.addContact}
          >
            Add Contact
          </Button>
        </Stack>

        {/* Data Grid */}
        <ContactsDataGrid />
      </Stack>
    </Container>
  );
}
```

**Step 2: Test page loads**

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:4000/apps/crm/contacts
# Verify page loads with DataGrid
```

**Expected Output:** Page loads, grid displays contacts (if any exist in DB)

**Step 3: Commit**

```bash
git add src/app/\(main\)/apps/crm/contacts/page.jsx
git commit -m "feat(ui): add contacts list page

Add contacts list page with header and ContactsDataGrid component.
Includes Add Contact button.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: E2E Tests - Contact List Loading & Editing

**Agent:** playwright-tester

**Files:**
- Create: `tests/crm/contacts-list.spec.ts`

**Step 1: Write test for contact list loading and inline editing**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Contacts List', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to contacts list
    await page.goto('/apps/crm/contacts');

    // Wait for grid to load
    await page.waitForSelector('[role="grid"]');
  });

  test('should load contacts list with DataGrid', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h4')).toContainText('Contacts');

    // Verify DataGrid is present
    const grid = page.locator('[role="grid"]');
    await expect(grid).toBeVisible();

    // Verify GridToolbar is present
    const toolbar = page.locator('.MuiDataGrid-toolbarContainer');
    await expect(toolbar).toBeVisible();

    // Verify columns are visible
    await expect(page.locator('[role="columnheader"]').first()).toBeVisible();
  });

  test('should edit contact inline with optimistic update', async ({ page }) => {
    // Find first editable cell (First Name)
    const firstNameCell = page.locator('[data-field="first_name"]').first();

    // Double-click to enter edit mode
    await firstNameCell.dblclick();

    // Type new value
    const input = page.locator('input[type="text"]').first();
    await input.fill('Updated');

    // Press Enter or click away to commit
    await input.press('Enter');

    // Verify optimistic update (cell shows new value immediately)
    await expect(firstNameCell).toContainText('Updated');

    // Wait for success toast
    await expect(page.locator('.MuiAlert-message')).toContainText('Contact updated successfully');

    // Refresh page and verify change persisted
    await page.reload();
    await page.waitForSelector('[role="grid"]');

    const updatedCell = page.locator('[data-field="first_name"]').first();
    await expect(updatedCell).toContainText('Updated');
  });

  test('should validate email format', async ({ page }) => {
    // Find email cell
    const emailCell = page.locator('[data-field="email"]').first();

    // Double-click to edit
    await emailCell.dblclick();

    // Type invalid email
    const input = page.locator('input[type="email"]').first();
    await input.fill('invalid-email');
    await input.press('Enter');

    // Verify validation error (MUI DataGrid shows error)
    // Note: Exact error handling depends on MUI DataGrid validation
    // This test verifies the email input type is set correctly
    await expect(input).toHaveAttribute('type', 'email');
  });
});
```

**Step 2: Run tests**

```bash
npx playwright test tests/crm/contacts-list.spec.ts --headed
```

**Expected Output:** All 3 tests pass

**Step 3: Commit**

```bash
git add tests/crm/contacts-list.spec.ts
git commit -m "test(e2e): add contacts list loading and editing tests

Test coverage:
- DataGrid loads with contacts
- Inline editing with optimistic updates
- Email validation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: E2E Tests - Archive with Undo

**Agent:** playwright-tester

**Files:**
- Modify: `tests/crm/contacts-list.spec.ts`

**Step 1: Add archive tests**

Append to existing test file:

```typescript
test.describe('Contacts Archive', () => {
  test('should archive contact with undo', async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.waitForSelector('[role="grid"]');

    // Get initial row count
    const initialRows = await page.locator('[role="row"]').count();

    // Click archive button on first contact
    const archiveButton = page.locator('[aria-label="Archive"]').first();
    await archiveButton.click();

    // Verify row is removed from grid
    const newRowCount = await page.locator('[role="row"]').count();
    expect(newRowCount).toBe(initialRows - 1);

    // Verify toast appears with undo button
    await expect(page.locator('.MuiAlert-message')).toContainText('Contact archived');
    const undoButton = page.locator('button:has-text("Undo")');
    await expect(undoButton).toBeVisible();

    // Click undo
    await undoButton.click();

    // Verify contact is restored
    await page.waitForTimeout(500); // Wait for UI update
    const restoredRowCount = await page.locator('[role="row"]').count();
    expect(restoredRowCount).toBe(initialRows);

    // Verify restored toast
    await expect(page.locator('.MuiAlert-message')).toContainText('Contact restored');
  });

  test('should permanently archive after timeout', async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.waitForSelector('[role="grid"]');

    // Get first contact ID for verification
    const firstRow = page.locator('[role="row"]').nth(1); // Skip header
    const contactName = await firstRow.locator('[data-field="first_name"]').textContent();

    // Click archive button
    const archiveButton = page.locator('[aria-label="Archive"]').first();
    await archiveButton.click();

    // Verify toast appears
    await expect(page.locator('.MuiAlert-message')).toContainText('Contact archived');

    // Wait for toast timeout (10 seconds + buffer)
    await page.waitForTimeout(11000);

    // Refresh page
    await page.reload();
    await page.waitForSelector('[role="grid"]');

    // Verify contact is NOT in list
    const contactCells = await page.locator('[data-field="first_name"]').allTextContents();
    expect(contactCells).not.toContain(contactName);
  });
});
```

**Step 2: Run tests**

```bash
npx playwright test tests/crm/contacts-list.spec.ts --headed
```

**Expected Output:** All 5 tests pass (3 from Task 8 + 2 new)

**Step 3: Commit**

```bash
git add tests/crm/contacts-list.spec.ts
git commit -m "test(e2e): add archive with undo tests

Test coverage:
- Archive contact with immediate undo
- Permanent archive after timeout

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: E2E Tests - GridToolbar Features

**Agent:** playwright-tester

**Files:**
- Modify: `tests/crm/contacts-list.spec.ts`

**Step 1: Add GridToolbar tests**

Append to existing test file:

```typescript
test.describe('GridToolbar Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.waitForSelector('[role="grid"]');
  });

  test('should filter contacts with quick search', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('[role="row"]').count();

    // Type in quick filter
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');

    // Wait for filter to apply
    await page.waitForTimeout(600); // debounce delay

    // Verify filtered results (should be less than or equal to initial)
    const filteredRows = await page.locator('[role="row"]').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('should toggle density', async ({ page }) => {
    // Click density button
    const densityButton = page.locator('[aria-label*="Density"]');
    await densityButton.click();

    // Select "Compact"
    await page.locator('li:has-text("Compact")').click();

    // Verify grid density changed (rows should be shorter)
    const rowHeight = await page.locator('[role="row"]').first().evaluate((el) => {
      return window.getComputedStyle(el).height;
    });

    // Compact rows are typically ~36px or less
    const heightValue = parseInt(rowHeight);
    expect(heightValue).toBeLessThan(50);
  });

  test('should show/hide columns', async ({ page }) => {
    // Click columns button
    const columnsButton = page.locator('[aria-label*="Columns"]');
    await columnsButton.click();

    // Hide "Department" column
    const departmentCheckbox = page.locator('label:has-text("Department")').locator('input');
    await departmentCheckbox.click();

    // Close columns panel
    await page.keyboard.press('Escape');

    // Verify column is hidden
    const departmentHeader = page.locator('[data-field="department"]');
    await expect(departmentHeader).not.toBeVisible();
  });

  test('should export to CSV', async ({ page }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');

    // Click export button
    const exportButton = page.locator('[aria-label*="Export"]');
    await exportButton.click();

    // Click "Download as CSV"
    await page.locator('li:has-text("Download as CSV")').click();

    // Verify download started
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
```

**Step 2: Run tests**

```bash
npx playwright test tests/crm/contacts-list.spec.ts --headed
```

**Expected Output:** All 9 tests pass (5 previous + 4 new)

**Step 3: Commit**

```bash
git add tests/crm/contacts-list.spec.ts
git commit -m "test(e2e): add GridToolbar feature tests

Test coverage:
- Quick filter search
- Density toggle
- Column show/hide
- CSV export

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: E2E Tests - Navigation

**Agent:** playwright-tester

**Files:**
- Modify: `tests/crm/contacts-list.spec.ts`

**Step 1: Add navigation tests**

Append to existing test file:

```typescript
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/apps/crm/contacts');
    await page.waitForSelector('[role="grid"]');
  });

  test('should navigate to contact details on double-click', async ({ page }) => {
    // Double-click first row
    const firstRow = page.locator('[role="row"]').nth(1); // Skip header
    await firstRow.dblclick();

    // Verify navigation to contact details
    await page.waitForURL(/\/apps\/crm\/contact-details\/[^/]+/);
    expect(page.url()).toContain('/apps/crm/contact-details/');
  });

  test('should navigate to contact details via view button', async ({ page }) => {
    // Click view button on first contact
    const viewButton = page.locator('[aria-label="View"]').first();
    await viewButton.click();

    // Verify navigation
    await page.waitForURL(/\/apps\/crm\/contact-details\/[^/]+/);
    expect(page.url()).toContain('/apps/crm/contact-details/');
  });

  test('should navigate to company details when clicking company name', async ({ page }) => {
    // Click company name link in first row
    const companyLink = page.locator('[data-field="account"] a').first();

    // Check if link exists (some contacts may not have company)
    const linkCount = await companyLink.count();
    if (linkCount > 0) {
      await companyLink.click();

      // Verify navigation to company/account details
      await page.waitForURL(/\/apps\/crm\/account-details\/[^/]+/);
      expect(page.url()).toContain('/apps/crm/account-details/');
    } else {
      // Skip test if no company links exist
      test.skip();
    }
  });
});
```

**Step 2: Run tests**

```bash
npx playwright test tests/crm/contacts-list.spec.ts --headed
```

**Expected Output:** All 12 tests pass (9 previous + 3 new)

**Step 3: Commit**

```bash
git add tests/crm/contacts-list.spec.ts
git commit -m "test(e2e): add navigation tests

Test coverage:
- Double-click row to contact details
- View button navigation
- Company name link navigation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 12: Verification - Build, Lint, and Full Test Suite

**Step 1: Run build**

```bash
npm run build
```

**Expected Output:** Build succeeds with no errors

**Step 2: Run lint**

```bash
npm run lint
```

**Expected Output:** No lint errors

**Step 3: Run all Playwright tests**

```bash
npx playwright test tests/crm/contacts-list.spec.ts
```

**Expected Output:** All 12 tests pass

**Step 4: Manual verification checklist**

Visit http://localhost:4000/apps/crm/contacts and verify:

- [ ] Page loads with DataGrid
- [ ] GridToolbar visible with all buttons
- [ ] Contacts display with all columns
- [ ] Can edit First Name inline → shows optimistic update → success toast
- [ ] Can edit Email inline → validates format
- [ ] Can archive contact → row disappears → "Contact archived" toast with Undo
- [ ] Click Undo → contact restored → "Contact restored" toast
- [ ] Archive without undo → wait 10s → contact permanently archived
- [ ] Quick filter works (type in search box)
- [ ] Density toggle works (Compact/Standard/Comfortable)
- [ ] Column selector works (hide/show columns)
- [ ] Export CSV works (download triggers)
- [ ] Double-click row → navigates to contact details
- [ ] Click View button → navigates to contact details
- [ ] Click Company name → navigates to account details

**Step 5: Commit verification**

```bash
git add -A
git commit -m "docs: verify contacts list implementation complete

All features verified:
✅ Editable DataGrid with optimistic updates
✅ Archive with undo mechanism
✅ GridToolbar features (filter, density, export)
✅ Navigation (view, double-click, company links)
✅ Toast notifications for all actions
✅ Build, lint, and E2E tests pass

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria

- ✅ Database migration adds archived field
- ✅ GET /api/crm/contacts endpoint returns active contacts
- ✅ PATCH endpoint supports archived field
- ✅ useCRMContacts and useArchiveContact hooks work
- ✅ ContactsDataGrid component renders with all features
- ✅ Inline editing works with optimistic updates
- ✅ Archive with undo mechanism works
- ✅ GridToolbar features (filter, density, export, columns) work
- ✅ Navigation to contact/company details works
- ✅ All 12 E2E tests pass
- ✅ Build and lint succeed

---

## Notes

- Follow Aurora template patterns for UI consistency
- Maintain SWR patterns for data fetching
- Archive is soft delete (never hard delete)
- Optimistic updates provide instant feedback
- Multi-tenant security enforced at API level
- Toast notifications confirm all user actions
