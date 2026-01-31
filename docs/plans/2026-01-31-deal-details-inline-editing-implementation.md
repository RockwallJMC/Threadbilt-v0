# Deal Details Inline Editing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add inline editing capability to Deal Details page with auto-save on blur, optimistic UI updates, and error rollback.

**Architecture:** Three-layer implementation (database → API → UI). Create generic EditableField wrapper component and field-specific components duplicated from Aurora. Use SWR optimistic updates with useCRMDealApi hook.

**Tech Stack:** Next.js 15 App Router, React 19, Material-UI 7, SWR, Supabase (via MCP), Playwright

---

## Task 1: Database Schema Updates

**Agent:** supabase-database-architect

**Files:**
- Migration created via Supabase MCP tools
- Seed data updated via Supabase MCP tools

**Step 1: Add missing columns to deals table**

Use Supabase MCP `apply_migration` tool:

```sql
-- Migration name: add_deal_fields
ALTER TABLE deals
  ADD COLUMN forecast_category TEXT,
  ADD COLUMN created_by_id UUID REFERENCES users(id);

CREATE INDEX idx_deals_created_by ON deals(created_by_id);

-- Add check constraint for forecast_category enum
ALTER TABLE deals
  ADD CONSTRAINT deals_forecast_category_check
  CHECK (forecast_category IN ('best_case', 'commit', 'pipeline', 'omitted'));
```

**Step 2: Verify migration applied**

Use Supabase MCP `list_migrations` tool to confirm migration exists.

**Step 3: Update seed data**

Use Supabase MCP `execute_sql` tool:

```sql
-- Update existing deals with default values
UPDATE deals
SET
  forecast_category = 'pipeline',
  created_by_id = (SELECT id FROM users LIMIT 1)
WHERE forecast_category IS NULL OR created_by_id IS NULL;
```

**Step 4: Verify seed data**

Use Supabase MCP `execute_sql` tool:

```sql
SELECT id, name, forecast_category, created_by_id FROM deals LIMIT 5;
```

Expected: All deals have forecast_category and created_by_id populated.

**Step 5: Check RLS policies**

Use Supabase MCP `get_advisors` tool with type="security" to verify RLS policies cover new columns.

**Step 6: Commit**

