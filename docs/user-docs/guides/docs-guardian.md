---
name: docs-guardian
description: Documentation maintenance agent - triggers GitHub workflow to clean and organize docs
trigger: manual
version: 1.0.0
---

# Documentation Guardian Agent

Triggers automated documentation maintenance workflow and reports results.

## Purpose

Maintains documentation organization by:
- Moving `.md` files from `/src` to appropriate locations
- Creating missing AGENT.md and README.md files
- Fixing naming convention violations
- Repairing broken internal links
- Cleaning orphaned files from repository root

## Usage

### From Claude Code

```
Task(docs-guardian, "run maintenance")
Task(docs-guardian, "run maintenance --dry-run")
```

### Capabilities

1. **Trigger GitHub Actions workflow** for docs maintenance
2. **Monitor workflow execution** status
3. **Report results** and PR link
4. **Support dry-run mode** for validation

## Implementation

### Prerequisites

- `gh` CLI must be installed and authenticated
- User must have write access to repository
- GitHub Actions must be enabled

### Execution Flow

1. **Check prerequisites**
   ```bash
   gh auth status
   ```

2. **Trigger workflow**
   ```bash
   gh workflow run docs-maintenance.yml \
     --ref $(git branch --show-current)
   ```

3. **For dry-run**
   ```bash
   gh workflow run docs-maintenance.yml \
     --ref $(git branch --show-current) \
     -f dry_run=true
   ```

4. **Monitor status**
   ```bash
   gh run list --workflow=docs-maintenance.yml --limit 1
   ```

5. **Get PR link**
   ```bash
   gh pr list --label documentation,automated --limit 1
   ```

### Output Format

**Success:**
```
✅ Documentation maintenance workflow started
📋 Run ID: 1234567890
🔗 Monitor: https://github.com/user/repo/actions/runs/1234567890

Waiting for completion...

✅ Workflow completed successfully
📝 PR created: #123
🔗 Review PR: https://github.com/user/repo/pull/123

Changes:
- Moved from /src: 9 files
- Created missing: 8 files
- Renamed: 3 files
- Fixed links: 12 links
```

**Dry Run:**
```
🔍 Dry-run mode enabled - no changes will be made

✅ Dry-run completed
📊 Summary:
  - Would move from /src: 9 files
  - Would create: 8 files (AGENT.md, README.md)
  - Would rename: 3 files
  - Would fix: 12 broken links

🔗 View full report in workflow logs
```

**Errors:**
```
❌ Workflow failed
📋 Run ID: 1234567890
🔗 View logs: https://github.com/user/repo/actions/runs/1234567890

Common issues:
- Missing gh CLI authentication: Run `gh auth login`
- Branch protection rules: Check repository settings
- Insufficient permissions: Need write access
```

## Commands Reference

### Trigger Maintenance
```bash
gh workflow run docs-maintenance.yml
```

### Trigger Dry-Run
```bash
gh workflow run docs-maintenance.yml -f dry_run=true
```

### Check Latest Run
```bash
gh run list --workflow=docs-maintenance.yml --limit 1
```

### View Run Logs
```bash
gh run view <run-id> --log
```

### View Run in Browser
```bash
gh run view <run-id> --web
```

### Find Recent PRs
```bash
gh pr list --label documentation,automated
```

## Error Handling

### Workflow Fails

If the workflow fails, check:
1. **Run logs**: `gh run view <run-id> --log`
2. **Plugin errors**: Look for `❌ Error:` in logs
3. **File conflicts**: Check for existing files with same names
4. **Permission issues**: Verify write access

### No PR Created

If workflow succeeds but no PR is created:
- No changes were detected (all docs already organized)
- Check workflow output: `has_changes=false`
- This is normal and indicates docs are well-maintained

### PR Merge Conflicts

If PR has conflicts:
- Review conflicting files in PR
- Resolve manually or close PR and re-run
- Usually happens if docs were modified during maintenance

## Integration

### Manual Invocation

User runs: `Task(docs-guardian, "run maintenance")`

Agent:
1. Checks `gh auth status`
2. Triggers workflow via `gh workflow run`
3. Polls for completion
4. Reports PR URL when complete

### Scheduled Invocation

Workflow runs automatically daily at 2 AM UTC.

Agent is not involved in scheduled runs.

### Direct Script Invocation

For local testing:
```bash
node scripts/docs-maintenance.js --dry-run
```

## Maintenance

### Update Keywords

Edit `scripts/lib/keywords.js` to adjust categorization:
- `SYSTEM_KEYWORDS` - Internal documentation keywords
- `USER_KEYWORDS` - User-facing documentation keywords
- `API_KEYWORDS` - API documentation keywords

### Add New Plugin

1. Create plugin in `scripts/plugins/`
2. Extend `BasePlugin` class
3. Implement `scan()`, `fix()`, `report()` methods
4. Add to plugin list in `scripts/docs-maintenance.js`

### Test Changes

```bash
# Test categorization logic
node scripts/docs-maintenance.js --dry-run

# Test specific file
node -e "
const Categorizer = require('./scripts/lib/categorizer');
Categorizer.categorize('path/to/file.md').then(console.log);
"
```

## Related Documentation

- [Design Document](../../docs/plans/2026-01-30-docs-guardian-design.md)
- [GitHub Actions Workflow](../../.github/workflows/docs-maintenance.yml)
- [Documentation Standards](../../docs/system/AGENT.md)

---

**Created**: 2026-01-30
**Last Updated**: 2026-01-30
**Maintained By**: Documentation Team
