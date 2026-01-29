---
phase: "1.7.1"
title: "CRM Dashboard - Core Infrastructure"
type: "design"
status: "planned"
version: "1.0"
created: "2026-01-29"
updated: "2026-01-29"
author: "Pierce Team + Claude Code"
reviewers: []
dependencies: ["phase1.1", "phase1.3", "phase1.4", "phase1.5"]
blocks: ["phase1.7.2", "phase1.7.3", "phase1.7.4", "phase1.7.5"]
related_docs:
  - "_sys_documents/execution/INDEX-phase1.7-crm-dashboard.md"
  - "_sys_documents/design/phase1.5-opportunity-pipeline.md"
estimated_hours: 12
complexity: "medium"
impact: "deep"
verification:
  - "Dashboard route accessible at /apps/crm/dashboard"
  - "Responsive grid layout renders on desktop/tablet/mobile"
  - "DashboardWidgetContainer component renders with mock data"
  - "CRMDashboardProvider provides filter state correctly"
  - "useDashboardApi hooks return mock metrics with 100ms delay"
  - "Build succeeds (exit 0)"
  - "Lint passes (0 errors)"
---

# Phase 1.7.1: CRM Dashboard - Core Infrastructure

## Overview

Phase 1.7.1 establishes the foundational infrastructure for the CRM Dashboard & Reports feature. This includes the dashboard page route, responsive grid layout system, reusable widget containers, state management, and data access layer with mock aggregations.

**Key Deliverables:**

- Dashboard page route (`/apps/crm/dashboard`)
- Responsive dashboard layout with MUI Grid v7
- DashboardWidgetContainer reusable component
- CRMDashboardProvider (date filters, widget visibility state)
- useDashboardApi.js (7 SWR hooks with mock aggregations + TODO markers)
- Mock aggregated metrics in `/src/data/crm/dashboard-metrics.js`
- Integration with existing chart utilities (ReactEchart, useToggleChartLegends)

**Why This Matters:**

This phase creates the foundation that all subsequent dashboard widget phases (1.7.2-1.7.5) depend on. Getting the infrastructure right ensures consistent widget behavior, simplified development, and maintainability.

## Design Decisions

### Decision 1: Dashboard Layout Architecture

**Context:** Need to establish responsive grid layout pattern that supports 18+ widgets with different size requirements (KPI cards, charts, tables).

**Options Considered:**

1. **Fixed Grid with Predefined Slots**
   - Widgets assigned to fixed positions in 12-column grid
   - Pros: Simple, predictable layout
   - Cons: Not flexible, harder to add/remove widgets

2. **Responsive Grid with Widget Size Props** (SELECTED)
   - Each widget specifies its grid size: `{{ xs: 12, sm: 6, md: 4, lg: 3 }}`
   - MUI Grid v7 handles responsive breakpoints automatically
   - Pros: Flexible, widgets control their own sizing, easy to reorder
   - Cons: Requires consistent widget sizing conventions

3. **Dashboard Grid Library** (react-grid-layout)
   - Drag-and-drop, resizable widgets
   - Pros: Maximum flexibility, user customization
   - Cons: Overkill for MVP, added complexity and dependency

**Decision:** Option 2 selected. Responsive Grid with Widget Size Props provides the right balance of flexibility and simplicity. Foundation for future drag-and-drop enhancement without over-engineering MVP.

**Implementation:**
```jsx
// Dashboard layout
<Grid container spacing={3}>
  <Grid size={{ xs: 12, sm: 6, md: 3 }}><KPIWidget /></Grid>
  <Grid size={{ xs: 12, md: 6 }}><ChartWidget /></Grid>
  <Grid size={{ xs: 12 }}><TableWidget /></Grid>
</Grid>
```

### Decision 2: Widget Container Pattern

**Context:** 18 widgets need consistent Paper wrapper, title, menu, loading states, error handling.

**Options Considered:**

1. **Each Widget Implements Own Container**
   - Pros: Maximum control per widget
   - Cons: Code duplication, inconsistent styling

