# Phase 1.2: Add Contact Form - Database Wiring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the existing 3-step Add Contact form (`/apps/crm/add-contact`) to live Supabase database, creating contacts and companies with proper validation, RLS policies, and E2E test coverage.

**Architecture:** TDD approach using bottom-up layering: Supabase schema/migrations → API routes → SWR hooks → UI integration. Form collects personal info, company info, and lead info across 3 steps, then creates both `contacts` and `companies` records (if new company).

**Tech Stack:** Supabase (PostgreSQL + RLS), Next.js API Routes, SWR, React Hook Form, Yup validation, Playwright E2E tests

---

## Prerequisites

**Assumed Complete from Phase 1.1:**
- `companies` table with RLS policies
- `contacts` table with RLS policies
- Database trigger function `update_updated_at_column()`
- Supabase client configuration in `/lib/supabase/`

**Current Form Behavior:**
- 3-step wizard: Personal Info → Company Info → Lead Info
- Validates each step before progression
- Console logs form data on final submit (line 99 of AddContactStepper.jsx)
- Shows success snackbar and resets form

**Target Behavior After Wiring:**
- Step 3 submit creates company (if new) and contact in Supabase
- Redirects to `/apps/crm/lead-details/[new-contact-id]` on success
- Shows specific error messages for duplicate emails, validation failures
- All data persists across sessions

---

## Task 1: Database Layer - Verify Schema & Add Missing Columns

**Files:**
- Read: `database/migrations/001_create_companies.sql` (from Phase 1.1)
- Read: `database/migrations/002_create_contacts.sql` (from Phase 1.1)
- Create: `database/migrations/003_add_contact_form_fields.sql`
- Create: `database/seeds/04-add-contact-test-data.sql`

### Step 1: Read existing schema to understand current structure

Read both migration files to confirm what exists. Expected fields:

**companies:**
- id, name, logo_url, industry, website, created_at, updated_at

**contacts:**
- id, user_id, first_name, last_name, email, phone, title, company_id, lead_source, lead_status, contact_owner_id, created_at, updated_at, created_by

### Step 2: Create migration for missing form fields

Create: `database/migrations/003_add_contact_form_fields.sql`

```sql
-- Add columns needed by Add Contact form that don't exist in base schema

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
ALTER TABLE contacts ADD CONSTRAINT check_status
  CHECK (status IN ('currentlyWorking', 'notWorking', 'seekingOpportunities'));

ALTER TABLE contacts ADD CONSTRAINT check_lead_status
  CHECK (lead_status IN ('new', 'contacted', 'qualified', 'interested', 'converted', 'closed', 'lost', 'nurturing'));

ALTER TABLE contacts ADD CONSTRAINT check_priority
  CHECK (priority IN ('high', 'medium', 'low', 'urgent', 'normal'));

ALTER TABLE contacts ADD CONSTRAINT check_lead_source
  CHECK (lead_source IN ('organic_search', 'paid_ads', 'social_media', 'referral', 'email_campaign', 'webinar', 'partner', 'event', 'cold_call', 'other'));

COMMENT ON COLUMN contacts.status IS 'Employment status of the contact';
COMMENT ON COLUMN contacts.lead_status IS 'Current stage in the sales pipeline';
COMMENT ON COLUMN contacts.priority IS 'Priority level for follow-up';
COMMENT ON COLUMN contacts.lead_source IS 'Original channel through which lead was acquired';
```

### Step 3: Create test seed data

Create: `database/seeds/04-add-contact-test-data.sql`

```sql
-- Test data for Add Contact form E2E tests
-- Uses existing user from Phase 1.2 auth setup (admin@acme-corp.com)

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
```

### Step 4: Run migrations via Supabase agent

**Command:**
```bash
# Delegate to supabase-database-architect agent
# Agent will use Supabase MCP tools to execute migrations
```

**Expected:** Migration executes successfully, columns added, constraints created.

