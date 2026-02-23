# Phase 1.5: CRM Dashboard Analytics - Design Document

**Phase**: 1.5 (Final Phase)
**Feature**: CRM Section - Complete Database Wiring
**Page**: `/dashboard/crm`
**Status**: Design Complete
**Date**: 2026-01-31
**Designer**: Claude (brainstorming skill)
**GitHub Issue**: TBD

---

## Overview

**Objective**: Wire the CRM dashboard to live database aggregations, replacing all 8 mock data sources with real-time analytics from Supabase.

**Business Value**:
- Real-time CRM analytics powered by actual data
- Accurate sales funnel and conversion metrics
- Data-driven insights for business decisions
- Foundation for advanced analytics features

**Scope**:
- 8 specialized API endpoints for dashboard metrics
- Database indexes for query optimization
- SWR hooks for efficient data fetching
- Complete frontend integration with loading/error states
- 4-layer testing (data, API, UI, E2E)
- Seed data generation (~50 deals, ~30 contacts, ~100 activities)

---

## Architecture

### Pattern

**Backend**:
- 8 specialized API route handlers in `src/app/api/crm/dashboard/`
- Each endpoint performs database aggregations using Supabase queries
- Response format matches existing mock data structure (minimal frontend changes)
- Date range filtering built into queries (last 30 days default, configurable)

**Data Layer**:
- Optimized Supabase queries with strategic indexes
- Index on: `deals.stage`, `deals.source`, `deals.created_at`, `deals.closed_at`, `contacts.created_at`, `activities.created_at`, `activities.activity_type`
- User-scoped RLS policies already in place from previous phases
- Aggregations use native PostgreSQL functions (COUNT, SUM, AVG, GROUP BY, DATE_TRUNC)

**Frontend**:
- SWR hooks for data fetching with caching
- New hook: `useCRMDashboardApi()` with methods for each metric
- Existing components update to fetch from hooks instead of importing mock data
- Loading states and error handling added to all dashboard sections

---

## Database Schema & Indexes

### Existing Schema (from Phases 1.1-1.4)

- `companies` - Company records with basic info
- `contacts` - Contact records with company relationships
- `deals` - Deal records with stage, value, source, dates
- `deal_collaborators` - Many-to-many deal assignments
- `activities` - Activity log with polymorphic relationships (JSONB metadata)

### New Indexes for Analytics Performance

```sql
-- Deal aggregations (stage funnel, revenue, win/loss)
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_source ON deals(source);
CREATE INDEX idx_deals_created_at ON deals(created_at);
CREATE INDEX idx_deals_closed_at ON deals(closed_at) WHERE closed_at IS NOT NULL;
CREATE INDEX idx_deals_user_stage ON deals(user_id, stage); -- composite for RLS + filtering

-- Contact aggregations (new contacts over time)
CREATE INDEX idx_contacts_created_at ON contacts(created_at);

-- Activity aggregations (feedback, user activity)
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_type_created ON activities(activity_type, created_at); -- composite for type filtering
```

### Schema Additions

**New Columns on `deals` table**:
- `acquisition_cost` (DECIMAL) - tracks CAC per deal
- `lifetime_value` (DECIMAL) - tracks projected LTV
- Both nullable, can be populated via seed data or left null for MVP

**Migration File**: `database/migrations/005_dashboard_analytics_columns.sql`

---

## API Endpoints

### Endpoint Structure

**Route Pattern**: `src/app/api/crm/dashboard/[metric]/route.js`

### 1. Deals Metrics
**Endpoint**: `GET /api/crm/dashboard/deals-metrics`

**Returns**:
```json
{
  "created": {
    "count": 42,
    "percentage": 15.2,
    "trend": "up"
  },
  "closed": {
    "count": 28,
    "percentage": 8.5,
    "trend": "down"
  }
}
```

**Query Logic**:
- COUNT deals by `created_at` in date range (default last 30 days)
- COUNT deals by `closed_at` in date range
- Compare to previous period for percentage and trend calculation

---

### 2. KPIs
**Endpoint**: `GET /api/crm/dashboard/kpis`

