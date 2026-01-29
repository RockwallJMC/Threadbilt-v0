# Phase 2: Core Operations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Projects Desk and Service Desk to enable physical security integrators to manage construction projects and ongoing service operations, creating the bridge from sales (CRM) through project delivery to long-term maintenance.

**Architecture:** Two interconnected desks with shared data models. Projects Desk handles construction project lifecycle (Gantt, Kanban, budget tracking, AIA billing). Service Desk manages post-installation operations (tickets, SLAs, recurring maintenance, warranty tracking). Bridge components enable seamless transitions: Opportunity → Project (CRM to Projects) and Project Closeout → Service Agreement (Projects to Service).

**Tech Stack:**
- Next.js 15 (App Router), React 19, Material-UI v7
- Supabase PostgreSQL (multi-tenant RLS)
- SWR for data fetching
- Aurora template patterns (Gantt, Kanban, Calendar components)
- react-gantt-chart library for project timelines
- Playwright for E2E testing

---

## Phase 2 Overview: 3-Month Timeline

Phase 2 delivers two critical operational desks that transform PierceDesk from a sales tool (CRM MVP) into a complete operations platform. This phase establishes the **digital thread continuity** from first contact through decades of service.

**High-Level Phases:**

- **Phase 2.1** (Weeks 1-2): Foundation & Database Schema
- **Phase 2.2** (Weeks 3-4): Projects Desk - Core Project Management
- **Phase 2.3** (Weeks 5-6): Projects Desk - Gantt, Budget, AIA Billing
- **Phase 2.4** (Weeks 7-8): Service Desk - Tickets & SLA Management
- **Phase 2.5** (Weeks 9-10): Service Desk - Recurring Service & Warranty
- **Phase 2.6** (Weeks 11-12): Integration Bridges & Testing

**Success Metrics:**
- Convert opportunities to projects with full data carryover
- Track project progress with Gantt charts and budget visibility
- Generate AIA G702/G703 billing from task completion
- Transition completed projects to service agreements seamlessly
- Create and track service tickets with SLA enforcement
- Manage recurring maintenance contracts and warranty periods

---

## Phase 2.1: Foundation & Database Schema (Weeks 1-2)

### Goals
- Design complete database schema for Projects and Service desks
- Implement multi-tenant RLS policies
- Create shared data models (polymorphic relationships)
- Set up navigation structure for new desks
- Establish data migration patterns from CRM

### Database Schema Design

**Projects Desk Tables:**

```sql
-- Core project entity
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  opportunity_id UUID REFERENCES opportunities(id), -- Bridge from CRM
  account_id UUID NOT NULL REFERENCES accounts(id),
  project_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_type VARCHAR(50), -- new_construction, retrofit, service_upgrade, tenant_improvement
  status VARCHAR(50) DEFAULT 'planning', -- planning, active, on_hold, completed, closed
  start_date DATE,
  planned_end_date DATE,
  actual_end_date DATE,
  budget_amount DECIMAL(12,2),
  contract_amount DECIMAL(12,2),
  current_costs DECIMAL(12,2) DEFAULT 0,
  billing_type VARCHAR(50), -- fixed_price, time_and_materials, aia_progress
  retention_percentage DECIMAL(5,2), -- AIA retainage (typically 10%)
  site_address JSONB, -- {street, city, state, zip, property_name}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  project_manager_id UUID REFERENCES auth.users(id)
);

-- Project phases/milestones
CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_number INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  status VARCHAR(50) DEFAULT 'not_started', -- not_started, in_progress, completed, blocked
  budget_amount DECIMAL(12,2),
  dependencies JSONB, -- Array of phase_ids this depends on
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks within phases (for Gantt/Kanban)
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL,
  task_number VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50), -- design, procurement, installation, testing, closeout
  status VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, completed, blocked, cancelled
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  assigned_to UUID REFERENCES auth.users(id),
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2) DEFAULT 0,
  dependencies JSONB, -- Array of task_ids this depends on
  completion_percentage INTEGER DEFAULT 0,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Labor tracking (time entries)
CREATE TABLE project_labor (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  work_date DATE NOT NULL,
  hours DECIMAL(8,2) NOT NULL,
  hourly_rate DECIMAL(10,2),
  labor_cost DECIMAL(12,2) GENERATED ALWAYS AS (hours * hourly_rate) STORED,
  description TEXT,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Material costs
CREATE TABLE project_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  supplier VARCHAR(255),
  purchase_date DATE,
  billable BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- AIA billing periods (G702/G703)
CREATE TABLE aia_billing_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  period_number INTEGER NOT NULL,
  billing_date DATE NOT NULL,
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  scheduled_value DECIMAL(12,2), -- Total contract amount
  work_completed_previous DECIMAL(12,2) DEFAULT 0,
  work_completed_this_period DECIMAL(12,2) NOT NULL,
  work_completed_total DECIMAL(12,2) GENERATED ALWAYS AS (work_completed_previous + work_completed_this_period) STORED,
  retention_percentage DECIMAL(5,2),
  retention_this_period DECIMAL(12,2),
  total_retention DECIMAL(12,2),
  amount_due DECIMAL(12,2), -- After retention
  status VARCHAR(50) DEFAULT 'draft', -- draft, submitted, approved, paid
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Service Desk Tables:**

```sql
-- Service agreements (ongoing contracts)
CREATE TABLE service_agreements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  project_id UUID REFERENCES projects(id), -- Bridge from completed project
  agreement_number VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  agreement_type VARCHAR(50), -- recurring_maintenance, on_demand, warranty, hybrid
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, expired, cancelled
  start_date DATE NOT NULL,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  billing_frequency VARCHAR(50), -- monthly, quarterly, annually
  monthly_fee DECIMAL(10,2),
  included_hours DECIMAL(8,2), -- Hours included per billing period
  overage_rate DECIMAL(10,2), -- Rate for hours beyond included
  site_address JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Covered equipment/systems in service agreements
CREATE TABLE service_agreement_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  service_agreement_id UUID NOT NULL REFERENCES service_agreements(id) ON DELETE CASCADE,
  device_type VARCHAR(100), -- camera, access_control_panel, intercom, nvr, etc.
  device_model VARCHAR(100),
  serial_number VARCHAR(100),
  location VARCHAR(255),
  warranty_expiration DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service tickets
CREATE TABLE service_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  account_id UUID NOT NULL REFERENCES accounts(id),
  service_agreement_id UUID REFERENCES service_agreements(id),
  project_id UUID REFERENCES projects(id), -- If related to recent project
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ticket_type VARCHAR(50), -- incident, service_request, maintenance, warranty_claim
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  status VARCHAR(50) DEFAULT 'open', -- open, assigned, in_progress, on_hold, resolved, closed
  source VARCHAR(50), -- phone, email, portal, internal
  reported_by_contact_id UUID REFERENCES contacts(id),
  assigned_to UUID REFERENCES auth.users(id),
  site_address JSONB,
  sla_response_deadline TIMESTAMP, -- When first response is due
  sla_resolution_deadline TIMESTAMP, -- When resolution is due
  first_response_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  resolution_notes TEXT,
  billable BOOLEAN DEFAULT false, -- True if outside service agreement
  estimated_hours DECIMAL(8,2),
  actual_hours DECIMAL(8,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Ticket activities/updates
CREATE TABLE ticket_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  ticket_id UUID NOT NULL REFERENCES service_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  activity_type VARCHAR(50), -- comment, status_change, assignment, resolution, closure
  content TEXT,
  is_internal BOOLEAN DEFAULT false, -- Internal notes vs customer-facing
  time_spent DECIMAL(8,2), -- Hours logged with this activity
  created_at TIMESTAMP DEFAULT NOW()
);

