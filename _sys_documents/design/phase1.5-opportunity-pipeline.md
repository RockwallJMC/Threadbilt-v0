# Phase 1.5: Opportunities Pipeline - Implementation Plan

**Phase**: 1.5
**Target**: Week 5 (February 24-28, 2026)
**Impact**: High
**Dependencies**: Phase 1.2 (Auth & Multi-Tenancy - for Supabase integration)
**GitHub Issue**: #9
**Feature Branch**: `feature/desk-opportunities-phase1.5`

---

## Executive Summary

Phase 1.5 transforms the existing deals Kanban into a comprehensive opportunities management system, the core of the CRM sales pipeline. This phase renames all deals terminology to opportunities, adds list/table views, implements forecasting dashboards, and integrates lead-to-opportunity conversion.

**Key Deliverables:**
- OpportunitiesKanban (renamed from DealsKanban with database-aligned stages)
- OpportunitiesTable (list view with stage filters, search, sorting)
- ForecastingDashboard (total pipeline, weighted forecast, stage breakdown)
- useOpportunitiesApi (6 SWR hooks with TODO markers for Phase 1.2)
- Updated ConvertLeadModal (creates opportunities from leads)
- 38 E2E tests (30 active with mock data, 8 multi-tenancy pending Phase 1.2)

**Business Value:**
- Complete sales pipeline visibility (Kanban + list views)
- Accurate sales forecasting (weighted by probability)
- Seamless lead-to-opportunity conversion
- Foundation for Phase 1.6 (Proposals) and Phase 1.7 (CRM Dashboard)

**Strategy:**
- Mock data first (following Phase 1.3/1.4 pattern)
- TODO markers for Supabase integration after Phase 1.2
- Leverage existing deals implementation (rename, not rebuild)

---

## Current State

**Completed (Phase 1.1)**:
- ✅ Database schema deployed (opportunities table with RLS)
- ✅ 19 columns: id, organization_id, account_id, name, value, probability, stage, expected_close_date, etc.
- ✅ Multi-tenant RLS policies
- ✅ 5 pipeline stages: qualification, proposal, negotiation, closed_won, closed_lost

**Completed (Phase 1.3)**:
- ✅ Accounts & Contacts UI with SWR hooks
- ✅ Mock data pattern with TODO markers established

**Completed (Phase 1.4)**:
- ✅ Leads Management UI with ConvertLeadModal
- ✅ Lead-to-opportunity conversion foundation
- ✅ SWR hooks pattern (useLeadApi)

**In Progress (Phase 1.2 - 60%)**:
- 🚧 Supabase Auth integration
- 🚧 Organization context
- ⏳ Pending: Full RLS validation

**Foundation Available**:
- ✅ Complete deals Kanban with @dnd-kit drag-drop
- ✅ DealsProvider + DealsReducer (state management)
- ✅ Deal details page with rich tabs
- ✅ Mock deals data (17 opportunities across 5 stages)

---

## Implementation Plan

### Step 1: Rename Core Files ✅ COMPLETE

**Duration**: 1-2 hours
**Status**: ✅ Complete

**Files renamed (git mv):**
- `src/providers/DealsProvider.jsx` → `OpportunitiesProvider.jsx`
- `src/reducers/DealsReducer.js` → `OpportunitiesReducer.js`
- `src/data/crm/deals.js` → `opportunities.js`

**Results:**
- All imports updated throughout codebase
- Variables renamed: `dealsDispatch` → `opportunitiesDispatch`
- Context renamed: `useDealsContext` → `useOpportunitiesContext`
- Build verification: ✅ Success

### Step 2: Update Mock Data ✅ COMPLETE

**Duration**: 1-2 hours
**Status**: ✅ Complete

**File**: `src/data/crm/opportunities.js`

**Changes implemented:**
1. ✅ Aligned stages with database schema (qualification, proposal, negotiation, closed_won, closed_lost)
2. ✅ Added database fields to all 17 opportunities:
   - `converted_from_lead_id`
   - `probability` (aligned with stage: 25%, 50%, 75%, 100%, 0%)
   - `stage_changed_at`
   - `expected_close_date`
   - `actual_close_date`
3. ✅ Created `OPPORTUNITY_STAGES` configuration
4. ✅ Distribution: 4 qualification, 4 proposal, 4 negotiation, 3 won, 2 lost

