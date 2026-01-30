# PierceDesk Implementation Framework Review Guide

## Purpose

This document provides a step-by-step guide for reviewing the PierceDesk implementation framework, including CLAUDE.md, sub-agents, skills, documentation workflows, and templates.

**Created:** 2026-01-29
**Status:** Active Reference Guide
**Audience:** Development team, stakeholders, new contributors

---

## Overview of the Framework

The PierceDesk implementation framework consists of four interconnected systems:

1. **CLAUDE.md Configuration** - Project-level instructions for Claude Code
2. **Skills Framework** - Mandatory quality checkpoints and workflows
3. **Sub-Agent System** - Specialized agents for execution work (via Task tool)
4. **Documentation Workflow** - Feature tracking from planning to deployment

---

## Part 1: CLAUDE.md Configuration Review

### Location
- **File:** `/home/pierce/piercedesk6/CLAUDE.md`
- **Purpose:** Primary configuration for Claude Code Agent SDK
- **Status:** Active (loaded when Agent SDK enables settings sources)

### Key Sections to Review

#### 1.1 Mandatory Execution Framework (Lines 81-237)

**What to verify:**
- [ ] Skills are marked as MANDATORY (not optional)
- [ ] Sub-agents are required via Task tool (not direct execution)
- [ ] Verification requires evidence (command outputs)
- [ ] Standard workflow is clearly defined

**Critical requirements:**
```
1. Invoke relevant SKILL first
2. Use TodoWrite to TRACK tasks
3. Use Task tool to EXECUTE tasks via sub-agents
4. Mark todos complete ONLY after agent finishes
5. Invoke VERIFY-BEFORE-COMPLETE before claiming done
6. Show command output evidence
```

**Review questions:**
- Are skills invoked before any action?
- Is Task tool used for all execution work?
- Is verification evidence-based (not assumptions)?

#### 1.2 Documentation Standards (Lines 241-551)

**What to verify:**
- [ ] Documentation structure (docs/ vs _sys_documents/)
- [ ] Feature documentation workflow (8 steps)
- [ ] Template locations and purposes
- [ ] Frontmatter standards (YAML, no filename suffixes)
- [ ] Quality gates before merge

**Key workflow steps:**
1. Create INDEX file (master tracking document)
2. Create GitHub issue + feature branch
3. Create phase design documents
4. Create phase execution documents
5. Update as-built documentation (after merge)
6. Update user-facing documentation

**Review questions:**
- Are INDEX files created for every feature?
- Are design docs created before implementation?
- Are as-builts updated after merge?
- Is documentation compliance verified before merge?

#### 1.3 Skills Framework (Lines 627-826)

**What to verify:**
- [ ] Skills are described as MANDATORY checkpoints
- [ ] TDD skill invoked before implementation
- [ ] VERIFY-BEFORE-COMPLETE invoked before completion claims
- [ ] software-architecture invoked for design decisions
- [ ] Skill invocation methods documented

**Available skills:**
- `/TDD` - Test-Driven Development (before implementation)
- `/VERIFY-BEFORE-COMPLETE` - Evidence-based verification (before completion)
- `/software-architecture` - Architecture decisions and code quality
- `/file-organizer` - File and folder organization

**Review questions:**
- Are skills invoked at correct checkpoints?
- Is TDD red-green-refactor cycle followed?
- Is verification evidence captured and shown?

#### 1.4 Sub-Agent System (Lines 783-809)

**What to verify:**
- [ ] Task tool usage for ALL execution work
- [ ] Correct agent selection for each task type
- [ ] Parallel execution for independent tasks
- [ ] TodoWrite used for tracking (not execution)

**Available sub-agents:**
| Agent | Purpose |
|-------|---------|
| `Explore` | Codebase exploration, pattern finding |
| `react-mui-frontend-engineer` | UI components, Aurora duplication, MUI |
| `wiring-agent` | API integration, SWR hooks, routing |
| `supabase-database-architect` | Schema, migrations, RLS (uses MCP tools) |
| `playwright-tester` | E2E tests, test debugging |
| `documentation-expert` | README, API docs, docstrings |
| `superpowers:code-reviewer` | Code review after feature completion |

