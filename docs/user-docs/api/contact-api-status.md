# Contact API Status

## Task 1: Verification Results

**Date:** 2026-01-31
**Verified by:** Agent orchestrator

---

## Summary

Both the Contacts API endpoint and SWR hook **already exist** in the codebase. However, the current implementation **only supports creating and updating individual contacts**. There is **no GET endpoint** for listing/fetching all contacts for use in a contact selector dropdown.

---

## File Status

### 1. Contacts API Route
- **Path:** `/home/pierce/piercedesk6/src/app/api/crm/contacts/route.js`
- **Status:** ✅ EXISTS
- **File size:** 9,284 bytes
- **Last modified:** 2026-01-31 02:22

**Available endpoints:**
- `POST /api/crm/contacts` - Create new contact
  - Accepts: `{ personalInfo, companyInfo, leadInfo }`
  - Returns: Contact object with account join
  - Features:
    - Multi-tenant isolation (organization_id)
    - Duplicate email checking
    - Account creation/linking
    - Comprehensive validation

**Missing endpoints:**
- `GET /api/crm/contacts` - **NOT IMPLEMENTED** (needed for contact list/selector)

### 2. Contacts SWR Hook
- **Path:** `/home/pierce/piercedesk6/src/services/swr/api-hooks/useCRMContactApi.js`
- **Status:** ✅ EXISTS
- **File size:** 4,398 bytes
- **Last modified:** 2026-01-31 06:48

**Available hooks:**
- `useCRMContact(contactId)` - Fetch single contact by ID
- `useUpdateCRMContact()` - Update existing contact
- `useCreateCRMContact()` - Create new contact

**Missing hooks:**
- `useContacts()` or similar - **NOT IMPLEMENTED** (needed for contact list/selector)

---

## Comparison with Deals API Pattern

The Deals API follows the same architecture pattern:

**Deals API** (`/src/app/api/crm/deals/route.js`):
- ✅ `GET /api/crm/deals` (line 77) - Fetch all deals grouped by stage
- ✅ `POST /api/crm/deals` - Create new deal

**Deals SWR Hook** (`/src/services/swr/api-hooks/useCRMDealsApi.js`):
- ✅ `useDeals()` - Fetch all deals
- ✅ `useCreateDeal()` - Create new deal
- ✅ `useUpdateDeal()` - Update existing deal

**Contacts API** (current state):
- ❌ No `GET /api/crm/contacts` endpoint
- ✅ `POST /api/crm/contacts` - Create new contact

**Contacts SWR Hook** (current state):
- ❌ No `useContacts()` hook
- ✅ `useCRMContact(id)` - Fetch single contact
- ✅ `useCreateCRMContact()` - Create new contact
- ✅ `useUpdateCRMContact()` - Update existing contact

---

## Required Implementation for Create Deal Modal

To add contact selection functionality to the Create Deal modal, we need:

1. **API Endpoint:** `GET /api/crm/contacts`
   - Location: `/home/pierce/piercedesk6/src/app/api/crm/contacts/route.js`
   - Implementation: Add `export async function GET(request)` handler
   - Features needed:
     - Fetch all contacts for current user's organization
     - Include account/company join data
     - Filter by organization_id (multi-tenant isolation)
     - Return array format suitable for Autocomplete component

2. **SWR Hook:** `useContacts()`
   - Location: `/home/pierce/piercedesk6/src/services/swr/api-hooks/useCRMContactApi.js`
   - Implementation: Add fetcher + hook following `useDeals()` pattern
   - Usage: Fetch contacts list for dropdown/selector

---

## Next Steps

### Task 2: Create GET endpoint for contacts
- [ ] Add `GET` handler to `/src/app/api/crm/contacts/route.js`
- [ ] Follow same pattern as deals API (see `GET` at line 77 of deals route)
- [ ] Include account join for company name display
- [ ] Filter by organization_id
- [ ] Return array of contacts

### Task 3: Create useContacts() SWR hook
- [ ] Add `useContacts()` hook to `/src/services/swr/api-hooks/useCRMContactApi.js`
- [ ] Follow same pattern as `useDeals()` hook
- [ ] Use key: `'crm-contacts'`
- [ ] Configure SWR options (suspense: false, revalidateOnMount: true, etc.)

### Task 4: Wire Create Deal modal
- [ ] Add contact selector to Create Deal modal form
- [ ] Use `useContacts()` hook to populate dropdown
- [ ] Map selected contact to `contact_id` field
- [ ] Update form validation

---

## Architecture Notes

**Multi-tenant isolation:**
All CRM endpoints filter by `organization_id` from the user's membership. This ensures users only see contacts from their own organization.

**Data relationships:**
- Contacts → Accounts (many-to-one)
- Deals → Contacts (many-to-one)
- Deals → Accounts (many-to-one)

**Existing patterns to follow:**
- Use `createApiClient(request)` for Supabase client
- Validate JWT with `supabase.auth.getUser()`
- Get organization_id from `organization_members` table
- Use `.select()` with joins for related data
- Return appropriate HTTP status codes (200, 400, 401, 500)

---

## Conclusion

**Contacts API route:** EXISTS (POST only)
**Contacts SWR hook:** EXISTS (single contact + mutations only)
**Next step:** CREATE GET endpoint and list hook (Tasks 2 & 3)

The foundation is solid. We just need to add the list functionality following the existing deals API pattern.
