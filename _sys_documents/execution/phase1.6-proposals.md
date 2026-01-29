---
phase: "1.6"
title: "Proposals & PDF Export - Implementation"
type: "execution"
status: "planned"
version: "0.1"
created: "2026-01-29"
updated: "2026-01-29"
github_issue: "11"
feature_branch: "feature/desk-proposals-phase1.6"
assigned_agent: "Orchestrator (multiple sub-agents)"
dependencies: ["phase1.1", "phase1.5"]
progress_percentage: 0
estimated_completion: "2026-03-07"
---

# Phase 1.6: Proposals & PDF Export - Implementation

## Overview

Implement proposal generation with line items management, pricing calculations, and professional PDF export using React-PDF. This phase completes the sales workflow: Lead → Opportunity → Proposal → Close.

**Target**: Week 6 (March 3-7, 2026)
**Estimated Hours**: 24 hours
**Complexity**: High
**Impact**: Deep

## Implementation Steps

### Step 1: Install React-PDF Dependency

**Duration**: 15 minutes
**Status**: ⏳ Pending
**Assigned**: Orchestrator (direct action)

**Actions:**
```bash
npm install @react-pdf/renderer --legacy-peer-deps
```

**Verification:**
- package.json updated with @react-pdf/renderer dependency
- npm install succeeds without errors

---

### Step 2: Create Mock Proposal Data

**Duration**: 1-2 hours
**Status**: ⏳ Pending
**Assigned**: wiring-agent

**File to create:** `src/data/crm/proposals.js`

**Requirements:**
- 10 mock proposals across all statuses
- Distribution: 2 draft, 3 sent, 2 accepted, 2 rejected, 1 expired
- Each proposal linked to Phase 1.5 opportunities (use existing opportunity IDs)
- Each proposal has 3-7 line items with varied item_types
- Line items pre-calculated with totals
- Proposal numbers: PROP-2026-001 through PROP-2026-010
- Include helper functions: `getProposalById()`, `getProposalsByOpportunityId()`, etc.

**Sample structure:**
```javascript
export const mockProposals = [
  {
    id: 'prop_001',
    organization_id: 'org_001',
    opportunity_id: 'opp_001',  // From Phase 1.5 mock data
    proposal_number: 'PROP-2026-001',
    title: 'Website Redesign Proposal',
    description: '...',
    status: 'draft',
    subtotal: 15000.00,
    tax_rate: 8.25,
    tax_amount: 1237.50,
    total_amount: 16237.50,
    valid_until: '2026-03-31',
    terms_and_conditions: '...',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-01-15T10:00:00Z',
    line_items: [...]
  },
  // ... 9 more proposals
];

export const mockProposalLineItems = [
  {
    id: 'item_001',
    proposal_id: 'prop_001',
    item_type: 'service',
    description: 'Website Design & Development',
    quantity: 1,
    unit_price: 10000.00,
    total_price: 10000.00,
    sort_order: 0,
    is_optional: false
  },
  // ... more items
];
```

**Deliverables:**
- Mock proposals file with 10 proposals
- Helper functions for filtering/finding proposals
- Integration with Phase 1.5 opportunity mock data

---

### Step 3: Create useProposalApi SWR Hooks

**Duration**: 2-3 hours
**Status**: ⏳ Pending
**Assigned**: wiring-agent

**File to create:** `src/services/swr/api-hooks/useProposalApi.js`

**Hooks to implement:**

