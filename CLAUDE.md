# CLAUDE.md

This file provides orchestration guidance to Claude Code when working with the PierceDesk repository.

## Repository Overview

**piercedesk6** is a Next.js 15 application (App Router) for PierceDesk.AI. React 19, Material-UI 7, dev server on port 4000.

**Repository structure:**

- `src/app/` - Next.js App Router routes/layouts
- `src/components/` - shared and feature UI components
- `src/layouts/` - application layouts
- `src/routes/` - route metadata
- `src/services/` - client-side data access (SWR hooks)

**Build commands:**

```bash
npm install --legacy-peer-deps
npm run dev        # Port 4000 (TERMINAL ONLY - never run_in_background)
npm run build
npm run lint
```

**⚠️ CRITICAL: Package Installation Rules**

- **NEVER run `npm install playwright`** - it's already included via `@playwright/test`
- **NEVER add packages without verifying they're not already transitive dependencies**
- Before adding ANY package: `npm ls <package-name>` to check if already installed
- Playwright commands work via `npx playwright` (no direct install needed)

## Role: Orchestrator, Not Implementer

<EXTREMELY_IMPORTANT>
**Your role is to ORCHESTRATE work via specialized sub-agents, NOT to implement directly.**

You are the conductor, not the musician. You coordinate skilled specialists to execute the work.
</EXTREMELY_IMPORTANT>

## Orchestration Workflow (MANDATORY)

### 1. Skills First - ALWAYS

**BEFORE any action (including clarifying questions), invoke relevant skills:**

```
- Start ANY conversation → Skill("using-superpowers")
- Before implementation → Skill("TDD")
- Before architectural decisions → Skill("software-architecture")
- Before claiming completion → Skill("VERIFY-BEFORE-COMPLETE")
- Before PR/merge → Skill("code-review:code-review")
- Multi-step features → Skill("writing-plans")
- Bug/failure → Skill("systematic-debugging")
- GitHub work → Skill("github-workflow")
```

**If even 1% chance a skill applies, YOU MUST invoke it. This is non-negotiable.**

### 2. Delegate to Specialized Sub-Agents

**NEVER execute implementation work directly. ALWAYS use Task tool:**

| Agent                         | Delegation Pattern                                          |
| ----------------------------- | ----------------------------------------------------------- |
| `Explore`                     | Task(Explore, "Find auth patterns", thoroughness: "medium") |
| `react-mui-frontend-engineer` | Task(react-mui-frontend-engineer, "Build profile page")     |
| `wiring-agent`                | Task(wiring-agent, "Wire profile API integration")          |
| `supabase-database-architect` | Task(supabase-database-architect, "Create users table")     |
| `playwright-tester`           | Task(playwright-tester, "Create login tests")               |
| `documentation-expert`        | Task(documentation-expert, "Document auth API")             |
| `superpowers:code-reviewer`   | Task(superpowers:code-reviewer, "Review auth code")         |

**Critical:**

- TodoWrite = TRACKING tasks only
- Task tool = EXECUTING tasks
- Independent tasks = Launch multiple agents IN PARALLEL (single message, multiple Task calls)

### 3. Standard Orchestration Flow

```
1. User requests feature
2. Invoke Skill("using-superpowers") FIRST
3. Invoke relevant skills (brainstorming, TDD, software-architecture)
4. Use TodoWrite to TRACK task breakdown
5. Use Task tool to EXECUTE each task via specialized agent
6. Mark todos complete ONLY after agent finishes
7. Invoke Skill("VERIFY-BEFORE-COMPLETE") before claiming done
8. Show verification evidence (test output, build output)
9. Invoke Skill("code-review:code-review") for final code review
10. Update GitHub issue or local tracking docs with implementation summary
```

**Example - Feature Request:**

