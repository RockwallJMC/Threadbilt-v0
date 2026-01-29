# Documentation Guide

## Overview

This guide explains the PierceDesk documentation framework - a comprehensive system for tracking features from conception through deployment, with living "as-built" documentation that reflects the actual state of the system.

## Documentation Philosophy

### Living Documentation

Documentation should:

- **Reflect reality**: Always match what's actually deployed
- **Be findable**: Clear hierarchy and cross-references
- **Stay current**: Updated as part of the development workflow
- **Serve users**: Written for humans, not just compliance

### Hybrid Structure

PierceDesk uses a two-tier documentation system:

```
piercedesk6/
├── docs/                      # USER-FACING (you are here)
│   ├── architecture/          # System design
│   ├── features/              # Feature documentation
│   ├── guides/                # How-to guides
│   └── api/                   # API reference
│
└── _sys_documents/            # INTERNAL TRACKING
    ├── vision/                # Product vision
    ├── roadmap/               # Strategic plans
    ├── design/                # Design documents
    ├── execution/             # Implementation tracking
    └── as-builts/             # Current state docs
```

**User-facing docs** (`docs/`): For developers, users, stakeholders
**Internal docs** (`_sys_documents/`): Planning, tracking, execution logs

## Feature Development Workflow

### Complete Feature Lifecycle

```
Feature Initiation
    ↓
Planning Phase
    ↓
Execution Phase (TDD)
    ↓
Verification & Realignment
    ↓
Code Review
    ↓
Pull Request
    ↓
Merge & Documentation
```

Each phase has specific documentation requirements.

---

## Phase 1: Feature Initiation

### Steps

1. **Create GitHub Issue**
   - Clear description of feature
   - Business value and user stories
   - Acceptance criteria

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/desk-name-feature-name
   ```

3. **Create INDEX File**

   ```bash
   cp .claude/templates/INDEX-template.md \
      _sys_documents/execution/INDEX-feature-name.md
   ```

4. **Fill in INDEX Frontmatter**
   ```yaml
   ---
   feature: 'Feature Name - Description'
   github_issue: '#123'
   feature_branch: 'feature/desk-name-feature'
   status: 'planned'
   started: '2026-01-27'
   target_completion: '2026-02-10'
   team: ['claude', 'user']
   impact_level: 'deep' # or "shallow"
   ---
   ```

### GitHub Workflow Guidance (Feature Branch → PR → Merge)

- **Branch from main** before any changes; keep branch names consistent:
   - `feature/desk-name-feature-name`
   - `fix/area-short-description`
- **Commit in small, reviewable chunks** (1 logical change per commit).
   - Use imperative commit messages (e.g., `Add CRM lead filters`)
   - Reference issue numbers in PR description, not commit titles
- **Push early and open a Draft PR** once the branch builds.
   - Enables early feedback and CI visibility
   - Link issue, INDEX, and design docs in PR description
- **Keep branch up to date** with `main` during long-running work.
   - Rebase or merge `main` locally; avoid rewriting shared history


### INDEX File Purpose

The INDEX file is the **single source of truth** for a feature:

- Lists all phases (design and execution)
- Tracks current status and blockers
- Records technical decisions
- Maintains verification checklist
- Provides timeline and milestone tracking

**Keep it updated** as the feature progresses!

### GitHub Integration (After Plan Approval)

After creating INDEX and design documents (during plan approval), create GitHub coordination:

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/desk-{feature-name}
   ```

2. **Create GitHub Issue**
   ```bash
   gh issue create \
     --title "Feature: {Feature Name}" \
     --body "$(cat <<'EOF'
   ## Overview
   {Brief description from INDEX}

   ## Documentation
   - INDEX: [_sys_documents/execution/INDEX-{feature}.md]
   - Design docs: Listed in INDEX

   ## Phases
   - [ ] Phase 1.1: {Phase name}
   - [ ] Phase 1.2: {Phase name}
   - [ ] Phase 1.3: {Phase name}

   ## Branch
   `feature/desk-{feature-name}`

   ---
   🤖 Created by Claude Code
   EOF
   )"
   ```