2. **Reusable DashboardWidgetContainer Component** (SELECTED)
   - Wrapper component with title, menu, loading, error props
   - Widget content passed as children
   - Pros: Consistent styling, DRY principle, easy theming
   - Cons: Less flexibility for unique widget layouts

3. **Higher-Order Component (HOC)**
   - withDashboardWidget(Component) pattern
   - Pros: Separation of concerns
   - Cons: More abstract, harder to debug

**Decision:** Option 2 selected. Reusable container component is the standard React pattern used throughout the codebase (see existing dashboard sections). Provides consistency without complexity.

**Implementation:**
```jsx
<DashboardWidgetContainer
  title="Total Pipeline Value"
  subtitle="All open opportunities"
  loading={isLoading}
  error={error}
  menu={<DashboardMenu />}
>
  <Typography variant="h4">{formatCurrency(value)}</Typography>
</DashboardWidgetContainer>
```

### Decision 3: Date Filter Strategy

**Context:** Dashboard widgets need date range filtering (last 7/30/90 days, custom range). How should date state be managed and applied?

**Options Considered:**

1. **Global Date Filter in Provider**
   - All widgets read from CRMDashboardProvider
   - Single date picker controls all widgets
   - Pros: Consistent filtering, simple UX
   - Cons: Less flexibility if widgets need different ranges

2. **Per-Widget Date Filters** (SELECTED for MVP, Global as Enhancement)
   - Individual widgets fetch data for their optimal range
   - Provider stores selected range for user preference
   - Widgets can override if needed
   - Pros: Optimal data per widget, flexibility
   - Cons: Multiple date pickers if exposed per widget

3. **No Date Filtering (Show All)**
   - Display all-time metrics
   - Pros: Simplest implementation
   - Cons: Not useful for trend analysis

**Decision:** Option 2 selected with implementation note: Provider stores global filter preference, but widgets implement their own optimal ranges internally. MVP shows "Last 90 Days" as default with global filter toggle planned for Phase 1.7.6.

### Decision 4: Mock Data Aggregation Strategy

**Context:** Dashboard requires pre-calculated metrics (totals, averages, conversion rates) across Phases 1.3-1.6 entities. Should mock data aggregate on-the-fly or use pre-calculated values?

**Options Considered:**

1. **Calculate Aggregations from Entity Mock Arrays**
   - Import opportunities, leads, proposals mock data
   - Calculate metrics in useDashboardApi hooks
   - Pros: Single source of truth, always in sync with entity data
   - Cons: Complex calculation logic, slower, harder to maintain

2. **Pre-calculated Mock Aggregations** (SELECTED)
   - `/src/data/crm/dashboard-metrics.js` exports calculated metrics
   - Values crafted to show interesting patterns/trends
   - Pros: Fast, simple, clear baseline for testing, easy to maintain
   - Cons: Can drift from entity data, requires manual sync

3. **Hybrid - Entity Data + Aggregation Helpers**
   - Import entities + use calculation helpers to aggregate
   - Pros: Balance of realism and control
   - Cons: Still complex, calculation logic duplicated from backend

**Decision:** Option 2 selected. Pre-calculated mock aggregations in dedicated file provides speed and clarity. When Phase 1.2 completes, TODO markers guide migration to Supabase aggregate queries. Mock drift is acceptable for MVP since mock data is illustrative, not authoritative.

**Mock Data Structure:**
```javascript
export const dashboardMetrics = {
  kpis: {
    totalPipelineValue: 1847500,
    weightedForecast: 923750,
    leadConversionRate: 32.5,
    opportunityWinRate: 28.3,
    // ...
  },
  pipelineByStage: [...],
  leadSourcePerformance: [...],
  // ...
};
```

### Decision 5: State Management Pattern

**Context:** Dashboard needs to manage widget visibility toggles, date filters, loading states, error states.

**Options Considered:**

1. **Local State in Dashboard Page Component**
   - useState hooks in page component
   - Pass props to widgets
   - Pros: Simple, no context needed
   - Cons: Prop drilling, state lost on navigation

2. **React Context + useReducer** (SELECTED)
   - CRMDashboardProvider with reducer pattern
   - Widgets access state via useContext
   - Pros: Scalable, no prop drilling, persistent state
   - Cons: More setup code