```javascript
// 1. useProposals(filters)
export function useProposals(filters = {}) {
  // Filters: { status?, opportunity_id?, search? }
  // TODO: Replace with Supabase query after Phase 1.2
  // Mock: Filter mockProposals array
}

// 2. useProposal(id)
export function useProposal(id) {
  // Returns: proposal + line_items + opportunity + account
  // TODO: Replace with Supabase query + joins after Phase 1.2
  // Mock: Find by id, join with opportunity/account mock data
}

// 3. useCreateProposal()
export function useCreateProposal() {
  // Input: { opportunity_id, title, description, valid_until, terms }
  // TODO: INSERT INTO proposals RETURNING * after Phase 1.2
  // Mock: Generate proposal_number, add to array, return new proposal
}

// 4. useUpdateProposal()
export function useUpdateProposal() {
  // Input: { id, ...updates }
  // TODO: UPDATE proposals WHERE id=... after Phase 1.2
  // Mock: Update in array, recalculate totals if needed
}

// 5. useUpdateLineItems()
export function useUpdateLineItems() {
  // Input: { proposal_id, line_items: [...] }
  // TODO: Transaction (DELETE old + INSERT new + UPDATE totals) after Phase 1.2
  // Mock: Replace line_items array, recalculate proposal totals
}

// 6. useUpdateProposalStatus()
export function useUpdateProposalStatus() {
  // Input: { id, status, generate_pdf?: bool }
  // TODO: UPDATE proposals + trigger PDF generation after Phase 1.2
  // Mock: Update status, set timestamps (sent_at, accepted_at)
}

// 7. useGenerateProposalPDF()
export function useGenerateProposalPDF() {
  // Input: { proposal_id }
  // TODO: Generate PDF + upload to Supabase Storage after Phase 1.2
  // Mock: Call React-PDF renderer, return blob URL
}
```

**Requirements:**
- Follow `useLeadApi.js` pattern exactly
- Mock fetchers with 100ms delay
- TODO markers in all 7 fetchers for Phase 1.2
- Optimistic updates with SWR mutate
- Error handling with toast notifications

**Deliverables:**
- useProposalApi.js with 7 hooks
- ~12-15 TODO markers documented
- Integration tested with mock data

---

### Step 4: Create Utility Functions

**Duration**: 1 hour
**Status**: ⏳ Pending
**Assigned**: wiring-agent

**Files to create:**

1. **`src/utils/crm/proposalCalculations.js`**
```javascript
export const calculateLineItemTotal = (quantity, unitPrice) => {
  return (quantity * unitPrice).toFixed(2);
};

export const calculateSubtotal = (lineItems) => {
  return lineItems.reduce((sum, item) => sum + parseFloat(item.total_price), 0).toFixed(2);
};

export const calculateTaxAmount = (subtotal, taxRate) => {
  return (subtotal * (taxRate / 100)).toFixed(2);
};

export const calculateTotal = (subtotal, taxAmount) => {
  return (parseFloat(subtotal) + parseFloat(taxAmount)).toFixed(2);
};

export const recalculateProposalTotals = (lineItems, taxRate) => {
  const subtotal = calculateSubtotal(lineItems);
  const taxAmount = calculateTaxAmount(subtotal, taxRate);
  const total = calculateTotal(subtotal, taxAmount);
  return { subtotal, taxAmount, total };
};
```

2. **`src/utils/crm/proposalNumberGenerator.js`**
```javascript
export const generateProposalNumber = () => {
  // Mock: Simple incrementing counter
  // Format: PROP-YYYY-NNN
  // TODO: Query database for max number per year after Phase 1.2
};
```

3. **`src/constants/crm/proposalDefaults.js`**
```javascript
export const DEFAULT_VALID_DAYS = 30;
export const DEFAULT_TAX_RATE = 0;
export const DEFAULT_TERMS_TEMPLATE = `
Payment terms: Net 30 days from invoice date.
All work is guaranteed for 90 days from project completion.
Changes to scope may incur additional charges.
`.trim();

export const ITEM_TYPES = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'service', label: 'Service' },
  { value: 'optional', label: 'Optional' }
];

export const STATUS_COLORS = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'error',
  expired: 'warning'
};
```

**Deliverables:**
- 3 utility/constant files created
- Unit tests for calculation functions (optional for mock phase)

---

### Step 5: Create ProposalsTable & List View Components

**Duration**: 3-4 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**Components to create:**

1. **`src/components/sections/crm/proposals-list/ProposalsTable.jsx`**
   - Material-UI DataGrid
   - Columns: Proposal Number, Opportunity Name, Account, Status (chip), Total Amount, Valid Until, Actions
   - Status filter tabs: All, Draft, Sent, Accepted, Rejected, Expired
   - Search by: proposal_number, opportunity name, account name
   - Click row → Navigate to detail page
   - Actions dropdown: View, Edit (draft only), Delete (draft only)

2. **`src/components/sections/crm/proposals-list/ProposalsListContainer.jsx`**
   - Main container with filters and search
   - "Add Proposal" button (disabled with tooltip: "Create proposals from opportunities")
   - Integrates ProposalsTable
   - Uses useProposals() hook with filters

