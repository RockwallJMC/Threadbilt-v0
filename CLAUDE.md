# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**piercedesk6** is a single Next.js 15 application (App Router) for the PierceDesk.AI platform. It uses React 19 and Material-UI 7, and runs the dev server on port 4000.

**Important note (repo reality):** Some sections below reference a future/alternate monorepo layout (e.g. `apps/pierce-desk/`, `packages/*`, `templates/*`, `@pierce/*`). Those paths are **not present in this repository**. When in doubt, prefer the actual layout under `src/` and the scripts in `package.json`.

## How CLAUDE.md Is Loaded (Agent SDK)

This file is only loaded by the Agent SDK when the caller explicitly enables settings sources.

- **Project-level**: CLAUDE.md in repo root (this file)
- **User-level**: ~/.claude/CLAUDE.md
- **Required SDK option**: `settingSources: ["project"]` (TypeScript) or `setting_sources=["project"]` (Python)
- **Important**: The `claude_code` preset does **not** load CLAUDE.md unless settings sources are enabled.

Reference: [Claude Agent SDK - Modifying system prompts](https://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts#methods-of-modification)

## Build & Development Commands

### App Commands (from repo root)

```bash
# Install dependencies
npm install --legacy-peer-deps

# Dev server on port 4000 (TERMINAL ONLY - NEVER use run_in_background)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Start production server
npm run start
```

**IMPORTANT: Development Server Constraints**

- `npm run dev` must ONLY be run in the terminal directly
- NEVER use `run_in_background: true` parameter with Bash tool for dev servers
- This ensures proper visibility of logs, errors, and the ability to stop/restart cleanly
- If dev server needs to be started, inform the user and let them start it manually

## Repository Structure

This repository uses a standard single-app layout:

- `src/app/` - Next.js App Router routes/layouts
- `src/components/` - shared and feature UI components
- `src/layouts/` - application layouts
- `src/routes/` - route metadata (e.g. sitemap)
- `src/services/` - client-side data access (e.g. SWR hooks)

Imports in this repo are currently local/relative (not `@pierce/*` workspace packages).

## Critical Development Workflows

### Execution Strategy (TL;DR)

Follow the documentation framework end-to-end. This is the minimal required flow:

1. **Initiate** → Create GitHub issue + feature branch
2. **Plan** → Create INDEX + phase design docs
3. **Execute** → Implement with phase execution doc updates
4. **Verify** → Run lint/build/tests and capture evidence
5. **Review** → Code review (agent + GitHub)
6. **PR** → Create PR with links to INDEX/design and evidence
7. **Merge** → Merge to main, generate as-built, update user docs

For full details, see [docs/guides/DOCUMENTATION-GUIDE.md](docs/guides/DOCUMENTATION-GUIDE.md).

### Mandatory Execution Framework (ALWAYS REQUIRED)

**This is the foundation of ALL work in this repository. No exceptions.**

#### 1. Skills Are NOT Optional - They Are MANDATORY

<EXTREMELY_IMPORTANT>
**Skills MUST be invoked BEFORE any action, even clarifying questions.**

If there is even a 1% chance a skill applies, you MUST invoke it. This is non-negotiable.
</EXTREMELY_IMPORTANT>

**When to invoke skills:**

- Starting ANY conversation → `/using-superpowers` skill
- Before ANY implementation → `/TDD` skill
- Before ANY architectural decision → `/software-architecture` skill
- Before claiming ANYTHING is complete → `/VERIFY-BEFORE-COMPLETE` skill
- Multi-step features → `/writing-plans` skill
- Any bug/failure → `/systematic-debugging` skill
- File organization → `/file-organizer` skill

**Use the Skill tool:**

```javascript
// Example invocations
Skill tool with skill: "using-superpowers"
Skill tool with skill: "TDD"
Skill tool with skill: "VERIFY-BEFORE-COMPLETE"
Skill tool with skill: "software-architecture"
```

**Red flags that mean you're rationalizing (STOP):**

- "This is just a simple task" → Check for skills anyway
- "I need context first" → Skills tell you HOW to gather context
- "Let me explore first" → Skills tell you HOW to explore
- "I remember this skill" → Skills evolve, invoke current version
- "The skill is overkill" → If it exists, use it

#### 2. Sub-Agents Are NOT Optional - They Are MANDATORY

<EXTREMELY_IMPORTANT>
**ALWAYS use the Task tool with specialized sub-agents for executing work.**

TodoWrite is for TRACKING tasks, but Task tool is for EXECUTING them.
</EXTREMELY_IMPORTANT>

**Use Task tool for ALL:**

- Feature implementation → `react-mui-frontend-engineer`, `wiring-agent`, `supabase-database-architect`
- Test creation → `playwright-tester`
- Code exploration → `Explore` agent (thoroughness: quick/medium/very thorough)
- Documentation → `documentation-expert`
- Database work → `supabase-database-architect` (uses Supabase MCP tools only - cloud database)
- Backend integration → `wiring-agent`
- Code review → `superpowers:code-reviewer`
- Multiple independent tasks → Launch multiple agents IN PARALLEL

**Standard workflow:**

```
1. User requests task
2. Invoke relevant SKILL first (e.g., /TDD, /software-architecture)
3. Use TodoWrite to TRACK task breakdown
4. Use Task tool to EXECUTE each task via specialized agent
5. Mark todos complete ONLY after agent finishes
6. Invoke /VERIFY-BEFORE-COMPLETE before claiming done
```

**Example - Feature Implementation:**

```
User: "Add a user profile settings page"

Step 1: Invoke /using-superpowers skill
Step 2: Invoke /brainstorming skill (creative work)
Step 3: Use TodoWrite to create task list:
  - Research Aurora profile components
  - Design component architecture
  - Implement UI with MUI
  - Wire up API integration
  - Create Playwright tests
  - Verify and commit

Step 4: Use Task tool to execute EACH item:
  - Task(Explore, "Find Aurora profile patterns")
  - Task(react-mui-frontend-engineer, "Build profile UI")
  - Task(wiring-agent, "Connect profile API")
  - Task(playwright-tester, "Create profile tests")

Step 5: Invoke /VERIFY-BEFORE-COMPLETE skill
Step 6: Show verification evidence before claiming complete
```

**Example - Parallel Execution:**

```
User: "Review the authentication code and create tests"

// Launch multiple agents in SINGLE message with multiple Task calls
Task(superpowers:code-reviewer, "Review auth implementation")
Task(playwright-tester, "Create auth test suite")
// Both run in parallel
```

**Critical rules:**

- NEVER execute implementation work directly - always delegate to Task tool
- TodoWrite = planning and tracking ONLY
- Task tool = actual execution
- Multiple independent tasks = parallel Task calls in one message
- Complex exploration = use Explore agent (not direct Grep/Glob)
- Skills + Sub-agents = mandatory combination, not either/or

**GitHub Issue Updates During Execution:**

Sub-agents MUST post progress updates to the GitHub issue at these checkpoints:

1. **Phase start**: Announce phase beginning and agent assignment
2. **Progress milestones**: Update every 30-40% with completed tasks
3. **TDD checkpoint**: After invoking /TDD skill
4. **Playwright completion**: Post test results WITH SCREENSHOTS
5. **Phase completion**: Post verification evidence

Use `gh issue comment {issue-number}` for all updates. See templates in DOCUMENTATION-GUIDE.md.

The GitHub issue number is available in the INDEX frontmatter field `github_issue`. Sub-agents should read the INDEX file to get this value before posting comments.

#### 3. Verification Is Evidence-Based, Always

**No claims without fresh command output:**

- "Tests pass" → Show `npm test` output with 0 failures
- "Build works" → Show `npm run build` with exit code 0
- "Feature complete" → Show verification commands for ALL requirements
- "Bug fixed" → Show test demonstrating fix

**Use `/VERIFY-BEFORE-COMPLETE` skill before:**

- Any commit
- Any PR
- Any "done" claim
- Moving to next task

---

### Documentation Standards (MANDATORY)

<EXTREMELY_IMPORTANT>
**All feature work MUST follow the documentation framework.**

Every feature requires proper documentation from planning through deployment.
</EXTREMELY_IMPORTANT>

#### Documentation Structure

PierceDesk uses a **hybrid documentation strategy**:

```
piercedesk6/
├── docs/                      # USER-FACING DOCUMENTATION
│   ├── architecture/          # System design
│   ├── features/              # Feature documentation
│   ├── guides/                # How-to guides
│   └── api/                   # API reference
│
└── _sys_documents/            # INTERNAL TRACKING
    ├── AGENT.md               # Organization rules (READ THIS FIRST!)
    ├── vision/                # Product vision
    ├── roadmap/               # Strategic plans
    ├── design/                # Design documents
    ├── execution/             # Implementation tracking
    └── as-builts/             # Current state docs
```

**CRITICAL:** Before creating ANY file in `_sys_documents/`, read [_sys_documents/AGENT.md](_sys_documents/AGENT.md) for strict organization rules, file naming conventions, and lifecycle management.

#### Feature Documentation Workflow

**When creating ANY feature:**

1. **Create INDEX File** (Master tracking document)

   ```bash
   cp .claude/templates/INDEX-template.md \
      _sys_documents/execution/INDEX-feature-name.md
   ```

   - Single source of truth for feature progress
   - Tracks all phases, blockers, decisions
   - Updated continuously throughout development

1.5. **Create GitHub Issue and Feature Branch** (After plan approval)

   After plan mode completes and user approves:

   a. Create feature branch:
   ```bash
   git checkout -b feature/desk-{feature-name}
   ```

   b. Create GitHub issue:
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

   ## Branch
   `feature/desk-{feature-name}`

   ---
   🤖 Created by Claude Code
   EOF
   )"
   ```

   c. Update INDEX frontmatter with `github_issue` and `feature_branch` fields

   d. Commit and push INDEX update:
   ```bash
   git add _sys_documents/execution/INDEX-{feature}.md
   git commit -m "Add GitHub issue tracking to INDEX

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
   git push -u origin feature/desk-{feature-name}
   ```

   e. Post kickoff comment to issue:
   ```bash
   gh issue comment {issue-number} --body "🚀 Feature branch created and INDEX updated. Starting implementation..."
   ```

2. **Create Phase Design Documents**

   ```bash
   cp .claude/templates/phase-design-template.md \
      _sys_documents/design/phase-X.Y-topic.md
   ```

   - One per major phase of work
   - Architecture, decisions, dependencies
   - Status tracked via YAML frontmatter

3. **Create Phase Execution Documents**

   ```bash
   cp .claude/templates/phase-execution-template.md \
      _sys_documents/execution/phase-X.Y-topic.md
   ```

   - Implementation log with dated entries
   - Progress percentage and code references
   - Verification evidence required

4. **Update As-Built Documentation** (After merge)

   ```bash
   cp .claude/templates/as-built-template.md \
      _sys_documents/as-builts/feature-as-built.md
   ```

   - Reflects ACTUAL deployed state
   - Living documents, always current
   - Version incremented with changes

5. **Update User-Facing Documentation**
   - Use `Task(documentation-expert, "Generate docs")`
   - Update `docs/features/`, `docs/architecture/`, `docs/api/`
   - Keep user docs clear and current

#### Abbreviated Workflow (Shallow Impact Features)

**When to use abbreviated workflow:**

Use the simplified documentation process when ALL of these criteria are met:

- **Single file or ≤ 3 files** modified
- **< 50 lines of code** total change
- **No architectural decisions** required
- **No database schema changes**
- **No API contract changes**
- **No new external dependencies**
- **No security implications**

**Abbreviated process:**

1. **Create simplified INDEX** (required)
   - Use INDEX template but skip Risk Register, Dependencies sections
   - Single combined "Design & Implementation" phase instead of separate phases
   - Still include verification checklist and evidence

2. **Create single design-implementation document** (optional)
   - Combine design decisions + implementation log in one document
   - Use phase-design-template.md as base, add implementation log section
   - Useful if decisions need documentation, skip if straightforward

3. **Create verification document** (required)
   - Always verify with commands (build, lint, tests)
   - Document evidence even for small changes
   - Use phase-execution-template.md verification sections

4. **Update user-facing docs if needed**
   - Only if feature affects user-facing functionality

**When to use FULL workflow:**

- Any feature not meeting ALL abbreviated criteria above
- Deep impact features (database, API, multi-module, security)
- Features requiring cross-team coordination
- Features with multiple implementation options requiring decisions

**Example abbreviated workflow:**

```bash
# Small fix: Update button color in single component
# Criteria met: 1 file, 3 lines, no architecture/DB/API changes