3. **Redux or Zustand Store**
   - Global state management library
   - Pros: Dev tools, time-travel debugging
   - Cons: Overkill for feature-scoped state

**Decision:** Option 2 selected. React Context with useReducer is the standard pattern used throughout CRM sections (CRMLeadsProvider, CRMAccountsProvider, CRMProposalsProvider). Provides consistency and sufficient power without external dependencies.

**Provider API:**
```javascript
const {
  dateRange,           // { start: Date, end: Date, preset: '7days' | '30days' | '90days' }
  visibleWidgets,      // Set<widgetId>
  setDateRange,
  toggleWidgetVisibility,
  resetToDefaults
} = useDashboardContext();
```

## Technical Approach

### Architecture

**Component Hierarchy:**

```
/apps/crm/dashboard (Page Route)
└── CRMDashboardProvider (State Management)
    └── DashboardLayout.jsx (Main Container)
        ├── DashboardHeader.jsx
        │   ├── Typography (Page Title)
        │   ├── DateRangeFilter (Dropdown: 7/30/90 days)
        │   └── DashboardMenu (Export, Settings)
        │
        └── Grid container (Responsive Layout)
            ├── Grid size={{ xs: 12, sm: 6, md: 3 }}
            │   └── DashboardWidgetContainer (Reusable)
            │       └── [Widget Content - Phases 1.7.2-1.7.5]
            │
            └── [Repeat for 18+ widgets]
```

**Data Flow:**

```
User Action (Select Date Range)
    ↓
CRMDashboardProvider (Update State)
    ↓
Widgets re-render (Read from Context)
    ↓
useDashboardApi Hooks (SWR with filters)
    ↓
Mock Fetcher (100ms delay, filter by date range)
    ↓
Return Metrics → Update Widget UI
```

**Integration with Existing Utilities:**

- **ReactEchart.jsx** - Base chart component (already exists)
- **useToggleChartLegends** - Chart series visibility hook (already exists)
- **echart-utils.js** - Tooltip formatters (already exists)
- **useNumberFormat** - Currency/number formatting (already exists)
- **DashboardMenu.jsx** - Widget menu with Export/Settings (already exists)

### Data Model

**Dashboard Metrics TypeScript Interface:**

```typescript
interface DashboardMetrics {
  kpis: {
    totalPipelineValue: number;
    weightedForecast: number;
    leadConversionRate: number;        // percentage
    opportunityWinRate: number;        // percentage
    averageDealSize: number;
    averageSalesCycle: number;         // days
    proposalsAcceptanceRate: number;   // percentage
    totalActiveAccounts: number;
  };

  pipelineByStage: Array<{
    stage: 'qualification' | 'needs_analysis' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
    count: number;
    totalValue: number;
  }>;

  opportunityTrend: Array<{
    date: string;                      // ISO date
    created: number;
    closed_won: number;
    closed_lost: number;
  }>;

  pipelineVelocity: Array<{
    stage: string;
    averageDays: number;
  }>;

  leadSourcePerformance: Array<{
    source: 'Website' | 'Referral' | 'Marketing' | 'Cold Call' | 'Trade Show' | 'Partner';
    leadCount: number;
    convertedCount: number;
    conversionRate: number;            // percentage
  }>;

  leadFunnel: {
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
  };

  topAccounts: Array<{
    id: string;
    name: string;
    totalOpportunityValue: number;
    openOpportunitiesCount: number;
  }>;

  recentActivities: Array<{
    id: string;
    type: 'note' | 'email' | 'call' | 'meeting';
    description: string;
    entityType: 'lead' | 'opportunity' | 'account' | 'contact' | 'proposal';
    entityId: string;
    entityName: string;
    createdAt: string;                 // ISO timestamp
  }>;

  proposalStatusBreakdown: Array<{
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
    count: number;
    totalValue: number;
  }>;

  topOpportunities: Array<{
    id: string;
    name: string;
    accountName: string;
    value: number;
    stage: string;
    probability: number;
    expectedCloseDate: string;
  }>;
}
```

**Context State Interface:**

