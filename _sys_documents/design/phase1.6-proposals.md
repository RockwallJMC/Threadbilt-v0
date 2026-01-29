---
phase: "1.6"
title: "Proposals & PDF Export"
type: "design"
status: "planned"
version: "1.0"
created: "2026-01-29"
updated: "2026-01-29"
author: "Pierce Team + Claude Code"
reviewers: []
dependencies: ["phase1.1", "phase1.5"]
blocks: ["phase1.7"]
related_docs:
  - "_sys_documents/design/phase1.1-crm-schema.md"
  - "_sys_documents/design/phase1.5-opportunity-pipeline.md"
  - "_sys_documents/execution/INDEX-crm-desk-mvp.md"
estimated_hours: 24
complexity: "high"
impact: "deep"
verification:
  - "Build succeeds (exit 0)"
  - "Lint passes (0 errors)"
  - "35 E2E tests pass with mock data"
  - "PDF generation works for all proposals"
  - "All status transitions functional"
---

# Phase 1.6: Proposals & PDF Export

## Overview

Phase 1.6 implements proposal generation with line items management, pricing calculations, and professional PDF export using React-PDF. This phase completes the sales workflow: Lead → Opportunity → Proposal → Close.

**Business Value:**
- Generate professional proposals for qualified opportunities
- Track proposal lifecycle (draft → sent → accepted/rejected)
- Maintain audit trail of sent proposals with PDF archives
- Calculate accurate pricing with line items and tax
- Foundation for Phase 1.7 (CRM Dashboard with proposal metrics)

**Strategy:**
- Mock data first (following Phase 1.3/1.4/1.5 pattern)
- TODO markers for Supabase integration after Phase 1.2
- React-PDF for declarative PDF generation
- Action-based status workflow with audit trail

## Design Decisions

### Decision 1: Proposal Creation Entry Point

**Context:** Users need to create proposals for qualified opportunities. Where should this action be initiated?

**Options Considered:**

1. **From Opportunity Detail Page** (SELECTED)
   - Pros: Maintains natural CRM workflow, reduces navigation steps, contextual action
   - Cons: Requires opportunity detail page enhancement

2. **From Standalone Proposals List Page**
   - Pros: Centralized proposal management
   - Cons: User must select opportunity in form, more navigation required

3. **Both Options**
   - Pros: Maximum flexibility
   - Cons: Potentially confusing, duplicate UI patterns

**Decision:** Option 1 selected. "Create Proposal" button on Opportunity Detail page maintains the natural Lead → Opportunity → Proposal workflow and provides immediate context.

### Decision 2: Proposal Form Pre-fill Strategy

**Context:** When creating a proposal from an opportunity, how much information should be automatically populated vs. requiring user input?

**Options Considered:**

1. **Minimal Pre-fill** (Opportunity context only)
   - Pros: Maximum flexibility
   - Cons: More data entry, opportunity value might not match line items

2. **Smart Pre-fill** (SELECTED)
   - Pre-fill: Title (from opportunity name), valid_until (NOW + 30 days), default terms template
   - User enters: Line items, custom adjustments
   - Auto-calculate: Subtotal, tax, total from line items
   - Pros: Faster proposal creation, reduces errors, maintains consistency
   - Cons: User must review pre-filled values

3. **Maximum Pre-fill** (Generate initial line items)
   - Pros: Immediately valid proposal
   - Cons: Single line item may not reflect actual cost breakdown

**Decision:** Option 2 selected. Smart pre-fill balances speed and accuracy. Line items (the critical pricing component) are intentionally left for the user to define based on actual costs.

### Decision 3: Line Items Management Interface

**Context:** Users need to add, edit, remove, and reorder line items in proposals. What interface pattern provides the best UX?

**Options Considered:**

1. **Inline Editable Table** (SELECTED)
   - DataGrid-style table with editable cells
   - Click to edit, real-time calculation updates
   - Drag handles for reordering
   - Pros: Compact, Excel-like familiar interface, fast data entry
   - Cons: Less space for long descriptions, requires mobile adaptation