3. **Update INDEX Frontmatter**
   Add these fields:
   ```yaml
   github_issue: "#123"
   feature_branch: "feature/desk-{feature-name}"
   pr_number: "#456"  # Filled after PR created
   ```

4. **Commit and Push**
   ```bash
   git add _sys_documents/execution/INDEX-{feature}.md
   git commit -m "Add GitHub issue tracking to INDEX

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   git push -u origin feature/desk-{feature-name}
   ```

5. **Post Kickoff Comment**
   ```bash
   gh issue comment {issue-number} --body "🚀 Feature branch created and INDEX updated. Starting implementation..."
   ```

---

## Phase 2: Planning

### Design Documents

For each major phase of work, create a design document:

```bash
cp .claude/templates/phase-design-template.md \
   _sys_documents/design/phase1.1-feature-component.md
```

**What goes in design docs:**

- Technical approach and architecture
- Design decisions and rationale
- Component breakdown
- Dependencies and risks
- Verification plan

**Frontmatter fields:**

```yaml
---
phase: '1.1'
title: 'Database Schema - CRM Tables'
type: 'design'
status: 'planned'
version: '1.0'
complexity: 'medium' # low/medium/high
impact: 'deep' # shallow/deep
verification:
  - 'Schema deployed via Supabase MCP'
  - 'RLS policies tested'
---
```

### Approval Checkpoint

Before implementation:

1. Design document reviewed
2. Technical decisions validated
3. **Human approval obtained** for deep-impact changes
4. Update INDEX with phase breakdown

---

## Phase 3: Execution

### Implementation Tracking

Create an execution document for implementation work:

```bash
cp .claude/templates/phase-execution-template.md \
   _sys_documents/execution/phase1.2-feature-implementation.md
```

**What goes in execution docs:**

- Implementation log (dated entries)
- Current progress percentage
- Code references (file:line)
- Technical notes and challenges
- Verification evidence

**Update regularly** as work progresses!

**Frontmatter fields:**

```yaml
---
phase: '1.2'
title: 'Leads API Implementation'
type: 'execution'
status: 'in-progress'
version: '0.7'
assigned_agent: 'wiring-agent'
dependencies: ['phase1.1-db-schema']
progress_percentage: 70
---
```

### TDD Requirement

Before writing implementation code:

1. Invoke `/TDD` skill
2. Write failing test first
3. Watch test fail (Red)
4. Write minimal code to pass (Green)
5. Refactor if needed
6. Document test in execution doc

### Using Sub-Agents

Delegate work to specialized sub-agents via Task tool:

```javascript
// Database work
Task(supabase - database - architect, 'Create CRM schema with RLS');

// UI implementation
Task(react - mui - frontend - engineer, 'Build leads list component');

// API integration
Task(wiring - agent, 'Implement leads CRUD endpoints');

// Testing
Task(playwright - tester, 'Create leads management E2E tests');
```

**Always use sub-agents for execution work!**

### GitHub Progress Updates

Sub-agents executing phases MUST post updates to the GitHub issue at key checkpoints:

**Phase Start**:
```bash
gh issue comment {issue-number} --body "🔨 **Phase {X.Y} Started**: {Phase name}

Assigned to: {agent-name}
Progress: 0%"
```

