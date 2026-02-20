---
phase: "X.Y"
title: "Feature Name - Component/Aspect"
type: "design"
status: "planned"
version: "1.0"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
author: "Pierce Team"
reviewers: []
dependencies: []
blocks: []
related_docs: []
estimated_hours: 0
complexity: "low" | "medium" | "high"
impact: "shallow" | "deep"
verification:
  - "Verification step 1"
  - "Verification step 2"
---

# Phase X.Y: Feature Name - Component/Aspect

## Overview

Brief description of what this phase accomplishes and why it's important.

## Design Decisions

### Decision 1: [Topic]

**Context:** Why this decision needs to be made

**Options Considered:**
1. **Option A** (Recommended)
   - Pros: ...
   - Cons: ...

2. **Option B**
   - Pros: ...
   - Cons: ...

**Decision:** Option A selected because...

### Decision 2: [Topic]

[Repeat pattern above]

## Technical Approach

### Architecture

Describe the high-level architecture, components, and how they interact.

```
[Include diagrams, flowcharts, or architecture sketches]
```

### Data Model

If applicable, describe data structures, database schema, or data flow.

```sql
-- Example SQL schema
CREATE TABLE example (
  id UUID PRIMARY KEY,
  ...
);
```

```typescript
// Example TypeScript types
interface Example {
  id: string;
  ...
}
```

### Component Breakdown

List key components/modules to be created or modified:

1. **Component Name** (`path/to/component.tsx`)
   - Purpose: ...
   - Key functionality: ...
   - Dependencies: ...

2. **Component Name** (`path/to/component.tsx`)
   - [Repeat pattern]

## Dependencies

### External Dependencies
- Dependency 1: Why needed
- Dependency 2: Why needed

### Internal Dependencies
- Phase X.Y must complete before this phase
- Requires component Z to be available

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Risk description | High/Med/Low | High/Med/Low | How to address |

## Implementation Notes

Key considerations for implementation:
- Note 1
- Note 2
- Note 3

## Verification Plan

**Overall verification checklist tracked in INDEX.** This section documents phase-specific verification steps only.

### Phase-Specific Verification

How to verify this specific phase is complete:

1. **Step 1**: Expected result
2. **Step 2**: Expected result
3. **Step 3**: Expected result

### Phase Acceptance Criteria

**Note:** These are phase-specific criteria. Feature-level criteria tracked in INDEX.

- [ ] Phase criterion 1
- [ ] Phase criterion 2
- [ ] Phase criterion 3

## Related Documentation

- [Related design doc](path/to/doc.md)
- [Related architecture doc](path/to/doc.md)
- [External reference](https://example.com)