### Step 5: Verify schema in Supabase

**Command:**
```bash
# Query via supabase-database-architect agent to verify
```

**Expected Query Result:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'contacts'
  AND column_name IN ('personal_email', 'alternate_phone', 'date_of_birth', 'tags');
-- Should return 4 rows
```

### Step 6: Commit migration files

```bash
git add database/migrations/003_add_contact_form_fields.sql database/seeds/04-add-contact-test-data.sql
git commit -m "feat(db): add contact form fields migration

- Add personal_email, alternate_phone, date_of_birth to contacts
- Add company address fields and founding_year
- Add check constraints for enum fields
- Create test seed data for E2E tests"
```

---

## Task 2: API Layer - POST /api/crm/contacts Endpoint

**Files:**
- Create: `src/app/api/crm/contacts/route.js`
- Create: `tests/api/crm-contacts-post.spec.js`

### Step 1: Write failing API test

Create: `tests/api/crm-contacts-post.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('POST /api/crm/contacts', () => {
  test('should create new contact with new company', async ({ request }) => {
    // Arrange: Valid contact data with new company
    const contactData = {
      personalInfo: {
        firstName: 'Jane',
        lastName: 'Doe',
        workEmail: 'jane.doe@newcompany.com',
        personalEmail: 'jane.personal@gmail.com',
        phoneNumber: '+1-555-NEW-001',
        alternatePhoneNumber: '+1-555-NEW-002',
        dateOfBirth: '1990-05-15',
        jobTitle: 'VP of Sales',
        status: 'currentlyWorking',
        linkedInUrl: 'https://linkedin.com/in/janedoe',
        note: 'Met at conference',
      },
      companyInfo: {
        companyName: 'New Test Company LLC',
        industryType: 'technology',
        foundingYear: '2020',
        contact: {
          officialEmail: 'info@newtestco.com',
          phoneNumber: '+1-555-COMPANY',
          streetAddress: '123 Tech Street',
          city: 'Austin',
          state: 'TX',
          country: 'USA',
          zipCode: '78701',
        },
        website: 'https://newtestco.com',
        note: 'High-growth startup',
      },
      leadInfo: {
        source: 'referral',
        assignedAgent: 'agent1',
        status: 'qualified',
        priority: 'high',
        tags: ['Technology', 'Enterprise'],
        note: 'Warm lead from partner',
      },
    };

    // Act: POST to contacts endpoint
    const response = await request.post('/api/crm/contacts', {
      data: contactData,
    });

    // Assert: Response structure
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body).toHaveProperty('contact');
    expect(body).toHaveProperty('company');
    expect(body.contact.id).toBeTruthy();
    expect(body.contact.first_name).toBe('Jane');
    expect(body.contact.last_name).toBe('Doe');
    expect(body.contact.email).toBe('jane.doe@newcompany.com');
    expect(body.company.name).toBe('New Test Company LLC');
  });

  test('should create contact with existing company', async ({ request }) => {
    const contactData = {
      personalInfo: {
        firstName: 'John',
        lastName: 'Smith',
        workEmail: 'john.smith@existingtestco.com',
        personalEmail: 'john@personal.com',
        phoneNumber: '+1-555-JOHN-001',
        jobTitle: 'Sales Rep',
        status: 'currentlyWorking',
      },
      companyInfo: {
        companyId: 'c0000000-0000-0000-0000-000000000001', // Existing company from seed
        companyName: 'Existing Test Company Inc', // Should be ignored when ID provided
      },
      leadInfo: {
        source: 'cold_call',
        assignedAgent: 'agent2',
        status: 'new',
        priority: 'medium',
        tags: ['Sales'],
      },
    };

    const response = await request.post('/api/crm/contacts', {
      data: contactData,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.contact.company_id).toBe('c0000000-0000-0000-0000-000000000001');
    expect(body.company.id).toBe('c0000000-0000-0000-0000-000000000001');
  });

  test('should reject duplicate email', async ({ request }) => {
    const contactData = {
      personalInfo: {
        firstName: 'Duplicate',
        lastName: 'User',
        workEmail: 'existing.contact@test.com', // Exists in seed data
        phoneNumber: '+1-555-DUP-001',
        jobTitle: 'Manager',
        status: 'currentlyWorking',
      },
      companyInfo: {
        companyName: 'Some Company',
        industryType: 'finance',
      },
      leadInfo: {
        source: 'organic_search',
        status: 'new',
        priority: 'low',
        tags: ['Test'],
      },
    };

    const response = await request.post('/api/crm/contacts', {
      data: contactData,
    });

    expect(response.status()).toBe(409);
    const body = await response.json();
    expect(body.error).toContain('email already exists');
  });

  test('should validate required fields', async ({ request }) => {
    const invalidData = {
      personalInfo: {
        firstName: 'Test',
        // Missing required lastName
      },
      companyInfo: {},
      leadInfo: {},
    };

    const response = await request.post('/api/crm/contacts', {
      data: invalidData,
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
    expect(body.validationErrors).toBeTruthy();
  });
});
```

### Step 2: Run test to verify it fails

**Command:**
```bash
npx playwright test tests/api/crm-contacts-post.spec.js --reporter=list
```

**Expected:** All 4 tests FAIL with "404 Not Found" (route doesn't exist yet)

### Step 3: Implement minimal API route

Create: `src/app/api/crm/contacts/route.js`

```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/crm/contacts
 * Creates a new contact and optionally a new company
 *
 * Request body shape (from Add Contact form):
 * {
 *   personalInfo: { firstName, lastName, workEmail, ... },
 *   companyInfo: { companyName, industryType, ... } | { companyId },
 *   leadInfo: { source, status, priority, tags, ... }
 * }
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { personalInfo, companyInfo, leadInfo } = await request.json();

    // Validate required fields
    const requiredPersonal = ['firstName', 'lastName', 'workEmail', 'phoneNumber', 'jobTitle', 'status'];
    const requiredLead = ['source', 'status', 'priority', 'tags'];

    const missingFields = [];
    requiredPersonal.forEach(field => {
      if (!personalInfo?.[field]) missingFields.push(`personalInfo.${field}`);
    });
    requiredLead.forEach(field => {
      if (!leadInfo?.[field]) missingFields.push(`leadInfo.${field}`);
    });

    if (missingFields.length > 0) {
      return NextResponse.json({
        error: 'Validation failed',
        validationErrors: missingFields,
      }, { status: 400 });
    }

    // Check for duplicate email
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('id')
      .eq('email', personalInfo.workEmail)
      .single();

    if (existingContact) {
      return NextResponse.json({
        error: 'A contact with this email already exists',
      }, { status: 409 });
    }

    let companyId = companyInfo.companyId;

    // Create company if new (no companyId provided)
    if (!companyId && companyInfo.companyName) {
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: companyInfo.companyName,
          industry: companyInfo.industryType,
          website: companyInfo.website,
          phone: companyInfo.contact?.phoneNumber,
          street_address: companyInfo.contact?.streetAddress,
          city: companyInfo.contact?.city,
          state: companyInfo.contact?.state,
          country: companyInfo.contact?.country,
          zip_code: companyInfo.contact?.zipCode,
          founding_year: companyInfo.foundingYear ? parseInt(companyInfo.foundingYear) : null,
          notes: companyInfo.note,
        })
        .select()
        .single();

      if (companyError) {
        return NextResponse.json({
          error: 'Failed to create company',
          details: companyError.message,
        }, { status: 500 });
      }

      companyId = newCompany.id;
    }

    // Create contact
    const { data: newContact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        email: personalInfo.workEmail,
        personal_email: personalInfo.personalEmail,
        phone: personalInfo.phoneNumber,
        alternate_phone: personalInfo.alternatePhoneNumber,
        date_of_birth: personalInfo.dateOfBirth,
        title: personalInfo.jobTitle,
        status: personalInfo.status,
        linkedin_url: personalInfo.linkedInUrl,
        notes: personalInfo.note,
        company_id: companyId,
        lead_source: leadInfo.source,
        lead_status: leadInfo.status,
        priority: leadInfo.priority,
        tags: leadInfo.tags,
        contact_owner_id: user.id,
        created_by: user.id,
      })
      .select('*, companies(*)')
      .single();

    if (contactError) {
      return NextResponse.json({
        error: 'Failed to create contact',
        details: contactError.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      contact: newContact,
      company: newContact.companies,
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/crm/contacts error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
    }, { status: 500 });
  }
}
```

### Step 4: Run tests to verify they pass

**Command:**
```bash
npx playwright test tests/api/crm-contacts-post.spec.js --reporter=list
```

**Expected:** All 4 tests PASS

### Step 5: Commit API implementation

```bash
git add src/app/api/crm/contacts/route.js tests/api/crm-contacts-post.spec.js
git commit -m "feat(api): POST /api/crm/contacts endpoint

