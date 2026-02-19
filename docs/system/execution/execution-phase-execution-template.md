---
phase: "X.Y"
title: "Feature Name - Implementation"
type: "execution"
status: "in-progress"
version: "0.1"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
assigned_agent: "agent-name"
dependencies: ["phaseX.Y-dependency"]
progress_percentage: 0
estimated_completion: "YYYY-MM-DD"
---

> **GitHub Workflow Note:** For all GitHub issue/PR creation and updates, use the `/github-workflow` skill.
> See `.claude/skills/github-workflow/SKILL.md` for complete templates and workflows with agent identification requirements.

# Phase X.Y: Feature Name - Implementation

## Implementation Log

### YYYY-MM-DD - Initial Setup
- Action taken
- **Status**: Description of current state
- **Files created/modified**:
  - `path/to/file.ts`
  - `path/to/another-file.tsx`

### YYYY-MM-DD - Core Implementation
- Action taken
- **Status**: Description of current state
- **Progress**: X% complete
- **Blockers**: None / Description of blocker

### YYYY-MM-DD - [Topic]
[Repeat pattern above]

## Current State

### Completed
- [x] Task 1
- [x] Task 2

### In Progress
- [ ] Task 3 (60% complete)
- [ ] Task 4 (30% complete)

### Pending
- [ ] Task 5
- [ ] Task 6

## Code References

Key files and their purposes:

- [`path/to/file.ts:15`](path/to/file.ts#L15) - Description of what this does
- [`path/to/component.tsx:42-51`](path/to/component.tsx#L42-L51) - Description
- [`path/to/api.ts:100`](path/to/api.ts#L100) - API endpoint implementation

## Technical Notes

**Major technical decisions tracked in INDEX Technical Decisions Log.** This section documents phase-specific implementation details only.

### Challenges Encountered
1. **Challenge**: Description
   - **Solution**: How it was resolved
   - **Learnings**: What we learned
   - **Impact**: If this affects INDEX decisions or risks, update INDEX

2. **Challenge**: Description
   - [Repeat pattern]

### Implementation Details
- **Detail**: Phase-specific implementation note
- **Trade-off**: Local trade-offs made during implementation
- **Note**: If significant enough to affect other phases, add to INDEX Technical Decisions Log

## Verification Evidence

### Build Status
```bash
$ npm run build
[Build output showing success]
```

### Test Results
```bash
$ npm run test
[Test output showing passing tests]
```

### Manual Testing
- [x] Tested scenario 1: Result
- [x] Tested scenario 2: Result
- [ ] Pending test 3

## Screenshots

![Feature screenshot](path/to/screenshot.png)
*Caption describing what the screenshot shows*

## Blockers

**Current blockers tracked in INDEX Current Blockers section.** Document phase-specific blocker details here.

### Phase-Specific Blocker Details
- **Context**: Additional detail about how blocker affects this phase
- **Workaround**: Any temporary workarounds being used
- **Status**: Update INDEX when blocker is resolved

### Resolved Blockers (Phase-Specific)
1. **Blocker**: Description
   - **Resolved by**: Solution
   - **Date resolved**: YYYY-MM-DD
   - **Note**: If blocker affected multiple phases, ensure INDEX is updated

## Next Steps

1. Next immediate task
2. Following task
3. Final task before phase completion

## Related Issues

- GitHub Issue #123: Description
- Related to Phase X.Y: Description
