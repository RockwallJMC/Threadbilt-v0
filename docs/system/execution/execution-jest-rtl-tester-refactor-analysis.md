# Jest/RTL Testing Agent - REFACTOR Phase Analysis

## Potential Loopholes to Address

### 1. "Jest is slow, I'll just write one test"

**Current agent:** Requires comprehensive coverage checklist but doesn't explain WHY.

**Loophole:** Agent might write minimal tests claiming "one passing test is enough."

**Fix needed:**
- Add explicit "No Shortcuts" section
- Explain WHAT each test type catches
- State minimum test requirements

### 2. "I'll use testId just this once because getByRole is confusing"

**Current agent:** Says "NEVER use testId unless NO semantic option exists" but doesn't define "no option."

**Loophole:** Agent might rationalize testId usage for convenience.

**Fix needed:**
- Explicit decision tree for query selection
- Examples of when testId IS acceptable
- Examples of when it's NOT acceptable

### 3. "The component is trivial, I can skip TDD"

**Current agent:** Says TDD is mandatory but doesn't address "trivial component" argument.

**Loophole:** Agent might rationalize that simple components don't need test-first.

**Fix needed:**
- Add to Red Flags: "This component is trivial"
- Explain: Trivial bugs are most embarrassing in production
- Mandate: TDD for ALL components, even one-liners

### 4. "I'll mock the hook just for this test, it's easier"

**Current agent:** Forbids mocking React hooks but doesn't explain alternative.

**Loophole:** Agent might mock hooks claiming "no other way."

**Fix needed:**
- Provide explicit alternatives to mocking hooks
- Show pattern: Test component behavior, not hook implementation
- Example: Testing custom hook via test harness component

### 5. "Test is flaky, I'll add waitFor with long timeout"

**Current agent:** Shows waitFor usage but doesn't address flakiness root cause.

**Loophole:** Agent might use arbitrary long timeouts instead of fixing race conditions.

**Fix needed:**
- Explain proper waitFor usage (condition-based, not time-based)
- Forbid arbitrary timeouts
- Show pattern: Control async resolution in tests

### 6. "I'll test multiple things in one test, it's more efficient"

**Current agent:** Says "One assertion per test when possible" but allows exceptions.

**Loophole:** Agent might write mega-tests claiming "logical grouping."

**Fix needed:**
- Define WHEN multiple assertions are acceptable
- Define WHEN they must be separate
- Rule: One behavior per test, multiple assertions OK if testing same behavior

### 7. "Setup is expensive, I'll share state between tests"

**Current agent:** Requires beforeEach/afterEach but doesn't explain isolation importance.

**Loophole:** Agent might skip cleanup claiming "tests don't interfere."

**Fix needed:**
- Explain test isolation principle
- Show example of pollution causing false passes
- Mandate: Clean slate for every test, no exceptions

### 8. "I'll test the happy path thoroughly, edge cases are unlikely"

**Current agent:** Has comprehensive checklist but doesn't prioritize.

**Loophole:** Agent might skip edge cases under time pressure.

**Fix needed:**
- Prioritize test types: Edge cases BEFORE additional happy path coverage
- Explain: Edge cases are where bugs hide
- Mandate: Minimum edge case coverage before expanding happy path

### 9. "Implementation is done, I'll write comprehensive tests to verify"

**Current agent:** Forbids tests-after but might not catch all rationalizations.

**Loophole:** Agent might say "I'll follow TDD workflow" but keep existing code "as reference."

**Fix needed:**
- Strengthen "Delete means delete" language
- Add: Close the file, don't keep it open
- Add: Don't look at it while writing tests
- Add: No "reference" files, no "backup" files

### 10. "I'll test implementation of Algorithm X, not behavior"

**Current agent:** Says "test behavior" but doesn't define what that means.

**Loophole:** Agent might test internal sorting algorithm instead of sorted output.

**Fix needed:**
- Define behavior: User-visible outcomes, not internal steps
- Example: Test "list is sorted" not "uses quicksort"
- Example: Test "user sees error message" not "state.error === true"

## New Rationalizations Discovered in Testing

None discovered yet (GREEN phase passed cleanly). Will need real-world usage to find more.

## Refactor Priorities

### High Priority (Will definitely cause issues)
1. ✅ "Component is trivial" rationalization
2. ✅ "Just this once" testId usage
3. ✅ "Keep as reference" TDD violation
4. ✅ Behavior vs implementation definition

### Medium Priority (Might cause issues)
5. ✅ Shared state between tests
6. ✅ Edge case deprioritization
7. ✅ Multiple behaviors per test

### Low Priority (Edge cases)
8. ✅ Mocking hooks alternatives
9. ✅ Flaky test timeouts
10. ✅ Minimal test coverage

## Recommended Additions to Agent Document

### Section: "No Shortcuts"
Place after "Critical Requirements" section

### Section: "Query Selection Decision Tree"
Place in "Query Strategies" section

### Section: "When NOT to Refactor Out Duplication"
Add to test organization section (test isolation > DRY)

### Section: "Testing Behavior vs Implementation"
Add before test patterns

### Updates to Red Flags Section
Add 5 new red flags from loopholes above

## Next Steps

1. Add new sections to agent document
2. Update Red Flags with new rationalizations
3. Add query selection decision tree
4. Strengthen "Delete means delete" language
5. Re-test with pressure scenarios looking for new rationalizations
