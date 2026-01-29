# Documentation Compliance Remediation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal**: Bring PierceDesk documentation into full compliance with the Documentation Guide framework by organizing files, creating missing as-builts, and establishing user-facing documentation structure.

**Architecture**: Hybrid documentation system with internal tracking (_sys_documents/) and user-facing documentation (docs/). Living as-built documents reflect deployed state.

**Tech Stack**: Markdown documentation, YAML frontmatter, template-based generation

**Audit Reference**: [_sys_documents/execution/DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md](../../_sys_documents/execution/DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md)

---

## Task 1: Organize Quality Documentation Files

**Files:**
- Move: `docs/SECURITY-AUDIT.md` → `docs/quality/SECURITY-AUDIT.md`
- Move: `docs/RLS-VERIFICATION-GUIDE.md` → `docs/quality/RLS-VERIFICATION-GUIDE.md`
- Move: `docs/PERFORMANCE-BENCHMARKS.md` → `docs/quality/PERFORMANCE-BENCHMARKS.md`
- Move: `docs/MOBILE-RESPONSIVENESS-AUDIT.md` → `docs/quality/MOBILE-RESPONSIVENESS-AUDIT.md`
- Modify: `docs/README.md`

**Step 1: Create quality directory**

```bash
mkdir -p docs/quality
```

**Step 2: Move quality documentation files**

```bash
git mv docs/SECURITY-AUDIT.md docs/quality/
git mv docs/RLS-VERIFICATION-GUIDE.md docs/quality/
git mv docs/PERFORMANCE-BENCHMARKS.md docs/quality/
git mv docs/MOBILE-RESPONSIVENESS-AUDIT.md docs/quality/
```

**Step 3: Create quality README**

Create: `docs/quality/README.md`

```markdown
# Quality Assurance Documentation

This directory contains quality assurance documentation including security audits, performance benchmarks, and testing guides.

## Contents

### Security
- [Security Audit](SECURITY-AUDIT.md) - Security assessment and vulnerability checklist
- [RLS Verification Guide](RLS-VERIFICATION-GUIDE.md) - Row Level Security verification procedures

### Performance
- [Performance Benchmarks](PERFORMANCE-BENCHMARKS.md) - Performance metrics and optimization targets
- [Mobile Responsiveness Audit](MOBILE-RESPONSIVENESS-AUDIT.md) - Mobile responsiveness testing results

## Related Documentation

- [Testing Documentation](../testing/) - E2E and unit testing guides
- [Authentication](../authentication/) - Authentication and authorization
- [Architecture](../architecture/) - System architecture
```

**Step 4: Update docs/README.md**

Update the "Documentation Structure" section to add quality documentation:

```markdown
### Quality Assurance
- [Quality Documentation](quality/) - Security, performance, and QA
```

**Step 5: Verify file organization**

Run: `ls -la docs/quality/`

Expected: 4 files moved successfully + README.md

**Step 6: Commit file organization**

```bash
git add docs/quality/ docs/README.md
git commit -m "docs: organize quality documentation into dedicated directory

- Move security and performance audits to docs/quality/
- Create quality README with navigation
- Update main docs README with quality section

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create User-Facing Documentation Structure

**Files:**
- Create: `docs/features/README.md`
- Create: `docs/api/README.md`
- Modify: `docs/README.md`

**Step 1: Create features directory and README**

```bash
mkdir -p docs/features
```

Create: `docs/features/README.md`

```markdown
# Feature Documentation

User-facing documentation for PierceDesk features.

## CRM Desk (Phase 1)

### Core Features
- [CRM Desk Overview](CRM-DESK.md) - Complete CRM feature guide *(Coming Soon)*
- [Accounts & Contacts](ACCOUNTS-CONTACTS.md) - Account management *(Coming Soon)*
- [Leads Management](LEADS.md) - Lead capture and qualification *(Coming Soon)*
- [Opportunity Pipeline](OPPORTUNITIES.md) - Sales pipeline and forecasting *(Coming Soon)*
- [Proposals](PROPOSALS.md) - Proposal generation and PDF export *(Coming Soon)*

