# AI Coding Agent Framework Guide

**Master orchestration guide for AI coding agents working with PierceDesk**

## Quick Start Decision Tree

```
New Task Received
├── Is it a clarifying question? → Invoke /using-superpowers skill first
├── Is it implementation work?
│   ├── Single file, <50 lines, no architecture → Abbreviated Workflow
│   └── Multi-file, architecture, database → Full Workflow
├── Is it exploration/research? → Task(Explore, "...", thoroughness: "medium")
├── Is it testing? → Task(playwright-tester, "...")
└── Is it documentation? → Task(documentation-expert, "...")
```

## Core Principles

### 1. Skills First, Always
**MANDATORY**: Invoke skills before ANY action, even clarifying questions.

```javascript
// Standard flow
1. Skill("using-superpowers")     // Foundation
2. Skill("TDD")                   // Before implementation
3. Task(agent, "work")            // Execution
4. Skill("VERIFY-BEFORE-COMPLETE") // Before claiming done
```

### 2. Task Tool for All Execution
**NEVER execute implementation work directly**. Always delegate to specialized agents.

```javascript
// Correct
Task(react-mui-frontend-engineer, "Build user profile page")
Task(wiring-agent, "Connect profile API")
Task(playwright-tester, "Create profile tests")

// Incorrect - doing work directly
// Creating components, writing code, running commands yourself
```

### 3. Evidence-Based Verification
**No claims without fresh command output**

```bash
# Always show actual output
npm test        # Show results with 0 failures
npm run build   # Show exit code 0
npm run lint    # Show clean output
```

## Workflow Selection

### Abbreviated Workflow
**Use when ALL criteria met:**
- Single file or ≤3 files modified
- <50 lines of code total
- No architectural decisions
- No database/API changes
- No new dependencies
- No security implications

**Process:**
1. Skill("using-superpowers")
2. Create simplified INDEX
3. Task(appropriate-agent, "implement")
4. Skill("VERIFY-BEFORE-COMPLETE")
5. Commit with evidence

### Full Workflow
**Use for everything else**

**Process:**
1. Skill("using-superpowers")
2. Create INDEX file
3. Create phase design documents
4. Create GitHub issue (if using GitHub for tracking)
5. Task(agents, "implement phases")
6. Create phase execution documents
7. Skill("VERIFY-BEFORE-COMPLETE")
8. Update as-built documentation and tracking docs with verification evidence

## Agent Specializations

| Agent | Purpose | When to Use | Example |
|-------|---------|-------------|---------|
| `Explore` | Codebase research | Understanding patterns, finding examples | `Task(Explore, "Find auth patterns", thoroughness: "medium")` |
| `react-mui-frontend-engineer` | UI components | Building interfaces, Aurora duplication | `Task(react-mui-frontend-engineer, "Build settings page")` |
| `wiring-agent` | API integration | SWR hooks, routing, auth flows | `Task(wiring-agent, "Connect user API")` |
| `supabase-database-architect` | Database work | Schema, migrations, RLS (uses MCP tools) | `Task(supabase-database-architect, "Create users table")` |
| `playwright-tester` | E2E testing | Test creation, debugging | `Task(playwright-tester, "Create login tests")` |
| `documentation-expert` | Documentation | READMEs, API docs, guides | `Task(documentation-expert, "Document auth API")` |
| `superpowers:code-reviewer` | Code review | Post-implementation review | `Task(superpowers:code-reviewer, "Review auth code")` |

## Skills Reference

### Mandatory Skills

#### using-superpowers
**When**: Start of ANY conversation
**Purpose**: Establish workflow foundation
```javascript
Skill("using-superpowers")
```

#### TDD
**When**: Before ANY implementation
**Purpose**: Test-driven development
```javascript
Skill("TDD")
// Then: Write failing test → Implement → Verify test passes
```

#### VERIFY-BEFORE-COMPLETE
**When**: Before claiming completion
**Purpose**: Evidence-based verification
```javascript
Skill("VERIFY-BEFORE-COMPLETE")
// Then: Run commands, show output, capture evidence
```