**Returns**:
```json
[
  {
    "title": "Active Users",
    "value": "3050",
    "subtitle": "avg daily logins",
    "icon": "solar:users-group-rounded-bold-duotone",
    "color": "primary"
  },
  {
    "title": "New Contacts",
    "value": "105",
    "subtitle": "accounts opened",
    "icon": "solar:user-plus-rounded-bold-duotone",
    "color": "success"
  }
  // ... 3 more KPIs
]
```

**Query Logic**:
- **Active Users**: COUNT DISTINCT activities.user_id per day, average over period
- **New Contacts**: COUNT contacts where created_at in date range
- **Renewal Rate**: (COUNT deals won / COUNT deals total) * 100
- **Inventory**: Mock data for MVP (not CRM-related)
- **Delivered**: Mock data for MVP (not CRM-related)

---

### 3. Revenue by Quarter
**Endpoint**: `GET /api/crm/dashboard/revenue`

**Returns**:
```json
{
  "quarters": ["2023 Q1", "2023 Q2", "2023 Q3", "2023 Q4", "2024 Q1", "2024 Q2", "2024 Q3"],
  "p25": [12.5, 15.2, 18.1, 20.5, 22.8, 25.1, 28.3],
  "p50": [25.0, 30.5, 35.2, 40.8, 45.5, 50.2, 55.8],
  "p75": [37.5, 45.8, 52.5, 60.2, 68.0, 75.5, 82.5]
}
```

**Query Logic**:
- GROUP BY quarter using `DATE_TRUNC('quarter', created_at)`
- Calculate percentile distribution of `deals.value` per quarter
- Use PostgreSQL `PERCENTILE_CONT` function for p25, p50, p75

---

### 4. Lead Sources
**Endpoint**: `GET /api/crm/dashboard/lead-sources`

**Returns**:
```json
[
  { "name": "Organic", "value": 1048 },
  { "name": "Marketing", "value": 735 },
  { "name": "Social media", "value": 580 },
  { "name": "Blog posts", "value": 484 }
]
```

**Query Logic**:
- GROUP BY `deals.source`
- COUNT deals per source
- ORDER BY count DESC

---

### 5. Acquisition Cost
**Endpoint**: `GET /api/crm/dashboard/acquisition-cost`

**Returns**:
```json
{
  "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "allotted": [50, 52, 48, 55, 60, 45, 42],
  "used": [45, 48, 52, 50, 55, 48, 40]
}
```

**Query Logic**:
- GROUP BY day of week over last 7 days
- AVG(`acquisition_cost`) for "used" budget
- "Allotted" budget: Mock data or configurable value for MVP

---

### 6. Sales Funnel
**Endpoint**: `GET /api/crm/dashboard/sales-funnel`

**Returns**:
```json
{
  "stages": [
    {
      "name": "Awareness",
      "percentage": 100,
      "lostLeadPercentage": 5.2,
      "thisMonthPercentage": 12.5
    },
    {
      "name": "Research",
      "percentage": 80,
      "lostLeadPercentage": 8.1,
      "thisMonthPercentage": 10.8
    }
    // ... 4 more stages
  ]
}
```

**Query Logic**:
- GROUP BY `deals.stage`
- Calculate conversion percentage (deals at stage / total deals * 100)
- Calculate lost lead percentage (deals with stage='lost' from this stage)
- Calculate this month percentage (deals entering stage this month)

---

### 7. Lifetime Value vs CAC
**Endpoint**: `GET /api/crm/dashboard/lifetime-value`

**Returns**:
```json
{
  "months": ["Jan", "Feb", "Mar", ..., "Dec"],
  "cac": [120, 125, 118, 130, 128, 135, 132, 140, 138, 145, 142, 150],
  "ltv": [450, 460, 455, 470, 465, 480, 475, 490, 485, 500, 495, 510]
}
```

**Query Logic**:
- GROUP BY month using `DATE_TRUNC('month', created_at)`
- AVG(`acquisition_cost`) per month for CAC line
- AVG(`lifetime_value`) per month for LTV line
- Calculate average line as (CAC + LTV) / 2