2. **Form-Per-Item with List View**
   - Dialog opens for each line item edit
   - Pros: Works well on mobile, more space for descriptions
   - Cons: Slower, more clicks required

3. **Split View (Table + Detail Panel)**
   - Pros: Best of both approaches
   - Cons: More complex UI, requires more screen space

**Decision:** Option 1 selected. Inline editable table is fastest for 3-10 line items (typical proposal size). Mobile responsive design switches to stacked card layout on screens < 900px.

### Decision 4: PDF Generation Workflow

**Context:** When and how should PDF versions of proposals be generated?

**Options Considered:**

1. **On-Demand Generation Only**
   - Generate fresh on every download
   - Pros: Simple, always current
   - Cons: Slower, no audit trail of sent versions

2. **Generate on Status Change** (SELECTED)
   - Auto-generate when status → 'sent'
   - Store PDF URL/blob for audit trail
   - Preview generates temp PDF without saving
   - Pros: Fast downloads, audit trail, preview capability
   - Cons: Storage needed, regeneration on edits

3. **Real-time PDF Preview**
   - Live preview updates as user edits
   - Pros: WYSIWYG experience
   - Cons: Performance intensive, complex implementation

**Decision:** Option 2 selected. Generate-on-send provides audit trail of exactly what clients received, while preview capability allows validation before sending.

### Decision 5: Proposal Status Workflow

**Context:** The database defines status values: draft, sent, accepted, rejected, expired. How should status transitions be managed?

**Options Considered:**

1. **Manual Status Changes Only**
   - User manually changes via dropdown
   - Pros: Maximum flexibility
   - Cons: No validation, user might forget updates

2. **Action-Based Transitions** (SELECTED)
   - Draft → Sent: "Send Proposal" button (generates PDF)
   - Sent → Accepted/Rejected: Manual status change
   - Sent → Expired: Automatic when valid_until passes
   - Any → Draft: "Revise" button (creates new draft)
   - Pros: Enforces logical workflow, clear audit trail
   - Cons: Less flexible for edge cases

3. **Hybrid Approach**
   - Action buttons + status dropdown for edge cases
   - Pros: Guided but flexible
   - Cons: Potentially confusing with two methods

**Decision:** Option 2 selected. Action-based transitions enforce business workflow and make user intent clear. "Revise" functionality maintains clean audit trail by preserving original sent proposals.

### Decision 6: Data Integration Strategy

**Context:** Phase 1.2 (Auth & Multi-Tenancy) is 60% complete. Should Phase 1.6 wait for Supabase integration or use mock data?

**Options Considered:**

1. **Mock Data First** (SELECTED - Matches Phase 1.3/1.4/1.5)
   - SWR hooks with mock fetchers (100ms delay)
   - 10 mock proposals across all statuses
   - TODO markers for Supabase integration
   - PDF generation works with mock data
   - Pros: Unblocked by Phase 1.2, follows proven pattern, maintains schedule
   - Cons: Refactoring needed later

2. **Wait for Phase 1.2 and Implement Supabase Directly**
   - Block until Phase 1.2 complete
   - Pros: No refactoring needed
   - Cons: Delays Phase 1.6, Phase 1.2 timeline uncertainty

3. **Hybrid - Attempt Supabase, Mock as Fallback**
   - Pros: Opportunistic
   - Cons: More complexity, unclear path

**Decision:** Option 1 selected. Phase 1.2 is only 60% complete with RLS validation pending. Phases 1.3-1.5 successfully used this pattern (147 TODO markers awaiting Phase 1.2). Keeps Phase 1.6 on schedule (Week 6: March 3-7).

## Technical Approach

### Architecture

**Component Hierarchy:**

