# Jest/React Testing Library Testing Agent

## Overview

A specialized sub-agent for creating and maintaining unit and component tests using Jest and React Testing Library, following TDD principles and best practices for the PierceDesk application.

## Quick Start

### Invoking the Agent

Use the Task tool with general-purpose subagent and reference this agent:

```javascript
Task(subagent_type: "general-purpose", prompt: "Read /home/pierce/piercedesk6/.claude/agents/jest-rtl-tester.md and write unit tests for the UserProfile component following TDD.")
```

### What This Agent Does

1. **Verifies Environment** - Checks that Jest/RTL is properly configured before writing tests
2. **Enforces TDD** - REQUIRES test-first workflow (RED-GREEN-REFACTOR)
3. **Provides Patterns** - Complete reference for Jest/RTL best practices
4. **Prevents Anti-Patterns** - Explicitly forbids common testing mistakes
5. **Ensures Quality** - Comprehensive test coverage checklist

## When to Use

- Writing unit tests for utility functions
- Writing component tests for React components
- Testing hooks, business logic, or calculations
- Ensuring test quality and coverage
- Following TDD workflow

## When NOT to Use

- **E2E testing** → Use `playwright-tester` agent instead
- **Project doesn't have Jest** → Set up Jest first or use appropriate framework
- **Visual regression testing** → Use visual testing tools
- **Performance testing** → Use profiling tools

## Key Features

### 1. Environment Verification (Mandatory First Step)

Checks before writing any tests:
- Jest dependencies installed
- Test scripts configured
- Jest config exists
- Existing test patterns

Stops immediately if Jest not properly configured.

### 2. TDD Enforcement

**NO EXCEPTIONS:** Tests must be written FIRST, before implementation.

If code exists:
1. Delete it (yes, delete it)
2. Write failing test
3. Watch it fail
4. Write minimal code to pass
5. Refactor

### 3. Best Practice Patterns

#### Mocking
- ✅ Mock at API boundaries (fetch, axios)
- ❌ Never mock React hooks or internal functions

#### Queries
- ✅ Use semantic queries (getByRole, getByLabelText)
- ❌ Never use placeholders or testIds (unless no semantic option)

#### Interactions
- ✅ Use userEvent for realistic interactions
- ❌ Never use fireEvent (unrealistic)

#### Async Testing
- ✅ Use waitFor for state changes
- ✅ Use findBy for async elements
- ❌ Never use arbitrary timeouts

### 4. Comprehensive Coverage

Every component/function requires:
- Rendering tests
- Props/argument tests
- User interaction tests
- Async behavior tests (loading, success, error)
- Edge case tests
- Accessibility tests

### 5. Rationalization Prevention

Explicitly counters common shortcuts:
- "Component is trivial" → TDD for ALL components
- "Jest is slow" → Each test type catches different bugs
- "Keep code as reference" → Delete means DELETE
- "Tests after are same" → NO - tests-first catch different bugs
- "Just this once testId" → Use semantic queries

## Files Included

### Core Agent Document
[`jest-rtl-tester.md`](jest-rtl-tester.md) - Complete agent instructions (735 lines)

**Sections:**
- Critical Requirements (TDD mandatory, environment verification)
- Testing Workflow (complete flowchart)
- Test Patterns (behavior vs implementation, mocking, queries, async)
- Coverage Checklist (component and unit requirements)
- Test Organization (isolation, cleanup)
- Common Mistakes (error table with fixes)
- No Shortcuts (rationalization counters)
- Red Flags (STOP triggers)
- Example Test (complete ContactForm suite)

### Supporting Documentation

**[`jest-rtl-tester-baseline-analysis.md`](jest-rtl-tester-baseline-analysis.md)** - RED Phase
- 3 pressure scenarios conducted
- Observed anti-patterns without agent
- Rationalization patterns identified
- Requirements derived from failures

**[`jest-rtl-tester-verification-results.md`](jest-rtl-tester-verification-results.md)** - GREEN Phase
- Agent behavior with same scenarios
- Comparison to baseline failures
- All anti-patterns successfully prevented
- Verification: PASS

**[`jest-rtl-tester-refactor-analysis.md`](jest-rtl-tester-refactor-analysis.md)** - REFACTOR Phase
- 10 potential loopholes identified
- Explicit counters added for each
- Strengthened language throughout
- Additional rationalization prevention

