---
phase: '1.1'
title: 'Database Schema - CRM Tables'
type: 'design'
status: 'planned'
version: '1.0'
created: '2026-01-27'
updated: '2026-01-27'
author: 'Pierce Team'
reviewers: []
dependencies: []
blocks: []
related_docs:
  - '_sys_documents/roadmap/piercedesk-transformation-plan.md'
  - '_sys_documents/execution/INDEX-crm-desk-mvp.md'
  - 'docs/architecture/DESK-ARCHITECTURE.md'
  - '_sys_documents/as-builts/database-schema-as-built.md'
estimated_hours: 8
complexity: 'medium'
impact: 'deep'
verification:
  - 'Schema deployed via Supabase MCP tools'
  - 'RLS policies tested with multiple organizations'
  - 'Foreign key constraints verified'
  - 'Indexes created for performance'
---

# Phase 1.1: Database Schema - CRM Tables

## Overview

Design and implement the core CRM database tables for PierceDesk, establishing the foundation for lead management, opportunity tracking, proposal generation, and the Digital Thread. This phase creates the data model for the CRM Desk MVP.

**Why This Phase:**

- CRM is the MVP desk (first revenue-generating feature)
- Foundation for Digital Thread (activity timeline across entity lifecycle)
- Demonstrates multi-tenant architecture with RLS
- Critical for all subsequent CRM features

## Design Decisions

### Decision 1: Leads as Separate Entity (Not Pre-Qualification Opportunities)

**Context:** Should leads be a separate table or just opportunities in an early stage?

**Options Considered:**

1. **Separate `leads` table** (Recommended)
   - Pros: Clear separation of unqualified vs qualified prospects, simpler data model for leads, can capture leads before account exists
   - Cons: Need conversion process from lead → opportunity

2. **Opportunities with "Lead" stage**
   - Pros: Single pipeline view
   - Cons: Forces account/contact creation prematurely, mixes qualified and unqualified data

**Decision:** Separate `leads` table selected

**Rationale:**

- Many leads come in without a formal account (website forms, trade shows)
- Qualification is a distinct business process that shouldn't force premature data creation
- Cleaner data model - leads have different fields than opportunities

### Decision 2: Polymorphic Activities Table

**Context:** How to track interactions (calls, emails, notes) across multiple entities?

**Options Considered:**

1. **Polymorphic `activities` table** (Recommended)
   - Pros: Single source of truth for Digital Thread, flexible (works with any entity), simple queries for entity timeline
   - Cons: No referential integrity on `related_to_id`

2. **Separate tables per entity** (`lead_activities`, `opportunity_activities`, etc.)
   - Pros: Strong referential integrity
   - Cons: Fragmented Digital Thread, complex cross-entity queries, more tables to maintain

3. **Generic `events` table**
   - Pros: Flexible
   - Cons: Too generic, loses semantic meaning

**Decision:** Polymorphic `activities` table selected

**Rationale:**

- Digital Thread is a core value proposition - must be unified
- Flexibility to add new entity types without schema changes
- Acceptable trade-off: lose referential integrity for flexibility

### Decision 3: Proposal Line Items in Separate Table

**Context:** How to store proposal line items (materials, labor, optional items)?

**Options Considered:**

1. **Separate `proposal_line_items` table** (Recommended)
   - Pros: Unlimited line items, easy to query/aggregate, normalized design
   - Cons: Additional table, join required

2. **JSONB column in `proposals` table**
   - Pros: Single table, flexible schema
   - Cons: Harder to query, no referential integrity, problematic for reporting

**Decision:** Separate `proposal_line_items` table selected

**Rationale:**

- Need to aggregate line items for reporting (e.g., total materials cost)
- Proposals can have many line items (50+)
- Normalized design is clearer and more maintainable

## Technical Approach

### Architecture

```
┌─────────────┐
│ organizations│
└──────┬──────┘
       │
       ├──────> leads (unqualified prospects)
       │
       ├──────> opportunities (qualified deals)
       │             │
       │             └──────> proposals
       │                          │
       │                          └──────> proposal_line_items
       │
       └──────> activities (polymorphic - relates to any entity)
```

**Key Relationships:**

- All tables have `organization_id` for multi-tenancy
- `opportunities.account_id` links to existing `accounts` table
- `activities` uses polymorphic relationship (`related_to_type` + `related_to_id`)

### Data Model

#### Leads Table

