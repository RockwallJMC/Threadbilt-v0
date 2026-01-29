# AGENT.md - User-Facing Documentation Guide

**Purpose**: This file provides guidance for Claude Code agents working in the `docs/` directory, which contains user-facing documentation for PierceDesk.

**Last Updated**: 2026-01-29

---

## Documentation Philosophy

The `docs/` directory contains **USER-FACING DOCUMENTATION** - content written for:
- End users of PierceDesk
- Developers integrating with PierceDesk
- System administrators
- Stakeholders and decision-makers

**Key Principle**: Documentation here must be **clear, current, and discoverable**.

---

## Directory Structure

```
docs/
├── README.md                  # Navigation hub (update when adding directories)
├── architecture/              # System design and technical architecture
├── authentication/            # Auth setup and configuration
├── features/                  # Feature guides (user-focused)
├── api/                       # API reference documentation
├── quality/                   # QA, security, performance docs
├── guides/                    # How-to guides and workflows
├── testing/                   # Testing documentation
├── user-journeys/             # Role-based user scenarios
└── plans/                     # Implementation plans (YYYY-MM-DD format)
```

**Rule**: NEVER create markdown files at `docs/` root level (except README.md). Always place in appropriate subdirectory.

---

## File Naming Conventions

### Feature Documentation (`docs/features/`)
```
FEATURE-NAME.md           # Main feature guide (e.g., CRM-DESK.md)
COMPONENT-NAME.md         # Component-specific guide (e.g., ACCOUNTS-CONTACTS.md)
```

**Format**: UPPERCASE-WITH-DASHES.md
**Examples**:
- `CRM-DESK.md`
- `ACCOUNTS-CONTACTS.md`
- `OPPORTUNITY-PIPELINE.md`

### API Documentation (`docs/api/`)
```
REST-API.md               # Main API reference
RESOURCE-API.md           # Resource-specific API (e.g., LEADS-API.md)
```

**Format**: UPPERCASE-WITH-DASHES.md, ends with `-API.md`
**Examples**:
- `REST-API.md`
- `LEADS-API.md`
- `OPPORTUNITIES-API.md`

### Implementation Plans (`docs/plans/`)
```
YYYY-MM-DD-description.md
```

**Format**: ISO date prefix, lowercase-with-dashes description
**Examples**:
- `2026-01-29-phase1.2-complete-integration.md`
- `2026-01-29-documentation-compliance-remediation.md`

### Architecture Documents (`docs/architecture/`)
```
TOPIC-ARCHITECTURE.md
```

**Format**: UPPERCASE topic, ends with `-ARCHITECTURE.md`
**Examples**:
- `DESK-ARCHITECTURE.md`
- `DATABASE-ARCHITECTURE.md`

### Quality Documents (`docs/quality/`)
```
TOPIC-TYPE.md
```

**Format**: UPPERCASE-WITH-DASHES.md
**Examples**:
- `SECURITY-AUDIT.md`
- `PERFORMANCE-BENCHMARKS.md`
- `RLS-VERIFICATION-GUIDE.md`

---

## Cross-Referencing Standards

### Linking to Internal Documentation

**Same Directory**:
```markdown
See [Feature Name](FEATURE-NAME.md)
```

