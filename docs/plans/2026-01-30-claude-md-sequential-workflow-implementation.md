# Sequential Operation Workflow - CLAUDE.md Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Sequential Operation Workflow section to CLAUDE.md with complete orchestrator instructions for bottom-up database wiring pipeline.

**Architecture:** Insert new section between "Skills Framework (MANDATORY)" (line 641) and "Aurora Component Development Guide" (line 865). The new section provides step-by-step orchestrator instructions for converting app sections from mock data to live Supabase database.

**Tech Stack:** Markdown documentation, CLAUDE.md configuration

---

## Task 1: Read Current CLAUDE.md Structure

**Files:**
- Read: `CLAUDE.md` (lines 641-865)

**Step 1: Read the insertion area**

```bash
# Read lines 641-865 to understand current structure
Read tool: CLAUDE.md (offset: 641, limit: 225)
```

Expected: See "## Skills Framework (MANDATORY)" section ending around line 863, followed by "## Aurora Component Development Guide" at line 865.

**Step 2: Verify no conflicts**

Check that there's a clear break between sections (no content that would be disrupted by insertion).

Expected: Clean section boundary with "---" or blank lines.

**Step 3: Note the exact insertion point**

The new section will be inserted at line 864 (after Skills Framework, before Aurora Component Development Guide).

---

## Task 2: Create Sequential Operation Workflow Section Content

**Files:**
- Create: `/tmp/sequential-workflow-section.md` (temporary file for content)

**Step 1: Write section header**

```markdown
## Sequential Operation Workflow (Database Wiring)

<EXTREMELY_IMPORTANT>
When the user requests converting app sections to live database (e.g., "wire CRM to database", "convert dashboard to live data"), you MUST use the Sequential Operation Workflow.

This is a multi-phase orchestrator-driven pipeline that wires existing UI to live Supabase database section-by-section.
</EXTREMELY_IMPORTANT>
```

**Step 2: Add trigger phrases**

```markdown
### Trigger Phrases

Invoke this workflow when user says:
- "Convert [section] to live database"
- "Wire [section] to Supabase"
- "Connect [section] to real data"
- "Remove mock data from [section]"
- "Database wiring for [section]"
```

**Step 3: Add workflow overview**

```markdown
### Workflow Overview

**Bottom-up, sequential, one page at a time:**

1. **Section inventory & brainstorming** - Analyze section, categorize pages by type (List/Create/Interaction/Dashboard)
2. **Create feature branch** - One branch per section for all page types
3. **For each page type** (List → Create → Interaction → Dashboard):
   - Create plan.md with detailed tasks
   - Create GitHub issue via github-workflow skill
   - **For each page in type**:
     - supabase-database-architect → test data layer
     - wiring-agent → test API layer
     - react-mui-frontend-engineer → test UI layer
     - Full E2E integration test
   - Create PR with "/q review" via github-workflow skill
   - Wait for human merge
   - Archive plan.md as phase{X.Y.Z}-{date}-{section}-{type}.md
   - Auto-transition to next page type
4. **Section completion** - Update INDEX, clean up branch, wait for next section
```

**Step 4: Add Phase 1 - Section Discovery**

```markdown
### Phase 1: Section Discovery & Inventory

**When to use:** User requests "convert [section] to live database"

**What you do:**

1. Analyze section structure (e.g., `src/app/(main)/apps/crm/`)
2. Categorize ALL pages by complexity type:
   - **List Pages** (read-only displays - simplest)
   - **Create Pages** (forms, data entry)
   - **Interaction Pages** (edit, delete, status changes)
   - **Dashboard Pages** (complex - aggregations, real-time)
3. Create section INDEX:
   ```bash
   cp .claude/templates/INDEX-template.md \
      docs/system/INDEX-{section}-section.md
   ```
4. Document page inventory with:
   - All pages found in each type
   - Complexity estimates per page
   - Dependencies between pages
   - Overall section phase number (e.g., Phase 1.1 for CRM)
```

**Step 5: Add Phase 2 - Comprehensive Brainstorming**

