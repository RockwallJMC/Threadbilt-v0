-- Seed data for Phase 1.4: Deal Details
-- Assumes Phase 1.1, 1.2, 1.3 seed data exists (companies, contacts, deals, activities)

-- Insert deal collaborators for existing deals
INSERT INTO deal_collaborators (id, deal_id, user_id, role, organization_id, created_at)
SELECT
  gen_random_uuid(),
  d.id,
  u.id,
  CASE
    WHEN row_number() OVER (PARTITION BY d.id ORDER BY random()) = 1 THEN 'owner'
    WHEN row_number() OVER (PARTITION BY d.id ORDER BY random()) <= 3 THEN 'collaborator'
    ELSE 'follower'
  END,
  d.organization_id,
  NOW()
FROM deals d
CROSS JOIN auth.users u
WHERE EXISTS (
  SELECT 1 FROM organization_members om
  WHERE om.user_id = u.id
  AND om.organization_id = d.organization_id
)
AND NOT EXISTS (
  SELECT 1 FROM deal_collaborators dc
  WHERE dc.deal_id = d.id
  AND dc.user_id = u.id
)
LIMIT 200; -- ~4-5 collaborators per deal

-- Insert additional activities for deals (to test activity summary)
INSERT INTO activities (
  id,
  organization_id,
  entity_type,
  entity_id,
  activity_type,
  subject,
  description,
  activity_date,
  duration_minutes,
  outcome,
  created_by,
  created_at
)
SELECT
  gen_random_uuid(),
  d.organization_id,
  'opportunity',
  d.id,
  (ARRAY['call', 'email', 'meeting', 'note', 'task'])[floor(random() * 5 + 1)],
  'Activity for ' || d.name,
  'Test activity description for deal ' || d.name,
  NOW() - (random() * interval '60 days'),
  (ARRAY[15, 30, 45, 60])[floor(random() * 4 + 1)],
  (ARRAY['successful', 'follow_up_needed', 'no_answer'])[floor(random() * 3 + 1)],
  u.id,
  NOW()
FROM deals d
CROSS JOIN auth.users u
WHERE EXISTS (
  SELECT 1 FROM organization_members om
  WHERE om.user_id = u.id
  AND om.organization_id = d.organization_id
)
LIMIT 300; -- ~6-10 activities per deal

-- Create one "test deal" with known ID for E2E testing
INSERT INTO deals (
  id,
  user_id,
  name,
  stage,
  amount,
  close_date,
  contact_id,
  company_id,
  organization_id,
  create_date,
  created_by
)
SELECT
  '00000000-0000-0000-0000-000000000001', -- Known test ID
  u.id,
  'Test Deal - Replica Badidas Futbol',
  'proposal',
  105000,
  NOW() + interval '90 days',
  c.id,
  c.company_id,
  om.organization_id,
  NOW() - interval '30 days',
  u.id
FROM crm_contacts c
CROSS JOIN auth.users u
JOIN organization_members om ON u.id = om.user_id
WHERE c.first_name = 'Test' -- Assumes test contact exists from Phase 1.2
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  amount = EXCLUDED.amount;

-- Add collaborators for test deal
INSERT INTO deal_collaborators (id, deal_id, user_id, role, organization_id, created_at)
SELECT
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  u.id,
  CASE row_number() OVER (ORDER BY random())
    WHEN 1 THEN 'owner'
    WHEN 2 THEN 'collaborator'
    ELSE 'follower'
  END,
  om.organization_id,
  NOW()
FROM auth.users u
JOIN organization_members om ON u.id = om.user_id
LIMIT 5
ON CONFLICT DO NOTHING;

-- Add activities for test deal
INSERT INTO activities (
  id,
  organization_id,
  entity_type,
  entity_id,
  activity_type,
  subject,
  description,
  activity_date,
  duration_minutes,
  outcome,
  created_by,
  created_at
)
SELECT
  gen_random_uuid(),
  om.organization_id,
  'opportunity',
  '00000000-0000-0000-0000-000000000001',
  activity_type,
  subject,
  description,
  activity_date,
  duration,
  'successful',
  u.id,
  NOW()
FROM (VALUES
  ('call', 'Purchasing-Related Vendors', 'Confirmed pricing, clarified timeline', NOW() - interval '5 hours', 45),
  ('email', 'Email Follow-up', 'Sent proposal updates, awaiting feedback', NOW() - interval '2 days', NULL),
  ('meeting', 'Meeting with Client', 'Discussed project scope and deliverables', NOW() - interval '3 days', 60),
  ('note', 'Follow-up Note', 'Client interested in additional features', NOW() - interval '1 day', NULL),
  ('task', 'Finalize Contract', 'Prepare final contract documents', NOW() + interval '2 days', NULL)
) AS a(activity_type, subject, description, activity_date, duration)
CROSS JOIN auth.users u
JOIN organization_members om ON u.id = om.user_id
LIMIT 5;
