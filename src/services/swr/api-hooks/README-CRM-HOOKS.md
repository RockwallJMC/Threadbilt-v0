# CRM SWR Hooks - Quick Reference

**Phase 1.3 - Accounts & Contacts UI**

## Available Hooks

### Account Hooks (`useAccountApi.js`)

```javascript
import {
  useAccounts,
  useAccount,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from 'services/swr/api-hooks/useAccountApi';
```

#### Read Operations
```javascript
// All accounts
const { data: accounts, error, isLoading, mutate } = useAccounts();

// Single account
const { data: account, error, isLoading } = useAccount('acc_001');
```

#### Create
```javascript
const { trigger: createAccount, isMutating } = useCreateAccount();

const newAccount = await createAccount({
  name: 'Acme Corporation',
  industry: 'Technology',
  website: 'https://acme.com',
  phone: '+1 (555) 123-4567',
  billing_address: '123 Main St, San Francisco, CA 94105',
  shipping_address: '123 Main St, San Francisco, CA 94105',
  notes: 'New enterprise client',
});
```

#### Update
```javascript
const { trigger: updateAccount, isMutating } = useUpdateAccount();

await updateAccount({
  id: 'acc_001',
  updates: {
    name: 'Updated Name',
    industry: 'Healthcare',
    notes: 'Updated information',
  },
});
```

#### Delete
```javascript
const { trigger: deleteAccount, isMutating } = useDeleteAccount();

await deleteAccount({ id: 'acc_001' });
```

---

### Contact Hooks (`useContactApi.js`)

```javascript
import {
  useContacts,
  useContact,
  useAccountContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useLinkContactToAccount,
  useUnlinkContactFromAccount,
} from 'services/swr/api-hooks/useContactApi';
```

#### Read Operations
```javascript
// All contacts
const { data: contacts, error, isLoading } = useContacts();

// Single contact
const { data: contact, error, isLoading } = useContact('contact_001');

// Contacts for specific account
const { data: accountContacts, error, isLoading } = useAccountContacts('acc_001');
```

#### Create
```javascript
const { trigger: createContact, isMutating } = useCreateContact();

// Independent contact (no account)
const newContact = await createContact({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 987-6543',
  title: 'CEO',
  role: 'Decision Maker',
  linkedin_url: 'https://linkedin.com/in/johndoe',
  notes: 'Met at conference',
  account_id: null, // Independent contact
});

// Contact linked to account
const linkedContact = await createContact({
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane.smith@acme.com',
  phone: '+1 (555) 123-9999',
  title: 'CTO',
  role: 'Technical Contact',
  account_id: 'acc_001', // Linked to account
});
```

#### Update
```javascript
const { trigger: updateContact, isMutating } = useUpdateContact();

await updateContact({
  id: 'contact_001',
  updates: {
    title: 'VP of Engineering',
    phone: '+1 (555) 888-7777',
    notes: 'Promoted to VP',
  },
});
```

#### Delete
```javascript
const { trigger: deleteContact, isMutating } = useDeleteContact();

await deleteContact({ id: 'contact_001' });
```

#### Link/Unlink Operations
```javascript
// Link contact to account
const { trigger: linkContact, isMutating: isLinking } = useLinkContactToAccount();

await linkContact({
  contactId: 'contact_001',
  accountId: 'acc_001',
});

// Unlink contact from account (make independent)
const { trigger: unlinkContact, isMutating: isUnlinking } = useUnlinkContactFromAccount();

await unlinkContact({
  contactId: 'contact_001',
});
```

## Complete Component Example