3. **`src/app/(main)/apps/crm/proposals/page.jsx`**
   - Page route rendering ProposalsListContainer

**Pattern**: Copy from `LeadsTable.jsx` and `LeadsListContainer.jsx`

**Deliverables:**
- 3 files created
- List view functional with all 10 mock proposals
- Status filters working
- Search functional
- Navigation to detail page working

---

### Step 6: Create ProposalPDF Component with React-PDF

**Duration**: 3-4 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**File to create:** `src/components/sections/crm/proposal-detail/ProposalPDF.jsx`

**Requirements:**
- Use @react-pdf/renderer for PDF generation
- A4 page size, professional styling
- Sections:
  - Header: "PROPOSAL", proposal_number, valid_until date
  - Company/Client info (organization vs. account)
  - Line items table (headers + data rows)
  - Totals section (subtotal, tax, total)
  - Terms & conditions footer
  - Page numbers if multi-page

**Structure:**
```javascript
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export function ProposalPDF({ proposal }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>PROPOSAL</Text>
          <Text>{proposal.proposal_number}</Text>
          <Text>Valid Until: {formatDate(proposal.valid_until)}</Text>
        </View>

        {/* Company/Client Info */}
        <View style={styles.parties}>
          {/* Organization info */}
          {/* Client account info */}
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table header */}
          {/* Data rows */}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <Text>Subtotal: {formatCurrency(proposal.subtotal)}</Text>
          <Text>Tax ({proposal.tax_rate}%): {formatCurrency(proposal.tax_amount)}</Text>
          <Text>Total: {formatCurrency(proposal.total_amount)}</Text>
        </View>

        {/* Terms */}
        <View style={styles.terms}>
          <Text>{proposal.terms_and_conditions}</Text>
        </View>
      </Page>
    </Document>
  );
}
```

**Testing:**
- Test PDF generation with various proposal sizes (3 items, 10 items, 20 items)
- Verify formatting, alignment, page breaks
- Test download functionality

**Deliverables:**
- ProposalPDF.jsx component
- PDF generates correctly for all mock proposals
- Download works with filename: {proposal_number}.pdf

---

### Step 7: Create LineItemsTable Component

**Duration**: 3-4 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**File to create:** `src/components/sections/crm/proposals/LineItemsTable.jsx`

**Requirements:**
- Material-UI DataGrid with editable cells
- Columns:
  - Drag Handle (⋮⋮) for reordering
  - Item Type (select dropdown) - Material, Labor, Equipment, Service, Optional
  - Description (text field, min 300px width)
  - Quantity (number input)
  - Unit Price (number input, currency formatted)
  - Total (calculated, read-only) = quantity × unit_price
  - Actions (delete button with confirmation)

**Features:**
- Inline editing with debounced auto-save (500ms)
- Real-time total calculation on quantity/unit_price change
- Drag-and-drop reordering with @dnd-kit
- "Add Row" button at table bottom (inserts row with defaults: quantity=1, unit_price=0)
- Delete with confirmation dialog
- Validation: quantity > 0, unit_price ≥ 0, description min 3 chars

**Mobile Responsive:**
- < 900px width: Switch to stacked card layout
- Each card shows: item_type badge, description, "Qty × Price = Total"
- Edit button opens item in bottom sheet dialog

**Deliverables:**
- LineItemsTable.jsx component
- Inline editing functional
- Drag-drop reordering works
- Add/delete rows works
- Mobile responsive layout tested

---

### Step 8: Create Proposal Creation Components

**Duration**: 3-4 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**Components to create:**

1. **`src/components/sections/crm/proposals/CreateProposalDialog.jsx`**
   - Full-screen dialog (Dialog with fullScreen prop)
   - Triggered from OpportunityDetail "Create Proposal" button
   - Contains ProposalForm
   - Close/Cancel with unsaved changes confirmation

2. **`src/components/sections/crm/proposals/ProposalForm.jsx`**
   - Form fields:
     - Title (TextField, pre-filled from opportunity name)
     - Description (TextField multiline, optional)
     - Valid Until (DatePicker, default NOW + 30 days)
     - Tax Rate (number input, percentage, default 0%)
     - Terms & Conditions (textarea, pre-filled with template)
   - Contains: LineItemsTable, ProposalSummary
   - Validation: line_items.length > 0, valid_until is future date
   - Actions: "Save as Draft", "Cancel"