1. Create: _sys_documents/execution/INDEX-button-color-fix.md (simplified)
2. Skip separate phase docs (straightforward change)
3. Create: _sys_documents/execution/verification-button-color.md
4. Capture: build output, lint output, screenshot
```

**Framework testing note:** The test-rectangle feature (framework validation) used full workflow to exercise all templates, but would qualify for abbreviated workflow by the criteria above.

#### Document Templates

All templates in `.claude/templates/`:

| Template                      | When to Use            |
| ----------------------------- | ---------------------- |
| `INDEX-template.md`           | Start of every feature |
| `phase-design-template.md`    | Before implementation  |
| `phase-execution-template.md` | During development     |
| `debug-template.md`           | When bugs occur        |
| `realignment-template.md`     | When plans change      |
| `as-built-template.md`        | After merging          |

**Template Examples:** See `.claude/templates/examples/` for completed example documents showing proper usage of each template. The examples demonstrate expected format, detail level, and cross-referencing patterns.

#### Frontmatter Standards

**All tracking documents use YAML frontmatter** (NO filename suffixes):

```yaml
---
title: "Document title"
type: "design" | "execution" | "as-built"
status: "planned" | "in-progress" | "complete" | "blocked"
version: "X.Y"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---
```

#### Debugging & Realignment

**When bugs occur:**

1. Create debug document: `_sys_documents/execution/debug-BUG-XXX.md`
2. Invoke `/systematic-debugging` skill
3. Document investigation, root cause, fix
4. Update INDEX with blocker if needed

**When plans change:**

1. Create realignment document: `_sys_documents/execution/realign-YYYY-MM-DD-topic.md`
2. Document original vs. new approach, rationale
3. Get approval for scope/timeline changes
4. Update INDEX and phase documents

#### Documentation Quality Gates

Before merging ANY feature:

- [ ] INDEX file complete and current
- [ ] All phase documents have status and verification
- [ ] Code references include file:line numbers
- [ ] As-built generated and reflects deployed state
- [ ] User-facing docs updated
- [ ] All YAML frontmatter valid

**For detailed workflow**, see [Documentation Guide](docs/guides/DOCUMENTATION-GUIDE.md)

---

### Aurora-First Development Pattern (MANDATORY)

**NEVER build UI components from scratch.** This is a strict requirement:

1. **Search Aurora Template First**
   - Search templates/aurora-next/src/ for similar components
   - Check Aurora documentation at https://aurora.themewagon.com/documentation/introduction
   - Document search attempts using Aurora Search Log template

2. **Copy-Then-Modify**

   ```bash
   # Copy from Aurora template to Pierce Desk
   cp -r templates/aurora-next/src/sections/example apps/pierce-desk/src/sections/
   ```

3. **Customize for Pierce**
   - Update imports from Aurora paths to @pierce/\* packages
   - Modify functionality to match specifications
   - Maintain Material-UI theme compliance

4. **Only Create Custom Components When:**
   - No Aurora match exists (Medium/Low similarity)
   - Search is documented in Aurora Search Log
   - Custom component follows Material-UI patterns

**Location of Aurora compliance instructions:**

- `AGENTS-MAIN/agents/agent-instruction/aurora-compliance.instructions.md`

### Feature Development Workflow (MANDATORY)

**When developing new features, you MUST follow the PIERCE-SYS-EXE orchestration process.**

**Framework Documentation:**

- `agent-overview.md` - Complete orchestration framework
- `PIERCE-SYS-EXE/README.md` - Quick start guide

**Process:**

1. **Determine Impact Level**
   - **Deep Impact:** Schema changes, API changes, multi-module, AI/POLY, LiveSite → Full workflow
   - **Shallow Impact:** UI tweaks, single-module, no schema/API changes → Abbreviated workflow

2. **Create Feature Folder**

   ```bash
   cp -r PIERCE-SYS-EXE/FEATURE-template PIERCE-SYS-EXE/FEATURE-{feature-name}
   ```

3. **Follow the Phased Workflow**

   | Phase             | Output                                               | Checkpoint          |
   | ----------------- | ---------------------------------------------------- | ------------------- |
   | 1. Strategic      | 01_saas-perspective.md, 02_subscriber-perspective.md | C1                  |
   | 2. Assessment     | 03_product-assessment.md                             | C2 (Human approval) |
   | 3. Planning       | 04-06 docs + eng/\*.md plans                         | C3                  |
   | 4. Review         | INDEX.md reports compiled                            | C4 (Human approval) |
   | 5. Implementation | Feature branch + code                                | C5-C7               |

4. **Never Skip Checkpoints**
   - C2 and C4 require explicit human approval
   - All work tracked in INDEX.md
   - Mark TBD items in Information Requested section

**Key Rules:**

- INDEX.md is the single source of truth for all feature work
- Deep impact features require 250-line minimum reports
- Lock INDEX.md after feature is merged (status: locked)

## Skills Framework (MANDATORY)

<EXTREMELY_IMPORTANT>
The repository uses Claude Code skills (`.claude/skills/`) to enforce critical development practices.

**Skills are NOT optional suggestions - they are MANDATORY checkpoints.**

If there is even a 1% chance a skill applies to your current action, you MUST invoke it BEFORE proceeding.
</EXTREMELY_IMPORTANT>

**Key Principle:** Skills tell you HOW to work. Sub-agents (Task tool) do the ACTUAL work. Always use both.

### Available Skills

#### 1. TDD - Test-Driven Development

**Location:** `.claude/skills/TDD/SKILL.md`
**Command:** `/TDD` or use Skill tool with `skill: "TDD"`

**When to invoke:**

- BEFORE implementing any feature or bugfix
- BEFORE writing implementation code
- When fixing bugs (write failing test first)

**Core principle:** Write test first → Watch it fail → Write minimal code to pass → Refactor

**Key requirements:**

- Red-Green-Refactor cycle is mandatory
- NEVER write production code without a failing test first
- Watch each test fail before implementing
- See `.claude/skills/TDD/testing-anti-patterns.md` for common pitfalls

#### 2. VERIFY-BEFORE-COMPLETE / using-superpowers

**Location:** `.claude/skills/VERIFY-BEFORE-COMPLETE/SKILL.md` or `.claude/skills/using-superpowers/SKILL.md`
**Command:** `/verify` or `/using-superpowers` or use Skill tool

**When to invoke:**

- BEFORE claiming work is complete, fixed, or passing
- BEFORE committing code
- BEFORE creating PRs
- BEFORE moving to next task
- BEFORE any statement suggesting completion/success

**Core principle:** Evidence before assertions, always

**Key requirements:**

- Run verification commands and show output
- No completion claims without fresh evidence
- Tests pass → Show test output with 0 failures
- Build succeeds → Show build command with exit 0
- Never use "should", "probably", "seems to" when claiming completion

#### 3. software-architecture

**Location:** `.claude/skills/software-architecture/SKILL.md`
**Command:** `/software-architecture` or use Skill tool with `skill: "software-architecture"`

**When to invoke:**

- When designing or analyzing code architecture
- When writing any code (for quality standards)
- When making architectural decisions
- During code reviews

**Core principles:**

- Clean Architecture & Domain-Driven Design
- Library-first approach (search npm before writing custom code)
- Domain-specific naming (avoid generic names like `utils`, `helpers`)
- Separation of concerns (no business logic in UI)
- Early return pattern for readability

#### 4. file-organizer

**Location:** `.claude/skills/file-organizer/SKILL.md`
**Command:** `/file-organizer` or use Skill tool with `skill: "file-organizer"`

**When to invoke:**

- When organizing files and folders
- When codebase structure needs cleanup
- When finding duplicates or suggesting better structures

**Purpose:**

- Intelligently organize files across the workspace
- Reduce cognitive load
- Maintain clean digital workspace

### Skill Integration in Workflow

**Standard Development Flow (Skills + Sub-Agents):**

```
1. Receive task/feature request
2. INVOKE using-superpowers skill → Establish workflow foundation
3. INVOKE relevant skill (brainstorming, TDD, software-architecture) → Get approach
4. Use TodoWrite → Create task tracking list
5. Use Task tool → Execute EACH task via specialized sub-agent
   - Explore agent for codebase research
   - react-mui-frontend-engineer for UI implementation
   - wiring-agent for API integration
   - playwright-tester for test creation
   - supabase-database-architect for database work
