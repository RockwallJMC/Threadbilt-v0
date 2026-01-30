---
title: "Phase 1.1.1: CRM List Pages - Database Wiring"
type: "execution"
status: "in-progress"
version: "0.1"
phase: "1.1.1"
section: "CRM"
page_type: "list"
created: "2026-01-30"
updated: "2026-01-30T07:15:00-06:00"
github_issue: "#49"
feature_branch: "feature/desk-crm-database-wiring"
brainstorm_doc: "docs/system/design/brainstorm-2026-01-30-crm-section.md"
---

> **GitHub Workflow Note:** For all GitHub issue/PR creation and updates, use the `/github-workflow` skill.
> See `.claude/skills/github-workflow/SKILL.md` for complete templates and workflows with agent identification requirements.

# Phase 1.1.1: CRM List Pages - Database Wiring

## Goal

Wire 6 CRM list pages to live Supabase database using bottom-up sequential pipeline. Each page will be executed one at a time with complete testing at each layer (data → API → UI → E2E) before moving to the next page.

**Pages in Scope:**
1. `/apps/crm/leads` - ✅ Already wired, needs audit and verification
2. `/apps/crm/contacts` - ✅ Already wired, needs audit and verification
3. `/apps/crm/accounts` - ⚠️ Partially wired, needs completion
4. `/apps/crm/opportunities` - ✅ Already wired (Kanban), needs audit and drag-drop testing
5. `/apps/crm/opportunities/list` - ⚠️ Alternate view, determine if duplicate or distinct
6. `/apps/crm/proposals` - ⚠️ Partially wired, needs completion

## Brainstorm Reference

**Complete analysis for all pages**: [brainstorm-2026-01-30-crm-section.md](../design/brainstorm-2026-01-30-crm-section.md)

All database schemas, API endpoints, RLS policies, and test scenarios documented in brainstorm.

## Page-by-Page Tasks Summary

### Page 1: `/apps/crm/leads`

**Current Status**: ✅ Wired with useLeads() hook
**Approach**: Audit existing implementation, verify completeness, add missing tests

**Tasks**:
- **Database (supabase-database-architect)**:
  - Verify `leads` table schema matches requirements (id, org_id, status, name, email, phone, company, source, timestamps)
  - Audit RLS policy: `organization_id = current_org()`
  - Verify seed data exists for testing
  - Check foreign key to `auth.users` for created_by/updated_by

- **Data Layer Testing (playwright-tester)**:
  - Test table schema correctness
  - Test RLS policy with multiple organizations
  - Test seed data queryable
  - Verify soft delete (deleted_at IS NULL filter)

- **API (wiring-agent)**:
  - Audit existing `useLeadApi.js` hook
  - Verify pagination support
  - Verify status filtering (new, contacted, qualified, unqualified, converted)
  - Check error handling and loading states
  - Ensure organization isolation in queries

- **API Layer Testing (playwright-tester)**:
  - Test GET /leads returns filtered data by org
  - Test status filter parameter works
  - Test pagination if implemented
  - Test authentication required
  - Test RLS prevents cross-org access

- **UI (react-mui-frontend-engineer)**:
  - Verify `/apps/crm/leads/page.jsx` uses live data
  - Check loading skeleton displays during fetch
  - Check error boundary handles API failures
  - Verify status badges display correctly
  - Test filters and search if present

- **UI Layer Testing (playwright-tester)**:
  - Test page renders with live data
  - Test loading state displays
  - Test error state displays on API failure
  - Test status filter changes data
  - Test table sorting/pagination if present

- **E2E Testing (playwright-tester)**:
  - Full user journey: Login → Navigate to Leads → See leads list → Filter by status → Click lead to view details

### Page 2: `/apps/crm/contacts`

**Current Status**: ✅ Wired with useContacts() hook
**Approach**: Audit existing implementation, verify completeness

**Tasks**:
- **Database (supabase-database-architect)**:
  - Verify `contacts` table schema (id, org_id, account_id FK, first_name, last_name, email, phone, title, timestamps)
  - Audit RLS policy: `organization_id = current_org()`
  - Verify foreign key to `accounts` table
  - Check seed data with account relationships

- **Data Layer Testing (playwright-tester)**:
  - Test table schema with FK constraints
  - Test RLS policy enforcement
  - Test account relationship queries
  - Verify cascading behavior (if account deleted)