3. **`src/components/sections/crm/proposals/ProposalSummary.jsx`**
   - Right panel (or bottom on mobile) showing:
     - Subtotal: SUM(line_items.total_price)
     - Tax Rate: Editable percentage (linked to form)
     - Tax Amount: subtotal × (tax_rate / 100)
     - Total Amount: subtotal + tax_amount
   - Updates in real-time as line items change

4. **`src/components/sections/crm/proposals/ProposalTerms.jsx`**
   - Textarea with default template
   - Character count (max 5000)
   - Pre-filled from DEFAULT_TERMS_TEMPLATE

**Pattern**: Similar to ConvertLeadModal but larger (full-screen dialog)

**Deliverables:**
- 4 components created
- Dialog opens from opportunity detail
- Smart pre-fill working
- Line items integration working
- Real-time calculations working
- "Save as Draft" creates proposal

---

### Step 9: Create Proposal Detail Components

**Duration**: 3-4 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**Components to create:**

1. **`src/components/sections/crm/proposal-detail/ProposalDetail.jsx`**
   - Main container for proposal detail view
   - Renders all sub-components
   - Manages action button click handlers
   - Handles edit mode state

2. **`src/components/sections/crm/proposal-detail/ProposalHeader.jsx`**
   - Status chip with color mapping
   - Proposal number (Typography variant="h4")
   - Action buttons (conditional by status):
     - Draft: "Edit", "Send Proposal", "Delete"
     - Sent: "Preview PDF", "Download PDF", "Mark as Accepted", "Mark as Rejected", "Revise"
     - Accepted/Rejected: "Download PDF", "View Only"
     - Expired: "Revise", "Archive"

3. **`src/components/sections/crm/proposal-detail/ProposalOverview.jsx`**
   - Grid layout with cards showing:
     - Linked Opportunity (clickable link)
     - Account info (name, billing address)
     - Dates: Created, Valid Until, Sent At, Accepted At
     - Amounts: Subtotal, Tax, Total (formatted currency)
     - Description (if provided)

4. **`src/components/sections/crm/proposal-detail/ProposalLineItemsDisplay.jsx`**
   - Read-only formatted table (not editable)
   - Columns: Item Type (badge), Description, Quantity, Unit Price, Total
   - Optional items marked with "(Optional)" badge
   - Totals row at bottom

5. **`src/app/(main)/apps/crm/proposals/[id]/page.jsx`**
   - Proposal detail page route
   - Renders ProposalDetail with id from params

**Pattern**: Copy from OpportunityDetail components

**Deliverables:**
- 5 files created
- Detail page renders with all proposal data
- Action buttons functional (preview, download, status changes)
- Navigation working (to/from opportunities)

---

### Step 10: Enhance OpportunityDetail with Proposals Integration

**Duration**: 2-3 hours
**Status**: ⏳ Pending
**Assigned**: react-mui-frontend-engineer

**Files to modify:**

1. **`src/components/sections/crm/opportunity-details/OpportunityHeader.jsx`**
   - Add "Create Proposal" button to header actions
   - Button visibility: Only for opportunities in stages 'proposal' or 'negotiation'
   - Badge showing count of linked proposals
   - Click opens CreateProposalDialog

2. **`src/components/sections/crm/opportunity-details/OpportunityProposals.jsx`** (New tab)
   - New tab in opportunity detail tabs: "Proposals"
   - Lists all proposals linked to this opportunity
   - Card view with: proposal_number, status chip, total_amount, valid_until
   - Click card → Navigate to proposal detail
   - Empty state: "No proposals yet" with "Create Proposal" button

**Deliverables:**
- OpportunityHeader enhanced with "Create Proposal" button
- OpportunityProposals tab created
- Integration tested: Create proposal from opportunity → appears in list

---

### Step 11: Create State Management Provider

**Duration**: 1-2 hours
**Status**: ⏳ Pending
**Assigned**: wiring-agent

**File to create:** `src/providers/CRMProposalsProvider.jsx`

