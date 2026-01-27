# PierceDesk: Aurora Template Transformation Plan

## Executive Summary

Transform the Aurora React template into PierceDesk - a unified SaaS platform for physical security integrators. The transformation follows a **Desk-First Architecture** with 8 core operational desks, starting with **CRM Desk as MVP**.

**Key Decisions:**

- **MVP Focus:** CRM Desk only (leads, opportunities, proposals, accounts, contacts)
- **Navigation:** Top-level Desk Switcher in sidebar (clear desk separation)
- **Drawer Architecture:** Deferred to post-MVP (use traditional navigation initially)
- **Aurora Strategy:** Preserve existing template as reference, build Pierce features alongside

**Timeline:** 7-week MVP, 12-month full platform

---

## Vision Alignment

**PierceDesk Core Value Propositions:**

1. **Digital Thread:** Eliminate fragmentation - single platform from first contact through decades of service
2. **Client Ownership:** LiveSite Portal gives clients free, permanent access to property data
3. **Polymorphic Relationships:** Flexible data models that mirror real-world complexity
4. **AI Augmentation:** Three-phase AI (Passive → Assistive → Agentic) with full user control
5. **AIA Billing Automation:** G702/G703 progress billing from task completion data

**Target Users:**

- Business Owners (operational visibility, financial metrics)
- Property Owners (LiveSite Portal - free forever)
- Field Technicians (mobile-first, offline-capable, AI Tech Assist)

---

## Sitemap Architecture: The 8 Core Desks

### Desk Hierarchy Overview

```
PierceDesk Navigation:
├── 🏠 Home (dashboard landing)
├── 📞 CRM Desk ⭐ MVP
│   ├── Dashboard
│   ├── Leads
│   ├── Opportunities
│   ├── Proposals
│   ├── Accounts
│   ├── Contacts
│   └── Reports
├── 👥 HRM Desk (Phase 4)
│   ├── Dashboard
│   ├── Employees
│   ├── Teams & Roles
│   ├── Skills & Certifications
│   ├── Time & Attendance
│   └── Onboarding/Offboarding
├── 📋 Projects Desk (Phase 2)
│   ├── Dashboard
│   ├── Project List
│   ├── Gantt Chart
│   ├── Kanban Board
│   ├── Calendar View
│   ├── Budget & Costs
│   └── AIA Billing
├── 🔧 Service Desk (Phase 2)
│   ├── Dashboard
│   ├── Tickets
│   ├── Recurring Service
│   ├── SLA Management
│   ├── Warranty Tracking
│   └── Service Reports
├── 🚚 Dispatch Desk (Phase 3)
│   ├── Dashboard
│   ├── Schedule Board
│   ├── Map View (Mapbox)
│   ├── Tech Status
│   ├── Time Tracking
│   └── Client Notifications
├── 🚗 Assets Desk (Phase 4)
│   ├── Dashboard
│   ├── Vehicles
│   ├── Tools & Equipment
│   ├── Maintenance Schedule
│   ├── GPS Tracking
│   └── Inspection Logs
├── 📦 Inventory Desk (Phase 3)
│   ├── Dashboard
│   ├── Warehouses
│   ├── Vehicle Inventory
│   ├── Receiving
│   ├── Check-Out
│   ├── Reorder Management
│   └── Material Reports
├── 💼 Business Desk (Phase 4)
│   ├── Dashboard
│   ├── Invoicing
│   ├── Revenue Tracking
│   ├── P&L Analysis
│   ├── AIA Billing
│   ├── Retainage Management
│   ├── QuickBooks Sync
│   └── Cash Flow Forecasting
├── ⚙️ Settings
│   ├── Account Settings
│   ├── User Management
│   ├── Organization Settings
│   └── Integrations
└── 📚 Aurora Reference (collapsed - original template)
```

### Aurora Template Component Mapping

**Current Aurora Resources → PierceDesk Desks:**