### Step 3: Rename Component Directory ✅ COMPLETE

**Duration**: 2-3 hours
**Status**: ✅ Complete

**Directory renamed**: `src/components/sections/crm/deals/` → `opportunities/`

**16 component files renamed:**
- `DealsKanban.jsx` → `OpportunitiesKanban.jsx`
- `DealsHeader.jsx` → `OpportunitiesHeader.jsx`
- `DealCard.jsx` → `OpportunityCard.jsx`
- `CreateDealDialog.jsx` → `CreateOpportunityDialog.jsx`
- Plus 12 supporting files

**Find/replace applied:**
- "Deal" → "Opportunity"
- "deal" → "opportunity"
- "deals" → "opportunities"
- "Deals" → "Opportunities"

**Results:**
- All imports updated
- UI text strings updated
- Build verification: ✅ Success

### Step 4: Update Routes & Navigation ✅ COMPLETE

**Duration**: 1 hour
**Status**: ✅ Complete

**Files modified:**
1. `src/routes/paths.js` - Added opportunities routes
2. `src/routes/sitemap.js` - Updated CRM navigation
3. `src/app/(main)/apps/crm/deals/` → `opportunities/` - Directory renamed

**Routes added:**
- `/apps/crm/opportunities` (Pipeline/Kanban)
- `/apps/crm/opportunities/list` (Table view)
- `/apps/crm/opportunities/forecast` (Dashboard)
- `/apps/crm/opportunities/[id]` (Detail page)

**Results:**
- Navigation updated with "Opportunities" menu
- Icon: `material-symbols:trending-up`
- Build verification: ✅ Success

### Step 5: Create useOpportunitiesApi SWR Hooks

**Duration**: 2-3 hours
**Status**: 🚧 In Progress
**Assigned**: wiring-agent

**File to create**: `src/services/swr/api-hooks/useOpportunitiesApi.js`

**Hooks to implement:**
1. `useOpportunities(filters)` - Fetch all with stage/search/account filters
2. `useOpportunity(id)` - Fetch single opportunity
3. `useCreateOpportunity()` - Create new opportunity
4. `useUpdateOpportunity()` - Update existing
5. `useDeleteOpportunity()` - Delete opportunity
6. `useOpportunityForecast()` - Calculate pipeline metrics

**Requirements:**
- Follow `useLeadApi.js` pattern exactly
- Mock fetchers with 100ms delay
- TODO markers in all 6 fetchers for Phase 1.2
- Optimistic updates with SWR mutate
- Filter support: stage, search, assigned_to, account_id

**Forecast calculations:**
- Total pipeline value: `SUM(value)` for open stages
- Weighted forecast: `SUM(value × probability / 100)`
- Stage breakdown: Count and value per stage
- Expected wins: Opportunities closing in next 30 days

### Step 6: Create OpportunitiesTable Component

**Duration**: 3-4 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**File to create**: `src/components/sections/crm/opportunities-list/OpportunitiesTable.jsx`

**Pattern**: Copy from `LeadsTable.jsx`

**Columns:**
- Name (link to detail)
- Account (link to account page)
- Value (formatted currency)
- Probability (percentage)
- Stage (chip with color coding)
- Expected Close Date
- Assigned To (user avatar + name)
- Actions (view, edit, delete dropdown)

**Features:**
- DataGrid with pagination (25/50/100 per page)
- Stage filter tabs: All, Qualification, Proposal, Negotiation, Won, Lost
- Search by name/account
- Sort by value, close date, created date
- Row selection for bulk actions
- Responsive layout

### Step 7: Create List View Page

**Duration**: 1-2 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**Files to create:**
- `src/components/sections/crm/opportunities-list/OpportunitiesListContainer.jsx`
- `src/app/(main)/apps/crm/opportunities/list/page.jsx`

**Features:**
- View toggle button (Kanban ↔ List)
- Filter controls (stage, assigned to, date range)
- Search bar
- "Add Opportunity" button
- OpportunitiesTable integration

### Step 8: Update Opportunity Detail Page

**Duration**: 2-3 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**Directory to rename**: `src/components/sections/crm/deal-details/` → `opportunity-details/`

**File to create**: `src/app/(main)/apps/crm/opportunities/[id]/page.jsx`

