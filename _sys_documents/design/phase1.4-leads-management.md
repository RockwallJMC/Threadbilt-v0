# Phase 1.4: Leads Management - Implementation Plan

**Phase**: 1.4
**Target**: Week 4 (February 17-21, 2026)
**Impact**: Medium
**Dependencies**: Phase 1.2 (Auth & Multi-Tenancy - currently 60% complete)

---

## Executive Summary

Phase 1.4 implements the leads management workflow for the CRM Desk, enabling sales teams to capture, track, and convert leads into opportunities. This phase delivers a streamlined internal lead entry system with direct conversion to opportunities, eliminating qualification gates for MVP speed.

**Key Deliverables:**
- Internal lead capture form (single-page)
- Lead list with 5-status lifecycle (new, contacted, qualified, unqualified, converted)
- Lead detail with status updates and conversion button
- Lead-to-opportunity conversion with selective data pre-fill
- SWR hooks for lead operations
- Comprehensive E2E tests (~34 test cases)

**Business Value:**
- Enables sales team to track prospects through full lifecycle
- Streamlined lead-to-opportunity conversion reduces friction
- Foundation for future public lead capture forms
- Demonstrates complete CRM workflow from lead to opportunity

---

## Current State

**Completed (Phase 1.1)**:
- ✅ Database schema deployed (leads table with RLS)
- ✅ 19 columns: id, name, company, email, phone, source, status, notes, qualification_notes, etc.
- ✅ Multi-tenant RLS policies (4 per table)
- ✅ Performance indexes created

**Completed (Phase 1.3)**:
- ✅ Accounts & Contacts UI with COPY + ADAPT pattern
- ✅ SWR hooks pattern established (useAccountApi, useContactApi)
- ✅ Mock data strategy with TODO markers for Supabase migration
- ✅ E2E testing framework with Playwright

**In Progress (Phase 1.2 - 60%)**:
- 🚧 Supabase Auth integration
- 🚧 Organization selection/switching
- 🚧 Session management
- ⏳ Pending: RLS validation with multi-org test data

**Foundation Available**:
- ✅ useOrganizationApi.js pattern (SWR + Supabase client)
- ✅ ProductsTable.jsx pattern (DataGrid with filters)
- ✅ LeadDetails.jsx component (existing, needs enhancement)
- ✅ AddContactStepper.jsx pattern (React Hook Form + Yup)
- ✅ Material-UI v7 setup

---

## Design Decisions

### Decision 1: Internal Lead Entry Only (MVP)
- **Date**: 2026-01-28
- **Context**: Chose between internal entry, public web form, or both
- **Decision**: Internal lead entry only for MVP
- **Rationale**: Sales team manually enters leads from phone calls, events, referrals. Simpler to implement, faster time-to-market. Single form with full data collection and stricter validation.
- **Impact**: Reduces scope by ~40%, enables faster delivery. Public forms can be added post-MVP.

### Decision 2: Direct Conversion Without Qualification
- **Date**: 2026-01-28
- **Context**: Define qualification workflow complexity
- **Decision**: Direct conversion from any lead status to opportunity, no qualification gate
- **Rationale**: Streamlined flow for MVP. Any lead can convert to opportunity immediately. No qualification scoring (BANT) or required gates. Conversion form collects opportunity-specific fields.
- **Impact**: Simplifies workflow, reduces development time. Can add qualification scoring post-MVP if needed.

### Decision 3: 5-Status Lifecycle Model
- **Date**: 2026-01-28
- **Context**: Determine lead status granularity
- **Decision**: 5-status model - new, contacted, qualified, unqualified, converted
- **Rationale**: Track full lifecycle with clear states. "Active Leads" filter excludes converted/unqualified for daily workflow focus.
- **Impact**: Provides visibility into lead progression without over-complicating status management.

### Decision 4: Selective Data Pre-fill on Conversion
- **Date**: 2026-01-28
- **Context**: Balance conversion friction vs data quality
- **Decision**: Auto-populate contact info, company, source; user provides opportunity value, stage, close date, probability
- **Rationale**: Reduces friction while ensuring reps think through deal structure. Pre-filling eliminates re-typing, but opportunity-specific fields require thoughtful input.
- **Impact**: Balances speed with data quality. Conversion takes ~30 seconds vs 2 minutes for full re-entry.

---