```markdown
### Phase 2: Comprehensive Brainstorming

**What you do:**

1. **Invoke brainstorming skill:**
   ```
   Skill tool with skill: "superpowers:brainstorming"
   ```

2. **Create shared brainstorm doc:**
   ```
   docs/system/design/brainstorm-{YYYY-MM-DD}-{section}-section.md
   ```

3. **Detailed page-by-page analysis** for ALL pages in section:
   - Current UI components used
   - Mock data → real data mapping
   - Required database tables/columns (full schema with types)
   - API endpoints needed (routes, methods, parameters)
   - RLS policies required (org isolation, user permissions)
   - Test scenarios (data/API/UI/E2E)

4. **Create feature branch for entire section:**
   ```bash
   git checkout -b feature/desk-{section}-database-wiring
   ```

5. **Commit initial documentation:**
   ```bash
   git add docs/system/INDEX-{section}-section.md
   git add docs/system/design/brainstorm-{YYYY-MM-DD}-{section}-section.md
   git commit -m "Add {section} section brainstorm and INDEX

   Phase X.Y: {Section} Database Wiring
   - Section inventory complete
   - Page types identified: List, Create, Interaction, Dashboard

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

   git push -u origin feature/desk-{section}-database-wiring
   ```

**Critical:** One feature branch per section, used for ALL page types within that section.
```

**Step 6: Add Phase 3.1 - Create Plan.md**

```markdown
### Phase 3: Sequential Page Type Execution

Process each page type in order: **List → Create → Interaction → Dashboard**

#### 3.1: Create Plan.md

**For each page type, what you do:**

1. **Copy template:**
   ```bash
   cp .claude/templates/phase-execution-template.md \
      docs/system/plans/plan-{YYYY-MM-DD}-{section}-{page-type}-pages.md
   ```

2. **Fill frontmatter:**
   ```yaml
   ---
   title: "Phase X.Y.Z: {Section} {PageType} Pages - Database Wiring"
   type: "execution"
   status: "in-progress"
   version: "X.Y.Z"
   phase: "X.Y.Z"
   section: "{Section}"
   page_type: "{type}"
   created: "YYYY-MM-DD"
   updated: "YYYY-MM-DDTHH:MM:SS-06:00"  # CST ISO format
   github_issue: (filled after issue creation)
   feature_branch: "feature/desk-{section}-database-wiring"
   brainstorm_doc: "docs/system/design/brainstorm-{YYYY-MM-DD}-{section}-section.md"
   ---
   ```

3. **Add content sections:**
   - **Goal**: One sentence describing page type conversion
   - **Pages in scope**: Bulleted list of all pages
   - **Brainstorm reference**: Link to shared brainstorm doc
   - **Tasks summary**: For each page, list database/API/UI tasks from brainstorm
   - **Agent assignments**: Table mapping layers to agents
   - **Test requirements**: Data/API/UI/E2E per page
   - **Deliverables checklist**: Migrations, RLS, endpoints, tests, build/lint
   - **Execution log**: Empty, to be filled by agents

4. **Phase numbering convention:**
   - Section = X.Y (e.g., CRM = 1.1)
   - Page types within section = X.Y.Z (e.g., CRM List = 1.1.1, CRM Create = 1.1.2)
```

**Step 7: Add Phase 3.2 - Create GitHub Issue**

```markdown
#### 3.2: Create GitHub Issue

**What you do:**

1. **Invoke github-workflow skill:**
   ```
   Skill tool with skill: "github-workflow"
   ```

2. The skill creates issue with:
   - Title: "Phase X.Y.Z: {Section} {PageType} Pages - Database Wiring"
   - Body includes:
     - Overview of page type conversion
     - Links to INDEX, brainstorm, plan.md
     - Checklist of pages ([ ] Page 1, [ ] Page 2, etc.)
     - Phase number
     - Feature branch name
     - Agent identification format

3. **Update plan.md with issue number:**
   - Edit frontmatter: `github_issue: {number}`
   - Commit to feature branch:
     ```bash
     git add docs/system/plans/plan-{YYYY-MM-DD}-{section}-{page-type}-pages.md
     git commit -m "Add plan for Phase X.Y.Z - {section} {page-type} pages

     GitHub issue: #{number}

     Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
     ```
```

