# Frontend Agent Skill-Based Refactor Design

**Date:** 2026-01-30
**Type:** Architecture Refactor
**Status:** Approved
**Target:** `.claude/agents/react-mui-frontend-engineer.md`

## Problem Statement

The react-mui-frontend-engineer agent file has grown to 900+ lines, causing:

1. **Maintainability issues** - Hard to update/modify, changes are error-prone
2. **Agent comprehension issues** - Agent gets overwhelmed with too many instructions at once
3. **Best practices non-compliance** - Claude Code docs recommend shorter, focused agent files

## Solution: Skill-Based Pattern Library

Split the monolithic agent into a core orchestration file plus focused pattern skills.

---

## Architecture & File Structure

### New Skill Structure

```
.claude/skills/frontend-patterns/
├── SKILL.md                    # Main router skill
├── paper-rules.md              # Paper background={1} patterns
├── grid-selection.md           # Grid pattern decision matrix
├── page-templates.md           # 5 standard templates
├── error-prevention.md         # 13 common mistakes
└── resources.md                # MUI docs, icons, theme info
```

### Slimmed Agent File

```
.claude/agents/react-mui-frontend-engineer.md
├── Core workflow (~250 lines)
│   ├── ALWAYS ASK FIRST (mandatory)
│   ├── Duplicate-first strategy
│   ├── Skills integration workflow
│   └── When to invoke which pattern skill
├── Technical basics (~50 lines)
│   ├── MUI v7 syntax examples (brief)
│   ├── Import patterns
│   └── Component locations
└── Quality standards (~50 lines)
    ├── Accessibility
    ├── TypeScript requirements
    └── Verification checklist
```

**Result:** Agent reduces from 900 lines → ~350 lines

---

## Content Distribution

### Core Agent File

Contains the essential workflow and when to invoke skills:

**MANDATORY: ALWAYS ASK FIRST**
- Brief explanation + question format
- No detailed examples, just the rule

**Duplicate-First Strategy**
1. ALWAYS ASK FIRST
2. Search and document findings
3. **INVOKE frontend-patterns skill** for detailed patterns
4. Identify pattern category
5. Implement with verification

**When to Invoke Pattern Skills**
- Creating Paper components → invoke `frontend-patterns:paper-rules`
- Creating grid layouts → invoke `frontend-patterns:grid-selection`
- Creating new page → invoke `frontend-patterns:page-templates`
- Before claiming complete → invoke `frontend-patterns:error-prevention`
- Need resources → invoke `frontend-patterns:resources`

### Pattern Skills (Detailed Examples Externalized)

Each skill file is focused and self-contained:

**`paper-rules.md`** (~150 lines)
- USE background={1} when... (with code examples)
- DON'T USE when... (with code examples)
- Quick decision tree
- Edge cases

**`grid-selection.md`** (~200 lines)
- Pattern 1: MUI Grid (with examples)
- Pattern 2: CSS Grid (with examples)
- Pattern 3: Stack (with examples)
- Decision matrix
- Common mistakes

**`page-templates.md`** (~250 lines)
- Template 1-5 with full code examples
- When to use each
- Key features

**`error-prevention.md`** (~200 lines)
- 13 mistakes with before/after examples
- Quick reference checklist

**`resources.md`** (~100 lines)
- mui-doc.txt usage
- MUI MCP server
- Icon docs, theme docs

**Key Principle:** Agent file = workflow & orchestration. Skills = detailed patterns & examples.

---

## Skill Invocation Workflow

### Agent's Mental Model

```
1. User request received
2. ALWAYS ASK FIRST → confirm location
3. Search existing components
4. Identify what I'm building:
   - Has Paper? → invoke paper-rules
   - Has Grid/layout? → invoke grid-selection
   - New page? → invoke page-templates
   - Multiple concerns? → invoke multiple skills
5. Implement following skill guidance
6. Before completion → invoke error-prevention
```

### Invocation Points in Agent

```markdown
## Step 2: Determine Layout Pattern

Before implementing the layout, invoke the appropriate pattern skill:

**If creating paper components:**
```
Skill tool with skill: "frontend-patterns:paper-rules"
```

**If creating grid layouts:**
```
Skill tool with skill: "frontend-patterns:grid-selection"
```

**If creating new page:**
```
Skill tool with skill: "frontend-patterns:page-templates"
```

## Step 5: Verify Before Complete

**Always invoke error prevention:**
```
Skill tool with skill: "frontend-patterns:error-prevention"
```
```