-- SLA definitions (per agreement or default)
CREATE TABLE sla_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) NOT NULL, -- low, medium, high, urgent
  response_time_hours INTEGER NOT NULL, -- Hours until first response required
  resolution_time_hours INTEGER NOT NULL, -- Hours until resolution required
  business_hours_only BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recurring maintenance schedules
CREATE TABLE maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  service_agreement_id UUID NOT NULL REFERENCES service_agreements(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  frequency VARCHAR(50) NOT NULL, -- monthly, quarterly, semi_annually, annually
  next_due_date DATE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id),
  estimated_hours DECIMAL(8,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Warranty tracking
CREATE TABLE warranties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  project_id UUID REFERENCES projects(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  item_description VARCHAR(255) NOT NULL,
  warranty_type VARCHAR(50), -- manufacturer, workmanship, extended
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  warranty_provider VARCHAR(255),
  terms TEXT,
  serial_number VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Polymorphic Activity/Comments Table (Shared):**

```sql
-- Generic activities/comments (can attach to projects, tickets, tasks, etc.)
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  activity_type VARCHAR(50) NOT NULL, -- note, call, email, meeting, status_change
  subject VARCHAR(255),
  content TEXT,
  related_to_type VARCHAR(50) NOT NULL, -- project, ticket, task, opportunity, account, etc.
  related_to_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for polymorphic queries
CREATE INDEX idx_activities_related ON activities(organization_id, related_to_type, related_to_id);
```

### RLS Policies

All tables MUST have RLS enabled with organization_id scoping:

```sql
-- Example for projects table (repeat pattern for all tables)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their organization's projects"
  ON projects
  FOR ALL
  USING (organization_id = current_setting('app.current_org_id')::uuid);
```

### Navigation Updates

**Modify `src/routes/sitemap.js`:**

Add Projects Desk and Service Desk sections with Coming Soon indicators initially, then activate after implementation.

**Modify `src/routes/paths.js`:**

```javascript
export const paths = {
  // ... existing CRM paths ...

  // Projects Desk
  projects: {
    root: '/desks/projects',
    dashboard: '/desks/projects',
    list: '/desks/projects/list',
    gantt: '/desks/projects/gantt',
    kanban: '/desks/projects/kanban',
    calendar: '/desks/projects/calendar',
    detail: (id) => `/desks/projects/${id}`,
    budget: (id) => `/desks/projects/${id}/budget`,
    billing: (id) => `/desks/projects/${id}/billing`,
  },

  // Service Desk
  service: {
    root: '/desks/service',
    dashboard: '/desks/service',
    tickets: '/desks/service/tickets',
    ticketDetail: (id) => `/desks/service/tickets/${id}`,
    agreements: '/desks/service/agreements',
    agreementDetail: (id) => `/desks/service/agreements/${id}`,
    maintenance: '/desks/service/maintenance',
    warranties: '/desks/service/warranties',
    sla: '/desks/service/sla',
    reports: '/desks/service/reports',
  },
};
```

### Tasks

#### Task 1: Create Database Migration Files

**Files:**
- Create: `migrations/009_create_projects_tables.sql`
- Create: `migrations/010_create_service_tables.sql`
- Create: `migrations/011_enable_phase2_rls.sql`

**Step 1: Write projects tables migration**

Copy SQL from "Projects Desk Tables" section above into `migrations/009_create_projects_tables.sql`.

**Step 2: Write service tables migration**

Copy SQL from "Service Desk Tables" section above into `migrations/010_create_service_tables.sql`.

**Step 3: Write RLS policies migration**

Create comprehensive RLS policies for all Phase 2 tables in `migrations/011_enable_phase2_rls.sql`.

**Step 4: Execute migrations via Supabase MCP**

Use Supabase MCP tools to:
- Execute each migration file
- Verify tables created correctly
- Test RLS policies with multiple test organizations

Run: `mcp__supabase__execute_sql()` for each migration file
Expected: Tables created, RLS enabled, policies active

**Step 5: Commit**

```bash
git add migrations/009_create_projects_tables.sql migrations/010_create_service_tables.sql migrations/011_enable_phase2_rls.sql
git commit -m "feat(phase2): add Projects and Service Desk database schema

- Create projects, project_phases, project_tasks tables
- Create project_labor, project_materials, aia_billing_periods tables
- Create service_agreements, service_tickets, warranties tables
- Enable RLS policies for all Phase 2 tables
- Add polymorphic activities table with indexes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### Task 2: Update Navigation Structure

**Files:**
- Modify: `src/routes/sitemap.js`
- Modify: `src/routes/paths.js`

**Step 1: Write failing test for new routes**

```typescript
// tests/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('Projects Desk navigation appears in sidebar', async ({ page }) => {
  await page.goto('/desks/crm');
  await expect(page.getByRole('link', { name: 'Projects Desk' })).toBeVisible();
});

