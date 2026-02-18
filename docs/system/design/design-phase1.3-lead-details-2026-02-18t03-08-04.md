---
phase: "1.3"
title: "CRM Database Wiring - Lead Details (Interaction Page)"
type: "design"
status: "planned"
version: "1.0"
created: "2026-01-30"
updated: "2026-01-30"
author: "Pierce Team + Claude"
reviewers: []
dependencies: ["1.1", "1.2"]
blocks: ["1.4", "1.5"]
related_docs:
  - "docs/system/INDEX-crm-database-wiring.md"
  - "docs/system/design/2026-01-30-crm-database-wiring-brainstorm.md"
  - "docs/system/design/phase1.1-deals-kanban.md"
estimated_hours: 12
complexity: "medium"
impact: "deep"
verification:
  - "npm run build completes successfully"
  - "npm run lint shows 0 errors"
  - "npx playwright test passes all Phase 1.3 tests"
  - "Lead details page loads with live data from Supabase"
  - "Activity tabs display and filter correctly"
  - "Contact updates persist to database"
  - "No references to src/data/crm/lead-details.jsx"
---

# Phase 1.3: CRM Database Wiring - Lead Details (Interaction Page)

## Overview

Implement database integration for the CRM Lead Details page (`/apps/crm/lead-details`). This is an interaction page that displays comprehensive contact information, related deals, and activity history. This phase introduces the `activities` table for tracking customer interactions (calls, emails, meetings, notes, tasks) and establishes patterns for related data fetching and activity logging.

**Key Outcomes:**
- Activities table created with RLS policies
- 4 API endpoints (GET/PATCH contacts, GET/POST activities)
- Lead details page functional with live database
- Activity tabs display filtered activity data
- Foundation for activity tracking across all CRM pages

## Design Decisions

### Decision 1: Activities Table Schema - Conflict Resolution

**Context:** The existing database has an `activities` table that uses a different schema than originally planned in the brainstorm document.