| Aurora Component          | Pierce Destination               | Transformation                  |
| ------------------------- | -------------------------------- | ------------------------------- |
| `/dashboard/crm`          | CRM Desk Dashboard               | Direct adaptation               |
| `/apps/crm/*`             | CRM Desk features                | Copy & customize                |
| `/dashboard/project`      | Projects Desk Dashboard          | Adapt for construction projects |
| `/apps/kanban`            | Projects Desk Kanban             | Direct use                      |
| `/dashboard/hrm`          | HRM Desk Dashboard               | Extend for integrator needs     |
| `/apps/hiring`            | HRM Desk recruiting              | Integrate with employee mgmt    |
| `/dashboard/time-tracker` | HRM Desk time tracking           | Geofence automation later       |
| `/apps/invoice`           | Business Desk invoicing          | Add AIA billing                 |
| `/apps/ecommerce/admin`   | Inventory Desk patterns          | Repurpose for materials         |
| `/apps/calendar`          | Projects/Service scheduling      | Multi-desk integration          |
| `/apps/email`             | Communications Drawer (post-MVP) | Email pipeline                  |
| `/apps/file-manager`      | Files Drawer (post-MVP)          | Document management             |
| `/apps/chat`              | Communications Drawer (post-MVP) | In-app messaging                |

---

## MVP Transformation Roadmap (7 Weeks)

### Week 1: Foundation & Structure

**Goals:**

- Preserve Aurora template as reference
- Create new desk-based structure
- Update sitemap for desk navigation
- Set up database foundation

**Tasks:**

1. **Preserve Aurora Structure:**

   ```
   src/app/(main)/
   ├── dashboard/          ← Keep all existing
   ├── apps/               ← Keep all existing
   └── desks/              ← NEW: All Pierce desks here
       └── crm/            ← MVP focus
   ```

2. **Update Sitemap** (`src/routes/sitemap.js`):
   - Add new "Desks" section at top
   - Keep existing Aurora under "Aurora Reference" (collapsed)
   - Implement desk-level groupings
   - Add "Coming Soon" placeholders for non-MVP desks

3. **Database Schema Setup** (via Supabase MCP tools):

   ```sql
   -- Core CRM tables
   -- NOTE: `organizations` and `accounts` already exist in the current Supabase as-built schema.
   -- Create only the CRM-specific tables that are missing.
   CREATE TABLE contacts (id, organization_id, first_name, last_name, email, phone, title);
   CREATE TABLE account_contacts (account_id, contact_id, role); -- Polymorphic
   CREATE TABLE leads (id, organization_id, first_name, last_name, company, email, phone, source, status);
   CREATE TABLE opportunities (id, organization_id, account_id, name, value, probability, stage);
   CREATE TABLE proposals (id, organization_id, opportunity_id, proposal_number, total_amount, status);
   CREATE TABLE proposal_line_items (id, organization_id, proposal_id, type, description, qty, unit_price);
   CREATE TABLE activities (id, organization_id, type, subject, related_to_type, related_to_id);

   -- RLS policies on all tables (organization_id scoping)
   ```

4. **Multi-Tenancy Setup:**
   - Reuse existing `organization_members` for user↔organization membership
   - Implement/verify RLS policies for all CRM tables (standard `current_setting('app.current_org_id')` pattern)
   - Define initial roles (Admin, Manager, User, Field Tech)

**Deliverables:**

- [ ] Dual structure (Aurora preserved + new /desks folder)
- [ ] Updated sitemap with desk navigation
- [ ] Complete database schema deployed via Supabase
- [ ] RLS policies tested and verified

---

### Week 2: Authentication & Layout

**Goals:**

- Configure Supabase Auth
- Update navigation components for desk switching
- Create base layouts for desks
- Set up SWR data fetching infrastructure

**Tasks:**

1. **Authentication Setup:**
   - Configure Supabase Auth (email/password initially)
   - Implement organization selection/creation on first login
   - Store organization_id in user metadata
   - Test RLS enforcement with multiple test users

2. **Navigation Updates:**
   - Modify `src/layouts/main-layout/sidenav/` components
   - Add visual desk switcher indicator
   - Implement collapsible desk groups
   - Ensure mobile responsiveness

3. **SWR Infrastructure:**
   ```javascript
   // src/services/swr/crm/useLeads.js
   // src/services/swr/crm/useOpportunities.js
   // src/services/swr/crm/useAccounts.js
   // src/services/swr/crm/useContacts.js
   ```

**Deliverables:**

- [ ] Working authentication with organization context
- [ ] Desk-based sidebar navigation functional
- [ ] SWR hooks created for all CRM entities
- [ ] Test users can only see their org's data (RLS verified)

