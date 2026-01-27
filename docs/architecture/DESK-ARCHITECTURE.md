# Desk Architecture

## Overview

PierceDesk is built around a **Desk-First Architecture** - a unified platform organized into 8 operational "desks," each representing a major functional area of a physical security integration business. This architecture eliminates data silos and enables the **Digital Thread** - a continuous, unbroken chain of data from first client contact through decades of service.

## Core Principles

### 1. Desk-First Organization

Each **desk** is a self-contained operational area with:

- Dedicated dashboard showing key metrics
- Specialized workflows and tools
- Desk-specific data entities
- Cross-desk integration points

**Benefits:**

- Clear separation of concerns
- Intuitive navigation for users
- Parallel development of features
- Scalable architecture

### 2. Digital Thread

Every interaction, transaction, and data point is captured and linked, creating an unbroken chain:

```
Lead → Opportunity → Proposal → Project → Installation → Service → Renewal
  ↓        ↓            ↓          ↓           ↓           ↓         ↓
[Activity Timeline - The Digital Thread]
```

**Key characteristics:**

- **Continuous**: No gaps in the data chain
- **Contextualized**: Every data point has full history
- **Accessible**: Historical data readily available
- **Actionable**: Insights derived from complete picture

### 3. Polymorphic Relationships

Real-world complexity is modeled accurately:

- Contacts can be associated with multiple accounts
- Projects can span multiple properties
- Devices can be relocated between sites
- Service agreements can cover multiple systems

**Implementation:**

- Junction tables for many-to-many relationships
- Role designation (primary, billing, technical, decision-maker)
- Relationship metadata (start date, end date, notes)

## The 8 Core Desks

### 1. CRM Desk 📞

**Purpose**: Manage customer relationships from first contact through closed deals

**Key Features:**

- Lead capture and qualification
- Opportunity pipeline management
- Proposal generation and tracking
- Account and contact management
- Sales forecasting and reporting

**Primary Entities:**

- Leads
- Opportunities
- Proposals
- Accounts
- Contacts
- Activities

**Integration Points:**

- Feeds Projects Desk (won opportunities → projects)
- Provides customer data to all desks

---

### 2. HRM Desk 👥

**Purpose**: Manage workforce, skills, and human capital

**Key Features:**

- Employee management
- Team organization and roles
- Skills and certification tracking
- Time and attendance
- Onboarding/offboarding workflows

**Primary Entities:**

- Employees
- Teams
- Skills/Certifications
- Time entries
- Roles/Permissions

**Integration Points:**

- Provides workforce data to Dispatch Desk
- Skills matching for project staffing
- Time data for Business Desk (payroll)

---

### 3. Projects Desk 📋

**Purpose**: Manage installation projects from kickoff to completion

**Key Features:**

- Project planning and scheduling
- Gantt charts and dependencies
- Kanban boards for task management
- Budget and cost tracking
- AIA (G702/G703) progress billing

**Primary Entities:**

- Projects
- Tasks
- Milestones
- Budgets
- Progress billing applications

**Integration Points:**

- Created from CRM Desk opportunities
- Consumes Inventory Desk materials
- Feeds Service Desk (completed projects → service agreements)
- Generates invoices in Business Desk

---

### 4. Service Desk 🔧

**Purpose**: Manage ongoing service, maintenance, and support

**Key Features:**

- Service ticket management
- SLA tracking and compliance
- Recurring maintenance schedules
- Warranty tracking
- Service history and reporting

**Primary Entities:**

- Tickets
- Service agreements
- SLAs
- Warranties
- Service reports

**Integration Points:**

- Receives completed projects from Projects Desk
- Creates work orders for Dispatch Desk
- Tracks devices for warranty status
- Generates recurring invoices in Business Desk

---

### 5. Dispatch Desk 🚚

**Purpose**: Schedule and route field technicians efficiently

**Key Features:**

- Visual schedule board
- Map-based routing (Mapbox integration)
- Technician status tracking
- Geofence-based time tracking
- Client notifications (Twilio)

**Primary Entities:**

- Work orders
- Schedules
- Routes
- Time logs
- Client notifications

**Integration Points:**

- Receives work orders from Service Desk
- Consumes HRM Desk workforce data
- Uses Assets Desk vehicle/tool data
- Tracks inventory usage (Inventory Desk)

---

### 6. Assets Desk 🚗

**Purpose**: Manage company vehicles, tools, and equipment

