'use client';

import { createContext, use, useState } from 'react';

/**
 * Context for managing CRM accounts state (selection, filters, sorting)
 * @typedef {Object} CRMAccountsContextValue
 * @property {string[]} selectedAccounts - Array of selected account IDs for bulk actions
 * @property {string} searchQuery - Search filter text
 * @property {string[]} industryFilter - Filter by industry (array of industries)
 * @property {string} sortBy - Sort field (name, created_at, industry)
 * @property {string} sortOrder - Sort order (asc, desc)
 * @property {Function} selectAccount - Add account to selection
 * @property {Function} deselectAccount - Remove account from selection
 * @property {Function} selectAllAccounts - Select multiple accounts
 * @property {Function} clearSelection - Clear all selections
 * @property {Function} setSearchQuery - Update search filter
 * @property {Function} setIndustryFilter - Update industry filter
 * @property {Function} setSortBy - Update sort settings
 * @property {Function} isAccountSelected - Check if account is selected
 */

export const CRMAccountsContext = createContext({});

/**
 * Provider for CRM Accounts state management
 * Handles selection, filtering, and sorting state for the accounts list
 * Does NOT handle data fetching - use SWR hooks for that
 */
const CRMAccountsProvider = ({ children }) => {
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState([]);
  const [sortBy, setSortByState] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  /**
   * Add account to selection
   * @param {string} id - Account ID to select
   */
  const selectAccount = (id) => {
    setSelectedAccounts((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
  };

  /**
   * Remove account from selection
   * @param {string} id - Account ID to deselect
   */
  const deselectAccount = (id) => {
    setSelectedAccounts((prev) =>
      prev.filter((accountId) => accountId !== id)
    );
  };

  /**
   * Select multiple accounts at once
   * @param {string[]} accountIds - Array of account IDs to select
   */
  const selectAllAccounts = (accountIds) => {
    setSelectedAccounts(accountIds);
  };

  /**
   * Clear all selected accounts
   */
  const clearSelection = () => {
    setSelectedAccounts([]);
  };

  /**
   * Update sort field and order
   * @param {string} field - Sort field (name, created_at, industry)
   * @param {string} order - Sort order (asc, desc)
   */
  const setSortBy = (field, order) => {
    setSortByState(field);
    setSortOrder(order);
  };

  /**
   * Check if account is selected
   * @param {string} id - Account ID to check
   * @returns {boolean} - True if account is selected
   */
  const isAccountSelected = (id) => {
    return selectedAccounts.includes(id);
  };

  return (
    <CRMAccountsContext
      value={{
        selectedAccounts,
        searchQuery,
        industryFilter,
        sortBy,
        sortOrder,
        selectAccount,
        deselectAccount,
        selectAllAccounts,
        clearSelection,
        setSearchQuery,
        setIndustryFilter,
        setSortBy,
        isAccountSelected,
      }}
    >
      {children}
    </CRMAccountsContext>
  );
};

/**
 * Hook to access CRM Accounts context
 * @returns {CRMAccountsContextValue}
 */
export const useCRMAccounts = () => use(CRMAccountsContext);

export default CRMAccountsProvider;