```bash
git add supabase/migrations/*
git commit -m "feat(db): add forecast_category and created_by_id to deals table

- Added forecast_category column with enum constraint
- Added created_by_id foreign key to users table
- Created index for created_by relationship
- Updated seed data with default values

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: API PATCH Handler

**Agent:** wiring-agent

**Files:**
- Modify: `src/app/api/crm/deals/[id]/route.js`
- Test: Playwright API tests (created in Task 2)

**Step 1: Read existing API route**

Read `src/app/api/crm/deals/[id]/route.js` to understand current structure.

**Step 2: Add PATCH handler**

Add to `src/app/api/crm/deals/[id]/route.js`:

```javascript
export async function PATCH(request, { params }) {
  try {
    const supabase = createApiClient(request);
    const { id } = await params;
    const updates = await request.json();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate stage enum
    if (updates.stage && !['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].includes(updates.stage)) {
      return NextResponse.json({ error: 'Invalid stage value' }, { status: 400 });
    }

    // Validate forecast_category enum
    if (updates.forecast_category && !['best_case', 'commit', 'pipeline', 'omitted'].includes(updates.forecast_category)) {
      return NextResponse.json({ error: 'Invalid forecast_category value' }, { status: 400 });
    }

    // Validate close_date format
    if (updates.close_date && isNaN(Date.parse(updates.close_date))) {
      return NextResponse.json({ error: 'Invalid close_date format' }, { status: 400 });
    }

    // Validate amount (positive number)
    if (updates.amount !== undefined && (typeof updates.amount !== 'number' || updates.amount < 0)) {
      return NextResponse.json({ error: 'Invalid amount value' }, { status: 400 });
    }

    // Validate probability (0-100 range)
    if (updates.probability !== undefined && (typeof updates.probability !== 'number' || updates.probability < 0 || updates.probability > 100)) {
      return NextResponse.json({ error: 'Invalid probability value' }, { status: 400 });
    }

    // Update deal (RLS handles org filtering)
    const { data: updatedDeal, error: updateError } = await supabase
      .from('deals')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        contact:contacts(*),
        company:companies(
          *,
          deals:deals(*)
        ),
        owner:users!deals_owner_id_fkey(*),
        collaborators:deal_collaborators(
          user:users(*)
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating deal:', updateError);
      return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 });
    }

    return NextResponse.json(updatedDeal);

  } catch (error) {
    console.error('Error in PATCH /api/crm/deals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 3: Create Playwright API test**

Create `tests/api/deals-patch.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('PATCH /api/crm/deals/[id]', () => {
  test('should update deal fields successfully', async ({ request }) => {
    const dealId = 'existing-deal-uuid'; // Use test fixture

    const response = await request.patch(`/api/crm/deals/${dealId}`, {
      data: {
        description: 'Updated description',
        stage: 'proposal',
        amount: 150000,
        probability: 75,
        forecast_category: 'commit'
      }
    });

    expect(response.status()).toBe(200);
    const deal = await response.json();
    expect(deal.description).toBe('Updated description');
    expect(deal.stage).toBe('proposal');
    expect(deal.amount).toBe(150000);
    expect(deal.probability).toBe(75);
    expect(deal.forecast_category).toBe('commit');
  });

  test('should reject invalid stage', async ({ request }) => {
    const dealId = 'existing-deal-uuid';

    const response = await request.patch(`/api/crm/deals/${dealId}`, {
      data: { stage: 'invalid_stage' }
    });

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error.error).toContain('Invalid stage value');
  });

  test('should reject invalid probability', async ({ request }) => {
    const dealId = 'existing-deal-uuid';

    const response = await request.patch(`/api/crm/deals/${dealId}`, {
      data: { probability: 150 }
    });

    expect(response.status()).toBe(400);
    const error = await response.json();
    expect(error.error).toContain('Invalid probability value');
  });
});
```

**Step 4: Run API tests**

Run: `npx playwright test tests/api/deals-patch.spec.ts`
Expected: PASS (all 3 tests)

**Step 5: Commit**

```bash
git add src/app/api/crm/deals/[id]/route.js tests/api/deals-patch.spec.ts
git commit -m "feat(api): add PATCH handler for deal updates

- Added validation for stage, forecast_category, close_date, amount, probability
- Returns complete deal object with nested relations
- Added API tests for success and validation cases

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Generic EditableField Component

**Agent:** react-mui-frontend-engineer

**Files:**
- Create: `src/components/sections/crm/deal-details/deal-information/EditableField.jsx`
- Test: Unit tests created in Task 3

**Step 1: Search Aurora for editable field patterns**

Search `template-aurora/src/components/` for inline editing examples.

**Step 2: Create EditableField component**

Create `src/components/sections/crm/deal-details/deal-information/EditableField.jsx`:

```javascript
import { useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';

/**
 * Generic wrapper for inline editable fields
 * @param {string} value - Current field value
 * @param {function} onSave - Async save handler (value) => Promise
 * @param {function} renderView - Render function for view mode (value, handleEdit)
 * @param {function} renderEdit - Render function for edit mode (value, handleSave, handleCancel, isSaving)
 * @param {string} fieldName - Field name for error messages
 */
const EditableField = ({ value, onSave, renderView, renderEdit, fieldName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState(null);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleSave = async (newValue) => {
    if (newValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(newValue);
      setIsEditing(false);
    } catch (err) {
      console.error(`Failed to update ${fieldName}:`, err);
      setError(`Failed to update ${fieldName}. Please try again.`);
      setEditValue(value); // Revert to original value
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing) {
    return (
      <Box>
        {renderEdit(editValue, setEditValue, handleSave, handleCancel, isSaving)}
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  return renderView(value, handleEdit);
};

export default EditableField;
```

**Step 3: Create component test**

Create `tests/components/EditableField.spec.tsx`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('EditableField Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to storybook or test page with EditableField
    await page.goto('/test/editable-field');
  });

  test('should toggle to edit mode on click', async ({ page }) => {
    await page.click('[data-testid="editable-field-view"]');
    await expect(page.locator('[data-testid="editable-field-edit"]')).toBeVisible();
  });

  test('should save on blur', async ({ page }) => {
    await page.click('[data-testid="editable-field-view"]');
    await page.fill('input', 'New value');
    await page.click('body'); // Blur
    await expect(page.locator('[data-testid="editable-field-view"]')).toContainText('New value');
  });

  test('should cancel on ESC', async ({ page }) => {
    const originalValue = await page.textContent('[data-testid="editable-field-view"]');
    await page.click('[data-testid="editable-field-view"]');
    await page.fill('input', 'New value');
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="editable-field-view"]')).toContainText(originalValue);
  });

  test('should show loading state during save', async ({ page }) => {
    await page.click('[data-testid="editable-field-view"]');
    await page.fill('input', 'New value');
    await page.click('body');
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('should show error and revert on save failure', async ({ page }) => {
    // Mock API to return error
    await page.route('/api/crm/deals/*', route => route.abort());

    await page.click('[data-testid="editable-field-view"]');
    const originalValue = await page.textContent('[data-testid="editable-field-view"]');
    await page.fill('input', 'New value');
    await page.click('body');

    await expect(page.locator('text=Failed to update')).toBeVisible();
    await expect(page.locator('[data-testid="editable-field-view"]')).toContainText(originalValue);
  });
});
```

**Step 4: Run component tests**

Run: `npx playwright test tests/components/EditableField.spec.tsx`
Expected: Tests may need test page setup - verify component renders correctly

**Step 5: Commit**

```bash
git add src/components/sections/crm/deal-details/deal-information/EditableField.jsx tests/components/EditableField.spec.tsx
git commit -m "feat(ui): add generic EditableField wrapper component

- Manages edit/view state toggle
- Handles auto-save on blur with optimistic updates
- Shows loading indicator and error states
- Supports rollback on save failure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: EditableTextField Component

**Agent:** react-mui-frontend-engineer

**Files:**
- Create: `src/components/sections/crm/deal-details/deal-information/EditableTextField.jsx`

**Step 1: Search Aurora for TextField patterns**

Search `template-aurora/src/components/sections/crm/` for multiline TextField examples.

**Step 2: Create EditableTextField component**

Create `src/components/sections/crm/deal-details/deal-information/EditableTextField.jsx`:

```javascript
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

const EditableTextField = ({ value, onSave, label, multiline = false, rows = 1 }) => {
  const renderView = (currentValue, handleEdit) => (
    <Stack
      direction="row"
      gap={1}
      onClick={handleEdit}
      sx={{
        cursor: 'pointer',
        p: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
          '& .edit-icon': { opacity: 1 }
        }
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {currentValue || 'Click to add...'}
      </Typography>
      <IconifyIcon
        icon="material-symbols:edit-outline"
        className="edit-icon"
        sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
      />
    </Stack>
  );

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => (
    <Stack direction="row" gap={1} alignItems="flex-start">
      <TextField
        variant="filled"
        fullWidth
        multiline={multiline}
        rows={rows}
        autoFocus
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={() => handleSave(editValue)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleCancel();
          } else if (e.key === 'Enter' && !multiline) {
            handleSave(editValue);
          }
        }}
        disabled={isSaving}
        label={label}
      />
      {isSaving && <CircularProgress size={20} sx={{ mt: 2 }} />}
    </Stack>
  );

  return (
    <EditableField
      value={value}
      onSave={onSave}
      renderView={renderView}
      renderEdit={renderEdit}
      fieldName={label}
    />
  );
};

export default EditableTextField;
```

**Step 3: Commit**

```bash
git add src/components/sections/crm/deal-details/deal-information/EditableTextField.jsx
git commit -m "feat(ui): add EditableTextField component

- Multiline text editor for Deal Details field
- Auto-save on blur, ESC to cancel
- Shows edit icon on hover

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: EditableDatePicker Component

**Agent:** react-mui-frontend-engineer

**Files:**
- Create: `src/components/sections/crm/deal-details/deal-information/EditableDatePicker.jsx`

**Step 1: Search Aurora for DatePicker patterns**

Search `template-aurora/src/components/sections/crm/` for DatePicker usage (from @mui/x-date-pickers).

**Step 2: Create EditableDatePicker component**

Create `src/components/sections/crm/deal-details/deal-information/EditableDatePicker.jsx`:

```javascript
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import dayjs from 'dayjs';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

const EditableDatePicker = ({ value, onSave, label }) => {
  const renderView = (currentValue, handleEdit) => (
    <Stack
      direction="row"
      gap={1}
      onClick={handleEdit}
      sx={{
        cursor: 'pointer',
        p: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
          '& .edit-icon': { opacity: 1 }
        }
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {currentValue ? dayjs(currentValue).format('MMM D, YYYY') : 'Click to set...'}
      </Typography>
      <IconifyIcon
        icon="material-symbols:edit-outline"
        className="edit-icon"
        sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
      />
    </Stack>
  );

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => {
    const [dateValue, setDateValue] = useState(editValue ? dayjs(editValue) : null);

    return (
      <Stack direction="row" gap={1} alignItems="flex-start">
        <DatePicker
          label={label}
          value={dateValue}
          onChange={(newValue) => {
            setDateValue(newValue);
            if (newValue) {
              handleSave(newValue.toISOString());
            }
          }}
          slotProps={{
            textField: {
              variant: 'filled',
              fullWidth: true,
              autoFocus: true,
              onBlur: handleCancel,
              onKeyDown: (e) => {
                if (e.key === 'Escape') handleCancel();
              }
            }
          }}
          disabled={isSaving}
        />
        {isSaving && <CircularProgress size={20} sx={{ mt: 2 }} />}
      </Stack>
    );
  };

  return (
    <EditableField
      value={value}
      onSave={onSave}
      renderView={renderView}
      renderEdit={renderEdit}
      fieldName={label}
    />
  );
};

export default EditableDatePicker;
```

**Step 3: Commit**

```bash
git add src/components/sections/crm/deal-details/deal-information/EditableDatePicker.jsx
git commit -m "feat(ui): add EditableDatePicker component

- Date picker for Closing Date field
- Auto-save on date selection
- Shows formatted date in view mode

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: EditableSelect Component

**Agent:** react-mui-frontend-engineer

**Files:**
- Create: `src/components/sections/crm/deal-details/deal-information/EditableSelect.jsx`

**Step 1: Search Aurora for Select patterns**

Search `template-aurora/src/components/sections/crm/` for Select/FormControl usage.

**Step 2: Create EditableSelect component**

Create `src/components/sections/crm/deal-details/deal-information/EditableSelect.jsx`:

```javascript
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

const EditableSelect = ({ value, onSave, label, options, chipColor = 'default' }) => {
  const renderView = (currentValue, handleEdit) => {
    const selectedOption = options.find(opt => opt.value === currentValue);

    return (
      <Stack
        direction="row"
        gap={1}
        onClick={handleEdit}
        sx={{
          cursor: 'pointer',
          p: 1,
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.hover',
            '& .edit-icon': { opacity: 1 }
          }
        }}
      >
        {selectedOption ? (
          <Chip
            label={selectedOption.label}
            variant="soft"
            color={chipColor}
            size="small"
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            Click to select...
          </Typography>
        )}
        <IconifyIcon
          icon="material-symbols:edit-outline"
          className="edit-icon"
          sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
        />
      </Stack>
    );
  };

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => (
    <Stack direction="row" gap={1} alignItems="flex-start">
      <FormControl variant="filled" fullWidth>
        <InputLabel>{label}</InputLabel>
        <Select
          value={editValue || ''}
          onChange={(e) => {
            setEditValue(e.target.value);
            handleSave(e.target.value);
          }}
          onBlur={handleCancel}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
          disabled={isSaving}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {isSaving && <CircularProgress size={20} sx={{ mt: 2 }} />}
    </Stack>
  );

  return (
    <EditableField
      value={value}
      onSave={onSave}
      renderView={renderView}
      renderEdit={renderEdit}
      fieldName={label}
    />
  );
};

export default EditableSelect;
```

**Step 3: Commit**

```bash
git add src/components/sections/crm/deal-details/deal-information/EditableSelect.jsx
git commit -m "feat(ui): add EditableSelect component

- Dropdown selector for Current Stage and Forecast Category
- Auto-save on selection
- Shows Chip in view mode

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: EditableCurrencyInput Component

**Agent:** react-mui-frontend-engineer

**Files:**
- Create: `src/components/sections/crm/deal-details/deal-information/EditableCurrencyInput.jsx`

**Step 1: Search Aurora for currency input patterns**

Search `template-aurora/src/components/sections/crm/` for FilledInput with InputAdornment usage.

**Step 2: Create EditableCurrencyInput component**

Create `src/components/sections/crm/deal-details/deal-information/EditableCurrencyInput.jsx`:

```javascript
import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { currencyFormat } from 'lib/utils';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

const EditableCurrencyInput = ({ value, onSave, label }) => {
  const renderView = (currentValue, handleEdit) => (
    <Stack
      direction="row"
      gap={1}
      onClick={handleEdit}
      sx={{
        cursor: 'pointer',
        p: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
          '& .edit-icon': { opacity: 1 }
        }
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {currentValue !== null && currentValue !== undefined
          ? currencyFormat(currentValue)
          : 'Click to set...'}
      </Typography>
      <IconifyIcon
        icon="material-symbols:edit-outline"
        className="edit-icon"
        sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
      />
    </Stack>
  );

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => (
    <Stack direction="row" gap={1} alignItems="flex-start">
      <FormControl variant="filled" fullWidth>
        <InputLabel>{label}</InputLabel>
        <FilledInput
          type="number"
          autoFocus
          value={editValue || ''}
          onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
          onBlur={() => handleSave(editValue)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCancel();
            } else if (e.key === 'Enter') {
              handleSave(editValue);
            }
          }}
          startAdornment={<InputAdornment position="start">$</InputAdornment>}
          disabled={isSaving}
        />
      </FormControl>
      {isSaving && <CircularProgress size={20} sx={{ mt: 2 }} />}
    </Stack>
  );

  return (
    <EditableField
      value={value}
      onSave={onSave}
      renderView={renderView}
      renderEdit={renderEdit}
      fieldName={label}
    />
  );
};

export default EditableCurrencyInput;
```

**Step 3: Commit**

```bash
git add src/components/sections/crm/deal-details/deal-information/EditableCurrencyInput.jsx
git commit -m "feat(ui): add EditableCurrencyInput component

- Currency input for Budget Forecast field
- Auto-save on blur or Enter key
- Shows formatted currency in view mode

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: EditablePercentageInput Component

**Agent:** react-mui-frontend-engineer

**Files:**
- Create: `src/components/sections/crm/deal-details/deal-information/EditablePercentageInput.jsx`

**Step 1: Create EditablePercentageInput component**

Create `src/components/sections/crm/deal-details/deal-information/EditablePercentageInput.jsx`:

```javascript
import FilledInput from '@mui/material/FilledInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconifyIcon from 'components/base/IconifyIcon';
import EditableField from './EditableField';

const EditablePercentageInput = ({ value, onSave, label }) => {
  const renderView = (currentValue, handleEdit) => (
    <Stack
      direction="row"
      gap={1}
      onClick={handleEdit}
      sx={{
        cursor: 'pointer',
        p: 1,
        borderRadius: 1,
        '&:hover': {
          bgcolor: 'action.hover',
          '& .edit-icon': { opacity: 1 }
        }
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
        {currentValue !== null && currentValue !== undefined
          ? `${currentValue}%`
          : 'Click to set...'}
      </Typography>
      <IconifyIcon
        icon="material-symbols:edit-outline"
        className="edit-icon"
        sx={{ fontSize: 16, opacity: 0, transition: 'opacity 0.2s' }}
      />
    </Stack>
  );

  const renderEdit = (editValue, setEditValue, handleSave, handleCancel, isSaving) => (
    <Stack direction="row" gap={1} alignItems="flex-start">
      <FormControl variant="filled" fullWidth>
        <InputLabel>{label}</InputLabel>
        <FilledInput
          type="number"
          autoFocus
          value={editValue || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            setEditValue(Math.min(100, Math.max(0, val))); // Clamp 0-100
          }}
          onBlur={() => handleSave(editValue)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleCancel();
            } else if (e.key === 'Enter') {
              handleSave(editValue);
            }
          }}
          endAdornment={<InputAdornment position="end">%</InputAdornment>}
          disabled={isSaving}
          inputProps={{ min: 0, max: 100, step: 1 }}
        />
      </FormControl>
      {isSaving && <CircularProgress size={20} sx={{ mt: 2 }} />}
    </Stack>
  );

  return (
    <EditableField
      value={value}
      onSave={onSave}
      renderView={renderView}
      renderEdit={renderEdit}
      fieldName={label}
    />
  );
};

export default EditablePercentageInput;
```

**Step 2: Commit**

```bash
git add src/components/sections/crm/deal-details/deal-information/EditablePercentageInput.jsx
git commit -m "feat(ui): add EditablePercentageInput component

- Percentage input for Deal Probability field
- Auto-clamps to 0-100 range
- Auto-save on blur or Enter key

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Wire DealInformation Component

**Agent:** react-mui-frontend-engineer

**Files:**
- Modify: `src/components/sections/crm/deal-details/deal-information/index.jsx`

**Step 1: Read current DealInformation component**

Read `src/components/sections/crm/deal-details/deal-information/index.jsx` to understand current structure.

**Step 2: Import editable components**

Add imports at top of `src/components/sections/crm/deal-details/deal-information/index.jsx`:

```javascript
import { useSnackbar } from 'notistack';
import EditableTextField from './EditableTextField';
import EditableDatePicker from './EditableDatePicker';
import EditableSelect from './EditableSelect';
import EditableCurrencyInput from './EditableCurrencyInput';
import EditablePercentageInput from './EditablePercentageInput';
```

**Step 3: Add useCRMDealApi hook**

Modify component to accept dealId prop and use hook:

```javascript
const DealInformation = ({ dealId }) => {
  const { deal, updateDeal, isLoading } = useCRMDealApi(dealId);
  const { enqueueSnackbar } = useSnackbar();

  if (isLoading) return <CircularProgress />;
  if (!deal) return <Typography>Deal not found</Typography>;

  const handleFieldUpdate = async (field, value) => {
    try {
      await updateDeal({ [field]: value });
      enqueueSnackbar('Deal updated', { variant: 'success', autoHideDuration: 2000 });
    } catch (error) {
      enqueueSnackbar('Failed to update deal', { variant: 'error' });
      throw error; // Re-throw for EditableField to handle rollback
    }
  };

  // ... rest of component
```

**Step 4: Replace read-only fields with editable components**

Replace static Typography fields with editable components:

```javascript
// Deal Details (description)
<EditableTextField
  value={deal.description}
  onSave={(value) => handleFieldUpdate('description', value)}
  label="Deal Details"
  multiline
  rows={3}
/>

// Current Stage
<EditableSelect
  value={deal.stage}
  onSave={(value) => handleFieldUpdate('stage', value)}
  label="Current Stage"
  options={[
    { value: 'lead', label: 'Lead' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'proposal', label: 'Proposal' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' }
  ]}
  chipColor="primary"
/>

// Closing Date
<EditableDatePicker
  value={deal.close_date}
  onSave={(value) => handleFieldUpdate('close_date', value)}
  label="Closing Date"
/>

// Budget Forecast
<EditableCurrencyInput
  value={deal.amount}
  onSave={(value) => handleFieldUpdate('amount', value)}
  label="Budget Forecast"
/>

// Forecast Category
<EditableSelect
  value={deal.forecast_category}
  onSave={(value) => handleFieldUpdate('forecast_category', value)}
  label="Forecast Category"
  options={[
    { value: 'best_case', label: 'Best Case' },
    { value: 'commit', label: 'Commit' },
    { value: 'pipeline', label: 'Pipeline' },
    { value: 'omitted', label: 'Omitted' }
  ]}
/>

// Deal Probability
<EditablePercentageInput
  value={deal.probability}
  onSave={(value) => handleFieldUpdate('probability', value)}
  label="Deal Probability"
/>
```

**Step 5: Keep read-only fields as static**

Ensure Created By and Create Date remain read-only Typography components:

```javascript
// Created By (read-only)
<Typography variant="body2" color="text.secondary">
  {deal.created_by?.name || 'Unknown'}
</Typography>

// Create Date (read-only)
<Typography variant="body2" color="text.secondary">
  {dayjs(deal.create_date).format('MMM D, YYYY')}
</Typography>
```

**Step 6: Commit**

```bash
git add src/components/sections/crm/deal-details/deal-information/index.jsx
git commit -m "feat(ui): wire editable components to DealInformation

- Replaced read-only fields with editable components
- Integrated useCRMDealApi hook for updates
- Added toast notifications for success/error
- Maintained read-only fields for audit trail

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: E2E Tests for Inline Editing

**Agent:** playwright-tester

**Files:**
- Create: `tests/e2e/deal-details-inline-editing.spec.ts`

**Step 1: Create E2E test suite**

Create `tests/e2e/deal-details-inline-editing.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Deal Details Inline Editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/apps/crm/deal-details/test-deal-id');
    await page.waitForLoadState('networkidle');
  });

  test('should edit Deal Details description', async ({ page }) => {
    const field = page.locator('[data-testid="deal-description"]');
    await field.click();

    const input = page.locator('textarea[name="description"]');
    await input.fill('Updated deal description');
    await page.click('body'); // Blur to trigger save

    await expect(page.locator('text=Deal updated')).toBeVisible();
    await expect(field).toContainText('Updated deal description');
  });

  test('should edit Current Stage', async ({ page }) => {
    const field = page.locator('[data-testid="deal-stage"]');
    await field.click();

    await page.selectOption('select[name="stage"]', 'proposal');

    await expect(page.locator('text=Deal updated')).toBeVisible();
    await expect(field).toContainText('Proposal');
  });

  test('should edit Closing Date', async ({ page }) => {
    const field = page.locator('[data-testid="deal-closing-date"]');
    await field.click();

    await page.fill('input[name="close_date"]', '04/15/2026');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=Deal updated')).toBeVisible();
    await expect(field).toContainText('Apr 15, 2026');
  });

  test('should edit Budget Forecast', async ({ page }) => {
    const field = page.locator('[data-testid="deal-amount"]');
    await field.click();

    const input = page.locator('input[name="amount"]');
    await input.fill('250000');
    await page.click('body'); // Blur to trigger save

    await expect(page.locator('text=Deal updated')).toBeVisible();
    await expect(field).toContainText('$250,000');
  });

  test('should edit Forecast Category', async ({ page }) => {
    const field = page.locator('[data-testid="deal-forecast-category"]');
    await field.click();

    await page.selectOption('select[name="forecast_category"]', 'commit');

    await expect(page.locator('text=Deal updated')).toBeVisible();
    await expect(field).toContainText('Commit');
  });

  test('should edit Deal Probability', async ({ page }) => {
    const field = page.locator('[data-testid="deal-probability"]');
    await field.click();

    const input = page.locator('input[name="probability"]');
    await input.fill('85');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=Deal updated')).toBeVisible();
    await expect(field).toContainText('85%');
  });

  test('should cancel edit on ESC key', async ({ page }) => {
    const field = page.locator('[data-testid="deal-description"]');
    const originalText = await field.textContent();

    await field.click();
    await page.fill('textarea[name="description"]', 'Temporary text');
    await page.keyboard.press('Escape');

    await expect(field).toContainText(originalText);
  });

  test('should show error and revert on API failure', async ({ page }) => {
    // Mock API to fail
    await page.route('/api/crm/deals/*', route => route.abort());

    const field = page.locator('[data-testid="deal-amount"]');
    const originalText = await field.textContent();

    await field.click();
    await page.fill('input[name="amount"]', '999999');
    await page.click('body');

    await expect(page.locator('text=Failed to update deal')).toBeVisible();
    await expect(field).toContainText(originalText);
  });

  test('should show loading state during save', async ({ page }) => {
    const field = page.locator('[data-testid="deal-description"]');
    await field.click();

    await page.fill('textarea[name="description"]', 'New description');
    await page.click('body');

    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('should not edit read-only Created By field', async ({ page }) => {
    const field = page.locator('[data-testid="deal-created-by"]');
    await expect(field).not.toHaveAttribute('data-editable');
  });

  test('should not edit read-only Create Date field', async ({ page }) => {
    const field = page.locator('[data-testid="deal-create-date"]');
    await expect(field).not.toHaveAttribute('data-editable');
  });
});
```

**Step 2: Run E2E tests**

Run: `npx playwright test tests/e2e/deal-details-inline-editing.spec.ts`
Expected: PASS (all tests)

**Step 3: Fix any failing tests**

If tests fail, debug and fix issues in components or API handler.

**Step 4: Commit**

```bash
git add tests/e2e/deal-details-inline-editing.spec.ts
git commit -m "test: add E2E tests for deal details inline editing

- Tests for all editable fields (description, stage, closing date, amount, forecast category, probability)
- Tests for cancel on ESC, error handling, loading states
- Tests for read-only fields (created by, create date)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Final Verification

**Step 1: Run full test suite**

Run: `npx playwright test`
Expected: PASS (all tests)

**Step 2: Run lint**

Run: `npm run lint`
Expected: No errors

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Manual testing**

1. Start dev server: `npm run dev`
2. Navigate to `/apps/crm/deal-details/[test-deal-id]`
3. Test each editable field:
   - Click field → enters edit mode
   - Blur/Enter → saves and shows success toast
   - ESC → cancels edit
   - Invalid value → shows error toast and reverts
4. Verify read-only fields cannot be edited

**Step 5: Commit verification**

```bash
git add .
git commit -m "chore: final verification for deal details inline editing

- All E2E tests passing
- Lint passing
- Build successful
- Manual testing confirmed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria Checklist

- [ ] All editable fields can be edited inline
- [ ] Changes auto-save on blur
- [ ] Loading states visible during save
- [ ] Error states revert to original value
- [ ] Toast notifications for success/error
- [ ] Read-only fields remain non-editable
- [ ] ESC key cancels edits
- [ ] Enter key saves (for text fields)
- [ ] All E2E tests passing
- [ ] No console errors
- [ ] Lint passing
- [ ] Build successful

---

## Reference Documentation

**Design Document:** `docs/plans/2026-01-31-deal-details-inline-editing-design.md`

**Aurora Component Sources:**
- `/home/pierce/piercedesk6/template-aurora/src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`
- `/home/pierce/piercedesk6/template-aurora/src/components/sections/crm/add-contact/steps/`

**Key MUI Components:**
- TextField (variant="filled")
- FilledInput with InputAdornment
- DatePicker (@mui/x-date-pickers)
- Select with FormControl
- Chip (variant="soft")
- Snackbar (via notistack)
- CircularProgress

**Related Skills:**
- @superpowers:test-driven-development
- @superpowers:verification-before-completion
- @superpowers:code-review