### Authentication
- [Authentication](../authentication/) - User authentication and organization setup

## Service Desk (Phase 2)

Coming in Phase 2...

## Project Desk (Phase 2)

Coming in Phase 2...

## Related Documentation

- [User Journeys](../user-journeys/) - Role-based user journeys
- [API Reference](../api/) - REST API documentation
- [Architecture](../architecture/) - System design and patterns
```

**Step 2: Create API directory and README**

```bash
mkdir -p docs/api
```

Create: `docs/api/README.md`

```markdown
# API Documentation

REST API reference for PierceDesk.

## CRM Desk APIs

- [REST API Reference](REST-API.md) - Complete API reference *(Coming Soon)*
- [Leads API](LEADS-API.md) - Lead endpoints *(Coming Soon)*
- [Opportunities API](OPPORTUNITIES-API.md) - Opportunity endpoints *(Coming Soon)*
- [Proposals API](PROPOSALS-API.md) - Proposal endpoints *(Coming Soon)*

## Authentication

See [Authentication Documentation](../authentication/SUPABASE-AUTH.md) for auth endpoints and session management.

## Data Models

See [Database Schema As-Built](../../_sys_documents/as-builts/database-schema-as-built.md) for complete schema documentation.

## Related Documentation

- [Feature Documentation](../features/) - User-facing feature guides
- [Architecture](../architecture/) - System design
```

**Step 3: Update docs/README.md**

Add two new sections:

```markdown
### Features
- [Feature Documentation](features/) - User-facing feature guides

### API Reference
- [API Documentation](api/) - REST API reference
```

**Step 4: Verify directory structure**

Run: `find docs/features docs/api -type f`

Expected:
```
docs/features/README.md
docs/api/README.md
```

**Step 5: Commit documentation structure**

```bash
git add docs/features/ docs/api/ docs/README.md
git commit -m "docs: create user-facing documentation structure

- Add docs/features/ for feature guides
- Add docs/api/ for API reference
- Update main README with navigation links
- Mark coming soon content for future phases

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update INDEX with Abbreviated Workflow Decision

**Files:**
- Modify: `_sys_documents/execution/INDEX-crm-desk-mvp.md`

**Step 1: Read current INDEX**

Run: `cat _sys_documents/execution/INDEX-crm-desk-mvp.md | head -50`

**Step 2: Add documentation decision to Technical Decisions Log**

Add new entry after Decision 3 (line ~326):

```markdown
### Decision 4: Abbreviated Documentation Workflow for Phases 1.3-1.5

- **Date**: 2026-01-29
- **Context**: Phases 1.3-1.5 completed without implementation plans in `docs/plans/`
- **Decision**: Accept abbreviated workflow for these phases; no retrospective plans
- **Rationale**:
  - Phases implemented with mock data (shallow impact at time of execution)
  - Comprehensive execution documents exist with implementation logs
  - Design documents exist for Phases 1.4 and 1.5
  - Creating retrospective plans offers minimal value vs. cost
  - Phases 1.6+ will follow full workflow (plan → design → execution → as-built)
- **Impact**:
  - Documentation framework remains valid going forward
  - Past work documented in execution docs and git history
  - Compliance audit documents rationale (see DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md)
```

**Step 3: Update Documentation Compliance section**

Add new section after "Related Documentation" (line ~453):

```markdown
## Documentation Compliance

### Framework Adherence

This feature follows the [Documentation Guide](../../docs/guides/DOCUMENTATION-GUIDE.md) framework with the following documented deviations:

**Phases 1.1-1.2**: ✅ Full workflow (plan, design, execution, as-built)
**Phases 1.3-1.5**: ⚠️ Abbreviated workflow (design + execution only, see Decision 4)
**Phases 1.6-1.8**: ✅ Full workflow

### Compliance Status

See [Documentation Compliance Audit](DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md) for complete assessment.

**Action Items**:
- [ ] Create CRM Desk MVP as-built after Phase 1.2 merge
- [ ] Create Auth & Multi-Tenancy as-built after Phase 1.2 merge
- [ ] Create user-facing CRM Desk guide (`docs/features/CRM-DESK.md`)
- [ ] Create REST API reference (`docs/api/REST-API.md`)
- [ ] Create component as-builts (accounts, leads, opportunities, testing)
```