test('Service Desk navigation appears in sidebar', async ({ page }) => {
  await page.goto('/desks/crm');
  await expect(page.getByRole('link', { name: 'Service Desk' })).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/navigation.spec.ts -v`
Expected: FAIL with "Element not found"

**Step 3: Update sitemap.js**

```javascript
// src/routes/sitemap.js
const sitemap = [
  // ... existing Home and CRM sections ...

  {
    id: 'projects-desk',
    subheader: 'PROJECTS DESK',
    key: 'projects_desk',
    icon: 'material-symbols:engineering',
    items: [
      {
        name: 'Dashboard',
        key: 'projects_dashboard',
        path: paths.projects.dashboard,
        pathName: 'projects',
        icon: 'material-symbols:dashboard',
        active: true,
      },
      {
        name: 'Project List',
        key: 'projects_list',
        path: paths.projects.list,
        pathName: 'projects-list',
        icon: 'material-symbols:list',
        active: true,
      },
      {
        name: 'Gantt Chart',
        key: 'projects_gantt',
        path: paths.projects.gantt,
        pathName: 'projects-gantt',
        icon: 'material-symbols:gantt-chart',
        active: true,
      },
      {
        name: 'Kanban Board',
        key: 'projects_kanban',
        path: paths.projects.kanban,
        pathName: 'projects-kanban',
        icon: 'material-symbols:view-kanban',
        active: true,
      },
      {
        name: 'Calendar',
        key: 'projects_calendar',
        path: paths.projects.calendar,
        pathName: 'projects-calendar',
        icon: 'material-symbols:calendar-month',
        active: true,
      },
    ],
  },

  {
    id: 'service-desk',
    subheader: 'SERVICE DESK',
    key: 'service_desk',
    icon: 'material-symbols:support-agent',
    items: [
      {
        name: 'Dashboard',
        key: 'service_dashboard',
        path: paths.service.dashboard,
        pathName: 'service',
        icon: 'material-symbols:dashboard',
        active: true,
      },
      {
        name: 'Tickets',
        key: 'service_tickets',
        path: paths.service.tickets,
        pathName: 'service-tickets',
        icon: 'material-symbols:confirmation-number',
        active: true,
      },
      {
        name: 'Service Agreements',
        key: 'service_agreements',
        path: paths.service.agreements,
        pathName: 'service-agreements',
        icon: 'material-symbols:contract',
        active: true,
      },
      {
        name: 'Recurring Maintenance',
        key: 'service_maintenance',
        path: paths.service.maintenance,
        pathName: 'service-maintenance',
        icon: 'material-symbols:schedule',
        active: true,
      },
      {
        name: 'Warranties',
        key: 'service_warranties',
        path: paths.service.warranties,
        pathName: 'service-warranties',
        icon: 'material-symbols:verified',
        active: true,
      },
    ],
  },
];
```

**Step 4: Update paths.js**

Add paths object from "Navigation Updates" section above.

**Step 5: Run test to verify it passes**

Run: `npx playwright test tests/navigation.spec.ts -v`
Expected: PASS

**Step 6: Commit**

```bash
git add src/routes/sitemap.js src/routes/paths.js tests/navigation.spec.ts
git commit -m "feat(phase2): add Projects and Service Desk navigation

- Update sitemap with Projects Desk menu items
- Update sitemap with Service Desk menu items
- Add paths for all Projects and Service routes
- Add navigation tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### Task 3: Create SWR Data Hooks Foundation

**Files:**
- Create: `src/services/swr/projects/useProjects.js`
- Create: `src/services/swr/projects/useProjectTasks.js`
- Create: `src/services/swr/projects/index.js`
- Create: `src/services/swr/service/useServiceTickets.js`
- Create: `src/services/swr/service/useServiceAgreements.js`
- Create: `src/services/swr/service/index.js`

**Step 1: Write failing test for useProjects hook**

```typescript
// tests/hooks/useProjects.spec.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from '@/services/swr/projects';

test('useProjects fetches organization projects', async () => {
  const { result } = renderHook(() => useProjects());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test tests/hooks/useProjects.spec.ts`
Expected: FAIL with "Module not found"

**Step 3: Implement useProjects hook**

```javascript
// src/services/swr/projects/useProjects.js
import { supabase } from '@/lib/supabase';
import useSWR from 'swr';

export function useProjects(filters = {}) {
  const fetcher = async () => {
    let query = supabase
      .from('projects')
      .select('*, account:accounts(*), project_manager:auth.users(*)')
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.project_manager_id) {
      query = query.eq('project_manager_id', filters.project_manager_id);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  return useSWR(['projects', filters], fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}

export async function createProject(projectData) {
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(id, updates) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
```

**Step 4: Implement remaining hooks**

Create similar patterns for:
- `useProjectTasks.js`
- `useServiceTickets.js`
- `useServiceAgreements.js`

**Step 5: Run tests to verify they pass**

Run: `npm test tests/hooks/`
Expected: All tests PASS

**Step 6: Commit**

```bash
git add src/services/swr/projects/ src/services/swr/service/ tests/hooks/
git commit -m "feat(phase2): add SWR data hooks for Projects and Service desks

- Create useProjects hook with filters
- Create useProjectTasks hook
- Create useServiceTickets hook with SLA calculations
- Create useServiceAgreements hook
- Add mutation functions (create, update, delete)
- Add unit tests for all hooks

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2.2: Projects Desk - Core Project Management (Weeks 3-4)

### Goals
- Build project list view with filtering
- Create project detail pages
- Implement project creation from opportunity conversion
- Build task management (Kanban board)
- Create phase/milestone tracking

### Component Architecture

```
Project Page Flow:
src/app/(main)/desks/projects/page.jsx (Dashboard)
  ↓ imports
src/components/sections/desks/projects/ProjectsDashboard.jsx
  ↓ uses
src/services/swr/projects/useProjects.js

Project Detail Flow:
src/app/(main)/desks/projects/[id]/page.jsx
  ↓ imports
src/components/sections/desks/projects/ProjectDetail.jsx
  ↓ uses multiple hooks
useProjects, useProjectTasks, useProjectPhases
```

### Tasks

#### Task 4: Create Project Conversion Bridge (CRM → Projects)

**Files:**
- Create: `src/components/sections/desks/crm/OpportunityConvertToProject.jsx`
- Modify: `src/components/sections/desks/crm/OpportunityDetail.jsx`
- Create: `tests/crm-to-projects-bridge.spec.ts`

**Step 1: Write failing E2E test**

```typescript
// tests/crm-to-projects-bridge.spec.ts
import { test, expect } from '@playwright/test';

test('Convert closed-won opportunity to project', async ({ page }) => {
  // Navigate to opportunity detail
  await page.goto('/desks/crm/opportunities/test-opp-id');

  // Mark as Closed Won
  await page.getByRole('button', { name: 'Mark as Won' }).click();

  // Convert to project button appears
  await expect(page.getByRole('button', { name: 'Convert to Project' })).toBeVisible();

  // Click convert
  await page.getByRole('button', { name: 'Convert to Project' }).click();

  // Fill project form
  await page.getByLabel('Project Number').fill('PROJ-001');
  await page.getByLabel('Start Date').fill('2026-02-01');
  await page.getByRole('button', { name: 'Create Project' }).click();

  // Should redirect to new project
  await expect(page).toHaveURL(/\/desks\/projects\/[a-z0-9-]+/);
  await expect(page.getByText('Project created from opportunity')).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/crm-to-projects-bridge.spec.ts -v`
Expected: FAIL with "Button not found"

**Step 3: Implement OpportunityConvertToProject component**

```javascript
// src/components/sections/desks/crm/OpportunityConvertToProject.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogTitle, DialogContent, Button, TextField, Stack } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createProject } from '@/services/swr/projects';
import { updateOpportunity } from '@/services/swr/crm';

const schema = yup.object({
  project_number: yup.string().required('Project number required'),
  start_date: yup.date().required('Start date required'),
  planned_end_date: yup.date(),
  project_type: yup.string().required('Project type required'),
});

export default function OpportunityConvertToProject({ opportunity, open, onClose }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      project_number: `PROJ-${Date.now()}`,
      start_date: new Date().toISOString().split('T')[0],
      project_type: 'new_construction',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Create project from opportunity data
      const project = await createProject({
        opportunity_id: opportunity.id,
        account_id: opportunity.account_id,
        project_number: data.project_number,
        name: opportunity.name,
        description: opportunity.description,
        contract_amount: opportunity.value,
        budget_amount: opportunity.value * 0.85, // Default 85% budget
        start_date: data.start_date,
        planned_end_date: data.planned_end_date,
        project_type: data.project_type,
        status: 'planning',
      });

      // Update opportunity with project link
      await updateOpportunity(opportunity.id, {
        converted_to_project_id: project.id,
      });

      // Redirect to new project
      router.push(`/desks/projects/${project.id}`);
      onClose();
    } catch (error) {
      console.error('Failed to convert opportunity:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Convert Opportunity to Project</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Project Number"
              {...register('project_number')}
              error={!!errors.project_number}
              helperText={errors.project_number?.message}
            />
            <TextField
              label="Start Date"
              type="date"
              {...register('start_date')}
              error={!!errors.start_date}
              helperText={errors.start_date?.message}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Planned End Date"
              type="date"
              {...register('planned_end_date')}
              error={!!errors.planned_end_date}
              helperText={errors.planned_end_date?.message}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              select
              label="Project Type"
              {...register('project_type')}
              error={!!errors.project_type}
              helperText={errors.project_type?.message}
              SelectProps={{ native: true }}
            >
              <option value="new_construction">New Construction</option>
              <option value="retrofit">Retrofit</option>
              <option value="service_upgrade">Service Upgrade</option>
              <option value="tenant_improvement">Tenant Improvement</option>
            </TextField>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Creating...' : 'Create Project'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 4: Update OpportunityDetail to show convert button**

Add convert button that appears when opportunity status is "Closed Won" and no project exists yet.

**Step 5: Run test to verify it passes**

Run: `npx playwright test tests/crm-to-projects-bridge.spec.ts -v`
Expected: PASS

**Step 6: Commit**

```bash
git add src/components/sections/desks/crm/OpportunityConvertToProject.jsx \
        src/components/sections/desks/crm/OpportunityDetail.jsx \
        tests/crm-to-projects-bridge.spec.ts
git commit -m "feat(phase2): implement CRM to Projects conversion bridge

- Create OpportunityConvertToProject dialog component
- Add convert button to OpportunityDetail (appears for Closed Won)
- Carry over opportunity data to project (name, value, account)
- Update opportunity with project link after conversion
- Add E2E test for conversion flow

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### Task 5: Build Projects Dashboard

**Files:**
- Create: `src/app/(main)/desks/projects/page.jsx`
- Create: `src/components/sections/desks/projects/ProjectsDashboard.jsx`
- Create: `tests/projects-dashboard.spec.ts`

**Step 1: Write failing test**

```typescript
// tests/projects-dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('Projects dashboard displays key metrics', async ({ page }) => {
  await page.goto('/desks/projects');

  await expect(page.getByText('Active Projects')).toBeVisible();
  await expect(page.getByText('On Schedule')).toBeVisible();
  await expect(page.getByText('Over Budget')).toBeVisible();
  await expect(page.getByText('Total Budget')).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/projects-dashboard.spec.ts -v`
Expected: FAIL

**Step 3: Create dashboard page component**

```javascript
// src/app/(main)/desks/projects/page.jsx
import ProjectsDashboard from '@/components/sections/desks/projects/ProjectsDashboard';

export const metadata = {
  title: 'Projects Dashboard - PierceDesk',
};

export default function ProjectsPage() {
  return <ProjectsDashboard />;
}
```

**Step 4: Create dashboard section component**

```javascript
// src/components/sections/desks/projects/ProjectsDashboard.jsx
'use client';

import { Grid, Paper, Typography, Stack } from '@mui/material';
import { useProjects } from '@/services/swr/projects';

export default function ProjectsDashboard() {
  const { data: projects, isLoading } = useProjects();

  if (isLoading) return <div>Loading...</div>;

  const activeProjects = projects?.filter(p => p.status === 'active') || [];
  const onSchedule = activeProjects.filter(p => {
    if (!p.planned_end_date) return true;
    return new Date(p.planned_end_date) >= new Date();
  });
  const overBudget = activeProjects.filter(p => p.current_costs > p.budget_amount);
  const totalBudget = activeProjects.reduce((sum, p) => sum + (p.budget_amount || 0), 0);

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Projects Dashboard</Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">Active Projects</Typography>
            <Typography variant="h3">{activeProjects.length}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">On Schedule</Typography>
            <Typography variant="h3">{onSchedule.length}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">Over Budget</Typography>
            <Typography variant="h3" color="error.main">{overBudget.length}</Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="text.secondary">Total Budget</Typography>
            <Typography variant="h3">${(totalBudget / 1000000).toFixed(1)}M</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Add recent projects list, timeline chart, etc. */}
    </Stack>
  );
}
```

**Step 5: Run test to verify it passes**

Run: `npx playwright test tests/projects-dashboard.spec.ts -v`
Expected: PASS

**Step 6: Commit**

```bash
git add src/app/(main)/desks/projects/page.jsx \
        src/components/sections/desks/projects/ProjectsDashboard.jsx \
        tests/projects-dashboard.spec.ts
git commit -m "feat(phase2): build Projects Desk dashboard

- Create projects dashboard route
- Add key metrics cards (active, on schedule, over budget, total budget)
- Use SWR hook for real-time data
- Add E2E test for dashboard

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

#### Task 6: Create CRM-to-Projects User Journey Test

**Goal:** Verify the complete user journey from opportunity to project creation and task management.

**Pattern:** Follows Phase 1.8 E2E testing approach (see `tests/crm-lead-to-proposal-flow.spec.js`)

**Files:**
- Create: `tests/crm-to-projects-journey.spec.js`

**Step 1: Write the failing test - Opportunity to Project conversion**

```javascript
import { test, expect } from '@playwright/test';

test.describe('CRM-to-Projects Complete Journey', () => {
  test('should convert closed-won opportunity to project and manage tasks', async ({ page }) => {
    // Part 1: Create opportunity (assuming exists from Phase 1)
    await page.goto('/apps/crm/opportunities');

    // Select existing opportunity
    await page.getByText('Security System Install - Acme Corp').click();
    await expect(page).toHaveURL(/\/apps\/crm\/opportunities\/opp_/);

    // Mark as Closed Won
    await page.getByRole('button', { name: 'Mark as Won' }).click();
    await expect(page.getByText('Stage: Closed Won')).toBeVisible();

    // Part 2: Convert to Project
    await page.getByRole('button', { name: 'Convert to Project' }).click();

    // Fill project form
    await page.getByLabel('Project Number').fill('PROJ-001');
    await page.getByLabel('Start Date').fill('2026-02-01');
    await page.getByLabel('Planned End Date').fill('2026-05-01');
    await page.getByLabel('Project Type').selectOption('new_construction');
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Verify project created and data carried over
    await expect(page).toHaveURL(/\/desks\/projects\/[a-z0-9-]+/);
    await expect(page.getByText('Security System Install - Acme Corp')).toBeVisible();
    await expect(page.getByText('PROJ-001')).toBeVisible();
    await expect(page.getByText('Contract Amount: $150,000')).toBeVisible();

    // Part 3: Add project phase
    await page.getByRole('button', { name: 'Add Phase' }).click();
    await page.getByLabel('Phase Name').fill('Design & Planning');
    await page.getByLabel('Planned Start').fill('2026-02-01');
    await page.getByLabel('Planned End').fill('2026-02-15');
    await page.getByRole('button', { name: 'Save Phase' }).click();

    await expect(page.getByText('Design & Planning')).toBeVisible();

    // Part 4: Add tasks to phase
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByLabel('Task Title').fill('Create system design drawings');
    await page.getByLabel('Assigned To').selectOption('john-smith');
    await page.getByLabel('Estimated Hours').fill('40');
    await page.getByRole('button', { name: 'Save Task' }).click();

    await expect(page.getByText('Create system design drawings')).toBeVisible();

    // Part 5: Navigate to Gantt view
    await page.getByRole('link', { name: 'Gantt Chart' }).click();
    await expect(page).toHaveURL(/\/desks\/projects\/gantt/);

    // Verify task appears in Gantt
    await expect(page.getByText('Create system design drawings')).toBeVisible();
    await expect(page.getByText('Design & Planning')).toBeVisible();

    // Part 6: Navigate to Kanban view
    await page.getByRole('link', { name: 'Kanban Board' }).click();
    await expect(page).toHaveURL(/\/desks\/projects\/kanban/);

    // Verify task appears in To Do column
    await expect(page.getByText('Create system design drawings')).toBeVisible();

    // Move task to In Progress
    await page.getByText('Create system design drawings').dragTo(page.getByText('In Progress'));
    await expect(page.getByText('Status: In Progress')).toBeVisible();

    // Part 7: Navigate back to opportunity
    await page.getByRole('link', { name: 'CRM Desk' }).click();
    await page.getByRole('link', { name: 'Opportunities' }).click();
    await page.getByText('Security System Install - Acme Corp').click();

    // Verify project link on opportunity
    await expect(page.getByText('Project: PROJ-001')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Project' })).toBeVisible();
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/crm-to-projects-journey-${Date.now()}.png`,
      fullPage: true
    });
  }
});
```

**Step 2: Run test to verify it fails**

```bash
npx playwright test tests/crm-to-projects-journey.spec.js --headed
```

Expected: FAIL - Components not yet integrated

**Step 3: Fix integration issues as components are built**

This test will guide integration development:
- Verify opportunity → project data carryover
- Verify project appears in Gantt/Kanban views
- Verify bidirectional links (opportunity ↔ project)

**Step 4: Run test until it passes**

```bash
npx playwright test tests/crm-to-projects-journey.spec.js
```

Expected: PASS when Phase 2.3 Gantt/Kanban complete

**Step 5: Commit**

```bash
git add tests/crm-to-projects-journey.spec.js
git commit -m "test: add CRM-to-Projects complete user journey test

