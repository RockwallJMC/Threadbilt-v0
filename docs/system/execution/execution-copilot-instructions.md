# GitHub Copilot Code Review Instructions

## Repository Context

This repository contains **PierceDesk.AI**, a Next.js 15 application using React 19 and Material-UI 7. All code reviews must enforce the project's mandatory development standards and verification requirements.

## Critical Code Review Requirements

### 1. Mandatory Verification Evidence

**NO CODE REVIEW PASSES WITHOUT VERIFICATION COMMANDS**

Every pull request MUST include fresh command output demonstrating:

- **Build Success**: `npm run build` output with exit code 0
- **Lint Passing**: `npm run lint` output with 0 errors/warnings
- **Tests Passing**: Test command output showing 0 failures
- **Type Checking**: TypeScript compilation with no errors

**Reject any PR claiming "tests pass" or "build works" without showing actual command output.**

### 2. Test-Driven Development Compliance

Every feature or bugfix MUST follow TDD workflow:

1. **Test written FIRST** - Verify test file exists and was committed before implementation
2. **Test initially failed** - Evidence that RED → GREEN cycle was followed
3. **Implementation follows test** - Implementation code committed after test code
4. **Refactoring (if any)** - Improvements made while keeping tests green

**Red Flags:**
- Implementation code committed before test code
- Tests written in same commit as implementation (no RED phase)
- Missing test coverage for new features/bug fixes

### 3. Playwright Test Requirements

For any UI changes, the PR MUST include:

#### Test Execution Evidence
```bash
# Run Playwright tests
npx playwright test

# Expected in PR description:
# - Test results showing pass/fail counts
# - Test execution time
# - Any flaky test retries
```

#### Screenshot Requirements

**MANDATORY for all visual/UI changes:**

1. **Before/After Screenshots** - Show UI state before and after changes
2. **Test Screenshots** - Playwright test screenshots from `test-results/` directory
3. **Multiple Viewports** - Desktop (1920x1080) and mobile (375x667) if responsive
4. **Failed Test Screenshots** - If tests failed during development, show the failure screenshots and how they were resolved

Screenshots must be:
- Embedded directly in PR description (not linked externally)
- Named descriptively (e.g., `login-form-validation-error.png`)
- Show relevant UI state clearly

#### Screenshot Capture Commands
```bash
# During test run (automatic on failure)
npx playwright test --reporter=html

# Manual screenshot capture
npx playwright test --headed --debug

# Generate test report with screenshots
npx playwright show-report
```

### 4. Skills Framework Compliance

Verify that the developer invoked mandatory skills:

- **TDD Skill**: Required before ANY implementation
- **VERIFY-BEFORE-COMPLETE Skill**: Required before PR creation
- **software-architecture Skill**: Required for architectural decisions
- **using-superpowers Skill**: Required at conversation start

**How to Verify:**
- Check commit messages for skill references
- Look for test-first commits (TDD evidence)
- Verify verification commands were run (evidence in PR)

### 5. Architecture & Code Quality Standards

#### Clean Architecture Principles
- Business logic separated from UI components
- Domain-specific naming (no generic `utils.js`, `helpers.js`)
- Library-first approach (check npm before custom implementations)
- Early return pattern for readability

#### Aurora-First Development
For UI components, verify:
- Aurora template was searched first (check PR description for Aurora Search Log)
- Component copied from `templates/aurora-next/` if similar component existed
- Custom component justified if no Aurora match (documented in PR)

#### Security (OWASP Compliance)
- Input validation at all boundaries
- Parameterized queries (no string concatenation in SQL)
- XSS prevention (proper output sanitization)
- CSRF protection for state-changing operations
- No hardcoded credentials or secrets

### 6. Material-UI v7 Compliance

Verify correct MUI v7 syntax:

```javascript
// CORRECT - MUI v7 Grid syntax
<Grid container spacing={2}>
  <Grid size={{ xs: 12, md: 6 }}>Content</Grid>
</Grid>

// INCORRECT - Old MUI v4/v5 syntax
<Grid container spacing={2}>
  <Grid xs={12} md={6}>Content</Grid>
</Grid>

// CORRECT - Drawer with drawerClasses
import Drawer, { drawerClasses } from '@mui/material/Drawer';

// INCORRECT - Drawer with makeStyles (deprecated)
import { makeStyles } from '@mui/styles';
```

### 7. Documentation Requirements

Every PR must include:

- **Code References**: File paths with line numbers (e.g., `src/components/LoginForm.tsx:42`)
- **INDEX File Updates**: If feature work, verify INDEX.md is current
- **Phase Execution Docs**: Implementation progress documented
- **User-Facing Docs**: Features documented in `docs/features/` if user-facing

### 8. Supabase Database Work

For database changes, verify:

- **MCP Tools Used**: Database is cloud-hosted, must use Supabase MCP tools
- **Never Local**: No `psql`, `pg_dump`, `DATABASE_URL` local connections
- **Migrations Applied**: Via `mcp__plugin_supabase_supabase__apply_migration`
- **RLS Policies**: Security policies documented and tested
- **Schema Documentation**: `database-documentation/` updated

### 9. Common Pitfalls to Flag

**REJECT PRs that:**

