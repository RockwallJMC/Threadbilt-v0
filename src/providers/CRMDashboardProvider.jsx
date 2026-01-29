'use client';

import { createContext, useContext, useReducer, useMemo } from 'react';
import { subDays } from 'date-fns';

// Initial state
const initialState = {
  dateRange: {
    start: subDays(new Date(), 90),
    end: new Date(),
    preset: 90,
  },
  visibleWidgets: new Set([
    'kpis',
    'pipeline',
    'opportunities',
    'lead-sources',
    'recent-activities',
    'proposals',
    'top-opportunities',
    'conversion-funnel',
  ]),
  loading: false,
  error: null,
};

// Action types
const ActionTypes = {
  SET_DATE_RANGE: 'SET_DATE_RANGE',
  TOGGLE_WIDGET_VISIBILITY: 'TOGGLE_WIDGET_VISIBILITY',
  SHOW_ALL_WIDGETS: 'SHOW_ALL_WIDGETS',
  RESET_TO_DEFAULTS: 'RESET_TO_DEFAULTS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
};

// Reducer
const dashboardReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_DATE_RANGE: {
      const { preset } = action.payload;
      return {
        ...state,
        dateRange: {
          start: subDays(new Date(), preset),
          end: new Date(),
          preset,
        },
      };
    }

    case ActionTypes.TOGGLE_WIDGET_VISIBILITY: {
      const { widgetId } = action.payload;
      const newVisibleWidgets = new Set(state.visibleWidgets);

      if (newVisibleWidgets.has(widgetId)) {
        newVisibleWidgets.delete(widgetId);
      } else {
        newVisibleWidgets.add(widgetId);
      }

      return {
        ...state,
        visibleWidgets: newVisibleWidgets,
      };
    }

    case ActionTypes.SHOW_ALL_WIDGETS: {
      return {
        ...state,
        visibleWidgets: new Set(initialState.visibleWidgets),
      };
    }

    case ActionTypes.RESET_TO_DEFAULTS: {
      return initialState;
    }

    case ActionTypes.SET_LOADING: {
      return {
        ...state,
        loading: action.payload,
      };
    }

    case ActionTypes.SET_ERROR: {
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    }

    default:
      return state;
  }
};

// Context
const CRMDashboardContext = createContext(null);

// Provider component
export const CRMDashboardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const actions = useMemo(
    () => ({
      setDateRange: (preset) => {
        dispatch({ type: ActionTypes.SET_DATE_RANGE, payload: { preset } });
      },
      toggleWidgetVisibility: (widgetId) => {
        dispatch({ type: ActionTypes.TOGGLE_WIDGET_VISIBILITY, payload: { widgetId } });
      },
      showAllWidgets: () => {
        dispatch({ type: ActionTypes.SHOW_ALL_WIDGETS });
      },
      resetToDefaults: () => {
        dispatch({ type: ActionTypes.RESET_TO_DEFAULTS });
      },
      setLoading: (loading) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
      },
      setError: (error) => {
        dispatch({ type: ActionTypes.SET_ERROR, payload: error });
      },
    }),
    [],
  );

  const value = useMemo(
    () => ({
      ...state,
      ...actions,
    }),
    [state, actions],
  );

  return <CRMDashboardContext.Provider value={value}>{children}</CRMDashboardContext.Provider>;
};

// Custom hook to use the context
export const useCRMDashboard = () => {
  const context = useContext(CRMDashboardContext);

  if (!context) {
    throw new Error('useCRMDashboard must be used within a CRMDashboardProvider');
  }

  return context;
};

export default CRMDashboardProvider;