---

### Week 3: Accounts & Contacts

**Goals:**

- Build account list and detail views
- Build contact list and detail views
- Implement account-contact associations
- Create forms with validation

**Tasks:**

1. **Account Management:**
   - List view: `src/app/(main)/desks/crm/accounts/page.jsx`
   - Detail view: `src/app/(main)/desks/crm/accounts/[id]/page.jsx`
   - Components: `src/components/sections/desks/crm/AccountsList.jsx`
   - Copy Aurora data table patterns for list view
   - Copy Aurora detail page layouts

2. **Contact Management:**
   - List view: `src/app/(main)/desks/crm/contacts/page.jsx`
   - Detail view: `src/app/(main)/desks/crm/contacts/[id]/page.jsx`
   - Components: `src/components/sections/desks/crm/ContactsList.jsx`

3. **Polymorphic Relationships:**
   - Contact can be associated with multiple accounts
   - Account detail page shows all associated contacts
   - Contact detail page shows all associated accounts
   - Role designation (primary, billing, technical, decision maker)

4. **Forms with Validation:**
   - React Hook Form + Yup validation (Aurora standard)
   - Account creation/edit form
   - Contact creation/edit form
   - Association management UI

**Deliverables:**

- [ ] Account list, detail, create, edit fully functional
- [ ] Contact list, detail, create, edit fully functional
- [ ] Account-contact associations working with roles
- [ ] All forms validated and error-handled

---

### Week 4: Leads & Qualification

**Goals:**

- Lead capture form
- Lead list with filtering
- Lead qualification workflow
- Lead → Opportunity conversion

**Tasks:**

1. **Lead Capture:**
   - Public-facing lead form (future: embed on websites)
   - Internal lead creation form
   - Lead source tracking (website, referral, cold call, trade show)

2. **Lead Management:**
   - List view with status filtering (new, contacted, qualified, disqualified, converted)
   - Lead detail page with activity timeline
   - Quick actions (call, email, qualify, disqualify)

3. **Lead Qualification:**
   - Qualification form (budget, timeline, decision authority, need)
   - Convert qualified lead → Opportunity
   - Associate opportunity with account/contact

4. **Activity Timeline Foundation:**
   - Log every interaction (calls, emails, notes)
   - Display chronologically on lead/opportunity pages
   - Start of Digital Thread

**Deliverables:**

- [ ] Lead capture form working
- [ ] Lead list with filtering functional
- [ ] Lead qualification and conversion to opportunity
- [ ] Activity logging working (Digital Thread foundation)

---

### Week 5: Opportunities & Pipeline

**Goals:**

- Opportunity pipeline (Kanban board)
- Deal detail pages
- Probability weighting and forecasting
- Pipeline stage management

**Tasks:**

1. **Pipeline Kanban Board:**
   - Copy Aurora Kanban app directly
   - Customize for opportunity stages: Qualification → Proposal → Negotiation → Closed Won/Lost
   - Drag-drop to move opportunities between stages
   - Color coding by probability/value

2. **Opportunity Detail Page:**
   - Full deal information
   - Associated account/contacts
   - Activity timeline (continued Digital Thread)
   - Quick actions (create proposal, schedule meeting, log call)

3. **Forecasting:**
   - Calculate weighted pipeline value (opportunity value × probability)
   - Expected close date tracking
   - Stage duration analytics
   - Win/loss ratio reporting

4. **Stage Management:**
   - Customizable pipeline stages per organization
   - Stage-specific required fields
   - Automatic probability updates based on stage

**Deliverables:**

- [ ] Pipeline Kanban board fully functional
- [ ] Opportunity detail pages complete
- [ ] Forecasting calculations working
- [ ] Pipeline drag-drop with stage transitions

---

### Week 6: Proposals & CRM Dashboard

**Goals:**

- Proposal generation (basic)
- PDF export for proposals
- CRM Desk dashboard with metrics
- Reports and analytics

**Tasks:**

1. **Proposal Generation:**
   - Proposal creation form linked to opportunity
   - Line items (materials, labor, optional items)
   - Pricing calculations (subtotal, tax, total)
   - Terms and conditions template

