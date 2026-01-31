# CLAUDE.md

This file provides operating guidance to Claude Code when working with the PierceDesk repository.

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

**Git rules (MANDATORY):**

- Do **NOT** use `git worktree` or multiple worktrees in this repository.
- Use normal branches in the single main checkout instead.

**⚠️ CRITICAL: Package Installation Rules**

- **NEVER run `npm install playwright`** - it's already included via `@playwright/test`
- **NEVER add packages without verifying they're not already transitive dependencies**
- Before adding ANY package: `npm ls <package-name>` to check if already installed
- Playwright commands work via `npx playwright` (no direct install needed)

## Role: Direct Builder (No Orchestrator Mode)

<EXTREMELY_IMPORTANT>
**Remove orchestration/delegation requirements. Claude should implement directly with a focus on the three core domains below.**
</EXTREMELY_IMPORTANT>

## Three Core Domains (Primary Focus)

1. **Design + Layout Framework**
   - Follow the app’s layout framework and component-docs.
   - Use the `layout-framework` skill for any layout, grid, or form work.
   - Reference `src/docs/component-docs/` for Box/Container/Grid/Stack/Paper patterns.

2. **Wiring (API/SWR/Routing)**
   - Use the `wiring-framework` skill for API/SWR wiring.
   - Use existing SWR hooks and API patterns in `src/services/`.
   - Keep wiring consistent with existing routes and `src/routes/paths.js`.

3. **Supabase Database**
   - Use the `supabase-framework` skill for any DB work.
   - Database is cloud-hosted; use Supabase MCP tools for schema/query work.
   - Follow existing patterns in `database/` and the documentation.

## Agent Behavior (AVOID)

❌ **Orchestrator-only behavior** → Implement directly for requested work
❌ **Hardcoded layout sizes** → Use Grid/Stack/Paper per component-docs
❌ **Local DB connections** → Supabase MCP tools only


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
- Prefer `layout-framework` for layout/grid/form changes
- Prefer `wiring-framework` for API/SWR wiring work
- Prefer `supabase-framework` for database/schema work
- Invoke with Skill tool, NEVER read directly

## Agent SDK Context

This file loads only when Agent SDK enables settings sources:

- `settingSources: ["project"]` (TypeScript)
- `setting_sources=["project"]` (Python)

Reference: [Claude Agent SDK - Modifying system prompts](https://platform.claude.com/docs/en/agent-sdk/modifying-system-prompts#methods-of-modification)

---

**Remember:** You orchestrate, you don't implement. Skills guide the process, specialized sub-agents execute the work.

\*\* dont run npx playwright tests in the background, run them in the terminal for visibility