6. Mark todos complete ONLY after Task agent finishes
7. INVOKE VERIFY-BEFORE-COMPLETE skill → Run verification commands
8. Show command output evidence (test results, build success)
9. Commit only after verification evidence shown
```

**Critical: Skills guide the process, Task tool executes the work. Use both together, always.**

**Critical Checkpoints:**

| Checkpoint                    | Required Skill         | Verification                  |
| ----------------------------- | ---------------------- | ----------------------------- |
| Before writing implementation | TDD                    | Test written and failing      |
| Before claiming "tests pass"  | VERIFY-BEFORE-COMPLETE | Test command output shown     |
| Before claiming "build works" | VERIFY-BEFORE-COMPLETE | Build command exit 0 shown    |
| Before commit/PR              | VERIFY-BEFORE-COMPLETE | Full verification evidence    |
| During architecture decisions | software-architecture  | Clean Architecture principles |
| File organization tasks       | file-organizer         | Structured cleanup            |

### Skill Invocation Methods

1. **Slash Commands:** `/TDD`, `/verify`, `/software-architecture`, `/file-organizer`
2. **Skill Tool:** Use the Skill tool in Claude Code

   ```
   Skill tool with skill: "TDD"
   Skill tool with skill: "VERIFY-BEFORE-COMPLETE"
   Skill tool with skill: "software-architecture"
   Skill tool with skill: "file-organizer"
   ```

3. **Auto-invocation by Agents:** Sub-agents should automatically reference and invoke skills at appropriate workflow points

### Integration with Agent Framework

Skills work alongside the agent framework:

- **PIERCE-SYS-EXE** → Feature orchestration workflow
- **AGENTS-MAIN** → Coding standards and guidelines
- **Skills** → Enforced practices and quality gates

**Example Agent + Skill Integration:**

- `react-mui-frontend-engineer` agent uses `TDD` skill before implementation
- `react-mui-frontend-engineer` agent uses `VERIFY-BEFORE-COMPLETE` before claiming completion
- All agents reference `software-architecture` for code quality standards

### Available Sub-Agents (Task Tool)

**ALWAYS use specialized sub-agents via Task tool for execution work:**

| Agent                         | When to Use                                                                                                                  | Example                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `Explore`                     | Codebase exploration, pattern finding, architecture understanding                                                            | Task(Explore, "Find authentication patterns", thoroughness: "medium")   |
| `react-mui-frontend-engineer` | UI component creation, Aurora duplication, MUI implementation                                                                | Task(react-mui-frontend-engineer, "Build profile settings page")        |
| `wiring-agent`                | API integration, SWR hooks, authentication flows, routing                                                                    | Task(wiring-agent, "Implement user profile API integration")            |
| `supabase-database-architect` | Schema design, migrations, RLS policies, database queries (ALWAYS uses Supabase MCP tools - database is in cloud, not local) | Task(supabase-database-architect, "Create user_profiles table")         |
| `playwright-tester`           | E2E test creation, test debugging, test maintenance                                                                          | Task(playwright-tester, "Create login flow tests")                      |
| `documentation-expert`        | README updates, API docs, docstrings, CHANGELOG                                                                              | Task(documentation-expert, "Document authentication API")               |
| `superpowers:code-reviewer`   | Code review after major feature completion                                                                                   | Task(superpowers:code-reviewer, "Review authentication implementation") |
| `feature-dev:code-architect`  | Design feature architecture, create implementation blueprints                                                                | Task(feature-dev:code-architect, "Design metrics export system")        |

**Parallel Execution:**
When tasks are independent, launch multiple agents in a SINGLE message:

```javascript
// CORRECT - Single message, multiple Task calls
Task(Explore, 'Find dashboard patterns');
Task(react - mui - frontend - engineer, 'Build dashboard UI');
Task(playwright - tester, 'Create dashboard tests');

