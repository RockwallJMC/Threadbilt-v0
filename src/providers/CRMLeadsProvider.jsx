'use client';

import { createContext, use, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const initialState = {
  statusFilter: 'all',
  searchQuery: '',
  selectedLeads: [],
  viewMode: 'list',
};

const CRMLeadsContext = createContext({});

const CRMLeadsProvider = ({ children }) => {
  const [statusFilter, setStatusFilter] = useState(initialState.statusFilter);
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [selectedLeads, setSelectedLeads] = useState(initialState.selectedLeads);
  const [viewMode, setViewMode] = useState(initialState.viewMode);

  // Toggle individual lead selection
  const toggleLeadSelection = useCallback((leadId) => {
    setSelectedLeads((prev) => {
      if (prev.includes(leadId)) {
        return prev.filter((id) => id !== leadId);
      }
      return [...prev, leadId];
    });
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedLeads([]);
  }, []);

  // Check if lead is selected
  const isLeadSelected = useCallback(
    (leadId) => {
      return selectedLeads.includes(leadId);
    },
    [selectedLeads],
  );

  // Filter leads by search query and status
  const getFilteredLeads = useCallback(
    (leads) => {
      if (!leads) return [];

      let filtered = [...leads];

      // Filter by status
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((lead) => lead.status === statusFilter);
      }

      // Filter by search query
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((lead) => {
          const searchableFields = [
            lead.name,
            lead.email,
            lead.company,
            lead.phone,
            lead.source,
          ];

          return searchableFields.some(
            (field) => field && field.toLowerCase().includes(query),
          );
        });
      }

      return filtered;
    },
    [statusFilter, searchQuery],
  );

  // Select all filtered leads
  const selectAllLeads = useCallback((leads) => {
    if (!leads) return;
    const leadIds = leads.map((lead) => lead.id);
    setSelectedLeads(leadIds);
  }, []);

  // Check if all filtered leads are selected
  const areAllLeadsSelected = useCallback(
    (leads) => {
      if (!leads || leads.length === 0) return false;
      return leads.every((lead) => selectedLeads.includes(lead.id));
    },
    [selectedLeads],
  );

  const contextValue = useMemo(
    () => ({
      // Filter state
      statusFilter,
      setStatusFilter,

      // Search state
      searchQuery,
      setSearchQuery,

      // Selection state
      selectedLeads,
      setSelectedLeads,
      toggleLeadSelection,
      clearSelection,
      isLeadSelected,
      selectAllLeads,
      areAllLeadsSelected,

      // View state
      viewMode,
      setViewMode,

      // Helper functions
      getFilteredLeads,
    }),
    [
      statusFilter,
      searchQuery,
      selectedLeads,
      viewMode,
      toggleLeadSelection,
      clearSelection,
      isLeadSelected,
      selectAllLeads,
      areAllLeadsSelected,
      getFilteredLeads,
    ],
  );

  return <CRMLeadsContext.Provider value={contextValue}>{children}</CRMLeadsContext.Provider>;
};

CRMLeadsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useLeadsContext = () => use(CRMLeadsContext);

export default CRMLeadsProvider;