**Step 8: Add Phase 3.3 - Execute Pages (Bottom-Up Pipeline)**

```markdown
#### 3.3: Execute Pages One-by-One (Bottom-Up Pipeline)

**For EACH page in plan.md, execute this bottom-up sequential pipeline:**

##### Step 1: Database Layer (supabase-database-architect)

**What you do:**

1. Post milestone to GitHub via github-workflow skill:
   ```
   "🚀 Starting: {Page Name} page - Database layer"
   ```

2. Invoke database agent:
   ```
   Task tool with agent: "supabase-database-architect"
   Prompt: "Implement database layer for {Page Name} page.

   Reference: docs/system/design/brainstorm-{date}-{section}-section.md
   Plan: docs/system/plans/plan-{date}-{section}-{type}-pages.md

   Requirements:
   - Create table with uuid pk, org_id for multi-tenancy
   - Write migration (apply via Supabase MCP tools)
   - Create seed data for testing
   - Implement RLS policies for org isolation

   MUST invoke github-workflow skill to post start/completion.
   MUST invoke superpowers:writing-plans for sub-plan.
   Update plan.md execution log with work done."
   ```

3. Wait for agent to complete

##### Step 2: Data Layer Testing (playwright-tester)

**What you do:**

1. Invoke testing agent:
   ```
   Task tool with agent: "playwright-tester"
   Prompt: "Create and run data layer tests for {Page Name}.

   Plan: docs/system/plans/plan-{date}-{section}-{type}-pages.md

   Tests required:
   - Table exists with correct schema
   - RLS policies enforce org isolation
   - Seed data is queryable
   - Foreign keys and constraints work

   Run tests and update plan.md with PASS/FAIL results.
   Post results to GitHub issue via github-workflow skill."
   ```

2. **If tests FAIL:**
   - Re-invoke supabase-database-architect with failure details
   - Agent fixes issues
   - Re-run tests
   - Repeat until PASS

3. **If tests PASS:**
   - Continue to API layer

##### Step 3: API Layer (wiring-agent)

**What you do:**

1. Post milestone to GitHub via github-workflow skill:
   ```
   "🚀 Starting: {Page Name} page - API layer"
   ```

2. Invoke wiring agent:
   ```
   Task tool with agent: "wiring-agent"
   Prompt: "Implement API layer for {Page Name} page.

   Reference: docs/system/design/brainstorm-{date}-{section}-section.md
   Plan: docs/system/plans/plan-{date}-{section}-{type}-pages.md

   Requirements:
   - Create Next.js API routes or server actions
   - Implement SWR hooks for data fetching
   - Integrate Supabase client
   - Add error handling

   MUST invoke github-workflow skill to post start/completion.
   MUST invoke superpowers:writing-plans for sub-plan.
   Update plan.md execution log."
   ```

##### Step 4: API Layer Testing (playwright-tester)

**What you do:**

1. Invoke testing agent:
   ```
   Task tool with agent: "playwright-tester"
   Prompt: "Create and run API layer tests for {Page Name}.

   Tests required:
   - Endpoints return correct data from database
   - Pagination/filtering works
   - Authentication required
   - RLS policies respected through API

   Update plan.md with PASS/FAIL.
   Post results to GitHub via github-workflow skill."
   ```

2. **If FAIL:** wiring-agent fixes → retest (repeat until PASS)
3. **If PASS:** Continue to UI layer

##### Step 5: UI Layer (react-mui-frontend-engineer)

**What you do:**

1. Post milestone to GitHub via github-workflow skill:
   ```
   "🚀 Starting: {Page Name} page - UI layer"
   ```

2. Invoke UI agent:
   ```
   Task tool with agent: "react-mui-frontend-engineer"
   Prompt: "Wire UI to live data for {Page Name} page.

   Reference: docs/system/design/brainstorm-{date}-{section}-section.md
   Plan: docs/system/plans/plan-{date}-{section}-{type}-pages.md

   Requirements:
   - Remove mock data from existing Aurora components
   - Wire UI to real API endpoints (SWR hooks)
   - Add loading states (skeletons)
   - Add error states (boundaries)
   - Adjust UI if data structure differs from mocks

   MUST invoke github-workflow skill to post start/completion.
   MUST invoke superpowers:writing-plans for sub-plan.
   Update plan.md execution log."
   ```

##### Step 6: UI Layer Testing (playwright-tester)

**What you do:**

1. Invoke testing agent:
   ```
   Task tool with agent: "playwright-tester"
   Prompt: "Create and run UI layer tests for {Page Name}.

   Tests required:
   - Page renders with live data
   - User interactions work (clicks, filters, pagination)
   - Loading states display correctly
   - Error states handle API failures

   Update plan.md with PASS/FAIL.
   Post results to GitHub via github-workflow skill."
   ```

2. **If FAIL:** react-mui fixes → retest (repeat until PASS)
3. **If PASS:** Continue to E2E test

##### Step 7: Full E2E Integration Test

**What you do:**

1. Invoke testing agent:
   ```
   Task tool with agent: "playwright-tester"
   Prompt: "Create and run comprehensive E2E test for {Page Name}.

   Test complete user flow:
   - User loads page → sees data from database
   - User interacts → sees updates reflected
   - Complete user journey validated

   Update plan.md with PASS/FAIL.
   Post results to GitHub via github-workflow skill."
   ```

2. **If PASS:**
   - Post completion to GitHub via github-workflow skill:
     ```
     "✅ Complete: {Page Name} page - All layers tested and passing"
     ```
   - Move to next page in plan.md
   - Repeat Steps 1-7 for next page

3. **If FAIL:**
   - Analyze failure to determine responsible layer
   - Invoke responsible agent to fix
   - Retest from appropriate layer

**Repeat Steps 1-7 for each page** in the plan.md until all pages complete.
```