**Review questions:**
- Is work delegated to specialized agents?
- Are independent tasks run in parallel?
- Is database work using Supabase MCP tools (cloud database)?

---

## Part 2: Skills Framework Review

### Location
- **Directory:** `.claude/skills/`
- **Status:** Active (loaded by Claude Code)

### Skills to Review

#### 2.1 TDD Skill
- **Location:** `.claude/skills/TDD/SKILL.md`
- **Command:** `/TDD` or `Skill("TDD")`
- **Purpose:** Test-Driven Development workflow

**What to verify:**
- [ ] Red-Green-Refactor cycle enforced
- [ ] Test written BEFORE implementation
- [ ] Test failure verified before implementation
- [ ] Anti-patterns documented

**Review questions:**
- Is test written first?
- Is test failure observed before implementation?
- Is implementation minimal to pass test?
- Are anti-patterns avoided?

#### 2.2 VERIFY-BEFORE-COMPLETE Skill
- **Location:** `.claude/skills/VERIFY-BEFORE-COMPLETE/SKILL.md`
- **Command:** `/verify` or `Skill("VERIFY-BEFORE-COMPLETE")`
- **Purpose:** Evidence-based verification

**What to verify:**
- [ ] Verification commands run before completion claims
- [ ] Command outputs captured and shown
- [ ] No "should", "probably", "seems to" language
- [ ] Fresh evidence required (not cached)

**Review questions:**
- Are verification commands run?
- Is output shown (not summarized)?
- Is evidence fresh (not from previous runs)?

#### 2.3 software-architecture Skill
- **Location:** `.claude/skills/software-architecture/SKILL.md`
- **Command:** `/software-architecture` or `Skill("software-architecture")`
- **Purpose:** Code quality and architecture guidance

**What to verify:**
- [ ] Clean Architecture principles applied
- [ ] Library-first approach (npm before custom code)
- [ ] Domain-specific naming (no generic "utils")
- [ ] Separation of concerns

**Review questions:**
- Are existing libraries checked before writing custom code?
- Are names domain-specific and meaningful?
- Is business logic separated from UI?

#### 2.4 using-superpowers Skill
- **Location:** `.claude/skills/using-superpowers/SKILL.md`
- **Purpose:** Meta-skill for skill invocation

**What to verify:**
- [ ] Invoked at start of conversations
- [ ] Establishes workflow foundation
- [ ] Explains when/how to invoke skills

**Review questions:**
- Is this skill invoked first?
- Does it guide subsequent skill usage?

---

## Part 3: Sub-Agent System Review

### How Sub-Agents Work

**Invocation method:**
```javascript
Task(agent_type, "Task description")
```

**Parallel execution:**
```javascript
// Single message with multiple Task calls
Task(Explore, "Find authentication patterns")
Task(react-mui-frontend-engineer, "Build login UI")
Task(playwright-tester, "Create login tests")
```

### Agent Responsibilities

#### 3.1 Explore Agent
- **Purpose:** Codebase exploration, architecture understanding
- **Thoroughness levels:** quick, medium, very thorough
- **Use when:** Need to find patterns, understand structure

**Review questions:**
- Is Explore agent used for complex searches?
- Is thoroughness level specified?
- Are results used to inform implementation?

#### 3.2 react-mui-frontend-engineer Agent
- **Purpose:** UI component creation, Aurora duplication
- **Use when:** Building UI components, pages, forms

**Review questions:**
- Is Aurora template searched first?
- Is copy-then-modify pattern followed?
- Is MUI v7 syntax used (Grid with `size` prop)?

#### 3.3 wiring-agent Agent
- **Purpose:** API integration, SWR hooks, routing
- **Use when:** Connecting UI to backend, implementing data fetching