```typescript
interface DashboardContextState {
  dateRange: {
    start: Date;
    end: Date;
    preset: '7days' | '30days' | '90days' | 'custom';
  };
  visibleWidgets: Set<string>;         // Widget IDs
  loading: boolean;
  error: Error | null;
}

interface DashboardContextActions {
  setDateRange: (preset: string, start?: Date, end?: Date) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  showAllWidgets: () => void;
  hideAllWidgets: () => void;
  resetToDefaults: () => void;
}
```

### Component Breakdown

#### 1. Page Route

**`src/app/(main)/apps/crm/dashboard/page.jsx`**
- Purpose: Dashboard page route
- Key functionality: Renders DashboardLayout wrapped in CRMDashboardProvider
- Dependencies: CRMDashboardProvider, DashboardLayout
- File size: ~30 lines

```jsx
import { CRMDashboardProvider } from 'providers/CRMDashboardProvider';
import DashboardLayout from 'components/sections/crm/dashboard/DashboardLayout';

export default function CRMDashboardPage() {
  return (
    <CRMDashboardProvider>
      <DashboardLayout />
    </CRMDashboardProvider>
  );
}
```

#### 2. State Management

**`src/providers/CRMDashboardProvider.jsx`**
- Purpose: Global state for dashboard (date filters, widget visibility)
- Key functionality:
  - useReducer for state management
  - Date range calculation helpers
  - Widget visibility toggle logic
  - Persist preferences to localStorage (future enhancement)
- Dependencies: React Context, useReducer, date-fns
- File size: ~150 lines

**State Actions:**
```javascript
const actions = {
  SET_DATE_RANGE: 'SET_DATE_RANGE',
  TOGGLE_WIDGET: 'TOGGLE_WIDGET',
  SHOW_ALL: 'SHOW_ALL',
  HIDE_ALL: 'HIDE_ALL',
  RESET: 'RESET'
};
```

#### 3. Main Dashboard Layout

**`src/components/sections/crm/dashboard/DashboardLayout.jsx`**
- Purpose: Main container orchestrating dashboard sections
- Key functionality:
  - Renders DashboardHeader
  - Creates responsive Grid container
  - Maps over widget definitions to render Grid items
  - Conditional rendering based on visibleWidgets state
- Dependencies: MUI Grid, useDashboardContext, useDashboardApi
- File size: ~100 lines

**Layout Structure:**
```jsx
<Box sx={{ p: 3 }}>
  <DashboardHeader />
  <Grid container spacing={3} sx={{ mt: 2 }}>
    {/* Placeholder Grid items for Phase 1.7.2-1.7.5 widgets */}
    <Grid size={{ xs: 12 }}>
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Dashboard widgets will be added in Phases 1.7.2-1.7.5
        </Typography>
      </Paper>
    </Grid>
  </Grid>
</Box>
```

#### 4. Dashboard Header

**`src/components/sections/crm/dashboard/DashboardHeader.jsx`**
- Purpose: Page title, date filter, actions menu
- Key functionality:
  - Page title: "CRM Dashboard"
  - Date range dropdown (7/30/90 days presets)
  - DashboardMenu integration (Export, Settings)
  - Responsive layout (stack on mobile)
- Dependencies: MUI Stack, Typography, Select, DashboardMenu
- File size: ~80 lines

```jsx
<Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
  <div>
    <Typography variant="h4">CRM Dashboard</Typography>
    <Typography variant="body2" color="text.secondary">
      Real-time sales performance insights
    </Typography>
  </div>
  <Stack direction="row" spacing={2}>
    <DateRangeSelect value={dateRange.preset} onChange={handleDateChange} />
    <DashboardMenu />
  </Stack>
</Stack>
```

#### 5. Reusable Widget Container

**`src/components/sections/crm/dashboard/DashboardWidgetContainer.jsx`**
- Purpose: Reusable Paper wrapper for all dashboard widgets
- Key functionality:
  - Paper elevation and padding
  - Title and optional subtitle
  - Loading skeleton (Skeleton component)
  - Error state display (Alert component)
  - Optional DashboardMenu in header
  - Min-height to prevent layout shift during loading
- Dependencies: MUI Paper, Skeleton, Alert, Typography, DashboardMenu
- File size: ~100 lines