1. Skip TDD - Implementation before tests
2. Claim completion without verification evidence
3. Build UI from scratch without checking Aurora templates
4. Use generic naming (`utils.js`, `helpers.js`)
5. Have hardcoded values instead of theme tokens
6. Missing TypeScript types
7. Security vulnerabilities (XSS, SQL injection, etc.)
8. Try to connect to database locally (must use Supabase MCP)
9. Skip skills invocation (no TDD/verification evidence)
10. Sequential execution of independent tasks (should be parallel)

### 10. PR Description Requirements

Every PR description MUST contain:

```markdown
## Summary
[Brief description of changes]

## Verification Evidence

### Build
```
[Output from npm run build]
```

### Lint
```
[Output from npm run lint]
```

### Tests
```
[Output from test command]
```

### Playwright Tests (if UI changes)
```
[Output from npx playwright test]
```

## Screenshots (if UI changes)

### Before
![Before screenshot](path/to/before.png)

### After
![After screenshot](path/to/after.png)

### Test Results
![Playwright test screenshot](test-results/screenshot.png)

## TDD Evidence
- Test commit: [commit hash]
- Implementation commit: [commit hash]

## Documentation
- INDEX updated: [Yes/No]
- User docs updated: [Yes/No]

## Checklist
- [ ] Build passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Playwright tests pass (if UI changes)
- [ ] Screenshots included (if UI changes)
- [ ] TDD workflow followed
- [ ] Skills invoked
- [ ] Documentation updated
```

## Code Review Checklist

Use this checklist for every PR review:

- [ ] **Verification Commands Run**: Build, lint, test output shown
- [ ] **Tests Written First**: TDD workflow evidence present
- [ ] **Playwright Tests**: UI changes have E2E tests
- [ ] **Screenshots Included**: Visual changes documented with images
- [ ] **Skills Invoked**: TDD, VERIFY-BEFORE-COMPLETE evidence
- [ ] **Aurora Searched**: UI components checked against templates
- [ ] **MUI v7 Syntax**: Correct Grid/Drawer/Component syntax
- [ ] **Security**: OWASP compliance, no vulnerabilities
- [ ] **Architecture**: Clean Architecture principles followed
- [ ] **Documentation**: INDEX, phase docs, user docs updated
- [ ] **TypeScript**: Proper types, no `any` without justification
- [ ] **Database**: Supabase MCP tools used (never local)
- [ ] **Code References**: File:line format used
- [ ] **No Generic Naming**: Domain-specific names used
- [ ] **Library-First**: npm packages used over custom code

## Automated Checks to Request

For PRs missing evidence, request:

```bash
# Build verification
npm run build

# Lint verification
npm run lint

# Test verification
npm test

# Playwright verification (with screenshots)
npx playwright test --reporter=html
npx playwright show-report

# TypeScript verification
npx tsc --noEmit
```

## Review Comment Templates

### Missing Verification Evidence
```
**Missing Verification Evidence**

Please provide fresh command output for:
- [ ] npm run build
- [ ] npm run lint
- [ ] npm test
- [ ] npx playwright test (if UI changes)

No PR can be approved without verification evidence.
```

### Missing Playwright Screenshots
```
**Missing Playwright Screenshots**

UI changes require:
- [ ] Before/After screenshots
- [ ] Playwright test screenshots from test-results/
- [ ] Desktop and mobile viewports (if responsive)

Run: npx playwright test --reporter=html && npx playwright show-report
```

### TDD Violation
```
**TDD Workflow Not Followed**

Tests must be written BEFORE implementation:
1. Write failing test (RED)
2. Write minimal code to pass (GREEN)
3. Refactor

Please reorganize commits to show test-first development.
```

### Aurora Template Not Checked
```
**Aurora Template Search Missing**

Before building custom UI components:
1. Search templates/aurora-next/src/ for similar components
2. Document search in Aurora Search Log
3. Copy-then-modify if match found (High/Medium similarity)
4. Only build custom if no match (Low similarity)

Please verify Aurora templates were checked.
```

### Security Concern
```
**Security Vulnerability Detected**

[Specific OWASP issue]

Please review: AGENTS-MAIN/agents/agent-instruction/security-owasp-guidelines.md

Required fixes:
- [ ] [Specific fix needed]
```

## Severity Levels

- **CRITICAL** (Block Merge): Missing verification, TDD violation, security issues, database local connection attempts
- **HIGH** (Request Changes): Missing screenshots, Aurora not checked, MUI v7 syntax errors
- **MEDIUM** (Suggest Changes): Generic naming, missing documentation, missing types
- **LOW** (Comment): Code style suggestions, optimization opportunities

## Final Approval Criteria

A PR can ONLY be approved when ALL of these are true:

1. ✅ Build passes with evidence
2. ✅ Lint passes with evidence
3. ✅ Tests pass with evidence
4. ✅ Playwright tests pass (if UI changes) with evidence
5. ✅ Screenshots included (if UI changes)
6. ✅ TDD workflow followed
7. ✅ Skills invoked appropriately
8. ✅ Security compliant
9. ✅ Documentation updated
10. ✅ No critical or high severity issues remain

## Additional Resources

- **CLAUDE.md**: Complete development standards
- **docs/guides/DOCUMENTATION-GUIDE.md**: Documentation workflow
- **AGENTS-MAIN/**: Coding standards and agent instructions
- **.claude/skills/**: TDD, verification, architecture skills
- **AGENTS-MAIN/agents/agent-instruction/security-owasp-guidelines.md**: Security standards
- **AGENTS-MAIN/agents/agent-instruction/playwright-typescript.md**: Testing standards
