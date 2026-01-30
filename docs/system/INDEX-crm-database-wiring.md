---
feature: "CRM Section - Complete Database Wiring"
github_issue: "#57"
feature_branch: "feature/desk-crm-database-wiring"
pr_number: "TBD"
status: "in-progress"
started: "2026-01-30"
target_completion: "TBD"
actual_completion: ""
team: ["claude", "pierce"]
impact_level: "deep"
---

> **GitHub Workflow Note:** For all GitHub issue/PR creation and updates, use the `Skill("github-workflow")` tool.
> See `.claude/skills/github-workflow/SKILL.md` for complete templates and workflows with agent identification requirements.

# INDEX: CRM Section - Complete Database Wiring

## Feature Overview

Convert the entire CRM section from mock data to live Supabase database integration. The CRM section consists of 5 fully-implemented UI pages (73 CRM components + 17 dashboard components) currently using hardcoded mock data from 4 data files. This project will implement database schema, migrations, RLS policies, API endpoints, SWR data hooks, and complete integration testing while preserving all existing UI/UX.

**Key Deliverables:**
- Supabase schema with 5 tables (companies, contacts, deals, deal_collaborators, activities)
- 20+ API endpoints for CRUD operations
- 8+ SWR data fetching hooks
- Complete test coverage (data, API, UI, E2E layers)
- Remove all 4 mock data files
- Dashboard analytics powered by real aggregations

**Business Value:**
- Real data persistence across sessions
- Multi-user CRM functionality
- Accurate analytics and reporting
- Foundation for advanced CRM features (automations, integrations, AI)

## GitHub Tracking

- **Issue**: #57 - [View Issue](https://github.com/RockwallJMC/piercedesk6/issues/57)
- **Feature Branch**: `feature/desk-crm-database-wiring`
- **Pull Requests**: Task-level PRs created after each task completion (List page → Create page → Interaction pages → Dashboard)

All phase progress updates are posted to the GitHub issue for external coordination and visibility.

## Phase Breakdown

### Phase 1.1: List Page - Deals Kanban
- **Doc**: [`docs/system/design/phase1.1-deals-kanban.md`](docs/system/design/phase1.1-deals-kanban.md)
- **Type**: Design + Execution
- **Status**: ⏳ Planned
- **Assigned**: TBD
- **Scope**:
  - Tables: companies, contacts, deals, deal_collaborators
  - Endpoints: GET /api/crm/deals, PATCH /api/crm/deals/[id], POST /api/crm/deals
  - Page: /apps/crm/deals (Kanban board with drag-and-drop)
- **Tests**: Data layer → API layer → UI layer → E2E (drag-and-drop updates DB)
- **Verification**: Kanban functional with live data, drag-and-drop persists
- **Completed**: ""

### Phase 1.2: Create Page - Add Contact Form
- **Doc**: [`docs/system/design/phase1.2-add-contact-form.md`](docs/system/design/phase1.2-add-contact-form.md)
- **Type**: Design + Execution
- **Status**: ⏳ Planned
- **Assigned**: TBD
- **Scope**:
  - Tables: contacts, companies (already exist from 1.1)
  - Endpoints: POST /api/crm/contacts, GET /api/crm/companies, POST /api/crm/companies
  - Page: /apps/crm/add-contact (multi-step form)
- **Tests**: Data layer → API layer → UI layer → E2E (form submission creates contact)
- **Verification**: Form submits successfully, redirects to lead-details with new contact
- **Completed**: ""

### Phase 1.3: Interaction Page - Lead Details (Simpler)
- **Doc**: [`docs/system/design/phase1.3-lead-details.md`](docs/system/design/phase1.3-lead-details.md)
- **Type**: Design + Execution
- **Status**: ⏳ Planned
- **Assigned**: TBD
- **Scope**:
  - Tables: contacts, deals, activities (activities added here)
  - Endpoints: GET /api/crm/contacts/[id], GET /api/crm/activities?contact_id=[id], PATCH /api/crm/contacts/[id], POST /api/crm/activities
  - Page: /apps/crm/lead-details (contact details with activity tabs)
- **Tests**: Data layer → API layer → UI layer → E2E (activity logging works)
- **Verification**: Contact details load, ongoing deals shown, activity tabs functional
- **Completed**: ""

