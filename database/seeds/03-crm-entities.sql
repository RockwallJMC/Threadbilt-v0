-- Seed CRM entities for multi-tenant testing
-- Creates realistic test data for accounts, contacts, leads, opportunities, proposals
-- Ensures complete data isolation between organizations

-- ============================================================================
-- ORGANIZATION 1: ACME CORPORATION CRM DATA
-- ============================================================================

-- ACCOUNTS (Org 1)
INSERT INTO accounts (id, organization_id, name, type, status, industry, phone, email, website, owner_id, annual_revenue, employees, created_by, created_at, updated_at)
VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Global Bank Corp', 'customer', 'active', 'Finance', '555-0101', 'contact@globalbank.com', 'https://globalbank.com', 'a2222222-2222-2222-2222-222222222222', 50000000, 500, 'a1111111-1111-1111-1111-111111111111', now(), now()),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'MegaRetail Inc', 'prospect', 'active', 'Retail', '555-0102', 'hello@megaretail.com', 'https://megaretail.com', 'a2222222-2222-2222-2222-222222222222', 30000000, 300, 'a1111111-1111-1111-1111-111111111111', now(), now()),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'TechVentures LLC', 'customer', 'active', 'Technology', '555-0103', 'info@techventures.com', 'https://techventures.com', 'a3333333-3333-3333-3333-333333333333', 15000000, 150, 'a2222222-2222-2222-2222-222222222222', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  updated_at = now();

