# CRM Create Deal Modal - Database Wiring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the CRM Create Deal modal to persist deals to the database with contact selection, proper validation, error handling, and UX feedback.

**Architecture:** Replace hardcoded client data with contact selection from database. Integrate existing `useCreateDeal()` SWR mutation hook to POST deals. Add optimistic updates, error handling, and form reset logic.

**Tech Stack:** Next.js 15, React 19, MUI 7, react-hook-form, Yup, SWR, Supabase (via MCP)

---

## Task 1: Verify Contact API Endpoint Exists

**Files:**
- Check: `src/app/api/crm/contacts/route.js`
- Check: `src/services/swr/api-hooks/useCRMContactApi.js`

**Step 1: Check if contacts API exists**

Run:
```bash
ls -la src/app/api/crm/contacts/route.js
```

Expected: File exists OR "No such file" (proceed to create)

**Step 2: Check if contacts SWR hook exists**

Run:
```bash
ls -la src/services/swr/api-hooks/useCRMContactApi.js
```

Expected: File exists OR "No such file" (proceed to create)

**Step 3: Read existing contacts API if exists**

If file exists, read it:
```bash
cat src/app/api/crm/contacts/route.js
```

**Step 4: Document findings**

Create notes in `docs/plans/contact-api-status.md`:
```markdown
# Contact API Status

- Contacts API route: [EXISTS/MISSING]
- Contacts SWR hook: [EXISTS/MISSING]
- Next step: [CREATE/USE_EXISTING]
```

**Step 5: Commit findings**

```bash
git add docs/plans/contact-api-status.md
git commit -m "docs: document contact API status check"
```

---

## Task 2: Create Contact API Endpoint (if needed)

**Files:**
- Create: `src/app/api/crm/contacts/route.js`

**Step 1: Check Supabase contacts table schema**

Use Supabase MCP to check if contacts table exists:
```bash
# This will be done via MCP tool
```

Expected: Table schema with columns: id, name, email, phone, company_id, etc.

**Step 2: Create GET /api/crm/contacts endpoint**

Create file `src/app/api/crm/contacts/route.js`:

```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch contacts with company join
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select(`
        id,
        name,
        email,
        phone,
        company:companies(id, name)
      `)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Step 3: Test the endpoint manually**

Run dev server:
```bash
npm run dev
```

Test endpoint (in another terminal):
```bash
curl http://localhost:4000/api/crm/contacts
```

Expected: JSON array of contacts OR 401 if not authenticated

**Step 4: Commit API endpoint**

```bash
git add src/app/api/crm/contacts/route.js
git commit -m "feat(api): add GET /api/crm/contacts endpoint"
```

---

## Task 3: Create Contact SWR Hook (if needed)

**Files:**
- Create/Modify: `src/services/swr/api-hooks/useCRMContactApi.js`

**Step 1: Check if file exists and read it**

```bash
cat src/services/swr/api-hooks/useCRMContactApi.js 2>/dev/null || echo "File does not exist"
```

**Step 2: Create or update contact SWR hook**

Create/update `src/services/swr/api-hooks/useCRMContactApi.js`:

```javascript
import useSWR from 'swr';
import { axiosInstance } from '@/services/axios/axiosInstance';

// Fetcher for contacts
const contactsFetcher = async (url) => {
  const response = await axiosInstance.get(url);
  return response.data;
};