**Requirements:**
- React Context + useReducer pattern
- State: selectedProposals (array), filters (status, search), sortBy
- Actions:
  - selectProposal, deselectProposal, clearSelection
  - setFilters, setSortBy
- Pattern: Copy from CRMLeadsProvider

**Deliverables:**
- CRMProposalsProvider.jsx created
- Integrated into app layout or proposals pages

---

### Step 12: Update Routes & Navigation

**Duration**: 1 hour
**Status**: ⏳ Pending
**Assigned**: wiring-agent

**Files to modify:**

1. **`src/routes/paths.js`**
   - Add proposals routes:
     ```javascript
     proposals: {
       root: '/apps/crm/proposals',
       detail: (id) => `/apps/crm/proposals/${id}`
     }
     ```

2. **`src/routes/sitemap.js`**
   - Add proposals menu item in CRM section:
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

**Deliverables:**
- Routes added to paths.js
- Navigation updated in sitemap.js
- Proposals menu item appears in CRM section

---

### Step 13: Create E2E Tests

**Duration**: 3-4 hours
**Status**: ⏳ Pending
**Assigned**: playwright-tester

**Files to create:**

1. **`tests/crm-proposals.spec.js`** (35 active tests)

**Test suites:**

**Proposals List View (8 tests):**
- List page renders with all proposals
- Status filter tabs work (All, Draft, Sent, Accepted, Rejected, Expired)
- Search by proposal number filters correctly
- Click row navigates to detail page
- Proposals sorted by created_at DESC by default
- Actions dropdown appears on hover
- Edit action only available for draft proposals
- Delete action shows confirmation dialog

**Proposal Creation (10 tests):**
- "Create Proposal" button appears on opportunity detail (proposal/negotiation stages)
- Button hidden for closed opportunities
- Dialog opens with pre-filled title, valid_until, terms
- Add line item row creates empty row
- Edit line item updates totals in real-time
- Delete line item with confirmation removes row
- Drag reorder updates sort_order
- Subtotal, tax, total calculations correct
- "Save as Draft" creates proposal with status='draft'
- Validation prevents save with empty line items
- Cancel discards changes

**Status Transitions (8 tests):**
- "Send Proposal" validates required data
- "Send" generates PDF and updates status to 'sent'
- "Preview PDF" opens PDF in new tab (blob URL)
- "Download PDF" triggers file download
- "Mark as Accepted" updates status and timestamp
- "Mark as Rejected" updates status
- "Revise" creates new draft from sent proposal
- Expired status displays correctly

**PDF Generation (5 tests):**
- PDF generates with correct proposal data
- PDF includes all line items
- PDF shows correct totals
- PDF includes terms and conditions
- Downloaded PDF has correct filename (PROP-XXXX-XXX.pdf)

**Integration Tests (4 tests):**
- Proposal links to correct opportunity
- Opportunity detail shows linked proposals count
- Account info displays correctly in proposal
- Proposal list filters by opportunity_id

2. **`tests/crm-proposals-multi-tenancy.spec.js`** (6 tests marked .skip())
   - Organization data isolation verification
   - RLS policy enforcement
   - Cross-org proposal access prevention
   - Will be enabled after Phase 1.2 completion

**Total: 41 tests (35 active, 6 pending Phase 1.2)**

**Deliverables:**
- 2 test files created
- 35 active tests passing
- 6 multi-tenancy tests marked .skip()
- Screenshots captured during test runs

---

### Step 14: Verification & Polish

**Duration**: 2-3 hours
**Status**: ⏳ Pending
**Assigned**: Orchestrator + verification sub-agent (if available)

**Commands to run:**
```bash
npm run lint
npm run build
npm run test:e2e -- crm-proposals
```

**Manual Testing Checklist:**
- [ ] Navigate to `/apps/crm/proposals` - List renders
- [ ] Status filter tabs work correctly
- [ ] Search functionality works
- [ ] Create proposal from opportunity detail
- [ ] Add, edit, delete line items
- [ ] Drag-drop reordering works
- [ ] Real-time totals calculation accurate
- [ ] "Save as Draft" creates proposal
- [ ] "Send Proposal" generates PDF and updates status
- [ ] "Preview PDF" opens in new tab
- [ ] "Download PDF" downloads correctly
- [ ] "Mark as Accepted" updates status
- [ ] "Revise" creates new draft
- [ ] Opportunity shows linked proposals
- [ ] Mobile responsive (< 900px) tested