- Covers opportunity conversion to project
- Verifies data carryover (amount, account, name)
- Tests phase and task creation
- Verifies Gantt and Kanban integration
- Includes screenshot capture on failure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Phase 2.3: Projects Desk - Gantt, Budget, AIA Billing (Weeks 5-6)

_[Continue with detailed task breakdowns for Gantt chart implementation, budget tracking, and AIA billing features]_

---

## Phase 2.4: Service Desk - Tickets & SLA Management (Weeks 7-8)

### Goals
- Build service ticket creation and management interface
- Implement SLA policy engine with deadline calculations
- Create ticket assignment and workflow
- Build ticket lifecycle (open → assigned → in_progress → resolved → closed)
- Add time logging and work notes functionality

### User Journey Test: Service Desk Operations

#### Task: Create Service Desk User Journey Tests

**Goal:** Verify service ticket lifecycle and SLA enforcement.

**Files:**
- Create: `tests/service-ticket-lifecycle.spec.js`
- Create: `tests/service-sla-enforcement.spec.js`

**Test 1: Service Ticket Lifecycle**

```javascript
import { test, expect } from '@playwright/test';

test.describe('Service Ticket Lifecycle', () => {
  test('should create, assign, work, and resolve service ticket', async ({ page }) => {
    // Navigate to Service Desk
    await page.goto('/desks/service/tickets');

    // Create new ticket
    await page.getByRole('button', { name: 'New Ticket' }).click();
    await page.getByLabel('Title').fill('Camera 5 offline');
    await page.getByLabel('Description').fill('Camera on floor 2 stopped recording');
    await page.getByLabel('Priority').selectOption('high');
    await page.getByLabel('Account').selectOption('acme-corp');
    await page.getByLabel('Service Agreement').selectOption('agreement-001');
    await page.getByRole('button', { name: 'Create Ticket' }).click();

    // Verify ticket created with SLA
    await expect(page).toHaveURL(/\/desks\/service\/tickets\/tick_/);
    await expect(page.getByText('Camera 5 offline')).toBeVisible();
    await expect(page.getByText('Status: Open')).toBeVisible();
    await expect(page.getByText(/Response Due:/)).toBeVisible();
    await expect(page.getByText(/Resolution Due:/)).toBeVisible();

    // Assign ticket
    await page.getByRole('button', { name: 'Assign' }).click();
    await page.getByLabel('Assign To').selectOption('tech-jane');
    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByText('Status: Assigned')).toBeVisible();
    await expect(page.getByText('Assigned to: Jane Smith')).toBeVisible();

    // Add work note
    await page.getByRole('button', { name: 'Add Note' }).click();
    await page.getByLabel('Note').fill('Checked power supply, replaced cable');
    await page.getByLabel('Time Spent (hours)').fill('1.5');
    await page.getByRole('button', { name: 'Save Note' }).click();

    await expect(page.getByText('Checked power supply, replaced cable')).toBeVisible();
    await expect(page.getByText('1.5 hours logged')).toBeVisible();

    // Mark in progress
    await page.getByRole('button', { name: 'Update Status' }).click();
    await page.getByLabel('Status').selectOption('in_progress');
    await page.getByRole('button', { name: 'Update' }).click();

    await expect(page.getByText('Status: In Progress')).toBeVisible();

    // Resolve ticket
    await page.getByRole('button', { name: 'Resolve' }).click();
    await page.getByLabel('Resolution Notes').fill('Replaced faulty cable. Camera back online.');
    await page.getByRole('button', { name: 'Mark Resolved' }).click();

    await expect(page.getByText('Status: Resolved')).toBeVisible();
    await expect(page.getByText('Replaced faulty cable')).toBeVisible();

    // Close ticket
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByText('Status: Closed')).toBeVisible();

    // Verify time logged
    await expect(page.getByText('Total Time: 1.5 hours')).toBeVisible();
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/service-ticket-lifecycle-${Date.now()}.png`,
      fullPage: true
    });
  }
});
```

**Test 2: SLA Enforcement**

```javascript
test.describe('SLA Enforcement', () => {
  test('should calculate SLA deadlines correctly based on priority', async ({ page }) => {
    // Test urgent priority (1 hour response, 4 hours resolution)
    await page.goto('/desks/service/tickets');
    await page.getByRole('button', { name: 'New Ticket' }).click();
    await page.getByLabel('Priority').selectOption('urgent');
    await page.getByLabel('Title').fill('System down');
    await page.getByLabel('Account').selectOption('acme-corp');
    await page.getByRole('button', { name: 'Create Ticket' }).click();

    // Verify SLA deadlines calculated
    const responseDeadline = await page.getByText(/Response Due: .*/).textContent();
    const resolutionDeadline = await page.getByText(/Resolution Due: .*/).textContent();

    expect(responseDeadline).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);
    expect(resolutionDeadline).toMatch(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/);

    // TODO: Verify deadlines are 1 hour and 4 hours from creation
  });

  test('should show SLA breach warnings', async ({ page }) => {
    // Navigate to overdue ticket (mock data)
    await page.goto('/desks/service/tickets/tick_overdue_001');

    // Verify breach indicators
    await expect(page.getByText('SLA BREACH')).toBeVisible();
    await expect(page.getByText(/Response deadline missed/)).toBeVisible();
    await expect(page.locator('.sla-breach-indicator')).toHaveCSS('color', 'rgb(211, 47, 47)'); // Red warning
  });
});
```

**Commit:**

```bash
git add tests/service-ticket-lifecycle.spec.js tests/service-sla-enforcement.spec.js
git commit -m "test: add Service Desk user journey tests

