---
feature: "CRM Section - Database Wiring"
type: "brainstorm"
status: "validated"
created: "2026-01-30"
author: "Pierce Team + Claude"
scope: "Full CRM section conversion from mock data to live database"
pages: 5
estimated_phases: 4
---

# CRM Database Wiring - Brainstorm Design

## Overview

Convert the entire CRM section from mock data to live database integration using Supabase. The CRM section consists of 5 fully-implemented UI pages currently using hardcoded mock data. This project will wire each page to live database tables, API endpoints, and SWR data fetching hooks while preserving the existing UI/UX implementation.

**Scope:**
- 5 pages: 1 List, 1 Create, 2 Interaction, 1 Dashboard
- 73 CRM components + 17 dashboard components (all preserved)
- 4 mock data files to be replaced with database + APIs
- 0 new UI components (all UI already complete)

## Page Categorization

### List Pages (1)
- `/apps/crm/deals` - Kanban board with drag-and-drop deal management

### Create Pages (1)
- `/apps/crm/add-contact` - Multi-step stepper form for contact creation

### Interaction Pages (2)
- `/apps/crm/lead-details` - Individual lead/contact detail view
- `/apps/crm/deal-details` - Comprehensive deal detail view with activities

### Dashboard Pages (1)
- `/dashboard/crm` - Analytics dashboard with KPIs and charts

## Database Schema Architecture

### Core Tables

#### `companies` Table
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  industry TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all companies"
  ON companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes
CREATE INDEX idx_companies_name ON companies(name);
```

#### `contacts` Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL, -- owner
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  title TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  lead_source TEXT, -- 'Website', 'Referral', 'Cold Call', etc.
  lead_status TEXT, -- 'New', 'Contacted', 'Qualified', etc.
  contact_owner_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- RLS Policies
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);
```

#### `deals` Table
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL, -- owner
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2),
  stage TEXT NOT NULL, -- 'Contact', 'MQL', 'SQL', 'Opportunity', 'Won', 'Lost'
  priority TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
  owner_id UUID REFERENCES auth.users,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  close_date DATE,
  create_date TIMESTAMPTZ DEFAULT NOW(),
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users NOT NULL,
  stage_order INTEGER DEFAULT 0 -- for Kanban column ordering
);

-- RLS Policies
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deals"
  ON deals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own deals"
  ON deals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own deals"
  ON deals FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_stage_order ON deals(stage, stage_order);
```

#### `deal_collaborators` Table
```sql
CREATE TABLE deal_collaborators (
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (deal_id, user_id)
);

-- RLS Policies
ALTER TABLE deal_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view collaborators for own deals"
  ON deal_collaborators FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_collaborators.deal_id
      AND deals.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_deal_collaborators_deal_id ON deal_collaborators(deal_id);
CREATE INDEX idx_deal_collaborators_user_id ON deal_collaborators(user_id);
```

#### `activities` Table
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL, -- activity owner
  type TEXT NOT NULL, -- 'call', 'email', 'meeting', 'note', 'task'
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  subject TEXT,
  description TEXT,
  metadata JSONB, -- type-specific fields (duration, attachments, etc.)
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activities for own contacts/deals"
  ON activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_contact_id ON activities(contact_id);
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
```

### Database Migration Order

1. `companies` (no dependencies)
2. `contacts` (depends on companies)
3. `deals` (depends on companies, contacts)
4. `deal_collaborators` (depends on deals)
5. `activities` (depends on contacts, deals)

## Implementation Order & Dependencies

### Page Type Sequence: List → Create → Interaction → Dashboard

#### Phase 1: List Page (`/apps/crm/deals` - Kanban)
- **Tables**: companies, contacts, deals, deal_collaborators
- **Reason**: Validates core schema and relationships
- **Tests**: Read operations, drag-and-drop mutations (stage updates)
- **Blockers**: None - foundation for all other pages

#### Phase 2: Create Page (`/apps/crm/add-contact`)
- **Tables**: contacts, companies (already exist from Phase 1)
- **Reason**: Enables data creation workflow
- **Tests**: Insert operations, form validation, data persistence
- **Blockers**: Requires companies table for dropdown