**Step 4: Verify changes**

Run: `grep -A 5 "Decision 4" _sys_documents/execution/INDEX-crm-desk-mvp.md`

Expected: New decision logged

**Step 5: Commit INDEX update**

```bash
git add _sys_documents/execution/INDEX-crm-desk-mvp.md
git commit -m "docs: document abbreviated workflow decision in INDEX

- Add Decision 4 explaining Phases 1.3-1.5 abbreviated workflow
- Add Documentation Compliance section with action items
- Reference compliance audit document
- Full workflow resumes with Phase 1.6+

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create CRM Desk MVP As-Built (After Phase 1.2 Merge)

**Files:**
- Create: `_sys_documents/as-builts/crm-desk-mvp-as-built.md`

**PREREQUISITE**: Wait for Phase 1.2 completion and merge

**Step 1: Copy as-built template**

```bash
cp .claude/templates/as-built-template.md \
   _sys_documents/as-builts/crm-desk-mvp-as-built.md
```

**Step 2: Fill in frontmatter**

Update YAML frontmatter:

```yaml
---
title: "CRM Desk MVP - As-Built"
type: "as-built"
version: "1.0.0"
last_updated: "YYYY-MM-DD"
reflects_code_as_of: "commit <hash>"
verified_by: "Claude Sonnet 4.5"
category: "feature"
---
```

**Step 3: Write overview section**

```markdown
## Document Purpose

This as-built document captures the actual implemented state of the CRM Desk MVP, serving as the source of truth for:
- Complete feature architecture (lead → opportunity → proposal flow)
- All React components and their patterns
- API surface and data layer
- Integration points (Supabase Auth, RLS, SWR hooks)
- Current feature status and known limitations

## Overview

### What This Is

The CRM Desk is the first operational "desk" in PierceDesk's Desk-First Architecture. It manages customer relationships from first contact through closed deals, demonstrating the Digital Thread pattern and establishing foundational patterns for all future desks.

### Current Status
- **Status**: Active (87.5% complete - Phase 1.2 pending)
- **Stability**: Beta (mock data operational, Supabase integration in progress)
- **Last Major Change**: 2026-01-29 (Phase 1.8 completion)
- **Next Planned Changes**: Phase 1.2 completion (Auth & Multi-Tenancy integration)
```

**Step 4: Write architecture section**

Include:
- High-level component diagram
- Key components list (16 from Phase 1.3, 9 from Phase 1.4, etc.)
- Data flow (lead → opportunity → proposal)
- Integration points (Supabase, SWR, React-PDF)

**Step 5: Write implementation details section**

Include:
- Component inventory with file paths
- SWR hooks structure
- Mock data patterns
- State management (Providers)

**Step 6: Write testing section**

Include:
- E2E test coverage (79 + 35 + 38 + 23 = 175 tests)
- Test organization patterns
- Known test gaps (multi-tenancy awaiting Phase 1.2)

**Step 7: Verify completeness**

Check template sections:
- [ ] Overview complete
- [ ] Architecture documented
- [ ] Implementation details captured
- [ ] Testing documented
- [ ] Known issues listed
- [ ] Change history started

**Step 8: Commit as-built**

```bash
git add _sys_documents/as-builts/crm-desk-mvp-as-built.md
git commit -m "docs: create CRM Desk MVP as-built documentation

- Complete feature overview and architecture
- Component inventory (50+ React components)
- API surface and data layer patterns
- E2E test coverage (175 tests)
- Current status and next steps

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Auth & Multi-Tenancy As-Built (After Phase 1.2 Merge)

**Files:**
- Create: `_sys_documents/as-builts/authentication-multi-tenancy-as-built.md`