### Phase 1.4: Interaction Page - Deal Details (Complex)
- **Doc**: [`docs/system/design/phase1.4-deal-details.md`](docs/system/design/phase1.4-deal-details.md)
- **Type**: Design + Execution
- **Status**: ⏳ Planned
- **Assigned**: TBD
- **Scope**:
  - Tables: All (deals, contacts, companies, activities, deal_collaborators)
  - Endpoints: GET /api/crm/deals/[id], PATCH /api/crm/deals/[id], GET /api/crm/deals/[id]/analytics
  - Page: /apps/crm/deal-details (comprehensive deal view)
- **Tests**: Data layer → API layer → UI layer → E2E (all relationships load)
- **Verification**: Deal details with all relations, analytics charts, activity timeline
- **Completed**: ""

### Phase 1.5: Dashboard - CRM Analytics
- **Doc**: [`docs/system/design/phase1.5-crm-dashboard.md`](docs/system/design/phase1.5-crm-dashboard.md)
- **Type**: Design + Execution
- **Status**: ⏳ Planned
- **Assigned**: TBD
- **Scope**:
  - Tables: All (requires diverse seed data ~50 deals, ~30 contacts, ~100 activities)
  - Endpoints: 8 dashboard endpoints (KPIs, revenue, lead-sources, acquisition-cost, sales-funnel, customer-feedback, lifetime-value, active-users)
  - Page: /dashboard/crm (analytics dashboard)
- **Tests**: Data layer → API layer → UI layer → E2E (dashboard reflects real data)
- **Verification**: All charts render, KPIs accurate, aggregations perform well
- **Completed**: ""

## Current Status

### Active Phase
Currently working on: Phase planning and documentation setup

### Progress Summary
- Total phases: 5
- Completed: 0 (0%)
- In progress: 0
- Pending: 5
- Blocked: 0

### Overall Progress: 0%

## Current Blockers

None currently. All phases are planned and ready to begin sequential execution.

## Technical Decisions Log

### Decision 1: Single Activities Table with JSONB Metadata
- **Date**: 2026-01-30
- **Context**: Activities include multiple types (calls, emails, meetings, notes, tasks) with different attributes
- **Decision**: Use single `activities` table with `metadata` JSONB column for type-specific fields
- **Rationale**: Simplicity, flexibility, and easy cross-type queries outweigh strict typing benefits
- **Impact**: Phases 1.3, 1.4, 1.5 (all activity-related functionality)

### Decision 2: Kanban Stage Updates via PATCH
- **Date**: 2026-01-30
- **Context**: Deals move between Kanban columns via drag-and-drop
- **Decision**: Update `deals.stage` and `deals.stage_order` fields via PATCH endpoint
- **Rationale**: Simple, direct approach sufficient for MVP; can add custom stages table later if needed
- **Impact**: Phase 1.1 (Kanban drag-and-drop persistence)

### Decision 3: User-Scoped RLS Policies
- **Date**: 2026-01-30
- **Context**: Multi-tenant data isolation required
- **Decision**: Implement RLS policies filtering by `auth.uid()` on all tables
- **Rationale**: Security best practice, prevents data leaks even if application logic fails
- **Impact**: All phases (every table has RLS policies)

### Decision 4: Bottom-Up Implementation Order
- **Date**: 2026-01-30
- **Context**: 5 pages with varying dependency complexity
- **Decision**: List → Create → Interaction (simple) → Interaction (complex) → Dashboard
- **Rationale**: Validates core schema first, builds complexity incrementally, dashboard requires all data
- **Impact**: Phase execution order (1.1 → 1.2 → 1.3 → 1.4 → 1.5)

## Risk Register

| Risk | Impact | Probability | Phase | Mitigation | Owner |
|------|--------|-------------|-------|------------|-------|
| Drag-and-drop breaks with live data | High | Medium | 1.1 | Extensive Layer 3 testing, preserve @dnd-kit logic | react-mui-frontend-engineer |
| RLS policies too restrictive | Medium | Low | All | Comprehensive Layer 1 tests, seed with multiple users | supabase-database-architect |
| Dashboard queries too slow | Medium | Medium | 1.5 | Add indexes on aggregation fields, consider materialized views | supabase-database-architect |
| Mock data structure mismatch | High | Low | All | Compare mock vs schema carefully, seed data mirrors mocks | supabase-database-architect |
| Activities metadata inconsistency | Low | Medium | 1.3, 1.4 | Document JSONB schema per type, validate in API layer | wiring-agent |