**Progress Milestones** (every 30-40% OR after completing each major task):
```bash
gh issue comment {issue-number} --body "📊 **Phase {X.Y} Progress Update**

## Completed Tasks
- ✅ Task {N}: {Task name}
  - Implementation: {brief description}
  - Tests: {N} tests created/passing
  - Files: {list key files created/modified}
  - Verification: Build ✅, Tests ✅

## In Progress
- 🚧 Task {N+1}: {Task name}
  - Status: {specific status}
  - Blockers: {none or list}

## Next Steps
- ⏭️ Task {N+2}: {Task name}

## Test Summary
- Total tests: {N} ({X} active, {Y} pending Phase 1.2)
- All passing: ✅ {N}/{N}
- Coverage: {key scenarios}

## Verification Evidence
\`\`\`bash
# Most recent test run
$ npx playwright test
{paste actual output}
\`\`\`

Progress: {percentage}% ({N} of {M} tasks complete)

See detailed log: _sys_documents/execution/phase{X.Y}-{topic}.md"
```

**After TDD Skill Invocation**:
```bash
gh issue comment {issue-number} --body "🧪 **TDD Phase {X.Y}**:
- Created failing test for {feature}
- Test watching for implementation"
```

**After Playwright Tests** (MUST include screenshots):

**CRITICAL: UPLOAD ACTUAL IMAGES TO GITHUB, NOT JUST FILENAMES**

Step-by-step screenshot upload process:

1. **Commit screenshots to repository**:
   ```bash
   mkdir -p screenshots/phase-{X.Y}
   cp ./test-results/screenshots/*.png screenshots/phase-{X.Y}/
   git add screenshots/phase-{X.Y}/
   git commit -m "test: add E2E screenshots for Phase {X.Y}"
   git push
   ```

2. **Get GitHub raw URLs** for each screenshot:
   ```
   https://raw.githubusercontent.com/{owner}/{repo}/{branch}/screenshots/phase-{X.Y}/{filename}.png
   ```

   **Note:** Use `raw.githubusercontent.com` (not `github.com/blob`) for direct image access without GitHub's HTML wrapper. This is the standard format for embedding repository images.

3. **Post update with embedded images**:
   ```bash
   gh issue comment {issue-number} --body "✅ **E2E Tests Passed - Phase {X.Y}**

   ## Test Results
   - ✅ All {N} tests passing
   - Test file: \`tests/{test-file}.spec.js\`
   - Duration: {duration}
   - Coverage: {scenarios}

   ## Test Execution Output
   \`\`\`
   {paste actual npx playwright test output}
   \`\`\`

   ## Screenshots

   ### {Scenario 1}
   ![{description}](https://raw.githubusercontent.com/{owner}/{repo}/{branch}/screenshots/phase-{X.Y}/{screenshot1}.png)

   ### {Scenario 2}
   ![{description}](https://raw.githubusercontent.com/{owner}/{repo}/{branch}/screenshots/phase-{X.Y}/{screenshot2}.png)

   ## Verification Evidence
   - Build: exit 0 ✅
   - Tests: {N}/{N} passed ✅

   See full test report: _sys_documents/execution/phase{X.Y}-{topic}.md"
   ```

**Why GitHub raw URLs?**
- External collaborators viewing GitHub issues CANNOT see local file paths
- GitHub CLI and REST API do NOT support direct image uploads (as of 2026)
- Repository-based approach with raw URLs is the ONLY way to automate screenshot posting via CLI
- Use `raw.githubusercontent.com` format for direct image access

---

### Task-Level Pull Requests (MANDATORY)

**After EVERY task completion**, you MUST create a pull request. This is NOT optional.

#### Why Task-Level PRs?

- **Continuous integration**: Keeps main branch up-to-date with incremental progress
- **Easier reviews**: Smaller, focused PRs are easier to review than large phase-level PRs
- **Early feedback**: Catch issues early before moving to next task
- **Clear attribution**: Each task's work is clearly tracked in git history
- **Rollback granularity**: Can revert individual tasks if needed

#### Task PR Workflow (Step-by-Step)

**Step 1: Verify Task Complete**

Before creating PR, ensure:
```bash
# Run verification commands
npm run build  # Must exit 0
npm run lint   # Must show 0 errors
npm test       # All tests passing (or npx playwright test for E2E)

# Verify screenshots uploaded (for test tasks)
ls screenshots/phase-{X.Y}/  # Should show all screenshots
```