// Hook to fetch all contacts
export const useContacts = () => {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/crm/contacts',
    contactsFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    contacts: data || [],
    isLoading,
    isError: error,
    mutate,
  };
};
```

**Step 3: Test the hook import**

Create a simple test file to verify imports work:
```bash
node -e "console.log('Testing import...'); require('./src/services/swr/api-hooks/useCRMContactApi.js'); console.log('Import successful');"
```

Expected: No syntax errors

**Step 4: Commit SWR hook**

```bash
git add src/services/swr/api-hooks/useCRMContactApi.js
git commit -m "feat(hooks): add useContacts SWR hook"
```

---

## Task 4: Update CreateDealDialog - Add Contact Field

**Files:**
- Modify: `src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`

**Step 1: Import useContacts hook**

At top of CreateDealDialog.jsx, add import:

```javascript
import { useContacts } from '@/services/swr/api-hooks/useCRMContactApi';
```

**Step 2: Add useContacts hook to component**

Inside CreateDealDialog component, after existing hooks:

```javascript
const { contacts, isLoading: contactsLoading } = useContacts();
```

**Step 3: Add contact field to initial values**

Update defaultValues object:

```javascript
const defaultValues = {
  name: '',
  description: '',
  pipeline: '',
  stage: listTitle ?? '',
  amount: 0,
  contact: null, // NEW - replaces hardcoded client
  createDate: dayjs().toString(),
  lastUpdate: dayjs().toString(),
  closeDate: dayjs().toString(),
  priority: '',
  progress: 0,
  company: null, // Update to null instead of object
  owner: null, // Update to null
  collaborators: [],
};
```

**Step 4: Add contact Autocomplete field to form**

Find the company field section and add contact field after it:

```jsx
{/* Contact Field - NEW */}
<Controller
  name="contact"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <Autocomplete
      {...field}
      options={contacts}
      loading={contactsLoading}
      getOptionLabel={(option) => option.name || ''}
      isOptionEqualToValue={(option, value) => option.id === value?.id}
      onChange={(event, newValue) => {
        field.onChange(newValue);
        // Auto-populate company when contact selected
        if (newValue?.company) {
          setValue('company', newValue.company);
        }
      }}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box>
            <Typography variant="body2">{option.name}</Typography>
            {option.email && (
              <Typography variant="caption" color="text.secondary">
                {option.email}
              </Typography>
            )}
            {option.company?.name && (
              <Typography variant="caption" color="text.secondary">
                {' • '}{option.company.name}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Contact"
          placeholder="Select contact"
          error={!!error}
          helperText={error?.message}
          required
        />
      )}
    />
  )}
/>
```

**Step 5: Test the component renders**

Run dev server and navigate to CRM deals page:
```bash
npm run dev
```

Open: http://localhost:4000/apps/crm/deals
Click "Add new Deal" button

Expected: Modal opens with new Contact field visible

**Step 6: Commit contact field addition**

```bash
git add src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx
git commit -m "feat(ui): add contact selector to Create Deal modal"
```

---

## Task 5: Update Validation Schema

**Files:**
- Modify: `src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`

**Step 1: Update Yup validation schema**

Find the validationSchema and update it:

```javascript
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Deal name is required'),
  description: Yup.string(),
  pipeline: Yup.string(),
  stage: Yup.string().required('Stage is required'),
  amount: Yup.number()
    .required('Amount is required')
    .min(0, 'Amount must be positive'),
  createDate: Yup.date().required('Create date is required'),
  closeDate: Yup.date()
    .required('Close date is required')
    .min(Yup.ref('createDate'), 'Close date must be after create date'),
  owner: Yup.object().nullable(),
  priority: Yup.string().required('Priority is required'),
  company: Yup.object().required('Company is required').nullable(),
  contact: Yup.object().required('Contact is required').nullable(),
  collaborators: Yup.array(),
});
```

**Step 2: Remove hardcoded client from initial values**

Ensure no hardcoded client object remains in defaultValues (already done in Task 4).

**Step 3: Test validation**

Run dev server:
```bash
npm run dev
```

Try to submit form without filling required fields.
Expected: Validation errors appear for name, stage, amount, dates, priority, company, contact

**Step 4: Commit validation updates**

```bash
git add src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx
git commit -m "feat(validation): update deal form validation schema"
```

---

## Task 6: Wire useCreateDeal Hook

**Files:**
- Modify: `src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`
- Check: `src/services/swr/api-hooks/useCRMDealsApi.js`

**Step 1: Import useCreateDeal hook**

Add to imports at top of CreateDealDialog.jsx:

```javascript
import { useCreateDeal } from '@/services/swr/api-hooks/useCRMDealsApi';
```

**Step 2: Add useCreateDeal hook to component**

Inside component, after other hooks:

```javascript
const { trigger: createDeal, isMutating } = useCreateDeal();
```

**Step 3: Import mutate from SWR**

Add to imports:

```javascript
import { mutate } from 'swr';
```

**Step 4: Add useState for error handling**

Add near other state declarations:

```javascript
const [submitError, setSubmitError] = useState(null);
```

**Step 5: Import setError from react-hook-form**

Update useForm destructuring to include setError:

```javascript
const {
  control,
  handleSubmit,
  reset,
  setValue,
  setError,
  formState: { errors },
} = useForm({
  defaultValues,
  resolver: yupResolver(validationSchema),
});
```

**Step 6: Commit hook setup**

```bash
git add src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx
git commit -m "feat(wiring): import and setup useCreateDeal hook"
```

---

## Task 7: Update onSubmit Handler

**Files:**
- Modify: `src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`

**Step 1: Replace existing onSubmit function**

Find the current onSubmit and replace with:

```javascript
const onSubmit = async (data) => {
  try {
    setSubmitError(null);

    // Transform form data to API format
    const dealPayload = {
      name: data.name,
      description: data.description || null,
      stage: data.stage,
      company_id: data.company?.id,
      contact_id: data.contact?.id,
      amount: Number(data.amount),
      priority: data.priority,
      progress: 0,
      close_date: dayjs(data.closeDate).toISOString(),
    };

    // Call API
    const newDeal = await createDeal(dealPayload);

    // Optimistic update - add to local state
    dealsDispatch({
      type: 'ADD_NEW_DEAL',
      payload: {
        listId: data.stage,
        deal: {
          ...newDeal,
          client: {
            name: data.contact?.name || '',
            email: data.contact?.email || '',
            phone: data.contact?.phone || '',
          },
        },
      },
    });

    // Revalidate deals list from server
    mutate('/api/crm/deals');

    // Close modal and reset form
    dealsDispatch({
      type: 'SET_CREATE_DEAL_DIALOG',
      payload: { listId: null },
    });
    reset();

    // TODO: Show success toast notification

  } catch (error) {
    console.error('Error creating deal:', error);

    // Handle duplicate name error
    if (error.response?.data?.code === 'DUPLICATE_DEAL_NAME') {
      setError('name', {
        type: 'manual',
        message: 'A deal with this name already exists',
      });
    } else {
      // Generic error
      setSubmitError(error.response?.data?.error || 'Failed to create deal. Please try again.');
    }
  }
};
```

**Step 2: Test form submission flow**

Run dev server:
```bash
npm run dev
```

Fill out the form completely and submit.
Check browser console and network tab for API call.

Expected: POST request to /api/crm/deals with correct payload

**Step 3: Commit onSubmit handler**

```bash
git add src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx
git commit -m "feat(wiring): integrate API call in onSubmit handler"
```

---

## Task 8: Add Loading States

**Files:**
- Modify: `src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`

**Step 1: Update Create button with loading state**

Find the Create button and update:

```jsx
<LoadingButton
  type="submit"
  variant="contained"
  loading={isMutating}
  disabled={isMutating}
