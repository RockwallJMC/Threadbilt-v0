---
title: "Component/Feature Name - As-Built"
type: "as-built"
version: "X.Y.Z"
last_updated: "YYYY-MM-DD"
reflects_code_as_of: "commit abc123def456"
verified_by: "Agent name / Team member"
category: "database" | "api" | "ui" | "architecture" | "feature"
---

# [Component/Feature Name] - As-Built Documentation

> **Living Document**: This reflects the ACTUAL current state as deployed.
> **Last synchronized**: YYYY-MM-DD
> **Commit hash**: `abc123def456`

## Document Purpose

This as-built document captures the actual implemented state of [component/feature], serving as the source of truth for:
- Current architecture and design patterns
- Actual schema/API/component structure
- Known deviations from original design
- Ongoing maintenance and evolution

## Overview

### What This Is
Brief description of the component/feature and its purpose in the system.

### Current Status
- **Status**: Active / Deprecated / In Development
- **Stability**: Stable / Beta / Experimental
- **Last Major Change**: YYYY-MM-DD (v X.Y)
- **Next Planned Changes**: Brief description or "None planned"

## Architecture

### High-Level Design

```
[Current architecture diagram or description]

Component A ──> Component B
     │              │
     └──> Component C
```

### Key Components

1. **Component Name** (`path/to/component.ts`)
   - **Purpose**: What it does
   - **Current implementation**: How it works
   - **Key dependencies**: What it depends on
   - **Known limitations**: Any limitations

2. **Component Name**
   [Repeat pattern]

## Implementation Details

### Database Schema (if applicable)

```sql
-- Current schema as deployed
CREATE TABLE actual_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_actual_table_name ON actual_table(name);

-- RLS Policies
ALTER TABLE actual_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "policy_name" ON actual_table
  FOR ALL USING (org_id = current_setting('app.current_org_id')::uuid);
```

### API Endpoints (if applicable)

#### GET /api/endpoint
- **Purpose**: What this endpoint does
- **Auth required**: Yes/No
- **Request parameters**:
  ```typescript
  {
    param1: string;
    param2?: number;
  }
  ```
- **Response**:
  ```typescript
  {
    data: Array<Item>;
    total: number;
  }
  ```