**Step 2: Create Pull Request**

```bash
# Get current branch name
BRANCH=$(git branch --show-current)

# Create PR with descriptive title
gh pr create \
  --title "Task: {Task Name} (Phase {X.Y})" \
  --body "$(cat <<'EOF'
## Task Summary
Completed Task {N} of Phase {X.Y}: {Task description}

## Links
- Issue: #{issue-number}
- INDEX: [INDEX-{feature}.md](_sys_documents/execution/INDEX-{feature}.md)
- Design: [phase{X.Y}-{topic}.md](_sys_documents/design/phase{X.Y}-{topic}.md)

## Changes in This Task
- {Specific change 1}
- {Specific change 2}
- {Specific change 3}

## Tests
- {Test description} - ✅ Passing
- Total tests added/modified: {N}

## Verification Evidence

### Build
```
$ npm run build
✅ Build succeeded (exit 0)
```

### Lint
```
$ npm run lint
✅ 0 errors, 0 warnings
```

### Tests
```
$ {test command}
✅ {N}/{N} tests passing
```

## Screenshots
{If applicable, list screenshot paths or GitHub URLs}

See issue #{issue-number} for embedded test screenshots.

## Next Task
After merge, will proceed to Task {N+1}: {Next task name}

---
🤖 Generated by {agent-name}
EOF
)"
```

**Step 3: Link PR to Issue**

```bash
# Get PR number from previous command output, then:
gh issue comment {issue-number} --body "🔗 **Pull Request Created for Task {N}**

**PR #{pr-number}**: Task {N} - {Task Name}

**Status**: Ready for review

**Contents**:
- {Brief summary of changes}

**Verification**: All checks passing ✅

**Next**: After merge, will proceed to Task {N+1}"
```

**Step 4: Monitor PR Status**

- PR should be reviewed (automated or manual)
- Address any feedback if needed
- Wait for approval

**Step 5: Merge PR**

```bash
# After approval, merge the PR
gh pr merge {pr-number} --squash --delete-branch=false

# Note: We keep the feature branch alive for subsequent task PRs
# All task PRs merge to main from the same feature branch
```

**Step 6: Update Feature Branch**

```bash
# After PR merges, update local feature branch with main
git checkout main
git pull origin main
git checkout {feature-branch}
git merge main

# Verify merge succeeded
git status  # Should show clean working tree
```

**Step 7: Post Merge Confirmation**

```bash
gh issue comment {issue-number} --body "✅ **Task {N} PR Merged**

**PR #{pr-number}** merged to main successfully.

**Task {N} Complete**: {Task name}

**Status**:
- Feature branch: \`{feature-branch}\` (still active)
- Main branch: Updated with Task {N} changes
- Next: Starting Task {N+1}: {Next task name}

**Progress**: {percentage}% ({N} of {M} tasks complete)"
```

**Step 8: Continue to Next Task**

- Feature branch remains active
- Continue working on next task
- Repeat this PR workflow after each task completion

#### Task PR Checklist

Before creating each task PR:

- [ ] Task fully implemented
- [ ] All verification commands pass (build, lint, tests)
- [ ] Screenshots uploaded (if applicable)
- [ ] Commits follow message conventions
- [ ] Changes are focused on THIS task only
- [ ] Documentation updated for this task
- [ ] Execution log updated

After creating PR:

- [ ] PR linked to GitHub issue with comment
- [ ] PR description includes verification evidence
- [ ] PR includes links to INDEX and design docs
- [ ] PR is ready for review

After PR merge:

- [ ] Merge confirmation posted to issue
- [ ] Feature branch updated from main
- [ ] Ready to start next task

#### When to Skip Task-Level PRs

Task-level PRs can be skipped ONLY when:

