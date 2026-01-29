# Playwright Installation Issue

## Date: 2026-01-29

## Issue

Playwright test package (`@playwright/test@^1.48.0`) is listed in `package.json` devDependencies but fails to install in `node_modules/@playwright/` directory.

### Symptoms

- `npm install` reports "up to date" or "added 3 packages"
- `npm list @playwright/test` shows "(empty)"
- Directory `node_modules/@playwright/` does not exist
- Only Playwright reference found is in `node_modules/next/experimental/testmode/playwright`

### Attempted Solutions

1. ✅ `npm install @playwright/test --save-dev --legacy-peer-deps` - Added to package.json but not installed
2. ✅ `npm clean-install --legacy-peer-deps` - Same result
3. ✅ `rm -rf node_modules && npm install` - Same result
4. ✅ Manual package.json verification - Package is correctly listed
5. ❌ No `.npmrc` file preventing installation
6. ❌ No install hooks blocking Playwright

### Environment

- Node.js: v24.12.0
- npm: 11.6.2
- OS: Linux 6.8.0-90-generic
- Project: piercedesk6@1.7.0

## Test Files Created

Despite installation issues, test files are complete and ready:

1. **tests/crm-proposals.spec.js** - 35 active tests
   - Proposals List View (8 tests)
   - Proposal Creation (10 tests)
   - Status Transitions (8 tests)
   - PDF Generation (5 tests)
   - Integration Tests (4 tests)

2. **tests/crm-proposals-multi-tenancy.spec.js** - 6 skipped tests
   - Organization Data Isolation (2 tests)
   - RLS Policy Enforcement (2 tests)
   - Cross-Organization Access Prevention (2 tests)

## Next Steps

### Option 1: Manual Playwright Installation (Recommended)

```bash
# Install Playwright directly
npm install -D @playwright/test@1.48.0

# Install browsers
npx playwright install chromium

# Run tests
npm run test:e2e tests/crm-proposals.spec.js
```

### Option 2: Use Existing Test Infrastructure

If other test files (`tests/crm-opportunities.spec.js`, etc.) run successfully, use the same approach for these new test files.

### Option 3: Fresh Environment

Try installing on a different machine or in a clean directory to isolate if this is an environment-specific issue.

## Test Verification Checklist

Once Playwright is working:

- [ ] Run `npx playwright test tests/crm-proposals.spec.js`
- [ ] Verify all 35 active tests pass
- [ ] Capture screenshots (automatic via `test.afterEach`)
- [ ] Check 6 multi-tenancy tests are properly skipped
- [ ] Review test output for any failures

## Status

✅ Test files created following TDD principles
❌ Playwright installation blocked (environment issue)
⏳ Awaiting manual installation or environment fix

---

**Note**: The test files themselves are complete and follow proper structure. This is purely an installation/environment issue, not a test code issue.
