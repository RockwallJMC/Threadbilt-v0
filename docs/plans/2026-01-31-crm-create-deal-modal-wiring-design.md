# CRM Create Deal Modal - Database Wiring Design

**Date**: 2026-01-31
**Feature**: Wire Create Deal modal to database with full refactor
**Status**: Design Approved

## Overview

Wire the CRM Create Deal modal to persist deals to the database via the existing POST /api/crm/deals endpoint. This is a full refactor that addresses technical debt and improves UX.

## Current State

- Modal form is fully functional with 13 fields and Yup validation
- Form submission only updates local state (DealsContext)
- POST /api/crm/deals endpoint exists but is not connected
- `useCreateDeal()` SWR mutation hook exists but is unused
- Hardcoded client data with no contact selection
- Date formatting inconsistencies
- No error handling or success feedback

## Design

### 1. Data Flow Architecture

**Overall Flow:**
```
User fills form → Validation → Transform data → POST /api/crm/deals →
Optimistic update → Revalidate deals list → Show success message → Close modal
```

**Key Changes:**

1. **Contact Selection**: Replace the hardcoded `client` object with a new contact selector field:
   - Fetches contacts from new API endpoint `GET /api/crm/contacts`
   - Uses Autocomplete component (similar to collaborators field)
   - Stores selected contact's ID for API submission
   - Shows contact name, company, and email in dropdown

2. **Company/Contact Relationship**:
   - When user selects a contact, auto-populate company field based on contact's company
   - Keep company field editable in case contact has no company
   - Both selections send IDs to API

3. **API Integration Point**:
   - In CreateDealDialog's onSubmit handler, call `useCreateDeal().trigger()`
   - Transform form data to match API expectations:
     ```javascript
     {
       name: formData.name,
       stage: formData.stage,
       company_id: formData.company.id,
       contact_id: formData.contact.id,
       amount: formData.amount,
       priority: formData.priority,
       progress: 0,
       close_date: dayjs(formData.closeDate).toISOString()
     }
     ```

### 2. Validation Schema & Form Fields

**Updated Validation Schema:**

Remove unnecessary validations and align with API requirements:

```javascript
const validationSchema = Yup.object().shape({
  name: Yup.string().required('Deal name is required'),
  description: Yup.string(), // Optional
  pipeline: Yup.string(), // Optional
  stage: Yup.string().required('Stage is required'),
  amount: Yup.number().required('Amount is required').min(0, 'Amount must be positive'),
  createDate: Yup.date().required('Create date is required'),
  closeDate: Yup.date()
    .required('Close date is required')
    .min(Yup.ref('createDate'), 'Close date must be after create date'),
  owner: Yup.object().required('Deal owner is required'),
  priority: Yup.string().required('Priority is required'),
  company: Yup.object().required('Company is required'),
  contact: Yup.object().required('Contact is required'), // NEW - replaces client
  collaborators: Yup.array(), // Optional
});
```

**Form Field Changes:**

1. **Remove**: Hardcoded "client" field and default values
2. **Add**: Contact selector field (Autocomplete) positioned after company field
3. **Keep**: All other fields as-is

**Field Order:**
- Deal name, description, pipeline, stage
- Amount, create date, close date
- Deal owner, priority
- Company (existing)
- Contact (NEW - filtered by selected company if applicable)
- Collaborators

### 3. Loading States & UX Feedback

**Loading States:**

1. **Form Submission Loading**:
   - Disable all form fields when `isLoading` from `useCreateDeal()`
   - Disable "Create" button and show spinner/loading text: "Creating..."
   - Prevent modal close during submission

2. **Contact Data Loading**:
   - Show skeleton/loading in contact Autocomplete while fetching contacts
   - Graceful fallback if contact API fails

3. **Initial Data Loading**:
   - Companies and users already load from context/mock data
   - Future enhancement: fetch from API

**Success Feedback:**

1. **Toast Notification**: Show success message "Deal created successfully!" (use MUI Snackbar or existing toast system)
2. **Optimistic Update**: Immediately add deal to the Kanban board in the correct stage
3. **SWR Revalidation**: Call `mutate()` to refresh deals list from server
4. **Modal Behavior**: Close modal and reset form after successful creation

**Error Handling:**

1. **API Errors**: Display error message in toast: "Failed to create deal. Please try again."
2. **Validation Errors**: Show field-level errors (handled by react-hook-form)
3. **Network Errors**: Generic message with retry option
4. **Duplicate Deal Name**: Display error below Deal Name field using setError()

### 4. Date Formatting & Form Reset

**Date Formatting:**

1. **Form Storage**: Continue using dayjs objects in form state
2. **API Submission**: Transform to ISO strings:
   ```javascript
   close_date: dayjs(formData.closeDate).toISOString()
   ```
3. **Display**: Keep existing format "DD MMM, YYYY"

**Form Reset Logic:**

1. **On Success**:
   - Call `reset()` from react-hook-form to clear all fields
   - Reset to initial values (empty strings, current date for createDate)
   - Clear any error states

2. **On Cancel**: Reset form to prevent stale data when reopening

3. **On Reopen**: Pre-populate stage from selected Kanban column

**Field Error Integration:**

For duplicate name conflict:
```javascript
if (error.response?.data?.code === 'DUPLICATE_DEAL_NAME') {
  setError('name', {
    type: 'manual',
    message: 'A deal with this name already exists'
  });
}
```

**Owner Field:**

- Remove from validation initially since API uses JWT user_id
- OR map owner.id to "deal_owner_id" if API supports assignment (needs verification)

## Implementation Components

### Files to Modify:
1. `/src/components/sections/crm/deals/deal-card/CreateDealDialog.jsx` - Main modal component
2. `/src/services/swr/api-hooks/useCRMDealsApi.js` - Already has useCreateDeal hook
3. `/src/providers/DealsProvider.jsx` - May need optimistic update logic

### Files to Create:
1. `/src/app/api/crm/contacts/route.js` - GET endpoint for contacts
2. `/src/services/swr/api-hooks/useCRMContactApi.js` - SWR hook for contacts (if doesn't exist)

### Database Requirements:
- Contacts table must exist in Supabase (verify schema)
- May need to create contacts API endpoint and seed data

## Success Criteria

1. ✅ User can select a contact from dropdown
2. ✅ Company auto-populates when contact selected
3. ✅ Form submits to POST /api/crm/deals
4. ✅ Deal appears in correct Kanban stage immediately
5. ✅ Success toast displays
6. ✅ Form resets after creation
7. ✅ Duplicate name errors show below name field
8. ✅ Loading states prevent double submission
9. ✅ All validation matches API requirements

## Trade-offs

**Chosen Approach**: Full refactor
- ✅ Fixes technical debt
- ✅ Better UX with proper contact selection
- ✅ Aligned validation with API
- ❌ Takes longer than minimal fix
- ❌ Requires contact API endpoint creation

## Next Steps

1. Create a feature branch in this repo for isolated development (do **NOT** use git worktrees in this project)
2. Create detailed implementation plan
3. Implement in order:
   - Contact API endpoint (if needed)
   - Contact selector in modal
   - API integration with useCreateDeal
   - Error handling and UX feedback
   - Form reset logic
4. Test thoroughly
5. Create PR with verification evidence
