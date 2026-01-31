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
};

test.describe('Phase 1.5 - Dashboard Analytics API', () => {
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

    if (error) throw error;

    authToken = data.session.access_token;
    userId = data.user.id;
  });

  test.afterAll(async () => {
    // Clean up auth session
    await supabase.auth.signOut();
  });

  // ============================================================================
  // Endpoint 1: Deals Metrics
  // ============================================================================
  test.describe('GET /api/crm/dashboard/deals-metrics', () => {
    test('returns 401 without authentication', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/deals-metrics`);
      expect(response.status()).toBe(401);
    });

    test('returns deals created and closed metrics with trends', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/deals-metrics`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // Verify structure
      expect(data).toHaveProperty('created');
      expect(data).toHaveProperty('closed');

      // Verify created metrics
      expect(data.created).toHaveProperty('count');
      expect(data.created).toHaveProperty('percentage');
      expect(data.created).toHaveProperty('trend');
      expect(typeof data.created.count).toBe('number');
      expect(typeof data.created.percentage).toBe('number');
      expect(['up', 'down', 'stable']).toContain(data.created.trend);

      // Verify closed metrics
      expect(data.closed).toHaveProperty('count');
      expect(data.closed).toHaveProperty('percentage');
      expect(data.closed).toHaveProperty('trend');
      expect(typeof data.closed.count).toBe('number');
      expect(typeof data.closed.percentage).toBe('number');
      expect(['up', 'down', 'stable']).toContain(data.closed.trend);
    });

    test('supports date range filtering', async ({ request }) => {
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const dateTo = new Date().toISOString();

      const response = await request.get(
        `${BASE_URL}/api/crm/dashboard/deals-metrics?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('created');
      expect(data).toHaveProperty('closed');
    });
  });

  // ============================================================================
  // Endpoint 2: KPIs
  // ============================================================================
  test.describe('GET /api/crm/dashboard/kpis', () => {
    test('returns 401 without authentication', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/kpis`);
      expect(response.status()).toBe(401);
    });

    test('returns 5 KPI metrics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/kpis`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const kpis = await response.json();

      // Verify it's an array of 5 KPIs
      expect(Array.isArray(kpis)).toBe(true);
      expect(kpis.length).toBe(5);

      // Verify each KPI has required structure
      kpis.forEach(kpi => {
        expect(kpi).toHaveProperty('title');
        expect(kpi).toHaveProperty('value');
        expect(kpi).toHaveProperty('subtitle');
        expect(kpi).toHaveProperty('icon');
        expect(kpi).toHaveProperty('color');
      });

      // Verify specific KPIs exist
      const titles = kpis.map(k => k.title);
      expect(titles).toContain('Active Users');
      expect(titles).toContain('New Contacts');
      expect(titles).toContain('Renewal Rate');
    });
  });

  // ============================================================================
  // Endpoint 3: Revenue
  // ============================================================================
  test.describe('GET /api/crm/dashboard/revenue', () => {
    test('returns 401 without authentication', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/revenue`);
      expect(response.status()).toBe(401);
    });

    test('returns revenue metrics with trends', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/revenue`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // Verify structure
      expect(data).toHaveProperty('thisMonth');
      expect(data).toHaveProperty('lastMonth');
      expect(data).toHaveProperty('monthOverMonth');
      expect(data).toHaveProperty('trend');

      // Verify types
      expect(typeof data.thisMonth).toBe('number');
      expect(typeof data.lastMonth).toBe('number');
      expect(typeof data.monthOverMonth).toBe('number');
      expect(['up', 'down', 'stable']).toContain(data.trend);
    });
  });

  // ============================================================================
  // Endpoint 4: Lead Sources
  // ============================================================================
  test.describe('GET /api/crm/dashboard/lead-sources', () => {
    test('returns 401 without authentication', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/lead-sources`);
      expect(response.status()).toBe(401);
    });

    test('returns contact distribution by source', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/lead-sources`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // Verify it's an array
      expect(Array.isArray(data)).toBe(true);

      // Each item should have source and count
      if (data.length > 0) {
        data.forEach(item => {
          expect(item).toHaveProperty('source');
          expect(item).toHaveProperty('count');
          expect(typeof item.count).toBe('number');
        });
      }
    });
  });

  // ============================================================================
  // Endpoint 5: Acquisition Cost
  // ============================================================================
  test.describe('GET /api/crm/dashboard/acquisition-cost', () => {
    test('returns 401 without authentication', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/acquisition-cost`);
      expect(response.status()).toBe(401);
    });

    test('returns cost per acquisition metrics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/acquisition-cost`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // Verify structure
      expect(data).toHaveProperty('costPerAcquisition');
      expect(data).toHaveProperty('totalCost');
      expect(data).toHaveProperty('totalAcquisitions');
      expect(data).toHaveProperty('trend');

      // Verify types
      expect(typeof data.costPerAcquisition).toBe('number');
      expect(typeof data.totalCost).toBe('number');
      expect(typeof data.totalAcquisitions).toBe('number');
      expect(['up', 'down', 'stable']).toContain(data.trend);
    });
  });

  // ============================================================================
  // Endpoint 6: Sales Funnel
  // ============================================================================
  test.describe('GET /api/crm/dashboard/sales-funnel', () => {
    test('returns 401 without authentication', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/sales-funnel`);
      expect(response.status()).toBe(401);
    });

    test('returns conversion rates between stages', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/sales-funnel`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // Verify it's an array of stages
      expect(Array.isArray(data)).toBe(true);

      // Each stage should have required fields
      if (data.length > 0) {
        data.forEach(stage => {
          expect(stage).toHaveProperty('stage');
          expect(stage).toHaveProperty('count');
          expect(stage).toHaveProperty('conversionRate');
          expect(typeof stage.count).toBe('number');
          expect(typeof stage.conversionRate).toBe('number');
        });
      }
    });
  });

  // ============================================================================
  // Endpoint 7: Lifetime Value
  // ============================================================================
  test.describe('GET /api/crm/dashboard/lifetime-value', () => {
    test('returns 401 without authentication', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/lifetime-value`);
      expect(response.status()).toBe(401);
    });

    test('returns customer lifetime value metrics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/lifetime-value`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // Verify structure
      expect(data).toHaveProperty('averageLTV');
      expect(data).toHaveProperty('totalCustomers');
      expect(data).toHaveProperty('totalRevenue');
      expect(data).toHaveProperty('trend');

      // Verify types
      expect(typeof data.averageLTV).toBe('number');
      expect(typeof data.totalCustomers).toBe('number');
      expect(typeof data.totalRevenue).toBe('number');
      expect(['up', 'down', 'stable']).toContain(data.trend);
    });
  });

  // ============================================================================
  // Endpoint 8: Active Users
  // ============================================================================
  test.describe('GET /api/crm/dashboard/active-users', () => {
    test('returns 401 without authentication', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/active-users`);
      expect(response.status()).toBe(401);
    });

    test('returns contact activity metrics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/crm/dashboard/active-users`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // Verify structure
      expect(data).toHaveProperty('activeToday');
      expect(data).toHaveProperty('activeThisWeek');
      expect(data).toHaveProperty('activeThisMonth');
      expect(data).toHaveProperty('trend');

      // Verify types
      expect(typeof data.activeToday).toBe('number');
      expect(typeof data.activeThisWeek).toBe('number');
      expect(typeof data.activeThisMonth).toBe('number');
      expect(['up', 'down', 'stable']).toContain(data.trend);
    });
  });
});