**Review questions:**
- Are SWR hooks used for data fetching?
- Is authentication flow implemented correctly?
- Are routes registered in sitemap?

#### 3.4 supabase-database-architect Agent
- **Purpose:** Schema design, migrations, RLS policies
- **CRITICAL:** Always uses Supabase MCP tools (cloud database)
- **Use when:** Any database work

**Review questions:**
- Is Supabase MCP tools used (never local psql)?
- Are RLS policies created for multi-tenancy?
- Are migrations tracked in Supabase?

#### 3.5 playwright-tester Agent
- **Purpose:** E2E test creation, debugging, maintenance
- **Use when:** Creating or updating tests

**Review questions:**
- Are tests using TypeScript?
- Is page object model followed?
- Are data-testid attributes used?

#### 3.6 documentation-expert Agent
- **Purpose:** README updates, API docs, user guides
- **Use when:** Generating user-facing documentation

**Review questions:**
- Is documentation clear and jargon-free?
- Are code examples included?
- Are screenshots embedded?

#### 3.7 superpowers:code-reviewer Agent
- **Purpose:** Code review after major feature completion
- **Use when:** Feature phase complete, before PR

**Review questions:**
- Is code review invoked before PR?
- Are findings addressed or documented?
- Is verification re-run after fixes?

---

## Part 4: Documentation Workflow Review

### Documentation Structure

**Two-tier system:**
```
piercedesk6/
├── docs/                      # USER-FACING
│   ├── architecture/
│   ├── features/
│   ├── guides/
│   └── api/
│
└── _sys_documents/            # INTERNAL TRACKING
    ├── AGENT.md               # Organization rules
    ├── vision/
    ├── roadmap/
    ├── design/                # Phase design docs
    ├── execution/             # INDEX + execution logs
    └── as-builts/             # Current state docs
```

### 4.1 INDEX File (Master Tracking Document)

**Location:** `_sys_documents/execution/INDEX-{feature-name}.md`
**Purpose:** Single source of truth for feature progress

**What to verify:**
- [ ] One INDEX per feature
- [ ] YAML frontmatter complete
- [ ] All phases listed with status
- [ ] Blockers documented
- [ ] Verification checklist included
- [ ] GitHub issue + branch linked

**Frontmatter fields:**
```yaml
---
feature: 'Feature Name - Description'
github_issue: '#123'
feature_branch: 'feature/desk-name'
pr_number: '#456'
status: 'planned' | 'in-progress' | 'complete' | 'blocked' | 'merged'
started: 'YYYY-MM-DD'
target_completion: 'YYYY-MM-DD'
team: ['claude', 'user']
impact_level: 'deep' | 'shallow'
---
```

**Review questions:**
- Is INDEX created at feature start?
- Is INDEX updated continuously?
- Are all phases tracked?
- Is verification evidence captured?

### 4.2 Phase Design Documents

**Location:** `_sys_documents/design/phase{X.Y}-{topic}-design.md`
**Purpose:** Technical approach and architecture

**What to verify:**
- [ ] One design doc per major phase
- [ ] Architecture decisions documented
- [ ] Component breakdown included
- [ ] Dependencies and risks listed
- [ ] Verification plan defined

**Frontmatter fields:**
```yaml
---
phase: '1.1'
title: 'Database Schema - CRM Tables'
type: 'design'
status: 'planned' | 'in-progress' | 'complete'
version: '1.0'
complexity: 'low' | 'medium' | 'high'
impact: 'shallow' | 'deep'
verification:
  - 'Schema deployed via Supabase MCP'
  - 'RLS policies tested'
---
```

**Review questions:**
- Is design doc created before implementation?
- Are design decisions explained with rationale?
- Is verification plan clear?

### 4.3 Phase Execution Documents

**Location:** `_sys_documents/execution/phase{X.Y}-{topic}.md`
**Purpose:** Implementation log with daily/weekly updates