**Enhancements:**
1. Rename all deal → opportunity references
2. Add "Converted from Lead" section (if `converted_from_lead_id` exists)
3. Add Forecasting Widget:
   - Weighted Value: `value × (probability / 100)`
   - Days to Close: Calculate from `expected_close_date`
   - Probability indicator with color
4. Update tabs: Overview, Activities, Proposals (Phase 1.6), Analytics

### Step 9: Create Forecasting Dashboard

**Duration**: 4-5 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**Files to create:**
1. `src/utils/crm/forecastingCalculations.js` - Calculation utilities
2. `src/components/sections/crm/opportunities-forecast/ForecastingDashboard.jsx`
3. `src/app/(main)/apps/crm/opportunities/forecast/page.jsx`

**Components:**

**1. PipelineMetrics (4 metric cards):**
- Total Pipeline Value
- Weighted Forecast
- Expected Wins (count × probability)
- Avg Opportunity Size

**2. StageBreakdownChart:**
- Bar/column chart by stage
- Shows count and value per stage
- Color-coded by stage

**3. ExpectedCloseDateTimeline:**
- Timeline of upcoming closes
- Grouped by month
- Filterable by stage

**Calculations required:**
```javascript
totalPipeline = SUM(value) WHERE stage NOT IN ('closed_won', 'closed_lost')
weightedForecast = SUM(value × probability / 100) WHERE stage NOT IN ('closed_won', 'closed_lost')
avgOpportunitySize = totalPipeline / COUNT(opportunities)
expectedWins = COUNT WHERE expected_close_date <= NOW() + 30 days
```

### Step 10: Update Lead Conversion

**Duration**: 1-2 hours
**Status**: ⏳ Pending
**Assigned**: wiring-agent

**Files to modify:**
1. `src/components/sections/crm/leads/ConvertLeadModal.jsx`
2. `src/services/swr/api-hooks/useLeadApi.js`

**Changes:**
1. Update modal title: "Convert Lead to Opportunity"
2. Add opportunity-specific fields:
   - Expected Close Date (DatePicker)
   - Opportunity Value (number input with currency format)
   - Initial Stage (Select dropdown - default to qualification)
3. Pre-fill from lead:
   - Name: `${lead.company} - ${lead.first_name} ${lead.last_name}`
   - Account: Link to existing or create new
   - Value: Parse from `lead.budget_range`

**useLeadApi.js update:**
```javascript
const useConvertLeadToOpportunity = () => {
  return useSWRMutation('leads/convert', async (leadId, opportunityData) => {
    // TODO: Replace with Supabase transaction after Phase 1.2
    // 1. INSERT INTO opportunities (...)
    // 2. UPDATE leads SET status='converted', converted_to_opportunity_id=...

    // Mock implementation
    return { success: true, opportunityId: 'opp_new' };
  });
};
```

### Step 11: Update Lead Detail Page

**Duration**: 1-2 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**File to rename**: `src/components/sections/crm/lead-details/OngoingDeals.jsx` → `OngoingOpportunities.jsx`

**Changes:**
- Show opportunities where `converted_from_lead_id` matches current lead
- Display as cards: name, value, stage, probability
- Link to opportunity detail page
- Show "No opportunities yet" if none exist
- Update all "deal" references to "opportunity"

### Step 12: Integrate Kanban with SWR

**Duration**: 2-3 hours
**Status**: ⏳ Pending
**Assigned**: wiring-agent

**File to modify**: `src/providers/OpportunitiesProvider.jsx`

**Changes:**
1. Replace mock data with `useOpportunities()` hook
2. Update reducer actions to call mutation hooks:
   - `handleDragEnd` → `updateOpportunity({ stage: newStage })`
   - `addNewOpportunity` → `createOpportunity(data)`
3. Implement optimistic updates with SWR mutate
4. Add error handling with toast notifications
5. Add loading states during mutations

### Step 13: Create E2E Tests

**Duration**: 3-4 hours
**Status**: ⏳ Pending
**Assigned**: playwright-tester

**Files to create:**
1. `tests/crm-opportunities.spec.js` (30 active tests)
2. `tests/crm-opportunities-multi-tenancy.spec.js` (8 tests marked .skip())

**Test suites:**

