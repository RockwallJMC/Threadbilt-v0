# CRM SWR Hooks Implementation Summary

**Created:** 2026-01-28
**Phase:** 1.3 - Accounts & Contacts UI (Days 1-2)
**Status:** Complete - Mock Data Implementation

## Files Created

### 1. useAccountApi.js
**Location:** `src/services/swr/api-hooks/useAccountApi.js`
**Size:** 9.6 KB
**Hooks:** 5 total

#### Fetcher Hooks (2)
- `useAccounts(config)` - Fetch all accounts (RLS filtered by organization_id)
- `useAccount(id, config)` - Fetch single account by ID

#### Mutation Hooks (3)
- `useCreateAccount()` - Create new account
- `useUpdateAccount()` - Update existing account
- `useDeleteAccount()` - Delete account

### 2. useContactApi.js
**Location:** `src/services/swr/api-hooks/useContactApi.js`
**Size:** 17 KB
**Hooks:** 8 total

#### Fetcher Hooks (3)
- `useContacts(config)` - Fetch all contacts
- `useContact(id, config)` - Fetch single contact by ID
- `useAccountContacts(accountId, config)` - Fetch contacts for specific account

#### Mutation Hooks (5)
- `useCreateContact()` - Create new contact
- `useUpdateContact()` - Update existing contact
- `useDeleteContact()` - Delete contact
- `useLinkContactToAccount()` - Link contact to account (update account_id)
- `useUnlinkContactFromAccount()` - Unlink contact (set account_id = null)

## Implementation Approach

### Mock Data (Days 1-2)
All hooks currently use mock data from:
- `src/data/crm/accounts.js` (12 accounts)
- `src/data/crm/contacts.js` (20 contacts, ~30% independent)

### Mock Fetcher Behavior
- Simulates async operations (100-200ms delay)
- Returns filtered/found data from mock arrays
- Throws errors for not-found scenarios
- Logs mutations to console for visibility

### Mock Mutation Behavior
- Creates optimistic responses with generated IDs
- Simulates updates by merging with existing data
- Validates existence before operations
- Returns data in expected format

## Pattern Compliance

### Follows useOrganizationApi.js Structure
✅ 'use client' directive
✅ useSWR for fetcher hooks
✅ useSWRMutation for mutation hooks
✅ Proper error handling
✅ SWR cache configuration
✅ onSuccess callbacks for revalidation
✅ Comprehensive JSDoc comments
✅ Example usage in docstrings

### TODO Markers for Supabase Migration
All fetcher and mutation functions include:
- Commented-out Supabase implementation
- Clear `// TODO: Replace with Supabase query after Phase 1.2 complete`
- Mock implementation clearly marked
- Ready for Day 4 transition

## Usage Examples

### Fetch Accounts
```javascript
import { useAccounts, useAccount } from 'services/swr/api-hooks/useAccountApi';

// All accounts
const { data: accounts, error, isLoading } = useAccounts();

// Single account
const { data: account } = useAccount('acc_001');
```

### Create/Update Account
```javascript
import { useCreateAccount, useUpdateAccount } from 'services/swr/api-hooks/useAccountApi';

// Create
const { trigger: createAccount, isMutating } = useCreateAccount();
const newAccount = await createAccount({
  name: 'Acme Corp',
  industry: 'Technology',
  website: 'https://acme.com',
  phone: '+1 (555) 123-4567',
});

// Update
const { trigger: updateAccount } = useUpdateAccount();
await updateAccount({
  id: 'acc_001',
  updates: { name: 'New Name', industry: 'Healthcare' }
});
```

### Fetch Contacts
```javascript
import {
  useContacts,
  useContact,
  useAccountContacts
} from 'services/swr/api-hooks/useContactApi';

// All contacts
const { data: contacts, error, isLoading } = useContacts();

// Single contact
const { data: contact } = useContact('contact_001');

// Account's contacts
const { data: accountContacts } = useAccountContacts('acc_001');
```

### Link/Unlink Contacts
```javascript
import {
  useLinkContactToAccount,
  useUnlinkContactFromAccount
} from 'services/swr/api-hooks/useContactApi';

// Link
const { trigger: linkContact } = useLinkContactToAccount();
await linkContact({
  contactId: 'contact_001',
  accountId: 'acc_001'
});

// Unlink
const { trigger: unlinkContact } = useUnlinkContactFromAccount();
await unlinkContact({ contactId: 'contact_001' });
```

## Quality Checks

### Linting
✅ Both files pass ESLint with zero warnings
```bash
npx eslint src/services/swr/api-hooks/useAccountApi.js \
           src/services/swr/api-hooks/useContactApi.js
```
**Result:** No errors or warnings

### Code Quality
✅ Consistent naming conventions
✅ Proper TypeScript/JSDoc comments
✅ Error handling for all operations
✅ Async/await patterns
✅ SWR cache key strategies

### Mock Data Integration
✅ Uses existing mock data files
✅ Simulates realistic delays
✅ Provides console logging for debugging
✅ Validates data existence
✅ Generates realistic IDs and timestamps

## Next Steps (Day 4)

### Migration to Supabase
1. Uncomment Supabase client imports
2. Replace mock fetcher implementations with Supabase queries
3. Update mutation functions to use Supabase
4. Test RLS policies with real authentication
5. Verify cache invalidation strategies
6. Remove mock data imports and console logs

### Cache Revalidation Strategy
- After account mutations → revalidate `'accounts'` key
- After contact mutations → revalidate `'contacts'` and `['account-contacts', accountId]` keys
- After linking/unlinking → revalidate both contact and account contact caches

### Key Supabase Patterns to Implement
```javascript
// Auth check
const { data: { user }, error: authError } = await supabase.auth.getUser();

// RLS-filtered query
const { data, error } = await supabase
  .from('accounts')
  .select('*')
  .order('created_at', { ascending: false });

// Insert with select
const { data, error } = await supabase
  .from('accounts')
  .insert([{ ...arg }])
  .select()
  .single();

// Update with filter
const { data, error } = await supabase
  .from('contacts')
  .update({ account_id: accountId, updated_at: new Date().toISOString() })
  .eq('id', contactId)
  .select()
  .single();
```

## Documentation References

- **Reference Pattern:** `src/services/swr/api-hooks/useOrganizationApi.js`
- **Mock Data:** `src/data/crm/accounts.js`, `src/data/crm/contacts.js`
- **SWR Documentation:** https://swr.vercel.app/
- **Supabase Client:** https://supabase.com/docs/reference/javascript/

## Testing Notes

### Manual Testing
All hooks can be tested in UI components by:
1. Importing the hooks
2. Observing console logs for mock mutations
3. Checking returned data structure
4. Verifying loading/error states

### Integration Testing (Future)
- Test with actual Supabase database
- Verify RLS policies apply correctly
- Test cache invalidation on mutations
- Verify optimistic updates work correctly

---

**Status:** ✅ Ready for UI component integration (Days 1-2)
**Migration:** ⏳ Scheduled for Day 4 after Phase 1.2 Supabase schema complete