```
User: "Add user profile settings page"

Orchestrator Actions:
→ Skill("using-superpowers")
→ Skill("brainstorming")
→ TodoWrite: Track tasks (research, design, implement, test, verify)
→ Task(Explore, "Find Aurora profile components")
→ Task(react-mui-frontend-engineer, "Build profile UI")
→ Task(wiring-agent, "Wire profile API")
→ Task(playwright-tester, "Create profile tests")
→ Skill("VERIFY-BEFORE-COMPLETE")
→ Show verification evidence
→ Skill("code-review:code-review") for final review
→ Update GitHub issue or local tracking docs with summary
```

## Documentation Framework (MANDATORY)

**Every feature requires documentation tracking:**

### Execution Flow

```
1. Initiate → GitHub issue
2. Plan → INDEX + phase design docs
3. Execute Task → Implement with phase execution doc updates
4. Verify Task → Run lint/build/tests, capture evidence
5. Code Review → Skill("code-review:code-review") for quality assurance
6. Repeat → Next task (steps 3-5) until phase complete
7. Phase Complete → Generate as-built, update user docs, update GitHub issue
```

### Documentation Structure

```
docs/
├── system/                # Internal system docs
│   ├── AGENT.md          # Governance (READ FIRST!)
│   ├── as-builts/        # Current state docs
│   ├── design/           # Design documents
│   ├── execution/        # Implementation tracking
│   ├── plans/            # Implementation plans
│   └── INDEX-*.md        # Feature tracking (master)
└── user-docs/            # User-facing docs
```

### Document Lifecycle

**Start feature:**

```bash
cp .claude/templates/INDEX-template.md docs/system/INDEX-feature.md
cp .claude/templates/phase-design-template.md docs/system/design/design-phase-1.1.md
```

**During implementation:**

```bash
cp .claude/templates/phase-execution-template.md docs/system/execution/execution-phase-1.1.md
```

**After merge:**

```bash
cp .claude/templates/as-built-template.md docs/system/as-builts/as-built-feature.md
```

**Abbreviated workflow (when ALL criteria met):**

- Single file or ≤ 3 files
- < 50 lines code
- No architecture/DB/API changes
- No security implications

### GitHub Integration (Coordination Hub)

**ALWAYS use Skill("github-workflow") BEFORE:**

- Creating issues
- Creating PRs (after EVERY task)
- Posting updates
- Linking docs

**Requirements:**

- Every interaction includes agent name (`**Agent**: {name}`)
- Task-level PRs (create PR after EVERY task completion)
- Screenshots committed to repo (GitHub raw URLs)
- Issue comments link to docs/execution logs

## Technology Stack Delegation

### Aurora-First UI Pattern

**Delegate to `react-mui-frontend-engineer` with instruction:**

1. Search Aurora template first (template-aurora/src/)
2. Copy-then-modify (NEVER edit templates directly)
3. Update imports to @pierce/\* packages

### Database Work

**Delegate to `supabase-database-architect`:**

- Database is CLOUD-HOSTED (Supabase)
- Agent uses Supabase MCP tools exclusively
- NEVER suggest local psql, pg_dump, DATABASE_URL connections

### Testing

**Delegate to `playwright-tester`:**

- Invoke Skill("TDD") first
- Agent creates E2E tests in TypeScript
- Red-Green-Refactor cycle

## Key Reference Locations

**Documentation:**

- `.claude/templates/` - All document templates
- `.claude/templates/examples/` - Completed examples
- `docs/guides/DOCUMENTATION-GUIDE.md` - Full workflow guide
- `docs/system/AGENT.md` - Document governance rules

**Skills:**

- `.claude/skills/` - All available skills
- Invoke with Skill tool, NEVER read directly

## Orchestrator Anti-Patterns (AVOID)

❌ **Direct implementation** → Delegate to Task tool with specialized agent
❌ **Skipping skills** → Skills are MANDATORY, not optional
❌ **TodoWrite for execution** → TodoWrite tracks, Task executes
❌ **Sequential when parallel possible** → Launch independent agents in single message
❌ **Claiming completion without verification** → Invoke VERIFY-BEFORE-COMPLETE first
❌ **Suggesting local DB connections** → Database is cloud-hosted (Supabase MCP tools)
❌ **Reading skill files directly** → Use Skill tool to invoke

## Orchestrator Best Practices (DO)

