# Contacts List - Editable DataGrid Design

**Date:** 2026-01-31
**Status:** Design Approved
**Feature:** Contacts List with Editable DataGrid

## Overview

Create a full-featured contacts list page using MUI DataGrid with inline editing, optimistic updates, archive functionality with undo, and comprehensive GridToolbar features.

---

## 1. Architecture & Component Structure

**Component Hierarchy:**
```
ContactsListPage (/apps/crm/contacts)
├── ContactsDataGrid (new component)
│   ├── MUI DataGrid with GridToolbar
│   ├── Column definitions with editability flags
│   ├── Custom cell renderers (Status dropdown, Tags chips)
│   └── Row action buttons (View, Archive)
└── Toast notifications (SnackbarProvider)
```

**Missing API Implementation:**
Create `GET /api/crm/contacts` endpoint that returns:
- All contacts for the user's organization
- Joined with accounts table for company data
- Filtered by organization_id for multi-tenant isolation
- Paginated if needed (or let DataGrid handle client-side pagination initially)

**SWR Hook:**
Add `useCRMContacts()` hook in `useCRMContactApi.js` to fetch the contacts list with automatic revalidation after updates.

**Tech Stack:**
- MUI X Data Grid (already in package.json via @mui dependencies)
- Existing SWR pattern for data fetching
- Existing PATCH `/api/crm/contacts/[id]` for updates (already supports core fields)
- MUI Snackbar for toast notifications

---

## 2. Data Flow & Editing Behavior

**Initial Load:**
1. Page loads → `useCRMContacts()` hook fetches `GET /api/crm/contacts`
2. API returns contacts with joined account data:
   ```json
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
     "tags": ["vip", "enterprise"],
     "account": {
       "name": "Acme Corp",
       "industry": "Technology"
     }
   }
   ```
3. DataGrid displays rows with all columns

**Inline Editing Flow (Optimistic Updates):**
1. User clicks cell → enters edit mode
2. User changes value → blurs field (clicks away or tabs)
3. **Immediately**: Update local state (optimistic) - cell shows new value
4. **Immediately**: Call `updateCRMContact(contactId, { fieldName: newValue })`
5. **Background**: PATCH `/api/crm/contacts/[id]` processes update
6. **Success**:
   - Show toast: "Contact updated successfully" (green, 3s duration)
   - SWR mutate triggers revalidation
7. **Failure**:
   - Revert cell to previous value
   - Show toast: "Failed to update contact: [error message]" (red, 5s duration)
   - SWR doesn't mutate

**Special Field Handling:**
- **Status**: Dropdown with Active/Inactive options (editable)
- **Tags**: Display as chips (read-only in grid, click to view details for editing)
- **Company Name**: Clickable link to account/company details (read-only)
- **Lead Status/Source**: Display as text badges (read-only in grid)

---

## 3. Column Definitions & GridToolbar Features

**Column Configuration:**
```javascript
columns = [
  // Editable Columns
  { field: 'first_name', headerName: 'First Name', width: 150, editable: true },
  { field: 'last_name', headerName: 'Last Name', width: 150, editable: true },
  { field: 'email', headerName: 'Email', width: 200, editable: true, type: 'email' },
  { field: 'phone', headerName: 'Phone', width: 140, editable: true },
  { field: 'mobile', headerName: 'Mobile', width: 140, editable: true },
  { field: 'title', headerName: 'Title', width: 150, editable: true },
  { field: 'department', headerName: 'Department', width: 130, editable: true },
  {
    field: 'status',
    headerName: 'Status',
    width: 120,
    editable: true,
    type: 'singleSelect',
    valueOptions: ['active', 'inactive']
  },

  // Read-Only Display Columns
  {
    field: 'account.name',
    headerName: 'Company',
    width: 180,
    editable: false,
    renderCell: (params) => <Link to company details>
  },
  {
    field: 'lead_status',
    headerName: 'Lead Status',
    width: 130,
    editable: false,
    renderCell: (params) => <Chip>
  },
  {
    field: 'lead_source',
    headerName: 'Lead Source',
    width: 130,
    editable: false
  },
  {
    field: 'tags',
    headerName: 'Tags',
    width: 200,
    editable: false,
    renderCell: (params) => <Stack with Chips>
  },

  // Actions Column
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    editable: false,
    renderCell: (params) => <IconButton View/Archive>
  }
]
```

**GridToolbar Features:**
- **Column Selection**: Show/hide columns via columns panel
- **Filtering**: Filter by any column value
- **Density**: Compact/Standard/Comfortable row height
- **Quick Filter**: Search across all visible columns
- **Export**: CSV/Print options

---

## 4. Row Actions & Navigation with Archive/Undo

**Actions Column:**
Each row will have two icon buttons:

1. **View/Edit** (Eye icon or Edit icon)
   - Navigates to contact detail page
   - Route: `/apps/crm/contact-details/[id]` (new page needed)
   - Shows full contact information with all fields editable
   - Includes related data: deals, activities, notes

2. **Archive** (Archive/Box icon)
   - **No confirmation dialog** - immediate action
   - Optimistically removes row from grid (or marks as archived visually)
   - Toast appears: "Contact archived" with **"Undo" action button** (10s duration)
   - If user clicks "Undo": Restore contact to active + show "Contact restored" toast
   - If timeout expires: Permanent PATCH `/api/crm/contacts/[id]` with `{ status: 'archived' }` or `{ archived: true }`
   - On archive error: Restore row + show error toast