**Step 9: Add Phase 3.4 - Create PR**

```markdown
#### 3.4: Create PR (After All Pages in Type Complete)

**When all pages in plan.md are complete and tested, what you do:**

1. **Verify all deliverables:**
   ```bash
   # Run build
   npm run build
   # Expected: SUCCESS

   # Run lint
   npm run lint
   # Expected: CLEAN (no errors)
   ```

2. **Invoke github-workflow skill to create PR:**
   ```
   Skill tool with skill: "github-workflow"
   ```

3. The skill creates PR with:
   - From: `feature/desk-{section}-database-wiring`
   - To: `main`
   - Title: "Phase X.Y.Z: {Section} {PageType} Pages - Database Wiring"
   - Body includes:
     - Summary of changes (database/API/UI)
     - Test evidence (data/API/UI/E2E all PASS)
     - Build/lint verification
     - Documentation links (plan, brainstorm, INDEX)
     - "/q review" phrase
     - Issue link (#XX)
   - Assigned to: @RockwallJMC

4. **Post to GitHub issue via github-workflow skill:**
   ```
   "🎉 Phase X.Y.Z: All pages complete, PR created and ready for review"
   ```

5. **WAIT** for human to merge PR (do NOT proceed to next page type)
```

**Step 10: Add Phase 3.5 - Post-Merge Archive**

