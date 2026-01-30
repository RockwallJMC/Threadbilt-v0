---
feature: "CRM Section - Database Wiring (Phase 1.1)"
github_issue: "#49"
feature_branch: "feature/desk-crm-database-wiring"
pr_number: "TBD"
status: "in-progress"
started: "2026-01-30"
target_completion: "TBD"
actual_completion: "TBD"
team: ["claude", "pierce"]
impact_level: "deep"
---

> **GitHub Workflow Note:** For all GitHub issue/PR creation and updates, use the `/github-workflow` skill.
> See `.claude/skills/github-workflow/SKILL.md` for complete templates and workflows with agent identification requirements.

# INDEX: CRM Section - Database Wiring

## Feature Overview

Convert the Pierce Desk CRM section from mock data to live Supabase database using a systematic, bottom-up approach. This effort involves auditing existing wiring, completing missing database connections, and ensuring full CRUD functionality across all 17 CRM pages.

**Key Deliverables:**
- Complete database schema with RLS policies for all CRM entities
- API endpoints and SWR hooks for all CRUD operations
- UI components wired to live data with loading/error states
- Comprehensive test coverage (data layer, API layer, UI layer, E2E)
- Documentation and verification evidence for all changes

**Existing Infrastructure:**
- ✅ 7 Supabase tables already created (leads, contacts, accounts, opportunities, proposals, proposal_line_items, organization_members)
- ✅ 5 service hooks partially implemented (useLeadApi, useContactApi, useAccountApi, useOpportunitiesApi, useProposalApi)
- ⚠️ Wiring status varies by page - requires audit and completion

## GitHub Tracking

- **Issue**: #TBD - [View Issue](https://github.com/{org}/{repo}/issues/{number}) (to be created)
- **Feature Branch**: `feature/desk-crm-database-wiring`
- **Pull Requests**: Multiple PRs (one per page type phase)

All phase progress updates are posted to the GitHub issue for external coordination and visibility.

## Phase Breakdown