**Purpose:** Capture unqualified prospects before they become opportunities

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Contact information
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,

  -- Lead qualification
  source TEXT NOT NULL,  -- 'website', 'referral', 'cold_call', 'trade_show', 'other'
  status TEXT NOT NULL DEFAULT 'new',  -- 'new', 'contacted', 'qualified', 'disqualified', 'converted'
  qualification_notes TEXT,

  -- Qualification criteria (BANT)
  budget_range TEXT,
  timeline TEXT,
  decision_authority TEXT,
  identified_need TEXT,

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Conversion tracking
   converted_to_opportunity_id UUID,
  converted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- RLS Policy
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_isolation" ON leads
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);

-- FK added AFTER `opportunities` exists (migration ordering)
ALTER TABLE leads
   ADD CONSTRAINT leads_converted_to_opportunity_id_fkey
   FOREIGN KEY (converted_to_opportunity_id)
   REFERENCES opportunities(id)
   ON DELETE SET NULL;
```

#### Opportunities Table

**Purpose:** Track qualified sales opportunities through the pipeline

```sql
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Linked entities
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  converted_from_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Opportunity details
  name TEXT NOT NULL,
  description TEXT,
  value DECIMAL(12, 2) NOT NULL,
  probability INTEGER NOT NULL DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),

  -- Pipeline stage
  stage TEXT NOT NULL DEFAULT 'qualification',  -- 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
  stage_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timeline
  expected_close_date DATE,
  actual_close_date DATE,

  -- Assignment
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Win/Loss tracking
  close_reason TEXT,  -- Why won or lost

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_opportunities_organization_id ON opportunities(organization_id);
CREATE INDEX idx_opportunities_account_id ON opportunities(account_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX idx_opportunities_expected_close_date ON opportunities(expected_close_date);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);

-- RLS Policy
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunities_isolation" ON opportunities
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

#### Proposals Table

**Purpose:** Generate and track proposals for opportunities

```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Linked opportunity
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,

  -- Proposal details
  proposal_number TEXT NOT NULL,  -- e.g., 'PROP-2026-001'
  title TEXT NOT NULL,
  description TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft', 'sent', 'accepted', 'rejected', 'expired'

  -- Pricing
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Terms
  valid_until DATE,
  terms_and_conditions TEXT,

  -- Tracking
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_proposal_number_per_org UNIQUE (organization_id, proposal_number)
);

-- Indexes
CREATE INDEX idx_proposals_organization_id ON proposals(organization_id);
CREATE INDEX idx_proposals_opportunity_id ON proposals(opportunity_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_proposal_number ON proposals(proposal_number);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);

-- RLS Policy
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_isolation" ON proposals
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

#### Proposal Line Items Table

**Purpose:** Store individual line items in proposals

```sql
CREATE TABLE proposal_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Linked proposal
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,

  -- Line item details
  item_type TEXT NOT NULL,  -- 'material', 'labor', 'equipment', 'service', 'optional'
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Ordering
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Optional flag
  is_optional BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_proposal_line_items_organization_id ON proposal_line_items(organization_id);
CREATE INDEX idx_proposal_line_items_proposal_id ON proposal_line_items(proposal_id);
CREATE INDEX idx_proposal_line_items_sort_order ON proposal_line_items(proposal_id, sort_order);

-- RLS Policy
ALTER TABLE proposal_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposal_line_items_isolation" ON proposal_line_items
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

#### Activities Table (Enhanced)

**Purpose:** Unified activity log for the Digital Thread

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Polymorphic relationship (relates to any entity)
  related_to_type TEXT NOT NULL,  -- 'lead', 'opportunity', 'account', 'project', etc.
  related_to_id UUID NOT NULL,

  -- Activity details
  type TEXT NOT NULL,  -- 'call', 'email', 'meeting', 'note', 'task', 'status_change'
  subject TEXT NOT NULL,
  description TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',  -- Flexible storage for activity-specific data

  -- User tracking
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Timestamps
  activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_organization_id ON activities(organization_id);
CREATE INDEX idx_activities_related_to ON activities(related_to_type, related_to_id);
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_activity_date ON activities(activity_date DESC);
CREATE INDEX idx_activities_type ON activities(type);

-- RLS Policy
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_isolation" ON activities
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### Component Breakdown

**Database migration files (via Supabase MCP tools):**

1. **Migration: Create Leads Table** (`001_create_leads.sql`)
   - Create leads table with all columns
   - Add indexes for performance
   - Enable RLS with organization isolation policy