**PREREQUISITE**: Wait for Phase 1.2 completion and merge

**Step 1: Copy as-built template**

```bash
cp .claude/templates/as-built-template.md \
   _sys_documents/as-builts/authentication-multi-tenancy-as-built.md
```

**Step 2: Fill in frontmatter**

```yaml
---
title: "Authentication & Multi-Tenancy - As-Built"
type: "as-built"
version: "1.0.0"
last_updated: "YYYY-MM-DD"
reflects_code_as_of: "commit <hash>"
verified_by: "Claude Sonnet 4.5"
category: "architecture"
---
```

**Step 3: Write overview section**

```markdown
## Overview

### What This Is

The authentication and multi-tenancy system provides Supabase-based authentication with organization-scoped data isolation. All API operations and database queries enforce RLS policies based on the user's organization context.

### Current Status
- **Status**: Active
- **Stability**: Stable
- **Last Major Change**: YYYY-MM-DD (Phase 1.2 completion)
- **Next Planned Changes**: None planned
```

**Step 4: Document architecture**

Include:
- Supabase Auth flow
- Organization selection/creation
- Session management
- RLS policy enforcement
- Multi-org testing patterns

**Step 5: Document implementation**

Include:
- Auth components and flows
- Session context providers
- API client configuration
- Database RLS policies (reference database-schema-as-built.md)

**Step 6: Document security**

Include:
- Authentication methods
- Permission model
- RLS policy overview
- Input validation
- Known security considerations

**Step 7: Commit as-built**

```bash
git add _sys_documents/as-builts/authentication-multi-tenancy-as-built.md
git commit -m "docs: create auth & multi-tenancy as-built

- Supabase Auth integration details
- Organization selection flow
- Session management patterns
- RLS policy enforcement
- Multi-org testing procedures

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create CRM Desk Feature Guide (User-Facing)

**Files:**
- Create: `docs/features/CRM-DESK.md`

**PREREQUISITE**: Wait for Phase 1.2 completion for accurate screenshots

**Step 1: Create feature guide skeleton**

Create: `docs/features/CRM-DESK.md`

```markdown
# CRM Desk - Feature Guide

## Overview

The CRM Desk manages customer relationships from first contact through closed deals. It provides a complete sales pipeline with lead qualification, opportunity tracking, and proposal generation.

## Key Features

### 1. Account & Contact Management
- Centralized customer database
- Contact-to-account associations with roles
- Activity timeline (Digital Thread)
- Bulk operations and search

**Learn More**: [Accounts & Contacts Guide](ACCOUNTS-CONTACTS.md)

### 2. Lead Capture & Qualification
- Lead form (internal + public-facing)
- Status-based workflow (New → Contacted → Qualified/Unqualified)
- Lead-to-opportunity conversion
- Source tracking

**Learn More**: [Leads Management Guide](LEADS.md)

### 3. Opportunity Pipeline
- Kanban board with 5 stages (Prospecting → Closed Won/Lost)
- Weighted forecasting
- Pipeline metrics and analytics
- Stage-based probability

**Learn More**: [Opportunity Pipeline Guide](OPPORTUNITIES.md)

### 4. Proposal Generation
- Line item builder
- PDF export
- Status tracking (Draft → Sent → Accepted/Rejected)
- Opportunity linking

**Learn More**: [Proposals Guide](PROPOSALS.md)

### 5. CRM Dashboard
- Pipeline value and weighted forecast
- Conversion rates (lead → opportunity → won)
- Recent activities
- Top opportunities by value

## User Journeys

See role-based guides:
- [Sales Account Manager Journey](../user-journeys/sales-account-manager-phase1-crm.md)
- [Sales Manager Journey](../user-journeys/sales-manager-phase1-crm.md)

## Getting Started

[Add getting started steps after Phase 1.2 merge]

## API Reference

See [REST API Documentation](../api/REST-API.md) for programmatic access.

## Architecture

See [Desk Architecture](../architecture/DESK-ARCHITECTURE.md) for technical details.
```

**Step 2: Add screenshots section placeholders**

```markdown
## Screenshots

