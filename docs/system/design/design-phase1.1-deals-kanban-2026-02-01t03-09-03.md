---
phase: "1.1"
title: "CRM Database Wiring - Deals Kanban (List Page)"
type: "design"
status: "planned"
version: "1.0"
created: "2026-01-30"
updated: "2026-01-30"
author: "Pierce Team + Claude"
reviewers: []
dependencies: []
blocks: ["1.2", "1.3", "1.4", "1.5"]
related_docs:
  - "docs/system/INDEX-crm-database-wiring.md"
  - "docs/system/design/2026-01-30-crm-database-wiring-brainstorm.md"
estimated_hours: 12
complexity: "high"
impact: "deep"
verification:
  - "npm run build completes successfully"
  - "npm run lint shows 0 errors"
  - "npx playwright test passes all Phase 1.1 tests"
  - "Kanban board loads with live data from Supabase"
  - "Drag-and-drop updates persist to database"
  - "No references to src/data/crm/deals.js"
---

# Phase 1.1: CRM Database Wiring - Deals Kanban (List Page)

## Overview

Implement database integration for the CRM Deals Kanban board (`/apps/crm/deals`). This is the foundation phase that creates core database tables (companies, contacts, deals, deal_collaborators), establishes RLS policies, implements API endpoints, and wires the existing Kanban UI to live Supabase data. This phase validates the core CRM schema and relationships that all subsequent phases depend on.

**Key Outcomes:**
- 4 database tables with full RLS policies
- 3 API endpoints (GET, PATCH, POST for deals)
- Kanban board functional with live database
- Drag-and-drop persists stage changes to database
- Foundation for all subsequent CRM pages

## Design Decisions

### Decision 1: Stage Order Management for Kanban

**Context:** Deals must maintain visual order within each Kanban column, especially after drag-and-drop operations.

**Options Considered:**
1. **`stage_order` integer field per deal** (Recommended)
   - Pros: Simple schema, direct control, easy to reorder
   - Cons: Requires reordering multiple deals when inserting in middle

2. **Linked list with `previous_deal_id` foreign key**
   - Pros: O(1) insertion anywhere
   - Cons: Complex queries, fragile if links break

3. **Timestamp-based ordering (created_at or updated_at)**
   - Pros: No additional fields needed
   - Cons: Can't manually reorder, loses intentional ordering

**Decision:** `stage_order` integer field - simplicity and directness are most important for MVP. Reordering operations are infrequent enough that updating multiple rows is acceptable.

**Implementation:** When dragging deal from position X to position Y within same stage, update `stage_order` for all deals between X and Y. When moving to different stage, append to end (max(stage_order) + 1).

### Decision 2: Deal Collaborators Relationship

**Context:** Deals have multiple collaborators beyond the primary owner.

**Options Considered:**
1. **Many-to-many join table `deal_collaborators`** (Recommended)
   - Pros: Normalized, scalable, easy to query both directions
   - Cons: Additional table, more complex queries

2. **JSONB array of user IDs in deals table**
   - Pros: Fewer tables, simpler for small lists
   - Cons: Can't query efficiently, no referential integrity

**Decision:** Many-to-many join table - proper normalization, referential integrity with cascade deletes, efficient querying in both directions (find deals for user, find users for deal).

### Decision 3: RLS Policy Scope

**Context:** Multi-tenant CRM where users should only see their own deals.

**Options Considered:**
1. **User-scoped policies with `auth.uid()` filtering** (Recommended)
   - Pros: Automatic isolation, secure by default, prevents data leaks
   - Cons: Must include `user_id` in all queries (handled by Supabase)

2. **Organization-scoped policies with `organization_id`**
   - Pros: Allows team visibility
   - Cons: Requires organization management system (future feature)

**Decision:** User-scoped RLS for Phase 1.1 - simplest secure approach. Can add organization-level sharing in future phases when team/org features are implemented.

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   UI Layer (Existing)                       │
│  /apps/crm/deals/page.jsx                                  │
│    └─ DealsKanban.jsx (@dnd-kit drag-and-drop)            │
│       └─ DealsProvider (context)                           │
│          └─ useCRMDealsApi() [NEW SWR HOOK]               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (New)                           │
│  /api/crm/deals/route.js                                   │
│    └─ GET: Fetch all deals grouped by stage                │
│  /api/crm/deals/[id]/route.js                              │
│    └─ PATCH: Update deal (stage, stage_order, amount...)   │
│    └─ DELETE: Soft delete deal (future)                    │
│  /api/crm/deals/create/route.js                            │
│    └─ POST: Create new deal from dialog                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Client (Next.js Server)               │
│  @supabase/ssr (Server-Side Auth)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Database                          │
│  ┌───────────┐  ┌──────────┐  ┌───────┐  ┌────────────────┐│
│  │ companies │  │ contacts │  │ deals │  │deal_collabora..││
│  └───────────┘  └──────────┘  └───────┘  └────────────────┘│
│       │              │            │              │           │
│       └──────────────┴────────────┴──────────────┘           │
│                   (Foreign Keys)                             │
│  RLS Policies: user_id = auth.uid()                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Model

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