---

### 8. Active Users
**Endpoint**: `GET /api/crm/dashboard/active-users`

**Returns**:
```json
{
  "dates": ["Jan 01", "Jan 02", "Jan 03", ..., "Jan 15"],
  "counts": [1250, 1320, 1280, 1350, 1400, 1380, 1420, 1450, 1430, 1480, 1460, 1500, 1490, 1520, 1510]
}
```

**Query Logic**:
- COUNT DISTINCT `activities.user_id` per day
- GROUP BY day using `DATE_TRUNC('day', created_at)`
- Default: last 15 days
- Optional query param: `period=7|15|30` for date range

---

### Shared Query Parameters

All endpoints support:
- `dateFrom` (ISO 8601 string) - Start date (default: 30 days ago)
- `dateTo` (ISO 8601 string) - End date (default: today)
- User scoping handled automatically via RLS policies

### Error Handling

- Return 200 with empty arrays/objects if no data found
- Return 400 for invalid date parameters
- Return 500 for database errors with sanitized messages
- Log errors server-side for debugging

---

## Frontend Integration

### New SWR Hook

**File**: `src/services/swr/api-hooks/useCRMDashboardApi.js`

```javascript
import useSWR from 'swr';

export const useCRMDashboardApi = (options = {}) => {
  const { dateFrom, dateTo } = options;

  const params = new URLSearchParams();
  if (dateFrom) params.append('dateFrom', dateFrom);
  if (dateTo) params.append('dateTo', dateTo);
  const queryString = params.toString() ? `?${params.toString()}` : '';

  const { data: dealsMetrics, error: dealsMetricsError } = useSWR(
    `/api/crm/dashboard/deals-metrics${queryString}`
  );

  const { data: kpis, error: kpisError } = useSWR(
    `/api/crm/dashboard/kpis${queryString}`
  );

  const { data: revenue, error: revenueError } = useSWR(
    `/api/crm/dashboard/revenue${queryString}`
  );

  const { data: leadSources, error: leadSourcesError } = useSWR(
    `/api/crm/dashboard/lead-sources${queryString}`
  );

  const { data: acquisitionCost, error: acquisitionCostError } = useSWR(
    `/api/crm/dashboard/acquisition-cost${queryString}`
  );

  const { data: salesFunnel, error: salesFunnelError } = useSWR(
    `/api/crm/dashboard/sales-funnel${queryString}`
  );

  const { data: lifetimeValue, error: lifetimeValueError } = useSWR(
    `/api/crm/dashboard/lifetime-value${queryString}`
  );

  const { data: activeUsers, error: activeUsersError } = useSWR(
    `/api/crm/dashboard/active-users${queryString}`
  );

  const isLoading = !dealsMetrics && !kpis && !revenue && !leadSources &&
                    !acquisitionCost && !salesFunnel && !lifetimeValue && !activeUsers;

  const hasError = dealsMetricsError || kpisError || revenueError || leadSourcesError ||
                   acquisitionCostError || salesFunnelError || lifetimeValueError || activeUsersError;

  return {
    dealsMetrics,
    kpis,
    revenue,
    leadSources,
    acquisitionCost,
    salesFunnel,
    lifetimeValue,
    activeUsers,
    isLoading,
    hasError
  };
};
```

---

### Component Updates

**Components to Update** (8 total):

1. `src/components/sections/dashboards/crm/CRMGreeting.jsx`
2. `src/components/sections/dashboards/crm/kpi/CRMKPIs.jsx`
3. `src/components/sections/dashboards/crm/generated-revenue/CRMGeneratedRevenue.jsx`
4. `src/components/sections/dashboards/crm/lead-sources/LeadSources.jsx`
5. `src/components/sections/dashboards/crm/acquisition-cost/AcquisitionCost.jsx`
6. `src/components/sections/dashboards/crm/sale-funnel/SaleFunnel.jsx`
7. `src/components/sections/dashboards/crm/avg-lifetime-value/AvgLifetimeValue.jsx`
8. `src/components/sections/dashboards/crm/active-users/ActiveUsers.jsx`

