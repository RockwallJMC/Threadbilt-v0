'use client';

import { createContext, use, useState } from 'react';

/**
 * Context for managing CRM contacts state (selection, filters, sorting)
 * @typedef {Object} CRMContactsContextValue
 * @property {string[]} selectedContacts - Array of selected contact IDs for bulk actions
 * @property {string} searchQuery - Search filter text
 * @property {string} accountFilter - Filter by account association ("all", "with_account", "independent")
 * @property {string} statusFilter - Filter by status (active, inactive)
 * @property {string} sortBy - Sort field (name, created_at, email)
 * @property {string} sortOrder - Sort order (asc, desc)
 * @property {Function} selectContact - Add contact to selection
 * @property {Function} deselectContact - Remove contact from selection
 * @property {Function} selectAllContacts - Select multiple contacts
 * @property {Function} clearSelection - Clear all selections
 * @property {Function} setSearchQuery - Update search filter
 * @property {Function} setAccountFilter - Update account filter
 * @property {Function} setStatusFilter - Update status filter
 * @property {Function} setSortBy - Update sort settings
 * @property {Function} isContactSelected - Check if contact is selected
 */

export const CRMContactsContext = createContext({});

/**
 * Provider for CRM Contacts state management
 * Handles selection, filtering, and sorting state for the contacts list
 * Does NOT handle data fetching - use SWR hooks for that
 */
const CRMContactsProvider = ({ children }) => {
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [sortBy, setSortByState] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  /**
   * Add contact to selection
   * @param {string} id - Contact ID to select
   */
  const selectContact = (id) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  /**
   * Remove contact from selection
   * @param {string} id - Contact ID to deselect
   */
  const deselectContact = (id) => {
    setSelectedContacts((prev) =>
      prev.filter((contactId) => contactId !== id)
    );
  };

  /**
   * Select multiple contacts at once
   * @param {string[]} contactIds - Array of contact IDs to select
   */
  const selectAllContacts = (contactIds) => {
    setSelectedContacts(contactIds);
  };

  /**
   * Clear all selected contacts
   */
  const clearSelection = () => {
    setSelectedContacts([]);
  };

  /**
   * Update sort field and order
   * @param {string} field - Sort field (name, created_at, email)
   * @param {string} order - Sort order (asc, desc)
   */
  const setSortBy = (field, order) => {
    setSortByState(field);
    setSortOrder(order);
  };

  /**
   * Check if contact is selected
   * @param {string} id - Contact ID to check
   * @returns {boolean} - True if contact is selected
   */
  const isContactSelected = (id) => {
    return selectedContacts.includes(id);
  };

  return (
    <CRMContactsContext
      value={{
        selectedContacts,
        searchQuery,
        accountFilter,
        statusFilter,
        sortBy,
        sortOrder,
        selectContact,
        deselectContact,
        selectAllContacts,
        clearSelection,
        setSearchQuery,
        setAccountFilter,
        setStatusFilter,
        setSortBy,
        isContactSelected,
      }}
    >
      {children}
    </CRMContactsContext>
  );
};

/**
 * Hook to access CRM Contacts context
 * @returns {CRMContactsContextValue}
 */
export const useCRMContacts = () => use(CRMContactsContext);

export default CRMContactsProvider;
