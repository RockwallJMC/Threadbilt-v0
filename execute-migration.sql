-- Migration: Add contact form fields
-- Companies table additions
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founding_year INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS notes TEXT;

-- Contacts table additions
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS personal_email TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS alternate_phone TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array of strings

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contacts_personal_email ON contacts(personal_email);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);

-- Add check constraints for enum-like fields
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS check_status;
ALTER TABLE contacts ADD CONSTRAINT check_status
  CHECK (status IN ('currentlyWorking', 'notWorking', 'seekingOpportunities'));

ALTER TABLE contacts DROP CONSTRAINT IF EXISTS check_lead_status;
ALTER TABLE contacts ADD CONSTRAINT check_lead_status
  CHECK (lead_status IN ('new', 'contacted', 'qualified', 'interested', 'converted', 'closed', 'lost', 'nurturing'));

ALTER TABLE contacts DROP CONSTRAINT IF EXISTS check_priority;
ALTER TABLE contacts ADD CONSTRAINT check_priority
  CHECK (priority IN ('high', 'medium', 'low', 'urgent', 'normal'));

ALTER TABLE contacts DROP CONSTRAINT IF EXISTS check_lead_source;
ALTER TABLE contacts ADD CONSTRAINT check_lead_source
  CHECK (lead_source IN ('organic_search', 'paid_ads', 'social_media', 'referral', 'email_campaign', 'webinar', 'partner', 'event', 'cold_call', 'other'));

COMMENT ON COLUMN contacts.status IS 'Employment status of the contact';
COMMENT ON COLUMN contacts.lead_status IS 'Current stage in the sales pipeline';
COMMENT ON COLUMN contacts.priority IS 'Priority level for follow-up';
COMMENT ON COLUMN contacts.lead_source IS 'Original channel through which lead was acquired';

-- Seed data: Test data for Add Contact form E2E tests
-- Test Company 1: Existing company (should be selected, not created)
INSERT INTO companies (id, name, logo_url, industry, website, phone, city, state, country, founding_year)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'Existing Test Company Inc',
  'https://api.dicebear.com/7.x/initials/svg?seed=ETC',
  'technology',
  'https://existingtestco.com',
  '+1-555-TEST-001',
  'San Francisco',
  'CA',
  'USA',
  2015
) ON CONFLICT (id) DO NOTHING;

-- Test Contact 1: For duplicate email test
INSERT INTO contacts (
  id, user_id, first_name, last_name, email, phone, company_id,
  lead_source, lead_status, priority, created_by
)
VALUES (
  'ct000000-0000-0000-0000-000000000001',
  (SELECT id FROM auth.users WHERE email = 'admin@acme-corp.com'),
  'Existing',
  'Contact',
  'existing.contact@test.com',
  '+1-555-EXIST-01',
  'c0000000-0000-0000-0000-000000000001',
  'organic_search',
  'new',
  'medium',
  (SELECT id FROM auth.users WHERE email = 'admin@acme-corp.com')
) ON CONFLICT (id) DO NOTHING;