**Update Pattern** (each component):

```javascript
// BEFORE (mock data)
import { dealsData } from 'data/crm/dashboard';

const CRMGreeting = () => {
  return <div>{dealsData.map(...)}</div>;
};

// AFTER (live data)
import { useCRMDashboardApi } from 'services/swr/api-hooks/useCRMDashboardApi';
import { CircularProgress, Alert } from '@mui/material';

const CRMGreeting = () => {
  const { dealsMetrics, isLoading, hasError } = useCRMDashboardApi();

  if (isLoading) return <CircularProgress />;
  if (hasError) return <Alert severity="error">Failed to load data</Alert>;
  if (!dealsMetrics) return <Alert severity="info">No data available</Alert>;

  return <div>{dealsMetrics.map(...)}</div>;
};
```

---

### Mock Data Cleanup

**File to Delete**: `src/data/crm/dashboard.js`

**Verification Steps**:
1. Search codebase for imports from `data/crm/dashboard`
2. Ensure all 8 dashboard components use live data
3. Run tests to verify no broken imports
4. Delete file after verification

---

## Testing Strategy

### Layer 1 - Data Layer Tests

**File**: `tests/crm/phase1.5-data-layer.spec.js`

**Test Cases**:
- Verify seed data creates ~50 deals, ~30 contacts, ~100 activities
- Test RLS policies isolate user data correctly
- Verify indexes exist and are being used (EXPLAIN ANALYZE)
- Test date range filtering at database level
- Verify new columns `acquisition_cost` and `lifetime_value` exist

**Success Criteria**: All queries return correct results, indexes used in query plans

---

### Layer 2 - API Layer Tests

**File**: `tests/crm/phase1.5-api-layer.spec.js`

**Test Cases** (for each of 8 endpoints):
- Test endpoint returns correct structure
- Verify aggregations are mathematically correct (known seed data → expected results)
- Test date range parameters work correctly (`dateFrom`, `dateTo`)
- Test empty results (user with no data)
- Test error handling (invalid dates, missing auth)
- Test response times (< 500ms per endpoint)

**Success Criteria**: All endpoints return data in expected format, aggregations accurate

---

### Layer 3 - UI Layer Tests

**File**: `tests/crm/phase1.5-ui-layer.spec.js`

**Test Cases**:
- Verify all 8 dashboard sections render with live data
- Test loading states appear during fetch (mock slow response)
- Test error states display correctly (mock API error)
- Verify charts render with correct data points
- Test that mock data file is no longer imported
- Verify date range picker changes data (if implemented)

**Success Criteria**: All components render, loading/error states work

---

### Layer 4 - E2E Integration Tests

**File**: `tests/crm/phase1.5-e2e.spec.js`

**Test Scenarios**:

1. **Full Dashboard Load**:
   - Login as test user
   - Navigate to `/dashboard/crm`
   - Verify all 8 sections load without errors
   - Verify charts render with data points
   - Take screenshot for visual regression

2. **Data Refresh on Create**:
   - Navigate to dashboard, note current metrics
   - Create new deal via `/apps/crm/deals`
   - Return to dashboard
   - Verify metrics updated (deals created count incremented)

3. **Date Range Filtering** (if implemented):
   - Change date range picker
   - Verify data updates across all sections
   - Verify loading states during refetch

4. **Multi-User Isolation**:
   - Login as User A, view dashboard (note metrics)
   - Logout, login as User B, view dashboard
   - Verify User B sees different data (RLS working)

**Success Criteria**: All E2E flows complete successfully, screenshots captured

---

## Seed Data Requirements

### Realistic Business Scenarios

**Deals** (~50 total):
- **Stages Distribution**:
  - Awareness: 10 deals
  - Research: 8 deals
  - Intent: 7 deals
  - Evaluation: 6 deals
  - Negotiation: 5 deals
  - Won: 8 deals
  - Lost: 6 deals

- **Sources Distribution**:
  - Organic: 15 deals
  - Marketing: 12 deals
  - Social media: 13 deals
  - Blog posts: 10 deals

- **Date Distribution**: Last 120 days (4 months) with weighted distribution toward recent dates

