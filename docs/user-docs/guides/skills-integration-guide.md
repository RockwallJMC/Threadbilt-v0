# Skills Integration Guide

**How skills and agents work together for consistent AI coding execution**

This guide explains how Claude Code skills (`.claude/skills/`) integrate with agents (`.claude/agents/`) and the overall development workflow for PierceDesk.

## Quick Navigation

- [🚀 Quick Start](#standard-development-flow) - Standard workflow for any task
- [🎯 Agent Patterns](#skill--agent-integration-patterns) - How skills integrate with specific agents
- [⚡ Skills Reference](#available-skills) - When to use each skill
- [🚫 Common Pitfalls](#common-pitfalls) - What to avoid

## CRITICAL: Development Server Constraints

**NEVER run `npm run dev` in the background:**

- If you need to start the dev server, inform the user and let them start it manually
- NEVER use `run_in_background: true` with Bash tool for `npm run dev`
- Dev servers must run in the terminal for proper log visibility and clean restarts
- This is a strict requirement across all agents and workflows

## Overview

### The Skills + Agents Model

```
Skills (Quality Gates)     +     Agents (Execution)     =     Consistent Results
├── TDD                           ├── react-mui-frontend-engineer
├── VERIFY-BEFORE-COMPLETE        ├── wiring-agent
├── software-architecture         ├── supabase-database-architect
└── file-organizer               └── playwright-tester
```

**Key Principle**: Skills tell you HOW to work, agents do the ACTUAL work. Always use both together.

**Skills** are reusable, enforced development practices that act as quality gates throughout your workflow. They ensure critical practices like TDD, verification before completion, and architectural standards are followed consistently.

**Agents** are specialized sub-agents that handle specific types of work (frontend, backend, database, testing, documentation). Agents should invoke skills at appropriate checkpoints in their workflows.

## Available Skills

### 🚀 using-superpowers (Foundation Skill)

**Location:** `.claude/skills/using-superpowers/SKILL.md`
**Invocation:** `/using-superpowers` or Skill tool

**Purpose:** Establish workflow foundation and best practices

**When to Invoke:**

- **ALWAYS** at the start of ANY conversation or task
- Before any other skills or work
- When establishing context for complex work

**Core Principle:** Foundation first - establishes the framework for all subsequent work

---

### 1. TDD (Test-Driven Development)

**Location:** `.claude/skills/TDD/SKILL.md`
**Invocation:** `/TDD` or Skill tool with `skill: "TDD"`

**Purpose:** Enforce red-green-refactor cycle for all code implementation

**When to Invoke:**

- BEFORE writing any implementation code
- When fixing bugs (write failing test first)
- When adding new features

**Core Principle:** Write test → Watch it fail → Write minimal code to pass → Refactor

**Key Rules:**

- NO production code without a failing test first
- Code written before test must be deleted
- Watch each test fail before implementing
- Tests written after prove nothing

**See Also:** `.claude/skills/TDD/testing-anti-patterns.md` for common pitfalls

---

### 2. VERIFY-BEFORE-COMPLETE / using-superpowers

**Location:** `.claude/skills/VERIFY-BEFORE-COMPLETE/SKILL.md` or `.claude/skills/using-superpowers/SKILL.md`
**Invocation:** `/verify` or `/using-superpowers` or Skill tool

**Purpose:** Enforce evidence-based completion claims (no assertions without proof)

**When to Invoke:**

- BEFORE claiming work is complete, fixed, or passing
- BEFORE committing code
- BEFORE moving to next task

**Core Principle:** Evidence before assertions, always

**Key Rules:**

- Run verification command in THIS conversation turn
- Show full output (test results, build output, API responses)
- Never use "should", "probably", "seems to"
- No completion claims without fresh evidence

**Verification Evidence Examples:**

- Tests pass → Show test command output with 0 failures
- Build succeeds → Show build command with exit code 0
- API works → Show API response output
- Bug fixed → Show test that catches the bug, then fixed version

---

### 3. software-architecture

**Location:** `.claude/skills/software-architecture/SKILL.md`
**Invocation:** `/software-architecture` or Skill tool with `skill: "software-architecture"`

**Purpose:** Enforce Clean Architecture and DDD principles

**When to Invoke:**

- When designing code architecture
- When making architectural decisions
- When writing any code (for quality standards)
- During code reviews

**Core Principles:**

- **Library-first approach:** Search npm BEFORE writing custom code
- **Domain-specific naming:** Avoid generic names like `utils`, `helpers`, `common`
- **Separation of concerns:** No business logic in UI, no DB queries in controllers
- **Clean Architecture:** Follow bounded contexts and ubiquitous language
- **Early returns:** Prefer early returns over nested conditions

**Anti-Patterns to Avoid:**

- Building custom auth instead of using Auth0/Supabase
- Creating `utils.js` with 50 unrelated functions
- Writing custom state management instead of using established libraries
- Mixing business logic with UI components

---

### 4. file-organizer

**Location:** `.claude/skills/file-organizer/SKILL.md`
**Invocation:** `/file-organizer` or Skill tool with `skill: "file-organizer"`

**Purpose:** Intelligently organize files and folders

**When to Invoke:**

- When organizing files and folders
- When codebase structure needs cleanup
- When finding duplicates or suggesting better structures
- When cognitive load from disorganization is high

---

## Mandatory Skills Workflow

**Every task MUST follow this sequence:**

```javascript
1. Skill("using-superpowers")        // ALWAYS first - foundation
2. Skill("TDD")                      // Before implementation
3. Task(agent, "implement")          // Execution via agent
4. Skill("VERIFY-BEFORE-COMPLETE")   // Before claiming done
```

**No exceptions** - even for simple tasks, clarifying questions, or "quick fixes".

### Decision Tree for Skill Selection

```
Starting any work?
├── Yes → using-superpowers (MANDATORY)
├── Writing code? → TDD (MANDATORY)
├── Making architectural decisions? → software-architecture
├── Organizing files? → file-organizer
└── Claiming completion? → VERIFY-BEFORE-COMPLETE (MANDATORY)
```

## Skill + Agent Integration Patterns

### Pattern 1: Frontend Development (react-mui-frontend-engineer)

```
User Request: "Create a login form with email/password"

Agent Workflow:
1. INVOKE using-superpowers skill (foundation)
1. Search Aurora templates (duplicate-first strategy)
2. INVOKE software-architecture skill
   → Design component approach
   → Check for existing auth libraries
   → Use domain-specific naming
3. INVOKE TDD skill
   → Write tests for login form behavior
   → Test validation, submission, error handling
4. Watch tests fail (RED)
5. Copy/create component with minimal code (GREEN)
6. Refactor while keeping tests green
7. Update imports to @pierce/* packages
8. Apply MUI v7 patterns
9. INVOKE VERIFY-BEFORE-COMPLETE skill
   → Run tests, show output with 0 failures
   → Show component renders without errors
10. Claim completion WITH evidence shown
```

---

### Pattern 2: Backend Integration (wiring-agent)

```
User Request: "Create an API hook to fetch user devices"

Agent Workflow:
1. Analyze requirements (API endpoint, data structure)
2. INVOKE software-architecture skill
   → Check for existing libraries (SWR for caching, cockatiel for retry)
   → Use domain-specific naming (useUserDevices, not useData)
   → Follow service patterns from @pierce/services
3. INVOKE TDD skill
   → Write integration tests for API hook
   → Test loading states, error handling, data fetching
   → Test cache invalidation
4. Watch tests fail (RED)
5. Implement SWR hook with minimal code (GREEN)
6. Refactor for error handling
7. INVOKE VERIFY-BEFORE-COMPLETE skill
   → Run tests, show 0 failures
   → Show actual API call working (response data)
   → Demonstrate error handling (401, 500 responses)
8. Claim completion WITH evidence shown
```

---

### Pattern 3: Database Design (supabase-database-architect)

```
User Request: "Create a table for tracking equipment maintenance"

Agent Workflow:
1. Understand data requirements
2. INVOKE software-architecture skill
   → Use domain-specific table name (equipment_maintenance, not data_log)
   → Apply multi-tenant patterns (organization_id)
   → Model bounded contexts (equipment domain)
3. INVOKE TDD skill
   → Write RLS policy tests (different user contexts)
   → Test constraints and validations
   → Test query performance expectations
4. Watch tests fail (RED)
5. Write migration SQL (GREEN)
   → Create table with proper structure
   → Implement RLS policies
   → Add indexes
6. Run migration
7. INVOKE VERIFY-BEFORE-COMPLETE skill
   → Show migration output (success)
   → Run EXPLAIN ANALYZE on queries, show results
   → Test RLS with different user roles, show access control working
8. Claim completion WITH evidence shown
```

---

### Pattern 4: End-to-End Testing (playwright-tester)

```
User Request: "Write tests for the checkout flow"

Agent Workflow:
1. Discover test structure (Glob/Grep)
2. Plan test scenarios
3. INVOKE TDD skill (Playwright IS TDD)
   → Write test for checkout flow
   → Run test, watch it fail (feature not implemented or broken)
   → Implement/fix application code
   → Run test, watch it pass
   → Refactor
4. INVOKE software-architecture skill
   → Structure test files with domain-specific naming
   → Create page objects with clear responsibilities
   → Avoid generic test helpers
5. Write comprehensive test cases
6. INVOKE VERIFY-BEFORE-COMPLETE skill
   → Run `npx playwright test`, show output
   → Verify 0 failures
   → Show screenshots/traces if available
   → Run at least twice to check for flakiness
7. Claim completion WITH evidence shown
```

---

### Pattern 5: Documentation (documentation-expert)

```
User Request: "Document the new authentication API"

Agent Workflow:
1. Read source code thoroughly
2. INVOKE software-architecture skill
   → Understand domain concepts (authentication, authorization)
   → Identify architectural patterns (JWT, RLS, etc.)
   → Note bounded contexts
3. Analyze existing documentation patterns
4. Draft documentation
   → Include accurate code examples
   → Document domain-specific behavior
   → Match project conventions
5. INVOKE VERIFY-BEFORE-COMPLETE skill
   → Run code examples, show they execute without errors
   → Compare documented API signatures with actual code
   → Check all links, show results
   → Test documented config options
6. Claim documentation complete WITH evidence shown
```

---

## Standard Development Flow

**For ANY development task, follow this flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Receive Task/Feature Request                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. INVOKE software-architecture skill                        │
│    → Design approach                                          │
│    → Check for existing libraries                             │
│    → Use domain-specific naming                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. INVOKE TDD skill                                          │
│    → Write tests first                                        │
│    → Watch them fail (RED)                                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Implement minimal code to pass tests (GREEN)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Refactor while keeping tests green                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. INVOKE VERIFY-BEFORE-COMPLETE skill                       │
│    → Run verification commands                                │
│    → Show output/evidence                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Claim completion ONLY with evidence shown                │
└─────────────────────────────────────────────────────────────┘
```

---

## Critical Checkpoints

| Checkpoint                    | Required Skill         | Verification Method                    |
| ----------------------------- | ---------------------- | -------------------------------------- |
| Before writing implementation | TDD                    | Test written and failing               |
| Before claiming "tests pass"  | VERIFY-BEFORE-COMPLETE | Test command output shown              |
| Before claiming "build works" | VERIFY-BEFORE-COMPLETE | Build command exit 0 shown             |
| Before commit/PR              | VERIFY-BEFORE-COMPLETE | Full verification evidence             |
| During architecture decisions | software-architecture  | Clean Architecture principles followed |
| File organization tasks       | file-organizer         | Structured cleanup completed           |

---

## How to Invoke Skills

### Method 1: Slash Commands (User or Agent)

```
/TDD
/verify
/using-superpowers
/software-architecture
/file-organizer
```

### Method 2: Skill Tool (Agent)

```
Use Skill tool with:
- skill: "TDD"
- skill: "VERIFY-BEFORE-COMPLETE"
- skill: "using-superpowers"
- skill: "software-architecture"
- skill: "file-organizer"
```

### Method 3: Auto-invocation by Agents

Agents should automatically reference and invoke skills at appropriate workflow points (as documented in their agent files).

---

## Common Pitfalls

### ❌ Pitfall 1: Skipping TDD

**Wrong:**

```
1. Write implementation code
2. Manually test it
3. Write tests after
4. Claim "tests pass"
```

**Why it's wrong:** Tests written after code pass immediately, proving nothing. You never verified the test actually catches bugs.

**Right:**

```
1. INVOKE TDD skill
2. Write test, watch it fail
3. Write minimal code to pass
4. Refactor
```

---

### ❌ Pitfall 2: Claiming Without Verification

**Wrong:**

```
"The API integration should work now"
"Tests are probably passing"
"Build seems to be successful"
```

**Why it's wrong:** No evidence, just assumptions. Code might be broken.

**Right:**

```
INVOKE VERIFY-BEFORE-COMPLETE skill
Run: npm test
Output: 34/34 tests passed ✓
"All tests pass (verified with npm test, 34/34 passing)"
```

---

### ❌ Pitfall 3: Building Custom Utilities

**Wrong:**

```
// Create custom retry logic
function retryWithBackoff(fn, maxRetries) {
  // 50 lines of custom retry code...
}
```

**Why it's wrong:** NIH (Not Invented Here) syndrome. Maintenance burden.

**Right:**

```
INVOKE software-architecture skill
→ Search npm for "retry"
→ Find cockatiel library
→ Use existing, tested solution

import { retry } from 'cockatiel';
const result = await retry(execute, { maxAttempts: 3 });
```

---

### ❌ Pitfall 4: Generic Naming

**Wrong:**

```
// utils.js
export function formatData(data) { ... }
export function validateInput(input) { ... }
export function processItems(items) { ... }
```

**Why it's wrong:** No domain context, hard to find, dumping ground for unrelated functions.

**Right:**

```
INVOKE software-architecture skill
→ Use domain-specific names

// equipment/EquipmentFormatter.ts
export function formatEquipmentMaintenanceRecord(record) { ... }

// auth/UserInputValidator.ts
export function validateUserRegistrationInput(input) { ... }
```

---

## Integration with Other Frameworks

Skills work alongside:

### PIERCE-SYS-EXE Orchestration

- PIERCE-SYS-EXE handles feature orchestration (phases, checkpoints, INDEX.md)
- Skills enforce quality practices within each phase
- Example: During implementation phase, invoke TDD and VERIFY-BEFORE-COMPLETE

### AGENTS-MAIN Coding Standards

- AGENTS-MAIN provides domain-specific coding standards
- Skills provide universal quality gates
- Example: UI/UX agent guidelines + TDD skill + software-architecture skill

### Workflow Integration

```
Feature Request
    ↓
PIERCE-SYS-EXE Orchestration (Strategic → Assessment → Planning → Implementation)
    ↓
Agent Selection (react-mui-frontend-engineer, wiring-agent, etc.)
    ↓
Skills Invocation (TDD, VERIFY-BEFORE-COMPLETE, software-architecture)
    ↓
Quality Code Delivered
```

---

## Quick Reference

### When to Use Which Skill

| Situation                          | Skill to Invoke                               |
| ---------------------------------- | --------------------------------------------- |
| About to write implementation code | TDD                                           |
| About to claim work complete       | VERIFY-BEFORE-COMPLETE                        |
| About to commit/create PR          | VERIFY-BEFORE-COMPLETE                        |
| Designing architecture             | software-architecture                         |
| Making code structure decisions    | software-architecture                         |
| Choosing between libraries         | software-architecture                         |
| Organizing files                   | file-organizer                                |
| Writing any code                   | software-architecture (for quality standards) |
| Before "tests pass" claim          | VERIFY-BEFORE-COMPLETE                        |
| Before "build succeeds" claim      | VERIFY-BEFORE-COMPLETE                        |

---

## Remember

**Skills are NOT optional suggestions** - they are mandatory quality gates that prevent:

- Broken code being committed
- Tests written after implementation (proving nothing)
- Over-engineering and NIH syndrome
- Generic code dumping grounds
- Unverified completion claims

**When in doubt:** Invoke the skill. Better to be thorough than to ship broken code.

---

## See Also

- [CLAUDE.md](CLAUDE.md) - Main project instructions with skills section
- `.claude/skills/TDD/SKILL.md` - Full TDD skill documentation
- `.claude/skills/TDD/testing-anti-patterns.md` - Testing pitfalls to avoid
- `.claude/skills/VERIFY-BEFORE-COMPLETE/SKILL.md` - Verification skill documentation
- `.claude/skills/software-architecture/SKILL.md` - Architecture skill documentation
- `.claude/skills/file-organizer/SKILL.md` - File organization skill documentation
- `.claude/agents/` - All agent definitions that invoke these skills