- Create contact with new or existing company
- Validate required fields
- Check for duplicate emails (409 response)
- Return contact with company data
- 100% test coverage with 4 E2E API tests"
```

---

## Task 3: SWR Hook - useCreateContact

**Files:**
- Create: `src/services/crm/useCreateContact.js`
- Create: `tests/hooks/use-create-contact.spec.js`

### Step 1: Write failing hook test

Create: `tests/hooks/use-create-contact.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('useCreateContact Hook', () => {
  test('should successfully create contact via hook', async ({ page }) => {
    // Navigate to test page that uses the hook
    await page.goto('/test/use-create-contact-test-page');

    // Fill form and submit
    await page.fill('[data-testid="first-name"]', 'Hook');
    await page.fill('[data-testid="last-name"]', 'Test');
    await page.fill('[data-testid="email"]', 'hook.test@example.com');
    await page.click('[data-testid="submit"]');

    // Verify success state
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-id"]')).toHaveText(/.+/); // Has some ID
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/test/use-create-contact-test-page');

    // Submit with duplicate email
    await page.fill('[data-testid="email"]', 'existing.contact@test.com');
    await page.click('[data-testid="submit"]');

    // Verify error state
    await expect(page.locator('[data-testid="error-message"]')).toContainText('already exists');
  });
});
```

### Step 2: Run test to verify it fails

**Command:**
```bash
npx playwright test tests/hooks/use-create-contact.spec.js
```

**Expected:** FAIL (test page doesn't exist, hook doesn't exist)

### Step 3: Create test page for hook

Create: `src/app/test/use-create-contact-test-page/page.jsx`

```jsx
'use client';