>
  {isMutating ? 'Creating...' : 'Create'}
</LoadingButton>
```

**Step 2: Import LoadingButton if not already imported**

Add to imports:

```javascript
import { LoadingButton } from '@mui/lab';
```

**Step 3: Disable form fields during submission**

Add disabled prop to all Controller fields:

```jsx
<Controller
  name="name"
  control={control}
  render={({ field, fieldState: { error } }) => (
    <TextField
      {...field}
      disabled={isMutating}
      // ... rest of props
    />
  )}
/>
```

Apply to all fields: name, description, pipeline, stage, amount, dates, owner, priority, company, contact, collaborators.

**Step 4: Prevent modal close during submission**

Update Dialog component:

```jsx
<Dialog
  open={createDealDialog}
  onClose={isMutating ? null : handleClose}
  maxWidth="sm"
  fullWidth
>
```

**Step 5: Test loading states**

Run dev server and submit form:
```bash
npm run dev
```

Expected: Button shows "Creating..." and all fields are disabled during submission

**Step 6: Commit loading states**

```bash
git add src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx
git commit -m "feat(ux): add loading states during form submission"
```

---

## Task 9: Add Error Display

**Files:**
- Modify: `src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`

**Step 1: Add error alert component**

Add after DialogTitle and before form content:

```jsx
{submitError && (
  <Alert severity="error" sx={{ mx: 3, mt: 2 }} onClose={() => setSubmitError(null)}>
    {submitError}
  </Alert>
)}
```

**Step 2: Import Alert if not already**

Add to imports:

```javascript
import { Alert } from '@mui/material';
```

**Step 3: Test error display**

Temporarily modify onSubmit to throw an error:
```javascript
throw new Error('Test error');
```

Run dev server and submit form:
```bash
npm run dev
```

Expected: Red error alert appears at top of modal

**Step 4: Remove test error and commit**

Remove test error, verify form works:

```bash
git add src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx
git commit -m "feat(ux): add error alert display in modal"
```

---

## Task 10: Add Success Toast Notification

**Files:**
- Modify: `src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`
- Check: `src/providers/*` or `src/contexts/*` for existing toast/snackbar system

**Step 1: Check for existing toast system**

Search for existing Snackbar or Toast context:
```bash
grep -r "SnackbarProvider\|ToastProvider\|useSnackbar\|useToast" src/
```

**Step 2: Add MUI Snackbar state if no system exists**

Add to component state:

```javascript
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
```

**Step 3: Add Snackbar component to render**

Add before closing Dialog tag:

```jsx
<Snackbar
  open={snackbar.open}
  autoHideDuration={4000}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert
    onClose={() => setSnackbar({ ...snackbar, open: false })}
    severity={snackbar.severity}
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
```

**Step 4: Import Snackbar**

Add to imports:

```javascript
import { Snackbar } from '@mui/material';
```

**Step 5: Trigger success toast in onSubmit**

In onSubmit, replace the TODO comment with:

```javascript
// Show success toast notification
setSnackbar({
  open: true,
  message: 'Deal created successfully!',
  severity: 'success',
});
```

**Step 6: Test success toast**

Run dev server and create a deal:
```bash
npm run dev
```

Expected: Green success message appears at top center after creation

**Step 7: Commit toast notification**

```bash
git add src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx
git commit -m "feat(ux): add success toast notification"
```

---

## Task 11: Add Form Reset on Cancel

**Files:**
- Modify: `src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`

**Step 1: Create handleClose function**

Add function before return statement:

```javascript
const handleClose = () => {
  if (!isMutating) {
    reset();
    setSubmitError(null);
    dealsDispatch({
      type: 'SET_CREATE_DEAL_DIALOG',
      payload: { listId: null },
    });
  }
};
```

**Step 2: Update Cancel button onClick**

Find Cancel button and update:

```jsx
<Button onClick={handleClose} disabled={isMutating}>
  Cancel
</Button>
```

**Step 3: Update Dialog onClose**

Already done in Task 8, verify it uses handleClose:

```jsx
<Dialog
  open={createDealDialog}
  onClose={handleClose}
  maxWidth="sm"
  fullWidth
>
```

**Step 4: Test form reset on cancel**

Run dev server:
```bash
npm run dev
```

Fill form partially, click Cancel, reopen modal.
Expected: Form fields are cleared

**Step 5: Commit form reset logic**

```bash
git add src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx
git commit -m "feat(ux): reset form on cancel"
```

---

## Task 12: Verify Build and Lint

**Step 1: Run ESLint**

```bash
npm run lint
```

Expected: No errors (warnings acceptable)

**Step 2: Fix any lint errors**

If errors exist, fix them and commit:

```bash
# Fix files
git add .
git commit -m "fix: resolve lint errors"
```

**Step 3: Run production build**

```bash
npm run build
```

Expected: Build succeeds with no errors

**Step 4: Document verification**

Create verification log:

```markdown
# Verification Results

Date: 2026-01-31

## Lint
- Status: PASS
- Warnings: [count]

## Build
- Status: PASS
- Output size: [size]

## Manual Testing
- Contact selection: PASS
- Form submission: PASS
- Error handling: PASS
- Success toast: PASS
- Form reset: PASS
```

**Step 5: Commit verification**

```bash
git add docs/plans/verification-results.md
git commit -m "docs: add verification results"
```

---

## Task 13: Create Playwright E2E Test

**Files:**
- Create: `tests/e2e/crm/create-deal.spec.ts`

**Step 1: Write failing E2E test**

Create `tests/e2e/crm/create-deal.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Create Deal Modal', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to deals page
    await page.goto('/apps/crm/deals');
    // TODO: Add authentication if required
  });

  test('should open create deal modal when clicking Add new Deal button', async ({ page }) => {
    await page.getByRole('button', { name: /add new deal/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Create New Deal')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ page }) => {
    await page.getByRole('button', { name: /add new deal/i }).click();
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Deal name is required')).toBeVisible();
    await expect(page.getByText('Stage is required')).toBeVisible();
    await expect(page.getByText('Amount is required')).toBeVisible();
  });

  test('should create a new deal successfully', async ({ page }) => {
    await page.getByRole('button', { name: /add new deal/i }).click();

    // Fill form
    await page.getByLabel('Deal name').fill('Test Deal E2E');
    await page.getByLabel('Stage').click();
    await page.getByRole('option', { name: 'Contact' }).click();
    await page.getByLabel('Amount').fill('50000');
    await page.getByLabel('Priority').click();
    await page.getByRole('option', { name: 'High' }).click();

    // Select company
    await page.getByLabel('Associate deal with').click();
    await page.getByRole('option').first().click();

    // Select contact
    await page.getByLabel('Contact').click();
    await page.getByRole('option').first().click();

    // Submit
    await page.getByRole('button', { name: 'Create' }).click();

    // Verify success
    await expect(page.getByText('Deal created successfully!')).toBeVisible();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should show error for duplicate deal name', async ({ page }) => {
    // Create first deal
    await page.getByRole('button', { name: /add new deal/i }).click();
    await page.getByLabel('Deal name').fill('Duplicate Test Deal');
    // Fill other required fields...
    await page.getByRole('button', { name: 'Create' }).click();

    // Try to create duplicate
    await page.getByRole('button', { name: /add new deal/i }).click();
    await page.getByLabel('Deal name').fill('Duplicate Test Deal');
    // Fill other required fields...
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('A deal with this name already exists')).toBeVisible();
  });

  test('should auto-populate company when contact selected', async ({ page }) => {
    await page.getByRole('button', { name: /add new deal/i }).click();

    // Select contact
    await page.getByLabel('Contact').click();
    await page.getByRole('option').first().click();

    // Verify company auto-populated
    const companyField = page.getByLabel('Associate deal with');
    await expect(companyField).not.toHaveValue('');
  });
});
```

**Step 2: Run test to verify it fails (initially)**

```bash
npx playwright test tests/e2e/crm/create-deal.spec.ts
```

Expected: Some tests may fail if feature not fully implemented yet

**Step 3: Fix any issues found by tests**

Iterate on implementation until all tests pass.

**Step 4: Run tests to verify they pass**

```bash
npx playwright test tests/e2e/crm/create-deal.spec.ts
```

Expected: All tests PASS

**Step 5: Commit E2E tests**

```bash
git add tests/e2e/crm/create-deal.spec.ts
git commit -m "test: add E2E tests for Create Deal modal"
```

---

## Task 14: Final Integration Test

**Step 1: Run full test suite**

```bash
npx playwright test
```

Expected: All tests pass

**Step 2: Manual smoke test**

Run dev server:
```bash
npm run dev
```

Test complete flow:
1. Navigate to /apps/crm/deals
2. Click "Add new Deal"
3. Fill all fields including contact
4. Submit and verify deal appears
5. Try to create duplicate deal name
6. Verify error appears
7. Cancel and verify form resets

**Step 3: Document test results**

Update verification doc with test results.

**Step 4: Run final build**

```bash
npm run build
```

Expected: Clean build

**Step 5: Commit final verification**

```bash
git add docs/plans/verification-results.md
git commit -m "docs: update verification with final test results"
```

---

## Task 15: Code Review Preparation

**Step 1: Use code review skill**

Invoke skill:
```
@superpowers:requesting-code-review
```

**Step 2: Address any issues found**

Fix issues and commit changes.

**Step 3: Create PR**

Use GitHub workflow skill:
```
@github-workflow to create PR
```

**Step 4: Update documentation**

Update INDEX or relevant docs with completion status.

---

## Success Criteria Checklist

- [ ] Contact API endpoint created and tested
- [ ] Contact SWR hook created
- [ ] Contact selector field added to modal
- [ ] Validation schema updated
- [ ] useCreateDeal hook integrated
- [ ] onSubmit handler calls API
- [ ] Loading states prevent double submission
- [ ] Error handling displays field errors
- [ ] Success toast shows after creation
- [ ] Form resets on cancel and success
- [ ] Build and lint pass
- [ ] E2E tests pass
- [ ] Manual testing verified
- [ ] Code review completed
- [ ] PR created

---

## Tech Stack Reference

**Frontend:**
- React 19
- Material-UI 7
- react-hook-form
- Yup validation
- dayjs

**Backend:**
- Next.js 15 App Router
- Supabase (via MCP tools)

**Testing:**
- Playwright (E2E)

**Data Fetching:**
- SWR with axios

---

## Related Skills

- @superpowers:test-driven-development - TDD approach
- @superpowers:verification-before-completion - Verify before claiming done
- @superpowers:requesting-code-review - Request code review
- @github-workflow - Create PR and update issues