-- Indexes
CREATE INDEX idx_companies_name ON companies(name);

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

-- Trigger for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### `contacts` Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  title TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  lead_source TEXT,
  lead_status TEXT,
  contact_owner_id UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Indexes
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_company_id ON contacts(company_id);
CREATE INDEX idx_contacts_email ON contacts(email);

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

-- Trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### `deals` Table
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  amount DECIMAL(15, 2),
  stage TEXT NOT NULL DEFAULT 'Contact',
  priority TEXT DEFAULT 'Medium',
  owner_id UUID REFERENCES auth.users,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  close_date DATE,
  create_date TIMESTAMPTZ DEFAULT NOW(),
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users NOT NULL,
  stage_order INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_company_id ON deals(company_id);
CREATE INDEX idx_deals_contact_id ON deals(contact_id);
CREATE INDEX idx_deals_stage_stage_order ON deals(stage, stage_order);

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

CREATE POLICY "Users can delete own deals"
  ON deals FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger
CREATE TRIGGER update_deals_last_update
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column_to_last_update();
```

#### `deal_collaborators` Table
```sql
CREATE TABLE deal_collaborators (
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (deal_id, user_id)
);

-- Indexes
CREATE INDEX idx_deal_collaborators_deal_id ON deal_collaborators(deal_id);
CREATE INDEX idx_deal_collaborators_user_id ON deal_collaborators(user_id);

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

CREATE POLICY "Users can manage collaborators for own deals"
  ON deal_collaborators FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deals
      WHERE deals.id = deal_collaborators.deal_id
      AND deals.user_id = auth.uid()
    )
  );
```

### TypeScript Types

```typescript
// src/types/crm.ts

export interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  industry: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  company?: Company; // joined
  lead_source: string | null;
  lead_status: string | null;
  contact_owner_id: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface Deal {
  id: string;
  user_id: string;
  name: string;
  company_id: string | null;
  company?: Company; // joined
  contact_id: string | null;
  contact?: Contact; // joined
  amount: number | null;
  stage: 'Contact' | 'MQL' | 'SQL' | 'Opportunity' | 'Won' | 'Lost';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  owner_id: string | null;
  progress: number;
  close_date: string | null;
  create_date: string;
  last_update: string;
  created_by: string;
  stage_order: number;
  collaborators?: DealCollaborator[]; // joined
}

export interface DealCollaborator {
  deal_id: string;
  user_id: string;
  added_at: string;
}