- **API (wiring-agent)**:
  - Audit existing `useContactApi.js` hook
  - Verify account filtering support
  - Check pagination and search
  - Ensure error handling

- **API Layer Testing (playwright-tester)**:
  - Test GET /contacts with org filtering
  - Test account_id filter parameter
  - Test search by name/email
  - Test authentication and RLS

- **UI (react-mui-frontend-engineer)**:
  - Verify `/apps/crm/contacts/page.jsx` uses live data
  - Check account name displays (JOIN query or separate fetch)
  - Verify loading and error states
  - Test contact list table

- **UI Layer Testing (playwright-tester)**:
  - Test page renders contact list
  - Test loading skeleton
  - Test error handling
  - Test search/filter functionality
  - Test account association displays

- **E2E Testing (playwright-tester)**:
  - Full journey: Login → Contacts → Filter by account → View contact details

### Page 3: `/apps/crm/accounts`

**Current Status**: ⚠️ Partially wired
**Approach**: Complete missing wiring

**Tasks**:
- **Database (supabase-database-architect)**:
  - Verify `accounts` table schema (id, org_id, name, industry, website, phone, address, timestamps)
  - Audit RLS policy: `organization_id = current_org()`
  - Create seed data if missing
  - Check relationships to contacts and opportunities

- **Data Layer Testing (playwright-tester)**:
  - Test table schema
  - Test RLS policy
  - Test relationships to contacts/opportunities
  - Verify seed data

- **API (wiring-agent)**:
  - Audit existing `useAccountApi.js` hook
  - Implement missing CRUD operations
  - Add industry filtering if needed
  - Ensure pagination support

- **API Layer Testing (playwright-tester)**:
  - Test GET /accounts with org filter
  - Test POST/PUT/DELETE if implemented
  - Test industry filter
  - Test authentication and RLS

- **UI (react-mui-frontend-engineer)**:
  - Wire `/apps/crm/accounts/page.jsx` to live API
  - Remove mock data if present
  - Implement loading/error states
  - Add filters (industry, etc.)

- **UI Layer Testing (playwright-tester)**:
  - Test page renders account list
  - Test CRUD operations if available
  - Test filtering
  - Test loading/error states

- **E2E Testing (playwright-tester)**:
  - Full journey: Login → Accounts → Filter by industry → View account details → See associated contacts/opportunities

### Page 4: `/apps/crm/opportunities` (Kanban)

**Current Status**: ✅ Wired with drag-drop
**Approach**: Audit Kanban implementation, verify drag-drop updates database

**Tasks**:
- **Database (supabase-database-architect)**:
  - Verify `opportunities` table schema (id, org_id, account_id FK, name, stage, amount, probability, close_date, timestamps)
  - Audit RLS policy: `organization_id = current_org()`
  - Verify stage column matches Kanban columns (prospecting, qualification, proposal, negotiation, closed_won, closed_lost)
  - Check seed data with various stages

- **Data Layer Testing (playwright-tester)**:
  - Test table schema
  - Test RLS policy
  - Test stage transitions (update queries)
  - Verify account FK constraint

- **API (wiring-agent)**:
  - Audit existing `useOpportunitiesApi.js` hook
  - Verify stage update endpoint (for drag-drop)
  - Check grouping by stage (for Kanban columns)
  - Ensure weighted pipeline calculation if present

- **API Layer Testing (playwright-tester)**:
  - Test GET /opportunities grouped by stage
  - Test PATCH /opportunities/:id (stage update)
  - Test authentication and RLS
  - Test optimistic updates if implemented

- **UI (react-mui-frontend-engineer)**:
  - Audit `/apps/crm/opportunities/page.jsx` Kanban component
  - Verify @dnd-kit integration with live data
  - Ensure drag-drop updates database via API
  - Check loading states during fetch and update
  - Verify error handling if drag-drop fails

- **UI Layer Testing (playwright-tester)**:
  - Test Kanban board renders with live data
  - Test opportunities grouped by stage correctly
  - Test drag-drop between columns (Note: Playwright drag-drop may be complex)
  - Test loading state during data fetch
  - Test error handling

- **E2E Testing (playwright-tester)**:
  - Full journey: Login → Opportunities Kanban → Drag opportunity from Prospecting to Qualification → Verify stage updated in database → Refresh page → Verify persisted

### Page 5: `/apps/crm/opportunities/list`