2. **PDF Export:**
   - Use React-PDF or similar library
   - Professional proposal template
   - Company branding (logo, colors)
   - Digital signature capture (future enhancement)

3. **CRM Dashboard:**
   - Key metrics widgets:
     - Total pipeline value
     - Weighted forecast
     - Conversion rates (lead → opportunity → won)
     - Recent activities
     - Top opportunities by value
   - Copy Aurora dashboard layout patterns

4. **Reports:**
   - Sales by period (month, quarter, year)
   - Lead source performance
   - Win/loss analysis
   - Sales rep performance (if multiple users)

**Deliverables:**

- [ ] Proposal creation and editing functional
- [ ] PDF export generating professional proposals
- [ ] CRM Dashboard showing real-time metrics
- [ ] Basic reporting with date range filtering

---

### Week 7: Testing, Polish & Documentation

**Goals:**

- Comprehensive testing (unit, integration, E2E)
- Bug fixes and polish
- Documentation for MVP features
- Prepare for user feedback

**Tasks:**

1. **Playwright E2E Tests** (use playwright-tester agent):
   - Lead creation flow
   - Lead qualification and conversion
   - Opportunity pipeline updates (drag-drop)
   - Account/Contact associations
   - Proposal generation and PDF export

2. **Manual Testing Checklist:**
   - Multi-user testing (different roles/permissions)
   - RLS enforcement (users cannot see other orgs)
   - Mobile responsiveness (all CRM pages)
   - Form validation edge cases
   - Data export (CSV from all list views)

3. **Documentation:**
   - Create `docs/DESK-ARCHITECTURE.md`
   - Create `docs/CRM-DESK.md` with user guide
   - Update README.md with MVP status
   - Create `docs/ROADMAP.md` with post-MVP plans

4. **Polish:**
   - Loading states on all pages
   - Error handling with user-friendly messages
   - Empty states with helpful CTAs
   - Toast notifications for actions
   - Keyboard navigation support

**Deliverables:**

- [ ] All E2E tests passing
- [ ] Multi-user testing complete
- [ ] Documentation written
- [ ] MVP ready for user testing

---

## Technical Implementation Details

### Component Architecture

**Follow Aurora Patterns:**

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

**Key Conventions:**

- Pages: Thin wrappers (metadata + import)
- Sections: Actual UI components (use `'use client'`)
- Material-UI v7 with `sx` prop styling
- React Hook Form + Yup for all forms

### Data Fetching Strategy

**SWR for Client-Side:**

```javascript
// src/services/swr/crm/useLeads.js
import { supabase } from 'lib/supabase';
import useSWR from 'swr';

export function useLeads(filters = {}) {
  const fetcher = async () => {
    let query = supabase.from('leads').select('*');
    // Apply filters...
    const { data, error } = await query;
    if (error) throw error;
    return data;
  };

  return useSWR(['leads', filters], fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
}
```

**Mutations:**

```javascript
export async function createLead(leadData) {
  const { data, error } = await supabase.from('leads').insert([leadData]).select().single();
  if (error) throw error;
  return data;
}
```

### State Management

**Keep It Simple:**

- Server State: SWR
- URL State: Next.js router + query params (filters, pagination)
- Local UI State: React useState (modals, dropdowns)
- Global UI State: React Context (theme, user session)

### Form Pattern

```javascript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  name: yup.string().required('Name required'),
  email: yup.string().email().required('Email required'),
});

export default function LeadForm({ onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField {...register('name')} error={!!errors.name} />
      {/* More fields */}
    </form>
  );
}
```

### File Structure

```
src/
├── app/
│   └── (main)/
│       └── desks/
│           └── crm/                    ← CRM routes
├── components/
│   ├── sections/
│   │   └── desks/
│   │       └── crm/                    ← CRM UI components
│   └── ui/                             ← Shared components
├── services/
│   └── swr/
│       └── crm/                        ← CRM data hooks
├── lib/
│   └── supabase.js                     ← Supabase client
└── types/
    └── crm.ts                          ← TypeScript types
```

---

## Post-MVP Evolution

### Phase 2: Core Operations (Months 2-4)

**Projects Desk:**

- Convert opportunities → projects
- Gantt charts (Aurora patterns)
- Kanban boards (already in Aurora)
- Task dependencies
- Labor/material cost tracking
- **Bridge:** Opportunity → Project conversion