**Existing Schema (Organization-scoped, Polymorphic):**
```sql
activities (
  id uuid,
  organization_id uuid,        -- Org-scoped (not user-scoped)
  entity_type varchar,          -- Polymorphic: lead, opportunity, account, contact, proposal
  entity_id uuid,               -- Polymorphic entity reference
  activity_type varchar,        -- call, email, meeting, note, task, status_change
  subject varchar,
  description text,
  activity_date timestamptz,   -- Named differently
  duration_minutes integer,
  outcome varchar,              -- Additional field
  next_action text,             -- Additional field
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Brainstorm Design (User-scoped, Direct FKs):**
```sql
activities (
  id uuid,
  user_id uuid,                 -- User-scoped
  type text,
  contact_id uuid,              -- Direct FK
  deal_id uuid,                 -- Direct FK
  subject text,
  description text,
  metadata jsonb,               -- Type-specific fields
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
```

**Options Considered:**

1. **Use Existing Schema with Adaptation** (Recommended)
   - Pros: No migration needed, consistent with other modules, supports broader use cases
   - Cons: Requires API layer adaptation, different from brainstorm design

2. **Create CRM-Specific Activities Table**
   - Pros: Matches brainstorm design exactly, simpler queries
   - Cons: Data duplication, inconsistent with platform architecture

3. **Migrate Existing Table to Brainstorm Design**
   - Pros: Aligns with original design
   - Cons: Breaking change, affects other modules already using activities

**Decision:** **Use existing schema with API adaptation.** The existing schema is more flexible and already supports the CRM use case through the polymorphic pattern. We'll adapt Phase 1.3 APIs to use:
- `entity_type = 'contact'` for contact-related activities
- `entity_type = 'opportunity'` for deal-related activities (deals will map to opportunities in this context)
- Filter by `entity_id = contact_id` or `deal_id`

**Mapping:**
| Brainstorm Field | Existing Field | Notes |
|------------------|----------------|-------|
| user_id | N/A (use organization_id instead) | Activities are org-scoped, not user-scoped |
| type | activity_type | Same purpose |
| contact_id | entity_id (where entity_type='contact') | Polymorphic mapping |
| deal_id | entity_id (where entity_type='opportunity') | Opportunities = deals |
| metadata | Use description + outcome + next_action | Structured fields instead of JSONB |
| created_at | activity_date | Renamed for clarity |

### Decision 2: Contact Details Data Structure

**Context:** Lead details page displays comprehensive contact information with related deals.

**Options Considered:**

1. **Nested JOIN in Single Endpoint** (Recommended)
   - Pros: Single API call, reduces network round-trips
   - Cons: Larger response payload

2. **Separate Endpoints for Contact and Deals**
   - Pros: Smaller payloads, can cache independently
   - Cons: Multiple network requests, waterfall loading

**Decision:** Nested JOIN in single endpoint. Use `GET /api/crm/contacts/[id]` with joins to fetch:
```sql
SELECT contacts.*,
       companies.*,
       deals.*
FROM crm_contacts
LEFT JOIN companies ON crm_contacts.company_id = companies.id
LEFT JOIN deals ON deals.contact_id = crm_contacts.id
WHERE crm_contacts.id = $1
```

This provides all necessary data in one request for optimal page load performance.

### Decision 3: Activity Filtering Strategy

**Context:** Activity tabs need to filter activities by contact and type (calls, emails, meetings, etc.).

**Options Considered:**

1. **Client-Side Filtering**
   - Pros: Fast switching between tabs, no additional API calls
   - Cons: Large initial payload if many activities

2. **Server-Side Filtering with Query Params** (Recommended)
   - Pros: Efficient for large datasets, supports pagination
   - Cons: API call per tab switch (mitigated by SWR cache)

**Decision:** Server-side filtering via `GET /api/crm/activities?contact_id=[id]&type=[type]`. This scales better and allows future pagination support.

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   UI Layer (Existing)                       │
│  /apps/crm/lead-details/page.jsx                           │
│    └─ LeadDetails.jsx                                      │
│       ├─ ContactInfo.jsx (contact details)                 │
│       ├─ OngoingDeals.jsx (related deals)                  │
│       └─ ActivityTabs.jsx (activity history)               │
│          └─ useCRMContactApi(id) [NEW]                     │
│          └─ useCRMActivitiesApi(contactId) [NEW]           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Layer (New)                           │
│  /api/crm/contacts/[id]/route.js                           │
│    └─ GET: Fetch contact with company + deals joins        │
│    └─ PATCH: Update contact fields                         │
│  /api/crm/activities/route.js                              │
│    └─ GET: Fetch activities filtered by contact/type       │
│    └─ POST: Create new activity                            │
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
│  ┌──────────┐  ┌───────────┐  ┌───────┐  ┌────────────┐   │
│  │companies │  │crm_contact│  │ deals │  │ activities │   │
│  └──────────┘  └───────────┘  └───────┘  └────────────┘   │
│       │              │            │              │          │
│       └──────────────┴────────────┴──────────────┘          │
│                   (Foreign Keys)                            │
│  RLS Policies: organization_id scoped                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Model

#### Existing Tables (No Changes Needed)

**`companies`** ✅ Already exists from Phase 1.1
**`crm_contacts`** ✅ Already exists from Phase 1.1
**`deals`** ✅ Already exists from Phase 1.1

#### Existing `activities` Table (Use As-Is)

```sql
-- Already exists, no migration needed
-- Uses polymorphic pattern for entity association
-- RLS: organization_id scoped (not user_id scoped)
```

**Verification Query:**
```sql
-- Verify activities table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'activities'
AND table_schema = 'public';

-- Expected columns:
-- id, organization_id, entity_type, entity_id, activity_type,
-- subject, description, activity_date, duration_minutes,
-- outcome, next_action, created_at, updated_at, created_by
```

### TypeScript Types

```typescript
// src/types/crm.ts

// Reuse existing types from Phase 1.1
export interface Company { ... }
export interface Contact { ... }
export interface Deal { ... }

// New activity type
export interface Activity {
  id: string;
  organization_id: string;
  entity_type: 'contact' | 'opportunity' | 'account' | 'lead' | 'proposal';
  entity_id: string; // contact_id or deal_id depending on entity_type
  activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change';
  subject: string;
  description: string | null;
  activity_date: string;
  duration_minutes: number | null;
  outcome: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Contact with related data
export interface ContactWithRelations extends Contact {
  company?: Company;
  deals?: Deal[];
}
```

### Component Breakdown

1. **API Route: `/api/crm/contacts/[id]/route.js`** (NEW)
   - Purpose: Fetch single contact with related data
   - Key functionality:
     - Server-side Supabase auth
     - Query contact with company, deals joins
     - Verify ownership (organization_id matching)
     - Return ContactWithRelations format
   - Dependencies: @supabase/ssr

2. **API Route: `/api/crm/activities/route.js`** (NEW)
   - Purpose: Fetch/create activities for contacts
   - Key functionality:
     - GET: Filter by entity_type='contact', entity_id=contact_id, optional activity_type
     - POST: Create new activity with entity_type='contact'
     - Validate organization_id for RLS
     - Return Activity[] format
   - Dependencies: @supabase/ssr

3. **SWR Hook: `src/services/swr/api-hooks/useCRMContactApi.js`** (NEW)
   - Purpose: Fetch single contact with caching
   - Key functionality:
     - GET /api/crm/contacts/[id] with SWR
     - Return { contact, isLoading, error, mutate }
     - Handle 404 gracefully
   - Dependencies: swr, axios

4. **SWR Hook: `src/services/swr/api-hooks/useCRMActivitiesApi.js`** (NEW)
   - Purpose: Fetch activities for contact/deal
   - Key functionality:
     - GET /api/crm/activities?entity_type=contact&entity_id=[id]&activity_type=[type]
     - Return { activities, isLoading, error, mutate, createActivity }
     - Support optional type filtering
   - Dependencies: swr, axios

5. **Component: `src/components/sections/crm/lead-details/index.jsx`** (MODIFIED)
   - Purpose: Replace mock data with live API integration
   - Key modifications:
     - Remove: `import { contactInfoData, ongoingDealsData } from 'data/crm/lead-details'`
     - Add: `const { contact, isLoading, error } = useCRMContactApi(contactId)`
     - Add: URL param handling to get contactId from query string
     - Add: Loading and error states
     - Pass live data to ContactInfo and OngoingDeals components
   - Dependencies: useCRMContactApi

6. **Component: `src/components/sections/crm/common/ActivityTabs.jsx`** (MODIFIED)
   - Purpose: Wire activity tabs to live API data
   - Key modifications:
     - Add: `const { activities, isLoading, createActivity } = useCRMActivitiesApi(contactId, activityType)`
     - Replace hardcoded activity data with live data
     - Add: Activity creation handler
     - Filter activities by selected tab (call, email, meeting, note, task)
   - Dependencies: useCRMActivitiesApi

## Dependencies

### External Dependencies
- Supabase project with activities table (✅ Available)
- @supabase/ssr for Next.js 15 App Router (✅ Available)
- SWR for data fetching (✅ Available)
- Material-UI components (✅ Available)

### Internal Dependencies
- Phase 1.1 must complete (companies, crm_contacts, deals tables required)
- Phase 1.2 should complete (contact creation flow for testing)

### Blocks
- Phase 1.4 (Deal Details requires activities pattern)
- Phase 1.5 (Dashboard requires activity analytics)

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Activities schema mismatch breaks integration | High | Low | Design doc updated to use existing schema, API layer adapts |
| Activity filtering performance with many records | Medium | Medium | Add pagination support, create indexes on entity_type + entity_id |
| Organization vs user scoping confusion | Medium | Low | Document clearly, use organization_id consistently |
| Activity tabs don't load due to missing data | Low | Low | Seed diverse activity data, handle empty states in UI |
| URL param handling breaks on direct navigation | Medium | Low | Add proper Next.js 15 searchParams handling, test deep linking |

## Implementation Notes

### Seed Data Strategy
- Use existing CRM contacts from Phase 1.1
- Insert 30 sample activities:
  - 10 calls (entity_type='contact')
  - 8 emails (entity_type='contact')
  - 6 meetings (entity_type='contact')
  - 4 notes (entity_type='contact')
  - 2 tasks (entity_type='contact')
- Distribute across 10 contacts (3 activities per contact average)
- Vary activity_date to show timeline

### URL Parameter Handling

```javascript
// In page.jsx (Next.js 15 App Router)
export default async function Page({ searchParams }) {
  const params = await searchParams;
  const contactId = params.id; // From ?id=[uuid]

  if (!contactId) {
    return <NotFound message="Contact ID required" />;
  }

  return <LeadDetails contactId={contactId} />;
}
```

### Activity Type Mapping

For consistency across the CRM:
- `call` → Phone conversations
- `email` → Email communications
- `meeting` → In-person or virtual meetings
- `note` → General notes/observations
- `task` → Follow-up tasks/reminders
- `status_change` → Contact status updates (not shown in tabs)

### Aurora Pattern Preservation
- **No UI changes**: All lead-details components unchanged structurally
- **Material-UI components**: Paper, Stack, Grid remain unchanged
- **Responsive design**: Breakpoints and layouts preserved
- **Only swap**: Mock data imports → SWR hooks

## Verification Plan

### Phase-Specific Verification

1. **Database Layer**
   - Activities table exists with correct structure
   - Can insert activities with entity_type='contact'
   - RLS policies enforce organization isolation
   - Indexes exist on entity_type, entity_id, activity_date

2. **API Layer**
   - GET /api/crm/contacts/[id] returns contact with company + deals
   - PATCH /api/crm/contacts/[id] updates contact fields
   - GET /api/crm/activities?entity_type=contact&entity_id=[id] filters correctly
   - POST /api/crm/activities creates activity with entity_type='contact'
   - Unauthorized requests return 401
   - Invalid IDs return 404

3. **UI Layer**
   - Lead details page loads with URL param ?id=[uuid]
   - Contact info displays from database
   - Ongoing deals shown correctly
   - Activity tabs display and filter by type
   - No references to src/data/crm/lead-details.jsx
   - Loading states display during fetch

4. **E2E Integration**
   - Navigate from contacts list → Lead details loads
   - View contact with multiple deals → All deals shown
   - Switch between activity tabs → Filters apply
   - Create new activity → Appears in timeline
   - Refresh page → Data persists

### Phase Acceptance Criteria

- [ ] Activities table verified (existing schema)
- [ ] GET /api/crm/contacts/[id] returns nested data
- [ ] PATCH /api/crm/contacts/[id] updates contact
- [ ] GET /api/crm/activities filters by contact
- [ ] POST /api/crm/activities creates activity
- [ ] useCRMContactApi() hook returns data correctly
- [ ] useCRMActivitiesApi() hook filters by type
- [ ] Lead details page uses live data (no mock imports)
- [ ] Activity tabs functional with filtering
- [ ] URL param handling works (deep linking)
- [ ] No errors in browser console
- [ ] npm run build succeeds
- [ ] npm run lint passes (0 errors)
- [ ] All Playwright tests pass (4 layers)

## Related Documentation

- [INDEX: CRM Database Wiring](../INDEX-crm-database-wiring.md)
- [Brainstorm: CRM Database Wiring](2026-01-30-crm-database-wiring-brainstorm.md)
- [Phase 1.1: Deals Kanban](phase1.1-deals-kanban.md)
- [Next.js 15 App Router Params](https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