// INCORRECT - Sequential when could be parallel
// Task... wait for result... Task... wait for result...
```

### Common Pitfalls

1. **Skipping TDD** - "I'll write tests after" → Tests written after prove nothing
2. **Claiming without verification** - "Should work now" → Run the command, show output
3. **Executing work directly instead of Task tool** - Always delegate to specialized sub-agents
4. **Using TodoWrite for execution** - TodoWrite tracks, Task tool executes
5. **Not invoking skills** - Skills exist to prevent quality issues, use them!
6. **Building custom utilities** - Check npm first, use established libraries
7. **Generic naming** - Avoid `utils.js` with 50 functions → Use domain-specific names
8. **Sequential execution of independent tasks** - Use parallel Task calls in single message

**See Also:**

- `.claude/skills/TDD/testing-anti-patterns.md` - Testing antipatterns to avoid
- `.claude/agents/` - Agent definitions that should invoke these skills
- `.claude/skills-integration-guide.md` - Detailed guide on skill usage (to be created)

## Aurora Component Development Guide

### Critical Rule: Duplicate, Never Edit Templates

**NEVER edit files in `templates/aurora-next/`**. This is the source of truth.

**Workflow:**

1. Find the component in `templates/aurora-next/src/`
2. Copy the file to the corresponding location in `apps/pierce-desk/src/`
3. Edit ONLY the copied file
4. Update imports from Aurora paths to @pierce/\* packages

**Example:**

```bash
# Copy authentication component
cp templates/aurora-next/src/components/sections/authentications/default/LoginForm.jsx \
   apps/pierce-desk/src/components/sections/authentications/default/LoginForm.jsx

