# _sys_documents Cleanup Recommendations

**Date:** 2026-01-27
**Status:** Action Required

---

## Current State Analysis

### File Count by Directory

```bash
Vision: 1 files ✅ (under limit of 5)
Roadmap: 1 files ✅ (under limit of 10)
Design: 3 files ✅ (under limit of 15)
Execution: 8 files ⚠️ (approaching concern at 20)
As-builts: 1 files ✅ (under limit of 10)
```

**Overall Status:** 🟢 **HEALTHY** - File counts are within limits

---

## Identified Issues

### 1. Temporary Verification Report ⚠️

**File:** `_sys_documents/execution/phase1.2-VERIFICATION-REPORT.md`

**Issue:** This is a 12KB verification report that should be incorporated into the INDEX and deleted per AGENT.md guidelines.

**Recommendation:**
1. ✅ Extract key verification evidence
2. ✅ Append to `INDEX-crm-desk-mvp.md` or relevant INDEX
3. ❌ DELETE `phase1.2-VERIFICATION-REPORT.md`

**Evidence to Extract:**
- Implementation status (25/25 tasks complete)
- What CAN be verified (files exist, RLS working, NextAuth removed)
- What CANNOT be verified (build/lint/tests blocked by environment)
- Root cause analysis (node_modules out of sync)
- Recommended fix steps

**Action:** Move evidence to INDEX, then delete this file.

---

### 2. Missing INDEX for Phase 1.2 Authentication 🔴

**Current State:**
- `phase1.2-auth-system.md` exists (execution log)
- `phase1.2-VERIFICATION-REPORT.md` exists (temporary report)
- **MISSING:** `INDEX-auth-system.md` (master tracking document)

**Issue:** The Phase 1.2 authentication work lacks a proper INDEX file as the master tracking document.

**Recommendation:**
Either:
- **Option A:** Create `INDEX-auth-system.md` from template and consolidate evidence
- **Option B:** Incorporate Phase 1.2 into `INDEX-crm-desk-mvp.md` if it's part of that feature

**Action Required:** Clarify feature structure and create/update appropriate INDEX.

---

### 3. Orphaned Execution Logs 🟡

**Files:**
- `phase1.2-test-rectangle-implementation.md`
- `phase1.3-test-rectangle-verification.md`

**Associated INDEX:** `INDEX-test-rectangle.md` ✅ (exists)

**Issue:** These phases appear complete but are still in active `execution/` directory.

**Recommendation:**
1. Verify INDEX-test-rectangle status
2. If status = "complete" or "locked":
   - Move design docs to `design/archive/`
   - Move execution docs to `execution/archive/2026/`
3. If still active, no action needed

**Action:** Check INDEX status, archive if complete.

---

### 4. Lessons Learned Document 📚

**File:** `lessons-learned-framework-testing.md`

**Status:** ✅ Appropriate location

**Note:** This is a valuable retrospective document. Consider:
- Moving to `roadmap/` if it contains strategic insights
- Keeping in `execution/` if it's specific to a feature
- Current location is acceptable either way

**Action:** Optional - relocate to `roadmap/` for better discoverability

---

## Recommended Actions (Priority Order)

### High Priority 🔴

1. **Clarify INDEX structure for Phase 1.2**
   - Does Phase 1.2 belong in `INDEX-crm-desk-mvp.md`?
   - Or should there be a separate `INDEX-auth-system.md`?
   - User decision required

2. **Clean up verification report**
   - Extract evidence from `phase1.2-VERIFICATION-REPORT.md`
   - Append to appropriate INDEX
   - DELETE verification report file

### Medium Priority 🟡

3. **Archive completed test-rectangle feature**
   - Check `INDEX-test-rectangle.md` status
   - If complete, move to archive:
     ```bash
     mkdir -p _sys_documents/design/archive/
     mkdir -p _sys_documents/execution/archive/2026/

     mv _sys_documents/design/phase1.1-test-rectangle-design.md \
        _sys_documents/design/archive/

     mv _sys_documents/execution/INDEX-test-rectangle.md \
        _sys_documents/execution/archive/2026/
     mv _sys_documents/execution/phase1.2-test-rectangle-implementation.md \
        _sys_documents/execution/archive/2026/
     mv _sys_documents/execution/phase1.3-test-rectangle-verification.md \
        _sys_documents/execution/archive/2026/
     ```

### Low Priority 🟢

4. **Consider relocating lessons-learned**
   - Move `lessons-learned-framework-testing.md` to `roadmap/`
   - Rename to `roadmap/framework-improvements-2026-01-27.md` for consistency
   - Or keep in `execution/` - current location is fine

5. **Review framework-improvements document**
   - Duplicate with lessons-learned?
   - Consolidate if overlapping content
   - Or keep separate if different purposes

---

## File Organization Best Practices

### ✅ What's Working Well

1. **Proper subdirectory structure** - vision, roadmap, design, execution, as-builts
2. **Consistent naming** - Most files follow phase{X.Y}-{topic} pattern
3. **File counts under limits** - No directories are overloaded
4. **AGENT.md created** - Clear guidelines now documented

### 🔧 Areas for Improvement

1. **INDEX coverage** - Ensure every feature has ONE master INDEX
2. **Temporary file cleanup** - Delete verification reports after incorporating evidence
3. **Archiving completed work** - Move locked features to archive directories
4. **Naming consistency** - Standardize date formats (YYYY-MM-DD)

---

## Maintenance Schedule

### Weekly
- [ ] Delete temporary debug files
- [ ] Update INDEX files with weekly progress
- [ ] Check for orphaned files

### Monthly
- [ ] Archive completed features
- [ ] Review file counts against limits
- [ ] Consolidate duplicate documentation

### Quarterly
- [ ] Archive old execution logs to `archive/YYYY/`
- [ ] Review and consolidate roadmap documents
- [ ] Update as-built documentation

---

## Immediate Action Items for User

**Decision Required:**

1. **Phase 1.2 INDEX Structure**
   - [ ] Is Phase 1.2 auth part of CRM MVP feature?
   - [ ] If yes: Incorporate into `INDEX-crm-desk-mvp.md`
   - [ ] If no: Create `INDEX-auth-system.md`

2. **Verification Report Cleanup**
   - [ ] Review `phase1.2-VERIFICATION-REPORT.md`
   - [ ] Extract key evidence to INDEX
   - [ ] Approve deletion of verification report file

3. **Test Rectangle Archival**
   - [ ] Is test-rectangle feature complete and locked?
   - [ ] If yes: Approve archival to `archive/2026/`
   - [ ] If no: Keep in active directories

---

## Summary

**Current State:** 🟢 Healthy - file counts within limits, structure is good

**Main Issues:**
1. One temporary verification report needs cleanup
2. Unclear INDEX structure for Phase 1.2
3. Completed features could be archived

**Priority:** Low urgency, but establishing good cleanup habits now prevents future mess

**Estimated Cleanup Time:** 15-30 minutes

---

**Next Steps:**
1. User makes decisions on INDEX structure
2. Execute cleanup actions above
3. Document cleanup completion in this file
4. Delete this recommendations file after actions complete

---

**Guidelines Reference:** See [_sys_documents/AGENT.md](_sys_documents/AGENT.md) for detailed organization rules.