2. **Migration: Create Opportunities Table** (`002_create_opportunities.sql`)
   - Create opportunities table
   - Foreign keys to accounts and leads
   - Indexes and RLS

3. **Migration: Create Proposals Tables** (`003_create_proposals.sql`)
   - Create proposals table
   - Create proposal_line_items table
   - Indexes and RLS

4. **Migration: Enhance Activities Table** (`004_enhance_activities.sql`)
   - Add new columns to existing activities table (if needed)
   - Update indexes for polymorphic relationships
   - Ensure RLS policy is correct

## Dependencies

### External Dependencies

- Supabase (cloud database): Active
- PostgreSQL 17.6.1: Installed
- Supabase MCP tools: Available

### Internal Dependencies

- `organizations` table: Exists ✅
- `accounts` table: Exists ✅
- `user_profiles` table: Exists ✅

## Risks & Mitigation

| Risk                                              | Impact | Probability | Mitigation                                                         |
| ------------------------------------------------- | ------ | ----------- | ------------------------------------------------------------------ |
| RLS policy too restrictive                        | High   | Medium      | Thorough testing with multiple orgs, service role bypass for admin |
| Polymorphic activities lose referential integrity | Medium | High        | Accept trade-off, implement application-level validation           |
| Proposal number collisions                        | Low    | Low         | Unique constraint on (org_id, proposal_number)                     |
| Performance issues with large datasets            | Medium | Low         | Proper indexing, query optimization, pagination                    |

## Implementation Notes

Key considerations for implementation:

- Use Supabase MCP tools ONLY (database is in cloud, not local)
- Test RLS policies with multiple test organizations before deploying
- Create indexes AFTER inserting test data to verify performance
- Use `gen_random_uuid()` for UUIDs (PostgreSQL built-in)
- All timestamps use `TIMESTAMPTZ` for timezone awareness

## Verification Plan

### Automated Tests

- [ ] Unit tests for all database functions (if any)
- [ ] Integration tests for CRUD operations
- [ ] RLS policy tests (multi-organization isolation)

### Manual Verification

**Via Supabase MCP tools:**

1. **Verify tables created:**

   ```javascript
   list_tables({
     project_id: 'iixfjulmrexivuehoxti',
     schemas: ['public'],
   });
   // Should show: leads, opportunities, proposals, proposal_line_items
   ```

2. **Verify RLS enabled:**

   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('leads', 'opportunities', 'proposals', 'proposal_line_items');
   // All should have rowsecurity = true
   ```

3. **Test multi-org isolation:**

   ```sql
   -- Create test data for Org A
   SET app.current_org_id = '<org_a_id>';
   INSERT INTO leads (organization_id, first_name, last_name, email, source)
   VALUES ('<org_a_id>', 'John', 'Doe', 'john@example.com', 'website');

   -- Create test data for Org B
   SET app.current_org_id = '<org_b_id>';
   INSERT INTO leads (organization_id, first_name, last_name, email, source)
   VALUES ('<org_b_id>', 'Jane', 'Smith', 'jane@example.com', 'referral');

   -- Verify Org A cannot see Org B's data
   SET app.current_org_id = '<org_a_id>';
   SELECT * FROM leads;
   -- Should only return John Doe, not Jane Smith
   ```

4. **Verify indexes exist:**
   ```sql
   SELECT tablename, indexname
   FROM pg_indexes
   WHERE schemaname = 'public'
   AND tablename IN ('leads', 'opportunities', 'proposals', 'proposal_line_items');
   -- Should show all indexes created
   ```

### Acceptance Criteria

- [ ] All 4 CRM tables created successfully
- [ ] RLS enabled on all tables
- [ ] All indexes created
- [ ] Foreign key constraints working
- [ ] Multi-organization data isolation verified
- [ ] Polymorphic activities working correctly

## Related Documentation

- [PierceDesk Transformation Plan](../roadmap/piercedesk-transformation-plan.md)
- [Database Architecture](../../docs/architecture/DATABASE-ARCHITECTURE.md) - To be created
- [Database Schema As-Built](../as-builts/database-schema-as-built.md)
- [INDEX: CRM Desk MVP](../execution/INDEX-crm-desk-mvp.md)

---

**Status**: ⏳ Planned
**Ready for Implementation**: After INDEX approval
**Estimated Effort**: 8 hours
**Verification**: Via Supabase MCP tools