- Service ticket complete lifecycle test
- SLA deadline calculation verification
- SLA breach warning tests
- Covers create → assign → work → resolve → close flow

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

_[Continue with detailed task breakdowns for service ticket implementation]_

---

## Phase 2.5: Service Desk - Recurring Service & Warranty (Weeks 9-10)

_[Continue with detailed task breakdowns for service agreements, maintenance schedules, warranty tracking]_

---

## Phase 2.6: Integration Bridges & Testing (Weeks 11-12)

### Goals
- Complete Project → Service Agreement bridge
- Comprehensive E2E testing across all Phase 2 features
- Performance optimization
- Documentation

### Critical Integration: Project Closeout → Service Agreement

**When a project is marked complete:**
1. Generate suggested service agreement from project data
2. Carry over installed equipment list
3. Create initial maintenance schedule
4. Set warranty periods automatically
5. Transfer project site info to service agreement

### Complete Lifecycle E2E Test Implementation

**Goal:** Verify the complete digital thread from first contact through ongoing service.

**Files:**
- Create: `tests/complete-lifecycle-journey.spec.js`
- Create: `tests/projects-mobile-responsiveness.spec.js`
- Create: `tests/service-mobile-responsiveness.spec.js`
- Create: `tests/performance/lighthouse-phase2.js`
- Create: `docs/PHASE2-TESTING-REPORT.md`

