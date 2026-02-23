---
issue_id: "BUG-XXX"
title: "Brief description of the bug"
severity: "critical" | "high" | "medium" | "low"
status: "open" | "investigating" | "resolved" | "closed"
created: "YYYY-MM-DD"
resolved: "YYYY-MM-DD"
time_spent_hours: 0
related_phase: "X.Y"
related_index: "INDEX-feature-name.md"
---

# DEBUG-BUG-XXX: Bug Title

## Issue Description

### Symptoms
Clear description of what's going wrong:
- Observable behavior 1
- Observable behavior 2
- Error messages or unexpected outputs

### Expected Behavior
What should happen instead:
- Expected behavior 1
- Expected behavior 2

### Reproduction Steps
Steps to reliably reproduce the issue:
1. Step 1
2. Step 2
3. Step 3
4. Observe: [What goes wrong]

### Environment
- Environment: Development / Staging / Production
- Browser/Platform: [If applicable]
- User role/permissions: [If applicable]
- Data state: [Any relevant data conditions]

## Investigation Log

### YYYY-MM-DD HH:MM - Initial Investigation
- **Action**: What was investigated
- **Finding**: What was discovered
- **Hypothesis**: Initial theory about root cause

### YYYY-MM-DD HH:MM - Deep Dive
- **Action**: Further investigation steps
- **Code inspected**:
  - [`path/to/file.ts:42`](path/to/file.ts#L42) - What was found here
  - [`path/to/another-file.tsx:100-120`](path/to/another-file.tsx#L100-L120) - Findings
- **Finding**: More detailed findings
- **Hypothesis updated**: Refined theory

### YYYY-MM-DD HH:MM - Testing Theory
- **Test performed**: How the hypothesis was tested
- **Result**: What the test showed
- **Conclusion**: Was hypothesis correct?

## Root Cause Analysis

### Root Cause
Clear statement of what's actually causing the issue.

### Why It Happened
Explanation of how this bug was introduced:
- Contributing factor 1
- Contributing factor 2
- When/how it was introduced

### Why It Wasn't Caught Earlier
- Why tests didn't catch it
- Why code review didn't catch it
- What gap in process allowed it through

## Solution Implemented

### Fix Description
High-level description of how the bug was fixed.

### Code Changes
```typescript
// Before (broken)
function brokenCode() {
  // Problem code
}

// After (fixed)
function fixedCode() {
  // Corrected code
}
```

### Files Modified
- [`path/to/file.ts`](path/to/file.ts) - Description of changes
- [`path/to/another-file.tsx`](path/to/another-file.tsx) - Description of changes

### Migration/Rollback Plan
If applicable, steps for:
- Data migration needed
- How to rollback if fix causes issues
- Backward compatibility considerations

## Verification

### Test Added
```typescript
// Test that proves bug is fixed
describe('Bug XXX fix', () => {
  it('should correctly handle [scenario]', () => {
    // Test implementation
  });
});
```

### Manual Verification Steps
1. Step 1: Expected result ✅
2. Step 2: Expected result ✅
3. Step 3: Expected result ✅

### Verification Evidence
```bash
$ npm test
[Test output showing new test passes]
```

### Regression Testing
- [ ] Existing tests still pass
- [ ] No new bugs introduced
- [ ] Related functionality still works

## Prevention Measures

### Immediate Actions
What was done to prevent similar bugs:
1. Added test coverage for [scenario]
2. Updated validation logic
3. Improved error handling

### Long-term Improvements
Process or architectural changes to prevent recurrence:
1. Improvement 1
2. Improvement 2
3. Improvement 3

### Documentation Updates
- [ ] Updated code comments
- [ ] Updated API documentation
- [ ] Updated troubleshooting guide
- [ ] Added to known issues (if not fully resolved)

## Impact Assessment

### User Impact
- **Affected users**: Who/how many users experienced this
- **Severity of impact**: How bad was the experience
- **Duration**: How long the bug existed
- **Data impact**: Any data corruption or loss

### Business Impact
- Lost revenue / blocked workflows / reputation damage
- Estimate of impact if quantifiable

### Technical Debt Created
- Any workarounds or technical debt introduced by the fix
- Plan to address technical debt

## Related Issues

- Related to Bug #ABC: Description
- May cause issue in [area]: Watch for...
- Fixed similar bug in Phase X.Y: Link

## Timeline

| Event | Time | Duration |
|-------|------|----------|
| Bug reported | YYYY-MM-DD HH:MM | - |
| Investigation started | YYYY-MM-DD HH:MM | +Xh |
| Root cause identified | YYYY-MM-DD HH:MM | +Xh |
| Fix implemented | YYYY-MM-DD HH:MM | +Xh |
| Fix verified | YYYY-MM-DD HH:MM | +Xh |
| Fix deployed | YYYY-MM-DD HH:MM | +Xh |
| Total time | - | Xh |

## Lessons Learned

### What Went Well
- Quick identification of root cause
- Effective testing strategy
- [Other positives]

### What Could Be Improved
- Earlier detection possible if...
- Better error messages would have helped by...
- [Other improvements]

### Knowledge Sharing
- Shared finding with team via [method]
- Updated documentation
- Added to team wiki / knowledge base