-- CONTACTS (Org 1)
INSERT INTO contacts (id, organization_id, account_id, first_name, last_name, email, phone, mobile, title, department, is_primary, created_by, created_at, updated_at)
VALUES
  ('31000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'John', 'Smith', 'john.smith@globalbank.com', '555-0101', '555-0201', 'VP of Security', 'Operations', true, 'a2222222-2222-2222-2222-222222222222', now(), now()),
  ('31000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Sarah', 'Johnson', 'sarah.johnson@globalbank.com', '555-0102', '555-0202', 'IT Manager', 'IT', false, 'a2222222-2222-2222-2222-222222222222', now(), now()),
  ('31000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'Mike', 'Williams', 'mike.williams@megaretail.com', '555-0103', '555-0203', 'Director of Facilities', 'Operations', true, 'a2222222-2222-2222-2222-222222222222', now(), now()),
  ('31000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'Emily', 'Davis', 'emily.davis@techventures.com', '555-0104', '555-0204', 'CTO', 'Technology', true, 'a3333333-3333-3333-3333-333333333333', now(), now())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  updated_at = now();

-- LEADS (Org 1)
INSERT INTO leads (id, organization_id, first_name, last_name, email, phone, company, title, source, status, lead_score, assigned_to, created_by, created_at, updated_at)
VALUES
  ('32000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Robert', 'Brown', 'robert.brown@newco.com', '555-0301', 'NewCo Industries', 'Security Manager', 'Website', 'new', 75, 'a2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', now(), now()),
  ('32000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Lisa', 'Martinez', 'lisa.martinez@startup.io', '555-0302', 'Startup.io', 'Founder', 'Referral', 'contacted', 85, 'a2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', now(), now()),
  ('32000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Tom', 'Wilson', 'tom.wilson@enterprise.com', '555-0303', 'Enterprise Solutions', 'VP Operations', 'Trade Show', 'qualified', 90, 'a3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', now(), now())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  updated_at = now();

-- OPPORTUNITIES (Org 1)
INSERT INTO opportunities (id, organization_id, account_id, primary_contact_id, name, description, value, currency, probability, stage, expected_close_date, owner_id, created_by, created_at, updated_at)
VALUES
  ('33000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', 'Global Bank HQ Security Upgrade', 'Complete security system overhaul for headquarters building', 250000.00, 'USD', 75, 'Proposal', '2026-03-15', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', now(), now()),
  ('33000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000003', 'MegaRetail Store Expansion', 'Security systems for 5 new retail locations', 180000.00, 'USD', 60, 'Qualification', '2026-04-20', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', now(), now()),
  ('33000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '31000000-0000-0000-0000-000000000004', 'TechVentures Data Center', 'Physical security for new data center facility', 320000.00, 'USD', 85, 'Negotiation', '2026-02-28', 'a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  value = EXCLUDED.value,
  probability = EXCLUDED.probability,
  stage = EXCLUDED.stage,
  updated_at = now();

-- PROPOSALS (Org 1)
INSERT INTO proposals (id, organization_id, opportunity_id, proposal_number, title, status, total_amount, currency, valid_until, created_by, created_at, updated_at)
VALUES
  ('34000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000001', 'PROP-2026-001', 'Global Bank HQ Security - Proposal', 'sent', 250000.00, 'USD', '2026-02-28', 'a2222222-2222-2222-2222-222222222222', now(), now()),
  ('34000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '33000000-0000-0000-0000-000000000003', 'PROP-2026-002', 'TechVentures Data Center - Proposal', 'draft', 320000.00, 'USD', '2026-03-15', 'a3333333-3333-3333-3333-333333333333', now(), now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  total_amount = EXCLUDED.total_amount,
  updated_at = now();

-- PROPOSAL LINE ITEMS (Org 1)
INSERT INTO proposal_line_items (id, organization_id, proposal_id, sort_order, description, quantity, unit_price, total, created_at, updated_at)
VALUES
  -- Proposal 1 line items
  ('35000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000001', 1, 'IP Security Cameras (4K)', 25, 800.00, 20000.00, now(), now()),
  ('35000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000001', 2, 'Network Video Recorder (NVR)', 2, 5000.00, 10000.00, now(), now()),
  ('35000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000001', 3, 'Access Control System', 1, 45000.00, 45000.00, now(), now()),
  ('35000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000001', 4, 'Installation & Configuration', 1, 75000.00, 75000.00, now(), now()),
  ('35000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000001', 5, '3-Year Maintenance Contract', 1, 100000.00, 100000.00, now(), now()),
  -- Proposal 2 line items
  ('35000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000002', 1, 'Biometric Access Control', 1, 65000.00, 65000.00, now(), now()),
  ('35000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000002', 2, 'Surveillance System (Enterprise)', 1, 120000.00, 120000.00, now(), now()),
  ('35000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000002', 3, 'Intrusion Detection System', 1, 55000.00, 55000.00, now(), now()),
  ('35000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '34000000-0000-0000-0000-000000000002', 4, 'Installation & Integration', 1, 80000.00, 80000.00, now(), now())
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  quantity = EXCLUDED.quantity,
  unit_price = EXCLUDED.unit_price,
  total = EXCLUDED.total,
  updated_at = now();

-- ============================================================================
-- ORGANIZATION 2: TECHSTART INDUSTRIES CRM DATA
-- ============================================================================

-- ACCOUNTS (Org 2)
INSERT INTO accounts (id, organization_id, name, type, status, industry, phone, email, website, owner_id, annual_revenue, employees, created_by, created_at, updated_at)
VALUES
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'SecureBuildings Co', 'customer', 'active', 'Real Estate', '555-1101', 'contact@securebuildings.com', 'https://securebuildings.com', 'b2222222-2222-2222-2222-222222222222', 25000000, 200, 'b1111111-1111-1111-1111-111111111111', now(), now()),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'HealthCare Systems', 'prospect', 'active', 'Healthcare', '555-1102', 'info@healthcaresys.com', 'https://healthcaresys.com', 'b2222222-2222-2222-2222-222222222222', 40000000, 350, 'b1111111-1111-1111-1111-111111111111', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  status = EXCLUDED.status,
  updated_at = now();

-- CONTACTS (Org 2)
INSERT INTO contacts (id, organization_id, account_id, first_name, last_name, email, phone, mobile, title, department, is_primary, created_by, created_at, updated_at)
VALUES
  ('41000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'Patricia', 'Garcia', 'patricia.garcia@securebuildings.com', '555-1101', '555-1201', 'Director of Security', 'Operations', true, 'b2222222-2222-2222-2222-222222222222', now(), now()),
  ('41000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', 'James', 'Rodriguez', 'james.rodriguez@healthcaresys.com', '555-1102', '555-1202', 'Facilities Manager', 'Facilities', true, 'b2222222-2222-2222-2222-222222222222', now(), now())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  updated_at = now();

-- LEADS (Org 2)
INSERT INTO leads (id, organization_id, first_name, last_name, email, phone, company, title, source, status, lead_score, assigned_to, created_by, created_at, updated_at)
VALUES
  ('42000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Jennifer', 'Lee', 'jennifer.lee@innovate.com', '555-1301', 'Innovate Corp', 'COO', 'LinkedIn', 'new', 70, 'b2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', now(), now()),
  ('42000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'David', 'Chen', 'david.chen@growth.io', '555-1302', 'Growth.io', 'VP Security', 'Email Campaign', 'contacted', 80, 'b2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', now(), now())
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  status = EXCLUDED.status,
  updated_at = now();

-- OPPORTUNITIES (Org 2)
INSERT INTO opportunities (id, organization_id, account_id, primary_contact_id, name, description, value, currency, probability, stage, expected_close_date, owner_id, created_by, created_at, updated_at)
VALUES
  ('43000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001', 'SecureBuildings Office Tower', 'Security system for new 20-story office building', 450000.00, 'USD', 90, 'Negotiation', '2026-03-01', 'b2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', now(), now()),
  ('43000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '41000000-0000-0000-0000-000000000002', 'HealthCare Campus Security', 'Multi-building healthcare campus security', 600000.00, 'USD', 65, 'Proposal', '2026-05-15', 'b2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  value = EXCLUDED.value,
  probability = EXCLUDED.probability,
  stage = EXCLUDED.stage,
  updated_at = now();

-- PROPOSALS (Org 2)
INSERT INTO proposals (id, organization_id, opportunity_id, proposal_number, title, status, total_amount, currency, valid_until, created_by, created_at, updated_at)
VALUES
  ('44000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '43000000-0000-0000-0000-000000000001', 'PROP-TS-2026-001', 'SecureBuildings Office Tower - Security Proposal', 'sent', 450000.00, 'USD', '2026-03-15', 'b2222222-2222-2222-2222-222222222222', now(), now())
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  total_amount = EXCLUDED.total_amount,
  updated_at = now();

-- PROPOSAL LINE ITEMS (Org 2)
INSERT INTO proposal_line_items (id, organization_id, proposal_id, sort_order, description, quantity, unit_price, total, created_at, updated_at)
VALUES
  ('45000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000001', 1, 'IP Cameras (Enterprise Grade)', 50, 1200.00, 60000.00, now(), now()),
  ('45000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000001', 2, 'Central Monitoring System', 1, 85000.00, 85000.00, now(), now()),
  ('45000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000001', 3, 'Access Control (Multi-Building)', 1, 120000.00, 120000.00, now(), now()),
  ('45000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000001', 4, 'Fire & Intrusion Detection', 1, 95000.00, 95000.00, now(), now()),
  ('45000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', '44000000-0000-0000-0000-000000000001', 5, 'Professional Installation', 1, 90000.00, 90000.00, now(), now())
ON CONFLICT (id) DO UPDATE SET
  description = EXCLUDED.description,
  quantity = EXCLUDED.quantity,
  unit_price = EXCLUDED.unit_price,
  total = EXCLUDED.total,
  updated_at = now();
