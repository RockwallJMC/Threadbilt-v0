'use client';

import { createContext, use, useReducer, useCallback, useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { opportunitiesData, OPPORTUNITY_STAGES } from 'data/crm/opportunities';
import { DRAG_START, DRAG_OVER, DRAG_END, opportunitiesReducer, ADD_NEW_OPPORTUNITY } from 'reducers/OpportunitiesReducer';
import {
  useOpportunities,
  useCreateOpportunity,
  useUpdateOpportunity,
  useDeleteOpportunity,
} from 'services/swr/api-hooks/useOpportunitiesApi';

const initialState = {
  listItems: opportunitiesData,
  createOpportunityDialog: { isOpen: false },
  draggedList: null,
  draggedOpportunity: null,
};

const OpportunitiesContext = createContext({});

const OpportunitiesProvider = ({ children }) => {
  const [state, opportunitiesDispatch] = useReducer(opportunitiesReducer, initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  // SWR hooks for data fetching and mutations
  const { data: opportunities, isLoading: swrLoading, error: swrError, mutate } = useOpportunities();
  const { trigger: createOpportunity } = useCreateOpportunity();
  const { trigger: updateOpportunity } = useUpdateOpportunity();
  const { trigger: deleteOpportunity } = useDeleteOpportunity();

  // Transform flat opportunities array to column format when SWR data changes
  useEffect(() => {
    if (opportunities && Array.isArray(opportunities)) {
      // Group opportunities by stage
      const opportunitiesByStage = opportunities.reduce((acc, opp) => {
        const stage = opp.stage || 'qualification';
        if (!acc[stage]) {
          acc[stage] = [];
        }
        acc[stage].push(opp);
        return acc;
      }, {});

      // Create columns for each stage
      const columns = OPPORTUNITY_STAGES.map((stageConfig) => {
        const existingColumn = state.listItems.find(
          (col) => col.title.toLowerCase() === stageConfig.label.toLowerCase()
        );

        return {
          id: existingColumn?.id || `column-${stageConfig.value}`,
          title: stageConfig.label,
          compactMode: existingColumn?.compactMode || false,
          opportunities: opportunitiesByStage[stageConfig.value] || [],
        };
      });

      // Update state with transformed data
      opportunitiesDispatch({
        type: 'SET_LIST_ITEMS',
        payload: columns,
      });
    }
  }, [opportunities]);

  // Set loading and error states from SWR
  useEffect(() => {
    setIsLoading(swrLoading);
  }, [swrLoading]);

  useEffect(() => {
    if (swrError) {
      setError(swrError.message);
      enqueueSnackbar(`Failed to load opportunities: ${swrError.message}`, { variant: 'error' });
    }
  }, [swrError, enqueueSnackbar]);

  const handleDragStart = (event) => {
    opportunitiesDispatch({
      type: DRAG_START,
      payload: { type: event.active.data.current.type, item: event.active.data.current },
    });
  };

  const handleDragOver = useCallback(
    (() => {
      let timeoutId;

      return (event) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          opportunitiesDispatch({
            type: DRAG_OVER,
            payload: {
              activeId: event.active.id,
              overId: event.over.id,
              activeRect: event.active.rect.current.translated,
              overRect: event.over.rect,
            },
          });
        }, 16);
      };
    })(),
    [],
  );

  const handleDragEnd = async (event) => {
    if (!event.over) return;

    const { active, over } = event;
    const activeId = active.id;
    const overId = over.id;

    // First, perform optimistic update via reducer
    opportunitiesDispatch({
      type: DRAG_END,
      payload: { activeId, overId },
    });

    // If dragging an opportunity to a different column, update via API
    if (active.data.current?.type === 'opportunity') {
      // Find the target column/stage
      const targetColumn = state.listItems.find((col) => col.id === overId);

      if (targetColumn) {
        const newStage = targetColumn.title.toLowerCase();
        const opportunityId = activeId;

        try {
          // Find stage config for probability
          const stageConfig = OPPORTUNITY_STAGES.find((s) => s.label.toLowerCase() === newStage);

          // Call API to update opportunity
          await updateOpportunity({
            id: opportunityId,
            updates: {
              stage: stageConfig?.value || newStage,
              stage_changed_at: new Date().toISOString(),
              probability: stageConfig?.probability,
            },
          });

          // Revalidate to ensure data consistency
          await mutate();

          enqueueSnackbar('Opportunity updated successfully', { variant: 'success' });
        } catch (error) {
          // Rollback on error by revalidating (fetching fresh data)
          enqueueSnackbar(`Failed to update opportunity: ${error.message}`, { variant: 'error' });
          await mutate(); // This will restore the correct state from the server
        }
      }
    }
  };

  const handleCreateOpportunity = async (stage, opportunityData) => {
    try {
      const newOpportunity = await createOpportunity({
        ...opportunityData,
        stage,
        stage_changed_at: new Date().toISOString(),
      });

      enqueueSnackbar('Opportunity created successfully!', { variant: 'success' });
      await mutate(); // Revalidate to fetch updated list
      return newOpportunity;
    } catch (error) {
      enqueueSnackbar(`Failed to create opportunity: ${error.message}`, { variant: 'error' });
      setError(error.message);
      throw error;
    }
  };

  const handleDeleteOpportunity = async (opportunityId) => {
    try {
      await deleteOpportunity({ id: opportunityId });
      enqueueSnackbar('Opportunity deleted successfully', { variant: 'success' });
      await mutate(); // Revalidate to fetch updated list
    } catch (error) {
      enqueueSnackbar(`Failed to delete opportunity: ${error.message}`, { variant: 'error' });
      setError(error.message);
      throw error;
    }
  };

  return (
    <OpportunitiesContext
      value={{
        ...state,
        isLoading,
        error,
        opportunitiesDispatch,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleCreateOpportunity,
        handleDeleteOpportunity,
        mutate, // Expose mutate for manual revalidation
      }}
    >
      {children}
    </OpportunitiesContext>
  );
};

export const useOpportunitiesContext = () => use(OpportunitiesContext);

export default OpportunitiesProvider;