## Implementation Strategy

### Approach: Incremental Integration (Phase 1.2 Dependency Mitigation)

Given Phase 1.2 is 60% complete, we'll use the same phased approach from Phase 1.3:

**Week 4 Timeline:**
- **Days 1-2** (Mon-Tue): Build components with mock data
- **Day 3** (Wed): Verify Phase 1.2 completion (run auth + org tests)
- **Day 4** (Thu): Replace mocks with Supabase SWR hooks
- **Day 5** (Fri): E2E testing with real auth/multi-tenancy

This allows parallel progress while managing the Phase 1.2 dependency.

---

## Existing Components to REUSE

### Foundation Already Exists

The codebase has strong patterns we can leverage:

**List Views:**
- **Template:** [ProductsTable.jsx](src/components/sections/ecommerce/admin/product-list/ProductsTable.jsx)
- **Features:** Search, DataGrid, pagination, filters, action menus
- **Action:** Copy and adapt column definitions for leads with status filter tabs

**Detail Pages:**
- **Existing:** [LeadDetails](src/components/sections/crm/lead-details/index.jsx) - Grid-based contact info
- **Action:** Enhance with status dropdown and "Convert to Opportunity" button

**Form Components:**
- **Existing:** [AddContactStepper.jsx](src/components/sections/crm/add-contact/AddContactStepper.jsx)
- **Action:** Simplify to single-page form (remove stepper wrapper)

**Reusable Components (Use as-is):**
- [ActivityTabs.jsx](src/components/sections/crm/common/activity-tab-panels/ActivityTabs.jsx) - Activity timeline
- [PageHeader.jsx](src/components/sections/ecommerce/admin/common/PageHeader.jsx) - Page headers
- [CRMDropdownMenu.jsx](src/components/sections/crm/common/CRMDropdownMenu.jsx) - Action menus

**State Management:**
- **Pattern:** [DealsProvider.jsx](src/providers/DealsProvider.jsx)
- **Action:** Create CRMLeadsProvider following this pattern

---

## Critical Files to Create/Modify

### 1. Data Layer (SWR Hooks)
**Priority: P0 (Foundational)**

**Files to create:**
- `src/services/swr/api-hooks/useLeadApi.js`

**Pattern:** Follow [useOrganizationApi.js](src/services/swr/api-hooks/useOrganizationApi.js)

**Key hooks:**
```javascript
// Read operations
useLeads(status?) - Fetch all leads (RLS filtered), optional status filter
  - Key: ['leads', status]
  - Returns array of lead objects

useLead(id) - Fetch single lead
  - Key: ['lead', id]
  - Returns single lead object

// Write operations (useSWRMutation)
useCreateLead() - Create lead mutation
  - Inserts into leads table
  - Revalidates useLeads()

useUpdateLead() - Update lead mutation
  - Updates leads table
  - Revalidates useLeads() and useLead(id)

useDeleteLead() - Delete lead mutation
  - Soft delete (update deleted_at timestamp)
  - Revalidates useLeads()

useConvertLeadToOpportunity() - Convert lead to opportunity
  - Multi-step operation:
    1. Create opportunity with pre-filled data (contact, company, source)
    2. Update lead status to 'converted'
    3. Link lead_id to opportunity
  - Revalidates: useLeads(), useOpportunities()
```

**Agent:** wiring-agent
**Estimated time:** 2 hours

---

### 2. Routing Setup
**Priority: P0 (Foundational)**

**Files to modify:**
- `src/routes/paths.js` - Add CRM lead routes
- `src/routes/sitemap.js` - Add Leads nav item

**Files to create:**
```
src/app/(main)/apps/crm/leads/
├── page.jsx              # Lead list
└── [id]/page.jsx         # Lead detail
```

**Agent:** wiring-agent
**Estimated time:** 30 minutes

---

### 3. Lead List Components (COPY + ADAPT pattern)
**Priority: P1 (Core functionality)**

**Files to create:**
- `src/components/sections/crm/leads-list/LeadsListContainer.jsx` - **COPY FROM** ProductListContainer
- `src/components/sections/crm/leads-list/LeadsTable.jsx` - **COPY FROM** ProductsTable

**Adaptations:**
- **List**: Columns = name, company, email, status (chip), source, created date
- **Status Filter Tabs**:
  - All Leads
  - Active Leads (excludes converted/unqualified)
  - New
  - Contacted
  - Qualified
  - Unqualified
  - Converted