**Different Directory in docs/**:
```markdown
See [Architecture Guide](../architecture/DESK-ARCHITECTURE.md)
See [API Reference](../api/REST-API.md)
```

**Link to _sys_documents/** (internal tracking):
```markdown
See [As-Built Documentation](../_sys_documents/as-builts/feature-as-built.md)
See [INDEX Document](../_sys_documents/execution/INDEX-feature.md)
```

**Link to Code**:
```markdown
See implementation: [`src/components/Feature.tsx:42`](../src/components/Feature.tsx#L42)
```

### Required Cross-References

**Every feature guide MUST link to**:
- Related API documentation (`docs/api/`)
- Architecture documentation (`docs/architecture/`)
- User journeys if applicable (`docs/user-journeys/`)

**Every API guide MUST link to**:
- Feature documentation (`docs/features/`)
- Authentication documentation (`docs/authentication/`)
- Database schema as-built (`_sys_documents/as-builts/database-schema-as-built.md`)

---

## Document Templates and Structure

### Feature Guide Template

```markdown
# Feature Name - Feature Guide

## Overview
[Brief description of what this feature does]

## Key Features
### 1. Feature Component
- Capability 1
- Capability 2

**Learn More**: [Detailed Guide](COMPONENT-NAME.md)

## User Journeys
See role-based guides:
- [Role 1 Journey](../user-journeys/role-name.md)

## Getting Started
[Step-by-step getting started instructions]

## Screenshots
![Description](screenshots/image.png)

## API Reference
See [API Documentation](../api/RESOURCE-API.md)

## Architecture
See [Architecture Guide](../architecture/TOPIC-ARCHITECTURE.md)
```

### API Reference Template

```markdown
# Resource API Reference

## Base URL
```
http://localhost:4000/api
```

## Authentication
[Auth requirements - link to docs/authentication/]

## Endpoints

### GET /api/resource
[Endpoint documentation]

**Query Parameters**:
- `param` (type, optional) - Description

**Response**:
```json
{
  "data": [...],
  "total": 42
}
```

**Status Codes**: 200, 400, 401, 404, 500

## Error Handling
[Error response format]

## Related Documentation
- [Feature Guide](../features/FEATURE-NAME.md)
- [Database Schema](../../_sys_documents/as-builts/database-schema-as-built.md)
```

---

## README Files

**Every subdirectory MUST have a README.md** with:
1. Brief description of directory purpose
2. List of contained documents
3. Links to related documentation
4. Clear navigation

**Update parent README.md** when creating new subdirectories.

---

## Creating New Documentation

### Checklist Before Creating

1. **Choose Correct Directory**
   - [ ] Feature guide → `docs/features/`
   - [ ] API reference → `docs/api/`
   - [ ] Architecture → `docs/architecture/`
   - [ ] Implementation plan → `docs/plans/`
   - [ ] Quality/audit → `docs/quality/`

2. **Follow Naming Convention**
   - [ ] Correct format for directory
   - [ ] Consistent with existing files
   - [ ] Descriptive and clear

3. **Add Cross-References**
   - [ ] Link to related documentation
   - [ ] Update parent README.md
   - [ ] Add to main docs/README.md if major

4. **Verify Links Work**
   - [ ] Test all relative paths
   - [ ] Ensure no broken links

---

## Updating Existing Documentation

### When to Update

- **Feature changes**: Update feature guides immediately
- **API changes**: Update API reference with breaking changes
- **Architecture changes**: Update architecture docs within same PR
- **Screenshots**: Update when UI changes significantly

### Version History

Add update notes to bottom of document:

```markdown
---

**Last Updated**: 2026-01-29
**Changes**:
- Updated endpoint documentation for new parameters
- Added screenshots for new UI
- Fixed broken links to architecture docs
```

---

## Quality Standards

### Writing Style

- **Clear and concise**: No jargon without explanation
- **Action-oriented**: Use imperative mood ("Click the button", not "The button can be clicked")
- **Scannable**: Use headers, lists, and code blocks
- **Complete**: Include all necessary context

### Code Examples

- **Always test code examples** before documenting
- **Use real, working code** (not pseudocode unless explicitly noted)
- **Show both request and response** for API examples
- **Include error cases** and edge cases

### Screenshots

- **Name descriptively**: `feature-list-view.png`, not `screenshot1.png`
- **Store in `screenshots/` subdirectory** within each section
- **Keep current**: Update when UI changes
- **Use alt text**: Always include descriptive alt text

---

## Relationship to _sys_documents/

**docs/** (this directory) is for **USER-FACING** content.
**_sys_documents/** is for **INTERNAL TRACKING**.

**Flow**:
1. Planning happens in `_sys_documents/` (INDEX, design, execution docs)
2. Implementation creates code
3. **User-facing docs** created in `docs/` after merge
4. **As-built docs** created in `_sys_documents/as-builts/` to reflect deployed state

**Reference Pattern**:
- User docs can link to as-builts for technical details
- As-builts should link to user docs for context
- Never duplicate content - link instead

---

## Common Mistakes to Avoid

❌ **Creating files at docs/ root** (except README.md)
✅ Place in appropriate subdirectory

❌ **Inconsistent naming** (mixing lowercase/uppercase, different formats)
✅ Follow directory-specific naming convention

❌ **Broken relative links** (wrong path depth, missing files)
✅ Test all links before committing

❌ **Outdated screenshots** (showing old UI)
✅ Update screenshots when UI changes

❌ **Missing cross-references** (documents in isolation)
✅ Link to related documentation

❌ **Duplicate content** (same info in multiple places)
✅ Single source of truth, link to it

---

## Verification Commands

### Before Committing Documentation

```bash
# Check for root-level files (should only be README.md)
find docs/ -maxdepth 1 -name "*.md" ! -name "README.md"

# Verify all README files exist
test -f docs/features/README.md && echo "✅ features README exists"
test -f docs/api/README.md && echo "✅ api README exists"
test -f docs/quality/README.md && echo "✅ quality README exists"

# Check for broken markdown links (requires markdown-link-check)
# npm install -g markdown-link-check
find docs/ -name "*.md" -exec markdown-link-check {} \;
```

---

## Help and Resources

**Framework Documentation**: [docs/guides/DOCUMENTATION-GUIDE.md](guides/DOCUMENTATION-GUIDE.md)
**Compliance Audit**: [_sys_documents/execution/DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md](../_sys_documents/execution/DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md)
**Implementation Plan**: [docs/plans/2026-01-29-documentation-compliance-remediation.md](plans/2026-01-29-documentation-compliance-remediation.md)

**Questions**: Refer to main repository [CLAUDE.md](../CLAUDE.md) for complete development workflow.

---

**Agent Responsibilities**:
- Follow naming conventions strictly
- Update README files when adding content
- Add cross-references to related documentation
- Keep content current with code changes
- Test all links before committing
- Write for the user, not for developers (unless in technical architecture docs)

**Quality Gate**: Before committing, ask yourself:
1. Is this in the right directory?
2. Does the filename follow conventions?
3. Are all cross-references present?
4. Are screenshots current?
5. Is the parent README updated?

If all YES → commit. If any NO → fix first.