- Task is trivial (< 10 lines, documentation typo, etc.)
- Task is a sub-step of a larger task (e.g., "Run tests" after "Implement feature")
- Multiple tasks are tightly coupled and cannot be separated

**Default behavior: CREATE PR after every task.**

---

**Phase Completion**:
```bash
gh issue comment {issue-number} --body "✅ **Phase {X.Y} Complete**

Verification:
- [x] All tests passing ({N}/{N})
- [x] Build succeeds
- [x] Linting clean
- [x] E2E tests with screenshots posted

Progress: 100%

Updated: _sys_documents/execution/phase{X.Y}-{topic}.md"
```

---

## Phase 4: Debugging & Realignment

### When Bugs Occur

1. **Create Debug Document**

   ```bash
   cp .claude/templates/debug-template.md \
      _sys_documents/execution/debug-BUG-001.md
   ```

2. **Invoke `/systematic-debugging` Skill**

3. **Document Investigation**
   - Symptoms and reproduction steps
   - Investigation log (timestamped)
   - Root cause analysis
   - Solution implemented

4. **Update INDEX**
   - Log blocker if it prevents progress
   - Update phase status if affected

### When Plans Change

If requirements change or technical discoveries require course correction:

1. **Create Realignment Document**

   ```bash
   cp .claude/templates/realignment-template.md \
      _sys_documents/execution/realign-2026-01-27-topic.md
   ```

2. **Document the Change**
   - Original plan vs. new approach
   - Trigger (user feedback, technical discovery)
   - Impact assessment (timeline, scope, resources)
   - Alternatives considered
   - Decision rationale

3. **Get Approval**
   - Technical lead approval
   - Product owner approval (if scope/timeline affected)

4. **Update INDEX and Phase Docs**
   - Reflect new phase breakdown
   - Update timelines
   - Document decision in INDEX

---

## Phase 5: Verification

### Before Claiming Complete

1. **Invoke `/VERIFY-BEFORE-COMPLETE` Skill**

2. **Run Verification Commands**

   ```bash
   # Tests
   npm test

   # Build
   npm run build

   # Linting
   npm run lint

   # E2E tests
   npx playwright test
   ```

3. **Capture Evidence**
   - Copy command outputs into execution doc
   - Take screenshots of working features
   - Record any verification issues

4. **Update Phase Document**
   - Status → "complete"
   - Version → "1.0"
   - Add verification evidence

**No completion claims without evidence!**

---

## Phase 6: Code Review

### Self-Review

1. Review all code changes yourself
2. Check against design document
3. Verify all acceptance criteria met
4. Ensure commits/PR are scoped and include required links

### Agent Review

1. **Invoke Code Review Agent**

   ```javascript
   Task(superpowers:code-reviewer, "Review CRM leads implementation")
   ```

2. **Address Feedback**
   - Fix issues identified
   - Document decisions if disagreeing with feedback
   - Use `/receiving-code-review` skill if needed

3. **Update Execution Document**
   - Log code review findings
   - Document changes made
   - Mark as complete after addressing feedback

### GitHub Review Expectations

- Request a GitHub review once verification evidence is attached
- Respond to review comments with fixes or rationale
- Mark conversations as resolved only after changes are pushed

---

## Phase 7: Pull Request

### Pre-PR GitHub Update

Before creating PR, post final verification to issue:

```bash
gh issue comment {issue-number} --body "🎉 **All Phases Complete - Creating PR**

Final Verification:
- [x] All tests passing ({N}/{N})
- [x] Build succeeds
- [x] Linting clean
- [x] E2E tests complete with screenshots
- [x] Documentation updated

Opening pull request..."
```

### Create PR

1. **Commit All Changes**

   ```bash
   git add .
   git commit -m "Implement CRM Leads feature

   - Database schema with RLS policies
   - CRUD API endpoints
   - UI components for leads list and detail
   - E2E tests covering main workflows
   - Documentation updated

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   ```

2. **Push to Remote**

   ```bash
   git push -u origin feature/crm-desk-leads
   ```

