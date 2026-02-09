# Deal Details Inline Editing - Design Document

**Date**: 2026-01-31
**Status**: Approved
**Author**: Claude (brainstorming session)

## Overview

Add inline editing capability to the Deal Details page (`apps/crm/deal-details`) to allow users to edit deal fields directly without modal dialogs. Fields will auto-save on blur with optimistic UI updates and error rollback.

## User Experience

### Editing Approach
- **Inline Editing**: Click field → edit → blur/Enter to save
- **Auto-save on blur**: Changes save automatically when user clicks away
- **Optimistic Updates**: UI updates immediately, reverts on error
- **Visual Feedback**: Edit icon on hover, loading spinner during save, toast notifications

### Editable vs Read-Only Fields

**Editable Fields:**
- Deal Details (description text)
- Current Stage (dropdown)
- Closing Date (date picker)
- Deal Owner (user selector)
- Collaborating Agents (multi-user selector)
- Budget Forecast (currency input)
- Forecast Category (dropdown)
- Deal Probability (percentage input)

**Read-Only Fields (Audit Trail):**
- Created By (Gerard P.)
- Create Date

## Architecture

### Component Layers

**1. EditableField Component (Generic Wrapper)**
- Manages edit/view state toggle
- Handles auto-save on blur behavior
- Shows loading indicator during save
- Handles error states with rollback
- Props: `value`, `onSave`, `renderView`, `renderEdit`, `fieldName`

**2. Field-Specific Components (Duplicated from Aurora)**
- `EditableTextField` - For Deal Details description
- `EditableDatePicker` - For Closing Date
- `EditableSelect` - For Current Stage, Forecast Category
- `EditableCurrencyInput` - For Budget Forecast
- `EditablePercentageInput` - For Deal Probability
- `EditableUserSelector` - For Deal Owner
- `EditableMultiUserSelect` - For Collaborating Agents

**3. DealInformation Component (Updated)**
- Replace current read-only display with editable fields
- Use `useCRMDealApi` hook's `updateDeal()` function
- Optimistic UI updates via SWR mutation
- Error handling with toast notifications

### Data Flow

```
User clicks field → EditableField shows edit UI → User edits → Blur event
→ EditableField calls onSave → DealInformation.updateDeal()
→ API PATCH /api/crm/deals/[id] → Database update
→ SWR revalidates → UI updates with new data
```

## Database Schema

### Existing Fields (Already in database)
- `description` - Maps to "Deal Details"
- `create_date` - Maps to "Create Date" (read-only)
- `stage` - Maps to "Current Stage"
- `close_date` - Maps to "Closing Date"
- `amount` - Maps to "Budget Forecast"
- `probability` - Maps to "Deal Probability"

### Missing Fields (Need to add)
- `forecast_category` - For "Forecast Category" (e.g., "Best Case", "Commit", "Pipeline")
- `created_by_id` - Foreign key to users table for "Created By" (read-only)

### Database Migration

```sql
-- Add missing columns to deals table
ALTER TABLE deals
  ADD COLUMN forecast_category TEXT,
  ADD COLUMN created_by_id UUID REFERENCES users(id);

-- Create index for foreign key
CREATE INDEX idx_deals_created_by ON deals(created_by_id);
```

## API Updates

### Endpoint
`PATCH /api/crm/deals/[id]`

### Request Body (Partial Updates)
```json
{
  "description": "Updated deal details...",
  "stage": "proposal",
  "close_date": "2026-04-01",
  "amount": 150000,
  "probability": 75,
  "forecast_category": "commit"
}
```

### Response
Returns complete deal object with all nested data (contact, company, collaborators).

### Validation
- `stage`: Enum validation (lead, qualified, proposal, negotiation, closed_won, closed_lost)
- `close_date`: Valid date format
- `amount`: Positive number
- `probability`: 0-100 range
- `forecast_category`: Enum validation (best_case, commit, pipeline, omitted)

## UI Component Details

### EditableField Component Pattern