**What to verify:**
- [ ] Dated entries with code references
- [ ] Progress percentage tracked
- [ ] Technical notes and challenges documented
- [ ] Verification evidence included

**Frontmatter fields:**
```yaml
---
phase: '1.2'
title: 'Leads API Implementation'
type: 'execution'
status: 'in-progress'
version: '0.7'
assigned_agent: 'wiring-agent'
dependencies: ['phase1.1-db-schema']
progress_percentage: 70
---
```

**Review questions:**
- Is execution doc updated regularly?
- Are code references included (file:line)?
- Is verification evidence captured?

### 4.4 As-Built Documents

**Location:** `_sys_documents/as-builts/{feature}-as-built.md`
**Purpose:** Living document reflecting deployed state

**What to verify:**
- [ ] Reflects ACTUAL deployed state (not planned)
- [ ] Version incremented with changes
- [ ] Verification commands included
- [ ] Updated after every significant change

**Review questions:**
- Does as-built match deployed state?
- Are verification commands current?
- Is version incremented correctly?

### 4.5 GitHub Integration

**Issue Updates at Checkpoints:**

1. Phase start
2. Task completion (with verification evidence)
3. TDD checkpoint (after invoking /TDD skill)
4. Playwright completion (with screenshots)
5. **PR creation (MANDATORY AFTER EVERY TASK)**
6. PR merge
7. Phase completion

**Critical Change:**
- PRs now created **after EVERY task completion**
- Enables continuous integration
- Smaller, focused code reviews
- Clear attribution and rollback granularity

**Review questions:**
- Are GitHub issue updates posted at checkpoints?
- Are PRs created after every task?
- Are screenshots uploaded to GitHub (not just referenced locally)?
- Are PR merge confirmations posted?

---

## Part 5: Template System Review

### Template Locations
- **Directory:** `.claude/templates/`
- **Examples:** `.claude/templates/examples/`

### Available Templates

#### 5.1 INDEX Template
- **File:** `INDEX-template.md`
- **When:** Start of every feature
- **Purpose:** Master tracking document

**Sections to verify:**
- [ ] Feature Overview
- [ ] Phases Breakdown
- [ ] Current Status
- [ ] Blockers
- [ ] Technical Decisions
- [ ] Verification Checklist

#### 5.2 Phase Design Template
- **File:** `phase-design-template.md`
- **When:** Before implementation phases
- **Purpose:** Design documentation

**Sections to verify:**
- [ ] Overview
- [ ] Technical Approach
- [ ] Component Breakdown
- [ ] Dependencies
- [ ] Risks
- [ ] Verification Plan

#### 5.3 Phase Execution Template
- **File:** `phase-execution-template.md`
- **When:** During development
- **Purpose:** Implementation tracking

**Sections to verify:**
- [ ] Implementation Log (dated entries)
- [ ] Progress Tracking
- [ ] Code References
- [ ] Technical Notes
- [ ] Verification Evidence

#### 5.4 Debug Template
- **File:** `debug-template.md`
- **When:** When bugs occur
- **Purpose:** Bug investigation

**Sections to verify:**
- [ ] Symptoms
- [ ] Reproduction Steps
- [ ] Investigation Log
- [ ] Root Cause Analysis
- [ ] Solution

**Note:** Debug files are TEMPORARY and should be deleted after issue resolved.

#### 5.5 Realignment Template
- **File:** `realignment-template.md`
- **When:** When plans change
- **Purpose:** Course corrections

**Sections to verify:**
- [ ] Original Plan
- [ ] New Approach
- [ ] Trigger
- [ ] Impact Assessment
- [ ] Alternatives Considered
- [ ] Decision Rationale

#### 5.6 As-Built Template
- **File:** `as-built-template.md`
- **When:** After merging to main
- **Purpose:** Current state documentation