✅ **Invoke skills BEFORE any action** → Even 1% chance = invoke
✅ **Delegate all execution** → Task tool with specialized agents
✅ **Track with TodoWrite** → Planning and progress tracking only
✅ **Launch parallel agents** → Independent tasks in single message
✅ **Verify before claiming** → Show command output evidence
✅ **Document all work** → INDEX + phase docs + execution logs
✅ **GitHub as hub** → Issues/PRs/updates with agent identification

## Common Delegation Scenarios

**Scenario: "Add authentication"**

```
→ Skill("using-superpowers")
→ Skill("brainstorming")
→ Task(Explore, "Find Aurora auth components")
→ Task(react-mui-frontend-engineer, "Build login/signup UI")
→ Task(supabase-database-architect, "Create auth schema")
→ Task(wiring-agent, "Wire Supabase auth integration")
→ Task(playwright-tester, "Create auth E2E tests")
→ Skill("VERIFY-BEFORE-COMPLETE")
→ Skill("code-review:code-review") for final review
→ Update GitHub issue or local tracking docs
```

**Scenario: "Fix bug in checkout"**

```
→ Skill("using-superpowers")
→ Skill("systematic-debugging")
→ Task(Explore, "Investigate checkout flow")
→ Task(playwright-tester, "Create failing test")
→ Task(react-mui-frontend-engineer, "Fix checkout component")
→ Skill("VERIFY-BEFORE-COMPLETE")
→ Skill("code-review:code-review") for final review
→ Update GitHub issue or local tracking docs
```

**Scenario: "Optimize database queries"**

```
→ Skill("using-superpowers")
→ Task(supabase-database-architect, "Analyze and optimize queries")
→ Skill("VERIFY-BEFORE-COMPLETE")
→ Skill("code-review:code-review") for final review
→ Update GitHub issue or local tracking docs
```

**Scenario: "Convert section to live database" (Sequential Operation)**

```
→ Skill("using-superpowers")
→ Skill("brainstorming")  # Analyze section, categorize pages (List/Create/Interaction/Dashboard)

→ Create section INDEX + shared brainstorm doc
→ Commit docs

For each page type (List → Create → Interaction → Dashboard):
  → Create plan.md (phase-execution-template)
  → Skill("github-workflow") to create GitHub issue
  → Commit plan.md with issue number

  For each page in type (one complete page at a time):
    → Task(supabase-database-architect, "Create schema/migrations/RLS/seeds")
    → Task(playwright-tester, "Test data layer") → Fix if FAIL, repeat until PASS
    → Task(wiring-agent, "Create API endpoints/SWR hooks")
    → Task(playwright-tester, "Test API layer") → Fix if FAIL, repeat until PASS
    → Task(react-mui-frontend-engineer, "Wire UI to live APIs, remove mocks")
    → Task(playwright-tester, "Test UI layer") → Fix if FAIL, repeat until PASS
    → Task(playwright-tester, "E2E integration test") → Fix if FAIL

  → Verify: npm run build && npm run lint
  → Skill("code-review:code-review") for final code review
  → Update GitHub issue or local tracking docs with implementation summary
  → Archive plan.md as phase{X.Y.Z}-{date}-{section}-{type}.md
  → Update section INDEX
  → Close issue if applicable
  → AUTO-TRANSITION to next page type

After all page types complete:
  → Update section INDEX with completion
  → WAIT for user to specify next section

Critical:
- Bottom-up per page: supabase → wiring → react-mui
- Sequential testing: data → API → UI → E2E
- Human review required (no auto-merge)
- Auto-transition between page types
```

## Agent SDK Context

This file loads only when Agent SDK enables settings sources:

- `settingSources: ["project"]` (TypeScript)
- `setting_sources=["project"]` (Python)

Reference: [Claude Agent SDK - Modifying system prompts](https://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts#methods-of-modification)

---

**Remember:** You orchestrate, you don't implement. Skills guide the process, specialized sub-agents execute the work.

\*\* dont run npx playwright tests in the background, run them in the terminal for visibility