**Current Status**: ⚠️ Needs investigation - determine if duplicate or distinct from Kanban
**Approach**: Compare with `/apps/crm/opportunities`, decide on implementation

**Tasks**:
- **Database (supabase-database-architect)**:
  - Same `opportunities` table as Kanban view
  - No additional database work unless list view has different requirements

- **Data Layer Testing (playwright-tester)**:
  - Reuse data layer tests from Page 4 (same table)

- **API (wiring-agent)**:
  - Determine if list view needs different API endpoint or query
  - If distinct: Implement table-style endpoint (vs Kanban grouped)
  - If duplicate: Reuse existing opportunitiesApi hook

- **API Layer Testing (playwright-tester)**:
  - Test list endpoint if distinct from Kanban
  - Test pagination, sorting, filtering for table view

- **UI (react-mui-frontend-engineer)**:
  - Wire `/apps/crm/opportunities/list/page.jsx` to API
  - Implement table view (vs Kanban)
  - Add sorting, filtering, pagination controls
  - Implement loading/error states

- **UI Layer Testing (playwright-tester)**:
  - Test list table renders
  - Test sorting by column (amount, stage, close_date)
  - Test filtering
  - Test pagination

- **E2E Testing (playwright-tester)**:
  - Full journey: Login → Opportunities List → Sort by amount → Filter by stage → Click to view details

### Page 6: `/apps/crm/proposals`

**Current Status**: ⚠️ Partially wired
**Approach**: Complete missing wiring

**Tasks**:
- **Database (supabase-database-architect)**:
  - Verify `proposals` table schema (id, org_id, opportunity_id FK, title, status, total_amount, valid_until, timestamps)
  - Verify `proposal_line_items` table schema (id, proposal_id FK, description, quantity, unit_price, total)
  - Audit RLS policies on both tables: `organization_id = current_org()`
  - Check seed data with line items

- **Data Layer Testing (playwright-tester)**:
  - Test proposals table schema
  - Test proposal_line_items table schema
  - Test FK relationship (proposal → line_items)
  - Test RLS on both tables
  - Verify total_amount calculation vs sum of line items

- **API (wiring-agent)**:
  - Audit existing `useProposalApi.js` hook
  - Implement line items fetching (nested query or separate endpoint)
  - Add proposal status filtering (draft, sent, accepted, rejected)
  - Ensure CRUD operations for proposals and line items

- **API Layer Testing (playwright-tester)**:
  - Test GET /proposals with line items included
  - Test POST/PUT/DELETE for proposals
  - Test line items CRUD
  - Test status filtering
  - Test authentication and RLS

- **UI (react-mui-frontend-engineer)**:
  - Wire `/apps/crm/proposals/page.jsx` to live API
  - Display proposals table with total_amount, status, valid_until
  - Implement status badges (draft/sent/accepted/rejected)
  - Add loading/error states
  - Implement filters (status, opportunity)

- **UI Layer Testing (playwright-tester)**:
  - Test proposals list renders
  - Test status filter changes data
  - Test line items display in summary or detail
  - Test loading/error states

- **E2E Testing (playwright-tester)**:
  - Full journey: Login → Proposals → Filter by status → Click proposal → See line items → Verify total calculation

## Agent Assignments

All pages follow the same **bottom-up sequential pipeline**:

1. **supabase-database-architect** - Schema verification/creation, migrations, RLS policies, seed data
2. **playwright-tester** - Data layer testing (table, RLS, seeds, FK)
3. **wiring-agent** - API endpoints, SWR hooks, error handling
4. **playwright-tester** - API layer testing (endpoints, auth, RLS through API)
5. **react-mui-frontend-engineer** - UI wiring, remove mocks, add loading/error states
6. **playwright-tester** - UI layer testing (rendering, interactions, states)
7. **playwright-tester** - E2E integration testing (full user journey)

**Critical Rule**: Fix-and-retest loop at each layer. If tests FAIL, responsible agent fixes issue, tester re-runs until PASS before moving to next layer.

## Test Requirements

### Data Layer Tests (Per Page)
- [ ] Table exists with correct schema (columns, types, defaults)
- [ ] RLS policy enforces `organization_id = current_org()`
- [ ] Seed data is queryable and org-isolated
- [ ] Foreign keys enforce referential integrity
- [ ] Soft delete filter works (deleted_at IS NULL)
- [ ] Multi-org test: Data from Org A not visible to Org B