### Account Management
![Accounts List](screenshots/accounts-list.png)
![Account Detail](screenshots/account-detail.png)

### Lead Qualification
![Leads List](screenshots/leads-list.png)
![Lead Detail](screenshots/lead-detail.png)

### Opportunity Pipeline
![Opportunities Kanban](screenshots/opportunities-kanban.png)
![Forecasting Dashboard](screenshots/forecasting-dashboard.png)

### Proposals
![Proposals List](screenshots/proposals-list.png)
![Proposal Detail](screenshots/proposal-detail.png)
```

**Step 3: Verify structure**

Run: `wc -l docs/features/CRM-DESK.md`

Expected: ~100+ lines (skeleton complete)

**Step 4: Commit feature guide**

```bash
git add docs/features/CRM-DESK.md
git commit -m "docs: create CRM Desk feature guide

- Complete feature overview
- Key features breakdown with links to detailed guides
- User journey references
- Screenshot placeholders (to be added post-Phase 1.2)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create REST API Reference (User-Facing)

**Files:**
- Create: `docs/api/REST-API.md`

**Step 1: Create API reference skeleton**

Create: `docs/api/REST-API.md`

```markdown
# REST API Reference

PierceDesk REST API for programmatic access to CRM Desk features.

## Base URL

```
http://localhost:4000/api
```

## Authentication

All API endpoints require authentication via Supabase session cookie. See [Authentication Documentation](../authentication/SUPABASE-AUTH.md).

## Endpoints

### Accounts API

#### GET /api/accounts
List all accounts for the current organization.

**Query Parameters:**
- `search` (string, optional) - Search by account name
- `limit` (number, optional) - Results per page (default: 50)
- `offset` (number, optional) - Pagination offset

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "industry": "Technology",
      "website": "https://acme.com",
      "created_at": "2026-01-27T10:00:00Z"
    }
  ],
  "total": 42
}
```

#### GET /api/accounts/:id
Get account details by ID.

**Response:**
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "industry": "Technology",
  "website": "https://acme.com",
  "contacts": [...],
  "opportunities": [...],
  "activities": [...]
}
```

### Leads API

#### POST /api/leads
Create a new lead.

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "company": "Example Inc",
  "source": "website",
  "notes": "Interested in product demo"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "new",
  "created_at": "2026-01-29T14:30:00Z"
}
```

### Opportunities API

[Add opportunities endpoints]

### Proposals API

[Add proposals endpoints]

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "field": "email"
  }
}
```

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

[To be implemented]

## Webhooks

[To be implemented in Phase 2]

## Related Documentation

- [Feature Documentation](../features/CRM-DESK.md)
- [Database Schema](../../_sys_documents/as-builts/database-schema-as-built.md)
- [Authentication](../authentication/SUPABASE-AUTH.md)
```

**Step 2: Verify API reference structure**

Run: `grep "^###" docs/api/REST-API.md`

Expected: List of API endpoint headers

**Step 3: Commit API reference**

```bash
git add docs/api/REST-API.md
git commit -m "docs: create REST API reference

- Base URL and authentication
- Accounts API endpoints
- Leads API endpoints
- Error handling and status codes
- Placeholders for opportunities and proposals APIs

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Update CLAUDE.md Documentation Section

**Files:**
- Modify: `CLAUDE.md` (lines 153-305)

**Step 1: Read current documentation section**

Run: `sed -n '153,305p' CLAUDE.md`

**Step 2: Add explicit plan document requirement**

Add after line 305 (end of current Documentation Standards section):

```markdown
#### Plan Documents (MANDATORY)

**All implementation work MUST have a plan document:**

```bash
# Create plan before starting any phase implementation
cp .claude/templates/INDEX-template.md \
   docs/plans/YYYY-MM-DD-phase-X.Y-topic.md
```

**Plan Requirements:**
- Bite-sized tasks (2-5 minutes each)
- Exact file paths for all changes
- Verification commands
- Test-first approach (TDD)
- Commit strategy