- **Values**: Range from $5,000 to $150,000, realistic for B2B SaaS

- **CAC & LTV**:
  - Acquisition cost: $500 - $5,000 per deal
  - Lifetime value: 3x - 5x acquisition cost

**Contacts** (~30 total):
- Mix of contacts with and without deals
- Created dates spread over last 90 days
- Various companies (some contacts share companies)

**Activities** (~100 total):
- **Types Distribution**:
  - Calls: 25
  - Emails: 30
  - Meetings: 20
  - Notes: 15
  - Tasks: 10

- **Date Distribution**: Last 30 days, concentrated on weekdays

- **User Distribution**: Mix of activities from test user (for RLS testing)

**Seed File**: `database/seeds/004_dashboard_analytics_data.sql`

---

## Verification Criteria

### Code Quality
- [ ] All tests passing (0 failures) across all 4 test layers
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] All 8 API endpoints respond in < 500ms

### Functionality
- [ ] All 8 dashboard sections display live data
- [ ] Charts render with correct data points
- [ ] Loading states appear during data fetch
- [ ] Error states handle API failures gracefully
- [ ] Mock data file deleted (`src/data/crm/dashboard.js`)
- [ ] Date range filtering works (if implemented)

### Performance
- [ ] Dashboard initial load < 2 seconds
- [ ] All database queries use indexes (verify with EXPLAIN)
- [ ] No N+1 query issues
- [ ] SWR caching prevents redundant API calls

### Security
- [ ] RLS policies enforce user isolation
- [ ] No sensitive data exposed in API responses
- [ ] Input validation on all date parameters
- [ ] Error messages don't leak database details

---

## Implementation Sequence

1. **Database Layer** (supabase-database-architect):
   - Create migration for new columns and indexes
   - Create seed data file with realistic scenarios
   - Apply migration and seeds
   - Verify indexes with EXPLAIN ANALYZE

2. **API Layer** (wiring-agent):
   - Create 8 API route handlers
   - Implement aggregation queries
   - Add error handling and input validation
   - Test each endpoint manually

3. **Frontend Layer** (react-mui-frontend-engineer):
   - Create `useCRMDashboardApi` SWR hook
   - Update 8 dashboard components to use live data
   - Add loading and error states
   - Remove mock data imports and delete file

4. **Testing** (playwright-tester):
   - Layer 1: Data layer tests
   - Layer 2: API layer tests
   - Layer 3: UI layer tests
   - Layer 4: E2E integration tests

5. **Verification**:
   - Run all tests, ensure 0 failures
   - Run build and lint
   - Verify dashboard performance
   - Capture screenshots

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Query performance degrades with more data | Add indexes strategically, use EXPLAIN to verify, consider materialized views for future |
| Percentile calculations complex | Use PostgreSQL `PERCENTILE_CONT` built-in function, test with known data |
| Chart library incompatible with API response | Match API response structure to existing mock data format exactly |
| Date range filtering edge cases | Comprehensive API tests with boundary dates, timezone handling |
| RLS policies too restrictive | Test with multiple users, verify isolation works correctly |

---

## Future Enhancements (Post-MVP)

- Real-time dashboard updates (WebSocket subscriptions)
- Export dashboard data to CSV/PDF
- Custom date range picker UI
- Dashboard widgets customization
- Drill-down views for each metric
- Comparison to previous periods (YoY, MoM)
- Forecasting and trend predictions
- Team-level aggregations (not just user-level)

---

## Related Documentation

- [Phase 1.1 - Deals Kanban](./phase1.1-deals-kanban.md)
- [Phase 1.2 - Add Contact Form](./phase1.2-add-contact-form.md)
- [Phase 1.3 - Lead Details](./phase1.3-lead-details.md)
- [Phase 1.4 - Deal Details](./phase1.4-deal-details.md)
- [CRM Database Wiring INDEX](../INDEX-crm-database-wiring.md)

---

**Design Complete**: 2026-01-31
**Ready for Implementation**: Yes
**Estimated Effort**: 1 phase (all-at-once implementation)
