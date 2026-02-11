# AI Agent Quick Reference

**Cheat sheet for common patterns and workflows**

## 🚀 Start Any Task

```javascript
// ALWAYS start with this
Skill('using-superpowers');
```

## 🔄 Common Workflows

### Simple Fix/Update (Abbreviated)

```javascript
1. Skill("using-superpowers")
2. Task(appropriate-agent, "implement fix")
3. Skill("VERIFY-BEFORE-COMPLETE")
4. Show command output evidence
```

### New Feature (Full)

```javascript
1. Skill("using-superpowers")
2. Skill("TDD")
3. Create INDEX file
4. Task(Explore, "research patterns")
5. Task(multiple-agents, "implement")
6. Skill("VERIFY-BEFORE-COMPLETE")
7. Update documentation and tracking artifacts with verification evidence
```

### Bug Investigation

```javascript
1. Skill("using-superpowers")
2. Skill("systematic-debugging")
3. Task(Explore, "investigate context")
4. Task(agent, "implement fix")
5. Skill("VERIFY-BEFORE-COMPLETE")
```

## 🎯 Agent Selection

| Need                | Agent                         | Example                                                       |
| ------------------- | ----------------------------- | ------------------------------------------------------------- |
| **Research**        | `Explore`                     | `Task(Explore, "Find auth patterns", thoroughness: "medium")` |
| **UI Component**    | `react-mui-frontend-engineer` | `Task(react-mui-frontend-engineer, "Build settings page")`    |
| **API Integration** | `wiring-agent`                | `Task(wiring-agent, "Connect user API")`                      |
| **Database**        | `supabase-database-architect` | `Task(supabase-database-architect, "Create users table")`     |
| **Tests**           | `playwright-tester`           | `Task(playwright-tester, "Create login tests")`               |
| **Documentation**   | `documentation-expert`        | `Task(documentation-expert, "Update README")`                 |
| **Code Review**     | `superpowers:code-reviewer`   | `Task(superpowers:code-reviewer, "Review auth code")`         |

## ⚡ Parallel Execution

```javascript
// ✅ Correct - Single message, multiple tasks
Task(react - mui - frontend - engineer, 'Build dashboard UI');
Task(wiring - agent, 'Implement dashboard API');
Task(playwright - tester, 'Create dashboard tests');

// ❌ Wrong - Sequential when could be parallel
// Task... wait... Task... wait... Task...
```

## 🧪 Testing Patterns

### TDD Flow

```javascript
1. Skill("TDD")
2. Task(playwright-tester, "Write failing test for feature X")
3. Task(appropriate-agent, "Implement minimal code to pass")
4. Task(playwright-tester, "Verify test passes")
5. Refactor if needed
```

### Verification Commands

```bash
# Always show actual output
npm test        # Show 0 failures
npm run build   # Show exit code 0
npm run lint    # Show clean output
```

## 🗂️ File Organization

### Documentation Hierarchy

```
.claude/           # AI framework
├── agents/        # Agent definitions
├── skills/        # Mandatory skills
└── templates/     # Document templates

docs/              # User-facing docs
├── guides/        # How-to guides
└── features/      # Feature documentation

_sys_documents/    # Internal tracking
├── design/        # Design documents
├── execution/     # Implementation logs
└── as-builts/     # Current state
```

### Template Usage

```bash
# INDEX file (always required)
cp .claude/templates/INDEX-template.md _sys_documents/execution/INDEX-feature.md

# Phase design (full workflow)
cp .claude/templates/phase-design-template.md _sys_documents/design/phase-1.1-topic.md

# Phase execution (full workflow)
cp .claude/templates/phase-execution-template.md _sys_documents/execution/phase-1.1-topic.md
```

## 🎨 UI Development

### Aurora-First Pattern

```javascript
1. Task(Explore, "Find similar Aurora components")
2. Copy from templates/aurora-next/src/ to src/
3. Task(react-mui-frontend-engineer, "Modify for Pierce Desk")
4. Update imports from Aurora to local paths
```

### MUI v7 Patterns

```javascript
// Grid with size prop
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>Content</Grid>
</Grid>

// Stack for layouts
<Stack direction="row" spacing={2}>
  <Item />
</Stack>
```

## 🗄️ Database Operations

### Critical Rules

- ✅ ALWAYS use `supabase-database-architect` agent
- ✅ Agent uses Supabase MCP tools automatically
- ❌ NEVER attempt local database connections
- ❌ NEVER use psql, pg_dump, DATABASE_URL locally

```javascript
// Correct
Task(supabase - database - architect, 'Create user_profiles table with RLS');

// Wrong - trying to connect locally
// psql -h localhost -p 5432 ...
```

## 📋 Verification Checklist

### Before Claiming Complete

```javascript
1. Skill("VERIFY-BEFORE-COMPLETE")
2. Run and show output:
   - npm test (0 failures)
   - npm run build (exit 0)
   - npm run lint (clean)
3. Show feature working (screenshots/logs)
4. Commit with evidence
```

### Evidence Examples

```bash
✅ Tests: "All 15 tests passed"
✅ Build: "Build completed successfully"
✅ Lint: "No linting errors found"
❌ Claims: "Should work", "Probably fixed"
```

## 🚫 Common Mistakes

| ❌ Don't                     | ✅ Do                                  |
| ---------------------------- | -------------------------------------- |
| Skip skills invocation       | Always invoke relevant skills          |
| Execute work directly        | Use Task tool with agents              |
| Claim without evidence       | Show command output                    |
| Build UI from scratch        | Aurora-first pattern                   |
| Connect database locally     | Use Supabase MCP tools                 |
| Sequential independent tasks | Parallel Task calls                    |
| Use TodoWrite for execution  | TodoWrite = tracking, Task = execution |
| Skip TDD                     | Write tests first                      |

## 🔧 Automation Helpers

```bash
# Create new feature with full setup
node scripts/workflow-automation.js create-feature user-profile "User profile management"

# Run verification commands
node scripts/workflow-automation.js verify
```

## 📞 Emergency Patterns

### When Stuck

```javascript
1. Skill("using-superpowers")
2. Task(Explore, "Understand the problem context", thoroughness: "medium")
3. Ask specific questions with context
```

### When Tests Fail

```javascript
1. Skill("systematic-debugging")
2. Task(playwright-tester, "Debug failing test")
3. Task(appropriate-agent, "Fix implementation")
4. Skill("VERIFY-BEFORE-COMPLETE")
```

### When Build Breaks

```javascript
1. Show exact error output
2. Task(Explore, "Find similar error patterns")
3. Task(appropriate-agent, "Fix build issue")
4. Show successful build output
```

---

**Remember**: Skills guide the process, agents do the work, evidence proves completion.