```markdown
#### 3.5: Post-Merge Archive & Transition

**After @RockwallJMC merges PR, what you do:**

1. **Collect data from GitHub issue:**
   - All agent completion summaries
   - Test results (pass/fail counts)
   - PR review/corrections made
   - Merge timestamp (CST ISO format)
   - Duration (plan creation → merge)

2. **Archive plan.md:**
   ```bash
   # Rename file
   mv docs/system/plans/plan-{date}-{section}-{type}-pages.md \
      docs/system/plans/phase{X.Y.Z}-{date}-{section}-{type}-pages.md
   ```

3. **Update archived plan.md:**
   - Change frontmatter:
     ```yaml
     status: "complete"
     completed: "YYYY-MM-DDTHH:MM:SS-06:00"
     merged_pr: {number}
     ```
   - Append **Completion Summary** section:
     ```markdown
     ## Completion Summary

     **Completed**: YYYY-MM-DD HH:MM CST
     **Duration**: X.X hours
     **PR**: #{number} (merged by @RockwallJMC)
     **GitHub Issue**: #{number}

     ### Agent Summaries
     [Paste summaries from GitHub issue]

     ### PR Review/Corrections
     [List any corrections made during review]

     ### Recommendations for Next Phase
     [Lessons learned, patterns to reuse]
     ```

4. **Update section INDEX:**
   - Mark phase X.Y.Z as complete
   - Add link to archived plan
   - Add PR reference
   - Update next phase to in-progress

5. **Post final update to GitHub issue via github-workflow skill:**
   ```
   "🎉 Phase X.Y.Z COMPLETE

   Status: All work complete, PR merged, plan archived

   Summary: X pages wired to live database
   Tests: XX/XX passing

   Archived Plan: [phaseX.Y.Z-{date}-{section}-{type}-pages.md](link)
   Duration: X.X hours

   Next Phase: X.Y.Z+1 ({PageType} Pages) starting automatically...

   Assigned to: @RockwallJMC"
   ```

6. **Close GitHub issue:**
   ```bash
   gh issue close {issue-number} --comment "Phase complete. See archived plan."
   ```

7. **Commit archived plan to main:**
   ```bash
   git checkout main
   git pull
   git add docs/system/plans/phase{X.Y.Z}-{date}-{section}-{type}-pages.md
   git add docs/system/INDEX-{section}-section.md
   git commit -m "Archive Phase X.Y.Z - {section} {type} pages

   All pages complete and tested. PR #{number} merged.

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   git push
   git checkout feature/desk-{section}-database-wiring
   ```

8. **IMMEDIATELY start next page type:**
   - Go to Phase 3.1 (Create Plan.md) for next page type
   - No waiting for user approval
   - Automatic progression through: List → Create → Interaction → Dashboard
```

**Step 11: Add Phase 4 - Section Completion**