**Screenshots to capture:**
- Proposals list with all status filters
- Proposal creation dialog with line items
- Proposal detail (draft status)
- Proposal detail (sent status) with action buttons
- PDF preview in new tab
- Opportunity detail with "Create Proposal" button
- Opportunity "Proposals" tab
- Mobile view of line items table

**Deliverables:**
- Build succeeds (exit 0)
- Lint passes (0 errors)
- 35 E2E tests passing
- Manual testing checklist complete
- Screenshots captured

---

### Step 15: Documentation & Commit

**Duration**: 1 hour
**Status**: ⏳ Pending
**Assigned**: documentation-expert (optional) or Orchestrator

**Files to update:**
1. Update this execution document with final results
2. Update `_sys_documents/execution/INDEX-crm-desk-mvp.md`:
   - Mark Phase 1.6 as complete
   - Update overall progress percentage
   - Add verification evidence
3. Capture all verification evidence (build output, test results, screenshots)

**Commit message:**
```
Add Phase 1.6: Proposals & PDF Export (ready for Phase 1.2 integration)

## Overview
Complete proposal generation system with line items management, pricing
calculations, and professional PDF export. All components functional with
mock data, ready for database integration after Phase 1.2.

## Components Added (26 new files)
- ProposalsTable & ProposalsListContainer (list view)
- CreateProposalDialog, ProposalForm, LineItemsTable, ProposalSummary (creation)
- ProposalDetail, ProposalHeader, ProposalOverview, ProposalPDF (detail)
- OpportunityHeader enhancement + OpportunityProposals tab
- CRMProposalsProvider (state management)
- useProposalApi (7 SWR hooks with mock data + TODO markers)

## Tests Created (41 tests total)
- crm-proposals.spec.js (35 active tests)
- crm-proposals-multi-tenancy.spec.js (6 tests marked .skip())

## Features
- 10 mock proposals across all statuses
- Inline editable line items with drag-drop reordering
- Real-time pricing calculations (subtotal, tax, total)
- Professional PDF generation with React-PDF
- Status workflow: Draft → Sent → Accepted/Rejected/Expired
- Audit trail with 'Revise' functionality

## Verification Evidence
✅ Build: Exit 0
✅ Lint: 0 errors in Phase 1.6 files
✅ All components functional with mock data
✅ 35 E2E tests passing
✅ PDF generation working

## TODO Markers
~12-15 TODO markers for Phase 1.2 Supabase integration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Deliverables:**
- Execution document updated with final status
- INDEX updated with Phase 1.6 completion
- Final commit with comprehensive message

---

## Progress Tracking

### Overall Progress: 0% (0 of 15 steps complete)

**Pending (100%):**
- [ ] Step 1: Install React-PDF dependency
- [ ] Step 2: Create mock proposal data
- [ ] Step 3: Create useProposalApi SWR hooks
- [ ] Step 4: Create utility functions
- [ ] Step 5: Create ProposalsTable & list view
- [ ] Step 6: Create ProposalPDF component
- [ ] Step 7: Create LineItemsTable component
- [ ] Step 8: Create proposal creation components
- [ ] Step 9: Create proposal detail components
- [ ] Step 10: Enhance OpportunityDetail with proposals
- [ ] Step 11: Create CRMProposalsProvider
- [ ] Step 12: Update routes & navigation
- [ ] Step 13: Create E2E tests
- [ ] Step 14: Verification & polish
- [ ] Step 15: Documentation & commit

### Files to Create (26+ files)

**Data Layer (3 files):**
- src/data/crm/proposals.js
- src/services/swr/api-hooks/useProposalApi.js
- src/providers/CRMProposalsProvider.jsx

**Utilities (3 files):**
- src/utils/crm/proposalCalculations.js
- src/utils/crm/proposalNumberGenerator.js
- src/constants/crm/proposalDefaults.js

**List View (3 files):**
- src/components/sections/crm/proposals-list/ProposalsTable.jsx
- src/components/sections/crm/proposals-list/ProposalsListContainer.jsx
- src/app/(main)/apps/crm/proposals/page.jsx

**Creation Components (4 files):**
- src/components/sections/crm/proposals/CreateProposalDialog.jsx
- src/components/sections/crm/proposals/ProposalForm.jsx
- src/components/sections/crm/proposals/LineItemsTable.jsx
- src/components/sections/crm/proposals/ProposalSummary.jsx
- src/components/sections/crm/proposals/ProposalTerms.jsx

**Detail Components (5 files):**
- src/components/sections/crm/proposal-detail/ProposalDetail.jsx
- src/components/sections/crm/proposal-detail/ProposalHeader.jsx
- src/components/sections/crm/proposal-detail/ProposalOverview.jsx
- src/components/sections/crm/proposal-detail/ProposalLineItemsDisplay.jsx
- src/components/sections/crm/proposal-detail/ProposalPDF.jsx
- src/app/(main)/apps/crm/proposals/[id]/page.jsx

**Opportunity Integration (1 new file + 1 modification):**
- src/components/sections/crm/opportunity-details/OpportunityProposals.jsx (new)
- src/components/sections/crm/opportunity-details/OpportunityHeader.jsx (modify)

**Tests (2 files):**
- tests/crm-proposals.spec.js
- tests/crm-proposals-multi-tenancy.spec.js

**Routes (2 modifications):**
- src/routes/paths.js (modify)
- src/routes/sitemap.js (modify)

---

## Implementation Log

### 2026-01-29 - Phase 1.6 Setup

- Created Phase 1.6 design document
- Created Phase 1.6 execution document
- Design validated through Q&A brainstorming session
- Ready to begin implementation with sub-agents

**Status**: Ready for GitHub issue creation and feature branch setup
**Next Action**: Create GitHub issue, create feature branch, begin Step 1

---

## Current State

### Completed
- [x] Design document created and committed
- [x] Execution document created

### Pending
- [ ] GitHub issue created
- [ ] Feature branch created
- [ ] All 15 implementation steps

---

## Code References

Will be populated as implementation progresses.

---

## Technical Notes

**Major technical decisions tracked in INDEX Technical Decisions Log.** This section documents phase-specific implementation details only.

### Implementation Strategy

**Mock Data First Pattern:**
- Following Phase 1.3/1.4/1.5 proven strategy
- All UI fully functional with mock data
- TODO markers for Supabase integration after Phase 1.2
- Unblocks Phase 1.6 while Phase 1.2 (60% complete) finishes

**Sub-Agent Delegation:**
- wiring-agent: Data layer, API hooks, state management, routes
- react-mui-frontend-engineer: All UI components, PDF generation
- playwright-tester: E2E test suites
- documentation-expert: Final documentation updates (optional)

**Copy-Then-Modify Pattern:**
- ProposalsTable ← LeadsTable
- ProposalsListContainer ← LeadsListContainer
- CreateProposalDialog ← ConvertLeadModal (pattern)
- ProposalDetail ← OpportunityDetail (pattern)

---

## Verification Evidence

Will be captured in Step 14.

---

## Screenshots

Will be captured in Step 14.

---

## Blockers

**Current blockers tracked in INDEX Current Blockers section.**

### Phase-Specific Blockers

**None currently.** Phase 1.6 uses mock data strategy to avoid dependency on Phase 1.2 completion.

### Resolved Blockers

None yet.

---

## Next Steps

1. Create GitHub issue for Phase 1.6
2. Create feature branch: `feature/desk-proposals-phase1.6`
3. Install @react-pdf/renderer dependency (Step 1)
4. Delegate Step 2 (mock data) to wiring-agent
5. Continue through all 15 steps with sub-agent delegation

---

## Related Issues

- Phase 1.1: Database Schema (Complete - proposals tables exist)
- Phase 1.2: Auth & Multi-Tenancy (60% complete - integration deferred)
- Phase 1.5: Opportunities Pipeline (Complete - integration point)
- Phase 1.7: CRM Dashboard (Blocked by Phase 1.6 - needs proposal metrics)

---

**Status**: ⏳ Planned - Ready for GitHub Issue + Feature Branch Setup
**Next Action**: Create GitHub issue and feature branch
**Owner**: Pierce Team + Claude Code (Orchestrator)
**Last Updated**: 2026-01-29