import { useState } from 'react';
import { useCreateContact } from '@/services/crm/useCreateContact';

export default function TestPage() {
  const [formData, setFormData] = useState({
    personalInfo: { firstName: '', lastName: '', workEmail: '', phoneNumber: '555-0000', jobTitle: 'Test', status: 'currentlyWorking' },
    companyInfo: { companyName: 'Test Co', industryType: 'technology' },
    leadInfo: { source: 'organic_search', status: 'new', priority: 'low', tags: ['Test'] },
  });

  const { createContact, isLoading, error, data } = useCreateContact();

  const handleSubmit = async () => {
    await createContact(formData);
  };

  return (
    <div>
      <input
        data-testid="first-name"
        value={formData.personalInfo.firstName}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, firstName: e.target.value }
        }))}
      />
      <input
        data-testid="last-name"
        value={formData.personalInfo.lastName}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, lastName: e.target.value }
        }))}
      />
      <input
        data-testid="email"
        value={formData.personalInfo.workEmail}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, workEmail: e.target.value }
        }))}
      />
      <button data-testid="submit" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create'}
      </button>
      {error && <div data-testid="error-message">{error}</div>}
      {data && (
        <>
          <div data-testid="success-message">Success!</div>
          <div data-testid="contact-id">{data.contact.id}</div>
        </>
      )}
    </div>
  );
}
```

### Step 4: Implement SWR hook

Create: `src/services/crm/useCreateContact.js`

```javascript
import { useState } from 'react';