- **Status codes**: 200, 400, 401, 404, 500
- **Implementation**: [`path/to/route.ts:42`](path/to/route.ts#L42)

#### POST /api/endpoint
[Repeat pattern for each endpoint]

### Data Structures (if applicable)

```typescript
// Current TypeScript types/interfaces
interface ActualType {
  id: string;
  name: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

type ActualStatus = 'active' | 'inactive' | 'pending';
```

### Component Structure (if applicable)

```tsx
// Current component implementation pattern
const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks
  const { data, error } = useSWR('/api/endpoint');
  const [state, setState] = useState(initialState);

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);

  // Handlers
  const handleAction = () => {
    // Handler logic
  };

  // Render
  return (
    <Container>
      {/* Actual JSX */}
    </Container>
  );
};
```

## Configuration

### Environment Variables
```bash
# Required
REQUIRED_VAR=value                # Purpose

# Optional
OPTIONAL_VAR=default_value        # Purpose
```

### Feature Flags
- `feature.flag_name`: Current state (enabled/disabled) - Purpose

## Integration Points

### Upstream Dependencies
- **Service/Component A**: How we depend on it
- **Service/Component B**: What we consume from it

### Downstream Consumers
- **Service/Component X**: How it consumes our data/API
- **Service/Component Y**: What it expects from us

### External Services
- **Service Name**: Purpose, configuration, fallback behavior

## Data Flow

```
User Action
    ↓
Component A (UI)
    ↓
API Call
    ↓
Backend Handler
    ↓
Database
    ↓
Response
    ↓
UI Update
```

## Performance Characteristics

### Current Metrics
- **Response time**: P50 / P95 / P99
- **Throughput**: Requests per second
- **Database query time**: Average / Max
- **Bundle size** (if UI): Size in KB

### Known Performance Issues
- Issue 1: Description and workaround
- Issue 2: Description and planned fix

## Security

### Authentication & Authorization
- **Auth method**: How authentication works
- **Permission model**: How permissions are enforced
- **RLS policies**: Summary of row-level security

### Input Validation
- **Validation rules**: What's validated and how
- **Sanitization**: How inputs are sanitized
- **Known vulnerabilities**: Any identified issues and status

## Testing

### Test Coverage
- **Unit tests**: X% coverage
- **Integration tests**: Number of tests
- **E2E tests**: Coverage of user flows

### Test Locations
- Unit tests: `path/to/tests/**/*.test.ts`
- E2E tests: `path/to/e2e/**/*.spec.ts`

### Known Test Gaps
- Area 1: Why not tested, plan to add tests
- Area 2: Known limitation

## Known Issues & Limitations

### Active Issues
1. **Issue**: Description
   - **Severity**: Critical / High / Medium / Low
   - **Workaround**: If any
   - **Fix planned**: Timeline or "Backlog"

### Design Limitations
1. **Limitation**: Description
   - **Impact**: Who/what is affected
   - **Future plan**: How it might be addressed

### Technical Debt
1. **Debt item**: Description
   - **Reason**: Why it exists
   - **Plan**: When/how to address

## Change History

### Version X.Y.Z (YYYY-MM-DD) - Current
**Changes:**
- Change 1: Description
- Change 2: Description

**Rationale:** Why these changes were made

**Migration:** Any data migration or breaking changes

### Version X.Y.Z-1 (YYYY-MM-DD)
**Changes:**
- Previous change 1
- Previous change 2

**Rationale:** Why these changes were made

### Version 1.0.0 (YYYY-MM-DD) - Initial Release
**Initial implementation**: Original design and launch

## Deviations from Design

### Intentional Changes
1. **Original design**: What was planned
   - **Actual implementation**: What was built instead
   - **Reason**: Why it changed
   - **Approved by**: Who approved the change

### Unintentional Drift
1. **Issue**: What drifted from design
   - **Impact**: Effect of the drift
   - **Plan**: How to address (refactor, update docs, accept)

## Maintenance

### Regular Maintenance Tasks
- Task 1: Frequency, owner, last performed
- Task 2: Frequency, owner, last performed

### Monitoring & Alerts
- Metric 1: Threshold, alert channel
- Metric 2: Threshold, alert channel

### Backup & Recovery
- **Backup frequency**: How often
- **Backup location**: Where
- **Recovery time objective** (RTO): Target time
- **Recovery point objective** (RPO): Target data loss

## Future Plans

### Planned Enhancements
1. **Enhancement**: Description
   - **Priority**: High / Medium / Low
   - **Effort**: Estimate
   - **Target**: Timeline

### Deprecation Plans
If applicable:
- **Deprecation date**: When
- **Replacement**: What replaces this
- **Migration path**: How users/systems will transition

## Verification Commands

### How to Verify This Document is Current

```bash
# Check database schema
# (Use Supabase MCP tools)

# Check API endpoints
curl -X GET http://localhost:4000/api/endpoint

# Run tests
npm test

# Check build
npm run build
```

### Last Verification
- **Date**: YYYY-MM-DD
- **Verified by**: Name
- **Result**: All checks passed / Issues found: [list]

## Related Documentation

### Design Documents
- [Original design](docs/system/design/phase-X.Y-topic.md)
- [Updated design](docs/system/design/phase-X.Z-topic.md)

### User Documentation
- [User guide](docs/features/FEATURE-NAME.md)
- [API reference](docs/api/REST-API.md)

### Internal Documentation
- [Architecture overview](docs/architecture/ARCHITECTURE-NAME.md)
- [INDEX document](docs/system/execution/INDEX-feature-name.md)

## Glossary

Define any domain-specific terms or acronyms used in this document:
- **Term 1**: Definition
- **Term 2**: Definition