#### Task: Create Complete Lifecycle Journey Test

**This is the master integration test that ties Phase 1 (CRM) + Phase 2 (Projects + Service) together.**

```javascript
import { test, expect } from '@playwright/test';

test.describe('Complete Lifecycle: Lead to Service Ticket', () => {
  test('should flow from lead through project to service ticket resolution', async ({ page }) => {
    // ========================================
    // PART 1: CRM DESK (from Phase 1)
    // ========================================

    // Step 1: Create lead
    await page.goto('/apps/crm/leads');
    await page.getByRole('button', { name: 'Add Lead' }).click();
    await page.getByLabel('First Name').fill('Sarah');
    await page.getByLabel('Last Name').fill('Johnson');
    await page.getByLabel('Company').fill('SecureBuildings Inc');
    await page.getByLabel('Email').fill('sarah.johnson@securebuildings.com');
    await page.getByLabel('Phone').fill('555-9876');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Sarah Johnson')).toBeVisible();

    // Step 2: Qualify lead
    await page.getByRole('link', { name: 'Sarah Johnson' }).click();
    await page.getByRole('combobox', { name: 'Status' }).selectOption('qualified');

    // Step 3: Convert to opportunity
    await page.getByRole('button', { name: 'Convert to Opportunity' }).click();
    await page.getByLabel('Opportunity Name').fill('SecureBuildings Inc - Access Control');
    await page.getByLabel('Value').fill('250000');
    await page.getByLabel('Expected Close Date').fill('2026-03-15');
    await page.getByRole('button', { name: 'Convert' }).click();

    await expect(page.getByText('SecureBuildings Inc - Access Control')).toBeVisible();

    // Step 4: Create proposal
    await page.getByRole('button', { name: 'Create Proposal' }).click();
    await page.getByRole('button', { name: 'Add Row' }).click();
    await page.getByLabel('Description').fill('Access control system installation');
    await page.getByLabel('Quantity').fill('1');
    await page.getByLabel('Unit Price').fill('250000');
    await page.getByRole('button', { name: 'Save as Draft' }).click();

    // Step 5: Send and accept proposal
    await page.getByRole('button', { name: 'Send Proposal' }).click();
    await page.getByRole('button', { name: 'Mark as Accepted' }).click();

    // Step 6: Mark opportunity as Closed Won
    await page.getByRole('link', { name: 'SecureBuildings Inc - Access Control' }).click();
    await page.getByRole('button', { name: 'Mark as Won' }).click();

    // ========================================
    // PART 2: PROJECTS DESK (Phase 2.2-2.3)
    // ========================================

    // Step 7: Convert opportunity to project
    await page.getByRole('button', { name: 'Convert to Project' }).click();
    await page.getByLabel('Project Number').fill('PROJ-SB-2026-001');
    await page.getByLabel('Start Date').fill('2026-04-01');
    await page.getByLabel('Planned End Date').fill('2026-06-30');
    await page.getByLabel('Project Type').selectOption('new_construction');
    await page.getByRole('button', { name: 'Create Project' }).click();

    await expect(page).toHaveURL(/\/desks\/projects\/[a-z0-9-]+/);
    await expect(page.getByText('PROJ-SB-2026-001')).toBeVisible();

    // Step 8: Add project phase
    await page.getByRole('button', { name: 'Add Phase' }).click();
    await page.getByLabel('Phase Name').fill('Installation');
    await page.getByLabel('Planned Start').fill('2026-04-15');
    await page.getByLabel('Planned End').fill('2026-05-30');
    await page.getByRole('button', { name: 'Save Phase' }).click();

    // Step 9: Add tasks
    await page.getByRole('button', { name: 'Add Task' }).click();
    await page.getByLabel('Task Title').fill('Install door controllers');
    await page.getByLabel('Estimated Hours').fill('80');
    await page.getByRole('button', { name: 'Save Task' }).click();

    // Step 10: Log labor
    await page.getByRole('tab', { name: 'Labor' }).click();
    await page.getByRole('button', { name: 'Log Time' }).click();
    await page.getByLabel('Date').fill('2026-04-20');
    await page.getByLabel('Hours').fill('8');
    await page.getByLabel('Description').fill('Installed 10 door controllers');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('8 hours logged')).toBeVisible();

    // Step 11: Complete project
    await page.getByRole('button', { name: 'Complete Project' }).click();
    await page.getByRole('button', { name: 'Confirm Completion' }).click();

    await expect(page.getByText('Status: Completed')).toBeVisible();

    // ========================================
    // PART 3: SERVICE DESK (Phase 2.4-2.5)
    // ========================================

    // Step 12: Convert project to service agreement
    await page.getByRole('button', { name: 'Create Service Agreement' }).click();
    await page.getByLabel('Agreement Number').fill('SVC-SB-2026-001');
    await page.getByLabel('Agreement Type').selectOption('recurring_maintenance');
    await page.getByLabel('Start Date').fill('2026-07-01');
    await page.getByLabel('Billing Frequency').selectOption('quarterly');
    await page.getByLabel('Monthly Fee').fill('2500');
    await page.getByLabel('Included Hours').fill('8');
    await page.getByRole('button', { name: 'Create Agreement' }).click();

    await expect(page).toHaveURL(/\/desks\/service\/agreements\/[a-z0-9-]+/);
    await expect(page.getByText('SVC-SB-2026-001')).toBeVisible();

    // Step 13: Create service ticket
    await page.getByRole('button', { name: 'New Ticket' }).click();
    await page.getByLabel('Title').fill('Door 3 controller not responding');
    await page.getByLabel('Description').fill('Badge reader on door 3 unresponsive');
    await page.getByLabel('Priority').selectOption('high');
    await page.getByRole('button', { name: 'Create Ticket' }).click();

    await expect(page).toHaveURL(/\/desks\/service\/tickets\/tick_/);
    await expect(page.getByText('Door 3 controller not responding')).toBeVisible();

    // Step 14: Assign and work ticket
    await page.getByRole('button', { name: 'Assign' }).click();
    await page.getByLabel('Assign To').selectOption('tech-mike');
    await page.getByRole('button', { name: 'Confirm' }).click();

    await page.getByRole('button', { name: 'Add Note' }).click();
    await page.getByLabel('Note').fill('Replaced controller, tested all badges');
    await page.getByLabel('Time Spent (hours)').fill('2');
    await page.getByRole('button', { name: 'Save Note' }).click();

    // Step 15: Resolve ticket
    await page.getByRole('button', { name: 'Resolve' }).click();
    await page.getByLabel('Resolution Notes').fill('Controller replaced, system operational');
    await page.getByRole('button', { name: 'Mark Resolved' }).click();

    await expect(page.getByText('Status: Resolved')).toBeVisible();

    // Step 16: Verify SLA compliance
    await expect(page.getByText('SLA: Met')).toBeVisible();
    await expect(page.getByText(/Resolved in \d+ hours/)).toBeVisible();

    // ========================================
    // VERIFICATION: Digital Thread Intact
    // ========================================

    // Navigate to account to verify complete history
    await page.getByRole('link', { name: 'CRM Desk' }).click();
    await page.getByRole('link', { name: 'Accounts' }).click();
    await page.getByText('SecureBuildings Inc').click();

    // Verify all entities linked
    await expect(page.getByText('Lead: Sarah Johnson')).toBeVisible();
    await expect(page.getByText('Opportunity: SecureBuildings Inc - Access Control')).toBeVisible();
    await expect(page.getByText('Proposal: PROP-2026-')).toBeVisible();
    await expect(page.getByText('Project: PROJ-SB-2026-001')).toBeVisible();
    await expect(page.getByText('Service Agreement: SVC-SB-2026-001')).toBeVisible();
    await expect(page.getByText('Service Ticket: Door 3 controller')).toBeVisible();

    // Verify Digital Thread timeline shows all activities
    await page.getByRole('tab', { name: 'Timeline' }).click();
    await expect(page.getByText('Lead created')).toBeVisible();
    await expect(page.getByText('Converted to opportunity')).toBeVisible();
    await expect(page.getByText('Proposal accepted')).toBeVisible();
    await expect(page.getByText('Project started')).toBeVisible();
    await expect(page.getByText('Project completed')).toBeVisible();
    await expect(page.getByText('Service agreement created')).toBeVisible();
    await expect(page.getByText('Service ticket resolved')).toBeVisible();
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/complete-lifecycle-${Date.now()}.png`,
      fullPage: true
    });
  }
});
```

**This test verifies:**
- ✅ Data flows correctly across all 3 desks (CRM → Projects → Service)
- ✅ All conversion bridges work (Opportunity → Project, Project → Service Agreement)
- ✅ Digital Thread timeline captures all activities
- ✅ No orphaned records or broken links
- ✅ SLA tracking works correctly
- ✅ Complete customer journey from first contact to ongoing support

#### Task: Mobile Responsiveness Tests for Phase 2

```javascript
// tests/projects-mobile-responsiveness.spec.js
import { test, expect, devices } from '@playwright/test';

