# _sys_documents Organization Guide

**Purpose:** This file provides strict guidelines for AI agents working with the `_sys_documents` directory to prevent disorganization and file overload.

---

## Directory Purpose

`_sys_documents` is for **internal tracking documentation ONLY**. It is NOT for:
- Test files
- Implementation code
- Build reports
- Temporary debugging files
- Agent logs or outputs
- Verification command outputs

---

## Directory Structure (STRICT)

```
_sys_documents/
├── AGENT.md                 # THIS FILE - Organization rules
├── vision/                  # Product vision documents (long-term, rarely updated)
├── roadmap/                 # Strategic planning documents (quarterly updates)
├── design/                  # Phase design documents (one per design phase)
├── execution/               # INDEX files and execution logs (one INDEX per feature)
└── as-builts/               # Current state documentation (updated after merges)
```

### Subdirectory Rules

1. **vision/** - Maximum 3-5 files
   - Vision documents
   - Strategic goals
   - Product philosophy
   - **Naming:** `vision.md`, `product-strategy.md`, etc.

2. **roadmap/** - Maximum 5-10 files
   - Quarterly roadmaps
   - Transformation plans
   - Multi-phase initiatives
   - **Naming:** `YYYY-QN-roadmap.md`, `transformation-plan.md`

3. **design/** - One file per design phase
   - Design documents ONLY
   - **Naming:** `phase{X.Y}-{topic}.md`
   - **Example:** `phase1.1-auth-design.md`
   - **Archive rule:** Move to `design/archive/` when feature is merged and locked

4. **execution/** - One INDEX file per feature + supporting docs
   - INDEX files (master tracking per feature)
   - Phase execution logs (daily/weekly implementation updates)
   - Debug logs (temporary, should be deleted after issue resolved)
   - Realignment documents (when plans change)
   - **Naming:**
     - INDEX: `INDEX-{feature-name}.md`
     - Execution: `phase{X.Y}-{topic}.md`
     - Debug: `debug-{issue-id}-{description}.md` (DELETE after resolved)
     - Realignment: `realign-YYYY-MM-DD-{topic}.md`
   - **Archive rule:** Move completed features to `execution/archive/YYYY/` yearly

5. **as-builts/** - Current state documentation
   - Database schema as-built
   - API as-built
   - Architecture as-built
   - **Naming:** `{component}-as-built.md`
   - **Version:** Increment version in frontmatter, don't create new files

---

## File Naming Conventions (MANDATORY)

### INDEX Files
```
INDEX-{feature-name}.md
```
**Examples:**
- `INDEX-crm-desk-mvp.md`
- `INDEX-auth-system.md`
- `INDEX-organization-setup.md`

### Phase Design Documents
```
phase{X.Y}-{topic}-design.md
```
**Examples:**
- `phase1.1-auth-design.md`
- `phase2.3-rls-design.md`

### Phase Execution Documents
```
phase{X.Y}-{topic}.md
```
**Examples:**
- `phase1.2-auth-implementation.md`
- `phase2.1-database-setup.md`

### Debug Documents (TEMPORARY)
```
debug-{YYYY-MM-DD}-{issue-description}.md
```
**Examples:**
- `debug-2026-01-27-rls-policy-issue.md`
- `debug-BUG-123-login-failure.md`

**CRITICAL:** Debug documents MUST be deleted once the issue is resolved. Do NOT leave orphaned debug files.

### Realignment Documents
```
realign-{YYYY-MM-DD}-{reason}.md
```
**Examples:**
- `realign-2026-01-27-scope-change.md`
- `realign-2026-02-01-architecture-pivot.md`

### Verification Reports (TEMPORARY)
```
phase{X.Y}-verification.md
```
**Examples:**
- `phase1.2-verification.md`

**CRITICAL:** Verification reports should be:
1. Created during verification phase
2. Evidence appended to INDEX file once complete
3. File DELETED after evidence is incorporated into INDEX

---

## File Lifecycle Management

### When to CREATE Files

1. **New Feature → Create INDEX**
   - One INDEX file per feature
   - Named: `INDEX-{feature-name}.md`
   - Location: `_sys_documents/execution/`

2. **Design Phase → Create Design Doc**
   - One design doc per major phase
   - Named: `phase{X.Y}-{topic}-design.md`
   - Location: `_sys_documents/design/`

3. **Implementation → Update Execution Doc**
   - Append to existing phase execution doc
   - If none exists, create: `phase{X.Y}-{topic}.md`
   - Location: `_sys_documents/execution/`

4. **Bug/Issue → Create Debug Doc (TEMPORARY)**
   - Named: `debug-YYYY-MM-DD-{description}.md`
   - Location: `_sys_documents/execution/`
   - **DELETE after issue resolved**

5. **Plan Changes → Create Realignment Doc**
   - Named: `realign-YYYY-MM-DD-{reason}.md`
   - Location: `_sys_documents/execution/`
   - Link from INDEX, summarize changes

### When to UPDATE Files

1. **Daily/Weekly Implementation Progress**
   - Update phase execution document
   - Add dated entries with code references

2. **Feature Status Changes**
   - Update INDEX file frontmatter status
   - Update Progress Summary section

3. **Completion of Phase**
   - Update INDEX with verification evidence
   - Update phase document with final status

4. **System Changes**
   - Update as-built documentation
   - Increment version number in frontmatter

### When to DELETE Files

**DELETE immediately:**
1. Debug documents after issue resolved
2. Temporary verification reports after evidence moved to INDEX
3. Duplicate files
4. Abandoned draft documents

**DO NOT DELETE:**
- INDEX files (archive instead)
- Completed phase documents (archive instead)
- As-built documents (update version instead)
- Realignment documents (part of history)

### When to ARCHIVE Files

**Archive completed features:**

1. **Trigger:** Feature merged to main and INDEX status = "locked"

2. **Archive Design Docs:**
   ```bash
   mkdir -p _sys_documents/design/archive/
   mv _sys_documents/design/phase1.1-feature.md \
      _sys_documents/design/archive/
   ```

3. **Archive Execution Docs (Yearly):**
   ```bash
   mkdir -p _sys_documents/execution/archive/2026/
   mv _sys_documents/execution/INDEX-feature.md \
      _sys_documents/execution/archive/2026/
   mv _sys_documents/execution/phase*.md \
      _sys_documents/execution/archive/2026/
   ```

4. **Keep As-Builts Active:**
   - Never archive as-built documents
   - Update them with current state instead

---

## Anti-Patterns (DO NOT DO THIS)

### ❌ Creating Test Files in _sys_documents
```
# WRONG - Tests belong in /tests/ directory
_sys_documents/execution/organization-switching.spec.js
_sys_documents/execution/rls-helper.test.js
```

**Correct location:**
```
tests/organization-switching.spec.js
tests/unit/rls-helper.test.js
```

### ❌ Storing Command Outputs
```
# WRONG - Command outputs belong in verification docs, then deleted
_sys_documents/execution/build-output.txt
_sys_documents/execution/test-results.log
_sys_documents/execution/lint-report.txt
```

**Correct approach:**
1. Run verification command
2. Copy relevant output to verification section of INDEX
3. Delete the output file

### ❌ Accumulating Debug Files
```
# WRONG - Debug files should be deleted after issue resolved
_sys_documents/execution/debug-2026-01-15-issue.md
_sys_documents/execution/debug-2026-01-16-another-issue.md
_sys_documents/execution/debug-2026-01-17-yet-another.md
_sys_documents/execution/debug-2026-01-18-still-more.md
```

**Correct approach:**
1. Create debug doc while investigating
2. Resolve issue
3. **DELETE debug doc immediately**
4. Document fix in INDEX or execution log

### ❌ Multiple INDEX Files for Same Feature
```
# WRONG - One INDEX per feature
_sys_documents/execution/INDEX-auth-system.md
_sys_documents/execution/INDEX-auth-system-v2.md
_sys_documents/execution/INDEX-auth-system-final.md
```

**Correct approach:**
- One INDEX file per feature
- Update the same INDEX throughout feature lifecycle
- Use frontmatter `status` field to track progress

### ❌ Verification Reports That Never Get Cleaned Up
```
# WRONG - These should be incorporated into INDEX and deleted
_sys_documents/execution/phase1.2-VERIFICATION-REPORT.md
_sys_documents/execution/phase1.3-VERIFICATION-REPORT.md
_sys_documents/execution/phase2.1-VERIFICATION-REPORT.md
```

**Correct approach:**
1. Create verification report during verification phase
2. Extract key evidence and append to INDEX file
3. **DELETE verification report file**
4. Index retains the evidence, report file is temporary

### ❌ Orphaned Files with No Clear Purpose
```
# WRONG - Every file must have clear purpose and owner
_sys_documents/execution/notes.md
_sys_documents/execution/todo.md
_sys_documents/execution/scratch.md
_sys_documents/execution/temp.md
```

**Correct approach:**
- If notes belong to a feature → add to that feature's INDEX
- If todos belong to a phase → add to phase execution doc
- Never create generic "notes" or "scratch" files

---

## File Count Limits (RED FLAGS)

### Hard Limits per Directory

| Directory | Active Files Limit | Action When Exceeded |
|-----------|-------------------|----------------------|
| `vision/` | 5 files | Archive or consolidate |
| `roadmap/` | 10 files | Archive old roadmaps |
| `design/` | 15 active files | Archive completed designs |
| `execution/` | 20 active files | Archive completed features |
| `as-builts/` | 10 files | Consolidate related as-builts |

### Red Flags (Review and Clean Up)

**If you see this, STOP and clean up:**

1. **More than 20 files in `execution/`**
   - Archive completed features
   - Delete debug files
   - Delete temporary verification reports

2. **Any debug files older than 7 days**
   - Either resolve and delete
   - Or document why still needed in INDEX

3. **Multiple INDEX files for same feature**
   - Consolidate into one INDEX
   - Delete duplicates

4. **Files with generic names** (`notes.md`, `temp.md`, `scratch.md`)
   - Incorporate content into proper documents
   - Delete generic files

5. **Test files or code files in `_sys_documents/`**
   - Move to correct location (`tests/`, `src/`)
   - Delete from `_sys_documents/`

---

## Agent Checklist Before Creating Files

Before creating ANY file in `_sys_documents/`, verify:

- [ ] Does this file fit one of the documented file types?
- [ ] Am I using the correct naming convention?
- [ ] Am I placing it in the correct subdirectory?
- [ ] Could I add this content to an existing file instead?
- [ ] If this is temporary (debug, verification), when will I delete it?
- [ ] Have I checked the file count limits?

**If you answer "no" or "unsure" to any question, DO NOT create the file.**

---

## Agent Checklist During Feature Work

**Daily Check:**
- [ ] Are debug files cleaned up?
- [ ] Is INDEX file up to date?
- [ ] Are execution logs updated with today's work?

**Weekly Check:**
- [ ] Are there orphaned files with no clear owner?
- [ ] Are completed phases archived?
- [ ] Are file counts within limits?

**Before Feature Completion:**
- [ ] Is INDEX complete with all evidence?
- [ ] Are temporary files (debug, verification) deleted?
- [ ] Are as-builts updated?
- [ ] Is feature ready to archive?

**After Feature Merge:**
- [ ] Archive design docs
- [ ] Archive execution docs (if end of year)
- [ ] Lock INDEX status
- [ ] Update as-builts

---

## Maintenance Commands

### Check file counts
```bash
echo "Vision: $(ls -1 _sys_documents/vision/ | wc -l)"
echo "Roadmap: $(ls -1 _sys_documents/roadmap/ | wc -l)"
echo "Design: $(ls -1 _sys_documents/design/ | wc -l)"
echo "Execution: $(ls -1 _sys_documents/execution/ | wc -l)"
echo "As-builts: $(ls -1 _sys_documents/as-builts/ | wc -l)"
```

### Find orphaned debug files
```bash
find _sys_documents/execution -name "debug-*.md" -mtime +7
```

### Find verification reports that should be cleaned up
```bash
find _sys_documents/execution -name "*VERIFICATION*.md"
```

### Find generic/temporary files
```bash
find _sys_documents -type f \( -name "temp*.md" -o -name "scratch*.md" -o -name "notes.md" -o -name "todo.md" \)
```

### Find test files that don't belong
```bash
find _sys_documents -type f \( -name "*.test.js" -o -name "*.spec.js" -o -name "*.test.jsx" -o -name "*.spec.jsx" \)
```

---

## Emergency Cleanup Procedure

**If `_sys_documents` becomes messy:**

1. **Identify the mess:**
   ```bash
   ls -lah _sys_documents/execution/
   ```

2. **Delete temporary files:**
   - All debug files for resolved issues
   - All verification reports with evidence in INDEX
   - All files with generic names (notes, temp, scratch)

3. **Archive completed work:**
   - Move completed feature INDEX files to archive
   - Move completed phase docs to archive
   - Keep only active work in main directories

4. **Consolidate duplicates:**
   - If multiple INDEX files for same feature, merge into one
   - If multiple as-builts for same component, consolidate

5. **Verify limits:**
   - Check file counts against hard limits
   - If over limit, archive more aggressively

---

## Summary: Golden Rules

1. **One INDEX per feature** (no duplicates, no versions)
2. **Delete temporary files** (debug, verification reports)
3. **Archive completed work** (don't accumulate in active dirs)
4. **No tests in _sys_documents** (tests go in /tests/)
5. **No command outputs** (incorporate evidence, delete file)
6. **Respect file count limits** (archive when approaching limits)
7. **Use proper naming conventions** (see conventions above)
8. **Every file has a purpose** (if unclear, don't create it)

---

## Cross-Referencing to docs/ (User-Facing Documentation)

### Relationship Between _sys_documents/ and docs/

**_sys_documents/** (this directory) is for **INTERNAL TRACKING**.
**docs/** is for **USER-FACING DOCUMENTATION**.

**Flow:**
1. Planning happens here (`_sys_documents/` - INDEX, design, execution)
2. Implementation creates code
3. User-facing docs created in `docs/` after merge
4. As-builts created here (`_sys_documents/as-builts/`) reflect deployed state

### Cross-Reference Patterns

**From _sys_documents/ → docs/**:
```markdown
See [User Guide](../../docs/features/CRM-DESK.md)
See [API Reference](../../docs/api/REST-API.md)
See [Implementation Plan](../../docs/plans/2026-01-29-feature.md)
```

**From docs/ → _sys_documents/**:
```markdown
See [As-Built Documentation](../_sys_documents/as-builts/feature-as-built.md)
See [INDEX Document](../_sys_documents/execution/INDEX-feature.md)
See [Design Document](../_sys_documents/design/phase1.1-feature.md)
```

### Required Cross-References

**Every INDEX file MUST link to**:
- Implementation plan in `docs/plans/`
- User-facing feature guide in `docs/features/` (after creation)
- GitHub issue and PR

**Every as-built MUST link to**:
- Original design documents (`_sys_documents/design/`)
- User documentation (`docs/features/`)
- Related as-builts

**Every design document MUST link to**:
- Parent INDEX file
- Implementation plan in `docs/plans/`

### Documentation Compliance

See [Documentation Guide](../docs/guides/DOCUMENTATION-GUIDE.md) for complete framework.
See [Documentation Compliance Audit](execution/DOCUMENTATION-COMPLIANCE-AUDIT-2026-01-29.md) for current state assessment.

---

**Last Updated:** 2026-01-29
**Version:** 1.1
**Status:** Active
