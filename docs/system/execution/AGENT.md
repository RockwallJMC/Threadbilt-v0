# AGENT.md - Execution

**Purpose**: Governance rules for execution documentation

**Last Updated**: 2026-02-03

---

## Directory Purpose

Implementation logs, progress tracking, and verification evidence

## File Naming Conventions

### Format

```
execution-{feature|phase}-{topic}.md
```

### Examples

- `execution-phase1.1-crm-schema.md`
- `execution-authentication-flow.md`
- `execution-database-design.md`

### Rules

- **Prefix**: All files must start with `execution-`
- **Separator**: Use dashes (-) not underscores (_)
- **Case**: All lowercase
- **Descriptive**: Clear, concise topic names

## Required Frontmatter

All files in this directory must include YAML frontmatter:

```yaml
---
type: "execution"
status: "planned" | "in-progress" | "complete" | "blocked"
version: "X.Y"
created: "YYYY-MM-DD"
updated: "YYYY-MM-DD"
---
```

## Cross-Referencing Standards

Files in this directory should link to:
- Parent INDEX file (if part of feature)
- Related design/execution documents
- As-built documentation (for current state)
- External resources when relevant

**Link Format**:
```markdown
See [Document Name](../path/to/document.md)
```

## Quality Standards

- **Evidence-based**: Include verification command output
- **Code references**: Use file:line format (e.g., `src/file.ts:42`)
- **Version control**: Update `updated` field on every change
- **Status tracking**: Keep status current

## Common Mistakes to Avoid

❌ Missing prefix in filename
✅ Always start with `execution-`

❌ Using spaces or underscores
✅ Use dashes for separation

❌ Missing frontmatter
✅ Include all required fields

❌ Broken cross-references
✅ Test all links before committing

---

**Maintained by**: Documentation Guardian
**Auto-generated**: 2026-02-03