/**
 * Hook for creating a new contact via POST /api/crm/contacts
 *
 * Usage:
 *   const { createContact, isLoading, error, data } = useCreateContact();
 *   await createContact({ personalInfo, companyInfo, leadInfo });
 */
export function useCreateContact() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const createContact = async (contactData) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create contact');
      }

      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createContact,
    isLoading,
    error,
    data,
  };
}
```

### Step 5: Run tests to verify they pass

**Command:**
```bash
npx playwright test tests/hooks/use-create-contact.spec.js --reporter=list
```

**Expected:** Both tests PASS

### Step 6: Commit hook implementation

```bash
git add src/services/crm/useCreateContact.js tests/hooks/use-create-contact.spec.js src/app/test/use-create-contact-test-page/page.jsx
git commit -m "feat(hooks): useCreateContact SWR hook

- Manage loading, error, and data states
- POST to /api/crm/contacts
- Test coverage with isolated test page
- Ready for integration into AddContactStepper"
```

---

## Task 4: UI Integration - Wire Form to API

**Files:**
- Modify: `src/components/sections/crm/add-contact/AddContactStepper.jsx:98-104`
- Create: `tests/e2e/add-contact-form.spec.js`

### Step 1: Write failing E2E test

Create: `tests/e2e/add-contact-form.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { TEST_ORGS } from '../helpers/multi-tenant-setup.js';