**Sections to verify:**
- [ ] Component Overview
- [ ] Current Schema/API/Architecture
- [ ] Verification Commands
- [ ] Version History
- [ ] Related Documentation

---

## Part 6: Workflow Compliance Review

### Complete Feature Lifecycle (8 Steps)

#### Step 1: Initiate
- [ ] GitHub issue created
- [ ] Feature branch created
- [ ] INDEX file created
- [ ] Frontmatter complete

#### Step 2: Plan
- [ ] Design documents created
- [ ] Technical approach documented
- [ ] Approval checkpoint passed
- [ ] INDEX updated with phase breakdown

#### Step 3: Execute Task
- [ ] TDD skill invoked
- [ ] Test written first
- [ ] Implementation delegated to sub-agent
- [ ] Execution document updated
- [ ] Code references included

#### Step 4: Verify Task
- [ ] VERIFY-BEFORE-COMPLETE skill invoked
- [ ] Verification commands run
- [ ] Evidence captured and shown
- [ ] Phase document updated

#### Step 5: PR Task (MANDATORY AFTER EVERY TASK)
- [ ] PR created with descriptive title
- [ ] PR includes verification evidence
- [ ] PR links to issue/INDEX/design docs
- [ ] PR posted to GitHub issue
- [ ] PR merged
- [ ] Merge confirmation posted
- [ ] Feature branch updated from main

#### Step 6: Merge Task
- [ ] Task PR merged to main
- [ ] Feature branch updated
- [ ] Next task started

#### Step 7: Repeat
- [ ] Continue to next task
- [ ] Repeat steps 3-6 until phase complete

#### Step 8: Phase Complete
- [ ] As-built documentation generated
- [ ] User-facing docs updated
- [ ] INDEX status set to 'merged'
- [ ] Feature branch deleted
- [ ] GitHub issue closed with summary

---

## Part 7: Quality Gates Review

### Before Merging ANY Feature

**Phase Documents:**
- [ ] Frontmatter complete and valid YAML
- [ ] Status accurate
- [ ] Code references include line numbers
- [ ] Verification evidence included

**INDEX File:**
- [ ] All phases listed with status
- [ ] Blockers documented
- [ ] Verification checklist complete
- [ ] Timeline updated

**As-Built Documents:**
- [ ] Version incremented correctly
- [ ] Reflects actual deployed state
- [ ] Recent changes documented
- [ ] Commit hash referenced

**User Documentation:**
- [ ] Clear, jargon-free language
- [ ] Examples and screenshots
- [ ] Cross-references correct
- [ ] Table of contents updated

---

## Part 8: Common Pitfalls Review

### ❌ Anti-Patterns to Check For

#### 8.1 Skills Not Invoked
- [ ] Check: Are skills invoked before actions?
- [ ] Check: Is TDD invoked before implementation?
- [ ] Check: Is VERIFY-BEFORE-COMPLETE invoked before completion claims?

#### 8.2 Direct Execution (Not Using Sub-Agents)
- [ ] Check: Is Task tool used for all execution work?
- [ ] Check: Is TodoWrite used only for tracking (not execution)?
- [ ] Check: Are independent tasks run in parallel?

#### 8.3 Claiming Completion Without Verification
- [ ] Check: Is verification evidence shown?
- [ ] Check: Are command outputs captured?
- [ ] Check: Is evidence fresh (not cached)?

#### 8.4 Skipping Documentation
- [ ] Check: Is INDEX created for every feature?
- [ ] Check: Are design docs created before implementation?
- [ ] Check: Are as-builts updated after merge?

#### 8.5 Database Anti-Patterns
- [ ] Check: Is Supabase MCP tools used (not local psql)?
- [ ] Check: Is database work delegated to supabase-database-architect agent?
- [ ] Check: Are RLS policies created for multi-tenancy?

---

## Part 9: File Organization Review

### _sys_documents/ Organization Rules

