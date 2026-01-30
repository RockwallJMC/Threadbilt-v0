/**
 * CRM Phase 1.1 - API Layer Tests
 *
 * Tests API endpoints for the Deals Kanban board:
 * - GET /api/crm/deals - Fetch all deals grouped by stage
 * - PATCH /api/crm/deals/[id] - Update deal fields
 * - POST /api/crm/deals - Create new deal
 *
 * These are Layer 2 tests that verify the API layer using HTTP requests,
 * assuming Layer 1 (database) is complete and working.
 *
 * Following TDD Red-Green-Refactor:
 * - RED: Write test showing desired API behavior
 * - Verify RED: Run test, confirm it fails (endpoints don't exist yet)
 * - GREEN: Wiring agent implements endpoints
 * - Verify GREEN: Re-run test, confirm passes
 */

import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Environment variables loaded by Playwright from .env.test
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing required Supabase environment variables');
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

// Test users from .env.test
const TEST_USERS = {
  singleOrg: {
    email: process.env.PLAYWRIGHT_SINGLE_ORG_EMAIL || 'test-single-org@piercedesk.test',
    password: process.env.PLAYWRIGHT_SINGLE_ORG_PASSWORD || 'TestPassword123!',
  },
  multiOrg: {
    email: process.env.PLAYWRIGHT_MULTI_ORG_EMAIL || 'test-multi-org@piercedesk.test',
    password: process.env.PLAYWRIGHT_MULTI_ORG_PASSWORD || 'TestPassword123!',
  },
};