**crm-opportunities.spec.js:**
1. Kanban View (12 tests):
   - Renders all 5 stages
   - Drag opportunity between stages
   - Create new opportunity dialog
   - Update opportunity value inline
   - Delete opportunity with confirmation

2. List View (10 tests):
   - Table renders with all columns
   - Stage filter tabs work
   - Search filters opportunities
   - Sort by value, close date
   - Navigate to detail page

3. Lead Conversion (8 tests):
   - Convert button appears on qualified leads
   - Modal opens with pre-filled data
   - Creates opportunity successfully
   - Updates lead status to 'converted'
   - Links lead to opportunity

4. Forecasting (8 tests):
   - Dashboard renders all metrics
   - Total pipeline calculated correctly
   - Weighted forecast calculated correctly
   - Stage breakdown chart displays
   - Win rate calculated correctly

**crm-opportunities-multi-tenancy.spec.js (.skip()):**
1. Organization data isolation (3 tests)
2. RLS policy verification (3 tests)
3. Cross-organization access prevention (2 tests)

### Step 14: Verification & Polish

**Duration**: 2-3 hours
**Status**: ⏳ Pending

**Commands to run:**
```bash
npm run lint
npm run build
npm run test:e2e -- crm-opportunities
```

**Manual testing checklist:**
- [ ] Navigate to `/apps/crm/opportunities` - Kanban renders
- [ ] Drag opportunity between stages - updates correctly
- [ ] Create new opportunity - dialog works
- [ ] Navigate to `/apps/crm/opportunities/list` - Table renders
- [ ] Filter by stage - shows correct opportunities
- [ ] Search opportunities - filters correctly
- [ ] Click opportunity row - Detail page loads
- [ ] Navigate to `/apps/crm/opportunities/forecast` - Dashboard renders
- [ ] Verify metrics calculations are accurate
- [ ] Convert a lead - Creates opportunity, updates lead
- [ ] Check lead detail - Shows related opportunity

**Screenshots to capture:**
- Opportunities Kanban (all stages visible)
- Opportunities List with filters active
- Opportunity Detail page
- Forecasting Dashboard with metrics
- Lead conversion modal
- Converted lead showing opportunity

### Step 15: Documentation & Commit

**Duration**: 1 hour
**Status**: ⏳ Pending

**Files to create/update:**
1. Update this execution document with results
2. Update `_sys_documents/execution/INDEX-crm-desk-mvp.md` (Phase 1.5 status)
3. Capture verification evidence (build output, test results, screenshots)

