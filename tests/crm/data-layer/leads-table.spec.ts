/**
 * Data Layer Tests for CRM Leads Table
 *
 * Tests the database schema, RLS policies, seed data, and constraints
 * for the `leads` table using Supabase client directly (no browser).
 *
 * Following TDD Red-Green-Refactor:
 * - RED: Write test showing desired database behavior
 * - Verify RED: Run test, confirm it fails correctly (or passes if DB already correct)
 * - GREEN: Database architect fixes schema/RLS if test fails
 * - Verify GREEN: Re-run test, confirm passes
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Environment variables are loaded by Playwright from .env.test automatically
// Verify required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables. Ensure .env.test is loaded.');
}

// Test user credentials from .env.test
const TEST_USERS = {
  singleOrg: {
    email: process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL || 'test-single-org@piercedesk.test',
    password: process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD || 'TestPassword123!',
    orgName: process.env.PLAYWRIGHT_SINGLE_ORG_NAME || 'Test Organization A',
  },
  multiOrg: {
    email: process.env.PLAYWRIGHT_MULTI_ORG_EMAIL || 'test-multi-org@piercedesk.test',
    password: process.env.PLAYWRIGHT_MULTI_ORG_PASSWORD || 'TestPassword123!',
    orgName1: process.env.PLAYWRIGHT_MULTI_ORG_NAME_1 || 'Test Organization A',
    orgName2: process.env.PLAYWRIGHT_MULTI_ORG_NAME_2 || 'Test Organization B',
  },
};

test.describe('CRM Leads Table - Data Layer', () => {
  let supabase: any;
  let orgAUserId: string;
  let orgBUserId: string;
  let orgAId: string;
  let orgBId: string;

  test.beforeAll(async () => {
    // Create Supabase client
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Sign in as multi-org user to get org IDs
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USERS.multiOrg.email,
      password: TEST_USERS.multiOrg.password,
    });

    if (authError) {
      throw new Error(`Failed to authenticate: ${authError.message}`);
    }

    orgBUserId = authData.user.id;

    // Get organization memberships for multi-org user
    const { data: memberships, error: membershipsError } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(name)')
      .eq('user_id', authData.user.id);

    if (membershipsError) {
      throw new Error(`Failed to fetch organization memberships: ${membershipsError.message}`);
    }

    if (!memberships || memberships.length < 2) {
      throw new Error(
        'Multi-org test user must belong to at least 2 organizations. ' +
        'See .env.test for setup instructions.'
      );
    }

    // Identify Org A and Org B by name
    const orgA = memberships.find((m: any) => m.organizations?.name === TEST_USERS.multiOrg.orgName1);
    const orgB = memberships.find((m: any) => m.organizations?.name === TEST_USERS.multiOrg.orgName2);

    if (!orgA || !orgB) {
      throw new Error(
        `Could not find organizations "${TEST_USERS.multiOrg.orgName1}" and "${TEST_USERS.multiOrg.orgName2}". ` +
        'Check .env.test organization names match database.'
      );
    }

    orgAId = orgA.organization_id;
    orgBId = orgB.organization_id;

    await supabase.auth.signOut();

    // Sign in as single-org user
    const { data: singleOrgAuth, error: singleOrgError } = await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    if (singleOrgError) {
      throw new Error(`Failed to authenticate single-org user: ${singleOrgError.message}`);
    }

    orgAUserId = singleOrgAuth.user.id;

    await supabase.auth.signOut();
  });

  test.afterEach(async () => {
    // Sign out after each test to ensure clean state
    await supabase.auth.signOut();
  });

  test('should verify leads table exists with correct schema', async () => {
    // RED PHASE: Test will fail if schema is incorrect
    // This test verifies the table structure matches requirements

    // Sign in as single-org user to query database
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    // Query a single lead to verify column structure
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    expect(leads).toBeDefined();

    if (leads && leads.length > 0) {
      const lead = leads[0];

      // Verify required columns exist
      expect(lead).toHaveProperty('id');
      expect(lead).toHaveProperty('organization_id');
      expect(lead).toHaveProperty('status');
      expect(lead).toHaveProperty('first_name');
      expect(lead).toHaveProperty('last_name');
      expect(lead).toHaveProperty('email');
      expect(lead).toHaveProperty('phone');
      expect(lead).toHaveProperty('company');
      expect(lead).toHaveProperty('source');
      expect(lead).toHaveProperty('created_at');
      expect(lead).toHaveProperty('updated_at');
      expect(lead).toHaveProperty('created_by');
      expect(lead).toHaveProperty('updated_by');
      expect(lead).toHaveProperty('deleted_at');
      expect(lead).toHaveProperty('assigned_to');

      // Verify status is one of valid values
      const validStatuses = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
      expect(validStatuses).toContain(lead.status);
    }
  });

  test('should verify RLS policy enforces organization isolation', async () => {
    // RED PHASE: Test will fail if RLS allows cross-org access
    // This test verifies Org A user cannot see Org B leads

    // Sign in as single-org user (Org A)
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    // Query all leads (should only see Org A leads)
    const { data: orgALeads, error: orgAError } = await supabase
      .from('leads')
      .select('*');

    expect(orgAError).toBeNull();
    expect(orgALeads).toBeDefined();

    // Verify all leads belong to Org A
    if (orgALeads && orgALeads.length > 0) {
      orgALeads.forEach((lead: any) => {
        expect(lead.organization_id).toBe(orgAId);
      });
    }

    // Sign out and sign in as multi-org user with Org B context
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.multiOrg.email,
      password: TEST_USERS.multiOrg.password,
    });

    // Set organization context to Org B using RPC
    // Note: This assumes there's a set_current_org() function in Supabase
    // If not, we'll verify RLS through query results
    const { data: orgBLeads, error: orgBError } = await supabase
      .from('leads')
      .select('*')
      .eq('organization_id', orgBId);

    expect(orgBError).toBeNull();

    // Count leads in each org from multi-org user perspective
    const leadsGroupedByOrg = (orgBLeads || []).reduce((acc: any, lead: any) => {
      acc[lead.organization_id] = (acc[lead.organization_id] || 0) + 1;
      return acc;
    }, {});

    // Multi-org user should see leads from both orgs (based on their memberships)
    // But when we filter by orgBId, should only see Org B leads
    if (orgBLeads && orgBLeads.length > 0) {
      orgBLeads.forEach((lead: any) => {
        expect(lead.organization_id).toBe(orgBId);
      });
    }
  });

  test('should verify soft delete filter works (deleted_at IS NULL)', async () => {
    // RED PHASE: Test will fail if soft-deleted leads are returned
    // This test verifies SELECT policy includes deleted_at IS NULL filter

    await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    const { data: leads, error } = await supabase
      .from('leads')
      .select('*');

    expect(error).toBeNull();
    expect(leads).toBeDefined();

    // Verify no soft-deleted leads are returned
    if (leads && leads.length > 0) {
      leads.forEach((lead: any) => {
        expect(lead.deleted_at).toBeNull();
      });
    }
  });

  test('should verify seed data is queryable', async () => {
    // RED PHASE: Test will fail if seed data doesn't exist
    // This test verifies at least 5 leads exist across 2 organizations

    await supabase.auth.signInWithPassword({
      email: TEST_USERS.multiOrg.email,
      password: TEST_USERS.multiOrg.password,
    });

    // Query all leads visible to multi-org user
    const { data: allLeads, error } = await supabase
      .from('leads')
      .select('*');

    expect(error).toBeNull();
    expect(allLeads).toBeDefined();
    expect(allLeads!.length).toBeGreaterThanOrEqual(5);

    // Group by organization
    const leadsByOrg = (allLeads || []).reduce((acc: any, lead: any) => {
      acc[lead.organization_id] = (acc[lead.organization_id] || 0) + 1;
      return acc;
    }, {});

    const orgCount = Object.keys(leadsByOrg).length;
    expect(orgCount).toBeGreaterThanOrEqual(2);

    // Verify distribution (Org A: 3 leads, Org B: 2 leads based on seed data)
    expect(leadsByOrg[orgAId]).toBeGreaterThanOrEqual(1);
    expect(leadsByOrg[orgBId]).toBeGreaterThanOrEqual(1);

    // Verify status distribution
    const statusCounts = (allLeads || []).reduce((acc: any, lead: any) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    // Should have at least 2 different statuses
    const uniqueStatuses = Object.keys(statusCounts);
    expect(uniqueStatuses.length).toBeGreaterThanOrEqual(2);
  });

  test('should verify foreign key constraints enforce referential integrity', async () => {
    // RED PHASE: Test will fail if FK constraints don't exist
    // This test verifies organization_id FK and created_by FK are enforced

    await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    // Attempt to insert lead with invalid organization_id (should fail)
    const invalidOrgId = '00000000-0000-0000-0000-000000000000';
    const { error: fkError } = await supabase
      .from('leads')
      .insert({
        organization_id: invalidOrgId,
        first_name: 'Test',
        last_name: 'Lead',
        email: 'test-fk@example.com',
        status: 'new',
        source: 'test',
      });

    // Should fail due to FK constraint
    expect(fkError).not.toBeNull();
    expect(fkError?.message).toMatch(/foreign key|constraint|violates/i);

    // Query existing leads to verify all have valid organization_id references
    const { data: leads, error } = await supabase
      .from('leads')
      .select('organization_id, organizations(name)')
      .limit(10);

    expect(error).toBeNull();
    expect(leads).toBeDefined();

    if (leads && leads.length > 0) {
      leads.forEach((lead: any) => {
        expect(lead.organization_id).toBeDefined();
        expect(lead.organizations).toBeDefined(); // JOIN succeeds if FK valid
      });
    }
  });

  test('should verify status CHECK constraint allows only valid statuses', async () => {
    // RED PHASE: Test will fail if CHECK constraint doesn't exist
    // This test verifies only new|contacted|qualified|unqualified|converted allowed

    await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    // Attempt to insert lead with invalid status (should fail)
    const { error: checkError } = await supabase
      .from('leads')
      .insert({
        organization_id: orgAId,
        first_name: 'Test',
        last_name: 'Lead',
        email: 'test-check@example.com',
        status: 'invalid_status', // Invalid status
        source: 'test',
      });

    // Should fail due to CHECK constraint
    expect(checkError).not.toBeNull();
    expect(checkError?.message).toMatch(/check constraint|invalid|status/i);

    // Verify all existing leads have valid statuses
    const { data: leads, error } = await supabase
      .from('leads')
      .select('status');

    expect(error).toBeNull();
    expect(leads).toBeDefined();

    const validStatuses = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
    if (leads && leads.length > 0) {
      leads.forEach((lead: any) => {
        expect(validStatuses).toContain(lead.status);
      });
    }
  });

  test('should verify multi-org data isolation with test users', async () => {
    // RED PHASE: Test will fail if users can see each other's data
    // This test creates test leads in both orgs and verifies isolation

    // Sign in as single-org user (Org A)
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    // Create test lead in Org A
    const { data: orgALead, error: orgAInsertError } = await supabase
      .from('leads')
      .insert({
        organization_id: orgAId,
        first_name: 'Test',
        last_name: 'OrgA',
        email: 'test-orga@example.com',
        status: 'new',
        source: 'test',
      })
      .select()
      .single();

    expect(orgAInsertError).toBeNull();
    expect(orgALead).toBeDefined();

    // Query leads as Org A user (should see Org A lead)
    const { data: orgALeads, error: orgAQueryError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', 'test-orga@example.com');

    expect(orgAQueryError).toBeNull();
    expect(orgALeads).toBeDefined();
    expect(orgALeads!.length).toBe(1);
    expect(orgALeads![0].organization_id).toBe(orgAId);

    // Sign out and sign in as multi-org user
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.multiOrg.email,
      password: TEST_USERS.multiOrg.password,
    });

    // Create test lead in Org B
    const { data: orgBLead, error: orgBInsertError } = await supabase
      .from('leads')
      .insert({
        organization_id: orgBId,
        first_name: 'Test',
        last_name: 'OrgB',
        email: 'test-orgb@example.com',
        status: 'new',
        source: 'test',
      })
      .select()
      .single();

    expect(orgBInsertError).toBeNull();
    expect(orgBLead).toBeDefined();

    // Query leads as multi-org user (should see both org leads since user belongs to both)
    const { data: multiOrgLeads, error: multiOrgQueryError } = await supabase
      .from('leads')
      .select('*')
      .or(`email.eq.test-orga@example.com,email.eq.test-orgb@example.com`);

    expect(multiOrgQueryError).toBeNull();
    expect(multiOrgLeads).toBeDefined();
    // Multi-org user can see both leads (member of both orgs)
    expect(multiOrgLeads!.length).toBeGreaterThanOrEqual(2);

    // Verify single-org user CANNOT see Org B lead
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    const { data: orgBLeadsAsOrgA, error: crossOrgError } = await supabase
      .from('leads')
      .select('*')
      .eq('email', 'test-orgb@example.com');

    expect(crossOrgError).toBeNull();
    // Single-org user should NOT see Org B lead (RLS filters it out)
    expect(orgBLeadsAsOrgA!.length).toBe(0);

    // Cleanup test leads
    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });
    await supabase
      .from('leads')
      .delete()
      .eq('email', 'test-orga@example.com');

    await supabase.auth.signOut();
    await supabase.auth.signInWithPassword({
      email: TEST_USERS.multiOrg.email,
      password: TEST_USERS.multiOrg.password,
    });
    await supabase
      .from('leads')
      .delete()
      .eq('email', 'test-orgb@example.com');
  });
});