const breakpoints = [
  { name: 'Mobile', device: devices['iPhone 13'] },
  { name: 'Tablet', device: devices['iPad Pro'] },
  { name: 'Desktop', viewport: { width: 1920, height: 1080 } }
];

test.describe('Projects Desk Mobile Responsiveness', () => {
  for (const bp of breakpoints) {
    test.describe(`${bp.name} viewport`, () => {
      test.use(bp.device || { viewport: bp.viewport });

      test('Project dashboard is responsive', async ({ page }) => {
        await page.goto('/desks/projects');
        await expect(page.getByRole('heading', { name: 'Projects Dashboard' })).toBeVisible();
        await expect(page.getByText('Active Projects')).toBeVisible();

        await page.screenshot({
          path: `test-results/projects-dashboard-${bp.name.toLowerCase()}.png`,
          fullPage: true
        });
      });

      test('Gantt chart is responsive', async ({ page }) => {
        await page.goto('/desks/projects/gantt');
        await expect(page.getByRole('heading', { name: 'Gantt Chart' })).toBeVisible();

        // Mobile: Horizontal scroll expected
        if (bp.name === 'Mobile') {
          await expect(page.locator('.gantt-container')).toHaveCSS('overflow-x', 'auto');
        }

        await page.screenshot({
          path: `test-results/projects-gantt-${bp.name.toLowerCase()}.png`,
          fullPage: true
        });
      });

      test('Project detail page is responsive', async ({ page }) => {
        await page.goto('/desks/projects');
        await page.getByText(/PROJ-/).first().click();

        // Verify tabs accessible
        await expect(page.getByRole('tab', { name: 'Overview' })).toBeVisible();

        await page.screenshot({
          path: `test-results/project-detail-${bp.name.toLowerCase()}.png`,
          fullPage: true
        });
      });
    });
  }
});
```

```javascript
// tests/service-mobile-responsiveness.spec.js
test.describe('Service Desk Mobile Responsiveness', () => {
  for (const bp of breakpoints) {
    test.describe(`${bp.name} viewport`, () => {
      test.use(bp.device || { viewport: bp.viewport });

      test('Service tickets list is responsive', async ({ page }) => {
        await page.goto('/desks/service/tickets');
        await expect(page.getByRole('heading', { name: 'Service Tickets' })).toBeVisible();

        await page.screenshot({
          path: `test-results/service-tickets-${bp.name.toLowerCase()}.png`,
          fullPage: true
        });
      });

      test('Ticket detail page is responsive', async ({ page }) => {
        await page.goto('/desks/service/tickets');
        await page.getByText(/TICK-/).first().click();

        await expect(page.getByText('Status:')).toBeVisible();
        await expect(page.getByText('Priority:')).toBeVisible();

        await page.screenshot({
          path: `test-results/ticket-detail-${bp.name.toLowerCase()}.png`,
          fullPage: true
        });
      });
    });
  }
});
```

#### Task: Performance Benchmarks for Phase 2

```javascript
// tests/performance/lighthouse-phase2.js
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';

const pages = [
  // Projects Desk
  { name: 'Projects Dashboard', url: 'http://localhost:4000/desks/projects' },
  { name: 'Projects Gantt', url: 'http://localhost:4000/desks/projects/gantt' },
  { name: 'Projects Kanban', url: 'http://localhost:4000/desks/projects/kanban' },
  { name: 'Project Detail', url: 'http://localhost:4000/desks/projects/proj_001' },

  // Service Desk
  { name: 'Service Dashboard', url: 'http://localhost:4000/desks/service' },
  { name: 'Service Tickets', url: 'http://localhost:4000/desks/service/tickets' },
  { name: 'Ticket Detail', url: 'http://localhost:4000/desks/service/tickets/tick_001' },
  { name: 'Service Agreements', url: 'http://localhost:4000/desks/service/agreements' },
];

async function runLighthouse(url, name) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  // Save report
  const reportHtml = runnerResult.report;
  fs.writeFileSync(`test-results/lighthouse-${name.replace(/\s/g, '-').toLowerCase()}.html`, reportHtml);

  await chrome.kill();

  return {
    name,
    url,
    performance: runnerResult.lhr.categories.performance.score * 100,
    accessibility: runnerResult.lhr.categories.accessibility.score * 100,
    bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
    fcp: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
    lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
    tbt: runnerResult.lhr.audits['total-blocking-time'].numericValue,
  };
}