#### Phase 3a: Interaction Page (`/apps/crm/lead-details` - Simpler)
- **Tables**: contacts, deals, activities (activities added here)
- **Reason**: Simpler interaction view, validates related data fetching
- **Tests**: Related data loading, activity tabs, updates
- **Blockers**: Requires contacts, deals, activities

#### Phase 3b: Interaction Page (`/apps/crm/deal-details` - Complex)
- **Tables**: All tables (deals, contacts, companies, activities, deal_collaborators)
- **Reason**: Complex view with all relationships
- **Tests**: Deep relationship loading, activity timeline, analytics
- **Blockers**: Requires all previous phases complete

#### Phase 4: Dashboard Page (`/dashboard/crm`)
- **Tables**: All tables with diverse seed data
- **Reason**: Requires aggregated analytics from all tables
- **Tests**: Analytics queries, chart data, KPI calculations
- **Blockers**: Needs sufficient data volume in all tables

## Testing Strategy

### Four-Layer Testing Approach

#### Layer 1: Data Layer Testing
- **Agent**: `playwright-tester` with Supabase client
- **Focus**: Schema, migrations, RLS, seed data
- **Tests**:
  - Tables exist with correct columns/types
  - Foreign key constraints enforce relationships
  - RLS policies isolate user data
  - Seed data inserts successfully
  - Indexes improve query performance
- **Exit criteria**: All CRUD operations work at database level

#### Layer 2: API Layer Testing
- **Agent**: `playwright-tester` with HTTP requests
- **Focus**: Endpoints, SWR hooks, error handling
- **Tests**:
  - GET endpoints return correct data structure
  - POST endpoints create records
  - PATCH endpoints update fields
  - DELETE endpoints remove records
  - SWR hooks trigger revalidation
  - Error responses have proper codes (400, 401, 404, 500)
- **Exit criteria**: All endpoints respond correctly

#### Layer 3: UI Layer Testing
- **Agent**: `playwright-tester` with browser automation
- **Focus**: Component integration with live APIs
- **Tests**:
  - Pages load with real database data
  - Forms submit successfully
  - Mock data imports removed
  - Drag-and-drop updates database
  - Navigation maintains data consistency
- **Exit criteria**: No mock data references, UI fully functional

#### Layer 4: E2E Integration Testing
- **Agent**: `playwright-tester` with multi-page flows
- **Focus**: Complete user journeys
- **Tests**:
  - Create contact → View in lead-details → Create deal → View in Kanban
  - Drag deal → Verify in deal-details → Check activity log
  - Dashboard KPIs reflect changes from other pages
  - Search/filter with real data
- **Exit criteria**: All user flows complete without errors

### Per-Page Test Pattern
```
1. supabase-database-architect → Create tables/migrations
2. playwright-tester → Test data layer → FIX if FAIL → Repeat until PASS
3. wiring-agent → Create API endpoints/SWR hooks
4. playwright-tester → Test API layer → FIX if FAIL → Repeat until PASS
5. react-mui-frontend-engineer → Wire UI to APIs, remove mocks
6. playwright-tester → Test UI layer → FIX if FAIL → Repeat until PASS
7. playwright-tester → E2E integration → FIX if FAIL → Repeat until PASS
```

## Page-by-Page Implementation Plan

### Page 1: `/apps/crm/deals` (Kanban List)

**Database Requirements:**
- Tables: deals, companies, contacts, deal_collaborators
- Seed: ~15 deals across 5 stages, ~9 companies, ~10 contacts

**API Endpoints:**
- `GET /api/crm/deals` - All deals grouped by stage
- `PATCH /api/crm/deals/[id]` - Update deal (stage, stage_order, amount)
- `POST /api/crm/deals` - Create deal (from CreateDealDialog)
- `POST /api/crm/pipeline-stages` - Create custom stage

**SWR Hooks:**
- `useCRMDealsApi()` → `{ deals, isLoading, error, mutate }`

**UI Changes:**
- Remove: `import dealsData from 'src/data/crm/deals.js'`
- Update: `DealsProvider` to use `useCRMDealsApi()`
- Preserve: `@dnd-kit` drag-and-drop logic (data-agnostic)

**E2E Tests:**
- Drag deal "Contact" → "SQL" → Verify stage updated in DB
- Create new deal → Appears in correct column
- Create pipeline stage → Column appears, accepts deals