**Key Features:**

- Vehicle fleet management
- Tool and equipment tracking
- GPS tracking and telematics
- Maintenance scheduling
- Inspection logs

**Primary Entities:**

- Vehicles
- Tools/Equipment
- Maintenance records
- Inspections
- GPS locations

**Integration Points:**

- Provides vehicle data to Dispatch Desk
- Tracks tool/equipment checkout
- Maintenance costs to Business Desk

---

### 7. Inventory Desk 📦

**Purpose**: Manage materials, parts, and inventory across locations

**Key Features:**

- Multi-warehouse tracking
- Vehicle inventory sync
- Receiving and check-out
- QR/barcode scanning
- Automated reorder management

**Primary Entities:**

- Products/Parts
- Warehouses
- Stock levels
- Transfers
- Purchase orders

**Integration Points:**

- Supplies materials for Projects Desk
- Tracks parts used in Service Desk tickets
- Syncs with vehicle inventory (Assets Desk)
- Purchase orders to Business Desk

---

### 8. Business Desk 💼

**Purpose**: Financial management and business intelligence

**Key Features:**

- Invoicing and billing
- Revenue tracking
- P&L analysis
- AIA billing (construction projects)
- Retainage management
- QuickBooks integration
- Cash flow forecasting

**Primary Entities:**

- Invoices
- Payments
- Expenses
- Financial reports
- Budget vs. Actual

**Integration Points:**

- Receives billing data from all desks
- QuickBooks sync (external)
- Financial reporting across all operations

---

## Navigation Architecture

### Top-Level Structure

```
PierceDesk Navigation:
├── 🏠 Home (Dashboard landing)
│
├── DESKS (Main operational areas)
│   ├── 📞 CRM Desk
│   ├── 👥 HRM Desk
│   ├── 📋 Projects Desk
│   ├── 🔧 Service Desk
│   ├── 🚚 Dispatch Desk
│   ├── 🚗 Assets Desk
│   ├── 📦 Inventory Desk
│   └── 💼 Business Desk
│
├── ⚙️ Settings
│   ├── Account Settings
│   ├── User Management
│   ├── Organization Settings
│   └── Integrations
│
└── 📚 Aurora Reference (Collapsed)
    └── [Original template preserved]
```

### Desk Switcher

The sidebar navigation includes a prominent **Desk Switcher** at the top level:

- Visual icons for each desk
- Active desk indicator
- Collapsible desk-specific navigation
- Quick access to recent pages within each desk

### Within-Desk Navigation

Each desk follows a consistent pattern:

```
📞 CRM Desk
├── Dashboard (Overview metrics)
├── Primary entities (Leads, Opportunities, etc.)
├── Secondary views (Reports, Calendar, etc.)
└── Settings (Desk-specific configuration)
```

## Technical Architecture

### File Structure

```
src/
├── app/
│   └── (main)/
│       └── desks/              # All desk routes
│           ├── crm/
│           ├── hrm/
│           ├── projects/
│           ├── service/
│           ├── dispatch/
│           ├── assets/
│           ├── inventory/
│           └── business/
│
├── components/
│   ├── sections/
│   │   └── desks/              # Desk-specific UI components
│   │       ├── crm/
│   │       ├── hrm/
│   │       └── ...
│   └── ui/                     # Shared UI components
│
├── services/
│   └── swr/                    # Data fetching hooks
│       ├── crm/
│       ├── hrm/
│       └── ...
│
└── lib/
    └── supabase.js             # Supabase client
```

### Component Patterns

All desks follow Aurora template patterns:

```
Page Component (Next.js App Router):
src/app/(main)/desks/crm/leads/page.jsx
  ↓ imports
Section Component (UI logic):
src/components/sections/desks/crm/LeadsList.jsx
  ↓ uses
Data Hook (SWR):
src/services/swr/crm/useLeads.js
  ↓ fetches from
Supabase Database (cloud)
```

### Data Architecture

**Multi-tenant with Row-Level Security (RLS):**

- Every table has `org_id` (organization_id)
- RLS policies enforce data isolation
- No cross-organization data access
- Queries automatically scoped to current org

**Polymorphic relationships:**

```sql
-- Example: Activities can relate to any entity
CREATE TABLE activities (
  id UUID PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES organizations(id),
  related_to_type TEXT NOT NULL,  -- 'lead', 'opportunity', 'project', etc.
  related_to_id UUID NOT NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_activities_related
  ON activities(related_to_type, related_to_id);
```