**Props Interface:**
```typescript
interface DashboardWidgetContainerProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: Error | null;
  menu?: ReactNode;
  minHeight?: number;
  children: ReactNode;
}
```

#### 6. Data Access Layer

**`src/services/swr/api-hooks/useDashboardApi.js`**
- Purpose: SWR hooks for dashboard metrics with mock fetchers
- Key functionality: 7 hooks returning aggregated metrics
- Dependencies: SWR, mock data from dashboard-metrics.js
- File size: ~200 lines

**Hooks:**

```javascript
// 1. useDashboardKPIs(dateRange)
//    Returns: KPI metrics object
//    Mock: Filter by dateRange, return pre-calculated KPIs
//    TODO: SELECT aggregate queries for KPIs

// 2. usePipelineBreakdown(dateRange)
//    Returns: Pipeline value by stage
//    Mock: Return pipelineByStage array
//    TODO: SELECT stage, SUM(value) FROM opportunities WHERE...

// 3. useOpportunityTrend(dateRange)
//    Returns: Time series of opportunity creation vs. close
//    Mock: Return opportunityTrend array
//    TODO: SELECT DATE_TRUNC('day', created_at), COUNT(*) FROM opportunities...

// 4. useLeadSourcePerformance(dateRange)
//    Returns: Lead count and conversion by source
//    Mock: Return leadSourcePerformance array
//    TODO: SELECT source, COUNT(*), conversion rate FROM leads...

// 5. useRecentActivities(limit = 20)
//    Returns: Latest activities across all CRM entities
//    Mock: Return recentActivities array (sorted by createdAt DESC)
//    TODO: SELECT * FROM activities ORDER BY created_at DESC LIMIT...

// 6. useProposalStatusBreakdown(dateRange)
//    Returns: Proposal count and value by status
//    Mock: Return proposalStatusBreakdown array
//    TODO: SELECT status, COUNT(*), SUM(total_amount) FROM proposals...

// 7. useTopOpportunities(limit = 10, orderBy = 'value')
//    Returns: Top opportunities by value or close date
//    Mock: Return topOpportunities array
//    TODO: SELECT * FROM opportunities ORDER BY value DESC LIMIT...
```

#### 7. Mock Data File

**`src/data/crm/dashboard-metrics.js`**
- Purpose: Pre-calculated mock dashboard metrics
- Key functionality: Export dashboardMetrics object with realistic values
- Dependencies: None (pure data)
- File size: ~250 lines

**Data Structure:**
```javascript
export const dashboardMetrics = {
  kpis: {
    totalPipelineValue: 1847500,
    weightedForecast: 923750,
    leadConversionRate: 32.5,
    opportunityWinRate: 28.3,
    averageDealSize: 47250,
    averageSalesCycle: 42,
    proposalsAcceptanceRate: 64.2,
    totalActiveAccounts: 28
  },
  pipelineByStage: [
    { stage: 'qualification', count: 8, totalValue: 420000 },
    { stage: 'needs_analysis', count: 6, totalValue: 315000 },
    { stage: 'proposal', count: 5, totalValue: 487500 },
    { stage: 'negotiation', count: 4, totalValue: 625000 },
    // ...
  ],
  // ... rest of metrics
};
```

#### 8. Route & Navigation Updates

**`src/routes/paths.js` (Modification)**
- Add: `crm.dashboard: '/apps/crm/dashboard'`

**`src/routes/sitemap.js` (Modification)**
- Add Dashboard menu item in CRM section:
```javascript
{
  name: 'Dashboard',
  key: 'dashboard',
  path: paths.crm.dashboard,
  pathName: 'dashboard',
  icon: 'material-symbols:dashboard-outline',
  active: true
}
```

## Dependencies

### External Dependencies

**No new NPM packages needed for Phase 1.7.1.** All dependencies already installed:
- Material-UI v7 (Grid, Paper, Stack, Typography, Select, Skeleton, Alert)
- SWR (data fetching)
- React Hook Form (date filter form - if complex custom range)
- date-fns (date manipulation)
- ECharts + echarts-for-react (used in later phases, but infrastructure supports it)

