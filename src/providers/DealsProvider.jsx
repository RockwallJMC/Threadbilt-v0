'use client';

import { createContext, use, useReducer, useCallback, useEffect, useState } from 'react';
import { useDeals, useUpdateDeal } from 'services/swr/api-hooks/useCRMDealsApi';
import { DRAG_START, DRAG_OVER, DRAG_END, SET_LIST_ITEMS, dealsReducer } from 'reducers/DealsReducer';

const STAGES = ['Contact', 'MQL', 'SQL', 'Opportunity', 'Won', 'Lost'];

const DealsContext = createContext({});

const DealsProvider = ({ children }) => {
  // Fetch deals from API
  const { data: groupedDeals, error, isLoading, mutate } = useDeals();
  const { trigger: updateDeal } = useUpdateDeal();

  const initialState = {
    listItems: [],
    createDealDialog: { isOpen: false },
    draggedList: null,
    draggedDeal: null,
    isLoading,
    error,
  };

  const [state, dealsDispatch] = useReducer(dealsReducer, initialState);

  // Update reducer when API data changes
  useEffect(() => {
    if (groupedDeals) {
      const transformed = STAGES.map(stage => ({
        id: stage,
        title: stage,
        deals: groupedDeals[stage] || [],
        compactMode: false,
      }));
      dealsDispatch({
        type: SET_LIST_ITEMS,
        payload: { listItems: transformed },
      });
    }
  }, [groupedDeals]);

  const handleDragStart = (event) => {
    dealsDispatch({
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
          dealsDispatch({
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
    const { activeId, overId } = { activeId: event.active.id, overId: event.over.id };

    // Optimistic update via reducer
    dealsDispatch({
      type: DRAG_END,
      payload: { activeId, overId },
    });

    // Find the deal and its new position after drag
    const findDealAndStage = (dealId, lists) => {
      for (const list of lists) {
        const dealIndex = list.deals.findIndex(d => d.id === dealId);
        if (dealIndex !== -1) {
          return {
            deal: list.deals[dealIndex],
            stage: list.title,
            stageOrder: dealIndex,
          };
        }
      }
      return null;
    };

    // Get updated list items after reducer update
    // We need to wait a tick for the reducer to update state
    setTimeout(async () => {
      const currentListItems = state.listItems;
      const dealInfo = findDealAndStage(activeId, currentListItems);

      if (dealInfo && dealInfo.deal) {
        try {
          // Call API to persist the change
          await updateDeal({
            id: dealInfo.deal.id,
            updates: {
              stage: dealInfo.stage,
              stage_order: dealInfo.stageOrder,
            },
          });
          // Revalidate to ensure consistency
          mutate();
        } catch (error) {
          console.error('Failed to update deal position:', error);
          // Revalidate to rollback optimistic update
          mutate();
        }
      }
    }, 0);
  };

  return (
    <DealsContext
      value={{ ...state, dealsDispatch, handleDragStart, handleDragOver, handleDragEnd }}
    >
      {children}
    </DealsContext>
  );
};

export const useDealsContext = () => use(DealsContext);

export default DealsProvider;