```
/apps/crm/proposals (List View)
├── ProposalsListContainer.jsx
│   ├── ProposalsTable.jsx (DataGrid with status filter tabs)
│   └── Filter controls (search, status tabs)

/apps/crm/proposals/[id] (Detail View)
├── ProposalDetail.jsx
│   ├── ProposalHeader.jsx (Status chip, action buttons)
│   ├── ProposalOverview.jsx (Opportunity link, account, dates, amounts)
│   ├── ProposalLineItemsDisplay.jsx (Read-only formatted table)
│   └── ProposalPDF.jsx (React-PDF document component)

Opportunity Detail Page Enhancement
└── "Create Proposal" button → Opens CreateProposalDialog

CreateProposalDialog (Full-screen dialog)
├── ProposalForm.jsx (Smart form with pre-fill)
│   ├── LineItemsTable.jsx (Inline editable DataGrid)
│   ├── ProposalSummary.jsx (Subtotal, tax, total calculations)
│   └── ProposalTerms.jsx (Terms & conditions editor)

State Management
├── CRMProposalsProvider.jsx (Selection, filtering, sorting)
└── useProposalApi.js (7 SWR hooks with mock data + TODO markers)
```

**Data Flow:**

```
User Action → SWR Hook → Mock Fetcher (100ms delay) → Optimistic Update
                              ↓
                         TODO: Supabase Query
                              ↓
                         Return Data → Update UI
```

### Data Model

**Database Schema** (from Phase 1.1 - already deployed):

```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,

  proposal_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft', 'sent', 'accepted', 'rejected', 'expired'

  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 4) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  valid_until DATE,
  terms_and_conditions TEXT,

  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_proposal_number_per_org UNIQUE (organization_id, proposal_number)
);

CREATE TABLE proposal_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,

  item_type TEXT NOT NULL,  -- 'material', 'labor', 'equipment', 'service', 'optional'
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL DEFAULT 0,

  sort_order INTEGER NOT NULL DEFAULT 0,
  is_optional BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**TypeScript Types:**

```typescript
interface Proposal {
  id: string;
  organization_id: string;
  opportunity_id: string;

  proposal_number: string;  // 'PROP-2026-001'
  title: string;
  description?: string;

  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

  subtotal: number;
  tax_rate: number;  // Percentage (e.g., 8.25)
  tax_amount: number;
  total_amount: number;

  valid_until: string;  // ISO date
  terms_and_conditions?: string;

  sent_at?: string;  // ISO timestamp
  viewed_at?: string;
  accepted_at?: string;

  created_at: string;
  updated_at: string;

  // Joined data
  opportunity?: Opportunity;
  account?: Account;
  line_items?: ProposalLineItem[];
}

interface ProposalLineItem {
  id: string;
  organization_id: string;
  proposal_id: string;

  item_type: 'material' | 'labor' | 'equipment' | 'service' | 'optional';
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;  // quantity × unit_price

  sort_order: number;
  is_optional: boolean;

  created_at: string;
  updated_at: string;
}
```

### Component Breakdown

#### 1. Data Layer

**`src/services/swr/api-hooks/useProposalApi.js`**
- Purpose: SWR hooks for proposal CRUD operations
- Key functionality: 7 hooks with mock fetchers + TODO markers
- Dependencies: SWR, mock data from src/data/crm/proposals.js

**Hooks:**

```javascript
// 1. useProposals(filters)
//    Filters: { status?, opportunity_id?, search? }
//    Returns: proposals[] with joined opportunity + account data
//    Mock: Filter mock proposals array by status/search

// 2. useProposal(id)
//    Returns: Single proposal with line_items + opportunity + account
//    Mock: Find by id, include line items

// 3. useCreateProposal()
//    Input: { opportunity_id, title, description, valid_until, terms }
//    Mock: Generate proposal_number, set status='draft', add to array
//    TODO: INSERT INTO proposals RETURNING *

// 4. useUpdateProposal()
//    Input: { id, ...updates }
//    Mock: Update in array, recalculate totals if line_items changed
//    TODO: UPDATE proposals WHERE id=...

// 5. useUpdateLineItems()
//    Input: { proposal_id, line_items: [...] }
//    Mock: Replace line_items array, recalculate proposal totals
//    TODO: Transaction: DELETE old + INSERT new + UPDATE proposal