3. **Create PR with gh CLI**

   ```bash
   gh pr create \
     --title "Feature: {Feature Name}" \
     --body "$(cat <<'EOF'
   ## Summary
   {Brief description of feature and value}

   ## Links
   - Closes #{issue-number}
   - INDEX: [INDEX-{feature}.md](_sys_documents/execution/INDEX-{feature}.md)
   - Design: [phase1.1-{topic}.md](_sys_documents/design/phase1.1-{topic}.md)

   ## Changes
   - {Change 1} (Phase X.Y)
   - {Change 2} (Phase X.Y)
   - Added {N} E2E tests with screenshots

   ## Verification Evidence

   ### Tests
   ```
   ✅ All tests passing ({N}/{N})
   ```

   ### Build
   ```
   ✅ Build succeeded
   ```

   ### E2E Screenshots
   See issue #{issue-number} for all test screenshots.

   ## Phases Completed
   - ✅ Phase 1.1: {Phase name}
   - ✅ Phase 1.2: {Phase name}
   - ✅ Phase 1.3: {Phase name}

   ---
   🤖 Generated by Claude Code
   EOF
   )"
   ```

4. **Link PR to Issue**
   ```bash
   gh issue comment {issue-number} --body "🔗 **Pull Request Created**

   PR #{pr-number}: Ready for review!"
   ```

5. **Automated Code Review**
   - GitHub will trigger code review agent
   - Address any additional feedback

6. **PR Hygiene**
   - Keep PRs focused; split oversized work into follow-up PRs
   - Ensure CI green before requesting final approval
   - Add screenshots or short clips for UI changes

---

## Phase 8: Merge & Documentation

### After PR Approval

1. **Close GitHub Issue with Summary**

   ```bash
   gh issue close {issue-number} --comment "✅ **Feature Merged to Main**

   PR #{pr-number} merged successfully.

   Post-merge activities:
   - [x] As-built documentation generated
   - [x] User-facing docs updated
   - [x] INDEX status set to 'merged'
   - [x] Feature branch deleted

   Final Stats:
   - Phases completed: {N}/{N}
   - Tests added: {N}
   - Files changed: {N}

   As-built doc: [_sys_documents/as-builts/{feature}-as-built.md]

   Feature complete! 🎉"
   ```

2. **Merge to Main**

   ```bash
   # Via GitHub UI or:
   git checkout main
   git pull origin main
   git merge feature/crm-desk-leads
   git push origin main
   ```

3. **Generate As-Built Documentation**

   ```bash
   cp .claude/templates/as-built-template.md \
      _sys_documents/as-builts/crm-leads-as-built.md
   ```

   **As-builts reflect ACTUAL deployed state:**
   - Current schema (via Supabase MCP tools)
   - Current API endpoints
   - Current component structure
   - Verification commands

4. **Update User-Facing Docs**
   - Update or create `docs/features/CRM-DESK.md`
   - Update `docs/architecture/` if applicable
   - Update `docs/api/REST-API.md` with new endpoints

   Use `documentation-expert` agent:

   ```javascript
   Task(documentation - expert, 'Generate CRM Leads user documentation');
   ```

5. **Lock INDEX File**
   - Update status → "merged"
   - Add merge date and PR number
   - Add final commit hash

6. **Delete Feature Branch**
   ```bash
   git branch -d feature/crm-desk-leads
   git push origin --delete feature/crm-desk-leads
   ```

---

## Document Templates

All templates are in `.claude/templates/`:

| Template                      | Purpose                 | When to Use                  |
| ----------------------------- | ----------------------- | ---------------------------- |
| `INDEX-template.md`           | Master feature tracking | Start of every feature       |
| `phase-design-template.md`    | Design documentation    | Before implementation phases |
| `phase-execution-template.md` | Implementation tracking | During development           |
| `debug-template.md`           | Bug investigation       | When bugs occur              |
| `realignment-template.md`     | Course corrections      | When plans change            |
| `as-built-template.md`        | Current state docs      | After merging to main        |