### Internal Dependencies

**Phase Dependencies:**
- Phase 1.1 ✅ Complete (database schema provides data model reference)
- Phase 1.3 ✅ Complete (account/contact mock data informs aggregations)
- Phase 1.4 ✅ Complete (lead mock data informs conversion metrics)
- Phase 1.5 ✅ Complete (opportunity mock data, forecasting helpers reused)

**Component Dependencies:**
- ReactEchart.jsx (already exists - widgets in 1.7.3 will use it)
- DashboardMenu.jsx (already exists)
- useNumberFormat hook (already exists)
- echart-utils.js (already exists)

**Blocks:**
- Phase 1.7.2 (KPI Widgets) - Needs DashboardWidgetContainer and useDashboardApi
- Phase 1.7.3 (Pipeline Widgets) - Needs layout infrastructure
- Phase 1.7.4 (Lead Analytics) - Needs layout infrastructure
- Phase 1.7.5 (Activity Widgets) - Needs layout infrastructure

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Grid layout breaks on mobile | High | Medium | Test responsive behavior with MUI Grid size prop, ensure stacking works, add manual testing checklist |
| Mock data doesn't align with entity data | Medium | Low | Document known discrepancies, acceptable for MVP since mock is illustrative |
| Date filter state management too complex | Medium | Low | Start with simple preset filters (7/30/90 days), defer custom range to Phase 1.7.6 |
| Widget loading causes layout shift | Medium | Medium | Use minHeight prop on DashboardWidgetContainer, implement Skeleton with same dimensions as loaded content |
| Context provider re-renders cause performance issues | Low | Low | Memoize context value, use React.memo on expensive widgets if needed |

## Implementation Notes

**Key Considerations:**

1. **Copy-Then-Modify Pattern (Aurora)**
   - Search Aurora templates for existing dashboard layout patterns: `templates/aurora-next/src/sections/dashboards/`
   - Likely candidates: `crm/index.jsx`, `analytics/index.jsx` for layout patterns
   - Copy DashboardMenu, widget container patterns if found
   - Document search attempts in execution log

2. **MUI Grid v7 Syntax**
   - Use `size={{ xs: 12, sm: 6, md: 4 }}` prop (NOT `xs={12}` from v5)
   - Responsive spacing: `<Grid container spacing={{ xs: 2, md: 3 }}>`
   - Test on actual mobile device or Chrome DevTools responsive mode

3. **Widget Registration Pattern**
   - Consider creating widget registry array for easy addition/removal:
   ```javascript
   const widgetRegistry = [
     { id: 'total-pipeline', component: TotalPipelineWidget, gridSize: { xs: 12, sm: 6, md: 3 } },
     // ... more widgets
   ];
   ```

4. **Mock Data Quality**
   - Ensure metrics are internally consistent (e.g., sum of pipelineByStage.totalValue === kpis.totalPipelineValue)
   - Use realistic values that demonstrate patterns (not all values the same)
   - Include edge cases: zero values, very large numbers (1M+), negative trends

5. **Date Range Filtering**
   - Default: Last 90 days (covers typical sales cycle)
   - Presets: 7 days, 30 days, 90 days
   - Calculate using date-fns: `subDays(new Date(), 90)`
   - Store in Context as { start, end, preset } for clarity

6. **Loading States**
   - Initial page load: Show skeletons for all widgets
   - Date filter change: Show loading overlay or skeleton
   - SWR revalidation: Show subtle loading indicator, don't hide content

7. **Error Handling**
   - Individual widget errors: Show Alert in widget container, don't break layout
   - Global errors (provider-level): Show page-level error boundary
   - Retry functionality: SWR handles automatically with revalidate

8. **Accessibility**
   - Dashboard page title in H1 (semantic HTML)
   - Widget titles in H6 or H5 depending on hierarchy
   - Date filter Select has proper label
   - Loading skeletons have aria-busy="true"

9. **Testing Strategy (Phase 1.7.6)**
   - Unit tests: Context reducer actions, date range calculations
   - Integration tests: Widget registration, visibility toggles
   - E2E tests: Navigate to dashboard, select date filter, verify widgets render

