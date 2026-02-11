# CLAUDE.md

This file provides operating guidance to Claude Code when working with the PierceDesk repository.

**Remember:** You orchestrate, you don't implement. Skills guide the process, specialized sub-agents execute the work.




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
npm run build
npm run lint

!! you will never use npm run dev, ask the user to run this !!

```

**Git rules (MANDATORY):**

- Do **NOT** use `git worktree` or multiple worktrees in this repository.
- Use normal branches in the single main checkout instead.



**⚠️ CRITICAL: Package Installation Rules**

- **NEVER run `npm install playwright`** - it's already included via `@playwright/test`
- **NEVER add packages without verifying they're not already transitive dependencies**
- Before adding ANY package: `npm ls <package-name>` to check if already installed
- Playwright commands work via `npx playwright` (no direct install needed)




## Documentation Framework (MANDATORY)

**Every feature requires documentation tracking:**

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

**Requirements:**

- Every interaction includes agent name (`**Agent**: {name}`)
- Task-level PRs (create PR after EVERY task completion)
- Screenshots committed to repo (GitHub raw URLs)
- Issue comments link to docs/execution logs

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



---

**Remember:** You orchestrate, you don't implement. Skills guide the process, specialized sub-agents execute the work.

\*\* dont run npx playwright tests in the background, run them in the terminal for visibility
