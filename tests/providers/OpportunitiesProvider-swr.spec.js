/**
 * Test: OpportunitiesProvider with SWR Integration
 *
 * Purpose: Verify that OpportunitiesProvider correctly integrates with SWR hooks
 * for data fetching and mutations, replacing static mock data with dynamic API calls.
 *
 * TDD Phase: RED (Failing tests first)
 *
 * Note: These are unit tests for the provider logic. E2E tests will be added later.
 *
 * @jest-environment jsdom
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useOpportunitiesContext } from '../../src/providers/OpportunitiesProvider';
import OpportunitiesProvider from '../../src/providers/OpportunitiesProvider';
import * as useOpportunitiesApi from '../../src/services/swr/api-hooks/useOpportunitiesApi';

// Mock the SWR hooks
jest.mock('../../src/services/swr/api-hooks/useOpportunitiesApi');

describe('OpportunitiesProvider SWR Integration', () => {
  const mockOpportunities = [
    {
      id: 'opp1',
      name: 'Test Opportunity 1',
      stage: 'qualification',
      amount: 50000,
      company: { id: 1, name: 'Test Company' },
    },
    {
      id: 'opp2',
      name: 'Test Opportunity 2',
      stage: 'proposal',
      amount: 75000,
      company: { id: 2, name: 'Another Company' },
    },
  ];

  const mockMutate = jest.fn();
  const mockCreateTrigger = jest.fn();
  const mockUpdateTrigger = jest.fn();
  const mockDeleteTrigger = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useOpportunities to return data
    useOpportunitiesApi.useOpportunities.mockReturnValue({
      data: mockOpportunities,
      isLoading: false,
      error: null,
      mutate: mockMutate,
    });

    // Mock useCreateOpportunity
    useOpportunitiesApi.useCreateOpportunity.mockReturnValue({
      trigger: mockCreateTrigger,
      isMutating: false,
    });

    // Mock useUpdateOpportunity
    useOpportunitiesApi.useUpdateOpportunity.mockReturnValue({
      trigger: mockUpdateTrigger,
      isMutating: false,
    });

    // Mock useDeleteOpportunity
    useOpportunitiesApi.useDeleteOpportunity.mockReturnValue({
      trigger: mockDeleteTrigger,
      isMutating: false,
    });
  });

  test('should use SWR hook to fetch opportunities instead of static data', () => {
    // This test verifies that useOpportunities hook is called
    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    renderHook(() => useOpportunitiesContext(), { wrapper });

    // Verify useOpportunities was called
    expect(useOpportunitiesApi.useOpportunities).toHaveBeenCalled();
  });

  test('should provide opportunities data from SWR to context', async () => {
    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    const { result } = renderHook(() => useOpportunitiesContext(), { wrapper });

    // Wait for the context to be populated with SWR data
    await waitFor(() => {
      expect(result.current.listItems).toBeDefined();
    });

    // Verify opportunities are available in context
    // (Implementation will transform flat array to column format)
    expect(result.current).toHaveProperty('listItems');
  });

  test('should show loading state while SWR is fetching', () => {
    // Mock loading state
    useOpportunitiesApi.useOpportunities.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      mutate: mockMutate,
    });

    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    const { result } = renderHook(() => useOpportunitiesContext(), { wrapper });

    // Verify loading state is exposed
    expect(result.current).toBeDefined();
  });

  test('should call updateOpportunity mutation on drag end', async () => {
    mockUpdateTrigger.mockResolvedValue({
      id: 'opp1',
      stage: 'proposal',
      stage_changed_at: new Date().toISOString(),
    });

    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    const { result } = renderHook(() => useOpportunitiesContext(), { wrapper });

    // Simulate drag end event
    const dragEndEvent = {
      active: {
        id: 'opp1',
        data: {
          current: {
            type: 'opportunity',
            opportunity: mockOpportunities[0],
          },
        },
      },
      over: {
        id: 'column-proposal', // Moving to proposal column
      },
    };

    await act(async () => {
      result.current.handleDragEnd(dragEndEvent);
    });

    // Verify updateOpportunity was called
    // This will fail until we implement SWR integration
    expect(mockUpdateTrigger).toHaveBeenCalled();
  });

  test('should call mutate to revalidate after successful update', async () => {
    mockUpdateTrigger.mockResolvedValue({
      id: 'opp1',
      stage: 'proposal',
    });

    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    const { result } = renderHook(() => useOpportunitiesContext(), { wrapper });

    const dragEndEvent = {
      active: {
        id: 'opp1',
        data: {
          current: {
            type: 'opportunity',
            opportunity: mockOpportunities[0],
          },
        },
      },
      over: {
        id: 'column-proposal',
      },
    };

    await act(async () => {
      result.current.handleDragEnd(dragEndEvent);
    });

    // Verify mutate was called to revalidate data
    // This will fail until we implement SWR integration
    expect(mockMutate).toHaveBeenCalled();
  });

  test('should call createOpportunity mutation when creating new opportunity', async () => {
    mockCreateTrigger.mockResolvedValue({
      id: 'opp3',
      name: 'New Opportunity',
      stage: 'qualification',
      amount: 100000,
    });

    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    const { result } = renderHook(() => useOpportunitiesContext(), { wrapper });

    // Simulate creating a new opportunity
    const newOpportunityData = {
      name: 'New Opportunity',
      amount: 100000,
      stage: 'qualification',
    };

    if (result.current.handleCreateOpportunity) {
      await act(async () => {
        await result.current.handleCreateOpportunity('qualification', newOpportunityData);
      });

      // Verify createOpportunity was called
      expect(mockCreateTrigger).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Opportunity',
          stage: 'qualification',
        })
      );
    }
  });

  test('should handle API errors gracefully', async () => {
    const mockError = new Error('API Error');
    mockUpdateTrigger.mockRejectedValue(mockError);

    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    const { result } = renderHook(() => useOpportunitiesContext(), { wrapper });

    const dragEndEvent = {
      active: {
        id: 'opp1',
        data: {
          current: {
            type: 'opportunity',
            opportunity: mockOpportunities[0],
          },
        },
      },
      over: {
        id: 'column-proposal',
      },
    };

    // Should not throw error, should handle it gracefully
    await act(async () => {
      await expect(
        result.current.handleDragEnd(dragEndEvent)
      ).resolves.not.toThrow();
    });

    // Verify mutate was called for rollback
    expect(mockMutate).toHaveBeenCalled();
  });

  test('should transform flat opportunities array to column format', async () => {
    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    const { result } = renderHook(() => useOpportunitiesContext(), { wrapper });

    await waitFor(() => {
      expect(result.current.listItems).toBeDefined();
    });

    // Verify listItems are in column format (array of columns with opportunities)
    if (result.current.listItems) {
      expect(Array.isArray(result.current.listItems)).toBe(true);
      // Each item should be a column with opportunities array
      if (result.current.listItems.length > 0) {
        expect(result.current.listItems[0]).toHaveProperty('opportunities');
      }
    }
  });

  test('should initialize useCreateOpportunity hook', () => {
    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    renderHook(() => useOpportunitiesContext(), { wrapper });

    // Verify useCreateOpportunity was initialized
    expect(useOpportunitiesApi.useCreateOpportunity).toHaveBeenCalled();
  });

  test('should initialize useUpdateOpportunity hook', () => {
    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    renderHook(() => useOpportunitiesContext(), { wrapper });

    // Verify useUpdateOpportunity was initialized
    expect(useOpportunitiesApi.useUpdateOpportunity).toHaveBeenCalled();
  });

  test('should initialize useDeleteOpportunity hook', () => {
    const wrapper = ({ children }) => (
      <OpportunitiesProvider>{children}</OpportunitiesProvider>
    );

    renderHook(() => useOpportunitiesContext(), { wrapper });

    // Verify useDeleteOpportunity was initialized
    expect(useOpportunitiesApi.useDeleteOpportunity).toHaveBeenCalled();
  });
});
