'use client';

import { createContext, use, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

const initialState = {
  statusFilter: 'all',
  searchQuery: '',
  selectedProposals: [],
};

const CRMProposalsContext = createContext({});

const CRMProposalsProvider = ({ children }) => {
  const [statusFilter, setStatusFilter] = useState(initialState.statusFilter);
  const [searchQuery, setSearchQuery] = useState(initialState.searchQuery);
  const [selectedProposals, setSelectedProposals] = useState(initialState.selectedProposals);

  // Toggle individual proposal selection
  const toggleProposalSelection = useCallback((proposalId) => {
    setSelectedProposals((prev) => {
      if (prev.includes(proposalId)) {
        return prev.filter((id) => id !== proposalId);
      }
      return [...prev, proposalId];
    });
  }, []);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedProposals([]);
  }, []);

  // Check if proposal is selected
  const isProposalSelected = useCallback(
    (proposalId) => {
      return selectedProposals.includes(proposalId);
    },
    [selectedProposals],
  );

  // Filter proposals by search query and status
  const getFilteredProposals = useCallback(
    (proposals) => {
      if (!proposals) return [];

      let filtered = [...proposals];

      // Filter by status
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((proposal) => proposal.status === statusFilter);
      }

      // Filter by search query
      if (searchQuery && searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((proposal) => {
          const searchableFields = [
            proposal.title,
            proposal.proposal_number,
            proposal.opportunity_id,
            proposal.description,
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

  // Select all filtered proposals
  const selectAllProposals = useCallback((proposals) => {
    if (!proposals) return;
    const proposalIds = proposals.map((proposal) => proposal.id);
    setSelectedProposals(proposalIds);
  }, []);

  // Check if all filtered proposals are selected
  const areAllProposalsSelected = useCallback(
    (proposals) => {
      if (!proposals || proposals.length === 0) return false;
      return proposals.every((proposal) => selectedProposals.includes(proposal.id));
    },
    [selectedProposals],
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
      selectedProposals,
      setSelectedProposals,
      toggleProposalSelection,
      clearSelection,
      isProposalSelected,
      selectAllProposals,
      areAllProposalsSelected,

      // Helper functions
      getFilteredProposals,
    }),
    [
      statusFilter,
      searchQuery,
      selectedProposals,
      toggleProposalSelection,
      clearSelection,
      isProposalSelected,
      selectAllProposals,
      areAllProposalsSelected,
      getFilteredProposals,
    ],
  );

  return <CRMProposalsContext.Provider value={contextValue}>{children}</CRMProposalsContext.Provider>;
};

CRMProposalsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useProposalsContext = () => use(CRMProposalsContext);

export default CRMProposalsProvider;