- **Search**: Search by name, company, email
- **Actions**: View detail, edit, delete

**Agent:** react-mui-frontend-engineer
**Estimated time:** 2 hours

---

### 4. Lead Detail Enhancement (EXTEND EXISTING)
**Priority: P1 (Core functionality)**

**Files to modify:**
- `src/components/sections/crm/lead-details/index.jsx` - Enhance existing component

**Enhancements:**
- **Status Dropdown**: Inline status update (Select component with status options)
- **Convert Button**: "Convert to Opportunity" button (conditional - hidden if status = 'converted')
- **Activity Timeline**: Continue using ActivityTabs.jsx as-is

**Agent:** react-mui-frontend-engineer
**Estimated time:** 1.5 hours

---

### 5. Lead Creation Form (SIMPLIFY EXISTING)
**Priority: P1 (Core functionality)**

**Files to create:**
- `src/components/sections/crm/leads/AddLeadForm.jsx`

**Pattern:** Simplify [AddContactStepper.jsx](src/components/sections/crm/add-contact/AddContactStepper.jsx) - remove stepper wrapper

**Fields:**
- Name* (required)
- Company* (required)
- Email* (required)
- Phone (optional)
- Source (dropdown, required) - values: 'website', 'referral', 'event', 'cold_call', 'social_media', 'other'
- Notes (optional, multiline)

**Validation:** React Hook Form + Yup schema

**Agent:** react-mui-frontend-engineer
**Estimated time:** 1.5 hours

---

### 6. Lead Conversion Modal (NEW COMPONENT)
**Priority: P1 (Core functionality)**

**Files to create:**
- `src/components/sections/crm/leads/ConvertLeadModal.jsx`

**Features:**
- **Pre-filled (read-only or editable):**
  - Contact name (from lead.name)
  - Company (from lead.company)
  - Source (from lead.source)