**Location**: `docs/plans/YYYY-MM-DD-description.md`

**When to Use Abbreviated Workflow:**
- Single file or ≤ 3 files modified
- < 50 lines of code total
- No architectural decisions
- No database schema changes
- No API contract changes

**If abbreviated**: Document decision in INDEX with rationale.
```

**Step 3: Elevate as-built requirements**

Add new subsection after plan documents:

```markdown
#### As-Built Documents (MANDATORY AFTER MERGE)

**After merging ANY feature, create as-built documentation:**

```bash
cp .claude/templates/as-built-template.md \
   _sys_documents/as-builts/feature-name-as-built.md
```

**As-Built Purpose:**
- Single source of truth for deployed state
- Living document (updated with changes)
- Includes verification commands
- Version incremented on updates

**Required As-Builts:**
- Feature-level (e.g., `crm-desk-mvp-as-built.md`)
- Component-level (e.g., `authentication-as-built.md`)
- Database schema (`database-schema-as-built.md`)

**Update Frequency**: With every significant change or quarterly verification.
```

**Step 4: Add user-facing documentation checklist**

Add after as-built section:

```markdown
#### User-Facing Documentation Checklist

**Before marking feature complete:**

- [ ] Feature guide created in `docs/features/`
- [ ] API endpoints documented in `docs/api/`
- [ ] Architecture docs updated if needed
- [ ] User journey documents updated
- [ ] Screenshots captured and embedded
- [ ] Getting started guide written

**Documentation Compliance:**

See [Documentation Compliance Audit Template](docs/plans/2026-01-29-documentation-compliance-remediation.md) for assessment process.
```

**Step 5: Verify CLAUDE.md changes**

Run: `grep -A 3 "Plan Documents (MANDATORY)" CLAUDE.md`

Expected: New sections present

**Step 6: Commit CLAUDE.md update**

```bash
git add CLAUDE.md
git commit -m "docs: strengthen documentation requirements in CLAUDE.md

- Add explicit plan document requirements
- Elevate as-built requirements to dedicated section
- Add user-facing documentation checklist
- Reference compliance audit process

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Create Verification Script

**Files:**
- Create: `scripts/verify-documentation.sh`

**Step 1: Create scripts directory if needed**

```bash
mkdir -p scripts
```

**Step 2: Create verification script**

Create: `scripts/verify-documentation.sh`

```bash
#!/bin/bash
# Documentation compliance verification script

set -e

echo "🔍 Verifying documentation compliance..."
echo ""

# Check for required directories
echo "📁 Checking directory structure..."
required_dirs=(
    "docs/architecture"
    "docs/features"
    "docs/api"
    "docs/quality"
    "docs/guides"
    "docs/authentication"
    "docs/testing"
    "docs/user-journeys"
    "_sys_documents/vision"
    "_sys_documents/roadmap"
    "_sys_documents/design"
    "_sys_documents/execution"
    "_sys_documents/as-builts"
)

for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "  ✅ $dir"
    else
        echo "  ❌ Missing: $dir"
    fi
done

echo ""
echo "📄 Checking required documentation files..."

# Check for root README files
required_files=(
    "docs/README.md"
    "docs/features/README.md"
    "docs/api/README.md"
    "docs/quality/README.md"
    "_sys_documents/AGENT.md"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ Missing: $file"
    fi
done

echo ""
echo "📋 Checking INDEX documents..."

# Find all INDEX files
index_count=$(find _sys_documents/execution -name "INDEX-*.md" | wc -l)
echo "  Found $index_count INDEX documents"

# Verify INDEX frontmatter
for index in _sys_documents/execution/INDEX-*.md; do
    if grep -q "^github_issue:" "$index" && \
       grep -q "^feature_branch:" "$index" && \
       grep -q "^status:" "$index"; then
        echo "  ✅ $(basename $index) - Valid frontmatter"
    else
        echo "  ⚠️ $(basename $index) - Missing frontmatter fields"
    fi
done

echo ""
echo "📊 Counting documentation by type..."

echo "  Plans (docs/plans/): $(find docs/plans -name "*.md" 2>/dev/null | wc -l)"
echo "  Design docs (_sys_documents/design/): $(find _sys_documents/design -name "*.md" 2>/dev/null | wc -l)"
echo "  Execution docs (_sys_documents/execution/): $(find _sys_documents/execution -name "*.md" 2>/dev/null | wc -l)"
echo "  As-builts (_sys_documents/as-builts/): $(find _sys_documents/as-builts -name "*.md" 2>/dev/null | wc -l)"

echo ""
echo "🎯 Checking for disjointed root-level docs..."

# Check for markdown files in docs root (excluding README)
root_docs=$(find docs -maxdepth 1 -name "*.md" ! -name "README.md" 2>/dev/null)
if [ -z "$root_docs" ]; then
    echo "  ✅ No disjointed files in docs/ root"
else
    echo "  ⚠️ Found root-level docs (should be in subdirectories):"
    echo "$root_docs" | sed 's/^/    /'
fi

echo ""
echo "✅ Documentation verification complete!"
```

