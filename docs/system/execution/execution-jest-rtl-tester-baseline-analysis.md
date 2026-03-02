# Jest/RTL Testing Agent - Baseline Analysis (RED Phase)

## Pressure Scenarios Conducted

### Scenario 1: Component Testing Under Time Pressure
**Context:** Test ContactForm component quickly with validation and submission

**Observed Behaviors:**
1. ❌ **Assumed Jest/RTL without checking project setup** - Jumped into writing tests without verifying testing framework
2. ❌ **Used wrong test framework** - Wrote Jest tests for Playwright-only project
3. ❌ **Poor mocking patterns** - Mocked console.log instead of proper onSubmit handler
4. ❌ **Used fireEvent instead of userEvent** - Less realistic user interactions
5. ❌ **Tested implementation details** - Checked placeholder text instead of labels
6. ❌ **Skipped accessibility testing** - No getByRole, getByLabelText usage
7. ❌ **No test setup/cleanup** - Would cause pollution between tests
8. ❌ **Missed edge cases** - No keyboard nav, screen readers, long input
9. ❌ **Tests wouldn't catch bugs** - Typo in code (`datay` vs `data`) not caught

**Rationalizations Used:**
- "I'll just write the tests quickly" → Skipped checking project setup
- "Console.log is fine for testing" → Avoided proper mock functions
- "Basic tests are enough" → Missed accessibility, edge cases
- "fireEvent is simpler" → Used less realistic interaction

### Scenario 2: Unit Test with Sunk Cost Pressure
**Context:** Already implemented `calculateProposalTotal()` for 30 minutes, now need tests

**Observed Behaviors:**
1. ✅ **Recognized TDD violation** - Correctly identified code-before-test
2. ✅ **Documented rationalizations** - Listed all sunk cost justifications
3. ✅ **Applied TDD skill correctly** - Stated should delete and start over
4. ✅ **No shortcuts taken** - Correctly refused to keep "as reference"

**Rationalizations Anticipated (but correctly rejected):**
- "I already manually tested all edge cases" → Correctly rejected
- "Tests after achieve the same goals" → Correctly rejected
- "Deleting 30 minutes of work is wasteful" → Correctly rejected (sunk cost)
- "Keep as reference, write tests first" → Correctly rejected (will adapt it)

**Evidence:** TDD skill was effective at preventing rationalization here.

### Scenario 3: Component with Hooks and Async Data
**Context:** Test UserProfileCard with useState, useEffect, fetch, loading/error/success states

**Observed Behaviors:**
1. ✅ **Proper API mocking** - Used global.fetch jest.fn() correctly
2. ✅ **Async testing patterns** - Used waitFor for state changes
3. ✅ **Complete state coverage** - Tested loading, error, success transitions
4. ✅ **User interaction** - Used userEvent properly
5. ✅ **Avoid anti-patterns** - Did NOT mock React hooks, did NOT test implementation
6. ✅ **Controlled promise resolution** - Advanced pattern for intermediate state testing
7. ✅ **Proper query strategies** - Used getBy for assertions, queryBy for absence checks
8. ✅ **Comprehensive documentation** - Documented 9 core patterns with rationale
9. ✅ **Honest about unknowns** - Listed 8 unclear areas needing team clarification

**Patterns Used Correctly:**
- API mocking at boundary (not internals)
- waitFor for async state changes
- Multiple mock responses for different scenarios
- Test organization by feature
- Complete response shapes (avoid testing mocks)
- Proper cleanup in beforeEach

**This scenario showed STRONG testing knowledge when pressure was removed and focus was specific.**

## Pattern Analysis: What Causes Failures

### Failure Pattern 1: Framework Confusion
**Trigger:** Time pressure + assumptions
**Behavior:** Write tests without checking project setup
**Fix Needed:** Agent must check package.json, existing test files FIRST

### Failure Pattern 2: Poor Mocking Patterns
**Trigger:** Quick solutions
**Behavior:** Mock console.log, internal functions, React hooks
**Fix Needed:** Agent must mock at API boundaries only, never internal logic

### Failure Pattern 3: Testing Implementation Details
**Trigger:** Easiest queries
**Behavior:** Test placeholders, CSS classes, internal state
**Fix Needed:** Agent must test user-visible behavior via semantic queries