10. **Performance Considerations**
    - Lazy load widgets as user scrolls (future enhancement)
    - Memoize expensive calculations (conversion rates, aggregations)
    - Use React.memo for DashboardWidgetContainer if re-renders become issue

## Verification Plan

**Phase-Specific Verification:**

### Build & Lint

```bash
npm run build
# Expected: Exit code 0, no errors

npm run lint -- src/components/sections/crm/dashboard/
# Expected: 0 errors
```

### Manual Testing Checklist

**Dashboard Route:**
- [ ] Navigate to `/apps/crm/dashboard`
- [ ] Page loads without errors
- [ ] Dashboard title displays: "CRM Dashboard"
- [ ] Placeholder message shows (widgets added in later phases)

**Responsive Layout:**
- [ ] Desktop (>= 1200px): Grid items display in columns
- [ ] Tablet (768px-1199px): Grid items reflow to 2 columns
- [ ] Mobile (< 768px): Grid items stack vertically
- [ ] No horizontal scrollbar at any breakpoint

**Date Filter:**
- [ ] Date range dropdown displays current preset ("Last 90 Days")
- [ ] Click dropdown: Options show (7/30/90 days)
- [ ] Select "Last 7 Days": Context updates, widgets would re-fetch
- [ ] Select "Last 30 Days": Context updates
- [ ] Select "Last 90 Days": Context updates (default)

**DashboardWidgetContainer:**
- [ ] Renders with title and subtitle
- [ ] Loading prop shows Skeleton component
- [ ] Error prop shows Alert with message
- [ ] Children content renders correctly
- [ ] DashboardMenu appears in header (if provided)

**State Management:**
- [ ] useDashboardContext() returns dateRange, visibleWidgets
- [ ] setDateRange() updates context state
- [ ] toggleWidgetVisibility() (tested in Phase 1.7.6)
- [ ] No console errors from provider

**Mock Data API:**
- [ ] useDashboardKPIs() returns metrics object
- [ ] usePipelineBreakdown() returns stage array
- [ ] useRecentActivities() returns activities (limit: 20)
- [ ] All hooks have 100ms delay (simulated network)
- [ ] SWR caching works (second call doesn't delay)

### Phase Acceptance Criteria

- [x] Design document complete
- [ ] Dashboard route created: `/apps/crm/dashboard`
- [ ] DashboardLayout component renders placeholder
- [ ] DashboardHeader component with title and date filter
- [ ] DashboardWidgetContainer reusable component created
- [ ] CRMDashboardProvider with useReducer state management
- [ ] useDashboardApi.js with 7 SWR hooks (mock fetchers)
- [ ] dashboard-metrics.js with pre-calculated mock data
- [ ] Date range filter dropdown (7/30/90 days presets)
- [ ] Responsive Grid layout verified (desktop/tablet/mobile)
- [ ] Routes added to paths.js and sitemap.js
- [ ] Build succeeds (exit 0)
- [ ] Lint passes (0 errors in Phase 1.7.1 files)
- [ ] TODO markers documented (~7-10 total for Supabase queries)
- [ ] Phase 1.7.1 execution document created

## Related Documentation

### Internal Documentation

- [INDEX: Phase 1.7 CRM Dashboard](../execution/INDEX-phase1.7-crm-dashboard.md) - Parent tracking doc
- [Phase 1.5 Opportunities Pipeline](phase1.5-opportunity-pipeline.md) - Forecasting helpers reference
- [CRM Desk MVP INDEX](../execution/INDEX-crm-desk-mvp.md) - Parent feature context

### External References

- [Material-UI Grid v7 Documentation](https://mui.com/material-ui/react-grid2/) - Responsive layout
- [SWR Documentation](https://swr.vercel.app/) - Data fetching patterns
- [date-fns Documentation](https://date-fns.org/) - Date manipulation

### Templates Used

- `.claude/templates/phase-design-template.md` - This document structure

---

**Status**: ⏳ Planned - Design Complete, Ready for Implementation
**Next Action**: Create Phase 1.7.1 execution document and assign to react-mui-frontend-engineer agent
**Owner**: Pierce Team + Claude Code
**Last Updated**: 2026-01-29
