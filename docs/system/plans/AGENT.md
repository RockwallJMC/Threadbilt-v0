# AGENT.md - Plans

**Purpose**: Governance rules for plans documentation

**Last Updated**: 2026-02-02

---

## Directory Purpose

Detailed implementation plans with step-by-step instructions

## File Naming Conventions

### Format

```
plans-{feature|phase}-{topic}.md
```

### Examples

- `plans-phase1.1-crm-schema.md`
- `plans-authentication-flow.md`
- `plans-database-design.md`

### Rules

- **Prefix**: All files must start with `plans-`
- **Separator**: Use dashes (-) not underscores (_)
- **Case**: All lowercase
- **Descriptive**: Clear, concise topic names

## Required Frontmatter

All files in this directory must include YAML frontmatter:

```yaml
---
type: "plans"
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
✅ Always start with `plans-`

❌ Using spaces or underscores
✅ Use dashes for separation

❌ Missing frontmatter
✅ Include all required fields

❌ Broken cross-references
✅ Test all links before committing

---

**Maintained by**: Documentation Guardian
**Auto-generated**: 2026-02-02