async function auditAll() {
  console.log('Starting Lighthouse audits for Phase 2...');
  console.log('Ensure dev server is running on http://localhost:4000\n');

  const results = [];

  for (const page of pages) {
    console.log(`Auditing: ${page.name}...`);
    const result = await runLighthouse(page.url, page.name);
    results.push(result);
    console.log(`  Performance: ${result.performance.toFixed(0)}`);
    console.log(`  Accessibility: ${result.accessibility.toFixed(0)}`);
    console.log(`  Best Practices: ${result.bestPractices.toFixed(0)}`);
    console.log(`  FCP: ${(result.fcp / 1000).toFixed(2)}s`);
    console.log(`  LCP: ${(result.lcp / 1000).toFixed(2)}s\n`);
  }

  // Write summary
  const summary = {
    timestamp: new Date().toISOString(),
    results,
    averages: {
      performance: results.reduce((sum, r) => sum + r.performance, 0) / results.length,
      accessibility: results.reduce((sum, r) => sum + r.accessibility, 0) / results.length,
      bestPractices: results.reduce((sum, r) => sum + r.bestPractices, 0) / results.length,
    }
  };

  fs.writeFileSync('test-results/lighthouse-phase2-summary.json', JSON.stringify(summary, null, 2));

  console.log('Audit complete! Summary:');
  console.log(`  Avg Performance: ${summary.averages.performance.toFixed(0)}`);
  console.log(`  Avg Accessibility: ${summary.averages.accessibility.toFixed(0)}`);
  console.log(`  Avg Best Practices: ${summary.averages.bestPractices.toFixed(0)}`);
}

auditAll().catch(console.error);
```

**Performance Targets for Phase 2:**
- Projects Gantt: Performance ≥ 85 (acceptable for complex chart rendering)
- All other pages: Performance ≥ 90
- FCP < 1.5s, LCP < 2.5s, TBT < 300ms

---

## Success Criteria for Phase 2

**Functionality:**
- [ ] Opportunities convert to projects seamlessly
- [ ] Projects tracked with Gantt charts and Kanban boards
- [ ] Budget tracking with labor/material costs
- [ ] AIA G702/G703 billing generation functional
- [ ] Service tickets created and tracked
- [ ] SLA policies enforced with deadline calculations
- [ ] Recurring maintenance scheduled automatically
- [ ] Warranties tracked with expiration alerts
- [ ] Projects convert to service agreements on completion

**Quality:**
- [ ] All E2E tests passing
- [ ] Multi-tenant isolation verified (RLS)
- [ ] Mobile responsive across all pages
- [ ] Performance targets met
- [ ] No critical bugs

**Documentation:**
- [ ] Projects Desk user guide
- [ ] Service Desk user guide
- [ ] Integration bridge documentation
- [ ] Database schema documentation updated
- [ ] API documentation (if exposing APIs)

---

## User Journey Testing Best Practices

### Pattern Reference: Phase 1.8

All user journey tests in Phase 2 should follow the patterns established in Phase 1.8 Testing & Polish.

**Key reference files:**
- `docs/plans/2026-01-29-phase1.8-testing-polish.md` - Complete testing strategy
- `tests/crm-lead-to-proposal-flow.spec.js` - Example E2E journey test
- `tests/crm-mobile-responsiveness.spec.js` - Mobile testing pattern
- `docs/SECURITY-AUDIT.md` - Security testing checklist

### When to Write User Journey Tests

**Write journey tests when:**
1. A new integration bridge is created (e.g., Opportunity → Project)
2. A complete user workflow spans multiple pages/components
3. Data flows across multiple database tables
4. Testing requires verifying state changes over time

**Don't write journey tests for:**
- Single component interactions (use component tests)
- Unit logic (use unit tests)
- Isolated CRUD operations (use API tests)

### Test Structure Template

```javascript
import { test, expect } from '@playwright/test';

test.describe('[Feature] Complete Journey', () => {
  test('should [complete user goal]', async ({ page }) => {
    // Part 1: Setup / Navigate
    await page.goto('/starting-page');

    // Part 2: User Actions (step by step)
    await page.getByRole('button', { name: 'Action' }).click();
    await page.getByLabel('Field').fill('Value');

    // Part 3: Verification
    await expect(page.getByText('Expected Result')).toBeVisible();
    await expect(page).toHaveURL(/expected-url-pattern/);

    // Part 4: Cross-entity verification (if applicable)
    // Navigate to related entity and verify bidirectional links
  });
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    await page.screenshot({
      path: `test-results/${testInfo.title}-${Date.now()}.png`,
      fullPage: true
    });
  }
});
```

### Using `.skip()` for Dependencies

Mark tests as skipped when dependencies are not ready:

```javascript
test.skip('Project conversion requires Phase 2.2 complete', async ({ page }) => {
  // Test implementation here
});
```

**When to use `.skip()`:**
- Authentication/multi-tenancy features not yet implemented
- Database tables/schemas not yet created
- Integration bridges not yet built
- External dependencies (APIs, services) not available

**Document skipped tests:**
- Add TODO comments explaining what's needed
- Update test status document (e.g., `tests/PHASE2-TESTING-STATUS.md`)
- Link to blocking phase/task

### Screenshot and Evidence Requirements

**Required screenshots:**
1. On test failure (automatic via `afterEach` hook)
2. For manual review (mobile responsiveness, visual regression)
3. For documentation (user guides, as-builts)

**Evidence to capture:**
- Test output showing all tests passing
- Build output showing exit code 0
- Lighthouse performance reports (HTML + JSON)
- Security audit results
- Mobile responsiveness screenshots (all breakpoints)

### Testing Checklist for Each Phase

Before marking a phase complete:

- [ ] All user journey tests written and passing
- [ ] Mobile responsiveness verified (3 breakpoints minimum)
- [ ] Performance benchmarks meet targets
- [ ] Security audit complete (input validation + RLS)
- [ ] Multi-tenant isolation verified (if Phase 1.2 complete)
- [ ] Screenshots captured and reviewed
- [ ] Testing status document updated
- [ ] All verification evidence committed to git

### Integration with Phase Documentation

**Update these documents after testing:**
1. Phase execution document (`_sys_documents/execution/phase-X.Y-*.md`)
   - Add "Testing Evidence" section
   - Link to test files
   - Include pass/fail metrics

2. INDEX (`_sys_documents/execution/INDEX-crm-desk-mvp.md`)
   - Update phase status
   - Document test coverage
   - Note any blockers for skipped tests

3. Testing status document (`tests/PHASE2-TESTING-STATUS.md`)
   - Summary of all tests
   - Pass/fail breakdown
   - Pending tests and blockers

### Continuous Testing During Development

**Don't wait until phase end to write tests!**

**Best practice:**
1. Write journey test FIRST (TDD approach)
2. Test will fail initially (expected)
3. Implement features to make test pass
4. Test guides integration work
5. Test passes when integration complete

This approach:
- ✅ Catches integration issues early
- ✅ Provides clear acceptance criteria
- ✅ Documents expected behavior
- ✅ Prevents rework

### Running Tests

**Local development:**
```bash
# Run all Phase 2 tests
npx playwright test tests/crm-to-projects*.spec.js tests/service*.spec.js tests/complete-lifecycle*.spec.js

# Run specific journey test with UI
npx playwright test tests/complete-lifecycle-journey.spec.js --headed

# Run mobile tests
npx playwright test tests/projects-mobile-responsiveness.spec.js tests/service-mobile-responsiveness.spec.js
```

**Performance audits:**
```bash
# Start dev server
npm run dev &

# Run Lighthouse
node tests/performance/lighthouse-phase2.js

# Stop dev server
pkill -f "next dev"
```

**Before committing:**
```bash
# Run all tests
npm test

# Build verification
npm run build

# Lint
npm run lint
```

---

## Execution Handoff

Plan complete and saved to `docs/plans/2026-01-29-phase2-core-operations.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