#### software-architecture
**When**: Architectural decisions, code quality
**Purpose**: Clean architecture principles
```javascript
Skill("software-architecture")
```

### Optional Skills

#### writing-plans
**When**: Multi-step features
**Purpose**: Planning complex work

#### file-organizer
**When**: File organization tasks
**Purpose**: Intelligent file structuring

## Parallel Execution Patterns

**For independent tasks, use multiple Task calls in single message:**

```javascript
// Correct - Parallel execution
Task(Explore, "Find dashboard patterns");
Task(react-mui-frontend-engineer, "Build dashboard UI");
Task(playwright-tester, "Create dashboard tests");

// Incorrect - Sequential when could be parallel
// Task... wait... Task... wait... Task...
```

## Documentation Hierarchy

```
Repository Documentation Structure:
├── .claude/                    # AI Agent Framework
│   ├── agents/                # Agent definitions
│   ├── skills/                # Mandatory skills
│   ├── templates/             # Document templates
│   └── FRAMEWORK-GUIDE.md     # This file
├── docs/                      # User-facing documentation
│   ├── guides/               # How-to guides
│   ├── architecture/         # System design
│   └── features/             # Feature docs
└── _sys_documents/           # Internal tracking
    ├── design/               # Design documents
    ├── execution/            # Implementation logs
    └── as-builts/            # Current state docs
```

## Common Patterns

### Feature Implementation
```javascript
1. Skill("using-superpowers")
2. Skill("TDD")
3. TodoWrite([
     "Research Aurora components",
     "Design architecture", 
     "Implement UI",
     "Wire API",
     "Create tests"
   ])
4. Task(Explore, "Find Aurora profile patterns")
5. Task(react-mui-frontend-engineer, "Build profile UI")
6. Task(wiring-agent, "Connect profile API")
7. Task(playwright-tester, "Create profile tests")
8. Skill("VERIFY-BEFORE-COMPLETE")
9. Show verification evidence
```

### Bug Investigation
```javascript
1. Skill("using-superpowers")
2. Skill("systematic-debugging")
3. Task(Explore, "Investigate bug context")
4. Create debug document
5. Task(appropriate-agent, "Implement fix")
6. Skill("VERIFY-BEFORE-COMPLETE")
7. Show test demonstrating fix
```

### Code Review
```javascript
1. Skill("using-superpowers")
2. Task(superpowers:code-reviewer, "Review implementation")
3. Task(playwright-tester, "Verify tests pass")
4. Skill("VERIFY-BEFORE-COMPLETE")
5. Show test and build output
```

## Critical Rules

### ❌ Never Do
- Skip skills invocation (even 1% chance = invoke)
- Execute implementation work directly
- Claim completion without verification
- Use TodoWrite for execution (it's for tracking only)
- Build UI from scratch (Aurora-first pattern)
- Connect to database locally (use Supabase MCP tools)
- Use `run_in_background: true` for dev servers

### ✅ Always Do
- Invoke skills before actions
- Use Task tool for all execution
- Show command output as evidence
- Follow Aurora copy-then-modify pattern
- Use Supabase MCP tools for database
- Run dev servers in terminal only
- Create GitHub issues for features
- Update documentation after changes

## Quick Reference

**Start any task**: `Skill("using-superpowers")`
**Before implementation**: `Skill("TDD")`
**Before claiming done**: `Skill("VERIFY-BEFORE-COMPLETE")`
**For execution**: `Task(agent, "work")`
**For parallel work**: Multiple `Task()` calls in one message
**For database**: `Task(supabase-database-architect, "...")` (uses MCP)
**For UI**: `Task(react-mui-frontend-engineer, "...")` (Aurora-first)
**For API**: `Task(wiring-agent, "...")`
**For tests**: `Task(playwright-tester, "...")`
**For exploration**: `Task(Explore, "...", thoroughness: "medium")`

