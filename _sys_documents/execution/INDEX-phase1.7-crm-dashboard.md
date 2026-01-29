---
feature: 'CRM Dashboard & Reports - Phase 1.7'
github_issue: '#15'
feature_branch: 'feature/desk-crm-dashboard-phase1.7'
pr_number: ''
status: 'planned'
started: ''
target_completion: '2026-03-07' # Week 6 target from CRM MVP INDEX
actual_completion: ''
team: ['claude', 'user']
impact_level: 'deep'
parent_feature: 'CRM Desk - MVP Implementation'
parent_index: '_sys_documents/execution/INDEX-crm-desk-mvp.md'
---

# INDEX: CRM Dashboard & Reports - Phase 1.7

## Feature Overview

Implement comprehensive CRM Dashboard and reporting views that provide executives and sales managers with real-time visibility into pipeline health, sales performance, and forecasting accuracy. This phase consolidates metrics from Phases 1.3-1.6 (Accounts, Contacts, Leads, Opportunities, Proposals) into actionable visualizations.

**Key Deliverables:**

- CRM Dashboard page with 12+ metric widgets
- Pipeline health visualization (value by stage, trend analysis)
- Conversion funnel tracking (lead → opportunity → won)
- Lead source performance analytics
- Proposal acceptance metrics
- Activity timeline aggregation
- Forecasting accuracy reports
- Export functionality (PDF, CSV, Excel)
- Comprehensive E2E test coverage

**Business Value:**

- Real-time visibility into sales pipeline health
- Data-driven decision making for sales leadership
- Early identification of pipeline bottlenecks
- ROI tracking for lead sources
- Performance benchmarking against targets
- Foundation for predictive analytics (future phases)

## GitHub Tracking

