---
phase: '1.1'
title: 'CRM Desk - Database Schema'
type: 'design'
status: 'approved'
version: '2.0'
created: '2026-01-27'
updated: '2026-01-27'
author: 'Pierce Team'
reviewers: ['user']
dependencies: []
blocks: ['1.2', '1.3', '1.4', '1.5', '1.6', '1.7']
related_docs:
  - '_sys_documents/execution/INDEX-crm-desk-mvp.md'
  - '_sys_documents/as-builts/database-schema-as-built.md'
estimated_hours: 8
complexity: 'medium'
impact: 'deep'
verification:
  - 'All tables created via Supabase MCP'
  - 'RLS policies enabled and tested'
  - 'Foreign key constraints verified'
  - 'Indexes created for performance'
---

# Phase 1.1: CRM Desk - Database Schema

## Overview

This phase creates the complete database schema for the CRM Desk MVP, establishing the foundation for managing customer relationships from lead capture through closed deals. The schema includes 6 new tables that integrate with existing `accounts` and `user_profiles` tables.

**Key Deliverables:**
- 6 new tables with multi-tenant RLS
- Complete CRM lifecycle support (lead → opportunity → proposal → close)
- Activities table as Digital Thread foundation
- Polymorphic relationships for flexible entity linking

**Business Value:**
- Enables complete sales pipeline management
- Foundation for revenue tracking and forecasting
- Digital Thread begins capturing customer interaction history

## Design Decisions

### Decision 1: Lead to Account Conversion Pattern

**Context:** How should leads progress to become customers? Need clear workflow from prospect to account.

**Options Considered:**
1. **Convert lead to account** (Selected)
   - Pros: Clean separation between prospects and customers, clear lifecycle
   - Cons: Requires conversion step

2. **Keep lead separate from account**
   - Pros: More flexible
   - Cons: Messy data, unclear when something becomes a customer

3. **Always require account from the start**
   - Pros: Simpler
   - Cons: Forces account creation too early

**Decision:** Option 1 selected because it provides clear lifecycle stages. Lead stays as prospect record until qualified, then we create Account + Contact + Opportunity from it. Lead is marked "converted" and references the new records.

### Decision 2: Contacts Table for People

**Context:** Need to track individuals (stakeholders) at companies, separate from company (account) records.

**Options Considered:**
1. **Create contacts table** (Selected)
   - Pros: Clean separation (accounts = companies, contacts = people), supports multiple contacts per account
   - Cons: Additional table complexity

2. **Keep contact info in accounts only**
   - Pros: Simpler, single table
   - Cons: Limited to one contact per account, doesn't scale

3. **Contacts are optional/future enhancement**
   - Pros: Faster MVP
   - Cons: Incomplete data model, hard to add later

**Decision:** Option 1 selected because B2B sales require tracking multiple stakeholders at each client company. Opportunities reference both account_id and primary_contact_id.

### Decision 3: Separate Activities Table for CRM Interactions

**Context:** Need unified timeline for CRM interactions (calls, emails, notes) across all entities. Already have `activity_logs` for system audit trail.

**Options Considered:**
1. **Create separate activities table for CRM interactions** (Selected)
   - Pros: Clean separation between user activities and system audit, polymorphic design enables unified timeline
   - Cons: Additional table

2. **Extend activity_logs to include user activities**
   - Pros: Single table for everything
   - Cons: Mixes user interactions with system audit trail

3. **Use entity-specific activity tables**
   - Pros: Clear structure per entity
   - Cons: Many tables, hard to build unified timeline

**Decision:** Option 1 selected. New `activities` table for user-created CRM interactions, separate from `activity_logs` (system audit). This becomes the Digital Thread timeline foundation with polymorphic entity linking.

### Decision 4: Proposals with Line Items Structure

**Context:** Need to generate formal quotes/proposals with itemized pricing.

**Options Considered:**
1. **Proposals + Line Items tables** (Selected)
   - Pros: Clean separation, flexible line items, standard invoice pattern
   - Cons: Two tables to manage

2. **Include product catalog**
   - Pros: Reusable products, more structured
   - Cons: Overkill for MVP, adds complexity

3. **Simple JSON structure**
   - Pros: Single table, simple
   - Cons: Harder to query and report on line items

**Decision:** Option 1 selected. Standard two-table pattern with `proposals` header and `proposal_line_items` detail. Totals calculated from line items. No product catalog for MVP.

### Decision 5: Opportunity Forecasting with Probability

**Context:** Sales forecasting requires probability-weighted pipeline calculations.

**Options Considered:**
1. **Probability by stage** (Selected)
   - Pros: Standard sales forecasting, auto-calculated, can be manually adjusted
   - Cons: Requires stage-to-probability mapping

2. **Manual probability only**
   - Pros: Simpler
   - Cons: Requires more user input, inconsistent

3. **No probability field**
   - Pros: Simplest
   - Cons: Inaccurate forecasting

**Decision:** Option 1 selected. Each stage has default probability (Prospecting=10%, Qualification=25%, Proposal=50%, Negotiation=75%, Closed Won=100%, Closed Lost=0%). Auto-set when stage changes but user can adjust. Weighted forecast = SUM(value × probability).

## Technical Approach

### Architecture

**CRM Data Flow:**
```
Lead (prospect)
  ↓ Qualification
  ↓ Conversion
  ├─→ Account (company)
  ├─→ Contact (person)
  └─→ Opportunity (deal)
        ↓ Progress through pipeline
        ↓ Create proposal
        └─→ Proposal + Line Items
              ↓ Accept/Reject
              └─→ Close Won/Lost
```

**Entity Relationships:**
- `accounts` (1) ←→ (∞) `contacts`
- `accounts` (1) ←→ (∞) `opportunities`
- `contacts` (1) ←→ (∞) `opportunities` (primary contact)
- `opportunities` (1) ←→ (∞) `proposals`
- `proposals` (1) ←→ (∞) `proposal_line_items`
- `activities` (∞) ←→ (1) any entity (polymorphic)

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