test.describe('CRM Phase 1.1 - API Layer Tests', () => {
  let supabase;
  let authToken;
  let userAId;

  test.beforeAll(async () => {
    // Create Supabase client for auth
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Authenticate as test user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_USERS.singleOrg.email,
      password: TEST_USERS.singleOrg.password,
    });

    if (error || !data?.session) {
      throw new Error(`Failed to authenticate test user: ${error?.message}`);
    }

    authToken = data.session.access_token;
    userAId = data.user.id;
  });

  test.afterAll(async () => {
    await supabase.auth.signOut();
  });

  // ============================================================================
  // Suite 1: GET /api/crm/deals - Fetch all deals grouped by stage
  // ============================================================================

  test.describe('GET /api/crm/deals', () => {
    test('returns 401 when unauthenticated', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/deals`);
      expect(response.status()).toBe(401);
    });

    test('returns deals grouped by stage for authenticated user', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/deals`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();

      // Verify structure: should be an object with stage keys
      expect(data).toHaveProperty('Contact');
      expect(data).toHaveProperty('MQL');
      expect(data).toHaveProperty('SQL');
      expect(data).toHaveProperty('Opportunity');
      expect(data).toHaveProperty('Won');
      expect(data).toHaveProperty('Lost');

      // Verify each stage is an array
      expect(Array.isArray(data.Contact)).toBe(true);
      expect(Array.isArray(data.MQL)).toBe(true);
      expect(Array.isArray(data.SQL)).toBe(true);
      expect(Array.isArray(data.Opportunity)).toBe(true);
      expect(Array.isArray(data.Won)).toBe(true);
      expect(Array.isArray(data.Lost)).toBe(true);
    });

    test('returns deals with company and contact joins', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/deals`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();

      // Find a deal with company (should exist from seed data)
      const allDeals = [
        ...data.Contact,
        ...data.MQL,
        ...data.SQL,
        ...data.Opportunity,
        ...data.Won,
        ...data.Lost,
      ];

      expect(allDeals.length).toBeGreaterThan(0);

      // Check first deal structure
      const deal = allDeals[0];
      expect(deal).toHaveProperty('id');
      expect(deal).toHaveProperty('name');
      expect(deal).toHaveProperty('stage');
      expect(deal).toHaveProperty('stage_order');
      expect(deal).toHaveProperty('user_id');

      // If deal has company_id, should have company object
      if (deal.company_id) {
        expect(deal).toHaveProperty('company');
        expect(deal.company).toHaveProperty('id');
        expect(deal.company).toHaveProperty('name');
      }

      // If deal has contact_id, should have contact object
      if (deal.contact_id) {
        expect(deal).toHaveProperty('contact');
        expect(deal.contact).toHaveProperty('id');
        expect(deal.contact).toHaveProperty('first_name');
        expect(deal.contact).toHaveProperty('last_name');
      }
    });

    test('returns deals sorted by stage_order within each stage', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/deals`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();

      // Check Contact stage is sorted by stage_order
      const contactDeals = data.Contact;
      if (contactDeals.length > 1) {
        for (let i = 1; i < contactDeals.length; i++) {
          expect(contactDeals[i].stage_order).toBeGreaterThanOrEqual(
            contactDeals[i - 1].stage_order
          );
        }
      }
    });

    test('returns only deals belonging to authenticated user (RLS)', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/deals`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);

      const data = await response.json();

      const allDeals = [
        ...data.Contact,
        ...data.MQL,
        ...data.SQL,
        ...data.Opportunity,
        ...data.Won,
        ...data.Lost,
      ];

      // All deals should belong to current user
      allDeals.forEach((deal) => {
        expect(deal.user_id).toBe(userAId);
      });
    });
  });

  // ============================================================================
  // Suite 2: POST /api/crm/deals - Create new deal
  // ============================================================================

  test.describe('POST /api/crm/deals', () => {
    test('returns 401 when unauthenticated', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/crm/deals`, {
        data: {
          name: 'Test Deal',
          stage: 'Contact',
        },
      });
      expect(response.status()).toBe(401);
    });

    test('creates new deal with required fields', async ({ request }) => {
      // First, get a company_id from existing companies
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();

      const response = await request.post(`${BASE_URL}/api/crm/deals`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: 'API Test Deal',
          stage: 'Contact',
          company_id: companies.id,
          amount: 50000,
          priority: 'High',
        },
      });

      expect(response.status()).toBe(201);

      const deal = await response.json();

      expect(deal).toHaveProperty('id');
      expect(deal.name).toBe('API Test Deal');
      expect(deal.stage).toBe('Contact');
      expect(deal.company_id).toBe(companies.id);
      expect(deal.amount).toBe('50000.00'); // Decimal as string
      expect(deal.priority).toBe('High');
      expect(deal.user_id).toBe(userAId);
      expect(deal.created_by).toBe(userAId);
      expect(deal).toHaveProperty('stage_order');
      expect(deal.stage_order).toBeGreaterThanOrEqual(0);

      // Cleanup: delete the test deal
      await supabase.from('deals').delete().eq('id', deal.id);
    });

    test('returns 400 when missing required fields', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/crm/deals`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          // Missing name and stage
          amount: 10000,
        },
      });

      expect(response.status()).toBe(400);

      const error = await response.json();
      expect(error).toHaveProperty('error');
    });

    test('calculates stage_order correctly (appends to end)', async ({ request }) => {
      // Get current max stage_order for Contact stage
      const { data: existingDeals } = await supabase
        .from('deals')
        .select('stage_order')
        .eq('stage', 'Contact')
        .eq('user_id', userAId)
        .order('stage_order', { ascending: false })
        .limit(1);

      const expectedOrder = existingDeals && existingDeals.length > 0
        ? existingDeals[0].stage_order + 1
        : 0;

      // Get a company_id
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();

      const response = await request.post(`${BASE_URL}/api/crm/deals`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: 'Stage Order Test Deal',
          stage: 'Contact',
          company_id: companies.id,
        },
      });

      expect(response.status()).toBe(201);

      const deal = await response.json();
      expect(deal.stage_order).toBe(expectedOrder);

      // Cleanup
      await supabase.from('deals').delete().eq('id', deal.id);
    });
  });

  // ============================================================================
  // Suite 3: PATCH /api/crm/deals/[id] - Update deal
  // ============================================================================

  test.describe('PATCH /api/crm/deals/[id]', () => {
    let testDealId;

    test.beforeEach(async () => {
      // Create a test deal for update tests
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();

      const { data: deal } = await supabase
        .from('deals')
        .insert({
          name: 'Update Test Deal',
          stage: 'Contact',
          company_id: companies.id,
          user_id: userAId,
          created_by: userAId,
          stage_order: 999,
        })
        .select()
        .single();

      testDealId = deal.id;
    });

    test.afterEach(async () => {
      // Cleanup
      if (testDealId) {
        await supabase.from('deals').delete().eq('id', testDealId);
      }
    });

    test('returns 401 when unauthenticated', async ({ request }) => {
      const response = await request.patch(`${BASE_URL}/api/crm/deals/${testDealId}`, {
        data: {
          stage: 'MQL',
        },
      });
      expect(response.status()).toBe(401);
    });

    test('updates deal stage successfully', async ({ request }) => {
      const response = await request.patch(`${BASE_URL}/api/crm/deals/${testDealId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          stage: 'MQL',
          stage_order: 0,
        },
      });

      expect(response.status()).toBe(200);

      const deal = await response.json();
      expect(deal.id).toBe(testDealId);
      expect(deal.stage).toBe('MQL');
      expect(deal.stage_order).toBe(0);
    });

    test('updates deal amount and priority', async ({ request }) => {
      const response = await request.patch(`${BASE_URL}/api/crm/deals/${testDealId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          amount: 75000,
          priority: 'Urgent',
          progress: 50,
        },
      });

      expect(response.status()).toBe(200);

      const deal = await response.json();
      expect(deal.amount).toBe('75000.00');
      expect(deal.priority).toBe('Urgent');
      expect(deal.progress).toBe(50);
    });

    test('updates last_update timestamp automatically', async ({ request }) => {
      // Get initial timestamp
      const { data: initialDeal } = await supabase
        .from('deals')
        .select('last_update')
        .eq('id', testDealId)
        .single();

      const initialTimestamp = new Date(initialDeal.last_update);

      // Wait a moment to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update deal
      const response = await request.patch(`${BASE_URL}/api/crm/deals/${testDealId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          progress: 25,
        },
      });

      expect(response.status()).toBe(200);

      const deal = await response.json();
      const updatedTimestamp = new Date(deal.last_update);

      expect(updatedTimestamp.getTime()).toBeGreaterThan(initialTimestamp.getTime());
    });

    test('returns 404 when deal does not exist', async ({ request }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request.patch(`${BASE_URL}/api/crm/deals/${fakeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          stage: 'MQL',
        },
      });

      expect(response.status()).toBe(404);
    });

    test('prevents updating deals owned by other users (RLS)', async ({ request }) => {
      // Sign in as different user
      const { data: userB } = await supabase.auth.signInWithPassword({
        email: TEST_USERS.multiOrg.email,
        password: TEST_USERS.multiOrg.password,
      });

      const userBToken = userB.session.access_token;

      // Try to update deal owned by userA
      const response = await request.patch(`${BASE_URL}/api/crm/deals/${testDealId}`, {
        headers: {
          Authorization: `Bearer ${userBToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          stage: 'Won',
        },
      });

      // Should fail because RLS prevents access
      expect([403, 404]).toContain(response.status());

      // Cleanup: sign back in as userA
      await supabase.auth.signOut();
      await supabase.auth.signInWithPassword({
        email: TEST_USERS.singleOrg.email,
        password: TEST_USERS.singleOrg.password,
      });
    });
  });

  // ============================================================================
  // Suite 4: Integration - Drag and Drop Workflow
  // ============================================================================

  test.describe('Integration - Drag and Drop Workflow', () => {
    let testDealId;

    test.beforeEach(async () => {
      // Create a test deal
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .single();

      const { data: deal } = await supabase
        .from('deals')
        .insert({
          name: 'Drag Test Deal',
          stage: 'Contact',
          company_id: companies.id,
          user_id: userAId,
          created_by: userAId,
          stage_order: 0,
        })
        .select()
        .single();

      testDealId = deal.id;
    });

    test.afterEach(async () => {
      if (testDealId) {
        await supabase.from('deals').delete().eq('id', testDealId);
      }
    });

    test('simulates drag from Contact to MQL stage', async ({ request }) => {
      // 1. Fetch initial state
      const getResponse1 = await request.get(`${BASE_URL}/api/crm/deals`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data1 = await getResponse1.json();

      const initialContactDeals = data1.Contact;
      expect(initialContactDeals.some((d) => d.id === testDealId)).toBe(true);

      // 2. Update deal stage to MQL
      const patchResponse = await request.patch(`${BASE_URL}/api/crm/deals/${testDealId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          stage: 'MQL',
          stage_order: 0,
        },
      });
      expect(patchResponse.status()).toBe(200);

      // 3. Fetch updated state
      const getResponse2 = await request.get(`${BASE_URL}/api/crm/deals`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data2 = await getResponse2.json();

      // Verify deal moved from Contact to MQL
      expect(data2.Contact.some((d) => d.id === testDealId)).toBe(false);
      expect(data2.MQL.some((d) => d.id === testDealId)).toBe(true);

      const movedDeal = data2.MQL.find((d) => d.id === testDealId);
      expect(movedDeal.stage).toBe('MQL');
      expect(movedDeal.stage_order).toBe(0);
    });
  });
});
