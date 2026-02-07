# AGENT.md - Features

**Purpose**: Governance rules for features documentation

**Last Updated**: 2026-02-07

---

## Directory Purpose

User-facing feature guides and capabilities documentation

## File Naming Conventions

### Format

```
{topic}-{subtopic}.md
```

### Examples

- `getting-started.md`
- `managing-contacts.md`
- `creating-opportunities.md`

### Rules

- **No prefixes**: User-friendly names only
- **Separator**: Use dashes (-) not underscores (_)
- **Case**: All lowercase
- **Task-oriented**: Name files by user tasks

## Writing Style

- **Audience**: End users and developers (non-technical)
- **Tone**: Clear, friendly, helpful
- **Structure**: Step-by-step instructions with examples
- **Jargon**: Avoid or explain technical terms

## Content Structure

### Required Sections

1. **Title**: Clear, descriptive heading
2. **Overview**: Brief introduction (1-2 paragraphs)
3. **Prerequisites**: What users need before starting
4. **Steps**: Numbered, actionable instructions
5. **Examples**: Code samples or screenshots
6. **Related**: Links to related documentation

### Optional Sections

- Troubleshooting
- FAQs
- Advanced topics
- Next steps

## Screenshots

- **Format**: PNG or JPG
- **Location**: `screenshots/` subdirectory
- **Naming**: Descriptive names (e.g., `login-form.png`)
- **Alt text**: Always include for accessibility
- **Currency**: Update when UI changes

## Cross-Referencing

Link to:
- Related user guides
- API documentation (if applicable)
- System architecture docs (for context)

**Link Format**:
```markdown
See [Guide Name](./other-guide.md)
```

## Quality Standards

- **Clear**: Simple language, no jargon
- **Complete**: All necessary context included
- **Tested**: All steps verified to work
- **Visual**: Screenshots for complex steps
- **Current**: Updated with code changes

## Common Mistakes to Avoid

❌ Technical prefixes in filenames
✅ User-friendly, task-oriented names

❌ Assuming technical knowledge
✅ Explain concepts clearly

❌ Missing screenshots
✅ Visual aids for complex steps

❌ Outdated content
✅ Update docs with code changes

---

**Maintained by**: Documentation Guardian
**Auto-generated**: 2026-02-07
