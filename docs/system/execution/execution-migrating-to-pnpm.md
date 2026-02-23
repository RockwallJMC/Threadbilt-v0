# Migration Plan: Yarn to PNPM

This document outlines the strategy and execution plan for migrating the Lighthouse project from `yarn` to `pnpm`.

## Investigation Summary

### Package Layout
- **Multiple Manifests**: The project has 16 `package.json` files.
- **Root Manifest**: The primary dependency management and script execution happen in the root `/package.json`.
- **Sub-projects**: Notable sub-projects include `lighthouse-logger`, `core/lib/cdt`, `flow-report`, `report`, and various documentation recipes.
- **Yarn Workspace**: The project currently uses `yarn` (v1.22.22).

### Yarn Specifics
- **Resolutions**: The root `package.json` contains a `resolutions` field. These are used to pin transitive dependency versions (e.g., `devtools-protocol` for `puppeteer`).
- **Scripts**: Many scripts in `package.json` and shell scripts in `core/scripts/` explicitly call `yarn`.
- **Documentation**: `README.md`, `CONTRIBUTING.md`, and sub-project documentation frequently refer to `yarn` commands.

## Migration Strategy

### 1. Preparation
- **PNPM Overrides**: Migrate `yarn.resolutions` to `pnpm.overrides` in the root `package.json`.
- **PNPM Workspace**: Create a `pnpm-workspace.yaml` if needed to manage the existing multi-package structure.

### 2. Execution Flow
The migration will be performed in a single pass without updating dependency versions to ensure stability.

1.  **Generate Lockfile**: Run `pnpm import` to generate `pnpm-lock.yaml` from the existing `yarn.lock`. This preserves the current dependency tree.
2.  **Update Manifests**:
    -   Replace `yarn.resolutions` with `pnpm.overrides`.
    -   Update `engines` or `packageManager` fields to reflect `pnpm`.
3.  **Refactor Scripts**:
    -   Bulk-replace `yarn` with `pnpm` in all `package.json` scripts.
    -   Identify and update shell scripts (`.sh`) and JS scripts that invoke `yarn`.
4.  **Documentation Update**:
    -   Bulk-replace `yarn` with `pnpm` in Markdown files (`.md`).
5.  **Verification**:
    -   Delete `node_modules` and `yarn.lock`.
    -   Run `pnpm install`.
    -   Execute core build and test commands:
        -   `pnpm build-all`
        -   `pnpm unit`
        -   `pnpm type-check`

## Detailed Implementation Steps

### Step 1: Root Configuration
Update `/package.json`:
-   Rename `resolutions` to `pnpm.overrides`.
-   Verify if `pnpm-workspace.yaml` is necessary for sub-packages.

### Step 2: Lockfile Migration
```bash
# Run pnpm import to translate yarn.lock to pnpm-lock.yaml
pnpm import
```

### Step 3: Script & File Refactoring
Search and replace `yarn` -> `pnpm` across:
-   `**/package.json`
-   `core/scripts/*.sh`
-   `**/README.md`
-   `CONTRIBUTING.md`

### Step 4: Workaround Updates
Refactor `core/scripts/upgrade-deps.sh` to remove the "Airlock hack" if `pnpm` handles the registry authentication issues natively, or adapt the hack for `pnpm`.

## Success Criteria
- [ ] `pnpm install` completes successfully without `yarn.lock`.
- [ ] `pnpm build-all` produces identical build artifacts.
- [ ] `pnpm test` and `pnpm type-check` pass.
- [ ] All developer documentation uses `pnpm` examples.