- **User provides (required):**
  - Opportunity name* (default: `{company} - {product/service}`)
  - Value* (currency input)
  - Stage* (dropdown: 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')
  - Expected close date* (date picker)
  - Probability* (0-100%, tied to stage)
- **Optional:**
  - Notes about why qualified

**Action:** Triggers useConvertLeadToOpportunity mutation

**Agent:** react-mui-frontend-engineer
**Estimated time:** 2 hours

---

### 7. State Management Provider
**Priority: P2 (Enhancement)**

**Files to create:**
- `src/providers/CRMLeadsProvider.jsx` - **COPY FROM** DealsProvider pattern

**Purpose:**
- Manage leads list state
- Filter state (status tabs)
- Search query state
- Bulk selection for bulk actions

**Agent:** react-mui-frontend-engineer
**Estimated time:** 1 hour

---

### 8. Mock Data Files
**Priority: P0 (Development support)**

**Files to create:**
- `src/data/crm/leads.js` - Mock lead data (follow deals.js pattern)

**Content:**
- 15 leads across all statuses:
  - 3 new
  - 3 contacted
  - 3 qualified
  - 2 unqualified
  - 4 converted
- Varied companies, sources, created dates

**Agent:** wiring-agent
**Estimated time:** 30 minutes

---

### 9. E2E Tests
**Priority: P1 (Verification)**

**Files to create:**
- `tests/crm-leads.spec.js`
- `tests/crm-leads-multi-tenancy.spec.js` (6 tests marked .skip() until Phase 1.2)

**Test coverage:**

**Suite 1: Lead CRUD Operations (~15 tests)**
- Create lead with all required fields
- Create lead with optional fields (phone, notes)
- Edit lead (update name, company, email)
- Update lead status via dropdown
- Delete lead (soft delete)
- Search leads by name, company, email
- Filter leads by status tabs
- Sort leads by created date, name, status
- Verify lead list pagination

**Suite 2: Lead Conversion Workflow (~8 tests)**
- Convert button visibility (hidden when status = 'converted')
- Open conversion modal from lead detail
- Verify modal pre-fills contact, company, source
- Validate required opportunity fields (name, value, stage, close date, probability)
- Successful conversion creates opportunity and updates lead status
- Converted lead links to opportunity (lead_id → opportunity)
- Converted lead detail shows "View Opportunity" link
- Cannot convert already-converted lead

**Suite 3: Form Validation (~5 tests)**
- Required fields validation (name, company, email, source)
- Email format validation
- Phone format validation (optional but must be valid if provided)
- Source dropdown selection required
- Company field optional (can create lead without company)

**Suite 4: Multi-Tenancy Security (~6 tests, .skip() until Phase 1.2)**
- User in Org A cannot see Org B's leads
- Lead conversion creates opportunity in correct organization
- Converted opportunity belongs to correct org
- Search/filter respects organization boundaries
- Delete respects organization boundaries
- Status updates respect organization boundaries

**Test data setup:**
- 2 Organizations: Alpha, Beta
- 5 Leads per org (mix of statuses)
- Use Supabase MCP tools for seed data (after Phase 1.2)

**Agent:** playwright-tester
**Estimated time:** 4 hours

---

## Implementation Sequence

### Step 1: Mock Data Setup (30m)
**Agent:** wiring-agent
**Objective:** Create mock data for development

**Files to create:**
- `src/data/crm/leads.js` - Follow pattern from deals.js

This enables UI development before Phase 1.2 integration complete.

---

### Step 2: Route Structure (30m)
**Agent:** wiring-agent
**Objective:** Create Next.js routes and navigation

**Create routes:**
- `/apps/crm/leads` (list)
- `/apps/crm/leads/[id]` (detail)

**Update:**
- `routes/paths.js` - Add path definitions
- `routes/sitemap.js` - Add Leads nav menu item (icon: 'material-symbols:person-search')

---

### Step 3: SWR Hooks (2h)
**Agent:** wiring-agent
**Objective:** Build data layer

**Create hooks following [useOrganizationApi.js](src/services/swr/api-hooks/useOrganizationApi.js) pattern:**
- `useLeadApi.js` - Lead CRUD + conversion operations

**Days 1-2:** Return mock data from Step 1
**Day 4:** Switch to real Supabase queries after Phase 1.2 verified

---

### Step 4: Lead List (COPY + ADAPT) (2h)
**Agent:** react-mui-frontend-engineer
**Objective:** Create leads list view

**COPY FROM:**
- [ProductListContainer.jsx](src/components/sections/ecommerce/admin/product-list/ProductListContainer.jsx)
- [ProductsTable.jsx](src/components/sections/ecommerce/admin/product-list/ProductsTable.jsx)

**CREATE:**
- `src/components/sections/crm/leads-list/LeadsListContainer.jsx`
- `src/components/sections/crm/leads-list/LeadsTable.jsx`

**ADAPT:**
- Column definitions for leads (name, company, email, status chip, source, created date)
- Status filter tabs (All, Active, New, Contacted, Qualified, Unqualified, Converted)
- Search/filter logic for lead fields
- Navigation to lead detail page

---

### Step 5: Lead Detail Enhancement (EXTEND EXISTING) (1.5h)
**Agent:** react-mui-frontend-engineer
**Objective:** Enhance existing lead detail view

**MODIFY:**
- [LeadDetails](src/components/sections/crm/lead-details/index.jsx)

**ADD:**
- Status dropdown (Select component with inline update)
- "Convert to Opportunity" button (conditional visibility)
- Preserve existing layout and ActivityTabs integration

---

### Step 6: Lead Creation Form (SIMPLIFY EXISTING) (1.5h)
**Agent:** react-mui-frontend-engineer
**Objective:** Create simplified lead creation form

**COPY FROM:**
- [AddContactStepper.jsx](src/components/sections/crm/add-contact/AddContactStepper.jsx) - PersonalInfoForm + CompanyInfoForm

**CREATE:**
- `src/components/sections/crm/leads/AddLeadForm.jsx`

**ADAPT:**
- Remove stepper wrapper (single-page form)
- Fields: Name*, Company*, Email*, Phone, Source*, Notes
- React Hook Form + Yup validation

---

### Step 7: Conversion Modal (NEW COMPONENT) (2h)
**Agent:** react-mui-frontend-engineer
**Objective:** Build lead-to-opportunity conversion modal

**CREATE:**
- `src/components/sections/crm/leads/ConvertLeadModal.jsx`

**FEATURES:**
- Dialog component with form
- Pre-filled sections (contact, company, source)
- User input sections (opportunity name, value, stage, close date, probability)
- Form validation (all opportunity fields required)
- Trigger useConvertLeadToOpportunity mutation on submit

---

### Step 8: State Provider (1h)
**Agent:** react-mui-frontend-engineer
**Objective:** Create state management for leads

**COPY FROM:**
- [DealsProvider.jsx](src/providers/DealsProvider.jsx) pattern

**CREATE:**
- `src/providers/CRMLeadsProvider.jsx`

**PURPOSE:**
- Manage filter state (status tabs)
- Search query state
- Bulk selection state
- Provide context to LeadsList and LeadDetail

---

### Step 9: E2E Tests (4h)
**Agent:** playwright-tester
**Objective:** Comprehensive test coverage

**CREATE:**
- `tests/crm-leads.spec.js` (~28 tests active)
- `tests/crm-leads-multi-tenancy.spec.js` (~6 tests marked .skip())

**TEST:**
- Lead CRUD flows (create, edit, update status, delete, search, filter, sort)
- Conversion workflow (button visibility, modal pre-fill, validation, success, linking)
- Form validation (required fields, email format, phone format)
- Multi-tenant data isolation (marked .skip() until Phase 1.2)

---

### Step 10: Integration with Phase 1.2 (2h)
**Agent:** wiring-agent
**Objective:** Replace mock data with Supabase

**CHECKPOINT:** Verify Phase 1.2 completion first

```bash
npx playwright test tests/auth-supabase.spec.js
npx playwright test tests/organization-switching.spec.js
# Must show 0 failures before proceeding
```

**MIGRATION:**
- Update useLeadApi.js fetchers to use Supabase client
- Replace mock data with RLS-filtered queries
- Enable multi-tenancy tests (remove .skip())
- Test with real auth/org context

---

### Step 11: Verification (2h)
**Agent:** documentation-expert + all agents
**Objective:** Validate completion

**Run verification commands:**

```bash
npm run build  # Must succeed
npm run lint   # Must pass
npx playwright test tests/crm-leads.spec.js
npx playwright test tests/crm-leads-multi-tenancy.spec.js
# All tests must pass (0 failures)
```

**Update documentation:**
- Mark Phase 1.4 complete in INDEX-crm-desk-mvp.md
- Create phase1.4-leads-management.md execution doc
- Capture verification evidence (screenshots, test output)

---

## Phase 1.2 Dependency Mitigation

**Current risk:** Phase 1.2 is 60% complete, blocking full integration

**Mitigation strategy: Incremental Integration**

**Day 1-2 (Mock data approach):**
```javascript
// useLeadApi.js (temporary)
const leadsFetcher = async (status) => {
  // TODO: Replace with Supabase after Phase 1.2 complete
  const allLeads = mockLeads; // from src/data/crm/leads.js
  return status ? allLeads.filter(l => l.status === status) : allLeads;
};
```

**Day 3 (Verification checkpoint):**
```bash
npx playwright test tests/auth-supabase.spec.js
npx playwright test tests/organization-switching.spec.js
# Must show 0 failures before proceeding
```

**Day 4 (Integration):**
- Replace mock fetchers with Supabase queries
- Test with real auth/org context
- Verify RLS policies enforce data isolation

**Day 5 (E2E testing):**
- Run full E2E test suite
- Manual testing across viewports
- Fix any integration issues

This approach allows parallel progress while managing risk.

---

## Acceptance Criteria

**Functional (15):**
- [ ] User can view list of leads (multi-tenant filtered)
- [ ] User can filter leads by status (All, Active, New, Contacted, Qualified, Unqualified, Converted)
- [ ] User can search leads by name, company, email
- [ ] User can create new lead with required fields (name, company, email, source)
- [ ] User can create lead with optional fields (phone, notes)
- [ ] User can edit existing lead
- [ ] User can update lead status via dropdown
- [ ] User can delete lead (soft delete)
- [ ] User can convert lead to opportunity from lead detail
- [ ] Conversion modal pre-fills contact, company, source from lead
- [ ] Conversion requires opportunity-specific fields (name, value, stage, close date, probability)
- [ ] Converted lead status updates to 'converted'
- [ ] Converted lead links to opportunity (lead_id field)
- [ ] Converted lead detail shows "View Opportunity" link
- [ ] Cannot convert already-converted lead (button hidden)

**Technical (7):**
- [ ] All components use MUI v7 Grid (size prop)
- [ ] All forms use React Hook Form + Yup validation
- [ ] All data fetching uses SWR hooks
- [ ] All mutations revalidate SWR cache
- [ ] RLS policies enforce multi-tenant isolation
- [ ] Responsive design works on mobile (375px) and desktop (1280px)
- [ ] All routes added to paths.js and sitemap.js

**Quality (6):**
- [ ] Build succeeds (npm run build exit 0)
- [ ] Lint passes (npm run lint 0 errors)
- [ ] All E2E tests pass (0 failures)
- [ ] Multi-tenancy tests verify data isolation (after Phase 1.2)
- [ ] No console errors in browser
- [ ] Loading/error states handled gracefully

**Documentation (4):**
- [ ] Phase execution doc created and updated
- [ ] INDEX updated with completion status
- [ ] Aurora Search Log documented
- [ ] Verification evidence captured (screenshots, test output)

---

## Agent Assignment Summary

| Step | Task | Agent | Hours | Priority |
|------|------|-------|-------|----------|
| 1 | Mock data setup | wiring-agent | 0.5 | P0 |
| 2 | Routes & navigation | wiring-agent | 0.5 | P0 |
| 3 | SWR hooks (data layer) | wiring-agent | 2 | P0 |
| 4 | Lead list (COPY ProductsTable) | react-mui-frontend-engineer | 2 | P1 |
| 5 | Lead detail enhancement (EXTEND LeadDetails) | react-mui-frontend-engineer | 1.5 | P1 |
| 6 | Lead creation form (SIMPLIFY AddContactStepper) | react-mui-frontend-engineer | 1.5 | P1 |
| 7 | Conversion modal (NEW) | react-mui-frontend-engineer | 2 | P1 |
| 8 | State provider | react-mui-frontend-engineer | 1 | P2 |
| 9 | E2E tests | playwright-tester | 4 | P1 |
| 10 | Phase 1.2 integration | wiring-agent | 2 | P1 |
| 11 | Verification & docs | documentation-expert | 2 | P3 |

**Total by Agent:**
- wiring-agent: 5 hours
- react-mui-frontend-engineer: 8 hours
- playwright-tester: 4 hours
- documentation-expert: 2 hours

**Total: 19 hours** (REUSE strategy saves ~3 hours)
**Target:** Week 4 (40 hours available)
**Buffer:** 21 hours for debugging/iteration/Phase 1.2 dependency resolution

---

## Success Metrics

**Performance:**
- Lead list loads < 1s (20 records)
- Lead detail loads < 500ms
- Form validation < 100ms
- Create/update < 500ms (Supabase latency)
- Conversion workflow < 1s (multi-step operation)

**Quality:**
- 0 build errors
- 0 lint errors
- 0 test failures (28 active tests, 6 pending Phase 1.2)
- 0 RLS violations

**Business Value:**
- Complete lead-to-opportunity workflow functional
- Sales team can track prospects end-to-end
- Foundation ready for Phase 1.5 (Opportunity Pipeline)

---

## Next Steps

1. **Verify Phase 1.2 status** - Run auth + org tests to check completion
2. **Invoke /TDD skill** - Write failing tests first (Red-Green-Refactor)
3. **Launch Explore agent** - Find Aurora component patterns for lead forms
4. **Execute incrementally** - Follow Days 1-5 timeline with mock-to-real transition
5. **Verify completion** - Run all verification commands before marking complete

---

## Related Documentation

- **INDEX**: [_sys_documents/execution/INDEX-crm-desk-mvp.md](_sys_documents/execution/INDEX-crm-desk-mvp.md)
- **Database Schema**: Phase 1.1 (leads table with RLS)
- **Auth System**: Phase 1.2 (organization context, session management)
- **SWR Pattern**: [src/services/swr/api-hooks/useOrganizationApi.js](src/services/swr/api-hooks/useOrganizationApi.js)
- **Form Pattern**: [src/components/sections/crm/add-contact/AddContactStepper.jsx](src/components/sections/crm/add-contact/AddContactStepper.jsx)
- **List Pattern**: [src/components/sections/ecommerce/admin/product-list/ProductsTable.jsx](src/components/sections/ecommerce/admin/product-list/ProductsTable.jsx)

---

**Plan Status**: ✅ Complete and Ready for Execution
**Owner**: Pierce Team
**Created**: 2026-01-28