**File Count Limits (RED FLAGS):**
| Directory | Limit | Action When Exceeded |
|-----------|-------|---------------------|
| `vision/` | 5 files | Archive or consolidate |
| `roadmap/` | 10 files | Archive old roadmaps |
| `design/` | 15 active files | Archive completed designs |
| `execution/` | 20 active files | Archive completed features |
| `as-builts/` | 10 files | Consolidate related as-builts |

**Files to DELETE Immediately:**
- [ ] Debug documents after issue resolved
- [ ] Temporary verification reports after evidence moved to INDEX
- [ ] Duplicate files
- [ ] Abandoned draft documents
- [ ] Generic files (notes.md, temp.md, scratch.md)
- [ ] Test files in _sys_documents/ (should be in tests/)

**Files to ARCHIVE:**
- [ ] Completed feature INDEX files (move to execution/archive/YYYY/)
- [ ] Completed phase design docs (move to design/archive/)
- [ ] Execution logs for merged features

**Files to NEVER DELETE:**
- [ ] Active INDEX files
- [ ] Active phase documents
- [ ] As-built documents (update version instead)
- [ ] Realignment documents (part of history)

---

## Part 10: Step-by-Step Review Checklist

### For YOU to Review (User Perspective)

#### Week 1: Foundation Review

**Day 1: CLAUDE.md Review**
- [ ] Read CLAUDE.md sections 1-4 (lines 1-240)
- [ ] Verify mandatory execution framework is clear
- [ ] Check documentation standards section
- [ ] Review repository structure alignment

**Day 2: Skills Framework Review**
- [ ] Read skills documentation (CLAUDE.md lines 627-826)
- [ ] Review each skill file in `.claude/skills/`
- [ ] Verify skill invocation methods
- [ ] Check skills integration with agents

**Day 3: Sub-Agent System Review**
- [ ] Review sub-agent table (CLAUDE.md lines 783-809)
- [ ] Understand each agent's purpose
- [ ] Verify Task tool usage patterns
- [ ] Check parallel execution examples

#### Week 2: Documentation Workflow Review

**Day 4: Template Review**
- [ ] Read all templates in `.claude/templates/`
- [ ] Review example documents in `.claude/templates/examples/`
- [ ] Verify frontmatter standards
- [ ] Check cross-referencing patterns

**Day 5: Workflow Review**
- [ ] Read DOCUMENTATION-GUIDE.md (full document)
- [ ] Review 8-step feature lifecycle
- [ ] Verify GitHub integration checkpoints
- [ ] Check task-level PR requirements

**Day 6: File Organization Review**
- [ ] Read _sys_documents/AGENT.md
- [ ] Verify file count limits
- [ ] Check naming conventions
- [ ] Review archive procedures

#### Week 3: Compliance and Quality

**Day 7: Quality Gates Review**
- [ ] Review quality gates section
- [ ] Check common pitfalls list
- [ ] Verify anti-patterns to avoid
- [ ] Review verification requirements

**Day 8: Current State Assessment**
- [ ] Check current _sys_documents/ file counts
- [ ] Review active INDEX files
- [ ] Verify as-builts are current
- [ ] Check for orphaned files

**Day 9: Process Testing**
- [ ] Start a small test feature
- [ ] Follow complete workflow
- [ ] Document friction points
- [ ] Gather improvement ideas

#### Week 4: Optimization

**Day 10: Finalization**
- [ ] Compile review findings
- [ ] Prioritize improvements
- [ ] Update framework documentation
- [ ] Share results with team

---

## Part 11: Review Deliverables

### What to Produce from This Review