**Service Desk:**

- Service ticket creation
- SLA tracking
- Recurring maintenance agreements
- Warranty management
- **Bridge:** Project closeout → Service agreement

### Phase 3: Field Operations (Months 5-7)

**Dispatch Desk:**

- Mapbox integration
- Drag-drop scheduling
- Geofence time tracking
- Client notifications (Twilio)
- **Bridge:** Service tickets → Dispatch assignments

**Inventory Desk:**

- Multi-warehouse tracking
- Vehicle inventory sync
- QR/barcode scanning
- Auto-reorder workflows
- **Bridge:** Project materials → Inventory check-out

### Phase 4: Complete Platform (Months 8-10)

**HRM Desk, Assets Desk, Business Desk**

### Drawer Architecture (Months 6-12)

**Implementation Timeline:**

- Month 6: Drawer infrastructure and UI patterns
- Month 7: People Drawer (contacts, users, teams)
- Month 8: Communications Drawer (email pipeline)
- Month 9: Files Drawer + Events Drawer
- Month 10-12: Molecular drawers (Products/Devices, Tickets, Orders, Invoices, Drawings, Flows)

**Technical Pattern:**

```javascript
// src/components/drawers/DrawerProvider.jsx
export function DrawerProvider({ children }) {
  const [activeDrawer, setActiveDrawer] = useState(null);
  const openDrawer = (type, data) => { /* ... */ };

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}
      <DrawerRenderer type={activeDrawer} />
    </DrawerContext.Provider>
  );
}

// Usage anywhere
const { openDrawer } = useDrawer();
<Card onClick={() => openDrawer('people', { contactId })}>
```

**Drawer renders alongside current page with contextual information.**

### LiveSite Portal (Month 10+)

**Separate client-facing application:**

- Client owns property data (free, forever)
- Installed device tracking
- Service request submission
- As-built documentation access
- Multi-vendor freedom (can request quotes from any integrator)

**Data handoff:**

- Integrator marks project complete
- Data copied to client's LiveSite account
- Client retains access even if integrator cancels subscription

### AI Integration

**Phase A: Passive AI** (MVP + 3 months)

- Email summaries
- Report insights
- Troubleshooting suggestions
- All require user action

**Phase B: Assistive AI** (MVP + 6 months)

- Suggested ticket assignments (dispatcher approves)
- Auto-categorization (with review)
- Parts recommendations (tech confirms)
- Anomaly detection flags

**Phase C: Agentic AI** (MVP + 12 months, opt-in)

- Auto-escalate overdue tickets
- Generate purchase orders automatically
- Send payment reminders
- Full audit logs + undo + kill switches

---

## Critical Files to Modify

### New Files to Create (MVP)

**Routes:**

```
src/app/(main)/desks/crm/
├── page.jsx                              ← CRM Dashboard
├── leads/
│   ├── page.jsx                          ← Lead list
│   ├── new/page.jsx                      ← Create lead
│   └── [id]/page.jsx                     ← Lead detail
├── opportunities/
│   ├── page.jsx                          ← Pipeline Kanban
│   ├── new/page.jsx                      ← Create opportunity
│   └── [id]/page.jsx                     ← Opportunity detail
├── proposals/
│   ├── page.jsx                          ← Proposal list
│   ├── new/page.jsx                      ← Create proposal
│   └── [id]/page.jsx                     ← Proposal detail
├── accounts/
│   ├── page.jsx                          ← Account list
│   ├── new/page.jsx                      ← Create account
│   └── [id]/page.jsx                     ← Account detail
├── contacts/
│   ├── page.jsx                          ← Contact list
│   ├── new/page.jsx                      ← Create contact
│   └── [id]/page.jsx                     ← Contact detail
└── reports/
    └── page.jsx                          ← CRM Reports
```

**Components:**