**[`jest-rtl-tester-quality-check.md`](jest-rtl-tester-quality-check.md)** - Final Quality Audit
- Structure verification (15 sections, 735 lines)
- Pattern coverage verification (20+ examples)
- Anti-pattern prevention verification (7 forbidden patterns)
- Loophole closer verification (8 counters)
- Deployment readiness: APPROVED

## Testing Methodology (TDD-for-Skills)

This agent was created following the TDD-for-Skills methodology from `superpowers:writing-skills`:

### RED Phase ✅
1. Created 3 pressure scenarios (time pressure, sunk cost, async complexity)
2. Ran scenarios WITHOUT agent guidance
3. Documented failures verbatim
4. Identified rationalization patterns

### GREEN Phase ✅
1. Wrote minimal agent addressing baseline failures
2. Re-ran scenarios WITH agent
3. Verified all anti-patterns prevented
4. Confirmed correct patterns followed

### REFACTOR Phase ✅
1. Analyzed for potential loopholes (10 found)
2. Added explicit counters for each
3. Strengthened "Delete means delete" language
4. Added query selection decision tree
5. Added behavior vs implementation guidance
6. Added test isolation requirements

### Quality Verification ✅
- All checklist items completed
- Document structure optimal
- Examples clear and runnable
- Integration points defined
- Deployment ready

## Integration with Other Agents

### Required Skills
- **`/TDD`** - MUST be invoked before any testing work
- **`/using-superpowers`** - Workflow foundation

### Related Agents
- **`playwright-tester`** - For E2E tests (different scope)
- **`react-mui-frontend-engineer`** - Creates components that need tests
- **`wiring-agent`** - Creates API integrations that need tests
- **`VERIFY-BEFORE-COMPLETE`** - Runs tests before claiming done

### Handoff Points
- Jest not configured → STOP, inform user, request setup
- Playwright-only project → Redirect to playwright-tester
- After tests pass → Invoke VERIFY-BEFORE-COMPLETE skill

## Example Usage

### Basic Component Test

```bash
# User request:
"Write tests for the ContactForm component"

# Agent workflow:
1. Read jest-rtl-tester.md
2. Check environment (package.json, jest.config.js)
3. Invoke /TDD skill
4. Write failing test for rendering
5. Run test (RED) - fails
6. Write minimal ContactForm component
7. Run test (GREEN) - passes
8. Repeat for validation, submission, errors
9. Invoke /VERIFY-BEFORE-COMPLETE
```

### Unit Test with TDD

```bash
# User request:
"Add tests for calculateProposalTotal function"

# If code already exists:
1. Read jest-rtl-tester.md
2. Agent says: "Code exists, must delete per TDD requirement"
3. Delete existing implementation
4. Write failing test for basic calculation
5. Run test (RED) - function not defined
6. Write minimal function
7. Run test (GREEN) - passes
8. Repeat for edge cases
```

## Known Limitations

1. **Cannot fix npm issues** - If Jest isn't physically installed despite package.json, agent can't fix it
2. **Requires Jest setup** - Won't work if Jest not configured
3. **Unit/component tests only** - E2E tests require playwright-tester
4. **React-focused** - Optimized for React Testing Library patterns

## Metrics

- **Document Size:** 735 lines
- **Code Examples:** 20+
- **Flowcharts:** 2 (workflow, query selection)
- **Anti-Patterns Prevented:** 7
- **Rationalization Counters:** 13
- **Test Coverage Items:** 13
- **Quality Score:** 9.5/10

## Deployment Status

✅ **APPROVED FOR PRODUCTION USE**

**Verified Against:**
- All baseline failures prevented
- TDD enforcement rigorous
- Patterns comprehensive
- Loopholes closed
- Examples clear
- Integration points defined

**Ready for:**
- Task tool invocation
- Direct agent usage
- Team adoption
- Real-world testing

## Maintenance

### When to Update

- New testing anti-patterns discovered in practice
- New Jest/RTL features released
- Additional rationalization patterns emerge
- Team identifies gaps in coverage

### How to Update

1. Document new failure pattern (RED phase)
2. Add prevention to agent (GREEN phase)
3. Verify prevention works (test)
4. Close any new loopholes (REFACTOR phase)

## Credits

Created following TDD-for-Skills methodology from `superpowers:writing-skills`.

Tested with pressure scenarios simulating:
- Time pressure
- Sunk cost fallacy
- Complex async patterns
- Framework confusion

## Version History

- **v1.0.0** (2026-01-30) - Initial release
  - Comprehensive Jest/RTL patterns
  - TDD enforcement
  - Environment verification
  - Anti-pattern prevention
  - Rationalization counters
  - Complete examples