### Phase 1.1.1: List Pages (6 pages)
- **Doc**: [`docs/system/plans/plan-2026-01-30-crm-list-pages.md`](docs/system/plans/plan-2026-01-30-crm-list-pages.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: Sequential agents (supabase → wiring → react-mui → playwright-tester)
- **Pages**:
  - `/apps/crm/leads` (✅ Wired - needs audit)
  - `/apps/crm/contacts` (✅ Wired - needs audit)
  - `/apps/crm/accounts` (⚠️ Partial - needs completion)
  - `/apps/crm/opportunities` (✅ Wired - needs audit)
  - `/apps/crm/opportunities/list` (⚠️ Duplicate/alternate view - needs audit)
  - `/apps/crm/proposals` (⚠️ Partial - needs completion)
- **Progress**: 0%
- **Blockers**: None
- **PR**: TBD

### Phase 1.1.2: Create/Edit Pages (1 page)
- **Doc**: [`docs/system/plans/plan-2026-01-30-crm-create-pages.md`](docs/system/plans/plan-2026-01-30-crm-create-pages.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: Sequential agents
- **Pages**:
  - `/apps/crm/add-contact` (❌ Missing - needs full implementation)
- **Progress**: 0%
- **Blockers**: Depends on Phase 1.1.1 completion

### Phase 1.1.3: Detail/Interaction Pages (7 pages)
- **Doc**: [`docs/system/plans/plan-2026-01-30-crm-interaction-pages.md`](docs/system/plans/plan-2026-01-30-crm-interaction-pages.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: Sequential agents
- **Pages**:
  - `/apps/crm/leads/[id]` (⚠️ Partial - needs completion)
  - `/apps/crm/lead-details` (❌ Missing - needs full implementation)
  - `/apps/crm/contacts/[id]` (⚠️ Partial - needs completion)
  - `/apps/crm/accounts/[id]` (⚠️ Partial - needs completion)
  - `/apps/crm/opportunities/[id]` (⚠️ Partial - needs completion)
  - `/apps/crm/deal-details` (❌ Missing - needs full implementation)
  - `/apps/crm/proposals/[id]` (⚠️ Partial - needs completion)
- **Progress**: 0%
- **Blockers**: Depends on Phase 1.1.2 completion

### Phase 1.1.4: Dashboard/Complex Pages (3 pages)
- **Doc**: [`docs/system/plans/plan-2026-01-30-crm-dashboard-pages.md`](docs/system/plans/plan-2026-01-30-crm-dashboard-pages.md)
- **Type**: Execution
- **Status**: ⏳ Planned
- **Assigned**: Sequential agents
- **Pages**:
  - `/dashboard/crm` (❌ Missing - needs full implementation)
  - `/apps/crm/dashboard` (❌ Missing - needs full implementation)
  - `/apps/crm/opportunities/forecast` (❌ Missing - needs full implementation)
- **Progress**: 0%
- **Blockers**: Depends on Phase 1.1.3 completion

## Shared Brainstorm Document

**Location**: [`docs/system/design/brainstorm-2026-01-30-crm-section.md`](docs/system/design/brainstorm-2026-01-30-crm-section.md)

This comprehensive brainstorm document contains:
- Complete analysis of all 17 CRM pages
- Database schema for 7 tables with RLS policies
- API endpoint specifications
- Detailed test scenarios (data/API/UI/E2E)
- Implementation strategy and success criteria

**All phase plan.md files will reference this shared brainstorm document.**

## Current Status

### Active Phase
Currently working on: Phase 1.1.1 - List Pages (Planning)

### Progress Summary
- Total phases: 4 (1.1.1, 1.1.2, 1.1.3, 1.1.4)
- Completed: 0 (0%)
- In progress: 0
- Pending: 4
- Blocked: 0

### Page Status Summary
- **Total Pages**: 17
- **Fully Wired**: 0
- **Partially Wired**: 9
- **Missing/Incomplete**: 8

### Overall Progress: 0%

## Current Blockers

No blockers currently. Feature branch and initial planning documents are being created.

## Technical Decisions Log

### Decision 1: Bottom-Up Sequential Execution
- **Date**: 2026-01-30
- **Context**: Need systematic approach to wire 17 CRM pages with varying completion states
- **Decision**: Execute one complete page at a time using bottom-up pipeline: supabase-database-architect → playwright-tester (data) → wiring-agent → playwright-tester (API) → react-mui-frontend-engineer → playwright-tester (UI) → E2E test
- **Rationale**: Foundation (database) must exist before API, API before UI. Testing each layer ensures quality before moving up the stack. One page at a time allows easier debugging and rollback.
- **Impact**: All 4 phases (1.1.1-1.1.4) will follow this execution pattern

### Decision 2: Audit-First Approach
- **Date**: 2026-01-30
- **Context**: CRM section already has 7 database tables and 5 service hooks with partial wiring
- **Decision**: Audit existing wiring before implementing new features, complete missing connections, verify all CRUD operations
- **Rationale**: Avoid duplicate work, leverage existing infrastructure, ensure consistency with established patterns
- **Impact**: Phase 1.1.1 will begin with comprehensive audit of existing list pages before implementing missing functionality

### Decision 3: One PR Per Page Type
- **Date**: 2026-01-30
- **Context**: Need balance between granularity and review overhead for 17 pages across 4 phases
- **Decision**: Create one PR per page type phase (List/Create/Interaction/Dashboard), not per page or per entire section
- **Rationale**: Groups related pages together, manageable review size, allows iterative feedback between phases
- **Impact**: 4 total PRs expected for CRM section, each requiring human review before next phase begins

### Decision 4: Shared Brainstorm Document
- **Date**: 2026-01-30
- **Context**: Database schema and API patterns consistent across all CRM pages
- **Decision**: Create single comprehensive brainstorm document for entire section, referenced by all phase plans
- **Rationale**: Avoids duplication, ensures schema consistency, single source of truth for CRM data model
- **Impact**: All phase plan.md files link to brainstorm-2026-01-30-crm-section.md

### Decision 5: Sequential Testing After Each Layer
- **Date**: 2026-01-30
- **Context**: Need quality gates before proceeding up the stack
- **Decision**: Test each layer (data → API → UI) before moving to next layer, with fix/retest loop until PASS
- **Rationale**: Prevents building on broken foundation, easier to debug layer-specific issues, enforces TDD discipline
- **Impact**: playwright-tester agent invoked 4 times per page (data layer, API layer, UI layer, E2E)

## Risk Register

| Risk | Impact | Probability | Phase | Mitigation | Owner |
|------|--------|-------------|-------|------------|-------|
| Incomplete RLS policies allow data leakage | High | Medium | All | Audit all tables for org_id filtering, test multi-tenancy with multiple orgs | supabase-database-architect |
| Existing wiring conflicts with new implementation | Medium | Medium | 1.1.1 | Thorough audit before changes, preserve existing patterns, incremental testing | wiring-agent |
| Kanban drag-drop breaks with real data | Medium | Low | 1.1.1 | Test opportunities Kanban with seed data, verify @dnd-kit integration | playwright-tester |
| Missing foreign key constraints cause data integrity issues | High | Low | All | Review all relationships, add constraints with migrations, test referential integrity | supabase-database-architect |
| Service hooks don't handle pagination/filtering correctly | Medium | Medium | All | Test with large datasets, verify infinite scroll, audit filter implementations | wiring-agent |

## Dependencies

### External Dependencies
- **Supabase Cloud Database**: Status ✅ Available, all MCP tools operational
- **@dnd-kit Library**: Status ✅ Installed, used for opportunities Kanban drag-drop
- **React Hook Form + Yup**: Status ✅ Installed, required for form validation

### Internal Dependencies
- Phase 1.1.2 (Create/Edit) depends on Phase 1.1.1 (List) - Status: ⏳ Planned
- Phase 1.1.3 (Interaction) depends on Phase 1.1.2 (Create/Edit) - Status: ⏳ Planned
- Phase 1.1.4 (Dashboard) depends on Phase 1.1.3 (Interaction) - Status: ⏳ Planned
- All phases depend on shared brainstorm document - Status: ✅ Complete

## Verification Checklist

### Code Quality
- [ ] All tests passing (0 failures) - data layer tests
- [ ] All tests passing (0 failures) - API layer tests
- [ ] All tests passing (0 failures) - UI layer tests
- [ ] All tests passing (0 failures) - E2E integration tests
- [ ] Build succeeds without errors
- [ ] No linting errors
- [ ] Code coverage ≥ 80% for new code

### Functionality
- [ ] All 17 CRM pages display live data from Supabase
- [ ] CRUD operations work for all entities (leads, contacts, accounts, opportunities, proposals)
- [ ] Kanban drag-drop updates opportunity status in database
- [ ] Pagination and filtering work correctly
- [ ] Loading states display during data fetch
- [ ] Error states handle API failures gracefully

### Security & Performance
- [ ] RLS policies enforce organization isolation on all tables
- [ ] Multi-tenancy verified with test data from multiple organizations
- [ ] Input validation implemented on all forms
- [ ] SQL injection prevention verified (parameterized queries)
- [ ] XSS prevention verified (output sanitization)
- [ ] Performance benchmarks met (page load < 2s, API response < 500ms)

### Documentation
- [ ] User-facing docs updated in `docs/user-docs/features/crm.md`
- [ ] API docs updated in `docs/user-docs/api/crm-api.md`
- [ ] As-built docs generated at `docs/system/as-builts/crm-section-as-built.md`
- [ ] Code comments added for complex business logic

### Screenshots & Evidence
- [ ] Screenshots captured for all 17 pages with live data
- [ ] Video walkthrough of complete CRM flow (lead → contact → account → opportunity → proposal)
- [ ] Verification command outputs captured (npm test, npm run build, npm run lint)
- [ ] Database query results captured showing RLS policies working

## Code Review

### Review Status
- [ ] Self-review complete (orchestrator validation)
- [ ] Peer review complete (human review via GitHub PR)
- [ ] Agent review complete (superpowers:code-reviewer after each phase)
- [ ] All feedback addressed and retested

### Review Findings
Review findings will be documented here as PRs are created and reviewed for each phase.

## Testing Evidence

Testing evidence will be captured during execution and documented here. Expected format:

### Data Layer Tests (Example - Phase 1.1.1)
```bash
$ npx playwright test tests/crm/data-layer/leads.spec.ts
[Output showing table schema verification, RLS policy tests, seed data queries]
```

### API Layer Tests (Example - Phase 1.1.1)
```bash
$ npx playwright test tests/crm/api-layer/leads-api.spec.ts
[Output showing endpoint tests, pagination, filtering, authentication]
```

### UI Layer Tests (Example - Phase 1.1.1)
```bash
$ npx playwright test tests/crm/ui-layer/leads-ui.spec.ts
[Output showing page rendering, loading states, error handling]
```

### E2E Tests (Example - Phase 1.1.1)
```bash
$ npx playwright test tests/crm/e2e/leads-flow.spec.ts
[Output showing full user journey from list to detail to edit]
```

### Build Verification
```bash
$ npm run build
[Build output showing success with 0 errors]

$ npm run lint
[Lint output showing 0 warnings, 0 errors]
```

## Timeline

| Milestone | Planned Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Brainstorm Document Complete | 2026-01-30 | 2026-01-30 | ✅ |
| Section INDEX Created | 2026-01-30 | - | 🚧 |
| Feature Branch Created | 2026-01-30 | - | ⏳ |
| Phase 1.1.1 Plan Created | 2026-01-30 | - | ⏳ |
| Phase 1.1.1 GitHub Issue Created | 2026-01-30 | - | ⏳ |
| Phase 1.1.1 Complete (List Pages) | TBD | - | ⏳ |
| Phase 1.1.1 PR Created | TBD | - | ⏳ |
| Phase 1.1.1 PR Merged | TBD | - | ⏳ |
| Phase 1.1.2 Complete (Create/Edit) | TBD | - | ⏳ |
| Phase 1.1.2 PR Merged | TBD | - | ⏳ |
| Phase 1.1.3 Complete (Interaction) | TBD | - | ⏳ |
| Phase 1.1.3 PR Merged | TBD | - | ⏳ |
| Phase 1.1.4 Complete (Dashboard) | TBD | - | ⏳ |
| Phase 1.1.4 PR Merged | TBD | - | ⏳ |
| All Phases Complete | TBD | - | ⏳ |
| As-Built Documentation Created | TBD | - | ⏳ |

## Related Documentation

### Design Docs
- [Brainstorm: CRM Section Database Wiring](docs/system/design/brainstorm-2026-01-30-crm-section.md) - ✅ Complete
- [Sequential Operation Workflow Design](docs/plans/2026-01-30-sequential-operation-workflow-design.md) - ✅ Reference

### Plan Docs (To Be Created)
- [Phase 1.1.1: CRM List Pages](docs/system/plans/plan-2026-01-30-crm-list-pages.md) - ⏳ Planned
- [Phase 1.1.2: CRM Create/Edit Pages](docs/system/plans/plan-2026-01-30-crm-create-pages.md) - ⏳ Planned
- [Phase 1.1.3: CRM Detail/Interaction Pages](docs/system/plans/plan-2026-01-30-crm-interaction-pages.md) - ⏳ Planned
- [Phase 1.1.4: CRM Dashboard/Complex Pages](docs/system/plans/plan-2026-01-30-crm-dashboard-pages.md) - ⏳ Planned

### User Docs (To Be Updated)
- [CRM Feature Guide](docs/user-docs/features/crm.md) - 📝 To be created/updated
- [CRM API Reference](docs/user-docs/api/crm-api.md) - 📝 To be created/updated

### As-Built Docs (To Be Created After Merge)
- [CRM Section As-Built](docs/system/as-builts/crm-section-as-built.md) - 📝 To be created after Phase 1.1.4 merge

## Change Log

### v0.1 - 2026-01-30
- Feature initiated
- Section INDEX created
- Comprehensive brainstorm document completed
- Ready to create feature branch and begin Phase 1.1.1 planning

## Post-Merge Notes

After all phases merge, this section will be updated with:
- Final commit hashes for each phase
- PR numbers and links for each phase
- Deployment status
- Performance metrics (before/after comparison)
- Lessons learned and recommendations for next section
- Any follow-up tasks or known issues