# Then edit apps/pierce-desk/src/components/sections/authentications/default/LoginForm.jsx
```

### MUI v7 Import Patterns

**Grid (MUI v7 syntax - uses `size` prop, not `xs/md` directly):**

```javascript
import Grid from '@mui/material/Grid';

// Usage
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>Left column</Grid>
  <Grid size={{ xs: 12, md: 6 }}>Right column</Grid>
</Grid>

// Responsive spacing
<Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
```

**Paper for content sections:**

```javascript
import Paper from '@mui/material/Paper';

// Basic elevation
<Paper variant="elevation" sx={{ p: 2, borderRadius: 2 }}>
  Content
</Paper>

// With background levels (1-5)
<Paper background={1} sx={{ p: 1, borderRadius: 2 }}>
  Content
</Paper>
```

**Stack for flex layouts:**

```javascript
import { Stack } from '@mui/material';

// Horizontal row with spacing
<Stack direction="row" spacing={2}>
  <Item />
  <Item />
</Stack>

// Responsive direction
<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
  <Item />
  <Item />
</Stack>

// Combined with Grid
<Stack direction="row" spacing={2}>
  <Grid container spacing={2}>
    <Grid size={{ xs: 12, md: 6 }}>Content</Grid>
  </Grid>
</Stack>
```

**Drawer with drawerClasses:**

```javascript
import Drawer, { drawerClasses } from '@mui/material/Drawer';