test.describe('Add Contact Form E2E', () => {
  test.use({ storageState: 'tests/.auth/user.json' }); // Use authenticated session

  test('should create new contact with new company', async ({ page }) => {
    // Navigate to form
    await page.goto('/apps/crm/add-contact');

    // Step 1: Personal Info
    await page.fill('input[name="personalInfo.firstName"]', 'E2E');
    await page.fill('input[name="personalInfo.lastName"]', 'TestUser');
    await page.fill('input[name="personalInfo.workEmail"]', 'e2e.testuser@newcompany.io');
    await page.fill('input[name="personalInfo.personalEmail"]', 'e2e.personal@gmail.com');
    await page.fill('input[name="personalInfo.phoneNumber"]', '555-E2E-0001');
    await page.fill('input[name="personalInfo.jobTitle"]', 'QA Engineer');
    await page.click('div[role="button"]:has-text("Currently Working")');
    await page.click('button:has-text("Save & Continue")');

    // Step 2: Company Info
    await expect(page.locator('h6:has-text("Company Information")')).toBeVisible();
    await page.fill('input[name="companyInfo.companyName"]', 'E2E Test Company');
    await page.click('div[role="button"]:has-text("Industry Type")');
    await page.click('li:has-text("Technology")');
    await page.fill('input[name="companyInfo.contact.officialEmail"]', 'info@e2etestco.com');
    await page.fill('input[name="companyInfo.contact.phoneNumber"]', '555-COMPANY');
    await page.fill('input[name="companyInfo.contact.streetAddress"]', '123 E2E Street');
    await page.fill('input[name="companyInfo.contact.city"]', 'TestCity');
    await page.fill('input[name="companyInfo.contact.state"]', 'TX');
    await page.fill('input[name="companyInfo.contact.country"]', 'USA');
    await page.fill('input[name="companyInfo.contact.zipCode"]', '12345');
    await page.click('button:has-text("Save & Continue")');

    // Step 3: Lead Info
    await expect(page.locator('h6:has-text("Lead Information")')).toBeVisible();
    await page.click('div[role="button"]:has-text("Lead Source Type")');
    await page.click('li:has-text("Referral")');
    await page.click('div[role="button"]:has-text("Lead Status")');
    await page.click('li:has-text("Qualified")');
    await page.click('div[role="button"]:has-text("Priority")');
    await page.click('li:has-text("High")');
    await page.fill('input[id="tags"]', 'Technology');
    await page.keyboard.press('Enter');
    await page.fill('input[id="tags"]', 'Enterprise');
    await page.keyboard.press('Enter');

    // Submit final form
    await page.click('button:has-text("Save")');

    // Verify success and redirect
    await expect(page).toHaveURL(/\/apps\/crm\/lead-details\/[a-f0-9-]+/);
    await expect(page.locator('text=E2E TestUser')).toBeVisible();
  });

  test('should show error for duplicate email', async ({ page }) => {
    await page.goto('/apps/crm/add-contact');

    // Fill Step 1 with existing email
    await page.fill('input[name="personalInfo.firstName"]', 'Duplicate');
    await page.fill('input[name="personalInfo.lastName"]', 'User');
    await page.fill('input[name="personalInfo.workEmail"]', 'existing.contact@test.com');
    await page.fill('input[name="personalInfo.phoneNumber"]', '555-0000');
    await page.fill('input[name="personalInfo.jobTitle"]', 'Test');
    await page.click('div[role="button"]:has-text("Currently Working")');
    await page.click('button:has-text("Save & Continue")');

    // Fill Step 2 minimally
    await page.fill('input[name="companyInfo.companyName"]', 'Test');
    await page.click('button:has-text("Save & Continue")');

    // Fill Step 3 minimally
    await page.click('div[role="button"]:has-text("Lead Source Type")');
    await page.click('li:has-text("Organic Search")');
    await page.click('div[role="button"]:has-text("Lead Status")');
    await page.click('li:has-text("New")');
    await page.click('div[role="button"]:has-text("Priority")');
    await page.click('li:has-text("Low")');
    await page.fill('input[id="tags"]', 'Test');
    await page.keyboard.press('Enter');

    // Submit and expect error
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=/email already exists/i')).toBeVisible();
  });
});
```

### Step 2: Run test to verify it fails

**Command:**
```bash
npx playwright test tests/e2e/add-contact-form.spec.js
```

**Expected:** FAIL (form still console.logs instead of calling API)

### Step 3: Wire form submit to useCreateContact hook

Modify: `src/components/sections/crm/add-contact/AddContactStepper.jsx`

Replace lines 98-104:

```javascript
// OLD CODE (remove this):
const onSubmit = (data) => {
  console.log('Form data', data);
  enqueueSnackbar('Contact added successfully', { variant: 'success' });
  reset();
  setCompletedSteps({});
  setActiveStep(0);
};
```

With:

```javascript
// NEW CODE:
import { useRouter } from 'next/navigation';
import { useCreateContact } from '@/services/crm/useCreateContact';

// ... inside component:
const router = useRouter();
const { createContact, isLoading: isCreating } = useCreateContact();

const onSubmit = async (data) => {
  try {
    const result = await createContact(data);
    enqueueSnackbar('Contact added successfully', { variant: 'success' });
    reset();
    setCompletedSteps({});
    setActiveStep(0);

    // Redirect to lead-details page
    router.push(`/apps/crm/lead-details/${result.contact.id}`);
  } catch (error) {
    enqueueSnackbar(error.message || 'Failed to create contact', { variant: 'error' });
  }
};
```

Also update the Save button to show loading state:

```javascript
// Line ~143:
<Button type="submit" variant="soft" sx={{ px: 4 }} loading={isCreating}>
  Save
</Button>
```

### Step 4: Run E2E tests to verify they pass

**Command:**
```bash
npx playwright test tests/e2e/add-contact-form.spec.js --reporter=list
```

**Expected:** Both tests PASS

### Step 5: Commit UI integration

```bash
git add src/components/sections/crm/add-contact/AddContactStepper.jsx tests/e2e/add-contact-form.spec.js
git commit -m "feat(ui): wire Add Contact form to live database