## Frontmatter Standards

All tracking documents use YAML frontmatter:

```yaml
---
# Required fields
title: "Document title"
type: "design" | "execution" | "as-built" | "debug" | "realignment"
status: "planned" | "in-progress" | "complete" | "blocked"
version: "X.Y"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"

# Optional fields
author: "Team member name"
reviewers: ["reviewer1", "reviewer2"]
dependencies: ["phase1.1-dependency"]
verification:
  - "Verification step 1"
  - "Verification step 2"
---
```

**Never use filename suffixes for status** - use frontmatter instead!

## Version Management

Follow semantic versioning for documents:

- **MAJOR (X.0)**: Breaking changes (schema migrations, API changes)
- **MINOR (1.X)**: Additive changes (new tables, endpoints, features)
- **PATCH (1.1.X)**: Fixes (bugs, corrections, optimizations)

Examples:

- `version: "1.0"` - Initial complete implementation
- `version: "1.1"` - Added new field to API
- `version: "2.0"` - Breaking schema change

## Code References

Always include file:line references in documentation:

```markdown
- [src/services/swr/crm/useLeads.js:15](../../src/services/swr/crm/useLeads.js#L15) - Main hook
- [src/components/sections/desks/crm/LeadsList.jsx:42-51](../../src/components/sections/desks/crm/LeadsList.jsx#L42-L51) - List component
```

This makes documentation actionable and verifiable.

## Skills Integration

Documentation framework integrates with skills:

| Skill                     | Documentation Action               |
| ------------------------- | ---------------------------------- |
| `/TDD`                    | Tests documented in execution doc  |
| `/VERIFY-BEFORE-COMPLETE` | Evidence captured in execution doc |
| `/systematic-debugging`   | Creates debug document             |
| `/software-architecture`  | Informs design documents           |

**Always invoke relevant skills** during feature work!

## Quality Gates

Before merging, verify:

**Phase Documents:**

- [ ] Frontmatter complete and valid YAML
- [ ] Status accurate
- [ ] Code references include line numbers
- [ ] Verification evidence included

**INDEX File:**

- [ ] All phases listed with status
- [ ] Blockers documented
- [ ] Verification checklist complete
- [ ] Timeline updated

**As-Built Documents:**

- [ ] Version incremented correctly
- [ ] Reflects actual deployed state
- [ ] Recent changes documented
- [ ] Commit hash referenced

**User Documentation:**

- [ ] Clear, jargon-free language
- [ ] Examples and screenshots
- [ ] Cross-references correct
- [ ] Table of contents updated

## Common Pitfalls

### ❌ Don't:

- Use filename suffixes for status (`file-[complete].md`)
- Create docs without frontmatter
- Claim completion without verification evidence
- Skip INDEX updates during feature work
- Write code without referencing design docs
- Merge without updating as-builts

### ✅ Do:

- Use frontmatter for all metadata
- Update docs as you work (not after)
- Capture command outputs as evidence
- Keep INDEX as single source of truth
- Reference design docs in code comments
- Generate as-builts immediately after merge

## Automation Opportunities

Future improvements to reduce manual work:

1. **Schema Doc Generator**: Auto-generate from Supabase
2. **API Doc Generator**: Parse Next.js routes
3. **Component Tree Generator**: Parse src/components/
4. **INDEX Dashboard**: HTML view of all features

## Getting Help

- **Framework questions**: Read this guide first
- **Template questions**: Check `.claude/templates/`
- **Workflow questions**: Review [CONTRIBUTING.md](CONTRIBUTING.md)
- **Tool issues**: Open GitHub issue with `documentation` label

---

**Document Status**: ✅ Complete
**Last Updated**: 2026-01-27
**Version**: 1.0
**Author**: Pierce Team
