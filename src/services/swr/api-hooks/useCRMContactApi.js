'use client';

import axiosInstance from 'services/axios/axiosInstance';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

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
    }
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
