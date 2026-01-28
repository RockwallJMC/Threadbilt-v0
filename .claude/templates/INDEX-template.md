---
feature: "Feature Name - Description"
github_issue: "#123"
feature_branch: "feature/desk-name-feature"
pr_number: "#456"
status: "planned" | "in-progress" | "blocked" | "complete" | "merged" | "locked"
started: "YYYY-MM-DD"
target_completion: "YYYY-MM-DD"
actual_completion: "YYYY-MM-DD"
team: ["claude", "user"]
impact_level: "shallow" | "deep"
---

# INDEX: Feature Name

## Feature Overview

Brief description of what this feature accomplishes and its business value.

**Key Deliverables:**
- Deliverable 1
- Deliverable 2
- Deliverable 3

## GitHub Tracking

- **Issue**: #{github_issue} - [View Issue](https://github.com/{org}/{repo}/issues/{number})
- **Feature Branch**: `{feature_branch}`
- **Pull Request**: #{pr_number} - [View PR](https://github.com/{org}/{repo}/pull/{number}) (after PR creation)

All phase progress updates are posted to the GitHub issue for external coordination and visibility.

## Phase Breakdown

### Phase 1.1: [Phase Name]
- **Doc**: [`_sys_documents/design/phase1.1-topic.md`](_sys_documents/design/phase1.1-topic.md)
- **Type**: Design
- **Status**: ✅ Complete (v1.0) / 🚧 In Progress (v0.5) / ⏳ Planned / 🚫 Blocked
- **Assigned**: Agent name or team member
- **Verification**: Brief verification summary
- **Completed**: YYYY-MM-DD

### Phase 1.2: [Phase Name]
- **Doc**: [`_sys_documents/execution/phase1.2-topic.md`](_sys_documents/execution/phase1.2-topic.md)
- **Type**: Execution
- **Status**: [Status]
- **Assigned**: Agent name
- **Progress**: X%
- **Blockers**: None / Description

### Phase 1.3: [Phase Name]
[Repeat pattern above]

## Current Status

### Active Phase
Currently working on: Phase X.Y - [Phase Name]

### Progress Summary
- Total phases: X
- Completed: X (XX%)
- In progress: X
- Pending: X
- Blocked: X

### Overall Progress: XX%

## Current Blockers

### Blocker 1
- **Phase affected**: Phase X.Y
- **Severity**: Critical / High / Medium / Low
- **Description**: What's blocking progress
- **Owner**: Who's responsible for unblocking
- **Target resolution**: YYYY-MM-DD

### Blocker 2
[Repeat pattern above]

## Technical Decisions Log

### Decision 1: [Topic]
- **Date**: YYYY-MM-DD
- **Context**: Why decision needed
- **Decision**: What was decided
- **Rationale**: Why this decision
- **Impact**: What phases/components affected

### Decision 2: [Topic]
[Repeat pattern above]

## Risk Register

| Risk | Impact | Probability | Phase | Mitigation | Owner |
|------|--------|-------------|-------|------------|-------|
| Risk description | H/M/L | H/M/L | X.Y | Mitigation plan | Name |

## Dependencies

### External Dependencies
- Dependency 1: Status, blocker impact
- Dependency 2: Status, blocker impact

### Internal Dependencies
- Phase X.Y depends on Phase W.Z (Status: [Status])
- Component A requires Component B (Status: [Status])

## Verification Checklist

### Code Quality
- [ ] All tests passing (0 failures)
- [ ] Build succeeds without errors
- [ ] No linting errors
- [ ] Code coverage ≥ 80%

### Functionality
- [ ] All acceptance criteria met
- [ ] User flows tested end-to-end
- [ ] Edge cases handled
- [ ] Error handling implemented

### Security & Performance
- [ ] RLS policies enforced (if applicable)
- [ ] Input validation implemented
- [ ] Performance benchmarks met
- [ ] Security scan passed

### Documentation
- [ ] User-facing docs updated
- [ ] API docs current
- [ ] As-built docs generated
- [ ] Code comments added where needed

### Screenshots & Evidence
- [ ] Screenshots captured for all features
- [ ] Video walkthrough recorded (if applicable)
- [ ] Verification command outputs captured

## Code Review

### Review Status
- [ ] Self-review complete
- [ ] Peer review complete
- [ ] Agent review complete (superpowers:code-reviewer)
- [ ] All feedback addressed

### Review Findings
Summary of key findings from code reviews and how they were addressed.

## Testing Evidence

### Automated Tests
```bash
$ npm test
[Test output showing passing tests]
```

### E2E Tests
```bash
$ npx playwright test
[Playwright output showing passing tests]
```

### Build Verification
```bash
$ npm run build
[Build output showing success]
```

## Timeline

| Milestone | Planned Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Phase 1.1 Complete | YYYY-MM-DD | YYYY-MM-DD | ✅ |
| Phase 1.2 Complete | YYYY-MM-DD | YYYY-MM-DD | 🚧 |
| Phase 1.3 Complete | YYYY-MM-DD | - | ⏳ |
| All Phases Complete | YYYY-MM-DD | - | ⏳ |
| PR Created | YYYY-MM-DD | - | ⏳ |
| PR Merged | YYYY-MM-DD | - | ⏳ |

## Related Documentation

### Design Docs
- [Design doc 1](_sys_documents/design/phase1.1-topic.md)
- [Design doc 2](_sys_documents/design/phase1.2-topic.md)

### User Docs
- [Feature guide](docs/features/FEATURE-NAME.md)
- [Architecture doc](docs/architecture/ARCHITECTURE-NAME.md)

### As-Built Docs
- [As-built doc](_sys_documents/as-builts/feature-as-built.md)

## Change Log

### v1.0 - YYYY-MM-DD
- Initial implementation complete
- All phases finished
- Merged to main

### v0.5 - YYYY-MM-DD
- Phase 1.2 complete
- Updated based on code review feedback

### v0.1 - YYYY-MM-DD
- Feature initiated
- INDEX created
- Phase 1.1 complete

## Post-Merge Notes

After merge, update this section with:
- Final commit hash
- PR number and link
- Deployment status
- Any follow-up tasks or known issues