## Cross-Desk Integration

### Data Flow Examples

#### Lead → Project → Service Flow

```
1. CRM Desk: Lead captured
2. CRM Desk: Lead qualified → Opportunity
3. CRM Desk: Proposal created and accepted
4. CRM Desk: Opportunity marked "Closed Won"
5. Projects Desk: Project created from opportunity
6. Projects Desk: Project tasks completed
7. Projects Desk: AIA billing applications submitted
8. Projects Desk: Project marked complete
9. Service Desk: Service agreement created
10. Service Desk: Recurring maintenance scheduled
11. Dispatch Desk: Work orders generated
```

All connected via Activity Timeline (Digital Thread).

#### Dispatch → Inventory → Business Flow

```
1. Service Desk: Ticket created
2. Dispatch Desk: Work order scheduled
3. Dispatch Desk: Technician assigned
4. Inventory Desk: Parts checked out to technician
5. Dispatch Desk: Work completed
6. Inventory Desk: Unused parts returned
7. Business Desk: Invoice generated with time + materials
```

### Bridge Tables

Cross-desk relationships use junction/bridge tables:

```sql
-- Opportunity → Project conversion tracking
CREATE TABLE opportunity_projects (
  opportunity_id UUID REFERENCES opportunities(id),
  project_id UUID REFERENCES projects(id),
  conversion_date TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (opportunity_id, project_id)
);

-- Project → Service agreement handoff
CREATE TABLE project_service_agreements (
  project_id UUID REFERENCES projects(id),
  service_agreement_id UUID REFERENCES service_agreements(id),
  handoff_date TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, service_agreement_id)
);
```

## Future: Drawer Architecture

**Post-MVP enhancement** - contextual drawers that overlay any desk view:

### Molecular Drawers

- **People Drawer**: Contacts, users, teams (context-aware)
- **Communications Drawer**: Emails, calls, messages
- **Files Drawer**: Documents, images, drawings
- **Events Drawer**: Calendar, reminders, scheduling

### Atomic Drawers

- **Products/Devices Drawer**: Device details, specs
- **Tickets Drawer**: Quick ticket view/edit
- **Orders Drawer**: Purchase orders, quotes
- **Invoices Drawer**: Invoice details
- **Drawings Drawer**: As-builts, schematics

**Technical pattern:**

```jsx
// Open drawer from anywhere
const { openDrawer } = useDrawer();

<Card onClick={() => openDrawer('people', { contactId: '123' })}>View Contact</Card>;

// Drawer renders alongside current page with context
```

## Scalability Considerations

### Performance

- **Lazy loading**: Desks load on demand
- **Code splitting**: Each desk is a separate bundle
- **SWR caching**: Efficient data fetching with deduplication
- **Database indexing**: Optimized queries with proper indexes

### Modularity

- **Independent development**: Desks can be developed in parallel
- **Feature flags**: New desks can be rolled out gradually
- **Version control**: Desk-specific branches for feature work

### Extensibility

- **Plugin architecture**: Future desks can be added
- **Custom workflows**: Desk-specific customizations
- **API-first**: All desk functionality exposed via API

## Migration from Aurora Template

### Preservation Strategy

- Aurora reference preserved in `src/app/(main)/apps/` and `src/app/(main)/dashboard/`
- Aurora navigation collapsed under "Aurora Reference"
- Components copied (not moved) to maintain reference
- Aurora patterns followed in all Pierce desk implementations

### Component Reuse

| Aurora Component     | Pierce Desk Use                   |
| -------------------- | --------------------------------- |
| `/apps/crm/*`        | CRM Desk foundation               |
| `/apps/kanban`       | Projects Desk task boards         |
| `/dashboard/project` | Projects Desk dashboard patterns  |
| `/apps/invoice`      | Business Desk invoicing           |
| `/apps/calendar`     | Multi-desk scheduling integration |

## Related Documentation

- [Database Architecture](DATABASE-ARCHITECTURE.md) - Multi-tenant schema design
- [Authentication Flow](AUTHENTICATION-FLOW.md) - Supabase auth implementation
- [API Design](API-DESIGN.md) - REST API patterns and conventions
- [Security Model](SECURITY-MODEL.md) - RLS, RBAC, encryption

---

**Document Status**: ✅ Complete
**Last Updated**: 2026-01-27
**Version**: 1.0
**Author**: Pierce Team
