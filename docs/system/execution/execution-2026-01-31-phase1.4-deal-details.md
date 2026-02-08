# Phase 1.4: Deal Details Database Wiring Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert the CRM Deal Details page from mock data to live Supabase database integration with comprehensive deal information, analytics, and activity tracking.

**Architecture:** This phase implements the most complex CRM page, integrating all 5 database tables (deals, contacts, companies, activities, deal_collaborators) through a single comprehensive endpoint with nested joins. Uses polymorphic activities pattern established in Phase 1.3 and adds deal-specific analytics aggregations.

**Tech Stack:** Next.js 15 App Router, Supabase (cloud-hosted via MCP), SWR, Material-UI 7, @dnd-kit

---

## Phase Context

**Status:** Planned (Phase 1.4 of 5-phase CRM Database Wiring project)

**Dependencies:**
- Phase 1.1 MUST be complete (deals, contacts, companies tables)
- Phase 1.2 SHOULD be complete (contact creation flow)
- Phase 1.3 MUST be complete (activities table and patterns)

**Current Mock Data File:** `src/data/crm/deal-details.jsx` (1,064 lines)

**Page Complexity:**
- 7 major sections (header, sidebar drawer, pipeline, assigned-to, contact, account, activity monitoring)
- 20+ sub-components
- 6 activity types (all, email, meeting, call, tasks, notes)
- Real-time analytics charts
- Complex nested data relationships

**Database Tables Used:**
1. `deals` - Core deal information
2. `crm_contacts` - Associated contact
3. `companies` - Account/company information
4. `activities` - Activity timeline (polymorphic entity_type='opportunity')
5. `deal_collaborators` - Assigned users (owner, collaborators, followers)

---

## Architecture Overview

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   UI Layer (Existing)                       │
│  /apps/crm/deal-details/page.jsx                           │
│    └─ DealDetails.jsx (MODIFY)                            │
│       ├─ DealDetailsHeader (deal name, status)            │
│       ├─ DealInformation (sidebar - deal metadata)        │
│       ├─ ActivitySummary (sidebar - activity counts)      │
│       ├─ Analytics (sidebar - charts)                     │
│       ├─ SalesPipeline (pipeline stages)                  │
│       ├─ AssignedTo (owner, collaborators, followers)     │
│       ├─ AssociatedContact (contact details)              │
│       ├─ Account (company with related deals)             │
│       └─ ActivityMonitoring (tabbed activity view)        │
│          └─ useCRMDealApi(dealId) [NEW]                   │
│          └─ useCRMActivitiesApi(dealId) [REUSE]           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (New)                           │
│  /api/crm/deals/[id]/route.js                              │
│    └─ GET: Fetch deal with ALL nested joins:               │
│       - contact (with company)                              │
│       - company (with all deals)                            │
│       - deal_collaborators (owner, collaborators, followers)│
│       - activities (summary counts)                         │
│    └─ PATCH: Update deal fields                            │
│  /api/crm/deals/[id]/analytics/route.js                    │
│    └─ GET: Fetch deal-specific analytics aggregations      │
│  /api/crm/activities/route.js (EXISTS from Phase 1.3)      │
│    └─ GET: Filter by entity_type='opportunity', entity_id  │
│    └─ POST: Create activity for deal                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Client (Next.js Server)               │
│  @supabase/ssr (Server-Side Auth)                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Database                          │
│  ┌──────────┐  ┌─────────────┐  ┌───────┐  ┌──────────┐   │
│  │companies │  │crm_contacts │  │ deals │  │activities│   │
│  └──────────┘  └─────────────┘  └───────┘  └──────────┘   │
│                                     │                        │
│                            ┌────────┴────────┐              │
│                            │ deal_collabor..│              │
│                            └─────────────────┘              │
│  RLS Policies: organization_id scoped                       │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

**1. Single Comprehensive Endpoint vs Multiple Endpoints**
- **Decision:** Single `/api/crm/deals/[id]` endpoint with all nested joins
- **Rationale:** Reduces network round-trips, simpler component logic, acceptable payload size
- **Trade-off:** Larger initial payload vs waterfall loading

**2. Analytics Separation**
- **Decision:** Separate `/api/crm/deals/[id]/analytics` endpoint
- **Rationale:** Analytics require expensive aggregations, shouldn't block main data load
- **Implementation:** Load analytics asynchronously after main data

**3. Activities Reuse**
- **Decision:** Reuse existing `/api/crm/activities` endpoint from Phase 1.3
- **Rationale:** Same polymorphic pattern, just filter by entity_type='opportunity'
- **Mapping:** Deal ID → entity_id where entity_type='opportunity'

**4. Deal Collaborators Structure**
- **Decision:** Use existing `deal_collaborators` table (assumes Phase 1.1 created it)
- **Schema:**
  ```sql
  deal_collaborators (
    id uuid,
    deal_id uuid,
    user_id uuid,
    role varchar, -- 'owner' | 'collaborator' | 'follower'
    organization_id uuid,
    created_at timestamptz
  )
  ```

---

## Implementation Tasks

### Task 1: Database Layer - Verify Schema & Create Indexes

**Goal:** Verify all required tables exist and add performance indexes for deal queries.

**Files:**
- Verify: Existing tables via Supabase MCP
- Create: Database migration via Supabase MCP

**Step 1: Verify deal_collaborators table exists**

Use Supabase MCP to query schema:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'deal_collaborators'
AND table_schema = 'public';
```

Expected columns:
- id (uuid)
- deal_id (uuid, FK to deals.id)
- user_id (uuid, FK to auth.users.id)
- role (varchar)
- organization_id (uuid)
- created_at (timestamptz)

**If table missing:** Create via migration (see Appendix A)

**Step 2: Create performance indexes**

Apply migration to add indexes:
```sql
-- Migration: add_deal_details_indexes
CREATE INDEX IF NOT EXISTS idx_deal_collaborators_deal_id
  ON deal_collaborators(deal_id);

CREATE INDEX IF NOT EXISTS idx_deal_collaborators_organization_id
  ON deal_collaborators(organization_id);