```javascript
'use client';

import { useState } from 'react';
import {
  useAccounts,
  useCreateAccount,
} from 'services/swr/api-hooks/useAccountApi';
import {
  useAccountContacts,
  useLinkContactToAccount,
} from 'services/swr/api-hooks/useContactApi';

export default function AccountsManager() {
  const { data: accounts, error, isLoading } = useAccounts();
  const { trigger: createAccount, isMutating: isCreating } = useCreateAccount();
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Fetch contacts for selected account
  const { data: accountContacts } = useAccountContacts(selectedAccount);

  const handleCreateAccount = async () => {
    try {
      const newAccount = await createAccount({
        name: 'New Company',
        industry: 'Technology',
        website: 'https://example.com',
        phone: '+1 (555) 000-0000',
      });
      console.log('Created:', newAccount);
    } catch (err) {
      console.error('Create failed:', err);
    }
  };

  if (isLoading) return <div>Loading accounts...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Accounts ({accounts?.length || 0})</h1>

      <button onClick={handleCreateAccount} disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Account'}
      </button>

      <ul>
        {accounts?.map((account) => (
          <li key={account.id} onClick={() => setSelectedAccount(account.id)}>
            {account.name} - {account.industry}
          </li>
        ))}
      </ul>

      {selectedAccount && (
        <div>
          <h2>Contacts ({accountContacts?.length || 0})</h2>
          <ul>
            {accountContacts?.map((contact) => (
              <li key={contact.id}>
                {contact.first_name} {contact.last_name} - {contact.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

## Current Implementation (Days 1-2)

### Mock Data
All hooks currently use mock data from:
- `src/data/crm/accounts.js` (12 accounts)
- `src/data/crm/contacts.js` (20 contacts)

### Observable Mutations
All mutations log to console:
```
CREATE ACCOUNT (MOCK): { name: 'Acme Corp', ... }
UPDATE ACCOUNT (MOCK): { id: 'acc_001', updates: { ... } }
DELETE ACCOUNT (MOCK): acc_001
LINK CONTACT TO ACCOUNT (MOCK): { contactId: 'contact_001', accountId: 'acc_001' }
```

### Data Structure

#### Account Object
```javascript
{
  id: 'acc_001',
  organization_id: 'org_001',
  name: 'TechVision Solutions Inc.',
  industry: 'Technology',
  website: 'https://techvisionsolutions.com',
  phone: '+1 (415) 555-0123',
  billing_address: '350 Mission Street, Suite 200, San Francisco, CA 94105',
  shipping_address: '350 Mission Street, Suite 200, San Francisco, CA 94105',
  notes: 'Enterprise software development company.',
  created_at: '2022-03-15T10:30:00Z',
  updated_at: '2025-01-15T14:22:00Z',
}
```

#### Contact Object
```javascript
{
  id: 'contact_001',
  organization_id: 'org_001',
  account_id: 'acc_001', // null for independent contacts
  first_name: 'Sarah',
  last_name: 'Johnson',
  email: 'sarah.johnson@example.com',
  phone: '+1 (415) 555-0124',
  title: 'Chief Technology Officer',
  role: 'Decision Maker', // 'Decision Maker', 'Influencer', 'Technical Contact', 'User', 'Primary Contact'
  linkedin_url: 'https://linkedin.com/in/sarahjohnson',
  notes: 'Primary technical contact.',
  created_at: '2022-03-15T10:30:00Z',
  updated_at: '2025-01-15T14:22:00Z',
}
```

## Migration to Supabase (Day 4)

After Phase 1.2 completes:
1. Uncomment Supabase client imports in both files
2. Replace mock fetcher implementations with commented Supabase queries
3. Remove mock data imports
4. Remove console.log statements
5. Test with real authentication and RLS policies

All hooks already have Supabase implementation commented and ready to activate.

## Error Handling

All hooks throw errors for:
- Authentication failures (after Supabase migration)
- Not found scenarios
- Database errors (after Supabase migration)

Handle errors in components:
```javascript
const { data, error, isLoading } = useAccounts();

if (error) {
  // Show error message
  return <div>Error: {error.message}</div>;
}
```

## Cache Revalidation

Mutations automatically trigger revalidation:
- Creating/updating/deleting accounts → revalidates `'accounts'` cache
- Creating/updating/deleting contacts → revalidates `'contacts'` cache
- Linking/unlinking contacts → revalidates both `'contacts'` and `['account-contacts', accountId]` caches

Manual revalidation:
```javascript
const { data, mutate } = useAccounts();

// Force refresh
await mutate();
```

## Documentation

- **Implementation Summary:** `CRM-HOOKS-SUMMARY.md`
- **Verification Evidence:** `CRM-HOOKS-VERIFICATION.md`
- **Source Files:**
  - `useAccountApi.js` (5 hooks, 352 lines)
  - `useContactApi.js` (8 hooks, 585 lines)

---

**Status:** ✅ Ready for use (mock data)
**Migration:** Day 4 (Supabase)
