/**
 * Unit tests for useContactApi SWR hooks using REAL Supabase data
 *
 * This test file demonstrates the pattern for testing with real Supabase
 * instead of mocks. It uses real seeded data from the database.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useLinkContactToAccount, useUnlinkContactFromAccount, useContacts } from '../useContactApi';
import {
  getAuthenticatedSupabaseClient,
  getTestData,
  createTestData,
  cleanupTestData,
  getTestOrganizationId,
} from '../../../test-utils/supabase-test-helpers';

describe('useContactApi with Real Supabase', () => {
  let organizationId;
  let testAccount;
  let testContact;

  beforeAll(async () => {
    // Get organization ID for test user
    organizationId = await getTestOrganizationId('singleOrg');

    // Sign in test user
    await getAuthenticatedSupabaseClient('singleOrg');
  });

  beforeEach(async () => {
    const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');

    // Create test account
    const [account] = await createTestData('accounts', {
      name: 'Test Account for Contact Linking',
      organization_id: organizationId,
    });
    testAccount = account;

    // Create test contact
    const [contact] = await createTestData('contacts', {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe.test@example.com',
      organization_id: organizationId,
    });
    testContact = contact;
  });

  afterEach(async () => {
    // Clean up test data
    if (testContact) {
      await cleanupTestData('contacts', { id: testContact.id });
    }
    if (testAccount) {
      await cleanupTestData('accounts', { id: testAccount.id });
    }
  });

  describe('useLinkContactToAccount', () => {
    test('links contact to account with role parameter using real Supabase', async () => {
      const { result } = renderHook(() => useLinkContactToAccount());

      const role = 'Decision Maker';

      // Call the mutation with real IDs
      const linkedContact = await result.current.trigger({
        contactId: testContact.id,
        accountId: testAccount.id,
        role,
      });

      // Verify the contact was linked in Supabase
      const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');
      const { data: contact } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', testContact.id)
        .single();

      // Assertions against real data
      expect(contact.account_id).toBe(testAccount.id);
      expect(contact.role).toBe(role);
      expect(linkedContact.id).toBe(testContact.id);
      expect(linkedContact.account_id).toBe(testAccount.id);
    });

    test('throws error when contact not found in Supabase', async () => {
      const { result } = renderHook(() => useLinkContactToAccount());

      // Use a non-existent UUID
      await expect(
        result.current.trigger({
          contactId: '00000000-0000-0000-0000-000000000000',
          accountId: testAccount.id,
          role: 'Primary Contact',
        })
      ).rejects.toThrow();
    });

    test('supports different role values with real database', async () => {
      const { result } = renderHook(() => useLinkContactToAccount());

      const roles = ['Decision Maker', 'Primary Contact', 'Technical Contact'];

      for (const role of roles) {
        // Link with different roles
        const linkedContact = await result.current.trigger({
          contactId: testContact.id,
          accountId: testAccount.id,
          role,
        });

        expect(linkedContact.role).toBe(role);

        // Verify in database
        const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');
        const { data: contact } = await supabase
          .from('contacts')
          .select('role')
          .eq('id', testContact.id)
          .single();

        expect(contact.role).toBe(role);
      }
    });
  });

  describe('useUnlinkContactFromAccount', () => {
    beforeEach(async () => {
      // Link contact to account first
      const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');
      await supabase
        .from('contacts')
        .update({
          account_id: testAccount.id,
          role: 'Primary Contact',
        })
        .eq('id', testContact.id);
    });

    test('unlinks contact from account using real Supabase', async () => {
      const { result } = renderHook(() => useUnlinkContactFromAccount());

      const unlinkedContact = await result.current.trigger({
        contactId: testContact.id,
      });

      // Verify contact was unlinked in database
      const { supabase } = await getAuthenticatedSupabaseClient('singleOrg');
      const { data: contact } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', testContact.id)
        .single();

      expect(contact.account_id).toBeNull();
      expect(contact.role).toBeNull();
      expect(unlinkedContact.account_id).toBeNull();
    });
  });

  describe('useContacts', () => {
    test('fetches real contacts from Supabase', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      // Should include our test contact
      const contacts = result.current.data;
      expect(contacts).toBeInstanceOf(Array);

      // Find our test contact
      const ourContact = contacts.find(c => c.id === testContact.id);
      expect(ourContact).toBeDefined();
      expect(ourContact.first_name).toBe('John');
      expect(ourContact.last_name).toBe('Doe');
      expect(ourContact.organization_id).toBe(organizationId);
    });

    test('respects RLS policies - only returns organization contacts', async () => {
      const { result } = renderHook(() => useContacts());

      await waitFor(() => {
        expect(result.current.data).toBeDefined();
      });

      const contacts = result.current.data;

      // All contacts should belong to the test user's organization
      contacts.forEach(contact => {
        expect(contact.organization_id).toBe(organizationId);
      });
    });
  });
});
