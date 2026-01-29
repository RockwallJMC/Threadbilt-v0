import { arrayMove } from '@dnd-kit/sortable';

export const DRAG_START = 'DRAG_START';
export const DRAG_OVER = 'DRAG_OVER';
export const DRAG_END = 'DRAG_END';
export const ADD_NEW_OPPORTUNITY = 'ADD_NEW_OPPORTUNITY';
export const ADD_NEW_LIST = 'ADD_NEW_LIST';
export const SET_CREATE_OPPORTUNITY_DIALOG = 'SET_CREATE_OPPORTUNITY_DIALOG';
export const TOGGLE_COMPACT_MODE = 'TOGGLE_COMPACT_MODE';
export const TOGGLE_OPPORTUNITY_EXPAND = 'TOGGLE_OPPORTUNITY_EXPAND';
export const UPDATE_LIST_TITLE = 'UPDATE_LIST_TITLE';
export const SET_LIST_ITEMS = 'SET_LIST_ITEMS';

const findList = (id, listItems) => {
  if (!id) {
    return null;
  }

  const list = listItems.find((item) => item.id === id) ?? null;
  if (list) {
    return list;
  }

  const listId = listItems
    .flatMap((list) => list.opportunities.map((opportunity) => ({ opportunityId: opportunity.id, listId: list.id })))
    .find((item) => item.opportunityId === id)?.listId;

  return listItems.find((list) => list.id === listId) ?? null;
};

export const opportunitiesReducer = (state, action) => {
  switch (action.type) {
    case DRAG_START: {
      if (action.payload.type === 'opportunity')
        return { ...state, draggedOpportunity: action.payload.item.opportunity };
      if (action.payload.type === 'list')
        return { ...state, draggedList: action.payload.item.list };

      return state;
    }

    case DRAG_OVER: {
      const { activeId, overId, activeRect, overRect } = action.payload;
      const activeList = findList(activeId, state.listItems);
      const overList = findList(overId, state.listItems);

      if (!activeList || !overList || activeList.id === overList.id || !activeRect || !overRect) {
        return state;
      }

      const activeDeals = activeList.opportunities;
      const overDeals = overList.opportunities;

      const activeIndex = activeDeals.findIndex((opportunity) => opportunity.id === activeId);
      const overIndex = overDeals.findIndex((opportunity) => opportunity.id === overId);

      if (activeIndex === -1) {
        return state;
      }

      const newIndex =
        overIndex >= 0 ? overIndex + (activeRect.top > overRect.top + overRect.height ? 1 : 0) : 0;

      return {
        ...state,
        listItems: state.listItems.map((item) => {
          if (item.id === activeList.id) {
            return { ...item, opportunities: activeDeals.filter((item) => item.id !== activeId) };
          } else if (item.id === overList.id) {
            return {
              ...item,
              opportunities: [
                ...overDeals.slice(0, newIndex),
                { ...activeDeals[activeIndex], stage: item.title },
                ...overDeals.slice(newIndex),
              ],
            };
          }

          return item;
        }),
      };
    }

    case DRAG_END: {
      const { activeId, overId } = action.payload;
      const activeList = findList(activeId, state.listItems);
      const overList = findList(overId, state.listItems);

      if (!activeList || !overList) return { ...state, draggedOpportunity: null, draggedList: null };

      if (state.draggedOpportunity && activeList.id === overList.id) {
        const activeIndex = activeList.opportunities.findIndex((opportunity) => opportunity.id === activeId);
        const overIndex = activeList.opportunities.findIndex((opportunity) => opportunity.id === overId);
        if (activeIndex !== overIndex) {
          const sortedDeals = arrayMove(activeList.opportunities, activeIndex, overIndex);

          return {
            ...state,
            listItems: state.listItems.map((list) =>
              list.id === activeList.id ? { ...list, opportunities: sortedDeals } : list,
            ),
            draggedOpportunity: null,
            draggedList: null,
          };
        }
      } else if (activeList) {
        const activeIndex = state.listItems.findIndex((list) => list.id === activeId);
        const overIndex = state.listItems.findIndex((list) => list.id === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          const sortedListItems = arrayMove(state.listItems, activeIndex, overIndex);

          return {
            ...state,
            listItems: sortedListItems,
            draggedOpportunity: null,
            draggedList: null,
          };
        }
      }

      return { ...state, draggedOpportunity: null, draggedList: null };
    }

    case ADD_NEW_LIST: {
      return {
        ...state,
        listItems: [
          ...state.listItems.slice(0, action.payload.columnNo - 1),
          {
            id: Date.now().toString(),
            title: action.payload.title,
            compactMode: false,
            opportunities: [],
          },
          ...state.listItems.slice(action.payload.columnNo - 1),
        ],
      };
    }

    case SET_CREATE_OPPORTUNITY_DIALOG: {
      return {
        ...state,
        createOpportunityDialog: {
          isOpen: !state.createOpportunityDialog.isOpen,
          listId: action.payload.listId,
        },
      };
    }

    case ADD_NEW_OPPORTUNITY: {
      return {
        ...state,
        listItems: state.listItems.map((list) =>
          list.title === action.payload.listName
            ? {
                ...list,
                opportunities: [...list.opportunities, { ...action.payload.opportunity, id: Date.now().toString() }],
              }
            : list,
        ),
      };
    }

    case TOGGLE_OPPORTUNITY_EXPAND: {
      const listId = findList(action.payload.id, state.listItems)?.id;
      if (listId) {
        const newListItems = state.listItems.map((list) =>
          list.id === listId
            ? {
                ...list,
                opportunities: list.opportunities.map((opportunity) =>
                  opportunity.id === action.payload.id ? { ...opportunity, expanded: !opportunity.expanded } : opportunity,
                ),
              }
            : list,
        );

        return { ...state, listItems: newListItems };
      }

      return state;
    }

    case TOGGLE_COMPACT_MODE: {
      return {
        ...state,
        listItems: state.listItems.map((item) =>
          item.id === action.payload.id ? { ...item, compactMode: !item.compactMode } : item,
        ),
      };
    }

    case UPDATE_LIST_TITLE: {
      return {
        ...state,
        listItems: state.listItems.map((item) =>
          item.id === action.payload.id ? { ...item, title: action.payload.title } : item,
        ),
      };
    }

    case SET_LIST_ITEMS: {
      return {
        ...state,
        listItems: action.payload,
      };
    }

    default:
      return state;
  }
};