---

### Page 2: `/apps/crm/add-contact` (Create Form)

**Database Requirements:**
- Tables: contacts, companies (existing from Page 1)

**API Endpoints:**
- `POST /api/crm/contacts` - Create contact with company
- `GET /api/crm/companies` - Autocomplete dropdown
- `POST /api/crm/companies` - Create company if not exists

**SWR Hooks:**
- `useCRMContactsApi()` - Create operation
- `useCRMCompaniesApi()` - Dropdown options

**UI Changes:**
- Remove: `import from 'src/data/crm/lead-details.jsx'`
- Wire: Form submission to POST endpoint
- Add: Success/error toast notifications
- Add: Redirect to `/apps/crm/lead-details?id=[new_id]` on success

**E2E Tests:**
- Fill 3 steps → Submit → Contact created in DB
- Select existing company vs create new
- Validation errors display correctly

---

### Page 3a: `/apps/crm/lead-details` (Interaction - Simpler)

**Database Requirements:**
- Tables: contacts, deals, activities (activities added here)
- Seed: ~3 activities per contact

**API Endpoints:**
- `GET /api/crm/contacts/[id]` - Single contact with related deals
- `GET /api/crm/activities?contact_id=[id]` - Activities by contact
- `PATCH /api/crm/contacts/[id]` - Update contact fields
- `POST /api/crm/activities` - Log new activity

**SWR Hooks:**
- `useCRMContactApi(id)` - Single contact details
- `useCRMActivitiesApi(contactId)` - Activities filtered by contact

**UI Changes:**
- Add: URL param handling `?id=[contact_id]`
- Remove: Hardcoded `contactInfoData`, `ongoingDealsData`
- Wire: Activity tabs to real activity data

**E2E Tests:**
- Navigate from add-contact → Lead details loads
- View contact with multiple deals → All shown
- Activity tabs filter correctly

---

### Page 3b: `/apps/crm/deal-details` (Interaction - Complex)

**Database Requirements:**
- Tables: All (deals, contacts, companies, activities, deal_collaborators)
- Seed: Rich deal with 2+ collaborators, 5+ activities

**API Endpoints:**
- `GET /api/crm/deals/[id]` - Single deal with all relations
- `PATCH /api/crm/deals/[id]` - Update deal fields
- `GET /api/crm/deals/[id]/analytics` - Aggregated analytics

**SWR Hooks:**
- `useCRMDealApi(id)` - Single deal with relations
- `useCRMDealAnalyticsApi(id)` - Charts and metrics

**UI Changes:**
- Add: URL param handling `?id=[deal_id]`
- Remove: Hardcoded data from `src/data/crm/deal-details.jsx`
- Wire: All sub-components (AccountInfo, AssociatedContacts, ActivityTimeline, Analytics)

**E2E Tests:**
- Click Kanban card → Deal details loads
- Update priority → Reflected in DB and Kanban
- Activity timeline shows latest first

---

### Page 4: `/dashboard/crm` (Analytics Dashboard)

**Database Requirements:**
- Tables: All populated (~50 deals, ~30 contacts, ~100 activities)

**API Endpoints:**
- `GET /api/crm/dashboard/kpis` - 5 KPI metrics
- `GET /api/crm/dashboard/revenue` - Revenue by percentile
- `GET /api/crm/dashboard/lead-sources` - Distribution
- `GET /api/crm/dashboard/acquisition-cost` - Budget allocation
- `GET /api/crm/dashboard/sales-funnel` - Stages with conversion
- `GET /api/crm/dashboard/customer-feedback` - Sentiment trends
- `GET /api/crm/dashboard/lifetime-value` - CAC and LTV
- `GET /api/crm/dashboard/active-users` - Engagement over time

**SWR Hooks:**
- `useCRMDashboardApi()` - Returns all dashboard data

**UI Changes:**
- Remove: `import from 'src/data/crm/dashboard.js'`
- Wire: Each chart component to API data
- Preserve: Chart libraries (MUI Charts)

**E2E Tests:**
- Dashboard loads with real aggregated data
- KPIs reflect actual DB counts
- Sales funnel shows accurate conversion rates
- Charts render without errors

