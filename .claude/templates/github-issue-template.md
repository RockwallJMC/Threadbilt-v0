# GitHub Issue Template

Use this template when creating GitHub issues after plan approval using `gh issue create`.

## Command

```bash
gh issue create \
  --title "Feature: {Feature Name}" \
  --body "$(cat <<'EOF'
## Overview
{Brief description of what this feature accomplishes and its business value}

## Documentation
- INDEX: [_sys_documents/execution/INDEX-{feature}.md](_sys_documents/execution/INDEX-{feature}.md)
- Design docs: Listed in INDEX Phase Breakdown

## Phases
- [ ] Phase 1.1: {Phase name and description}
- [ ] Phase 1.2: {Phase name and description}
- [ ] Phase 1.3: {Phase name and description}

## Branch
`feature/desk-{feature-name}`

## Verification Checklist
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Linting clean
- [ ] E2E tests complete with screenshots
- [ ] Documentation updated

---
🤖 Created by Claude Code
EOF
)"
```

## Template Variables

Replace these placeholders with actual values:

- `{Feature Name}` - Short, descriptive feature name (e.g., "User Profile Management")
- `{Brief description...}` - 1-2 sentence overview from INDEX
- `{feature}` - Kebab-case feature identifier (e.g., "user-profile")
- `{Phase name and description}` - Phase title from INDEX (e.g., "Database Schema - User profiles table")

## Example

```bash
gh issue create \
  --title "Feature: User Profile Management" \
  --body "$(cat <<'EOF'
## Overview
Implements comprehensive user profile management including avatar uploads, settings, and preferences for authenticated users.

## Documentation
- INDEX: [_sys_documents/execution/INDEX-user-profile.md](_sys_documents/execution/INDEX-user-profile.md)
- Design docs: Listed in INDEX Phase Breakdown

## Phases
- [ ] Phase 1.1: Database schema - user_profiles table with RLS
- [ ] Phase 1.2: Profile UI components - form, avatar, settings
- [ ] Phase 1.3: API integration - CRUD endpoints for profiles

## Branch
`feature/desk-user-profile`

## Verification Checklist
- [ ] All tests passing
- [ ] Build succeeds
- [ ] Linting clean
- [ ] E2E tests complete with screenshots
- [ ] Documentation updated

---
🤖 Created by Claude Code
EOF
)"
```

## Workflow Integration

This template is used in:
1. **Step 1.5** of Feature Documentation Workflow (CLAUDE.md)
2. **GitHub Integration** section of Phase 1 (DOCUMENTATION-GUIDE.md)
3. After plan approval, before implementation starts

## Follow-up Actions

After creating the issue:
1. Update INDEX frontmatter with `github_issue: "#{number}"`
2. Commit and push INDEX update
3. Post kickoff comment:
   ```bash
   gh issue comment {issue-number} --body "🚀 Feature branch created and INDEX updated. Starting implementation..."
   ```