```
src/components/sections/desks/crm/
├── CRMDashboard.jsx
├── LeadsList.jsx
├── LeadsTable.jsx
├── LeadForm.jsx
├── LeadDetail.jsx
├── OpportunitiesPipeline.jsx            ← Kanban board
├── OpportunityCard.jsx
├── OpportunityForm.jsx
├── OpportunityDetail.jsx
├── ProposalsList.jsx
├── ProposalForm.jsx
├── ProposalPDF.jsx
├── AccountsList.jsx
├── AccountsTable.jsx
├── AccountForm.jsx
├── AccountDetail.jsx
├── ContactsList.jsx
├── ContactsTable.jsx
├── ContactForm.jsx
├── ContactDetail.jsx
├── ActivityTimeline.jsx                 ← Digital Thread
├── ActivityForm.jsx
└── CRMReports.jsx
```

**Services (SWR Hooks):**

```
src/services/swr/crm/
├── useLeads.js
├── useOpportunities.js
├── useProposals.js
├── useAccounts.js
├── useContacts.js
├── useActivities.js
└── index.js
```

**Shared UI Components:**

```
src/components/ui/
├── DataTable.jsx                         ← Reusable table
├── StatusBadge.jsx                       ← Status indicators
├── EmptyState.jsx                        ← No data messages
├── ConfirmDialog.jsx                     ← Confirmation modals
└── QuickActions.jsx                      ← Action buttons
```

### Files to Modify

**Sitemap:**

```
src/routes/sitemap.js                     ← Add desk navigation structure
```

**Paths:**

```
src/routes/paths.js                       ← Add CRM desk route paths
```

**Layout:**

```
src/layouts/main-layout/sidenav/
├── SidenavDrawerContent.jsx             ← Update for desk groups
└── NavItem.jsx                           ← Update active state logic
```

**Root Layout:**

```
src/app/(main)/layout.jsx                 ← Ensure proper auth checks
```

### Database Files (Supabase)

**Migrations (via Supabase MCP tools):**

```
migrations/
├── 001_create_contacts.sql
├── 002_create_account_contacts.sql
├── 003_create_leads.sql
├── 004_create_opportunities.sql
├── 005_create_proposals.sql
├── 006_create_proposal_line_items.sql
├── 007_create_activities.sql
└── 008_enable_rls_policies.sql
```

**Use Supabase MCP tools to:**

- List existing tables
- Apply migrations
- Execute SQL for testing
- Verify RLS policies

---

## Verification Plan

### End-to-End Testing Scenarios

**Scenario 1: Complete Lead-to-Proposal Flow**

1. Log in as test user (organization A)
2. Create new lead from lead capture form
3. View lead in leads list
4. Open lead detail page
5. Add activity note (phone call)
6. Qualify lead → Convert to opportunity
7. Verify opportunity appears in pipeline
8. Drag opportunity to "Proposal" stage
9. Create account for the lead's company
10. Create contact associated with account
11. Associate opportunity with account/contact
12. Create proposal for opportunity
13. Generate PDF of proposal
14. Verify PDF downloads correctly
15. Mark opportunity as "Closed Won"
16. Verify CRM dashboard metrics updated

**Expected Results:**

- All data persists correctly
- Activity timeline shows all interactions
- Pipeline updates in real-time
- PDF generates with correct data
- Dashboard reflects updated metrics

---

**Scenario 2: Multi-User & Permissions Testing**

1. Create organization B (separate from org A)
2. Log in as user from organization B
3. Attempt to view organization A's leads (should fail - RLS)
4. Create lead for organization B
5. Verify organization A user cannot see org B's lead
6. Test role-based permissions:
   - Admin: Full access to all CRM features
   - Manager: Read/write leads, opportunities, accounts
   - User: Read-only access, limited create
   - Field Tech: No CRM access (future mobile focus)

**Expected Results:**

- Complete data isolation between organizations
- RLS policies prevent unauthorized access
- Role permissions enforced correctly
- No data leakage between organizations

---

**Scenario 3: Mobile Responsiveness**

1. Access CRM Desk on mobile device (375px width)
2. Navigate through all CRM pages
3. Create lead from mobile
4. Update opportunity stage from mobile Kanban
5. View proposal on mobile
6. Test form inputs and validation on mobile

**Expected Results:**

- All pages responsive and usable on mobile
- Tables convert to mobile-friendly views
- Forms accessible with touch inputs
- Kanban board usable on mobile
- No horizontal scrolling issues

---

### Performance Benchmarks

**Page Load Times (Target):**

- CRM Dashboard: < 1.5s
- Lead List (100 records): < 1s
- Opportunity Pipeline: < 1.5s
- Account Detail: < 1s

