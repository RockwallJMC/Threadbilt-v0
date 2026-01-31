/**
 * CRM Phase 1.3 - API Layer Tests
 *
 * Tests API endpoints for the Lead Details page:
 * - GET /api/crm/contacts/[id] - Fetch single contact with company and deals
 * - PATCH /api/crm/contacts/[id] - Update contact fields
 * - GET /api/crm/activities - Fetch activities filtered by contact
 * - POST /api/crm/activities - Create new activity for contact
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

test.describe('CRM Phase 1.3 - API Layer Tests', () => {
  let supabase;
  let authToken;
  let userId;

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
    userId = data.user.id;
  });

  test.afterAll(async () => {
    await supabase.auth.signOut();
  });

  // ============================================================================
  // Suite 1: GET /api/crm/contacts/[id] - Fetch single contact
  // ============================================================================

  test.describe('GET /api/crm/contacts/[id]', () => {
    test('returns 401 when unauthenticated', async ({ request }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request.get(`${BASE_URL}/api/crm/contacts/${fakeId}`);
      expect(response.status()).toBe(401);
    });

    test('returns 404 for non-existent contact', async ({ request }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request.get(`${BASE_URL}/api/crm/contacts/${fakeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(404);
    });
  });

  // ============================================================================
  // Suite 2: PATCH /api/crm/contacts/[id] - Update contact
  // ============================================================================

  test.describe('PATCH /api/crm/contacts/[id]', () => {
    test('returns 401 when unauthenticated', async ({ request }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request.patch(`${BASE_URL}/api/crm/contacts/${fakeId}`, {
        data: {
          title: 'Senior Manager',
        },
      });
      expect(response.status()).toBe(401);
    });

    test('returns 404 for non-existent contact', async ({ request }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      const response = await request.patch(`${BASE_URL}/api/crm/contacts/${fakeId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          title: 'Manager',
        },
      });

      expect(response.status()).toBe(404);
    });
  });

  // ============================================================================
  // Suite 3: GET /api/crm/activities - Fetch activities filtered by contact
  // ============================================================================

  test.describe('GET /api/crm/activities', () => {
    test('returns 401 when unauthenticated', async ({ request }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request.get(
        `${BASE_URL}/api/crm/activities?entity_type=contact&entity_id=${fakeId}`
      );
      expect(response.status()).toBe(401);
    });

    test('returns 400 when entity_id is missing', async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/crm/activities?entity_type=contact`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status()).toBe(400);
    });
  });

  // ============================================================================
  // Suite 4: POST /api/crm/activities - Create new activity
  // ============================================================================

  test.describe('POST /api/crm/activities', () => {
    test('returns 401 when unauthenticated', async ({ request }) => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request.post(`${BASE_URL}/api/crm/activities`, {
        data: {
          entity_id: fakeId,
          activity_type: 'call',
          subject: 'Test Call',
        },
      });
      expect(response.status()).toBe(401);
    });

    test('returns 400 when missing required fields', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/crm/activities`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          // Missing entity_id, activity_type, subject
          description: 'Missing required fields',
        },
      });

      expect(response.status()).toBe(400);

      const error = await response.json();
      expect(error).toHaveProperty('error');
    });
  });
});