### Router Skill (frontend-patterns/SKILL.md)

Acts as a hub that can direct to specific pattern skills:
- Agent can invoke just `frontend-patterns`
- Skill asks what pattern is needed
- Routes to appropriate sub-skill

**Benefit:** Agent doesn't need to memorize all 900 lines. It knows *when* to ask for help, then gets just the relevant pattern.

---

## Implementation Plan

### Phase 1: Create Pattern Skills (No Disruption)

```bash
# Create skill directory
mkdir -p .claude/skills/frontend-patterns

# Create skill files from existing agent content
1. Extract Paper section → frontend-patterns/paper-rules.md
2. Extract Grid section → frontend-patterns/grid-selection.md
3. Extract Templates section → frontend-patterns/page-templates.md
4. Extract Error Prevention → frontend-patterns/error-prevention.md
5. Extract Resources → frontend-patterns/resources.md
6. Create router → frontend-patterns/SKILL.md
```

**Extraction strategy:**
- Copy relevant sections from current agent file
- Add skill frontmatter (name, description)
- Ensure each skill is self-contained
- No cross-skill dependencies

### Phase 2: Create Slim Agent (Parallel to Existing)

```bash
# Create new slim agent file
cp .claude/agents/react-mui-frontend-engineer.md \
   .claude/agents/react-mui-frontend-engineer-slim.md

# Edit slim version:
- Keep workflow and orchestration (~250 lines)
- Add skill invocation points
- Remove detailed pattern examples
- Reference pattern skills instead
```

**Slim agent structure:**
1. Core operating principles (dev server, always ask first)
2. Duplicate-first strategy with skill invocation points
3. Brief MUI v7 syntax reminders
4. When to invoke which pattern skill
5. Quality standards (brief)
6. Verification checklist

### Phase 3: Test & Validate

**Test scenarios:**

1. **"Create a dashboard widget"**
   - Agent should invoke `paper-rules` skill
   - Should correctly apply background={1}
   - Should use responsive padding

2. **"Create a form page"**
   - Agent should invoke `page-templates` skill
   - Should identify Template 1 (Simple Form)
   - Should use Paper WITHOUT background prop

3. **"Create a card grid showing recent proposals"**
   - Agent should invoke `grid-selection` skill
   - Should identify MUI Grid Pattern 1
   - Should use size={{ xs: 12, sm: 6, md: 4 }}

4. **"Create a detail page with tabs"**
   - Agent should invoke `page-templates` skill
   - Should identify Template 2 (Detail with Sidebar)
   - Should invoke `paper-rules` for tab container
   - Should correctly apply background={1} to Paper with TabContext

**Validation checklist:**
- [ ] Agent asks before creating files
- [ ] Agent invokes correct skills at right moments
- [ ] Agent follows patterns from skills
- [ ] No regression in quality (Paper, Grid, Templates still correct)
- [ ] Faster to update individual patterns

### Phase 4: Cutover

```bash
# Backup old agent
mv .claude/agents/react-mui-frontend-engineer.md \
   .claude/agents/react-mui-frontend-engineer-legacy.md

# Promote slim agent
mv .claude/agents/react-mui-frontend-engineer-slim.md \
   .claude/agents/react-mui-frontend-engineer.md

# Commit changes
git add .claude/skills/frontend-patterns/
git add .claude/agents/
git commit -m "refactor: Split agent into skill-based pattern library

Reduces agent from 900 lines to 350 lines by externalizing
detailed patterns into focused skill files.

- Core agent: workflow and orchestration
- Pattern skills: detailed examples and decision trees
- Improves maintainability and agent comprehension

Skills created:
- frontend-patterns:paper-rules
- frontend-patterns:grid-selection
- frontend-patterns:page-templates
- frontend-patterns:error-prevention
- frontend-patterns:resources

See docs/plans/2026-01-30-frontend-agent-skill-refactor-design.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Rollback plan:**
- Keep `react-mui-frontend-engineer-legacy.md` for 1 sprint
- If issues arise, restore legacy file
- Remove legacy file after validation period

---

## Maintenance & Evolution

### Updating Patterns (Much Easier)

**Before (900-line file):**
```
Problem: Paper rule needs update
→ Open 900-line file
→ Find Paper section (scattered across multiple places)
→ Update examples
→ Risk breaking other sections
→ Full regression test needed
```

**After (skill-based):**
```
Problem: Paper rule needs update
→ Edit frontend-patterns/paper-rules.md (150 lines)
→ Update in one place
→ Test only Paper-related scenarios
→ Other patterns unaffected
```

### Version Control Benefits

**Clear, focused commits:**
```bash
git commit frontend-patterns/paper-rules.md \
  -m "Update Paper background rules for new widget pattern"