CREATE INDEX IF NOT EXISTS idx_activities_entity_deal
  ON activities(entity_type, entity_id)
  WHERE entity_type = 'opportunity';

CREATE INDEX IF NOT EXISTS idx_deals_organization_id
  ON deals(organization_id);
```

**Step 3: Verify indexes created**

Query indexes:
```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('deals', 'deal_collaborators', 'activities');
```

Expected: All 4 new indexes present

**Step 4: Verify RLS policies on deal_collaborators**

Query RLS policies:
```sql
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'deal_collaborators';
```

Expected: At least one SELECT policy filtering by organization_id

**If missing:** Create RLS policy:
```sql
CREATE POLICY "Users can view deal_collaborators in their org"
  ON deal_collaborators
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );
```

**Step 5: Commit database changes**

Document in execution notes:
```
✅ deal_collaborators table verified
✅ Performance indexes created
✅ RLS policies verified
```

---

### Task 2: API Layer - Deal Details Endpoint

**Goal:** Create comprehensive deal details endpoint with all nested joins.

**Files:**
- Create: `src/app/api/crm/deals/[id]/route.js`

**Step 1: Write test for deal details endpoint**

Create: `tests/crm/phase1.4-api-layer.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Phase 1.4 - Deal Details API', () => {
  test('GET /api/crm/deals/[id] returns deal with nested data', async ({ request }) => {
    // Assumes seed data exists with known deal ID
    const dealId = 'test-deal-id'; // Replace with actual seed ID

    const response = await request.get(`/api/crm/deals/${dealId}`);
    expect(response.status()).toBe(200);

    const deal = await response.json();

    // Verify deal fields
    expect(deal.id).toBe(dealId);
    expect(deal.name).toBeTruthy();
    expect(deal.stage).toBeTruthy();
    expect(deal.value).toBeGreaterThanOrEqual(0);

    // Verify nested contact
    expect(deal.contact).toBeTruthy();
    expect(deal.contact.id).toBeTruthy();
    expect(deal.contact.first_name).toBeTruthy();

    // Verify nested company (via contact)
    expect(deal.contact.company).toBeTruthy();
    expect(deal.contact.company.name).toBeTruthy();

    // Verify company with all deals
    expect(deal.company).toBeTruthy();
    expect(deal.company.deals).toBeInstanceOf(Array);

    // Verify collaborators
    expect(deal.collaborators).toBeTruthy();
    expect(deal.collaborators.owner).toBeTruthy();
    expect(deal.collaborators.collaborators).toBeInstanceOf(Array);
    expect(deal.collaborators.followers).toBeInstanceOf(Array);

    // Verify activity summary
    expect(deal.activity_summary).toBeTruthy();
    expect(deal.activity_summary.total).toBeGreaterThanOrEqual(0);
    expect(deal.activity_summary.by_type).toBeTruthy();
  });

  test('GET /api/crm/deals/[id] returns 404 for non-existent deal', async ({ request }) => {
    const response = await request.get('/api/crm/deals/00000000-0000-0000-0000-000000000000');
    expect(response.status()).toBe(404);
  });

  test('GET /api/crm/deals/[id] returns 401 for unauthenticated request', async ({ request }) => {
    // Clear auth
    await request.storageState({ cookies: [], origins: [] });

    const response = await request.get('/api/crm/deals/test-deal-id');
    expect(response.status()).toBe(401);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx playwright test tests/crm/phase1.4-api-layer.spec.js --grep "GET /api/crm/deals" -g "returns deal with nested data"
```

Expected: FAIL - "404 Not Found" (route doesn't exist yet)

**Step 3: Create API route with minimal implementation**

Create: `src/app/api/crm/deals/[id]/route.js`

```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    // Fetch deal with contact and company joins
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select(`
        *,
        contact:crm_contacts!deals_contact_id_fkey (
          *,
          company:companies!crm_contacts_company_id_fkey (
            *
          )
        )
      `)
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Fetch company with ALL deals (not just this one)
    const { data: companyDeals } = await supabase
      .from('deals')
      .select('*')
      .eq('company_id', deal.contact.company.id)
      .eq('organization_id', userOrg.organization_id)
      .order('created_at', { ascending: false });

    // Fetch deal collaborators grouped by role
    const { data: collaborators } = await supabase
      .from('deal_collaborators')
      .select(`
        role,
        user:auth.users!deal_collaborators_user_id_fkey (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .eq('deal_id', id)
      .eq('organization_id', userOrg.organization_id);

    // Group collaborators by role
    const collaboratorsByRole = {
      owner: collaborators?.find(c => c.role === 'owner')?.user || null,
      collaborators: collaborators?.filter(c => c.role === 'collaborator').map(c => c.user) || [],
      followers: collaborators?.filter(c => c.role === 'follower').map(c => c.user) || [],
    };

    // Fetch activity summary (counts by type)
    const { data: activities } = await supabase
      .from('activities')
      .select('activity_type')
      .eq('entity_type', 'opportunity')
      .eq('entity_id', id)
      .eq('organization_id', userOrg.organization_id);

    const activitySummary = {
      total: activities?.length || 0,
      by_type: activities?.reduce((acc, activity) => {
        acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
        return acc;
      }, {}) || {},
    };

    // Construct response
    const response = {
      ...deal,
      company: {
        ...deal.contact.company,
        deals: companyDeals || [],
      },
      collaborators: collaboratorsByRole,
      activity_summary: activitySummary,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching deal details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const updates = await request.json();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    // Update deal
    const { data: deal, error: updateError } = await supabase
      .from('deals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .select()
      .single();

    if (updateError || !deal) {
      return NextResponse.json({ error: 'Failed to update deal' }, { status: 400 });
    }

    return NextResponse.json(deal);

  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npx playwright test tests/crm/phase1.4-api-layer.spec.js --grep "GET /api/crm/deals" -g "returns deal with nested data"
```

Expected: PASS

**Step 5: Test PATCH endpoint**

Add test:
```javascript
test('PATCH /api/crm/deals/[id] updates deal fields', async ({ request }) => {
  const dealId = 'test-deal-id';

  const response = await request.patch(`/api/crm/deals/${dealId}`, {
    data: {
      stage: 'closed_won',
      value: 150000,
    },
  });

  expect(response.status()).toBe(200);
  const updated = await response.json();
  expect(updated.stage).toBe('closed_won');
  expect(updated.value).toBe(150000);
});
```

Run test, verify passes.

**Step 6: Commit API route**

```bash
git add src/app/api/crm/deals/[id]/route.js tests/crm/phase1.4-api-layer.spec.js
git commit -m "feat(api): add deal details endpoint with nested joins

- GET /api/crm/deals/[id] with contact, company, collaborators, activity summary
- PATCH /api/crm/deals/[id] for deal updates
- Tests for auth, 404, nested data structure
- Organization-scoped RLS enforcement

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 3: API Layer - Deal Analytics Endpoint

**Goal:** Create separate analytics endpoint for expensive aggregations.

**Files:**
- Create: `src/app/api/crm/deals/[id]/analytics/route.js`

**Step 1: Write test for analytics endpoint**

Add to `tests/crm/phase1.4-api-layer.spec.js`:

```javascript
test('GET /api/crm/deals/[id]/analytics returns aggregations', async ({ request }) => {
  const dealId = 'test-deal-id';

  const response = await request.get(`/api/crm/deals/${dealId}/analytics`);
  expect(response.status()).toBe(200);

  const analytics = await response.json();

  // Verify structure
  expect(analytics.deal_progress).toBeGreaterThanOrEqual(0);
  expect(analytics.deal_progress).toBeLessThanOrEqual(100);
  expect(analytics.win_loss_ratio).toBeDefined();
  expect(analytics.conversion_rate).toBeDefined();
  expect(analytics.engagement_metrics).toBeDefined();
});
```

**Step 2: Run test to verify it fails**

```bash
npx playwright test tests/crm/phase1.4-api-layer.spec.js --grep "analytics"
```

Expected: FAIL - 404

**Step 3: Implement analytics endpoint**

Create: `src/app/api/crm/deals/[id]/analytics/route.js`

```javascript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!userOrg) {
      return NextResponse.json({ error: 'No organization found' }, { status: 403 });
    }

    // Fetch deal for context
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('stage, value, created_at, close_date')
      .eq('id', id)
      .eq('organization_id', userOrg.organization_id)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Calculate deal progress (based on stage)
    const stageOrder = {
      'lead': 0,
      'qualified': 20,
      'proposal': 40,
      'negotiation': 60,
      'closed_won': 100,
      'closed_lost': 0,
    };
    const dealProgress = stageOrder[deal.stage] || 0;

    // Calculate win/loss ratio for this organization (context metric)
    const { data: orgDeals } = await supabase
      .from('deals')
      .select('stage')
      .eq('organization_id', userOrg.organization_id)
      .in('stage', ['closed_won', 'closed_lost']);

    const wonCount = orgDeals?.filter(d => d.stage === 'closed_won').length || 0;
    const lostCount = orgDeals?.filter(d => d.stage === 'closed_lost').length || 0;
    const winLossRatio = lostCount > 0 ? ((wonCount / lostCount) * 100).toFixed(1) : 100;

    // Calculate conversion rate (activities to deal value)
    const { data: activities } = await supabase
      .from('activities')
      .select('id')
      .eq('entity_type', 'opportunity')
      .eq('entity_id', id)
      .eq('organization_id', userOrg.organization_id);

    const activityCount = activities?.length || 1;
    const conversionRate = deal.value > 0 ? ((deal.value / activityCount) / 1000).toFixed(1) : 0;

    // Calculate engagement metrics (activities per week since creation)
    const createdDate = new Date(deal.created_at);
    const now = new Date();
    const weeksSinceCreation = Math.max(1, Math.floor((now - createdDate) / (7 * 24 * 60 * 60 * 1000)));
    const engagementMetrics = ((activityCount / weeksSinceCreation) * 10).toFixed(1);

    const analytics = {
      deal_progress: dealProgress,
      win_loss_ratio: parseFloat(winLossRatio),
      conversion_rate: parseFloat(conversionRate),
      engagement_metrics: parseFloat(engagementMetrics),
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching deal analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Step 4: Run test to verify it passes**

```bash
npx playwright test tests/crm/phase1.4-api-layer.spec.js --grep "analytics"
```

Expected: PASS

**Step 5: Commit analytics endpoint**

```bash
git add src/app/api/crm/deals/[id]/analytics/route.js tests/crm/phase1.4-api-layer.spec.js
git commit -m "feat(api): add deal analytics endpoint

- GET /api/crm/deals/[id]/analytics for aggregations
- Metrics: progress, win/loss ratio, conversion, engagement
- Separate endpoint to avoid blocking main data load

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 4: SWR Hooks - Deal Data Fetching

**Goal:** Create SWR hook for deal details with caching and mutations.

**Files:**
- Create: `src/services/swr/api-hooks/useCRMDealApi.js`

**Step 1: Write test for SWR hook**

Create: `tests/crm/phase1.4-hooks.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Phase 1.4 - Deal Details Hooks', () => {
  test('useCRMDealApi hook fetches and caches deal data', async ({ page }) => {
    await page.goto('/apps/crm/deal-details?id=test-deal-id');

    // Wait for data to load
    await page.waitForSelector('[data-testid="deal-name"]');

    // Verify deal data rendered
    const dealName = await page.textContent('[data-testid="deal-name"]');
    expect(dealName).toBeTruthy();

    // Verify nested contact rendered
    await expect(page.locator('[data-testid="associated-contact"]')).toBeVisible();

    // Verify company rendered
    await expect(page.locator('[data-testid="account-name"]')).toBeVisible();

    // Verify collaborators rendered
    await expect(page.locator('[data-testid="deal-owner"]')).toBeVisible();
  });

  test('useCRMDealApi handles loading state', async ({ page }) => {
    await page.goto('/apps/crm/deal-details?id=test-deal-id');

    // Should show loading initially
    await expect(page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
  });

  test('useCRMDealApi handles error state', async ({ page }) => {
    await page.goto('/apps/crm/deal-details?id=invalid-id');

    // Should show error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx playwright test tests/crm/phase1.4-hooks.spec.js
```

Expected: FAIL - hook doesn't exist

**Step 3: Create SWR hook**

Create: `src/services/swr/api-hooks/useCRMDealApi.js`

```javascript
import useSWR from 'swr';
import axios from 'axios';

/**
 * SWR hook for fetching deal details with nested data
 * @param {string} dealId - UUID of the deal
 * @returns {Object} { deal, analytics, isLoading, error, mutate, updateDeal }
 */
export function useCRMDealApi(dealId) {
  // Fetch main deal data
  const { data: deal, error: dealError, mutate: mutateDeal } = useSWR(
    dealId ? `/api/crm/deals/${dealId}` : null,
    async (url) => {
      const response = await axios.get(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  // Fetch analytics separately (async, doesn't block main data)
  const { data: analytics, error: analyticsError } = useSWR(
    dealId ? `/api/crm/deals/${dealId}/analytics` : null,
    async (url) => {
      const response = await axios.get(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
    }
  );

  /**
   * Update deal fields
   * @param {Object} updates - Fields to update
   */
  const updateDeal = async (updates) => {
    try {
      const response = await axios.patch(`/api/crm/deals/${dealId}`, updates);

      // Optimistically update cache
      await mutateDeal(
        (currentDeal) => ({ ...currentDeal, ...response.data }),
        { revalidate: false }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to update deal:', error);
      throw error;
    }
  };

  return {
    deal,
    analytics,
    isLoading: !deal && !dealError,
    error: dealError || analyticsError,
    mutate: mutateDeal,
    updateDeal,
  };
}
```

**Step 4: Add TypeScript types**

Create: `src/types/crm.ts` (or update existing)

```typescript
export interface Deal {
  id: string;
  name: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  close_date: string;
  contact_id: string;
  company_id: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string;

  // Nested relations
  contact: ContactWithCompany;
  company: CompanyWithDeals;
  collaborators: DealCollaborators;
  activity_summary: ActivitySummary;
}

export interface DealCollaborators {
  owner: User | null;
  collaborators: User[];
  followers: User[];
}

export interface ActivitySummary {
  total: number;
  by_type: Record<string, number>;
}

export interface DealAnalytics {
  deal_progress: number;
  win_loss_ratio: number;
  conversion_rate: number;
  engagement_metrics: number;
}

export interface CompanyWithDeals extends Company {
  deals: Deal[];
}
```

**Step 5: Run hook tests**

```bash
npx playwright test tests/crm/phase1.4-hooks.spec.js
```

Expected: Tests will fail until UI integration (next task)

**Step 6: Commit SWR hook**

```bash
git add src/services/swr/api-hooks/useCRMDealApi.js src/types/crm.ts tests/crm/phase1.4-hooks.spec.js
git commit -m "feat(hooks): add useCRMDealApi SWR hook

- Fetches deal with nested contact, company, collaborators
- Separate analytics fetch (async, non-blocking)
- Optimistic updates for PATCH operations
- TypeScript types for deal data structures

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 5: UI Integration - Wire Deal Details Page

**Goal:** Replace mock data with live API integration in DealDetails component.

**Files:**
- Modify: `src/components/sections/crm/deal-details/index.jsx`
- Modify: `src/app/(main)/apps/crm/deal-details/page.jsx`

**Step 1: Update page.jsx to pass dealId from URL params**

Modify: `src/app/(main)/apps/crm/deal-details/page.jsx`

```javascript
import DealDetails from 'components/sections/crm/deal-details';

const Page = async ({ searchParams }) => {
  const params = await searchParams;
  const dealId = params.id;

  if (!dealId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Deal ID Required</h2>
        <p>Please provide a deal ID in the URL: ?id=[deal-id]</p>
      </div>
    );
  }

  return <DealDetails dealId={dealId} />;
};

export default Page;
```

**Step 2: Update DealDetails component to use live data**

Modify: `src/components/sections/crm/deal-details/index.jsx`

BEFORE (mock data imports):
```javascript
import {
  accountData,
  activitySummary,
  analyticsData,
  assignedToData,
  associatedContactData,
  dealInformation,
  salesPipelineData,
} from 'data/crm/deal-details';
```

AFTER (SWR hook):
```javascript
import { useCRMDealApi } from 'services/swr/api-hooks/useCRMDealApi';
import { useCRMActivitiesApi } from 'services/swr/api-hooks/useCRMActivitiesApi';
import { Skeleton, Alert } from '@mui/material';
```

Update component:
```javascript
const DealDetails = ({ dealId }) => {
  const { topbarHeight } = useNavContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch deal data
  const { deal, analytics, isLoading, error } = useCRMDealApi(dealId);

  // Fetch activities for deal (entity_type='opportunity')
  const { activities } = useCRMActivitiesApi({
    entityType: 'opportunity',
    entityId: dealId,
  });

  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerClose(false);

  // Loading state
  if (isLoading) {
    return (
      <Stack direction="column" gap={2} p={3}>
        <Skeleton variant="rectangular" height={100} />
        <Skeleton variant="rectangular" height={400} />
      </Stack>
    );
  }

  // Error state
  if (error || !deal) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error?.message || 'Failed to load deal details'}
      </Alert>
    );
  }

  // Transform data for existing components
  const dealInformation = [
    { id: 1, attribute: 'Last updated', value: deal.updated_at, background: true },
    { id: 2, attribute: 'Deal Details', value: deal.description || '', background: false },
    { id: 3, attribute: 'Create Date', value: deal.created_at, background: true },
    { id: 4, attribute: 'Created By', value: deal.created_by, background: false },
    { id: 5, attribute: 'Current Stage', value: deal.stage, background: true },
    { id: 6, attribute: 'Closing Date', value: deal.close_date, background: false },
    { id: 7, attribute: 'Associated Contact', value: deal.contact?.first_name, background: true },
    { id: 8, attribute: 'Priority', value: deal.priority || 'not set', background: false },
    { id: 9, attribute: 'Deal Owner', value: deal.collaborators?.owner, background: true },
    { id: 10, attribute: 'Collaborating Agents', value: deal.collaborators?.collaborators, background: false },
    { id: 11, attribute: 'Budget Forecast', value: deal.value, background: true },
    { id: 12, attribute: 'Deal Probability', value: deal.probability, background: false },
  ];

  const activitySummary = {
    summary: [
      { id: 'call', attribute: 'Calls', value: deal.activity_summary?.by_type?.call || 0 },
      { id: 'email', attribute: 'Emails', value: deal.activity_summary?.by_type?.email || 0 },
      { id: 'meeting', attribute: 'Meeting', value: deal.activity_summary?.by_type?.meeting || 0 },
    ],
    timeline: activities?.slice(0, 4).map(a => ({
      id: a.id,
      title: a.subject,
      description: a.description,
      date: a.activity_date,
    })) || [],
  };

  const analyticsData = analytics ? [
    { value: analytics.deal_progress, name: 'Deal Progress' },
    { value: analytics.win_loss_ratio, name: 'Win/Loss Ratio' },
    { value: analytics.conversion_rate, name: 'Conversion Rate' },
    { value: analytics.engagement_metrics, name: 'Engagement Metrics' },
  ] : [];

  const assignedToData = [
    {
      type: 'Deal Owner',
      people: deal.collaborators?.owner ? [deal.collaborators.owner] : [],
    },
    {
      type: 'Collaborator',
      people: deal.collaborators?.collaborators || [],
    },
    {
      type: 'Follower',
      people: deal.collaborators?.followers || [],
    },
  ];

  const accountData = {
    name: deal.company?.name || '',
    dateCreated: deal.company?.created_at || '',
    logo: deal.company?.logo_url || '',
    tags: deal.company?.tags || [],
    ongoingDeals: deal.company?.deals?.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost') || [],
    pastDeals: deal.company?.deals?.filter(d => d.stage === 'closed_won' || d.stage === 'closed_lost') || [],
  };

  const associatedContactData = deal.contact ? [{
    id: deal.contact.id,
    name: `${deal.contact.first_name} ${deal.contact.last_name}`,
    avatar: deal.contact.avatar_url,
    designation: deal.contact.title,
    company: deal.contact.company?.name,
    contactInfo: {
      phone: deal.contact.phone,
      email: deal.contact.email,
      contactOwner: deal.collaborators?.owner ? [deal.collaborators.owner] : [],
    },
  }] : [];

  // Sales pipeline - map stage to progress
  const stageMapping = {
    'lead': 1,
    'qualified': 2,
    'proposal': 3,
    'negotiation': 4,
    'closed_won': 5,
    'closed_lost': 5,
  };
  const currentStage = stageMapping[deal.stage] || 1;

  const salesPipelineData = [
    { id: 1, name: 'Contact', status: currentStage >= 1 ? 'done' : 'pending' },
    { id: 2, name: 'MQL', status: currentStage >= 2 ? 'done' : 'pending' },
    { id: 3, name: 'SQL', status: currentStage >= 3 ? 'done' : 'pending' },
    { id: 4, name: 'Chance', status: currentStage >= 4 ? 'done' : 'pending' },
    { id: 5, name: 'W/L', status: currentStage >= 5 ? 'ongoing' : 'pending' },
  ];

  // Rest of component unchanged...
  const drawerContent = (
    <Stack direction="column" sx={{ height: 1 }}>
      <DealInformation dealInformation={dealInformation} />
      <ActivitySummary activitySummary={activitySummary} />
      <Analytics analyticsData={analyticsData} />
    </Stack>
  );

  return (
    <Stack direction="column">
      <DealDetailsHeader title={deal.name} />

      {/* Drawer and content - unchanged structure */}
      <Grid container>
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            [`& .${drawerClasses.paper}`]: { maxWidth: 400, width: 1 },
            display: { xs: 'block', lg: 'none' },
          }}
        >
          <SimpleBar>
            <Stack gap={1} sx={{ py: 3, px: { xs: 3, md: 5 }, alignItems: 'center', justifyContent: 'space-between', bgcolor: 'background.elevation1' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>More information</Typography>
              <IconButton color="default" size="small" onClick={handleDrawerClose}>
                <IconifyIcon icon="material-symbols:close-small-rounded" sx={{ fontSize: 20, color: 'neutral.dark' }} />
              </IconButton>
            </Stack>
            {drawerContent}
          </SimpleBar>
        </Drawer>

        <Paper sx={{ display: { xs: 'none', lg: 'block' }, maxWidth: 400, width: 1, height: ({ mixins }) => mixins.contentHeight(topbarHeight), overflow: 'hidden', position: 'sticky', top: topbarHeight }}>
          <SimpleBar>{drawerContent}</SimpleBar>
        </Paper>

        <Grid container size="grow" direction="column" alignContent="flex-start">
          <Grid size={12}>
            <SalesPipeline salesPipelineData={salesPipelineData} />
          </Grid>

          <Grid container size={12}>
            <Grid container direction="column" size={{ xs: 12, md: 6, lg: 12, xl: 6 }}>
              <Grid size={12}>
                <AssignedTo assignedToData={assignedToData} />
              </Grid>
              <Grid size={12} flexGrow={1}>
                <AssociatedContact associatedContactData={associatedContactData} />
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 12, xl: 6 }}>
              <Account accountData={accountData} />
            </Grid>
          </Grid>

          <Grid size={12} flexGrow={1}>
            <ActivityMonitoring dealId={dealId} />
          </Grid>
        </Grid>
      </Grid>

      <FloatingBar contactInfo={assignedToData[0]?.people[0]} handleDrawerOpen={handleDrawerOpen} />
    </Stack>
  );
};

export default DealDetails;
```

**Step 3: Update ActivityMonitoring to use live data**

Modify: `src/components/sections/crm/deal-details/activity-monitoring/index.jsx`

Add prop: `dealId`

Replace mock data with:
```javascript
const ActivityMonitoring = ({ dealId }) => {
  const [activeTab, setActiveTab] = useState('all');

  const { activities, isLoading } = useCRMActivitiesApi({
    entityType: 'opportunity',
    entityId: dealId,
    activityType: activeTab === 'all' ? undefined : activeTab,
  });

  // Rest of component logic...
};
```

**Step 4: Add data-testid attributes for testing**

Add to DealDetails component:
```javascript
<Typography variant="h4" data-testid="deal-name">{deal.name}</Typography>
<div data-testid="associated-contact">...</div>
<div data-testid="account-name">...</div>
<div data-testid="deal-owner">...</div>
```

**Step 5: Run UI integration tests**

```bash
npx playwright test tests/crm/phase1.4-hooks.spec.js
```

Expected: PASS (all 3 tests)

**Step 6: Verify no mock data references**

```bash
grep -r "from 'data/crm/deal-details'" src/components/sections/crm/deal-details/
grep -r "from 'data/crm/deal-details'" src/app/(main)/apps/crm/deal-details/
```

Expected: No results (all mock imports removed)

**Step 7: Commit UI integration**

```bash
git add src/components/sections/crm/deal-details/ src/app/(main)/apps/crm/deal-details/page.jsx tests/crm/phase1.4-hooks.spec.js
git commit -m "feat(ui): wire deal details page to live database

- Replace mock data with useCRMDealApi hook
- Add URL param handling for dealId
- Transform API data for existing component props
- Wire ActivityMonitoring to live activities
- Add loading and error states
- Remove all references to data/crm/deal-details.jsx

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 6: Seed Data - Deal Details Test Data

**Goal:** Create comprehensive seed data for testing deal details page.

**Files:**
- Create: `database/seeds/crm-deal-details-seed.sql`

**Step 1: Create seed SQL script**

Create: `database/seeds/crm-deal-details-seed.sql`

```sql
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
  SELECT 1 FROM user_organizations uo
  WHERE uo.user_id = u.id
  AND uo.organization_id = d.organization_id
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
  SELECT 1 FROM user_organizations uo
  WHERE uo.user_id = u.id
  AND uo.organization_id = d.organization_id
)
LIMIT 300; -- ~6-10 activities per deal

-- Create one "test deal" with known ID for E2E testing
INSERT INTO deals (
  id,
  name,
  stage,
  value,
  probability,
  close_date,
  contact_id,
  company_id,
  organization_id,
  created_at,
  created_by
)
SELECT
  '00000000-0000-0000-0000-000000000001', -- Known test ID
  'Test Deal - Replica Badidas Futbol',
  'proposal',
  105000,
  35,
  NOW() + interval '90 days',
  c.id,
  c.company_id,
  c.organization_id,
  NOW() - interval '30 days',
  u.id
FROM crm_contacts c
CROSS JOIN auth.users u
WHERE c.first_name = 'Test' -- Assumes test contact exists from Phase 1.2
LIMIT 1
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  stage = EXCLUDED.stage,
  value = EXCLUDED.value;

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
  uo.organization_id,
  NOW()
FROM auth.users u
JOIN user_organizations uo ON u.id = uo.user_id
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
  uo.organization_id,
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
JOIN user_organizations uo ON u.id = uo.user_id
LIMIT 5;
```

**Step 2: Apply seed script via Supabase MCP**

Use Supabase MCP `execute_sql` to run the seed script.

**Step 3: Verify seed data**

Query to verify:
```sql
-- Verify test deal exists
SELECT * FROM deals WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verify collaborators
SELECT role, count(*)
FROM deal_collaborators
WHERE deal_id = '00000000-0000-0000-0000-000000000001'
GROUP BY role;

-- Verify activities
SELECT activity_type, count(*)
FROM activities
WHERE entity_type = 'opportunity'
AND entity_id = '00000000-0000-0000-0000-000000000001'
GROUP BY activity_type;
```

Expected:
- 1 test deal
- 1 owner, 1-2 collaborators, 1-2 followers
- 5 activities (1 call, 1 email, 1 meeting, 1 note, 1 task)

**Step 4: Commit seed script**

```bash
git add database/seeds/crm-deal-details-seed.sql
git commit -m "feat(seed): add deal details seed data

- deal_collaborators for all deals
- Additional activities for deals (300 total)
- Test deal with known ID for E2E testing
- Comprehensive activity types coverage

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 7: E2E Testing - Complete Flow

**Goal:** Create comprehensive E2E test covering full deal details workflow.

**Files:**
- Create: `tests/crm/phase1.4-e2e.spec.js`

**Step 1: Write E2E test**

Create: `tests/crm/phase1.4-e2e.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Phase 1.4 - Deal Details E2E', () => {
  const testDealId = '00000000-0000-0000-0000-000000000001';

  test.beforeEach(async ({ page }) => {
    // Navigate to deal details page
    await page.goto(`/apps/crm/deal-details?id=${testDealId}`);
    await page.waitForLoadState('networkidle');
  });

  test('deal details page loads with all sections', async ({ page }) => {
    // Verify page header
    await expect(page.locator('[data-testid="deal-name"]')).toContainText('Replica Badidas Futbol');

    // Verify sidebar sections
    await expect(page.locator('text=Deal Information')).toBeVisible();
    await expect(page.locator('text=Activity Summary')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();

    // Verify main content sections
    await expect(page.locator('text=Sales Pipeline')).toBeVisible();
    await expect(page.locator('text=Assigned To')).toBeVisible();
    await expect(page.locator('text=Associated Contact')).toBeVisible();
    await expect(page.locator('text=Account')).toBeVisible();
    await expect(page.locator('text=Activity Monitoring')).toBeVisible();
  });

  test('deal information displays correct data', async ({ page }) => {
    // Verify deal metadata
    await expect(page.locator('text=Current Stage')).toBeVisible();
    await expect(page.locator('text=proposal')).toBeVisible();

    await expect(page.locator('text=Budget Forecast')).toBeVisible();
    await expect(page.locator('text=$105,000')).toBeVisible();

    await expect(page.locator('text=Deal Probability')).toBeVisible();
    await expect(page.locator('text=35%')).toBeVisible();
  });

  test('collaborators section shows owner, collaborators, followers', async ({ page }) => {
    // Verify deal owner
    await expect(page.locator('text=Deal Owner')).toBeVisible();
    await expect(page.locator('[data-testid="deal-owner"]')).toBeVisible();

    // Verify collaborators
    await expect(page.locator('text=Collaborator')).toBeVisible();

    // Verify followers
    await expect(page.locator('text=Follower')).toBeVisible();
  });

  test('associated contact displays contact information', async ({ page }) => {
    // Verify contact section
    await expect(page.locator('[data-testid="associated-contact"]')).toBeVisible();

    // Verify contact has name, title, company
    await expect(page.locator('[data-testid="contact-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-company"]')).toBeVisible();
  });

  test('account section shows company with related deals', async ({ page }) => {
    // Verify company name
    await expect(page.locator('[data-testid="account-name"]')).toBeVisible();

    // Verify ongoing deals section
    await expect(page.locator('text=Ongoing Deals')).toBeVisible();

    // Verify past deals section
    await expect(page.locator('text=Past Deals')).toBeVisible();
  });

  test('activity summary shows correct counts', async ({ page }) => {
    // Wait for activity summary to load
    await expect(page.locator('text=Activity Summary')).toBeVisible();

    // Verify activity counts (based on seed data: 1 call, 1 email, 1 meeting)
    const callCount = await page.locator('text=Calls').locator('..').locator('text=/\\d+/').textContent();
    expect(parseInt(callCount)).toBeGreaterThanOrEqual(1);

    const emailCount = await page.locator('text=Emails').locator('..').locator('text=/\\d+/').textContent();
    expect(parseInt(emailCount)).toBeGreaterThanOrEqual(1);

    const meetingCount = await page.locator('text=Meeting').locator('..').locator('text=/\\d+/').textContent();
    expect(parseInt(meetingCount)).toBeGreaterThanOrEqual(1);
  });

  test('activity timeline displays recent activities', async ({ page }) => {
    // Verify timeline section
    await expect(page.locator('text=Activity Summary')).toBeVisible();

    // Should show at least 3 activities in timeline
    const timelineItems = page.locator('[data-testid="timeline-item"]');
    await expect(timelineItems).toHaveCount(4); // Shows 4 most recent
  });

  test('analytics section displays all metrics', async ({ page }) => {
    // Wait for analytics to load
    await expect(page.locator('text=Analytics')).toBeVisible();

    // Verify 4 analytics metrics
    await expect(page.locator('text=Deal Progress')).toBeVisible();
    await expect(page.locator('text=Win/Loss Ratio')).toBeVisible();
    await expect(page.locator('text=Conversion Rate')).toBeVisible();
    await expect(page.locator('text=Engagement Metrics')).toBeVisible();
  });

  test('activity monitoring tabs filter activities', async ({ page }) => {
    // Verify Activity Monitoring section
    await expect(page.locator('text=Activity Monitoring')).toBeVisible();

    // Verify tabs exist
    await expect(page.locator('role=tab[name="All"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Email"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Meeting"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Call Log"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Tasks"]')).toBeVisible();
    await expect(page.locator('role=tab[name="Notes"]')).toBeVisible();

    // Click Email tab
    await page.click('role=tab[name="Email"]');
    await page.waitForTimeout(500);

    // Verify email activities shown
    await expect(page.locator('[data-testid="activity-type-email"]')).toBeVisible();

    // Click Meeting tab
    await page.click('role=tab[name="Meeting"]');
    await page.waitForTimeout(500);

    // Verify meeting activities shown
    await expect(page.locator('[data-testid="activity-type-meeting"]')).toBeVisible();
  });

  test('sales pipeline shows correct stage progress', async ({ page }) => {
    // Verify pipeline section
    await expect(page.locator('text=Sales Pipeline')).toBeVisible();

    // Deal is in "proposal" stage, so Contact, MQL, SQL should be done
    await expect(page.locator('[data-testid="stage-contact"]')).toHaveAttribute('data-status', 'done');
    await expect(page.locator('[data-testid="stage-mql"]')).toHaveAttribute('data-status', 'done');
    await expect(page.locator('[data-testid="stage-sql"]')).toHaveAttribute('data-status', 'done');
    await expect(page.locator('[data-testid="stage-chance"]')).toHaveAttribute('data-status', 'pending');
  });

  test('page handles non-existent deal gracefully', async ({ page }) => {
    await page.goto('/apps/crm/deal-details?id=00000000-0000-0000-0000-999999999999');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Failed to load deal details');
  });

  test('page handles missing deal ID parameter', async ({ page }) => {
    await page.goto('/apps/crm/deal-details');

    // Should show error message
    await expect(page.locator('text=Deal ID Required')).toBeVisible();
  });

  test('deep linking works with deal ID', async ({ page }) => {
    // Navigate away
    await page.goto('/dashboard');

    // Navigate directly to deal details with ID
    await page.goto(`/apps/crm/deal-details?id=${testDealId}`);

    // Should load correctly
    await expect(page.locator('[data-testid="deal-name"]')).toBeVisible();
  });

  test('data persists after page refresh', async ({ page }) => {
    // Get initial deal name
    const initialName = await page.locator('[data-testid="deal-name"]').textContent();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify same data loads
    const reloadedName = await page.locator('[data-testid="deal-name"]').textContent();
    expect(reloadedName).toBe(initialName);
  });
});
```

**Step 2: Run E2E tests**

```bash
npx playwright test tests/crm/phase1.4-e2e.spec.js
```

Expected: All tests PASS

**Step 3: Commit E2E tests**

```bash
git add tests/crm/phase1.4-e2e.spec.js
git commit -m "test(e2e): add comprehensive deal details E2E tests

- Page load with all sections
- Deal information display
- Collaborators, contact, account sections
- Activity summary and timeline
- Analytics metrics
- Activity monitoring tab filtering
- Sales pipeline stage progress
- Error handling (404, missing ID)
- Deep linking and data persistence

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 8: Verification & Cleanup

**Goal:** Verify all tests pass, build succeeds, and remove mock data file.

**Step 1: Run all Phase 1.4 tests**

```bash
npx playwright test tests/crm/phase1.4-*.spec.js
```

Expected: All tests PASS (API layer, hooks, E2E)

**Step 2: Run full test suite**

```bash
npx playwright test
```

Expected: All tests PASS (including previous phases)

**Step 3: Run build**

```bash
npm run build
```

Expected: Build succeeds with 0 errors

**Step 4: Run lint**

```bash
npm run lint
```

Expected: 0 errors

**Step 5: Verify mock data removal**

```bash
# Check for any remaining references to deal-details mock data
grep -r "from 'data/crm/deal-details'" src/
```

Expected: No results

**Step 6: Remove mock data file (OPTIONAL - coordinate with team)**

```bash
# ONLY if confirmed all other code doesn't reference this file
# git rm src/data/crm/deal-details.jsx
```

NOTE: Keep mock file if other parts of app still reference it. Add TODO comment instead:
```javascript
// TODO: Remove this file after Phase 1.4 deployment confirmed stable
```

**Step 7: Generate verification evidence**

Capture outputs:
```bash
# Test output
npx playwright test tests/crm/phase1.4-*.spec.js > phase1.4-test-output.txt 2>&1

# Build output
npm run build > phase1.4-build-output.txt 2>&1

# Lint output
npm run lint > phase1.4-lint-output.txt 2>&1
```

**Step 8: Update INDEX document**

Update `docs/system/INDEX-crm-database-wiring.md`:

```markdown
### Phase 1.4: Interaction Page - Deal Details (Complex)
- **Status**: ✅ Complete
- **Completed**: 2026-01-31
- **Verification**: All tests passing, build successful, lint clean
```

**Step 9: Final commit**

```bash
git add docs/system/INDEX-crm-database-wiring.md phase1.4-*.txt
git commit -m "docs: mark Phase 1.4 complete with verification evidence

- All 13 tests passing (API, hooks, E2E)
- Build succeeds
- Lint clean
- Deal details page fully wired to database
- Mock data references removed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Appendices

### Appendix A: deal_collaborators Table Migration (If Missing)

If `deal_collaborators` table doesn't exist, create via migration:

```sql
-- Migration: create_deal_collaborators_table

CREATE TABLE IF NOT EXISTS deal_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL CHECK (role IN ('owner', 'collaborator', 'follower')),
  organization_id uuid NOT NULL,
  created_at timestamptz DEFAULT NOW(),

  -- Unique constraint: one user can't have multiple roles on same deal
  UNIQUE(deal_id, user_id)
);

-- Indexes
CREATE INDEX idx_deal_collaborators_deal_id ON deal_collaborators(deal_id);
CREATE INDEX idx_deal_collaborators_user_id ON deal_collaborators(user_id);
CREATE INDEX idx_deal_collaborators_organization_id ON deal_collaborators(organization_id);

-- RLS Policies
ALTER TABLE deal_collaborators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view deal_collaborators in their org"
  ON deal_collaborators
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert deal_collaborators in their org"
  ON deal_collaborators
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update deal_collaborators in their org"
  ON deal_collaborators
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete deal_collaborators in their org"
  ON deal_collaborators
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organizations
      WHERE user_id = auth.uid()
    )
  );
```

### Appendix B: Test Data Cleanup

After Phase 1.4 verification, optionally clean up test data:

```sql
-- Remove test deal (if needed for fresh state)
DELETE FROM activities WHERE entity_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM deal_collaborators WHERE deal_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM deals WHERE id = '00000000-0000-0000-0000-000000000001';
```

### Appendix C: Performance Optimization (If Needed)

If queries are slow, add materialized view for analytics:

```sql
-- Materialized view for deal analytics (refresh daily)
CREATE MATERIALIZED VIEW deal_analytics_mv AS
SELECT
  d.id as deal_id,
  d.organization_id,
  COUNT(a.id) as activity_count,
  COUNT(CASE WHEN a.activity_type = 'call' THEN 1 END) as call_count,
  COUNT(CASE WHEN a.activity_type = 'email' THEN 1 END) as email_count,
  COUNT(CASE WHEN a.activity_type = 'meeting' THEN 1 END) as meeting_count,
  MAX(a.activity_date) as last_activity_date
FROM deals d
LEFT JOIN activities a ON a.entity_id = d.id AND a.entity_type = 'opportunity'
GROUP BY d.id, d.organization_id;

-- Index for fast lookup
CREATE INDEX idx_deal_analytics_mv_deal_id ON deal_analytics_mv(deal_id);

-- Refresh command (run daily via cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY deal_analytics_mv;
```

---

## Success Criteria

Phase 1.4 is complete when:

- [x] `deal_collaborators` table exists with RLS policies
- [x] Performance indexes created on all tables
- [x] GET `/api/crm/deals/[id]` endpoint returns comprehensive nested data
- [x] PATCH `/api/crm/deals/[id]` endpoint updates deal fields
- [x] GET `/api/crm/deals/[id]/analytics` endpoint returns aggregations
- [x] `useCRMDealApi` hook fetches and caches deal data
- [x] Deal details page uses live data (no mock imports)
- [x] All 7 sections display correctly (header, sidebar, pipeline, assigned-to, contact, account, activity)
- [x] Activity tabs filter by type
- [x] Sales pipeline reflects deal stage
- [x] Analytics charts display metrics
- [x] URL param handling works (?id=[uuid])
- [x] Loading and error states implemented
- [x] Seed data created with test deal
- [x] 13 tests pass (3 API, 3 hooks, 7 E2E)
- [x] Build succeeds (`npm run build`)
- [x] Lint passes (`npm run lint`)
- [x] No references to `data/crm/deal-details.jsx` in active code
- [x] Documentation updated (INDEX marked complete)
- [x] Verification evidence captured (test/build/lint outputs)

---

## Next Steps

After Phase 1.4 completion:

1. **Code Review**: Use `Skill("code-review:code-review")` for final review
2. **Create PR**: Use `Skill("github-workflow")` to create PR for Phase 1.4
3. **Update GitHub Issue**: Post completion summary to #57
4. **Phase 1.5**: Begin CRM Dashboard analytics (final phase)
