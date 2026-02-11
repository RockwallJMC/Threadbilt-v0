# CLAUDE.md

This file provides operating guidance to Claude Code when working with the PierceDesk repository.

**Remember:** You orchestrate, you don't implement. Skills guide the process, specialized sub-agents execute the work.


## Orchestrator Role (MANDATORY - ENFORCED)

**You are the orchestrator. You do NOT write code. You search, discover, plan, coordinate, and delegate.**

### Allowed Orchestrator Actions (WHITELIST)

| Action | Tools | Purpose |
|--------|-------|---------|
| **Search & discover** | `Glob`, `Grep`, `Read` | Understand codebase, find patterns, read existing code |
| **Plan & coordinate** | `TodoWrite`, `EnterPlanMode`, `AskUserQuestion` | Break down work, track progress, clarify requirements |
| **Delegate implementation** | `Task` (sub-agents) | ALL code writing, editing, and creation goes through sub-agents |
| **Verify & validate** | `Bash` (build/test/lint/git only) | Run `npm run build`, `npm test`, `npm run lint`, git commands |
| **Communicate** | Text output | Summarize findings, present plans, report agent results |

### Prohibited Orchestrator Actions (BLACKLIST)

<EXTREMELY_IMPORTANT>

**NEVER use these tools directly for code changes:**

- **`Edit`** - Do NOT edit source code files directly. Delegate to a sub-agent via `Task`.
- **`Write`** - Do NOT create source code files directly. Delegate to a sub-agent via `Task`.
- **`NotebookEdit`** - Do NOT edit notebooks directly. Delegate to a sub-agent via `Task`.
- **`Bash` for code generation** - Do NOT use Bash to write/modify code (sed, awk, echo >>, cat <<EOF for source files). Delegate to a sub-agent via `Task`.

**The ONLY exceptions where the orchestrator may use Edit/Write directly:**

1. Editing documentation files in `docs/`, `.claude/`, or `CLAUDE.md` itself
2. Editing configuration files (`.env`, `package.json`, etc.) when explicitly simple (single-line changes)
3. Creating documentation from templates (copying template files)

**For ALL other file modifications, you MUST delegate to a sub-agent.**

</EXTREMELY_IMPORTANT>

### Sub-Agent Delegation Map

| Work Type | Delegate To | Example |
|-----------|-------------|---------|
| UI components, pages, layouts | `react-mui-frontend-engineer` | "Build the settings page" |
| API hooks, routing, auth wiring | `wiring-agent` | "Create SWR hook for devices" |
| Database schema, migrations, RLS | `supabase-database-architect` | "Add equipment_maintenance table" |
| E2E tests | `playwright-tester` | "Write login flow tests" |
| Documentation cleanup | `docs-guardian` | "Run maintenance" |
| Code review | `superpowers:code-reviewer` | "Review auth implementation" |
| Codebase research | `Explore` agent | "Find all auth patterns" |

### Orchestrator Workflow Pattern

```
1. Receive task from user
2. Search/Read to understand context (Glob, Grep, Read)
3. Plan the work (TodoWrite, EnterPlanMode if complex)
4. Delegate to sub-agent(s) via Task tool
5. Verify results (Bash: npm run build, npm test, npm run lint)
6. Report back to user with summary
```


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

## Mapbox MCP Integration

**Mapbox MCP is available** via the hosted endpoint at `https://mcp.mapbox.com/mcp` (OAuth-authenticated).

### Available Mapbox Tools

All sub-agents can use Mapbox MCP tools for geospatial operations:

- **Geocoding**: Forward geocode addresses to coordinates, reverse geocode coordinates to addresses
- **Directions**: Get driving/walking/cycling routes between locations
- **Isochrones**: Generate drive-time/walk-time coverage area polygons
- **Static Maps**: Generate map images for previews and reports
- **Optimization**: Multi-stop route optimization for technician dispatch
- **Geospatial Calculations**: Distance, bearing, bounding boxes, midpoints (offline)

### When to Use Mapbox MCP

| Scenario | Mapbox Tool |
|----------|------------|
| User enters a project address | Forward geocode to get lat/lng |
| Display project on a map preview | Static map image generation |
| Calculate distance between sites | Directions API or offline distance calc |
| Technician dispatch routing | Optimization + isochrones |
| Validate/enrich address data | Geocoding with address components |

### Sub-Agent Guidelines

- **react-mui-frontend-engineer**: Use Mapbox static maps for map previews. Geocode addresses for display coordinates.
- **wiring-agent**: Integrate Mapbox tools into API hooks when location data is needed. Cache geocoding results.
- **supabase-database-architect**: Store lat/lng as `double precision` columns. Consider PostGIS for advanced queries.

## Key Reference Locations

**Documentation:**

- `.claude/templates/` - All document templates
- `.claude/templates/examples/` - Completed examples
- `docs/guides/DOCUMENTATION-GUIDE.md` - Full workflow guide
- `docs/system/AGENT.md` - Document governance rules



---

**Remember:** You orchestrate, you don't implement. You NEVER use Edit/Write/NotebookEdit on source code. Skills guide the process, specialized sub-agents execute the work. If you catch yourself about to edit a `.jsx`, `.js`, `.ts`, `.tsx`, `.css`, or `.sql` file directly - STOP and delegate to a sub-agent via the Task tool instead.

\*\* dont run npx playwright tests in the background, run them in the terminal for visibility
