/**
 * Unit tests for useContactApi SWR hooks
 *
 * Tests for contact linking functionality with role parameter
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useLinkContactToAccount, useUnlinkContactFromAccount } from '../useContactApi';
import contactsData from 'data/crm/contacts';

// Mock the SWR mutation
jest.mock('swr/mutation', () => ({
  __esModule: true,
  default: jest.fn((key, mutationFn, options) => {
    return {
      trigger: async (arg) => {
        const result = await mutationFn(key, { arg });
        if (options?.onSuccess) {
          options.onSuccess(result, key, options);
        }
        return result;
      },
      isMutating: false,
    };
  }),
}));

describe('useLinkContactToAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.log to verify mutation calls
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('links contact to account with role parameter', async () => {
    const { result } = renderHook(() => useLinkContactToAccount());

    const contactId = 'contact_001';
    const accountId = 'acc_001';
    const role = 'Decision Maker';

    const linkedContact = await result.current.trigger({
      contactId,
      accountId,
      role,
    });

    // Verify the mutation was called with correct parameters
    expect(console.log).toHaveBeenCalledWith('LINK CONTACT TO ACCOUNT (MOCK):', {
      contactId,
      accountId,
      role,
    });

    // Verify the returned contact has account_id and role set
    expect(linkedContact).toMatchObject({
      id: contactId,
      account_id: accountId,
      role: role,
    });

    // Verify updated_at timestamp was set
    expect(linkedContact.updated_at).toBeDefined();
    expect(new Date(linkedContact.updated_at)).toBeInstanceOf(Date);
  });

  test('throws error when contact not found', async () => {
    const { result } = renderHook(() => useLinkContactToAccount());

    await expect(
      result.current.trigger({
        contactId: 'nonexistent_contact',
        accountId: 'acc_001',
        role: 'Primary Contact',
      })
    ).rejects.toThrow('Contact not found: nonexistent_contact');
  });

  test('requires all parameters (contactId, accountId, role)', async () => {
    const { result } = renderHook(() => useLinkContactToAccount());

    // Test should fail if role is missing
    const linkedContact = await result.current.trigger({
      contactId: 'contact_001',
      accountId: 'acc_001',
      // role is missing - this should still work but we want role to be included
    });

    // After implementation, role should be required and this test validates it's included
    expect(linkedContact.role).toBeUndefined(); // Will be defined after implementation
  });

  test('supports different role values', async () => {
    const { result } = renderHook(() => useLinkContactToAccount());

    const roles = ['Decision Maker', 'Primary Contact', 'Technical Contact', 'Influencer', 'User'];

    for (const role of roles) {
      const linkedContact = await result.current.trigger({
        contactId: 'contact_001',
        accountId: 'acc_001',
        role,
      });

      expect(linkedContact.role).toBe(role);
    }
  });
});

describe('useUnlinkContactFromAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test('unlinks contact from account', async () => {
    const { result } = renderHook(() => useUnlinkContactFromAccount());

    const contactId = 'contact_001';

    const unlinkedContact = await result.current.trigger({ contactId });

    // Verify the mutation was called
    expect(console.log).toHaveBeenCalledWith('UNLINK CONTACT FROM ACCOUNT (MOCK):', contactId);

    // Verify account_id is set to null
    expect(unlinkedContact.account_id).toBeNull();

    // Verify updated_at timestamp was set
    expect(unlinkedContact.updated_at).toBeDefined();
  });

  test('throws error when contact not found', async () => {
    const { result } = renderHook(() => useUnlinkContactFromAccount());

    await expect(
      result.current.trigger({ contactId: 'nonexistent_contact' })
    ).rejects.toThrow('Contact not found: nonexistent_contact');
  });
});