## Technical Decisions

### Decision 1: Single Activities Table vs Separate Tables

**Context:** Activities include calls, emails, meetings, notes, tasks with different attributes.

**Options Considered:**
1. **Single `activities` table with JSONB metadata** (Recommended)
   - Pros: Simple schema, easy to query all activities, flexible metadata
   - Cons: No strict type enforcement on metadata fields

2. **Separate tables per activity type**
   - Pros: Strict type enforcement, normalized structure
   - Cons: Complex queries (UNION), more migrations, harder to add types

**Decision:** Single table with JSONB metadata - simplicity and flexibility outweigh strict typing benefits.

---

### Decision 2: Kanban Stage Management

**Context:** Deals move between Kanban columns via drag-and-drop.

**Options Considered:**
1. **Update `deals.stage` and `deals.stage_order` via PATCH** (Recommended)
   - Pros: Simple, direct update, clear intent
   - Cons: Two fields to update per drag

2. **Separate `pipeline_stages` table with position tracking**
   - Pros: Customizable stages per user
   - Cons: Complex schema, overkill for MVP

**Decision:** Update stage + stage_order fields - sufficient for current needs, can refactor later if custom stages needed.

---

### Decision 3: RLS Policy Strategy

**Context:** Multi-tenant data isolation required.

**Options Considered:**
1. **User-scoped RLS with `auth.uid()` filtering** (Recommended)
   - Pros: Automatic tenant isolation, secure by default
   - Cons: Must include user_id in all tables

2. **Application-level filtering without RLS**
   - Pros: More flexible queries
   - Cons: Security risk if middleware fails

**Decision:** User-scoped RLS - security best practice, prevents data leaks even if application logic fails.

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Drag-and-drop breaks with live data | High | Medium | Test Layer 3 extensively, preserve @dnd-kit logic |
| RLS policies too restrictive | Medium | Low | Comprehensive RLS tests in Layer 1, seed data with multiple users |
| Dashboard queries too slow | Medium | Medium | Add indexes on aggregation fields, use materialized views if needed |
| Mock data structure mismatch | High | Low | Compare mock data vs schema carefully, seed data mirrors mock structure |
| Activities metadata inconsistency | Low | Medium | Document JSONB schema per activity type, validate in API layer |

## Verification Checklist

### Per-Page Verification
- [ ] npm run build (0 errors)
- [ ] npm run lint (0 errors)
- [ ] npx playwright test (0 failures)
- [ ] Mock data imports removed
- [ ] RLS policies tested with multiple users
- [ ] Screenshots captured

### Overall Verification
- [ ] All 5 pages functional with live data
- [ ] No references to src/data/crm/*.js
- [ ] Dashboard aggregations accurate
- [ ] E2E flows complete without errors
- [ ] Performance acceptable (< 2s page load)

## Related Documentation

- **Templates**: `.claude/templates/INDEX-template.md`, `.claude/templates/phase-design-template.md`
- **Agent Instructions**: `AGENTS-MAIN/agents/database/exec.md`, `AGENTS-MAIN/agents/wiring/exec.md`
- **Supabase Docs**: Accessed via Supabase MCP tools
- **Next Steps**: Create INDEX, feature branch, then phase 1 design doc

## Implementation Notes

- **Aurora patterns preserved**: All UI components unchanged, data source swap only
- **Existing providers**: DealsProvider pattern extended to include API calls
- **Responsive design**: Material-UI Grid/Breakpoints remain data-independent
- **State management**: Context + useReducer pattern continues, data fetched via SWR
- **No new UI components**: This is a pure backend integration project

## Success Criteria

✅ All 5 CRM pages functional with Supabase database
✅ Zero mock data imports remaining
✅ All tests passing (data, API, UI, E2E)
✅ Dashboard analytics reflect real data
✅ RLS policies enforce user isolation
✅ Build and lint succeed
✅ Performance acceptable (< 2s page loads)

---

**Next Steps:**
1. Create section INDEX using INDEX-template.md
2. Create feature branch: `feature/desk-crm-database-wiring`
3. Commit brainstorm + INDEX to branch
4. Create Phase 1.1 design doc for List page
5. Begin implementation following sequential pattern