**Step 3: Make script executable**

```bash
chmod +x scripts/verify-documentation.sh
```

**Step 4: Run verification script**

Run: `./scripts/verify-documentation.sh`

Expected: Output showing compliance status

**Step 5: Commit verification script**

```bash
git add scripts/verify-documentation.sh
git commit -m "feat: add documentation compliance verification script

- Check directory structure
- Verify required files exist
- Validate INDEX frontmatter
- Count documentation by type
- Identify disjointed root-level files

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Final Verification and Compliance Report

**Step 1: Run verification script**

Run: `./scripts/verify-documentation.sh`

Expected: Green checkmarks for immediate actions completed

**Step 2: Run build verification**

Run: `npm run build`

Expected: Exit 0 (no errors)

**Step 3: Run lint verification**

Run: `npm run lint`

Expected: 0 errors

**Step 4: Verify git status**

Run: `git status`

Expected: All changes committed

**Step 5: Generate compliance report**

Create: `_sys_documents/execution/DOCUMENTATION-COMPLIANCE-REPORT-2026-01-29.md`

```markdown
---
title: "Documentation Compliance Report - Post-Remediation"
type: "report"
status: "complete"
created: "2026-01-29"
verified_by: "Claude Sonnet 4.5"
---

# Documentation Compliance Report - Post-Remediation

## Summary

Completed immediate compliance remediation actions as per [DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md](DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md).

## Actions Completed

### ✅ Task 1: File Organization
- Created `docs/quality/` directory
- Moved 4 quality documentation files
- Created quality README with navigation
- Updated main docs README

### ✅ Task 2: User-Facing Documentation Structure
- Created `docs/features/` directory with README
- Created `docs/api/` directory with README
- Updated main docs README with new sections

### ✅ Task 3: INDEX Update
- Documented Decision 4 (abbreviated workflow for Phases 1.3-1.5)
- Added Documentation Compliance section to INDEX
- Listed action items for remaining work

### ✅ Task 8: CLAUDE.md Update
- Added explicit plan document requirements
- Elevated as-built requirements
- Added user-facing documentation checklist

### ✅ Task 9: Verification Script
- Created `scripts/verify-documentation.sh`
- Automated compliance checking
- Identifies gaps quickly

## Remaining Actions

### 🕐 Pending Phase 1.2 Completion

#### Task 4: CRM Desk MVP As-Built
- **Status**: Waiting for Phase 1.2 merge
- **Priority**: HIGH
- **Estimated Effort**: 2 hours
- **File**: `_sys_documents/as-builts/crm-desk-mvp-as-built.md`

#### Task 5: Auth & Multi-Tenancy As-Built
- **Status**: Waiting for Phase 1.2 merge
- **Priority**: HIGH
- **Estimated Effort**: 2 hours
- **File**: `_sys_documents/as-builts/authentication-multi-tenancy-as-built.md`