<Drawer
  variant="permanent"
  sx={{
    [`& .${drawerClasses.paper}`]: {
      width: drawerWidth,
      border: 0,
      borderRight: 1,
      borderColor: 'divider',
      transition: theme.transitions.create(['width'], {
        duration: theme.transitions.duration.standard,
      }),
    },
  }}
>
```

### Authentication Components

**Template Location:** `templates/aurora-next/src/components/sections/authentications/`

**Key Components:**

- `LoginForm.jsx` - Login with email/password
- `SignupForm.jsx` - Registration form
- `ForgotPasswordForm.jsx` - Password recovery
- `SetPasswordForm.jsx` - Password reset
- `TwoFAForm.jsx` - Two-factor authentication
- `SocialAuth.jsx` - OAuth buttons (Google, GitHub, etc.)

**Import Update Pattern (Aurora → Pierce):**

```javascript
// Aurora template uses:
import { rootPaths } from 'routes/paths';

// Pierce-desk should use:
import { rootPaths } from '@pierce/routes';
```

### Shared Packages Reference

**Routes and Navigation:**

```javascript
import paths, { rootPaths } from '@pierce/routes';
import sitemap from '@pierce/routes/sitemap';
```

**Services (API calls, SWR):**

```javascript
import { axiosFetcher, axiosInstance } from '@pierce/services';
import { useAuthApi, useProductApi } from '@pierce/services/swr';
```

**Utilities:**

```javascript
import { formatDate, kebabCase } from '@pierce/utils';
import { passwordStrength } from '@pierce/utils';
```

**Data (mock/seed data):**

```javascript
import { calendarData } from '@pierce/data';
import { countries } from '@pierce/data';
```

**Locales:**

```javascript
import { i18n, languages } from '@pierce/locales';
```

### sitemap.js Structure

**Location:** `packages/shared/routes/src/sitemap.js`

**Structure:**

```javascript
const sitemap = [
  {
    id: 'section-id',
    subheader: 'SECTION NAME',
    key: 'section_key',
    icon: 'material-symbols:icon-name',
    items: [
      {
        name: 'Page Name',
        key: 'page_key',
        path: paths.pagePath,
        pathName: 'page-name',
        icon: 'material-symbols:icon',
        active: true,
        items: [...] // nested items
      },
    ],
  },
];
```

**Adding New Routes:**

1. Add path in `packages/shared/routes/src/paths.js`
2. Add sitemap entry in `packages/shared/routes/src/sitemap.js`
3. Create page in `apps/pierce-desk/src/app/`

### MCP Server Integration

**Configuration:** `.mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