// 6. useUpdateProposalStatus()
//    Input: { id, status, generate_pdf?: bool }
//    Mock: Update status, set timestamps (sent_at, accepted_at)
//    TODO: UPDATE proposals + trigger PDF generation if needed

// 7. useGenerateProposalPDF()
//    Input: { proposal_id }
//    Mock: Render React-PDF, return blob URL
//    TODO: Generate PDF + upload to Supabase Storage + save URL
```

**`src/data/crm/proposals.js`**
- Purpose: Mock proposal data for development
- Data: 10 proposals across all statuses linked to Phase 1.5 opportunities
- Distribution: 2 draft, 3 sent, 2 accepted, 2 rejected, 1 expired
- Each proposal: 3-7 line items with varied item_types

#### 2. List View Components

**`src/components/sections/crm/proposals-list/ProposalsListContainer.jsx`**
- Purpose: Main container for proposals list view
- Key functionality: Filter controls, search bar, "Add Proposal" button (disabled - must create from opportunity)
- Dependencies: CRMProposalsProvider, useProposals()

**`src/components/sections/crm/proposals-list/ProposalsTable.jsx`**
- Purpose: DataGrid displaying proposals with status filter tabs
- Key functionality:
  - Columns: Proposal Number, Opportunity Name, Account, Status (chip), Total Amount, Valid Until, Actions
  - Status tabs: All, Draft, Sent, Accepted, Rejected, Expired
  - Search by: proposal_number, opportunity name, account name
  - Click row → Navigate to detail page
  - Actions dropdown: View, Edit (draft only), Delete (draft only)
- Dependencies: Material-UI DataGrid, useProposals()

**`src/app/(main)/apps/crm/proposals/page.jsx`**
- Purpose: Proposals list page route
- Component: Renders ProposalsListContainer

#### 3. Proposal Creation/Edit Components

**`src/components/sections/crm/proposals/CreateProposalDialog.jsx`**
- Purpose: Full-screen dialog for proposal creation/editing
- Key functionality:
  - Triggered from Opportunity Detail "Create Proposal" button
  - Pre-fills form with opportunity context
  - Contains ProposalForm
  - Close/Cancel with unsaved changes confirmation
- Dependencies: Dialog (MUI), ProposalForm

**`src/components/sections/crm/proposals/ProposalForm.jsx`**
- Purpose: Main form for proposal creation/editing
- Key functionality:
  - Pre-filled fields: title, valid_until (DatePicker), terms_and_conditions (textarea)
  - Editable fields: title, description, valid_until, terms, tax_rate
  - Contains: LineItemsTable, ProposalSummary, ProposalTerms
  - Validation: line_items.length > 0, valid_until is future date
  - Actions: "Save as Draft", "Cancel"
- Dependencies: React Hook Form, Yup validation, useCreateProposal()

**`src/components/sections/crm/proposals/LineItemsTable.jsx`**
- Purpose: Inline editable DataGrid for line items management
- Key functionality:
  - Columns: Drag Handle, Item Type (select), Description (text), Quantity (number), Unit Price (currency), Total (calculated), Actions (delete)
  - Editable cells with debounced auto-save (500ms)
  - Real-time total calculation: quantity × unit_price
  - Drag-and-drop reordering with @dnd-kit
  - "Add Row" button at bottom
  - Delete with confirmation
  - Validation: quantity > 0, unit_price ≥ 0, description min 3 chars
- Dependencies: Material-UI DataGrid with editable cells, @dnd-kit/core

**`src/components/sections/crm/proposals/ProposalSummary.jsx`**
- Purpose: Right panel showing pricing calculations
- Key functionality:
  - Subtotal: SUM(line_items.total_price)
  - Tax Rate: Editable percentage input (default 0%)
  - Tax Amount: subtotal × (tax_rate / 100)
  - Total Amount: subtotal + tax_amount
  - Updates in real-time as line items change
- Dependencies: React state, formatCurrency utility

**`src/components/sections/crm/proposals/ProposalTerms.jsx`**
- Purpose: Terms and conditions editor
- Key functionality:
  - Textarea with default template loaded from constants
  - Character count (max 5000)
  - Rich text formatting optional (future enhancement)
- Dependencies: TextField (MUI multiline)

#### 4. Proposal Detail Components

**`src/components/sections/crm/proposal-detail/ProposalDetail.jsx`**
- Purpose: Main container for proposal detail view
- Key functionality:
  - Renders all sub-components
  - Handles action button clicks
  - Manages edit mode state
- Dependencies: useProposal(id), useUpdateProposalStatus()

**`src/components/sections/crm/proposal-detail/ProposalHeader.jsx`**
- Purpose: Header with status, proposal number, and action buttons
- Key functionality:
  - Status chip with color mapping
  - Proposal number (large, prominent)
  - Action buttons (conditional by status):
    - Draft: "Edit", "Send Proposal", "Delete"
    - Sent: "Preview PDF", "Download PDF", "Mark as Accepted", "Mark as Rejected", "Revise"
    - Accepted/Rejected: "Download PDF", "View Only"
    - Expired: "Revise", "Archive"
- Dependencies: Button, Chip (MUI), useUpdateProposalStatus()

**`src/components/sections/crm/proposal-detail/ProposalOverview.jsx`**
- Purpose: Display proposal metadata and linked entities
- Key functionality:
  - Opportunity link (clickable → opportunity detail)
  - Account info (name, billing address)
  - Dates: Created, Valid Until, Sent At, Accepted At
  - Amounts: Subtotal, Tax, Total (formatted currency)
  - Description (if provided)
- Dependencies: Card, Typography (MUI)

**`src/components/sections/crm/proposal-detail/ProposalLineItemsDisplay.jsx`**
- Purpose: Read-only formatted table of line items
- Key functionality:
  - Columns: Item Type (badge), Description, Quantity, Unit Price, Total
  - Formatted for readability (not editable)
  - Optional items marked with "(Optional)" badge
  - Totals row at bottom
- Dependencies: Table (MUI)

**`src/components/sections/crm/proposal-detail/ProposalPDF.jsx`**
- Purpose: React-PDF document component for PDF generation
- Key functionality:
  - A4 page size, professional styling
  - Header: "PROPOSAL", proposal_number, valid_until
  - Company/Client info section
  - Line items table with headers
  - Totals section (subtotal, tax, total)
  - Terms & conditions footer
  - Page numbers if multi-page
- Dependencies: @react-pdf/renderer

**`src/app/(main)/apps/crm/proposals/[id]/page.jsx`**
- Purpose: Proposal detail page route
- Component: Renders ProposalDetail with id from params

#### 5. Opportunity Detail Enhancement

**`src/components/sections/crm/opportunity-details/OpportunityHeader.jsx` (Modification)**
- Purpose: Add "Create Proposal" button to opportunity header
- Key functionality:
  - Button appears for opportunities in stages: 'proposal', 'negotiation' (not closed stages)
  - Click opens CreateProposalDialog with opportunity context
  - Badge shows count of linked proposals
- Dependencies: useOpportunity(), CreateProposalDialog

**`src/components/sections/crm/opportunity-details/OpportunityProposals.jsx` (New tab)**
- Purpose: Tab in opportunity detail showing linked proposals
- Key functionality:
  - List of proposals for this opportunity
  - Card view: proposal_number, status, total_amount, valid_until
  - Click card → Navigate to proposal detail
  - Empty state: "No proposals yet" with "Create Proposal" button
- Dependencies: useProposals(filters: { opportunity_id })

#### 6. State Management

**`src/providers/CRMProposalsProvider.jsx`**
- Purpose: Global state for proposals list view
- State: selectedProposals (array), filters (status, search), sortBy
- Actions: selectProposal, deselectProposal, clearSelection, setFilters, setSortBy
- Dependencies: React Context, useReducer

#### 7. Routes & Navigation

**Routes to add:**
- `/apps/crm/proposals` - Proposals list view
- `/apps/crm/proposals/[id]` - Proposal detail view

**Sitemap update** (`src/routes/sitemap.js`):
```javascript
{
  name: 'Proposals',
  key: 'proposals',
  path: paths.crm.proposals.root,
  pathName: 'proposals',
  icon: 'material-symbols:description-outline',
  active: true
}
```

#### 8. Utilities

**`src/utils/crm/proposalCalculations.js`**
- Purpose: Proposal pricing calculations
- Functions:
  - `calculateLineItemTotal(quantity, unitPrice)` → quantity × unitPrice
  - `calculateSubtotal(lineItems)` → SUM(lineItems.total_price)
  - `calculateTaxAmount(subtotal, taxRate)` → subtotal × (taxRate / 100)
  - `calculateTotal(subtotal, taxAmount)` → subtotal + taxAmount
  - `recalculateProposalTotals(lineItems, taxRate)` → { subtotal, taxAmount, total }

**`src/utils/crm/proposalNumberGenerator.js`**
- Purpose: Generate unique proposal numbers
- Format: `PROP-YYYY-NNN` (e.g., PROP-2026-001)
- Mock: Increment counter in memory
- TODO: Query database for max number per year, increment

**`src/constants/crm/proposalDefaults.js`**
- Purpose: Default values and templates
- Exports:
  - `DEFAULT_VALID_DAYS` = 30
  - `DEFAULT_TAX_RATE` = 0
  - `DEFAULT_TERMS_TEMPLATE` = "Payment terms: Net 30 days from invoice date. ..."
  - `ITEM_TYPES` = ['Material', 'Labor', 'Equipment', 'Service', 'Optional']
  - `STATUS_COLORS` = { draft: 'default', sent: 'info', accepted: 'success', rejected: 'error', expired: 'warning' }

## Dependencies

### External Dependencies

**New NPM packages to install:**
- `@react-pdf/renderer` (^3.4.0) - Declarative PDF generation in React
  - Why needed: Professional PDF generation with React components
  - Decision log: Technical Decision 3 in INDEX-crm-desk-mvp.md
  - License: MIT

**Existing dependencies (already installed):**
- Material-UI DataGrid Pro (editable cells)
- @dnd-kit/core (drag-and-drop for reordering)
- SWR (data fetching)
- React Hook Form + Yup (form validation)

### Internal Dependencies

**Phase Dependencies:**
- Phase 1.1 (Database Schema) - ✅ Complete (proposals tables exist)
- Phase 1.5 (Opportunities Pipeline) - ✅ Complete (opportunities to link to)

**Component Dependencies:**
- Opportunities must have detail page with header enhancement point
- Mock opportunities data must exist for proposal linking

**Blocks:**
- Phase 1.7 (CRM Dashboard) - Needs proposal metrics (total value, acceptance rate, etc.)

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| React-PDF performance issues with large proposals | Medium | Low | Test with 50+ line items, optimize rendering, consider pagination |
| Line items table too complex for mobile | Medium | Medium | Switch to stacked card layout on mobile, simplify editing UX |
| PDF storage in Supabase Storage integration complexity | High | Medium | Mock with localStorage/blob URLs first, defer storage to Phase 1.2 integration |
| Pricing calculation rounding errors | Low | Low | Use Decimal.js for currency calculations, test edge cases |
| Phase 1.2 delays impact Supabase integration | High | Medium | Already mitigated - mock data strategy unblocks Phase 1.6 |
| Status workflow doesn't match real-world usage | Medium | Low | Validate workflow with stakeholders during design review |
| Terms & conditions template not suitable for all proposal types | Low | Medium | Make template customizable, allow per-proposal edits |

## Implementation Notes

**Key Considerations:**

1. **Copy-Then-Modify Pattern (Aurora)**
   - Search Aurora templates for invoice/quote components
   - If found, copy to src/components/sections/crm/proposals/
   - If not found, build custom components following Material-UI patterns
   - Document search attempts in execution log

2. **DataGrid Editable Cells**
   - Material-UI DataGrid Pro supports inline editing
   - Use `editable: true` on columns
   - Handle `processRowUpdate` callback for saving changes
   - Implement validation in `onProcessRowUpdateError`

3. **React-PDF Best Practices**
   - Keep styles simple (limited CSS support)
   - Test with various data sizes (1 line item vs. 50)
   - Use `@react-pdf/renderer` not `react-pdf` (different libraries)
   - Generate on server-side for production (Next.js API route)

4. **Mock Data Quality**
   - Proposals must link to real opportunities from Phase 1.5 mock data
   - Line items should have realistic descriptions and pricing
   - Status distribution: representative of real workflow (more drafts/sent than accepted)
   - Valid dates: mix of future, current, and expired for testing

5. **Proposal Number Generation**
   - Format: `PROP-YYYY-NNN` where NNN increments per year
   - Mock: Simple counter (PROP-2026-001, PROP-2026-002, ...)
   - Production: Query for MAX(proposal_number) per year, increment
   - Ensure uniqueness per organization (database constraint exists)

6. **Totals Calculation Precision**
   - Use `Number.toFixed(2)` for currency display
   - Consider Decimal.js for large currency amounts if needed
   - Line item total: `(quantity * unit_price).toFixed(2)`
   - Tax amount: `(subtotal * tax_rate / 100).toFixed(2)`

7. **Status Transition Validation**
   - Enforce business rules: Draft → Sent requires line_items.length > 0
   - "Send" action generates PDF before updating status
   - "Revise" creates new draft, preserves original (audit trail)
   - Expired status set automatically (client-side check on page load)

8. **PDF Generation Workflow**
   - Preview: Generate in-memory, open blob URL in new tab
   - Send: Generate, store blob URL (mock: localStorage, prod: Supabase Storage), update status
   - Download: Retrieve stored blob or regenerate if needed
   - PDF filename: `{proposal_number}.pdf` (e.g., PROP-2026-001.pdf)

9. **Mobile Responsiveness**
   - LineItemsTable switches to card layout < 900px
   - Each card: item_type badge, description, "Qty × Price = Total"
   - Edit button opens item in bottom sheet dialog
   - ProposalSummary moves below line items on mobile

10. **Testing with Phase 1.5 Integration**
    - Ensure "Create Proposal" button integrates smoothly with OpportunityDetail
    - Test proposal → opportunity bidirectional navigation
    - Verify opportunity forecast updates when proposal accepted

## Verification Plan

**Overall verification checklist tracked in INDEX.** This section documents phase-specific verification steps only.

### Phase-Specific Verification

**Build & Lint:**
```bash
npm run build
# Expected: Exit code 0, no errors

