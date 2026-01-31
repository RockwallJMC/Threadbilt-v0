'use client';

import axiosInstance from 'services/axios/axiosInstance';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';

/**
 * Fetcher function for all contacts
 * Contacts are automatically filtered by organization_id server-side
 *
 * @returns {Promise<Array>} Array of contact objects with company joins
 */
const contactsFetcher = async () => {
  const response = await axiosInstance.get('/api/crm/contacts');
  return response;
};

/**
 * Hook to fetch all contacts for the current user
 * Contacts are automatically filtered by organization_id server-side
 *
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with contacts data
 *
 * @example
 * const { data: contacts, error, isLoading, mutate } = useContacts();
 * // contacts = [{ id, first_name, last_name, email, ..., company: { id, name, ... } }, ...]
 */
export const useContacts = (config) => {
  const swr = useSWR('crm-contacts', contactsFetcher, {
    suspense: false,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    ...config,
  });

  return swr;
};

/**
 * Fetcher function for a single contact by ID
 * Fetches contact with company join from API route
 *
 * @param {string} contactId - Contact ID
 * @returns {Promise<Object>} Contact object with company data
 */
const crmContactFetcher = async (contactId) => {
  try {
    const response = await axiosInstance.get(`/api/crm/contacts/${contactId}`);
    return response;
  } catch (error) {
    // Handle 404 gracefully - return null instead of throwing
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Hook to fetch a single contact by ID with company join
 * Handles 404 gracefully by returning null instead of error
 *
 * @param {string} contactId - Contact ID
 * @param {Object} config - SWR configuration options
 * @returns {Object} SWR response with contact data
 *
 * @example
 * const { data: contact, error, isLoading, mutate } = useCRMContact('contact_001');
 * // contact = { id, first_name, last_name, email, phone, ..., company: { id, name, ... } }
 * // contact = null if not found (404)
 */
export const useCRMContact = (contactId, config) => {
  const swr = useSWR(
    contactId ? ['crm-contact', contactId] : null,
    () => crmContactFetcher(contactId),
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
      ...config,
    },
  );

  return swr;
};

/**
 * Mutation function to update an existing contact
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {string} options.arg.id - Contact ID to update
 * @param {Object} options.arg.updates - Fields to update (first_name, last_name, email, phone, mobile, title, department)
 * @returns {Promise<Object>} Updated contact object with company join
 */
const updateCRMContactMutation = async (url, { arg }) => {
  const { id, updates } = arg;
  const response = await axiosInstance.patch(`/api/crm/contacts/${id}`, updates);
  return response;
};

/**
 * Hook to update an existing contact
 * Automatically revalidates the contact after update
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger: updateContact, isMutating } = useUpdateCRMContact();
 * const updatedContact = await updateContact({
 *   id: 'contact_001',
 *   updates: {
 *     first_name: 'Jane',
 *     title: 'Senior Director',
 *     phone: '+1 (555) 999-8888'
 *   }
 * });
 * // updatedContact = { id, first_name, last_name, ..., company: { ... } }
 */
export const useUpdateCRMContact = () => {
  const mutation = useSWRMutation('update-crm-contact', updateCRMContactMutation);

  return mutation;
};

/**
 * Mutation function to create a new contact
 *
 * @param {string} url - Mutation key (unused in implementation)
 * @param {Object} options - Mutation options
 * @param {Object} options.arg - Contact creation data
 * @param {Object} options.arg.personalInfo - Personal information fields
 * @param {Object} options.arg.companyInfo - Company information fields
 * @param {Object} options.arg.leadInfo - Lead information fields
 * @returns {Promise<Object>} Created contact object with company join
 */
const createCRMContactMutation = async (url, { arg }) => {
  const response = await axiosInstance.post('/api/crm/contacts', arg);
  return response;
};

/**
 * Hook to create a new contact
 * Automatically handles company creation/linking
 *
 * @returns {Object} SWR mutation response
 *
 * @example
 * const { trigger: createContact, isMutating } = useCreateCRMContact();
 * const newContact = await createContact({
 *   personalInfo: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     workEmail: 'john.doe@example.com',
 *     phoneNumber: '+1-555-0100',
 *     jobTitle: 'Sales Director',
 *     status: 'currentlyWorking',
 *   },
 *   companyInfo: {
 *     companyName: 'Tech Solutions Inc',
 *     industryType: 'technology',
 *   },
 *   leadInfo: {
 *     source: 'referral',
 *     status: 'new',
 *     priority: 'high',
 *     tags: ['Technology'],
 *   },
 * });
 * // newContact = { contact: { id, first_name, ... }, company: { id, name, ... } }
 */
export const useCreateCRMContact = () => {
  const mutation = useSWRMutation('create-crm-contact', createCRMContactMutation);

  return mutation;
};

/**
 * Fetcher function for all contacts
 * Fetches contacts from API route with automatic organization filtering
 *
 * @returns {Promise<Object>} Response with contacts array
 */
const crmContactsListFetcher = async () => {
  const response = await axiosInstance.get('/api/crm/contacts');
  return response;
};

/**
 * Hook to fetch all contacts for the user's organization
 * Returns active (non-archived) contacts with account joins
 *
 * @returns {Object} SWR response with contacts array
 *
 * @example
 * const { contacts, isLoading, isError, mutate } = useCRMContacts();
 * // contacts = [{ id, first_name, last_name, email, ..., account: { id, name, ... } }, ...]
 */
export function useCRMContacts() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/crm/contacts',
    crmContactsListFetcher,
    {
      suspense: false,
      revalidateOnMount: true,
      revalidateOnFocus: false,
    }
  );

  return {
    contacts: data?.contacts || [],
    isLoading,
    isError: error,
    mutate,
  };
}

/**
 * Hook to archive and unarchive contacts (soft delete)
 * Provides functions to toggle archived status with automatic revalidation
 *
 * @returns {Object} Archive and unarchive functions
 *
 * @example
 * const { archiveContact, unarchiveContact } = useArchiveContact();
 * await archiveContact('contact_001'); // Marks contact as archived
 * await unarchiveContact('contact_001'); // Restores contact
 */
export function useArchiveContact() {
  const { mutate } = useSWRConfig();

  const archiveContact = async (contactId) => {
    const response = await fetch(`/api/crm/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archived: true }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to archive contact');
    }

    const data = await response.json();

    // Revalidate contacts list
    mutate('/api/crm/contacts');

    return data;
  };

  const unarchiveContact = async (contactId) => {
    const response = await fetch(`/api/crm/contacts/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ archived: false }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to unarchive contact');
    }

    const data = await response.json();

    // Revalidate contacts list
    mutate('/api/crm/contacts');

    return data;
  };

  return {
    archiveContact,
    unarchiveContact,
  };
}