- Replace console.log with useCreateContact hook
- Show loading state on Save button
- Redirect to lead-details on success
- Display error messages via snackbar
- Full E2E test coverage (happy path + duplicate email)"
```

---

## Task 5: Image Upload - Profile Picture & Company Logo

**Files:**
- Create: `src/app/api/upload/avatar/route.js`
- Modify: `src/components/sections/crm/add-contact/steps/PersonalInfoForm.jsx:54-75`
- Modify: `src/components/sections/crm/add-contact/steps/CompanyInfoForm.jsx:71-87`
- Create: `tests/api/upload-avatar.spec.js`

### Step 1: Create upload API endpoint

Create: `src/app/api/upload/avatar/route.js`

```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/upload/avatar
 * Upload avatar image to Supabase Storage
 * Returns public URL
 */
export async function POST(request) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}.${fileExt}`;

    // Upload to Supabase Storage bucket 'avatars'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({
        error: 'Upload failed',
        details: uploadError.message,
      }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: fileName,
    }, { status: 201 });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json({
      error: 'Internal server error',
    }, { status: 500 });
  }
}
```

### Step 2: Update PersonalInfoForm to upload on change

Modify: `src/components/sections/crm/add-contact/steps/PersonalInfoForm.jsx`

Add at top:
```javascript
const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
```

Replace Controller for profileImage (lines 54-75):

```javascript
<Controller
  control={control}
  name="personalInfo.profileImage"
  render={({ field: { value, onChange } }) => {
    return (
      <AvatarDropBox
        defaultFile={value}
        onDrop={async (acceptedFiles) => {
          if (acceptedFiles.length > 0) {
            setIsUploadingAvatar(true);
            try {
              const formData = new FormData();
              formData.append('file', acceptedFiles[0]);

              const response = await fetch('/api/upload/avatar', {
                method: 'POST',
                body: formData,
              });

              if (!response.ok) throw new Error('Upload failed');

              const data = await response.json();
              onChange(data.url); // Store URL instead of File object
            } catch (error) {
              console.error('Avatar upload error:', error);
              // Keep file object as fallback
              onChange(acceptedFiles[0]);
            } finally {
              setIsUploadingAvatar(false);
            }
          }
        }}
        sx={{
          '& img': {
            objectFit: 'cover',
          },
        }}
        error={errors.personalInfo?.profileImage ? 'Invalid avatar' : undefined}
      />
    );
  }}
/>
{isUploadingAvatar && <Typography variant="caption" color="primary">Uploading...</Typography>}
```

### Step 3: Similarly update CompanyInfoForm

Apply same pattern to `CompanyInfoForm.jsx` lines 71-87 for company avatar upload.

### Step 4: Update API route to store URLs

Modify: `src/app/api/crm/contacts/route.js` line ~80:

```javascript
profile_image_url: personalInfo.profileImage, // Now stores URL string
```

And line ~50 (company logo):

```javascript
logo_url: companyInfo.avatar, // Now stores URL string
```

### Step 5: Test upload manually

**Manual Test:**
1. Start dev server: `npm run dev`
2. Navigate to `/apps/crm/add-contact`
3. Drop an image in Profile Picture box
4. Verify "Uploading..." appears
5. Check browser network tab for POST /api/upload/avatar (should be 201)
6. Complete form and submit
7. Verify image URL is saved in database (check Supabase dashboard)

### Step 6: Commit image upload

```bash
git add src/app/api/upload/avatar/route.js src/components/sections/crm/add-contact/steps/PersonalInfoForm.jsx src/components/sections/crm/add-contact/steps/CompanyInfoForm.jsx src/app/api/crm/contacts/route.js
git commit -m "feat(upload): avatar upload to Supabase Storage

- POST /api/upload/avatar endpoint
- Upload on image drop in PersonalInfoForm
- Upload on image drop in CompanyInfoForm
- Store public URLs in database
- Show uploading indicator"
```