npm run lint
# Expected: 0 errors in Phase 1.6 files
```

**E2E Tests:**
```bash
npm run test:e2e -- crm-proposals
# Expected: 35 active tests pass

npm run test:e2e -- crm-proposals-multi-tenancy
# Expected: 6 tests marked .skip() (pending Phase 1.2)
```

**Manual Testing Checklist:**

1. **Proposals List View**
   - Navigate to `/apps/crm/proposals`
   - Verify all 10 mock proposals display
   - Click status filter tabs (Draft, Sent, etc.) - filters work
   - Search by proposal number - finds correct proposal
   - Click row - navigates to detail page

2. **Proposal Creation**
   - Navigate to opportunity detail (stage='proposal')
   - "Create Proposal" button appears
   - Click button - dialog opens
   - Verify pre-filled: title, valid_until, terms
   - Add 3 line items with different item_types
   - Edit quantity/unit_price - total updates
   - Drag reorder line items - sort_order changes
   - Delete line item - confirmation, item removed
   - Verify subtotal, tax, total calculations correct
   - "Save as Draft" - creates proposal, closes dialog
   - Proposal appears in list with status='draft'

3. **Proposal Detail & Actions**
   - Navigate to proposal detail (draft status)
   - "Edit" button - reopens dialog with data
   - "Send Proposal" button - validates, generates PDF, updates status='sent'
   - "Preview PDF" button - opens PDF in new tab
   - "Download PDF" button - downloads file as PROP-XXXX-XXX.pdf
   - "Mark as Accepted" - updates status, sets accepted_at timestamp
   - Navigate to accepted proposal - "View Only", no edit actions

4. **Status Transitions**
   - Draft → Sent: Validates line items exist, valid_until is future
   - Sent → Accepted: Updates status and timestamp
   - Sent → Rejected: Updates status
   - Sent → Revise: Creates new draft with copied data
   - Expired status displays correctly (orange chip)

5. **PDF Generation**
   - Preview PDF - contains proposal_number, line items, totals, terms
   - Download PDF - filename correct, PDF opens in viewer
   - Verify line items table formatted correctly
   - Verify totals match proposal data

6. **Integration with Opportunities**
   - Opportunity detail shows linked proposals count
   - Opportunity "Proposals" tab lists all linked proposals
   - Proposal detail links back to opportunity
   - "Create Proposal" only appears for proposal/negotiation stages

7. **Mobile Responsiveness** (test at < 900px width)
   - LineItemsTable switches to card layout
   - ProposalSummary moves below line items
   - All action buttons accessible
   - PDF preview/download works on mobile

### Phase Acceptance Criteria

**Note:** These are phase-specific criteria. Feature-level criteria tracked in INDEX.

- [x] Design document complete and validated
- [ ] 26 new components created (list, detail, creation, PDF)
- [ ] useProposalApi.js with 7 SWR hooks implemented
- [ ] 10 mock proposals created across all statuses
- [ ] Proposal number generation working (PROP-YYYY-NNN format)
- [ ] LineItemsTable with inline editing functional
- [ ] Real-time totals calculation (subtotal, tax, total) working
- [ ] Drag-and-drop line item reordering functional
- [ ] React-PDF component generates professional PDF
- [ ] All status transitions working (Draft → Sent → Accepted/Rejected)
- [ ] "Preview PDF" opens PDF in new tab
- [ ] "Download PDF" downloads with correct filename
- [ ] "Send Proposal" generates PDF and updates status
- [ ] "Revise" creates new draft from sent proposal
- [ ] "Create Proposal" button integrated on OpportunityDetail
- [ ] Opportunity "Proposals" tab shows linked proposals
- [ ] 35 active E2E tests passing
- [ ] 6 multi-tenancy tests marked .skip() (pending Phase 1.2)
- [ ] TODO markers documented (estimated 12-15 total)
- [ ] Build succeeds (exit 0)
- [ ] Lint passes (0 errors in Phase 1.6 files)
- [ ] Mobile responsive (< 900px tested)
- [ ] Routes added to sitemap
- [ ] Phase 1.6 execution document created with progress tracking

## Related Documentation

### Internal Documentation
- [Phase 1.1 CRM Schema](phase1.1-crm-schema.md) - Database tables definition
- [Phase 1.5 Opportunities Pipeline](phase1.5-opportunity-pipeline.md) - Opportunities integration
- [INDEX: CRM Desk MVP](../execution/INDEX-crm-desk-mvp.md) - Overall feature tracking
- [Documentation Guide](../../docs/guides/DOCUMENTATION-GUIDE.md) - Framework compliance

### External References
- [React-PDF Documentation](https://react-pdf.org/) - PDF generation library
- [Material-UI DataGrid Editing](https://mui.com/x/react-data-grid/editing/) - Inline editable cells
- [@dnd-kit Documentation](https://docs.dndkit.com/) - Drag-and-drop functionality

### Templates Used
- `.claude/templates/phase-design-template.md` - This document structure
- `.claude/templates/phase-execution-template.md` - For Phase 1.6 execution tracking
- `.claude/templates/INDEX-template.md` - For INDEX updates

---

**Status**: ⏳ Planned - Design Complete, Ready for Implementation Setup
**Next Action**: Create Phase 1.6 execution document and set up GitHub issue + feature branch
**Owner**: Pierce Team + Claude Code
**Last Updated**: 2026-01-29
