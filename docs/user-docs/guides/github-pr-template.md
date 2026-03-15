# GitHub PR Template (DEPRECATED)

**IMPORTANT: This template is superseded by the `/github-workflow` skill.**

## Use the GitHub Workflow Skill

For the most current and complete GitHub issue/PR templates and workflows, use:

```bash
Skill tool with skill: "github-workflow"
```

**Or see:** `.claude/skills/github-workflow/SKILL.md`

## Why Use the Skill?

The github-workflow skill contains:
- Complete task-level PR templates
- Progress update templates
- Feature completion PR templates
- Agent identification requirements
- PR-to-issue linking workflows
- All GitHub coordination workflows in one place

## Key Requirements

All GitHub PRs must:
- **Include agent identification**: `**Agent**: {agent-name}`
- **Be created after EVERY task completion** (not just phases)
- **Follow templates exactly** (rigid skill)
- **Link to GitHub issue** with `gh issue comment`
- **Include verification evidence** (build, lint, tests)

## Quick Reference

```bash
# Invoke the skill before creating PRs
Skill tool with skill: "github-workflow"

# The skill contains:
# 1. Task-Level PR Creation (MANDATORY after every task)
# 2. PR Body Template with verification evidence
# 3. PR-to-Issue Linking
# 4. Post-Merge Workflow
# 5. Agent Identification (always required)
```

---

**Last Updated**: 2026-01-30
**Status**: DEPRECATED - Use github-workflow skill instead