---

## Task 6: Verification & Cleanup

**Files:**
- Delete: `src/app/test/use-create-contact-test-page/` (test page no longer needed)
- Create: `.github/workflows/phase-1.2-verification.yml` (CI verification)

### Step 1: Run full test suite

**Command:**
```bash
npm run lint
npm run build
npx playwright test tests/api/crm-contacts-post.spec.js tests/e2e/add-contact-form.spec.js --reporter=list
```

**Expected:**
- 0 lint errors
- Build succeeds
- 6 Playwright tests PASS (4 API + 2 E2E)

### Step 2: Manual smoke test

**Manual Steps:**
1. Start dev: `npm run dev`
2. Login as `admin@acme-corp.com` / `TestPass123!`
3. Navigate to `/apps/crm/add-contact`
4. Complete all 3 steps with valid data
5. Verify redirect to `/apps/crm/lead-details/[id]`
6. Verify contact appears in Supabase dashboard
7. Try creating duplicate email → expect error snackbar

### Step 3: Clean up test artifacts

```bash
rm -rf src/app/test/use-create-contact-test-page/
git add -A
git commit -m "chore: remove test page after verification"
```

### Step 4: Update documentation

Update `docs/system/INDEX-crm-database-wiring.md`:

```markdown
### Phase 1.2: Create Page - Add Contact Form
- **Status**: ✅ Complete
- **Completed**: "2026-01-31"
- **Verification**: Form functional, creates contacts+companies, all tests pass
```

```bash
git add docs/system/INDEX-crm-database-wiring.md
git commit -m "docs: mark Phase 1.2 complete"
```

### Step 5: Create verification workflow

Create: `.github/workflows/phase-1.2-verification.yml`

```yaml
name: Phase 1.2 Verification

on:
  push:
    branches: [feature/desk-crm-database-wiring]
  pull_request:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci --legacy-peer-deps
      - run: npm run lint
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npx playwright test tests/api/crm-contacts-post.spec.js tests/e2e/add-contact-form.spec.js
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

```bash
git add .github/workflows/phase-1.2-verification.yml
git commit -m "ci: add Phase 1.2 verification workflow"
```

---

## Final Checklist

Before marking Phase 1.2 complete, verify:

- [ ] Database migration executed (003_add_contact_form_fields.sql)
- [ ] POST /api/crm/contacts endpoint working
- [ ] useCreateContact hook functional
- [ ] Add Contact form wired to API (no more console.log)
- [ ] Avatar upload to Supabase Storage working
- [ ] Redirects to lead-details on success
- [ ] Shows error for duplicate emails
- [ ] 6 Playwright tests passing (4 API + 2 E2E)
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] Documentation updated in INDEX
- [ ] CI workflow created and passing

---

## Execution Notes

**Estimated Time:** 4-6 hours for experienced developer following TDD strictly

**Dependencies:**
- Phase 1.1 must be complete (companies, contacts tables exist)
- Supabase Storage bucket 'avatars' must exist (create via Supabase dashboard if needed)
- Authenticated test user (admin@acme-corp.com) from Phase 1.2 auth setup

**Common Pitfalls:**
1. Forgetting to await createContact() → form submits but nothing happens
2. Not handling file upload errors → silent failures
3. Using File objects in state instead of URLs → breaks serialization
4. Missing RLS policies → 403 errors in production

**Troubleshooting:**
- If tests fail with 401: Check auth session in tests/.auth/user.json
- If upload fails: Verify Supabase Storage bucket 'avatars' exists and has public access
- If duplicate email doesn't error: Check contacts table unique constraint on email column
- If redirect fails: Ensure lead-details/[id]/page.jsx exists (created in Phase 1.3)