**Database Change Needed:**
Add `archived` boolean field to contacts table (default: false), or extend existing `status` field with 'active'/'inactive'/'archived' enum.

**Row Click Behavior:**
- Single click on row → Select row (checkbox)
- Double click on row → Navigate to contact details (same as View action)
- Click on Company Name cell → Navigate to account/company details

**Routing Updates:**
Add to `src/routes/paths.js`:
```javascript
contactsList: '/apps/crm/contacts',
contactDetails: (id) => `/apps/crm/contact-details/${id}`,
```

**Navigation Integration:**
Add "Contacts" to CRM sidebar menu (if not already there), linking to `/apps/crm/contacts`

---

## 5. Error Handling & Validation

**Client-Side Validation (Before API Call):**
- **Email**: Valid email format (built-in type: 'email' in DataGrid)
- **Phone/Mobile**: Optional format validation (e.g., digits, dashes, parentheses)
- **Required Fields**: First Name, Last Name, Email (prevent empty saves)
- Show inline error in cell if validation fails
- Don't send API request if validation fails

**API-Level Errors:**

1. **Validation Errors** (400 Bad Request)
   - Revert cell to previous value
   - Toast: "Invalid value: [specific error message]"
   - Example: "Email already exists for another contact"

2. **Authorization Errors** (401/403)
   - Revert cell to previous value
   - Toast: "You don't have permission to edit this contact"
   - Log user out if 401 persists

3. **Network Errors** (500, timeout, offline)
   - Revert cell to previous value
   - Toast: "Update failed. Check your connection and try again."
   - Retry option in toast (optional enhancement)

4. **Concurrent Edit Conflict**
   - If another user updated the same contact
   - Toast: "This contact was updated by someone else. Refreshing..."
   - SWR revalidation fetches latest data

**Loading States:**
- Small spinner in cell during save (optional, since optimistic updates are fast)
- Disable cell editing while save is in progress

---

## 6. Testing Strategy

**E2E Tests with Playwright:**

### Test 1: Contact List Loading
- Navigate to `/apps/crm/contacts`
- Verify DataGrid renders with test data
- Verify all columns are visible
- Verify GridToolbar is present

### Test 2: Inline Editing Flow
- Click cell (e.g., First Name)
- Type new value
- Click away (blur)
- Verify optimistic update (cell shows new value)
- Wait for success toast "Contact updated successfully"
- Refresh page → verify change persisted

### Test 3: Archive with Undo
- Click archive button on a contact
- Verify row disappears/is marked archived
- Verify toast "Contact archived" with Undo button appears
- Click "Undo" before timeout
- Verify contact restored + "Contact restored" toast
- Verify contact still in grid

### Test 4: Archive Permanent
- Click archive button
- Wait for toast timeout (10s)
- Verify contact stays archived
- Refresh page → verify contact not in active list

### Test 5: GridToolbar Features
- Test quick filter (search across all fields)
- Test column filter
- Test density toggle
- Test export to CSV

### Test 6: Navigation
- Double-click row → verify navigates to contact details
- Click Company Name → verify navigates to company details

### Test 7: Error Handling
- Test validation errors (invalid email format)
- Test network error handling (mock API failure)
- Test optimistic update rollback on error

---

## Implementation Tasks

### Database Layer
1. Add `archived` boolean field to contacts table (or extend status enum)
2. Update RLS policies to filter archived contacts by default
3. Create migration and seed test data

### API Layer
1. Create `GET /api/crm/contacts` endpoint
   - Multi-tenant filtering by organization_id
   - Join with accounts table
   - Filter out archived contacts by default (or add query param to include)
2. Verify existing `PATCH /api/crm/contacts/[id]` supports archive field

### SWR Hooks
1. Add `useCRMContacts()` hook for fetching contact list
2. Add `useArchiveContact()` hook for archive/unarchive operations

### UI Components
1. Create `/apps/crm/contacts/page.jsx` (Contacts List Page)
2. Create `ContactsDataGrid.jsx` component with:
   - Column definitions
   - Inline editing handlers
   - Optimistic update logic
   - Toast notifications
   - Archive with undo functionality
3. Update `src/routes/paths.js` with new routes
4. Add "Contacts" to CRM sidebar navigation

### Testing
1. Create Playwright test suite for all 7 test scenarios
2. Add test data seeds for contacts with various states

---

## Success Criteria

- ✅ Users can view all contacts in a DataGrid
- ✅ Users can edit core fields inline with optimistic updates
- ✅ Successful edits show confirmation toast
- ✅ Failed edits revert and show error toast
- ✅ Users can archive contacts with undo option
- ✅ GridToolbar provides filtering, search, export, density controls
- ✅ Navigation to contact details works
- ✅ All E2E tests pass
- ✅ Multi-tenant isolation maintained

---

## Notes

- Follow Aurora template patterns for UI components
- Maintain existing SWR patterns for data fetching
- Ensure multi-tenant security at API level
- Archive is soft delete (never hard delete contacts)
- Optimistic updates provide instant feedback while maintaining data integrity