#### 11.1 Review Report
**Template:**
```markdown
# Framework Review Report - YYYY-MM-DD

## Executive Summary
- Framework compliance status
- Key findings
- Recommended improvements

## CLAUDE.md Review
- Completeness
- Clarity
- Alignment with actual practice

## Skills Framework Review
- Skill coverage
- Invocation compliance
- Integration effectiveness

## Sub-Agent System Review
- Agent usage patterns
- Task delegation effectiveness
- Parallel execution adoption

## Documentation Workflow Review
- Template usage
- INDEX file quality
- As-built currency
- GitHub integration effectiveness

## Quality Gates Review
- Gate compliance
- Verification evidence quality
- Anti-pattern occurrences

## File Organization Review
- File count compliance
- Naming convention adherence
- Archive discipline

## Recommendations
1. [Priority 1] {Recommendation}
2. [Priority 2] {Recommendation}
3. [Priority 3] {Recommendation}

## Action Items
- [ ] {Action item with owner and deadline}
- [ ] {Action item with owner and deadline}
```

#### 11.2 Improvement Backlog
- List of framework improvements
- Prioritized by impact
- Assigned to team members

#### 11.3 Training Materials
- Updated onboarding guide
- Framework best practices
- Common pitfall examples

---

## Part 12: Questions to Ask During Review

### Framework Design Questions
1. Is the mandatory execution framework clear and enforceable?
2. Are skills well-integrated with sub-agents?
3. Is the documentation workflow practical and sustainable?
4. Are quality gates effective at catching issues?

### Compliance Questions
1. Are skills being invoked at correct checkpoints?
2. Is Task tool used for all execution work?
3. Are INDEX files created and maintained for every feature?
4. Are PRs created after every task completion?

### Efficiency Questions
1. Is parallel agent execution being utilized?
2. Are templates reducing duplication?
3. Is file organization preventing clutter?
4. Are quality gates catching issues early?

### Effectiveness Questions
1. Is verification evidence-based and comprehensive?
2. Are as-builts reflecting actual deployed state?
3. Is GitHub integration providing visibility?
4. Are skills preventing quality issues?

---

## Part 13: Review Timeline

### Suggested Review Schedule

**Sprint-Based Review (2-week sprints):**
- **Week 1:** Foundation review (CLAUDE.md, skills, sub-agents)
- **Week 2:** Documentation workflow and quality gates
- **Week 3:** Compliance audit and file organization
- **Week 4:** Report writing and improvement planning

**Monthly Review (ongoing):**
- **Day 1-5:** Quick compliance check
- **Day 6-10:** File organization audit
- **Day 11-15:** Quality gates assessment
- **Day 16-20:** Framework improvements
- **Day 21-30:** Training and onboarding updates

---

## Part 14: Success Criteria

### How to Know the Framework Is Working

**Skills Compliance:**
- [ ] 100% of features invoke skills at correct checkpoints
- [ ] TDD red-green-refactor cycle followed in all implementations
- [ ] Verification evidence captured before all completion claims

**Sub-Agent Usage:**
- [ ] 100% of execution work delegated to Task tool
- [ ] TodoWrite used only for tracking (not execution)
- [ ] Independent tasks run in parallel

**Documentation Compliance:**
- [ ] 100% of features have INDEX files
- [ ] All phase documents have complete frontmatter
- [ ] As-builts updated after every merge
- [ ] GitHub issue updates posted at all checkpoints

**File Organization:**
- [ ] File counts within limits in all directories
- [ ] No orphaned debug files
- [ ] No test files in _sys_documents/
- [ ] Archive discipline maintained

**Quality:**
- [ ] Build passes before all commits
- [ ] Tests pass before all PRs
- [ ] Linting clean before all merges
- [ ] Screenshots uploaded for all E2E tests

---

## Conclusion

This framework review guide provides a systematic approach to assessing the PierceDesk implementation framework. Follow the step-by-step process, answer the review questions, and produce the recommended deliverables to ensure the framework is effective, compliant, and continuously improving.

**Next Steps:**
1. Schedule dedicated review time
2. Follow the week-by-week checklist
3. Produce review report
4. Implement high-priority improvements
5. Schedule monthly ongoing reviews

---

**Document Version:** 1.0
**Last Updated:** 2026-01-29
**Author:** Claude Code
**Status:** Active Reference Guide