### API Layer Tests (Per Page)
- [ ] GET endpoint returns data filtered by organization
- [ ] POST/PUT/DELETE endpoints work if implemented
- [ ] Pagination parameters work correctly
- [ ] Filtering parameters (status, stage, etc.) work correctly
- [ ] Authentication required (401 if not logged in)
- [ ] RLS enforced through API (403 if accessing other org's data)
- [ ] Error responses include helpful messages

### UI Layer Tests (Per Page)
- [ ] Page renders with live data from database
- [ ] Loading skeleton displays during data fetch
- [ ] Error boundary displays if API fails
- [ ] User interactions work (filters, sorting, pagination)
- [ ] Status/stage badges display correctly
- [ ] Click actions navigate to detail pages

### E2E Integration Tests (Per Page)
- [ ] Complete user journey: Login → Navigate → View data → Interact → Verify persistence
- [ ] Multi-step flows work end-to-end
- [ ] Data changes reflect across pages (e.g., update in detail, see in list)

## Deliverables Checklist

### Documentation
- [x] Phase 1.1.1 plan created (this document)
- [ ] GitHub issue created with page checklist
- [ ] Plan.md updated with issue number
- [ ] Execution log updated by each agent
- [ ] Test evidence captured for each layer

### Database Layer
- [ ] All 6 pages: Database schema verified/created
- [ ] All 6 pages: RLS policies audited/created
- [ ] All 6 pages: Seed data created for testing
- [ ] All 6 pages: Data layer tests PASS

### API Layer
- [ ] All 6 pages: API endpoints implemented/audited
- [ ] All 6 pages: SWR hooks created/audited
- [ ] All 6 pages: Error handling verified
- [ ] All 6 pages: API layer tests PASS

### UI Layer
- [ ] All 6 pages: UI wired to live APIs
- [ ] All 6 pages: Mock data removed
- [ ] All 6 pages: Loading/error states implemented
- [ ] All 6 pages: UI layer tests PASS

### Integration
- [ ] All 6 pages: E2E tests PASS
- [ ] Build succeeds: `npm run build` (exit 0)
- [ ] Lint passes: `npm run lint` (0 errors)

### Pull Request
- [ ] PR created from feature branch to main
- [ ] PR title: "Phase 1.1.1: CRM List Pages - Database Wiring"
- [ ] PR body includes test evidence, build verification, issue link
- [ ] PR includes "/q review" phrase for AI review
- [ ] PR assigned to @RockwallJMC
- [ ] Human review and merge complete

## Execution Log

### Agent Communication Protocol

**All agents MUST follow this protocol:**
- **Start notification**: Post to GitHub issue with `**Agent**: {agent-name}`, page name, layer
- **Completion summary**: Post to GitHub issue with `**Agent**: {agent-name}`, work done, test results, next step
- **Questions**: Post to GitHub issue with `[QUESTION]` prefix, agent name

### 2026-01-30 - Plan Created

- **Status**: Phase 1.1.1 plan created and ready for GitHub issue creation
- **Files created**:
  - [`docs/system/plans/plan-2026-01-30-crm-list-pages.md`](plan-2026-01-30-crm-list-pages.md) (this file)
- **Next step**: Invoke `github-workflow` skill to create GitHub issue, then update this plan with issue number

---

**Execution log will be updated by agents as they complete work. Each agent posts start/completion to GitHub issue and updates this log with their progress.**

---

## Blockers

No blockers currently. Plan is ready for execution pending GitHub issue creation.

## Next Steps

1. **Orchestrator**: Invoke `github-workflow` skill to create GitHub issue
2. **Orchestrator**: Update this plan.md frontmatter with `github_issue` number
3. **Orchestrator**: Commit plan.md to feature branch
4. **Orchestrator**: Begin Page 1 execution by invoking Task(supabase-database-architect, "Verify leads table schema and RLS policy")
5. Continue sequential pipeline for each page until all 6 pages complete
6. Create PR for Phase 1.1.1 after all pages pass all tests

## Related Issues

- Section INDEX: [`docs/system/INDEX-crm-section.md`](../INDEX-crm-section.md)
- Brainstorm: [`docs/system/design/brainstorm-2026-01-30-crm-section.md`](../design/brainstorm-2026-01-30-crm-section.md)
- GitHub Issue: TBD (to be created next)