**Database Query Performance:**

- Lead list query: < 100ms
- Opportunity pipeline query: < 150ms
- Account with relationships: < 200ms

**Bundle Size:**

- Initial page load: < 300KB (gzipped)
- CRM Desk chunk: < 150KB (gzipped)

---

### Manual Testing Checklist

**Forms:**

- [ ] All required fields validated
- [ ] Email format validated
- [ ] Phone number format validated
- [ ] Error messages clear and helpful
- [ ] Success messages on save
- [ ] Form resets after successful submission

**Data Tables:**

- [ ] Sorting works on all columns
- [ ] Filtering works correctly
- [ ] Pagination functional
- [ ] Search returns accurate results
- [ ] Empty states show helpful messages
- [ ] CSV export generates correct data

**Navigation:**

- [ ] Sidebar desk navigation works
- [ ] Active state shows current page
- [ ] Breadcrumbs accurate (if implemented)
- [ ] Back button works correctly
- [ ] Deep links shareable

**Security:**

- [ ] Cannot access routes without authentication
- [ ] RLS prevents cross-organization data access
- [ ] Role permissions enforced on all actions
- [ ] No sensitive data in client-side logs
- [ ] CSRF protection on mutations

---

### Testing Commands

**Run Development Server:**

```bash
npm run dev
# Access at http://localhost:4000
```

**Run Tests:**

```bash
# Lint (present in this repo)
npm run lint

# Build (present in this repo)
npm run build

# E2E tests (Playwright) - only if configured
npx playwright test

# E2E tests with UI
npx playwright test --ui
```

**Database Verification (via Supabase MCP tools):**

```javascript
// Use Supabase MCP tools in Claude Code:
// - list_tables() to verify schema
// - execute_sql() to test queries
// - get_advisors() to check for security/performance issues
```

**Build Verification:**

```bash
npm run build
# Verify no errors, bundle size acceptable
```

---

## Success Criteria

### MVP Launch Readiness

**Functionality:**

- [ ] All CRM Desk features operational (leads, opportunities, proposals, accounts, contacts)
- [ ] Multi-tenant data isolation verified
- [ ] Authentication and authorization working
- [ ] PDF proposal generation functional
- [ ] CRM Dashboard showing real-time metrics
- [ ] Activity timeline (Digital Thread foundation) working

**Quality:**

- [ ] All E2E tests passing
- [ ] No critical bugs
- [ ] Mobile responsive on all pages
- [ ] Performance targets met
- [ ] RLS policies enforced and tested

**Documentation:**

- [ ] User guide for CRM Desk features
- [ ] Architecture documentation (DESK-ARCHITECTURE.md)
- [ ] Roadmap for post-MVP phases
- [ ] API documentation (if exposing APIs)

**Deployment:**

- [ ] Deployed to production environment
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Monitoring and error tracking active

---

## Next Steps After MVP

1. **User Feedback Collection** (Week 8-9)
   - Onboard 3-5 beta users
   - Collect feedback on CRM workflows
   - Identify pain points and enhancement requests

2. **Iteration** (Week 10-12)
   - Bug fixes from user feedback
   - UX improvements
   - Performance optimizations

3. **Phase 2 Planning** (Month 4)
   - Design Projects Desk
   - Design Service Desk
   - Plan integration between CRM → Projects → Service

4. **Drawer Architecture Prototyping** (Month 5)
   - Build drawer infrastructure
   - Test UX with users
   - Validate the drawer concept before full implementation

---

## Summary

This plan transforms the Aurora template into PierceDesk by:

1. **Preserving Aurora** as reference while building Pierce-specific features
2. **Starting with CRM Desk MVP** to establish the Digital Thread foundation
3. **Following Aurora patterns** for consistency and rapid development
4. **Implementing multi-tenancy** from day one via RLS
5. **Deferring drawers** until core desk functionality is validated
6. **Planning phased rollout** of remaining 7 desks post-MVP

**Timeline:** 7 weeks to CRM Desk MVP, 12 months to full 8-desk platform with drawer architecture.

**Key Success Factor:** Maintain the vision (Digital Thread, Client Ownership, Polymorphic Relationships) while executing pragmatically (Aurora patterns, phased approach, user feedback loops).