**Commit message:**
```
Add Phase 1.5: Opportunities Pipeline (ready for Phase 1.2 integration)

## Overview
Complete opportunities management system with Kanban, list view, and
forecasting dashboard. All components functional with mock data, ready for
database integration after Phase 1.2.

## Components Added (XX new files)
- OpportunitiesKanban (renamed from DealsKanban)
- OpportunitiesTable (list view)
- ForecastingDashboard (pipeline metrics)
- OpportunityDetail (enhanced deal-details)
- Updated ConvertLeadModal for opportunity creation

## Tests Created (38 tests total)
- crm-opportunities.spec.js (30 active tests)
- crm-opportunities-multi-tenancy.spec.js (8 tests marked .skip())

## Verification Evidence
✅ Build: Exit 0
✅ Lint: 0 errors in Phase 1.5 files
✅ All components functional with mock data

## TODO Markers
XX TODO markers for Phase 1.2 Supabase integration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Progress Tracking

### Overall Progress: 27% (4 of 15 steps complete)

**Completed (27%):**
- [x] Step 1: Rename core files ✅
- [x] Step 2: Update mock data ✅
- [x] Step 3: Rename component directory ✅
- [x] Step 4: Update routes & navigation ✅

**In Progress (7%):**
- [~] Step 5: Create useOpportunitiesApi SWR hooks

**Pending (66%):**
- [ ] Step 6: Create OpportunitiesTable
- [ ] Step 7: Create list view page
- [ ] Step 8: Update opportunity detail page
- [ ] Step 9: Create forecasting dashboard
- [ ] Step 10: Update lead conversion
- [ ] Step 11: Update lead detail page
- [ ] Step 12: Integrate Kanban with SWR
- [ ] Step 13: Create E2E tests
- [ ] Step 14: Verification & polish
- [ ] Step 15: Documentation & commit

### Files Changed So Far

**Renamed (21 files):**
- Core: 3 files (Provider, Reducer, data)
- Components: 16 files (Kanban and supporting components)
- Routes: 2 directories (deals → opportunities)

**Modified (3 files):**
- `src/routes/paths.js` - Added opportunity routes
- `src/routes/sitemap.js` - Updated navigation
- `_sys_documents/execution/INDEX-crm-desk-mvp.md` - Updated Phase 1.5 status

**To be created (15+ files):**
- API hooks: 1 file
- List view components: 2 files
- Forecasting components: 3 files
- Tests: 2 files
- Pages: 3 files
- Supporting utilities: 1 file

---

## Integration Points (TODO Markers)

### Estimated TODO Markers: 18-22 total

**useOpportunitiesApi.js (6 markers):**
- `useOpportunities` fetcher
- `useOpportunity` fetcher
- `useCreateOpportunity` mutation
- `useUpdateOpportunity` mutation
- `useDeleteOpportunity` mutation
- `useOpportunityForecast` calculation

**ConvertLeadModal.jsx (1 marker):**
- Lead-to-opportunity conversion transaction

**OpportunitiesProvider.jsx (3 markers):**
- Real-time subscriptions
- Stage change mutations
- Opportunity creation mutations

**Forecasting calculations (2 markers):**
- Database-based forecast queries
- Real-time pipeline calculations

---

## Verification Checklist

### Build & Lint
- [x] `npm run build` - Exit code 0 (Steps 1-4)
- [x] `npm run lint` - 0 errors in modified files (Steps 1-4)
- [ ] No TypeScript/import errors (final check)

### Component Verification
- [x] 21 files renamed with git mv
- [x] All imports updated
- [x] No broken "deal" references in opportunities code
- [ ] All new components created
- [ ] All routes functional

### Data Verification
- [x] Mock data matches database schema
- [x] 17 opportunities across 5 stages
- [x] OPPORTUNITY_STAGES configuration correct
- [ ] Forecasting calculations accurate

### E2E Tests
- [ ] 30 active tests pass with mock data
- [ ] 8 multi-tenancy tests marked `.skip()`
- [ ] All test files created
- [ ] Screenshots captured

### Manual Testing
- [ ] All pages load without errors
- [ ] Drag-drop works in Kanban
- [ ] List view filters work
- [ ] Forecasting metrics accurate
- [ ] Lead conversion creates opportunities

---

## Dependencies & Blockers

**Blocks:**
- Phase 1.6 (Proposals & PDF Export)
- Phase 1.7 (CRM Dashboard & Reports)

**Blocked by:**
- Phase 1.2 (Auth & Multi-Tenancy) - 60% complete
  - Required for: Supabase integration
  - Required for: Multi-tenancy E2E tests
  - Required for: Removing TODO markers

**Current Blockers:** None (mock data strategy unblocks Phase 1.5)

---

## Risk Register

| Risk | Impact | Probability | Mitigation | Status |
|------|--------|-------------|------------|--------|
| Forecasting calculations incorrect | Medium | Low | Unit tests for calculations, manual verification | Open |
| Drag-drop breaks after rename | High | Low | Incremental testing after each rename step | Mitigated |
| Missing TODO markers | Medium | Medium | Systematic review, grep for Supabase references | Open |
| Phase 1.2 delays impact timeline | High | Medium | Mock data first strategy (already in use) | Mitigated |
| E2E tests flaky | Medium | Low | Use Playwright best practices, proper waits | Open |

---

## Success Criteria

- [x] All existing deals code renamed to opportunities (Steps 1-4)
- [ ] Kanban view fully functional with 5 stages
- [ ] List/table view operational with filters
- [ ] Forecasting dashboard showing accurate metrics
- [ ] Lead conversion creates opportunities
- [ ] 38 E2E tests created (30 active, 8 pending)
- [x] Build passes (exit 0) for Steps 1-4
- [x] Lint passes (0 errors) for Steps 1-4
- [x] Mock data aligns with database schema
- [ ] 18-22 TODO markers documented for Phase 1.2
- [ ] All screenshots captured
- [ ] Documentation complete

---

**Status**: 🚧 In Progress (27% complete)
**Next Action**: Complete Step 5 (useOpportunitiesApi hooks)
**Owner**: Pierce Team + Claude Code
**Last Updated**: 2026-01-28