## Dependencies

### External Dependencies
- Supabase project active and accessible (Status: ✅ Available)
- Next.js 15 App Router (Status: ✅ Available)
- Material-UI 7 components (Status: ✅ Available)
- @dnd-kit library for drag-and-drop (Status: ✅ Available)
- SWR for data fetching (Status: ✅ Available)

### Internal Dependencies
- Phase 1.1 must complete before 1.2 (companies, contacts tables required)
- Phase 1.2 must complete before 1.3 (contacts table required)
- Phase 1.3 must complete before 1.4 (activities table required)
- Phases 1.1-1.4 must complete before 1.5 (all tables + seed data required)

## Verification Checklist

### Code Quality
- [ ] All tests passing (0 failures) across all 4 test layers
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Code coverage ≥ 80% for new API endpoints

### Functionality
- [ ] All 5 pages functional with live data
- [ ] Mock data imports removed (0 references to src/data/crm/*.js)
- [ ] Drag-and-drop persists to database
- [ ] Forms submit and validate correctly
- [ ] Activity logging works across pages
- [ ] Dashboard analytics reflect real data

### Security & Performance
- [ ] RLS policies enforced on all tables
- [ ] Multi-user isolation tested
- [ ] Input validation on all endpoints
- [ ] Page load times < 2 seconds
- [ ] Dashboard queries optimized

### Documentation
- [ ] As-built document generated
- [ ] User-facing docs updated (if applicable)
- [ ] API endpoints documented
- [ ] Database schema documented

### Screenshots & Evidence
- [ ] Screenshots captured for all 5 pages with live data
- [ ] Drag-and-drop video captured
- [ ] Verification command outputs captured (build, lint, tests)

## Code Review

### Review Status
- [ ] Self-review complete
- [ ] Peer review complete
- [ ] Agent review complete (`superpowers:code-reviewer`)
- [ ] All feedback addressed

### Review Findings
To be updated after code review agent execution.

## Testing Evidence

### Automated Tests
```bash
# To be updated after Phase 1.1 completion
$ npx playwright test
[Test output showing passing tests across all 4 layers]
```

### Build Verification
```bash
# To be updated after Phase 1.1 completion
$ npm run build
[Build output showing success]
```

### Lint Verification
```bash
# To be updated after Phase 1.1 completion
$ npm run lint
[Lint output showing 0 errors]
```

## Timeline

| Milestone | Planned Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Brainstorm Complete | 2026-01-30 | 2026-01-30 | ✅ |
| INDEX Created | 2026-01-30 | 2026-01-30 | ✅ |
| Feature Branch Created | 2026-01-30 | - | ⏳ |
| Phase 1.1 Complete | TBD | - | ⏳ |
| Phase 1.2 Complete | TBD | - | ⏳ |
| Phase 1.3 Complete | TBD | - | ⏳ |
| Phase 1.4 Complete | TBD | - | ⏳ |
| Phase 1.5 Complete | TBD | - | ⏳ |
| All Phases Complete | TBD | - | ⏳ |
| Final PR Created | TBD | - | ⏳ |
| Final PR Merged | TBD | - | ⏳ |

## Related Documentation

### Design Docs
- [Brainstorm Design](docs/system/design/2026-01-30-crm-database-wiring-brainstorm.md) ✅
- [Phase 1.1 - Deals Kanban](docs/system/design/phase1.1-deals-kanban.md) ⏳
- [Phase 1.2 - Add Contact Form](docs/system/design/phase1.2-add-contact-form.md) ⏳
- [Phase 1.3 - Lead Details](docs/system/design/phase1.3-lead-details.md) ⏳
- [Phase 1.4 - Deal Details](docs/system/design/phase1.4-deal-details.md) ⏳
- [Phase 1.5 - CRM Dashboard](docs/system/design/phase1.5-crm-dashboard.md) ⏳

### Execution Docs
- To be created during each phase execution

### User Docs
- To be updated after feature completion

### As-Built Docs
- [CRM Database Wiring As-Built](docs/system/as-builts/crm-database-wiring-as-built.md) - To be created after merge

## Change Log

### v0.1 - 2026-01-30
- Feature initiated
- Brainstorm design complete
- INDEX created
- Ready for Phase 1.1 planning

## Post-Merge Notes

To be updated after final PR merge with:
- Final commit hash
- PR number and link
- Deployment status
- Follow-up tasks or known issues