**View Mode:**
- Displays current value using Aurora's existing components
- Shows subtle edit icon on hover (`material-symbols:edit-outline`)
- Cursor changes to pointer
- Light gray background on hover: `bgcolor: 'action.hover'`

**Edit Mode:**
- Replaces display with appropriate input component
- Auto-focuses input field
- Shows CircularProgress spinner during save
- ESC key cancels and reverts to view mode
- Enter key (for text fields) or blur triggers save

**Example: EditableTextField Component**
```javascript
// View Mode
<Stack direction="row" gap={1} onClick={() => setIsEditing(true)}>
  <Typography variant="body2" color="text.secondary">
    {value || 'Click to add...'}
  </Typography>
  <IconifyIcon icon="material-symbols:edit-outline"
    sx={{ fontSize: 16, opacity: 0, '&:hover': { opacity: 1 } }} />
</Stack>

// Edit Mode
<TextField
  variant="filled"
  multiline
  rows={3}
  autoFocus
  onBlur={handleSave}
  onKeyDown={(e) => e.key === 'Escape' && handleCancel()}
/>
```

### Error Handling & User Feedback

**Success State:**
- Brief toast notification: "Deal updated" (auto-dismiss in 2s)
- No disruptive modal
- Use `@mui/material/Snackbar` with success color

**Error State:**
- Revert field to original value
- Show error toast: "Failed to update deal. Please try again."
- Log error to console for debugging
- Keep field in edit mode with error message below input

**Loading State:**
- Show `CircularProgress` size="small" next to field
- Disable field during save
- Gray out other fields to prevent concurrent edits

## Implementation Plan

### Files to Create

**New Components:**
```
src/components/sections/crm/deal-details/deal-information/
  ├── EditableField.jsx          # Generic wrapper component
  ├── EditableTextField.jsx      # Multiline text editor
  ├── EditableDatePicker.jsx     # Date picker field
  ├── EditableSelect.jsx         # Dropdown selector
  ├── EditableCurrencyInput.jsx  # Budget input with $
  ├── EditablePercentageInput.jsx # Probability with %
  ├── EditableUserSelector.jsx   # Deal Owner selector
  └── EditableMultiUserSelect.jsx # Collaborators selector
```

### Files to Modify

- `src/components/sections/crm/deal-details/deal-information/index.jsx` - Replace read-only fields with editable components
- `src/app/api/crm/deals/[id]/route.js` - Add PATCH handler
- `src/services/swr/api-hooks/useCRMDealApi.js` - Already has `updateDeal()` function (no changes needed)

### Implementation Sequence

**1. Database Layer** (supabase-database-architect agent):
   - Add missing columns (forecast_category, created_by_id)
   - Update seed data with new fields
   - Test with existing RLS policies

**2. API Layer** (wiring-agent):
   - Enhance PATCH handler in `/api/crm/deals/[id]`
   - Add validation for each field type
   - Test API with Postman/curl

**3. UI Components** (react-mui-frontend-engineer):
   - Duplicate Aurora editable components from template-aurora
   - Wire to useCRMDealApi.updateDeal()
   - Add loading/error states
   - Implement keyboard shortcuts (ESC, Enter)

**4. Testing** (playwright-tester):
   - E2E tests for each field edit
   - Error handling scenarios
   - Concurrent edit prevention

## Success Criteria

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

## Technical Notes

### Aurora Component Sources

All editable components should be duplicated from:
- `/home/pierce/piercedesk6/template-aurora/src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx`
- `/home/pierce/piercedesk6/template-aurora/src/components/sections/crm/add-contact/steps/`

### MUI Components Used

- `TextField` with `variant="filled"`
- `FilledInput` with `InputAdornment` for currency/numbers
- `DatePicker` from `@mui/x-date-pickers`
- `Select` with `FormControl` for dropdowns
- `Autocomplete` for multi-select (collaborators)
- `Chip` variant="soft" for status/user fields
- `Snackbar` for notifications
- `CircularProgress` for loading states

### State Management

- Use SWR's built-in optimistic updates via `mutate()`
- No additional state management library needed
- Form validation via inline checks (no react-hook-form for inline editing)