```markdown
### Phase 4: Section Completion

**When the LAST page type (Dashboard) completes, what you do:**

1. **Archive final plan.md** (same as Phase 3.5)

2. **Update section INDEX with completion:**
   ```markdown
   ## Phase Progress

   ### Phase X.Y: {Section} Section - Database Wiring ✅ COMPLETE

   **Completed**: YYYY-MM-DD HH:MM CST
   **Duration**: XX hours total
   **Feature Branch**: feature/desk-{section}-database-wiring (deleted)

   - [x] Phase X.Y.1: List Pages ✅ (PR #XX)
   - [x] Phase X.Y.2: Create Pages ✅ (PR #XX)
   - [x] Phase X.Y.3: Interaction Pages ✅ (PR #XX)
   - [x] Phase X.Y.4: Dashboard Pages ✅ (PR #XX)

   **Summary**: All {section} pages successfully wired to live Supabase database.
   Total pages converted: XX
   Total tests created: XXX
   ```

3. **Post section completion to INDEX GitHub issue:**
   ```
   Skill tool with skill: "github-workflow"
   (Posts comprehensive section summary)
   ```

4. **Assign INDEX to @RockwallJMC:**
   ```
   "Section complete. Final review requested."
   ```

5. **Clean up feature branch:**
   ```bash
   git checkout main
   git pull
   git branch -d feature/desk-{section}-database-wiring
   git push origin --delete feature/desk-{section}-database-wiring
   ```

6. **WAIT for user to specify next section:**
   - Do NOT automatically start next section
   - User decides which section to convert next
   - Or user may decide to pause/end
```

**Step 12: Add Critical Rules section**

```markdown
### Critical Rules for This Workflow

**MANDATORY - No exceptions:**

- ✅ **Always invoke github-workflow skill** for GitHub interactions (issues, PRs, comments)
- ✅ **Always bottom-up execution** (supabase → wiring → react-mui per page)
- ✅ **One complete page at a time** (all 3 agents + tests before next page)
- ✅ **Sequential testing after each layer** (data → API → UI → E2E)
- ✅ **Agents MUST invoke superpowers:writing-plans** for their sub-plans
- ✅ **Agents MUST invoke github-workflow skill** for all GitHub posts
- ✅ **All agent questions posted to GitHub issue only** (not to orchestrator)
- ✅ **Wait for human PR merge** before next page type (no auto-merge)
- ✅ **Automatic transition** to next page type after merge
- ✅ **One feature branch per section** used for all page types
- ✅ **Database is in Supabase cloud** - ALWAYS use MCP tools (never psql, pg_dump)
- ✅ **Agent identification required** - All GitHub posts must include `**Agent**: {name}`

### Common Mistakes to Avoid

**DO NOT:**
- ❌ Skip brainstorming phase (required for comprehensive analysis)
- ❌ Create separate branches per page type (one branch per section)
- ❌ Run agents in parallel for same page (must be sequential: DB → API → UI)
- ❌ Move to next page before E2E test passes
- ❌ Create PR before all pages in type complete
- ❌ Auto-merge PRs (human review required)
- ❌ Skip to next section without user approval
- ❌ Try to connect to database locally (use Supabase MCP tools)
- ❌ Post to GitHub directly (use github-workflow skill)
- ❌ Let agents ask orchestrator directly (questions go to GitHub issue)

---
```

**Step 13: Save complete section to temp file**

Write all content from Steps 1-12 to `/tmp/sequential-workflow-section.md`.

Expected: Complete section content ready for insertion into CLAUDE.md.

---

## Task 3: Insert Section into CLAUDE.md

**Files:**
- Modify: `CLAUDE.md` (insert at line 864, before "## Aurora Component Development Guide")

**Step 1: Read the section content**

```bash
Read tool: /tmp/sequential-workflow-section.md
```

Expected: Complete markdown section content.

**Step 2: Read CLAUDE.md around insertion point**

```bash
Read tool: CLAUDE.md (lines 860-870)
```

Expected: See end of Skills Framework section and start of Aurora Component Development Guide.

**Step 3: Insert the new section**

Use Edit tool to insert the section:

```markdown
# Find the insertion point (after Skills Framework, before Aurora)
# The edit will add the entire Sequential Operation Workflow section
# between these two sections
```

**Step 4: Verify insertion**

```bash
# Check that section was inserted correctly
Read tool: CLAUDE.md (lines 860-880)
```

Expected: See end of Skills Framework, new Sequential Operation Workflow section header, and eventually Aurora Component Development Guide starts later.

---

## Task 4: Verify CLAUDE.md Structure

**Files:**
- Read: `CLAUDE.md` (full scan)

**Step 1: Check table of contents alignment**

```bash
# Generate TOC from headers
grep "^##" CLAUDE.md
```

Expected: See "## Sequential Operation Workflow (Database Wiring)" between "## Skills Framework" and "## Aurora Component Development Guide".

**Step 2: Verify no duplicate sections**

```bash
# Check for duplicate headers
grep "^## Sequential Operation" CLAUDE.md | wc -l
```

Expected: Output = 1 (only one instance).

**Step 3: Verify markdown syntax**

```bash
# Check for common markdown issues
npm run lint:md CLAUDE.md
```

Expected: No markdown syntax errors (if linter exists). If no linter, visually inspect for:
- Proper code fence closures (```)
- Consistent heading levels
- Proper list formatting

**Step 4: Check file size increase**

```bash
# Original file size
wc -l CLAUDE.md
```

Expected: ~1310 lines (original) + ~400 lines (new section) = ~1710 lines total.

---

## Task 5: Test Section Accessibility

**Files:**
- Read: `CLAUDE.md` (specific sections)

**Step 1: Search for trigger phrases**

```bash
# Verify trigger phrases are findable
grep -i "convert.*to live database" CLAUDE.md
grep -i "wire.*to supabase" CLAUDE.md
```

Expected: Find the trigger phrases in the new section.

**Step 2: Verify skill references**

```bash
# Check that skill invocations are correct
grep "Skill tool with skill:" CLAUDE.md | grep -i "sequential" -A 2
```

Expected: See references to:
- `superpowers:brainstorming`
- `github-workflow`
- `superpowers:writing-plans`

**Step 3: Verify agent references**

```bash
# Check that agent names are correct
grep "Task tool with agent:" CLAUDE.md | grep -i "sequential" -A 2
```

Expected: See references to:
- `supabase-database-architect`
- `wiring-agent`
- `react-mui-frontend-engineer`
- `playwright-tester`

---

## Task 6: Commit CLAUDE.md Changes

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Stage the changes**

```bash
git add CLAUDE.md
```

**Step 2: Verify changes with diff**

```bash
# Review the diff to ensure only the new section was added
git diff --staged CLAUDE.md | head -100
```

Expected: See insertion of Sequential Operation Workflow section, no other modifications.

**Step 3: Commit the changes**

```bash
git commit -m "Add Sequential Operation Workflow to CLAUDE.md

Bottom-up orchestrator-driven database wiring pipeline:
- Phase 1: Section inventory and brainstorming
- Phase 2: Feature branch creation
- Phase 3: Sequential page type execution (List → Create → Interaction → Dashboard)
  - One page at a time: supabase → wiring → react-mui
  - Test after each layer: data → API → UI → E2E
  - PR per page type with human review
  - Auto-transition after merge
- Phase 4: Section completion and cleanup

Implements design from: docs/plans/2026-01-30-sequential-operation-workflow-design.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

Expected: Commit created successfully.

**Step 4: Push changes**

```bash
git push origin feature/desk-phase1.2-complete-integration
```

Expected: Changes pushed to remote branch.

---

## Task 7: Verification Testing

**Files:**
- Read: `CLAUDE.md`
- Read: `docs/plans/2026-01-30-sequential-operation-workflow-design.md`

**Step 1: Cross-reference with design doc**

Read both files and verify that CLAUDE.md implementation matches the design:

```bash
# Read design doc sections
Read tool: docs/plans/2026-01-30-sequential-operation-workflow-design.md

# Read CLAUDE.md new section
grep -A 500 "## Sequential Operation Workflow" CLAUDE.md
```

Expected: All major design elements present:
- ✅ 4 phases documented
- ✅ Bottom-up execution (supabase → wiring → react-mui)
- ✅ Sequential testing (data → API → UI → E2E)
- ✅ Skill invocations (brainstorming, github-workflow, writing-plans)
- ✅ Agent invocations (supabase, wiring, react-mui, playwright-tester)
- ✅ Phase numbering (X.Y.Z)
- ✅ PR strategy (one per page type)
- ✅ Archive strategy (rename to phaseX.Y.Z)
- ✅ Critical rules listed

**Step 2: Verify completeness checklist**

Check that CLAUDE.md section includes:

- [ ] Trigger phrases
- [ ] Workflow overview
- [ ] Phase 1: Section Discovery & Inventory
- [ ] Phase 2: Comprehensive Brainstorming (with feature branch creation)
- [ ] Phase 3.1: Create Plan.md
- [ ] Phase 3.2: Create GitHub Issue
- [ ] Phase 3.3: Execute Pages (7-step bottom-up pipeline)
- [ ] Phase 3.4: Create PR
- [ ] Phase 3.5: Post-Merge Archive & Transition
- [ ] Phase 4: Section Completion
- [ ] Critical Rules
- [ ] Common Mistakes to Avoid

**Step 3: Test searchability**

```bash
# Test that orchestrator can find instructions by searching
grep -i "bottom-up" CLAUDE.md
grep -i "sequential" CLAUDE.md
grep -i "one page at a time" CLAUDE.md
```

Expected: Find multiple matches in the new section.

---

## Task 8: Document Completion

**Files:**
- Create: `docs/plans/2026-01-30-claude-md-implementation-complete.md`

**Step 1: Create completion summary**

```markdown
# CLAUDE.md Sequential Workflow Implementation - COMPLETE

**Date**: 2026-01-30
**Status**: ✅ Complete

## What Was Implemented

Added new section "Sequential Operation Workflow (Database Wiring)" to CLAUDE.md.

**Location**: Between "Skills Framework (MANDATORY)" and "Aurora Component Development Guide"

**Size**: ~400 lines of orchestrator instructions

## Implementation Verified

- ✅ Design doc cross-referenced: All major elements present
- ✅ Section inserted correctly: No disruption to existing content
- ✅ Markdown syntax: Clean, no errors
- ✅ Trigger phrases: Searchable and clear
- ✅ Skill references: Correct (brainstorming, github-workflow, writing-plans)
- ✅ Agent references: Correct (supabase, wiring, react-mui, playwright-tester)
- ✅ 4 phases documented: Discovery, Brainstorming, Execution, Completion
- ✅ Bottom-up pipeline: supabase → wiring → react-mui
- ✅ Sequential testing: data → API → UI → E2E
- ✅ Critical rules: Listed and emphasized
- ✅ Common mistakes: Documented

## Files Modified

- `CLAUDE.md` (+~400 lines)

## Commits

- SHA: [to be filled]
- Message: "Add Sequential Operation Workflow to CLAUDE.md"
- Branch: feature/desk-phase1.2-complete-integration

## Next Steps

**Recommended**: Test the workflow with a small section (2-3 pages) to validate:
1. Section discovery and inventory works
2. Brainstorming produces detailed analysis
3. Plan.md creation follows template
4. GitHub issue creation via skill works
5. Agent execution follows bottom-up pipeline
6. Testing checkpoints catch failures
7. PR creation and archive workflow functions

**Test Section Suggestion**: CRM List Pages (Lead List, Contact List, Deal List)

## Design Reference

- Design Doc: docs/plans/2026-01-30-sequential-operation-workflow-design.md
- Implementation Plan: docs/plans/2026-01-30-claude-md-sequential-workflow-implementation.md
```

**Step 2: Save completion summary**

Write content to `docs/plans/2026-01-30-claude-md-implementation-complete.md`.

**Step 3: Commit completion doc**

```bash
git add docs/plans/2026-01-30-claude-md-implementation-complete.md
git commit -m "Document CLAUDE.md Sequential Workflow implementation completion

Implementation verified against design doc.
All phases, skills, and agent references confirmed.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push
```

---

## Deliverables Checklist

- [ ] Sequential Operation Workflow section created in /tmp file
- [ ] Section inserted into CLAUDE.md at line 864
- [ ] CLAUDE.md structure verified (TOC, no duplicates)
- [ ] Trigger phrases searchable
- [ ] Skill references correct (brainstorming, github-workflow, writing-plans)
- [ ] Agent references correct (supabase, wiring, react-mui, playwright-tester)
- [ ] All 4 phases documented
- [ ] Bottom-up pipeline documented (supabase → wiring → react-mui)
- [ ] Sequential testing documented (data → API → UI → E2E)
- [ ] Critical rules listed
- [ ] Common mistakes documented
- [ ] Changes committed to git
- [ ] Completion summary created
- [ ] Design doc cross-referenced and verified
- [ ] Ready for workflow testing

---

## Testing Notes

After implementation, test the workflow by:

1. User says: "Convert CRM list pages to live database"
2. Orchestrator should:
   - Recognize trigger phrase
   - Start Phase 1 (section discovery)
   - Categorize pages: List (Lead, Contact, Deal)
   - Create INDEX
   - Start Phase 2 (brainstorming)
   - Create shared brainstorm doc
   - Create feature branch
   - Start Phase 3.1 (create plan.md for list pages)
   - And so on...

This will validate that the CLAUDE.md instructions are clear and complete.