- **Issue**: #15 - [View Issue](https://github.com/RockwallJMC/piercedesk6/issues/15)
- **Feature Branch**: `feature/desk-crm-dashboard-phase1.7`
- **Pull Request**: TBD - [View PR](https://github.com/RockwallJMC/piercedesk6/pull/{number}) (after PR creation)

All phase progress updates are posted to the GitHub issue for external coordination and visibility.

## Phase Breakdown

### Phase 1.7.1: Core Dashboard Infrastructure

- **Doc**: [`_sys_documents/design/phase1.7.1-dashboard-infrastructure.md`](_sys_documents/design/phase1.7.1-dashboard-infrastructure.md)
- **Type**: Design + Implementation
- **Status**: ⏳ Planned
- **Assigned**: react-mui-frontend-engineer agent
- **Verification**: Pending
- **Target**: Week 6 Day 1-2 (2026-03-03 to 2026-03-04)

**Deliverables:**

- Dashboard page route `/apps/crm/dashboard`
- Dashboard layout container with responsive grid
- DashboardWidgetContainer reusable component
- CRMDashboardProvider (state management: date filters, widget visibility)
- useDashboardApi.js (SWR hooks with mock aggregations + TODO markers)
- Mock aggregated data in `/src/data/crm/dashboard-metrics.js`
- Integration with existing chart utilities

### Phase 1.7.2: KPI Metrics Widgets

- **Doc**: [`_sys_documents/execution/phase1.7.2-kpi-widgets.md`](_sys_documents/execution/phase1.7.2-kpi-widgets.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: react-mui-frontend-engineer agent
- **Progress**: 0%
- **Blockers**: None (Phase 1.7.1 complete)
- **Target**: Week 6 Day 2-3 (2026-03-04 to 2026-03-05)

**Widgets to Create (8 widgets):**

1. **TotalPipelineValue** - Sum of all open opportunities
2. **WeightedForecast** - Probability-adjusted pipeline value
3. **LeadConversionRate** - % of leads converted to opportunities
4. **OpportunityWinRate** - % of opportunities closed won
5. **AverageDealSize** - Mean value of won opportunities
6. **AverageSalesCycle** - Mean days from opportunity created to closed won
7. **ProposalsAcceptanceRate** - % of sent proposals accepted
8. **TotalActiveAccounts** - Count of accounts with activity in last 90 days

### Phase 1.7.3: Pipeline Visualization Widgets

- **Doc**: [`_sys_documents/execution/phase1.7.3-pipeline-widgets.md`](_sys_documents/execution/phase1.7.3-pipeline-widgets.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: react-mui-frontend-engineer agent
- **Progress**: 0%
- **Blockers**: None (Phase 1.7.1 complete)
- **Target**: Week 6 Day 3-4 (2026-03-05 to 2026-03-06)

**Widgets to Create (4 widgets):**

1. **PipelineStageBreakdown** - Horizontal bar chart showing value per stage
2. **OpportunityTrendChart** - Line chart of opportunity creation vs. close rate over time
3. **PipelineVelocityChart** - Bar chart showing average days in each stage
4. **ForecastAccuracy** - Comparison of weighted forecast vs. actual closed deals (historical)

### Phase 1.7.4: Lead & Source Analytics Widgets

- **Doc**: [`_sys_documents/execution/phase1.7.4-lead-analytics.md`](_sys_documents/execution/phase1.7.4-lead-analytics.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: react-mui-frontend-engineer agent
- **Progress**: 0%
- **Blockers**: None (Phase 1.7.1 complete)
- **Target**: Week 6 Day 4-5 (2026-03-06 to 2026-03-07)

**Widgets to Create (3 widgets):**

1. **LeadSourcePerformance** - Pie chart showing lead count by source + conversion rates table
2. **LeadFunnelVisualization** - Funnel chart (new → contacted → qualified → converted)
3. **TopPerformingAccounts** - Table of accounts by total opportunity value

### Phase 1.7.5: Activity & Proposal Widgets

- **Doc**: [`_sys_documents/execution/phase1.7.5-activity-proposal-widgets.md`](_sys_documents/execution/phase1.7.5-activity-proposal-widgets.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: react-mui-frontend-engineer agent
- **Progress**: 0%
- **Blockers**: None (Phase 1.7.1 complete)
- **Target**: Week 6 Day 5 (2026-03-07)

**Widgets to Create (3 widgets):**

1. **RecentActivities** - Timeline list of last 20 activities across all CRM entities
2. **ProposalStatusBreakdown** - Donut chart showing proposals by status
3. **TopOpportunitiesByValue** - Table of top 10 opportunities with progress indicators

### Phase 1.7.6: Report Export & Testing

- **Doc**: [`_sys_documents/execution/phase1.7.6-reports-testing.md`](_sys_documents/execution/phase1.7.6-reports-testing.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: playwright-tester agent + react-mui-frontend-engineer agent
- **Progress**: 0%
- **Blockers**: None (Phases 1.7.2-1.7.5 complete)
- **Target**: Week 6 Day 5-7 (2026-03-07 to 2026-03-09 if needed)

**Deliverables:**

- Export dashboard to PDF (jsPDF + html2canvas)
- Export tables to CSV
- Export tables to Excel (xlsx library)
- Date range filter controls (last 7/30/90 days, custom range)
- Widget visibility toggle (show/hide individual widgets)
- 40+ E2E tests (35 active, 5 multi-tenancy pending Phase 1.2)
- Build verification (exit 0)
- Lint verification (0 errors)

## Current Status

### Active Phase

Not yet started - Awaiting kickoff approval

### Progress Summary

- Total phases: 6 sub-phases
- Completed: 0 (0%)
- In progress: 0
- Pending: 6
- Blocked: 0

### Overall Progress: 0%

## Current Blockers

No blockers at this time. Phase 1.7 is unblocked and ready to begin.

**Note:** Phase 1.7 uses mock data strategy (same as Phases 1.3-1.6), with TODO markers for Supabase integration after Phase 1.2 completes.

## Technical Decisions Log

### Decision 1: Extend Existing Forecasting Dashboard vs. New Dashboard Page

- **Date**: 2026-01-29
- **Context**: Phase 1.5 already created `/apps/crm/opportunities/forecast` with ForecastingDashboard.jsx containing PipelineMetrics and StageBreakdownChart. Should Phase 1.7 extend this or create new `/apps/crm/dashboard`?
- **Decision**: Create new `/apps/crm/dashboard` page as primary CRM dashboard. Keep forecasting dashboard as specialized view accessible from opportunities section.
- **Rationale**:
  - Separation of concerns: Forecasting dashboard is opportunity-centric; new dashboard is enterprise-wide CRM view
  - Different user personas: Forecasting dashboard for sales reps/managers; CRM dashboard for executives/leadership
  - Allows both views to evolve independently
  - Forecasting dashboard can be linked from new dashboard as "Deep Dive" action
- **Impact**: Phase 1.7 creates new route, new components. Forecasting dashboard remains unchanged.

### Decision 2: Chart Library Selection (ECharts vs. Recharts)

- **Date**: 2026-01-29
- **Context**: Codebase already uses ECharts (v6.0.0) with echarts-for-react wrapper and ReactEchart.jsx base component. Should we continue with ECharts or consider alternatives?
- **Decision**: Continue with ECharts for Phase 1.7 dashboards.
- **Rationale**:
  - ECharts already integrated and production-ready in codebase
  - 147 existing dashboard files use ECharts (hrm, analytics, e-commerce, hiring, project, time-tracker modules)
  - Modular setup already configured (BarChart, LineChart, PieChart, RadarChart modules)
  - ReactEchart.jsx wrapper provides consistent API
  - Excellent theming support via getThemeColor() integration
  - Rich visualization options (funnel, gauge, heatmap available if needed)
  - Active maintenance and strong documentation
- **Impact**: All Phase 1.7 charts use ECharts components via ReactEchart wrapper.

### Decision 3: Mock Data Strategy for Aggregations

- **Date**: 2026-01-29
- **Context**: Dashboard requires aggregated metrics across Phases 1.3-1.6 entities (accounts, contacts, leads, opportunities, proposals). Mock data for individual entities exists, but aggregations don't.
- **Decision**: Create separate `/src/data/crm/dashboard-metrics.js` with pre-calculated mock aggregations, rather than calculating on-the-fly from entity mock arrays.
- **Rationale**:
  - Faster development: Avoids complex aggregation logic during mock phase
  - Clearer testing: Known baseline metrics for verification
  - Realistic data: Can craft metrics that demonstrate interesting trends/patterns
  - Easy to maintain: Aggregations in one file vs. scattered calculations
  - Aligns with Phase 1.2 integration: TODO markers for Supabase aggregate queries well-defined
- **Impact**:
  - Dashboard components consume pre-calculated metrics
  - useDashboardApi hooks marked with TODO for Supabase aggregate query migration
  - ~20-25 TODO markers expected (5-8 aggregate queries with multiple calculations each)

### Decision 4: Widget Grid Layout Pattern

- **Date**: 2026-01-29
- **Context**: Dashboard needs responsive layout for 18+ widgets. Multiple layout patterns exist in codebase (fixed grid, responsive columns, custom arrangements).
- **Decision**: Use MUI Grid v7 responsive layout with configurable widget sizes and drag-and-drop ordering (future enhancement).
- **Rationale**:
  - MUI Grid v7 `size` prop supports responsive breakpoints: `{{ xs: 12, sm: 6, md: 4, lg: 3 }}`
  - Existing dashboard sections use this pattern successfully
  - Allows different widget types to occupy different grid sizes (KPI cards: 3 cols, charts: 6 cols)
  - Foundation for future enhancement: User-customizable dashboards with widget reordering
  - Accessibility: Proper semantic HTML with Grid + Paper components
- **Impact**:
  - KPI metrics: 4 columns (3 units each) on desktop, 2 columns on tablet, 1 column on mobile
  - Chart widgets: 2 columns (6 units each) on desktop, 1 column on tablet/mobile
  - Tables: Full width (12 units) on all breakpoints

### Decision 5: Export Functionality Implementation

- **Date**: 2026-01-29
- **Context**: Dashboard needs export capabilities (PDF, CSV, Excel). Multiple libraries available: jsPDF, pdfmake, SheetJS (xlsx), papaparse.
- **Decision**:
  - PDF: jsPDF + html2canvas (capture rendered dashboard as image-based PDF)
  - CSV: Native browser download with Blob API (no library needed for simple tables)
  - Excel: SheetJS (xlsx) library for multi-sheet workbooks with formatting
- **Rationale**:
  - jsPDF + html2canvas: Captures exact visual representation, works with charts
  - Blob API for CSV: Lightweight, no dependencies for simple data exports
  - SheetJS: Industry standard, supports Excel formulas and formatting
  - Alignment with Phase 1.6: Already using React-PDF for proposals; jsPDF complements for dashboard screenshots
- **Impact**:
  - Add jsPDF (~180KB) and html2canvas (~35KB) to package.json
  - Add xlsx (~650KB) to package.json
  - Export functions in `/src/utils/crm/dashboardExports.js`

## Risk Register

| Risk | Impact | Probability | Phase | Mitigation | Owner |
|------|--------|-------------|-------|------------|-------|
| Chart rendering performance with large datasets (1000+ opportunities) | Medium | Low | 1.7.3 | Implement data pagination/sampling, test with 2000 mock opportunities, optimize ECharts series config | Frontend agent |
| Dashboard layout breaks on mobile (< 600px) | High | Medium | 1.7.1 | Responsive grid testing required, stack widgets vertically on mobile, simplify chart interactions | Frontend agent |
| Export PDF quality poor for charts | Medium | Medium | 1.7.6 | Test html2canvas scaling options, consider SVG-based export for vector graphics, provide high-DPI option | Frontend agent |
| Aggregation calculations incorrect (conversion rates, win rates) | High | Low | 1.7.2 | Comprehensive unit tests for calculation helpers, validate against known baseline in mock data | Frontend agent |
| Phase 1.2 delays impact Supabase integration | High | Medium | All | Already mitigated - mock data strategy unblocks Phase 1.7, 20-25 TODO markers for Phase 1.2 integration | Orchestrator |
| Date range filtering complexity | Medium | Low | 1.7.6 | Use existing date utility helpers, test edge cases (month/year boundaries, leap years) | Frontend agent |
| Widget visibility toggle state management | Low | Low | 1.7.6 | Use React Context (CRMDashboardProvider), persist to localStorage for user preferences | Frontend agent |
| Export file size too large (PDF > 10MB) | Medium | Low | 1.7.6 | Implement compression options, allow selective widget export, optimize chart resolution | Frontend agent |

## Dependencies

### External Dependencies

**New NPM packages to install:**
- `jspdf` (^2.5.0) - PDF generation library
  - Why needed: Dashboard export to PDF functionality
  - License: MIT
- `html2canvas` (^1.4.0) - HTML to canvas rendering for PDF export
  - Why needed: Capture dashboard charts and widgets for PDF
  - License: MIT
- `xlsx` (^0.18.0 or latest) - Excel export functionality
  - Why needed: Export dashboard data to Excel workbooks
  - License: Apache-2.0

**Existing dependencies (already installed):**
- Material-UI Grid v7 (responsive layout)
- ECharts v6.0.0 + echarts-for-react (charting)
- SWR (data fetching)
- React Hook Form + Yup (form validation for filters)
- date-fns (date manipulation for filters)

### Internal Dependencies

**Phase Dependencies:**
- Phase 1.1 (Database Schema) - ✅ Complete (all CRM tables exist)
- Phase 1.3 (Accounts & Contacts) - ✅ Complete (account/contact data available)
- Phase 1.4 (Leads Management) - ✅ Complete (lead data and conversion tracking available)
- Phase 1.5 (Opportunities Pipeline) - ✅ Complete (opportunity data, stages, forecasting helpers exist)
- Phase 1.6 (Proposals & PDF Export) - 🚧 In Progress (proposal data and PDF patterns will inform Phase 1.7)

**Component Dependencies:**
- ForecastingDashboard components (Phase 1.5) - Can reference but not modify
- Mock data from Phases 1.3-1.6 must exist for dashboard aggregations
- Chart utilities (`ReactEchart.jsx`, `echart-utils.js`, `useToggleChartLegends`) available

**Blocks:**
- Phase 1.8 (Testing & Polish) - Needs dashboard complete for end-to-end flow testing

## Verification Checklist

### Code Quality

- [ ] All tests passing (0 failures)
- [ ] Build succeeds without errors (exit 0)
- [ ] No linting errors
- [ ] Code coverage ≥ 80% for dashboard calculation helpers

### Functionality

- [ ] All 18 widgets render correctly with mock data
- [ ] Date range filtering updates all widgets correctly
- [ ] Widget visibility toggles persist across sessions
- [ ] Export to PDF generates readable file (all widgets captured)
- [ ] Export to CSV downloads correct data format
- [ ] Export to Excel creates valid workbook with multiple sheets
- [ ] Responsive layout verified on mobile/tablet/desktop breakpoints
- [ ] Charts interactive (tooltips, legends, zoom where applicable)
- [ ] Navigation from dashboard to detail pages works (e.g., click opportunity in table → opens opportunity detail)

### Security & Performance

- [ ] No data leakage between organizations (mock respects org context)
- [ ] Chart rendering completes < 2 seconds with 500 mock opportunities
- [ ] Dashboard page load < 3 seconds
- [ ] Export operations complete < 5 seconds for standard dashboard
- [ ] No memory leaks from chart components (tested with React DevTools Profiler)

### Documentation

- [ ] User-facing docs updated: `docs/features/CRM-DASHBOARD.md`
- [ ] API docs updated (if backend aggregation endpoints added post-Phase 1.2)
- [ ] As-built docs generated: `_sys_documents/as-builts/phase1.7-dashboard-as-built.md`
- [ ] Code comments added for complex calculation logic

### Screenshots & Evidence

- [ ] Screenshots of dashboard (full page) captured at desktop resolution
- [ ] Screenshots of mobile layout captured
- [ ] Exported PDF sample saved to evidence folder
- [ ] Exported CSV sample saved to evidence folder
- [ ] Exported Excel sample saved to evidence folder
- [ ] Video walkthrough of dashboard interaction (2-3 minutes)
- [ ] Test output showing 0 failures captured
- [ ] Build output showing success captured

## Code Review

### Review Status

- [ ] Self-review complete
- [ ] Peer review complete (if applicable)
- [ ] Agent review complete (superpowers:code-reviewer)
- [ ] All feedback addressed

### Review Findings

To be completed during Phase 1.7.6 testing phase.

## Testing Evidence

### Automated Tests

To be captured in Phase 1.7.6

### E2E Tests

To be captured in Phase 1.7.6

### Build Verification

To be captured in Phase 1.7.6

## Timeline

| Milestone | Planned Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Feature Initiated | 2026-03-03 | - | ⏳ |
| Phase 1.7.1 Complete | 2026-03-04 | - | ⏳ |
| Phase 1.7.2 Complete | 2026-03-05 | - | ⏳ |
| Phase 1.7.3 Complete | 2026-03-06 | - | ⏳ |
| Phase 1.7.4 Complete | 2026-03-07 | - | ⏳ |
| Phase 1.7.5 Complete | 2026-03-07 | - | ⏳ |
| Phase 1.7.6 Complete | 2026-03-09 | - | ⏳ |
| PR Created | 2026-03-10 | - | ⏳ |
| PR Merged | 2026-03-11 | - | ⏳ |

## Related Documentation

### Design Docs

- [Phase 1.7.1 Dashboard Infrastructure](../design/phase1.7.1-dashboard-infrastructure.md) - To be created
- [Phase 1.5 Opportunities Pipeline](../design/phase1.5-opportunity-pipeline.md) - ✅ Existing (forecasting helpers)
- [Phase 1.6 Proposals & PDF Export](../design/phase1.6-proposals.md) - ✅ Existing (PDF generation patterns)

### User Docs

- [CRM Dashboard Feature Guide](../../docs/features/CRM-DASHBOARD.md) - To be created
- [CRM Desk Overview](../../docs/features/CRM-DESK.md) - To be updated with dashboard section

### Planning Docs

- [CRM Desk MVP INDEX](./INDEX-crm-desk-mvp.md) - ✅ Parent feature
- [Documentation Guide](../../docs/guides/DOCUMENTATION-GUIDE.md) - ✅ Framework compliance

### As-Built Docs

- Phase 1.7 Dashboard As-Built - To be created after merge

## Change Log

### v0.1 - 2026-01-29 (Planning Phase)

- INDEX created for Phase 1.7 CRM Dashboard & Reports
- 6 sub-phases defined (1.7.1 through 1.7.6)
- Technical decisions documented (5 decisions)
- 18 widgets scoped: 8 KPI metrics, 4 pipeline visualizations, 3 lead analytics, 3 activity/proposal widgets
- Dependencies identified: jsPDF, html2canvas, xlsx
- Risk register populated (8 risks)
- Verification checklist established
- Ready for Phase 1.7.1 design document creation

## Post-Merge Notes

**This section will be updated after merge with:**

- Final commit hash
- PR number and link
- Deployment status
- Any follow-up tasks or known issues
- User feedback from initial testing

---

**Status**: ⏳ Planned (Awaiting GitHub Issue Creation & Branch Setup)
**Next Action**: Create GitHub issue #TBD and feature branch `feature/desk-crm-dashboard-phase1.7`
**Owner**: Pierce Team + Claude Code
**Last Updated**: 2026-01-29