<EXTREMELY_IMPORTANT>
**Database is in the CLOUD - ALWAYS use Supabase MCP tools**

The Supabase database is hosted in the cloud, NOT locally. You MUST use Supabase MCP tools (functions with `mcp__` prefix) for ALL database operations.

**NEVER:**

- ❌ Try to connect with psql locally
- ❌ Use DATABASE_URL for local connections
- ❌ Suggest pg_dump or pg_restore commands
- ❌ Attempt to connect to localhost:5432
- ❌ Use direct PostgreSQL connection strings

**ALWAYS:**

- ✅ Use Supabase MCP tools for schema inspection
- ✅ Use Supabase MCP tools for SQL execution
- ✅ Use Supabase MCP tools for query testing
- ✅ Use Supabase MCP tools for RLS policy inspection
- ✅ Use Task tool with `supabase-database-architect` agent for database work
  </EXTREMELY_IMPORTANT>

### Common Component Locations

| Component Type | Aurora Template                                                  | Pierce-desk Target                                          |
| -------------- | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Auth Forms     | `templates/aurora-next/src/components/sections/authentications/` | `apps/pierce-desk/src/components/sections/authentications/` |
| Dashboards     | `templates/aurora-next/src/components/sections/dashboards/`      | `apps/pierce-desk/src/components/sections/dashboards/`      |
| Layouts        | `templates/aurora-next/src/layouts/`                             | `apps/pierce-desk/src/layouts/`                             |
| Pages          | `templates/aurora-next/src/app/(main)/`                          | `apps/pierce-desk/src/app/`                                 |

### Working with the Agent Framework

The repository includes two complementary frameworks:

**1. PIERCE-SYS-EXE Orchestration (Feature Development)**

- `agent-overview.md` - Sub-Agent Orchestration Framework for feature workflows
- `PIERCE-SYS-EXE/` - Feature execution directory with INDEX tracking
- Use this for all new feature development (see Feature Development Workflow above)

**2. AGENTS-MAIN (Coding Standards & Guidelines)**

The repository includes coding standards in `AGENTS-MAIN/`:

**Core Agents (6):**

- UI/UX Agent - Design system, accessibility, Aurora compliance
- Wiring Agent - Backend APIs, integration
- Database Agent - Schema design, migrations
- OSS Agent - Dependency management, security
- CI/CD Agent - Testing, deployment
- Orchestration Agent - GitHub-first feature coordination

**Key Documents:**

- `AGENTS-MAIN/README.md` - Framework overview
- `AGENTS-MAIN/AI_TOOL_INTEGRATION.md` - How to work with this framework
- `AGENTS-MAIN/agents/uiux/exec.md` - UI development workflow
- `AGENTS-MAIN/agents/agent-instruction/` - Coding standards

**Using Agents in Claude Code:**
When starting work on a feature:

1. Invoke `/using-superpowers` skill FIRST
2. Follow PIERCE-SYS-EXE workflow (create INDEX.md, follow checkpoints)
3. Use Task tool with specialized sub-agents for ALL implementation work:
   - UI work → Task(react-mui-frontend-engineer, "...")
   - API work → Task(wiring-agent, "...")
   - Database → Task(supabase-database-architect, "...") - Agent uses MCP tools for cloud database
   - Tests → Task(playwright-tester, "...")
   - Exploration → Task(Explore, "...", thoroughness: "medium")
4. Reference relevant agent documentation for coding standards:
   - UI work → Read `AGENTS-MAIN/agents/uiux/exec.md`
   - API work → Read `AGENTS-MAIN/agents/wiring/exec.md`
   - Database → Read `AGENTS-MAIN/agents/database/exec.md`
5. Invoke `/VERIFY-BEFORE-COMPLETE` before any completion claim

### GitHub-First Coordination

For multi-agent feature work:

1. Feature requests should be GitHub issues
2. Create PIERCE-SYS-EXE feature folder and INDEX.md
3. Follow checkpoint-gated workflow with human approvals at C2 and C4
4. Agents coordinate via GitHub issue comments

## Architecture Patterns

### Next.js App Router Structure

Pierce Desk uses Next.js 15 App Router:

```
apps/pierce-desk/src/
├── app/              # App Router pages and layouts
│   ├── layout.tsx    # Root layout with providers
│   ├── page.tsx      # Home page
│   └── [routes]/     # Route-based pages
├── components/       # App-specific components
├── sections/         # Page sections (from Aurora)
└── ...
```

### Material-UI Theme Integration

- Theme packages: `@pierce/aurora-theme` and `@pierce/mantis-theme`
- Providers: `@pierce/aurora-providers` (ThemeProvider, SettingsProvider, etc.)
- Custom components override in theme using `components` key
- Use theme hooks from `@pierce/aurora-hooks` (useThemeMode, useColorScheme)

### SWR and API Services

API services are in `@pierce/services`:

- Use SWR for data fetching
- Follow service patterns in shared/services/
- API documentation: See root README.md → API Documentation link

### Multi-Tenant Database Architecture

Database uses Supabase with PostgreSQL (CLOUD-HOSTED):

- **Cloud database**: All operations MUST use Supabase MCP tools
- Multi-tenant with Row Level Security (RLS)
- Schema documentation in `database-documentation/`
- Follow database agent guidelines in `AGENTS-MAIN/agents/database/`

**For ALL database work:**

1. Use Task tool with `supabase-database-architect` agent
2. Agent will use Supabase MCP tools (never local connections)
3. Inspect schema via MCP before modifications
4. Execute SQL via MCP tools
5. Verify changes via MCP tools

## Testing

### Playwright Tests

Location: `AGENTS-MAIN/agents/agent-instruction/playwright-typescript.md`

Key guidelines:

- Use TypeScript for all test files
- Follow page object model pattern
- Use data-testid attributes for selectors
- Playwright config at test root

## Security & Standards

### OWASP Compliance

**Critical:** Follow security guidelines in `AGENTS-MAIN/agents/agent-instruction/security-owasp-guidelines.md`

Key requirements:

- Input validation at all boundaries
- Parameterized queries (prevent SQL injection)
- XSS prevention (sanitize outputs)
- CSRF protection on state-changing operations
- Secure authentication patterns

### React/TypeScript Standards

Highlights:

- React 19.2 with modern hooks
- TypeScript for all components
- Functional components only
- React Hook Form for forms with Yup validation
- Emotion/styled for styling (via Material-UI)

### Accessibility (WCAG 2.1 AA)

Required for all UI components:

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Focus management

## Important Documentation

**Product & Vision:**

- Root `README.md` - Complete documentation index
- `vision-and-planning/piercedesk-VISION.md` - Product vision
- `vision-and-planning/piercedesk-a-snapshot.md` - Quick overview

- `development-and-technical/piercedesk-development.md` - Development setup

**Database:**

- `database-documentation/database-architecture.md` - Multi-tenant architecture
- `database-documentation/database-schema-template.md` - Schema documentation template

**Features:**

- `features-documentation/piercedesk-features-AI.md` - AI capabilities
- `sprints-and-project-management/piercedesk-SPRINTS.md` - Sprint planning

**Feature Development:**

- `agent-overview.md` - Claude Sub-Agent Orchestration Framework
- `PIERCE-SYS-EXE/README.md` - Feature execution directory
- `PIERCE-SYS-EXE/FEATURE-template/` - Starter template for new features

## Common Pitfalls to Avoid

1. **NOT INVOKING SKILLS** - Skills are MANDATORY, not optional. Even 1% chance = invoke the skill
2. **EXECUTING WORK DIRECTLY** - Always use Task tool with specialized sub-agents for implementation
3. **Using TodoWrite for execution** - TodoWrite is for TRACKING only, Task tool is for EXECUTING
4. **Claiming completion without verification** - Always invoke /VERIFY-BEFORE-COMPLETE and show command output
5. **Building UI from scratch** - Always search Aurora first, use copy-then-modify pattern
6. **Ignoring AGENTS-MAIN guidelines** - These enforce quality and consistency
7. **Direct dependency installation** - Use `--legacy-peer-deps` flag
8. **Skipping Aurora Search Log** - Document all Aurora searches when creating components
9. **Not following Material-UI theme** - Use theme tokens, not hardcoded values
10. **Missing TypeScript types** - All code must be properly typed
11. **Security vulnerabilities** - Review OWASP guidelines before implementing auth/data handling
12. **Skipping PIERCE-SYS-EXE process** - All features must follow the orchestration workflow with INDEX tracking
13. **Skipping TDD** - NEVER write production code without tests first
14. **Not using parallel agents** - Independent tasks should use multiple Task calls in single message
15. **Trying to connect to database locally** - Database is in Supabase cloud, ALWAYS use MCP tools (never psql, pg_dump, DATABASE_URL)

## Node Version Requirements

- Node.js >= 20.0.0
- npm >= 10.0.0
- Package manager: npm with `--legacy-peer-deps`

## Additional Context

When working on features: 2. Check if similar components exist in `templates/aurora-next/` 3. Follow the copy-then-modify pattern for UI