#### Task 6: CRM Desk Feature Guide
- **Status**: Waiting for Phase 1.2 merge (for accurate screenshots)
- **Priority**: MEDIUM
- **Estimated Effort**: 3 hours
- **File**: `docs/features/CRM-DESK.md`

#### Task 7: REST API Reference
- **Status**: Waiting for Phase 1.2 merge (for accurate endpoints)
- **Priority**: MEDIUM
- **Estimated Effort**: 2 hours
- **File**: `docs/api/REST-API.md`

### 📅 Before Phase 2 Start

#### Component As-Builts (6-8 hours total)
- `accounts-contacts-as-built.md`
- `leads-management-as-built.md`
- `opportunity-pipeline-as-built.md`
- `testing-infrastructure-as-built.md`

## Compliance Metrics

### Before Remediation
- Plan documents: 6/10 (60%)
- As-built documents: 1/7 (14%)
- User feature docs: 0% coverage
- File organization: 5 disjointed files

### After Immediate Actions
- Plan documents: 6/10 (60% - accepted with Decision 4)
- As-built documents: 1/7 (14% - 2 pending Phase 1.2)
- User feature docs: Structure created (0% content - pending Phase 1.2)
- File organization: ✅ 100% (all files properly categorized)

### Target State (Post-Phase 1.2)
- Plan documents: 6/10 OR documented abbreviated workflow ✅
- As-built documents: 3/7 (43%)
- User feature docs: 2 minimum (CRM-DESK.md, REST-API.md)
- File organization: ✅ 100%

## Verification

### Directory Structure
✅ All required directories exist
✅ Quality documentation organized
✅ Feature and API directories created

### Required Files
✅ All README files present
✅ AGENT.md exists
✅ Compliance audit documented

### INDEX Documents
✅ All INDEX files have valid frontmatter
✅ Decision 4 documented
✅ Action items listed

### Build & Lint
✅ Build succeeds (exit 0)
✅ Lint passes (0 errors)

## Next Steps

1. Complete Phase 1.2 (Auth & Multi-Tenancy)
2. Execute Tasks 4-7 immediately after merge
3. Create component as-builts before Phase 2
4. Run quarterly compliance verification

## Conclusion

Immediate remediation actions complete. Documentation structure now compliant with framework requirements. Remaining work gated on Phase 1.2 completion.

---

**Report Status**: ✅ Complete
**Verification Date**: 2026-01-29
**Next Review**: Post-Phase 1.2 merge
```

**Step 6: Commit compliance report**

```bash
git add _sys_documents/execution/DOCUMENTATION-COMPLIANCE-REPORT-2026-01-29.md
git commit -m "docs: add post-remediation compliance report

- Summary of completed actions
- Remaining work itemized
- Compliance metrics (before/after)
- Verification results
- Next steps clearly defined

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Verification Commands

### How to Verify This Plan is Complete

```bash
# Run documentation verification script
./scripts/verify-documentation.sh

# Check build
npm run build

# Check lint
npm run lint

# Verify all commits
git log --oneline --since="2026-01-29" | grep "docs:"

# Count documentation files
find docs/_sys_documents -name "*.md" | wc -l
```

### Expected Results

- ✅ Verification script passes all checks
- ✅ Build exits with code 0
- ✅ Lint shows 0 errors
- ✅ 10 commits with "docs:" prefix
- ✅ Documentation count increased by 10+ files

---

## Summary

This plan remediates documentation compliance gaps identified in the audit:

**Immediate (Tasks 1-3, 8-10)**: File organization, structure creation, INDEX updates, verification
**After Phase 1.2 (Tasks 4-7)**: Critical as-builts and user-facing documentation
**Before Phase 2**: Component as-builts for comprehensive coverage

**Total Time**: ~2 hours immediate + 9-11 hours post-Phase 1.2

---

**Plan Status**: Ready for execution
**Execution Method**: Task-by-task with superpowers:executing-plans OR superpowers:subagent-driven-development
**Owner**: Pierce Team
**Created**: 2026-01-29
