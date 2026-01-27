---
realignment_id: "REALIGN-XXX"
title: "Brief description of the realignment"
trigger: "user_feedback" | "technical_discovery" | "requirement_change" | "architectural_concern"
severity: "critical" | "high" | "medium" | "low"
created: "YYYY-MM-DD"
status: "proposed" | "approved" | "rejected" | "implemented"
estimated_delay_days: 0
actual_delay_days: 0
affected_phases: ["X.Y", "X.Z"]
---

# REALIGN-XXX: Realignment Title

## Executive Summary

Brief (2-3 sentence) summary of what's changing and why.

## Context

### Original Plan
What was the original plan or approach?
- Original approach detail 1
- Original approach detail 2
- Original assumptions

### What Changed
What information, feedback, or circumstances triggered this realignment?
- New information 1
- New information 2
- Changed requirement 3

### Trigger Details
Detailed explanation of the trigger:

**Type**: User feedback / Technical discovery / Requirement change / Architectural concern

**Details**:
- Source: Where the trigger came from
- Date discovered: When we learned about this
- Evidence: Data, feedback, or findings supporting the change

## Problem Statement

Clear statement of the problem that requires realignment:
- What's not working with current plan?
- What risks exist if we don't change?
- What opportunity are we missing?

## Proposed Changes

### High-Level Approach
New approach at a high level:
- New approach element 1
- New approach element 2
- Key differences from original

### Detailed Changes

#### Change to Phase X.Y
- **Original**: What was planned
- **New**: What will be done instead
- **Rationale**: Why this specific change

#### Change to Phase X.Z
[Repeat pattern]

#### New Phases (if any)
- **Phase X.W**: New phase description
  - **Purpose**: Why this phase is needed
  - **Effort**: Estimated time/complexity

### What Stays the Same
Important to note what's NOT changing:
- Element 1 remains as planned
- Element 2 remains as planned
- Core objectives unchanged

## Impact Assessment

### Timeline Impact
- **Original completion date**: YYYY-MM-DD
- **New estimated completion date**: YYYY-MM-DD
- **Delay**: X days/weeks
- **Mitigation**: How to minimize delay

### Scope Impact
- **Features added**: List of new features
- **Features removed**: List of removed features
- **Features modified**: List of changed features
- **Net scope change**: Increased / Decreased / Same

### Resource Impact
- **Additional effort required**: X hours/days
- **Team members affected**: Who needs to do different work
- **External dependencies**: Any new dependencies introduced

### Technical Debt Impact
- **Debt introduced**: Any technical debt created by change
- **Debt resolved**: Any technical debt resolved by change
- **Net debt**: Increased / Decreased / Same

### Risk Impact
| Risk | Original | After Realignment | Change |
|------|----------|-------------------|--------|
| Risk 1 | High | Medium | ↓ Reduced |
| Risk 2 | Low | Medium | ↑ Increased |

## Alternatives Considered

### Alternative 1: [Approach Name]
- **Description**: What this alternative would do
- **Pros**: Benefits of this approach
- **Cons**: Drawbacks of this approach
- **Why not chosen**: Reason for rejection

### Alternative 2: [Approach Name]
[Repeat pattern]

### Alternative 3: Do Nothing
- **Description**: Continue with original plan
- **Pros**: No delay, no scope change
- **Cons**: Risks and issues that remain
- **Why not chosen**: Why status quo isn't viable

## Decision Rationale

### Why This Realignment
Clear explanation of why the proposed changes are the right choice:
1. Reason 1: Supporting evidence
2. Reason 2: Supporting evidence
3. Reason 3: Supporting evidence

### Trade-offs Accepted
Acknowledging what we're giving up:
- Trade-off 1: What we're sacrificing and why it's worth it
- Trade-off 2: [Repeat pattern]

### Success Criteria
How we'll know if this realignment was the right decision:
- Criterion 1: Measurable outcome
- Criterion 2: Measurable outcome
- Criterion 3: Measurable outcome

## Implementation Plan

### Updated Phase Breakdown
New phase structure after realignment:

1. **Phase X.Y** (Modified)
   - Changes: What's different
   - Effort: New estimate
   - Owner: Assigned agent/person

2. **Phase X.Z** (New)
   - Purpose: Why this phase
   - Effort: Estimate
   - Owner: Assigned agent/person

3. **Phase X.W** (Removed)
   - Reason for removal
   - Work salvaged: Any reusable work

### Updated Dependencies
How dependencies change with realignment:
- New dependency on: Description
- Removed dependency on: Description
- Modified dependency: How it changed

### Migration Path
If there's existing work that needs to change:
1. Step 1: How to transition existing work
2. Step 2: Data migration if needed
3. Step 3: Testing updated approach

## Updated Verification Plan

How verification changes with new approach:

### New Tests Required
- Test 1: What needs to be tested differently
- Test 2: New test scenario

### Tests No Longer Needed
- Test 1: Why it's no longer relevant

### Updated Acceptance Criteria
- [ ] Criterion 1 (modified)
- [ ] Criterion 2 (new)
- [ ] ~~Criterion 3 (removed)~~

## Communication Plan

### Stakeholders to Notify
- Stakeholder 1: What they need to know, when to tell them
- Stakeholder 2: What they need to know, when to tell them

### Documentation to Update
- [ ] INDEX file updated with new phases
- [ ] Phase documents updated
- [ ] User-facing docs updated (if applicable)
- [ ] Architecture docs updated (if applicable)

## Approval

### Required Approvals
- [ ] Technical lead: Name (Date)
- [ ] Product owner: Name (Date)
- [ ] Other stakeholder: Name (Date)

### Approval Notes
Comments from approvers:
- **Approver 1**: "Comments or conditions"
- **Approver 2**: "Comments or conditions"

### Conditions for Approval
Any conditions that must be met:
- Condition 1: Description
- Condition 2: Description

## Lessons Learned

### Why This Realignment Was Needed
Root cause analysis of why original plan needed to change:
- Root cause 1
- Root cause 2

### How to Prevent Similar Issues
Process improvements to reduce future realignments:
1. Improvement 1: How it helps
2. Improvement 2: How it helps

### Knowledge to Capture
Important learnings to document:
- Learning 1: What we learned
- Learning 2: What we learned

## Monitoring & Review

### Progress Checkpoints
When to review if realignment is working:
- Checkpoint 1: Date, what to check
- Checkpoint 2: Date, what to check

### Success Metrics
How to measure if realignment achieved goals:
- Metric 1: Target value, how to measure
- Metric 2: Target value, how to measure

### Rollback Plan
If realignment doesn't work, how to revert:
1. Trigger for rollback: What indicates failure
2. Rollback steps: How to revert
3. Fallback plan: Alternative approach

## Related Documents

- [Original INDEX](_sys_documents/execution/INDEX-feature-name.md)
- [Affected phase doc](_sys_documents/design/phase-X.Y-topic.md)
- [User feedback / Issue #123](https://github.com/org/repo/issues/123)

## Timeline

| Event | Date | Notes |
|-------|------|-------|
| Realignment proposed | YYYY-MM-DD | Initial proposal |
| Impact assessment complete | YYYY-MM-DD | Analysis done |
| Approvals obtained | YYYY-MM-DD | All stakeholders approved |
| Implementation started | YYYY-MM-DD | Begin executing new plan |
| First checkpoint | YYYY-MM-DD | Review progress |
| Realignment complete | YYYY-MM-DD | New approach fully implemented |
