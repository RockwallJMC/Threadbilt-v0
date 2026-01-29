/**
 * Unit tests for CRMProposalsProvider
 *
 * RED phase: These tests will fail until CRMProposalsProvider.jsx is implemented
 *
 * Tests for proposals context state management functionality
 */

import { renderHook, act } from '@testing-library/react';
import CRMProposalsProvider, { useProposalsContext } from '../CRMProposalsProvider';

const wrapper = ({ children }) => <CRMProposalsProvider>{children}</CRMProposalsProvider>;

describe('CRMProposalsProvider', () => {
  describe('Context initialization', () => {
    test('provides initial state with empty selections', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      expect(result.current.selectedProposals).toEqual([]);
      expect(result.current.statusFilter).toBe('all');
      expect(result.current.searchQuery).toBe('');
    });

    test('provides all required context methods', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      expect(result.current.toggleProposalSelection).toBeDefined();
      expect(result.current.clearSelection).toBeDefined();
      expect(result.current.isProposalSelected).toBeDefined();
      expect(result.current.setStatusFilter).toBeDefined();
      expect(result.current.setSearchQuery).toBeDefined();
      expect(result.current.getFilteredProposals).toBeDefined();
      expect(result.current.selectAllProposals).toBeDefined();
      expect(result.current.areAllProposalsSelected).toBeDefined();
    });
  });

  describe('Proposal selection', () => {
    test('toggleProposalSelection adds proposal to selection', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.toggleProposalSelection('prop_001');
      });

      expect(result.current.selectedProposals).toEqual(['prop_001']);
    });

    test('toggleProposalSelection removes proposal from selection', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.toggleProposalSelection('prop_001');
        result.current.toggleProposalSelection('prop_001');
      });

      expect(result.current.selectedProposals).toEqual([]);
    });

    test('toggleProposalSelection handles multiple proposals', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.toggleProposalSelection('prop_001');
        result.current.toggleProposalSelection('prop_002');
        result.current.toggleProposalSelection('prop_003');
      });

      expect(result.current.selectedProposals).toEqual(['prop_001', 'prop_002', 'prop_003']);
    });

    test('clearSelection removes all selected proposals', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.toggleProposalSelection('prop_001');
        result.current.toggleProposalSelection('prop_002');
        result.current.clearSelection();
      });

      expect(result.current.selectedProposals).toEqual([]);
    });

    test('isProposalSelected returns true for selected proposal', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.toggleProposalSelection('prop_001');
      });

      expect(result.current.isProposalSelected('prop_001')).toBe(true);
    });

    test('isProposalSelected returns false for unselected proposal', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      expect(result.current.isProposalSelected('prop_001')).toBe(false);
    });
  });

  describe('Filtering', () => {
    const mockProposals = [
      {
        id: 'prop_001',
        title: 'Website Redesign Proposal',
        status: 'draft',
        opportunity_id: 'opp_001',
        total_amount: '5000.00',
      },
      {
        id: 'prop_002',
        title: 'Mobile App Development',
        status: 'sent',
        opportunity_id: 'opp_002',
        total_amount: '15000.00',
      },
      {
        id: 'prop_003',
        title: 'API Integration Services',
        status: 'accepted',
        opportunity_id: 'opp_003',
        total_amount: '8000.00',
      },
    ];

    test('setStatusFilter updates status filter', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.setStatusFilter('draft');
      });

      expect(result.current.statusFilter).toBe('draft');
    });

    test('setSearchQuery updates search query', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.setSearchQuery('website');
      });

      expect(result.current.searchQuery).toBe('website');
    });

    test('getFilteredProposals filters by status', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.setStatusFilter('sent');
      });

      const filtered = result.current.getFilteredProposals(mockProposals);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('prop_002');
    });

    test('getFilteredProposals filters by search query', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.setSearchQuery('mobile');
      });

      const filtered = result.current.getFilteredProposals(mockProposals);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('prop_002');
    });

    test('getFilteredProposals combines status and search filters', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.setStatusFilter('draft');
        result.current.setSearchQuery('website');
      });

      const filtered = result.current.getFilteredProposals(mockProposals);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('prop_001');
    });

    test('getFilteredProposals returns all when filter is "all"', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      const filtered = result.current.getFilteredProposals(mockProposals);

      expect(filtered).toHaveLength(3);
    });

    test('getFilteredProposals handles null proposals', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      const filtered = result.current.getFilteredProposals(null);

      expect(filtered).toEqual([]);
    });

    test('getFilteredProposals is case-insensitive for search', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.setSearchQuery('WEBSITE');
      });

      const filtered = result.current.getFilteredProposals(mockProposals);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('prop_001');
    });
  });

  describe('Bulk selection', () => {
    const mockProposals = [
      { id: 'prop_001', title: 'Proposal 1', status: 'draft' },
      { id: 'prop_002', title: 'Proposal 2', status: 'sent' },
      { id: 'prop_003', title: 'Proposal 3', status: 'accepted' },
    ];

    test('selectAllProposals selects all provided proposals', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.selectAllProposals(mockProposals);
      });

      expect(result.current.selectedProposals).toEqual(['prop_001', 'prop_002', 'prop_003']);
    });

    test('areAllProposalsSelected returns true when all are selected', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.selectAllProposals(mockProposals);
      });

      expect(result.current.areAllProposalsSelected(mockProposals)).toBe(true);
    });

    test('areAllProposalsSelected returns false when some are not selected', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.toggleProposalSelection('prop_001');
      });

      expect(result.current.areAllProposalsSelected(mockProposals)).toBe(false);
    });

    test('areAllProposalsSelected returns false for empty list', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      expect(result.current.areAllProposalsSelected([])).toBe(false);
    });

    test('selectAllProposals handles null gracefully', () => {
      const { result } = renderHook(() => useProposalsContext(), { wrapper });

      act(() => {
        result.current.selectAllProposals(null);
      });

      expect(result.current.selectedProposals).toEqual([]);
    });
  });
});
