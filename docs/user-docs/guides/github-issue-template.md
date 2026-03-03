# GitHub Issue Template (DEPRECATED)

**IMPORTANT: This template is superseded by the `/github-workflow` skill.**

## Use the GitHub Workflow Skill

For the most current and complete GitHub issue/PR templates and workflows, use:

```bash
Skill tool with skill: "github-workflow"
```

**Or see:** `.claude/skills/github-workflow/SKILL.md`

## Why Use the Skill?

The github-workflow skill contains:

- Complete issue creation templates
- Task-level PR templates
- Progress update templates (with agent identification)
- Screenshot upload workflow for Playwright tests
- All GitHub coordination workflows in one place
- Mandatory agent identification requirements

## Key Requirements

All GitHub issue creation must:

- **Include agent identification**: `**Agent**: {agent-name}`
- **Follow templates exactly** (rigid skill)
- **Always work from GitHub issue number/title**

## Quick Reference

```bash
# Invoke the skill before any GitHub operation
Skill tool with skill: "github-workflow"

# The skill contains templates for:
# 1. GitHub Issue Creation (Feature Kickoff)
# 2. Progress Updates (7 mandatory checkpoints)
# 3. Task-Level PRs (MANDATORY after every task)
# 4. Feature Completion & Issue Closure
# 5. Agent Identification (always required)
```

---

**Last Updated**: 2026-01-30
**Status**: DEPRECATED - Use github-workflow skill instead