```

**Easy to review changes:**
```bash
git diff frontend-patterns/grid-selection.md
```

**Easy to revert specific pattern:**
```bash
git revert abc123  # Only reverts grid pattern change
```

### Skill Evolution Strategy

```markdown
frontend-patterns/
├── CHANGELOG.md          # Track pattern changes
├── SKILL.md             # Version: 1.0.0
├── paper-rules.md       # Version: 1.0.0
├── grid-selection.md    # Version: 1.0.0
└── ...

# When patterns change:
1. Update individual skill file
2. Increment version in frontmatter
3. Document in CHANGELOG.md
4. Agent always uses latest version
```

### Documentation Maintenance

**Update existing design doc:**
```markdown
docs/plans/2026-01-30-react-mui-frontend-engineer-agent-improvements.md
→ Add "Skill-Based Architecture" section
→ Update references to point to skills instead of agent sections
→ Link to individual pattern skills
```

**Keep CLAUDE.md in sync:**
```markdown
CLAUDE.md
→ Update agent description
→ Note skill-based architecture
→ Link to pattern skills documentation
```

---

## Success Metrics

### Maintainability
- ✅ Time to update a pattern: < 5 minutes (vs 20+ minutes before)
- ✅ Confidence in changes: High (isolated changes, clear scope)
- ✅ Risk of breaking other patterns: Low (no cross-contamination)

### Agent Comprehension
- ✅ Agent loads only relevant patterns when needed
- ✅ Reduced cognitive load (350 lines vs 900 lines)
- ✅ Clearer separation of workflow vs detailed patterns

### Best Practices Compliance
- ✅ Agent file within recommended size (~350 lines)
- ✅ Skills are focused and single-purpose
- ✅ Follows Claude Code skill architecture patterns

### Developer Experience
- ✅ Easy to find specific pattern (navigate to skill file)
- ✅ Easy to update pattern (edit one file)
- ✅ Clear version history per pattern
- ✅ Easy onboarding (read core workflow, skills on-demand)

---

## File Structure Reference

### Before (Monolithic)

```
.claude/agents/
└── react-mui-frontend-engineer.md (900 lines)
    ├── Core workflow
    ├── Paper patterns (detailed)
    ├── Grid patterns (detailed)
    ├── Page templates (detailed)
    ├── Error prevention (detailed)
    ├── Resources (detailed)
    └── Everything mixed together
```

### After (Modular)

```
.claude/agents/
└── react-mui-frontend-engineer.md (350 lines)
    ├── Core workflow
    ├── When to invoke skills
    └── Brief technical reminders

.claude/skills/frontend-patterns/
├── SKILL.md (router)
├── paper-rules.md (150 lines)
├── grid-selection.md (200 lines)
├── page-templates.md (250 lines)
├── error-prevention.md (200 lines)
├── resources.md (100 lines)
└── CHANGELOG.md
```

---

## Appendix A: Skill Frontmatter Template

Each pattern skill should use this frontmatter:

```yaml
---
name: frontend-patterns:pattern-name
description: "Brief description of what this pattern covers"
version: "1.0.0"
tags: ["frontend", "mui", "react", "patterns"]
related_skills: ["skill1", "skill2"]
---
```

---

## Appendix B: Core Agent Invocation Template

Template for skill invocation points in core agent:

```markdown
## When to Use This Pattern

Before implementing [feature], invoke the pattern skill:

```
Skill tool with skill: "frontend-patterns:pattern-name"
```

The skill will provide:
- Decision tree for [specific choice]
- Code examples
- Common mistakes to avoid

After following the skill guidance, proceed with implementation.
```

---

## Related Documents

- Original improvement design: [2026-01-30-react-mui-frontend-engineer-agent-improvements.md](2026-01-30-react-mui-frontend-engineer-agent-improvements.md)
- Current agent file: [.claude/agents/react-mui-frontend-engineer.md](../../.claude/agents/react-mui-frontend-engineer.md)
- Claude Code agent best practices: (reference Claude Code docs)

---

**End of Design Document**