### Failure Pattern 4: Skipping Accessibility
**Trigger:** Not thinking about a11y
**Behavior:** No getByRole, no keyboard nav tests
**Fix Needed:** Agent must ALWAYS test with semantic queries first

### Failure Pattern 5: Missing Edge Cases
**Trigger:** Happy path focus
**Behavior:** Only test success scenarios
**Fix Needed:** Agent must have edge case checklist

### Success Pattern: Strong Async/Hook Testing
**When properly focused, demonstrated excellent patterns:**
- Proper async testing with waitFor
- API mocking at boundaries
- Complete state transition coverage
- Avoiding anti-patterns
- Documentation of unknowns

## Key Rationalizations to Counter

| Rationalization | Reality | Agent Must Say |
|----------------|---------|----------------|
| "I'll write tests quickly" | Quick = wrong framework, poor patterns | "Check package.json and existing tests FIRST" |
| "Console.log is fine for testing" | Doesn't test actual prop behavior | "Mock props correctly, test behavior" |
| "fireEvent is simpler" | Less realistic than userEvent | "Use userEvent for realistic interactions" |
| "Basic tests are enough" | Miss accessibility, edge cases | "Follow comprehensive testing checklist" |
| "Test the placeholder text" | Implementation detail, not user behavior | "Test with semantic queries (role, label)" |

## Agent Requirements (GREEN Phase Goals)

Based on baseline failures, the Jest/RTL Testing Agent must:

### 1. Environment Verification (FIRST STEP)
- [ ] Check package.json for test dependencies
- [ ] Find existing test files to understand patterns
- [ ] Verify Jest/RTL is installed before writing tests
- [ ] Check for test:unit, test:component scripts

### 2. TDD Enforcement
- [ ] Invoke /TDD skill BEFORE any test writing
- [ ] Refuse to write tests for existing code without deleting it first
- [ ] Follow RED-GREEN-REFACTOR cycle explicitly
- [ ] Document test failures before writing implementation

### 3. Proper Test Patterns
- [ ] Mock at API boundaries (fetch, axios) not internals
- [ ] Use userEvent not fireEvent for interactions
- [ ] Use semantic queries (getByRole, getByLabelText) first
- [ ] Test user-visible behavior not implementation details
- [ ] Include accessibility in all component tests

### 4. Comprehensive Coverage Checklist
- [ ] Happy path (success scenarios)
- [ ] Error states (network failures, validation errors)
- [ ] Loading states (pending async operations)
- [ ] Edge cases (empty data, null values, long input)
- [ ] Keyboard navigation
- [ ] Screen reader accessibility
- [ ] State transitions (loading → success → error)

### 5. Async Testing Patterns
- [ ] Use waitFor for state changes after async operations
- [ ] Use findBy* queries for elements that appear async
- [ ] Control promise resolution for intermediate states
- [ ] Test all async state transitions
- [ ] Clean up async operations in afterEach

### 6. Mocking Best Practices
- [ ] Never mock React hooks (useState, useEffect)
- [ ] Never mock internal component functions
- [ ] Mock API layer (fetch, axios, external services)
- [ ] Use complete mock responses (avoid testing mocks)
- [ ] Reset mocks in beforeEach/afterEach

### 7. Test Organization
- [ ] Group tests by feature in describe blocks
- [ ] Use descriptive test names focusing on behavior
- [ ] Setup common data in beforeEach
- [ ] Clean up in afterEach (timers, mocks, DOM)
- [ ] One assertion per test when possible

### 8. Documentation Requirements
- [ ] Document any unclear requirements
- [ ] Note missing API contracts
- [ ] Flag areas needing team clarification
- [ ] Explain complex mocking strategies
- [ ] Reference TDD workflow used

## Next Steps

**GREEN Phase:** Write minimal agent document addressing these specific failures:
1. Environment verification checklist
2. TDD skill invocation requirement
3. Proper mocking patterns with examples
4. Semantic query requirements
5. Comprehensive test coverage checklist
6. Async testing pattern guide
7. Common mistakes table from baseline

**REFACTOR Phase:** Test agent with same scenarios, find new rationalizations, close loopholes.
