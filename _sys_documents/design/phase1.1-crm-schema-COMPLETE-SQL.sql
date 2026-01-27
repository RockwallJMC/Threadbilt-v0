-- ============================================================================
-- Phase 1.1: CRM Desk - Complete Database Schema
-- ============================================================================
-- Version: 2.0
-- Date: 2026-01-27
-- Status: Approved
--
-- This file contains the complete validated SQL schema for 6 CRM tables:
-- 1. contacts - People at companies
-- 2. leads - Unqualified prospects
-- 3. opportunities - Sales pipeline deals
-- 4. proposals - Formal quotes
-- 5. proposal_line_items - Line items in proposals
-- 6. activities - CRM interaction timeline (Digital Thread)
-- ============================================================================

-- ============================================================================
-- TABLE 1: contacts
-- Purpose: Track people (stakeholders) at companies
-- ============================================================================

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile VARCHAR(50),
  title VARCHAR(255),
  department VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  linkedin_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  CONSTRAINT contacts_email_org_unique UNIQUE (email, organization_id)
);

-- Indexes for contacts
CREATE INDEX idx_contacts_organization_id ON contacts(organization_id);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_contacts_email ON contacts(email);

-- RLS for contacts
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_select_policy" ON contacts
  FOR SELECT USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "contacts_insert_policy" ON contacts
  FOR INSERT WITH CHECK (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "contacts_update_policy" ON contacts
  FOR UPDATE USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "contacts_delete_policy" ON contacts
  FOR DELETE USING (organization_id::text = current_setting('app.current_org_id', true));

-- ============================================================================
-- TABLE 2: leads
-- Purpose: Capture unqualified prospects before conversion
-- ============================================================================

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  source VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  lead_score INTEGER CHECK (lead_score >= 0 AND lead_score <= 100),
  qualification_notes TEXT,
  converted_to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  converted_to_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  converted_to_opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted'))
);

-- Indexes for leads
CREATE INDEX idx_leads_organization_id ON leads(organization_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_email ON leads(email);

-- RLS for leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_select_policy" ON leads
  FOR SELECT USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "leads_insert_policy" ON leads
  FOR INSERT WITH CHECK (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "leads_update_policy" ON leads
  FOR UPDATE USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "leads_delete_policy" ON leads
  FOR DELETE USING (organization_id::text = current_setting('app.current_org_id', true));

-- ============================================================================
-- TABLE 3: opportunities
-- Purpose: Track deals in the sales pipeline with forecasting
-- ============================================================================

CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  primary_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  value DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  probability INTEGER NOT NULL CHECK (probability >= 0 AND probability <= 100),
  stage VARCHAR(50) NOT NULL,
  expected_close_date DATE NOT NULL,
  actual_close_date DATE,
  close_reason TEXT,
  competitor VARCHAR(255),
  next_step TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  CHECK (stage IN ('Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'))
);

-- Indexes for opportunities
CREATE INDEX idx_opportunities_organization_id ON opportunities(organization_id);
CREATE INDEX idx_opportunities_account_id ON opportunities(account_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_owner_id ON opportunities(owner_id);
CREATE INDEX idx_opportunities_expected_close_date ON opportunities(expected_close_date);

-- RLS for opportunities
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "opportunities_select_policy" ON opportunities
  FOR SELECT USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "opportunities_insert_policy" ON opportunities
  FOR INSERT WITH CHECK (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "opportunities_update_policy" ON opportunities
  FOR UPDATE USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "opportunities_delete_policy" ON opportunities
  FOR DELETE USING (organization_id::text = current_setting('app.current_org_id', true));

-- ============================================================================
-- COMMENT: Stage to Probability Mapping (Application Logic)
-- ============================================================================
-- Prospecting → 10%
-- Qualification → 25%
-- Proposal → 50%
-- Negotiation → 75%
-- Closed Won → 100%
-- Closed Lost → 0%
--
-- This mapping should be implemented in application code or via trigger
-- ============================================================================

-- ============================================================================
-- TABLE 4: proposals
-- Purpose: Formal quotes/proposals linked to opportunities
-- ============================================================================

CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  proposal_number VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  total_amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  valid_until DATE NOT NULL,
  terms TEXT,
  notes TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  CONSTRAINT proposals_number_org_unique UNIQUE (proposal_number, organization_id)
);

-- Indexes for proposals
CREATE INDEX idx_proposals_organization_id ON proposals(organization_id);
CREATE INDEX idx_proposals_opportunity_id ON proposals(opportunity_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- RLS for proposals
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposals_select_policy" ON proposals
  FOR SELECT USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "proposals_insert_policy" ON proposals
  FOR INSERT WITH CHECK (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "proposals_update_policy" ON proposals
  FOR UPDATE USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "proposals_delete_policy" ON proposals
  FOR DELETE USING (organization_id::text = current_setting('app.current_org_id', true));

-- ============================================================================
-- TABLE 5: proposal_line_items
-- Purpose: Individual line items within proposals
-- ============================================================================

CREATE TABLE proposal_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for proposal_line_items
CREATE INDEX idx_proposal_line_items_organization_id ON proposal_line_items(organization_id);
CREATE INDEX idx_proposal_line_items_proposal_id ON proposal_line_items(proposal_id);

-- RLS for proposal_line_items
ALTER TABLE proposal_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "proposal_line_items_select_policy" ON proposal_line_items
  FOR SELECT USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "proposal_line_items_insert_policy" ON proposal_line_items
  FOR INSERT WITH CHECK (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "proposal_line_items_update_policy" ON proposal_line_items
  FOR UPDATE USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "proposal_line_items_delete_policy" ON proposal_line_items
  FOR DELETE USING (organization_id::text = current_setting('app.current_org_id', true));

-- ============================================================================
-- TABLE 6: activities
-- Purpose: Unified timeline of CRM interactions (Digital Thread foundation)
-- ============================================================================

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  activity_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  outcome VARCHAR(50),
  next_action TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  CHECK (entity_type IN ('lead', 'opportunity', 'account', 'contact', 'proposal')),
  CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'task', 'status_change'))
);

-- Indexes for activities
CREATE INDEX idx_activities_organization_id ON activities(organization_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_activity_date ON activities(activity_date DESC);
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_activities_activity_type ON activities(activity_type);

-- RLS for activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_policy" ON activities
  FOR SELECT USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "activities_insert_policy" ON activities
  FOR INSERT WITH CHECK (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "activities_update_policy" ON activities
  FOR UPDATE USING (organization_id::text = current_setting('app.current_org_id', true));

CREATE POLICY "activities_delete_policy" ON activities
  FOR DELETE USING (organization_id::text = current_setting('app.current_org_id', true));

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