export interface DealsGroupedByStage {
  Contact: Deal[];
  MQL: Deal[];
  SQL: Deal[];
  Opportunity: Deal[];
  Won: Deal[];
  Lost: Deal[];
}
```

### Component Breakdown

1. **API Route: `/api/crm/deals/route.js`** (NEW)
   - Purpose: Fetch all deals for authenticated user, grouped by stage
   - Key functionality:
     - Server-side Supabase auth
     - Query deals with company, contact joins
     - Group by stage, sort by stage_order
     - Return DealsGroupedByStage format
   - Dependencies: @supabase/ssr

2. **API Route: `/api/crm/deals/[id]/route.js`** (NEW)
   - Purpose: Update single deal (PATCH), delete deal (DELETE future)
   - Key functionality:
     - Validate ownership (user_id = auth.uid())
     - Update fields (stage, stage_order, amount, priority, progress)
     - Revalidate SWR cache
     - Return updated deal
   - Dependencies: @supabase/ssr

3. **API Route: `/api/crm/deals/create/route.js`** (NEW)
   - Purpose: Create new deal from CreateDealDialog
   - Key functionality:
     - Validate required fields (name, stage, company_id)
     - Set user_id, created_by from auth
     - Calculate stage_order (max + 1 for stage)
     - Return new deal with ID
   - Dependencies: @supabase/ssr

4. **SWR Hook: `src/services/swr/api-hooks/useCRMDealsApi.js`** (NEW)
   - Purpose: Fetch and mutate deals data with SWR caching
   - Key functionality:
     - GET /api/crm/deals with SWR
     - Optimistic updates for drag-and-drop
     - Revalidation after mutations
     - Error handling
   - Dependencies: swr, axios

5. **Component: `src/providers/DealsProvider.jsx`** (MODIFIED)
   - Purpose: Replace mock data with useCRMDealsApi()
   - Key modifications:
     - Remove: `import dealsData from 'src/data/crm/deals.js'`
     - Add: `const { deals, isLoading, error, mutate } = useCRMDealsApi()`
     - Update: Initial state from `deals` instead of `dealsData`
     - Add: Loading and error states
   - Dependencies: useCRMDealsApi

6. **Component: `src/components/sections/crm/deals/DealsKanban.jsx`** (MINIMAL MODIFICATION)
   - Purpose: Wire drag-end handler to API PATCH
   - Key modifications:
     - Add: PATCH call to `/api/crm/deals/[id]` on drag end
     - Add: Optimistic update before API call
     - Add: Rollback on error
     - Preserve: All @dnd-kit logic (data-source agnostic)
   - Dependencies: useCRMDealsApi (from context)

## Dependencies

### External Dependencies
- Supabase project with auth enabled (✅ Available)
- @supabase/ssr for Next.js 15 App Router (✅ Available)
- SWR for data fetching (✅ Available)
- @dnd-kit for drag-and-drop (✅ Available)

### Internal Dependencies
- None (this is the foundation phase)

### Blocks
- Phase 1.2 (requires companies, contacts tables)
- Phase 1.3 (requires contacts, deals tables)
- Phase 1.4 (requires all tables)
- Phase 1.5 (requires all tables with data)

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Drag-and-drop breaks with async updates | High | Medium | Optimistic updates in UI, rollback on error, comprehensive Layer 3 tests |
| RLS policies block legitimate access | High | Low | Layer 1 tests with multiple users, seed data with auth.users |
| Stage_order conflicts during concurrent updates | Medium | Low | Use transactions, add unique constraint on (stage, stage_order) |
| Performance degradation with many deals | Medium | Low | Index on (stage, stage_order), lazy load deals per stage |
| Mock data structure doesn't match schema | High | Low | Carefully compare mock data, seed data mirrors structure exactly |

## Implementation Notes

### Seed Data Strategy
- Create 2 test users via Supabase auth
- Insert 9 companies (from mock data: Adobe, Google, Netflix, etc.)
- Insert 10 contacts distributed across companies
- Insert 15 deals across 5 stages:
  - Contact: 4 deals
  - MQL: 3 deals
  - SQL: 3 deals
  - Opportunity: 2 deals
  - Won/Lost: 3 deals
- Insert 8 deal_collaborators relationships

### Database Triggers
```sql
-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Deals-specific last_update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column_to_last_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_update = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Drag-and-Drop Update Logic
```javascript
// In DealsKanban.jsx - handleDragEnd
async function handleDragEnd(event) {
  const { active, over } = event;

  // Optimistic update (existing reducer logic)
  dispatch({ type: 'DRAG_END', payload: { active, over } });

  // API update
  try {
    await axios.patch(`/api/crm/deals/${active.id}`, {
      stage: over.stage,
      stage_order: over.newOrder
    });

    // Revalidate
    mutate();
  } catch (error) {
    // Rollback on error
    console.error('Failed to update deal:', error);
    // Re-fetch to get correct state
    mutate();
  }
}
```

### Aurora Pattern Preservation
- **No UI changes**: All 73 CRM components unchanged
- **Data-agnostic drag-and-drop**: @dnd-kit works with any data structure
- **Material-UI components**: Paper, Stack, Grid remain unchanged
- **Responsive design**: Breakpoints and layouts preserved
- **Only swap**: Mock data import → SWR hook

## Verification Plan

### Phase-Specific Verification

1. **Database Layer (Layer 1)**
   - Run migration, verify tables exist
   - Insert seed data, verify constraints
   - Test RLS: User A can't see User B's deals
   - Verify indexes improve query performance

2. **API Layer (Layer 2)**
   - GET /api/crm/deals returns grouped deals
   - PATCH /api/crm/deals/[id] updates stage
   - POST /api/crm/deals/create creates deal
   - Unauthorized requests return 401
   - Invalid data returns 400 with errors

3. **UI Layer (Layer 3)**
   - Kanban board loads with live data
   - Drag deal between columns updates DB
   - Create deal dialog submits successfully
   - No references to src/data/crm/deals.js
   - Loading states display during fetch

4. **E2E Integration (Layer 4)**
   - Login → Navigate to /apps/crm/deals → See deals
   - Drag "Acme Corp Deal" from Contact → MQL → Verify in DB
   - Create new deal → Appears in correct column
   - Refresh page → Deal positions persist

### Phase Acceptance Criteria

- [ ] All 4 tables created with correct schema
- [ ] RLS policies enforce user isolation
- [ ] Seed data inserted successfully
- [ ] GET /api/crm/deals returns deals grouped by stage
- [ ] PATCH /api/crm/deals/[id] updates deal fields
- [ ] POST /api/crm/deals/create creates new deal
- [ ] useCRMDealsApi() hook returns data correctly
- [ ] DealsProvider uses live data, not mock data
- [ ] Kanban board displays deals from database
- [ ] Drag-and-drop persists to database
- [ ] No errors in browser console
- [ ] npm run build succeeds
- [ ] npm run lint passes (0 errors)
- [ ] All Playwright tests pass (4 layers)

## Related Documentation

- [INDEX: CRM Database Wiring](../INDEX-crm-database-wiring.md)
- [Brainstorm: CRM Database Wiring](2026-01-30-crm-database-wiring-brainstorm.md)
- [Next.js 15 App Router Docs](https://nextjs.org/docs/app)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [@dnd-kit Documentation](https://docs.dndkit.com/)
