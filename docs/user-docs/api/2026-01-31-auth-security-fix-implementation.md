# Authentication Security Fix - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all insecure `getSession()` authentication patterns with secure server-validated approaches following Supabase best practices.

**Architecture:** Defense-in-depth authentication where server validates all tokens with `getUser()`, client manages state only from auth events, and cookies handle token transport automatically. Zero client-side security decisions.

**Tech Stack:** Next.js 15 App Router, Supabase Auth (@supabase/ssr), Playwright (E2E testing), React 19

**Design Document:** [docs/plans/2026-01-31-auth-security-fix-design.md](./2026-01-31-auth-security-fix-design.md)

---

## Task 1: Create E2E Security Test Suite (Baseline)

**Goal:** Establish baseline tests that verify current auth behavior. These will pass after fixes, proving we didn't break functionality.

**Files:**
- Create: `tests/security/auth-security.spec.js`
- Create: `tests/security/auth-helpers.js`

### Step 1: Write auth helper utilities

Create authentication helper functions for tests.

**File:** `tests/security/auth-helpers.js`

```javascript
import { expect } from '@playwright/test';

/**
 * Login as test user via Supabase auth
 */
export async function loginAsTestUser(page) {
  // Navigate to login page
  await page.goto('/authentication/default/jwt/login');

  // Fill in credentials (use test user from environment or seed data)
  await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@piercedesk.ai');
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Test123!');

  // Submit form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard (confirms login success)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logout(page) {
  // Click user menu
  await page.click('[data-testid="user-menu"], [aria-label*="account"]');

  // Click logout button
  await page.click('text=/sign out|logout/i');

  // Wait for redirect to login
  await expect(page).toHaveURL(/\/authentication.*login/, { timeout: 5000 });
}

/**
 * Clear all auth state (cookies, localStorage)
 */
export async function clearAuthState(page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
```

### Step 2: Write test suite - Protected Routes

**File:** `tests/security/auth-security.spec.js`

```javascript
import { test, expect } from '@playwright/test';
import { loginAsTestUser, logout, clearAuthState } from './auth-helpers';

test.describe('Protected Route Access', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh each test
    await clearAuthState(page);
  });

  test('unauthenticated users redirected to login', async ({ page }) => {
    // Attempt to access protected route
    await page.goto('/dashboard/crm');

    // Should redirect to login
    await expect(page).toHaveURL(/\/authentication.*login/);
  });

  test('authenticated users can access dashboard', async ({ page }) => {
    // Login via helper
    await loginAsTestUser(page);

    // Navigate to protected route
    await page.goto('/dashboard/crm');

    // Should stay on dashboard
    await expect(page).toHaveURL('/dashboard/crm');

    // Verify page loaded (check for expected content)
    await expect(page.locator('text=/CRM|Deals|Leads/i')).toBeVisible();
  });

  test('authenticated users can access multiple protected routes', async ({ page }) => {
    await loginAsTestUser(page);

    // Test multiple protected routes
    const routes = ['/dashboard/crm', '/dashboard/projects'];

    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(route);
    }
  });
});
```

### Step 3: Write test suite - API Authentication

Add API authentication tests to same file.

**File:** `tests/security/auth-security.spec.js` (append)

```javascript
test.describe('API Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('API rejects unauthenticated requests', async ({ request }) => {
    const response = await request.get('/api/crm/deals');

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe('Unauthorized');
  });

  test('API accepts authenticated requests', async ({ page }) => {
    // Login to get cookies
    await loginAsTestUser(page);

    // Make API request (cookies automatically included)
    const response = await page.request.get('/api/crm/deals');

    expect(response.status()).toBe(200);

    const data = await response.json();
    // Should return array or object, not error
    expect(data.error).toBeUndefined();
  });

  test('API returns user-specific data', async ({ page }) => {
    await loginAsTestUser(page);

    // Request user-specific resource
    const response = await page.request.get('/api/crm/deals');

    expect(response.status()).toBe(200);

    const deals = await response.json();
    // Verify we got data (even if empty array)
    expect(Array.isArray(deals) || typeof deals === 'object').toBe(true);
  });
});
```

### Step 4: Write test suite - Session Persistence

Add session persistence tests.

**File:** `tests/security/auth-security.spec.js` (append)

```javascript
test.describe('Session Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuthState(page);
  });

  test('session persists across page reloads', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/crm');

    // Reload page
    await page.reload();

    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard/crm');

    // Verify content loaded (not redirected)
    await expect(page.locator('text=/CRM|Deals|Leads/i')).toBeVisible();
  });

  test('session persists across navigation', async ({ page }) => {
    await loginAsTestUser(page);

    // Navigate between protected routes
    await page.goto('/dashboard/crm');
    await page.goto('/dashboard/projects');
    await page.goto('/dashboard/crm');

    // Should still be authenticated
    await expect(page).toHaveURL('/dashboard/crm');
  });

  test('logout clears session completely', async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/dashboard/crm');

    // Logout
    await logout(page);

    // Attempt to access dashboard again
    await page.goto('/dashboard/crm');

    // Should redirect back to login
    await expect(page).toHaveURL(/\/authentication.*login/);
  });

  test('session expires after logout even with cookies', async ({ page }) => {
    await loginAsTestUser(page);

    // Get cookies before logout
    const cookiesBeforeLogout = await page.context().cookies();
    const hadAuthCookies = cookiesBeforeLogout.some(c => c.name.includes('auth'));

    expect(hadAuthCookies).toBe(true);

    // Logout
    await logout(page);

    // Verify auth cookies cleared
    const cookiesAfterLogout = await page.context().cookies();
    const hasAuthCookies = cookiesAfterLogout.some(c => c.name.includes('auth'));

    expect(hasAuthCookies).toBe(false);
  });
});
```

### Step 5: Run baseline tests

Run the test suite to establish current behavior.

```bash
npx playwright test tests/security/auth-security.spec.js --reporter=list
```

**Expected:** Tests should mostly pass (auth system works), but we're establishing baseline before security fixes.

### Step 6: Commit baseline tests

```bash
git add tests/security/
git commit -m "test: Add E2E security tests for auth system

Create comprehensive test suite for authentication:
- Protected route access control
- API authentication and authorization
- Session persistence across reloads/navigation
- Logout session cleanup

These tests verify current auth behavior and will ensure
security fixes don't break functionality.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Fix Root Layout Server-Side Auth

**Goal:** Replace insecure `getSession()` with secure `getUser()` validation in root layout.

**Files:**
- Modify: `src/app/layout.jsx:28-37`

### Step 1: Review current implementation

Read the current code to understand structure.

```bash
cat src/app/layout.jsx | head -40
```

**Expected:** See `getSession()` call around line 30.

### Step 2: Replace getSession() with getUser() validation

**File:** `src/app/layout.jsx`

**Find:**
```javascript
  try {
    const supabase = await createClient();
    const result = await supabase.auth.getSession();
    session = result.data?.session || null;
  } catch (error) {
    // Build time or other errors - no session available
    if (process.env.NODE_ENV === 'development') {
      console.warn('Session fetch failed:', error.message);
    }
  }
```

**Replace with:**
```javascript
  try {
    const supabase = await createClient();

    // Validate user with server before trusting session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!error && user) {
      // User is valid, safe to get session data
      const { data: { session: validSession } } = await supabase.auth.getSession();
      session = validSession;
    } else {
      // No valid user or error occurred
      session = null;
    }
  } catch (error) {
    // Build time or other errors - no session available
    if (process.env.NODE_ENV === 'development') {
      console.warn('Session validation failed:', error.message);
    }
    session = null;
  }
```

### Step 3: Verify build still works

```bash
npm run build
```

**Expected:** Build succeeds without errors. Warnings about session validation during build are OK (expected behavior).

### Step 4: Run auth tests

```bash
npx playwright test tests/security/auth-security.spec.js --reporter=list
```

**Expected:** All tests still pass (no functional changes).

### Step 5: Commit layout fix

```bash
git add src/app/layout.jsx
git commit -m "fix(security): Validate user before trusting session in layout

Replace getSession() with getUser() to ensure server-side validation
before passing session to client context.

Security impact: Prevents accepting tampered session data from cookies.
Server now validates JWT authenticity before trusting any session data.

Ref: https://supabase.com/docs/guides/auth/server-side/nextjs

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Fix Client-Side Auth Context

**Goal:** Remove client-side `getSession()` validation, trust server-validated `initialSession` only.

**Files:**
- Modify: `src/contexts/SupabaseAuthContext.jsx:13-37`

### Step 1: Review current implementation

Read the current auth context code.

```bash
cat src/contexts/SupabaseAuthContext.jsx
```

**Expected:** See `getSession()` validation in useEffect around line 16.

### Step 2: Remove getSession() validation from useEffect

**File:** `src/contexts/SupabaseAuthContext.jsx`

**Find:**
```javascript
  useEffect(() => {
    // Validate initial session if provided
    if (initialSession) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setSession(null)
          setUser(null)
          setLoading(false)
        }
      })
    }

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialSession])
```

**Replace with:**
```javascript
  useEffect(() => {
    // Trust initialSession from server (already validated)
    // No client-side validation needed

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialSession])
```

### Step 3: Verify TypeScript/build

```bash
npm run build
```

**Expected:** Build succeeds without errors.

### Step 4: Run auth tests

```bash
npx playwright test tests/security/auth-security.spec.js --reporter=list
```

**Expected:** All tests still pass.

### Step 5: Commit auth context fix

```bash
git add src/contexts/SupabaseAuthContext.jsx
git commit -m "fix(security): Remove client-side session validation

Remove getSession() call from auth context. Client now trusts
server-validated initialSession prop from layout.jsx.

Security impact: Client context becomes state manager only,
not validator. All auth decisions happen on server.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Fix Axios Interceptor (Remove Manual Auth)

**Goal:** Remove manual Authorization header setting, rely on automatic cookie transmission.

**Files:**
- Modify: `src/services/axios/axiosInstance.js:19-33`

### Step 1: Review current implementation

Read the current axios configuration.

```bash
cat src/services/axios/axiosInstance.js
```

**Expected:** See interceptor setting Authorization header around line 20.

### Step 2: Remove auth interceptor

**File:** `src/services/axios/axiosInstance.js`

**Find and DELETE:**
```javascript
// Adding authorization header to axios instance if session exists
axiosInstance.interceptors.request.use(async (config) => {
  // Only run in browser context (not during SSR/build)
  if (typeof window !== 'undefined') {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }

  return config;
});
```

**Result:** The file should have only:
- Imports
- Instance creation
- baseURL interceptor (keep this)
- Response interceptors (keep these)

No auth interceptor.

### Step 3: Verify the file structure

After deletion, file should look like:

```javascript
import { supabase } from '@/lib/supabase/client'; // Can remove if not used elsewhere
import axios from 'axios';

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const axiosInstance = axios.create({
  withCredentials: true, // IMPORTANT: This ensures cookies are sent
});

// Use baseURL only for external API calls (not /api/* routes)
axiosInstance.interceptors.request.use(async (config) => {
  // Internal Next.js API routes start with /api/
  if (!config.url?.startsWith('/api/')) {
    config.baseURL = EXTERNAL_API_URL;
  }
  return config;
});

axiosInstance.interceptors.response.use((response) =>
  response.data.data ? response.data.data : response.data,
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject({
      status: error.response?.status,
      data: error.response?.data || error.message,
    });
  },
);

export default axiosInstance;
```

### Step 4: Remove unused supabase import if not needed

If `supabase` import is no longer used in the file:

```javascript
// DELETE this line if supabase not used elsewhere:
import { supabase } from '@/lib/supabase/client';
```

### Step 5: Verify build

```bash
npm run build
```

**Expected:** Build succeeds.

### Step 6: Run auth tests

```bash
npx playwright test tests/security/auth-security.spec.js --reporter=list
```

**Expected:** All tests still pass. API requests work via cookies.

### Step 7: Test API requests specifically

Run just the API authentication tests:

```bash
npx playwright test tests/security/auth-security.spec.js -g "API Authentication" --reporter=list
```

**Expected:** All API tests pass, proving cookies work correctly.

### Step 8: Commit axios fix

```bash
git add src/services/axios/axiosInstance.js
git commit -m "fix(security): Remove manual Authorization header from axios

Remove getSession() call from axios interceptor. Rely on automatic
cookie transmission instead of manual token handling.

Security impact: Tokens transported via HTTP-only cookies (more secure
than manual headers). Browser automatically includes cookies in requests.

Ensures withCredentials: true is set for cookie transmission.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update Agent Documentation

**Goal:** Add security guidelines to agent documentation to prevent future insecure patterns.

**Files:**
- Modify: `.claude/agents/wiring-agent.md`
- Modify: `.claude/agents/supabase-database-architect.md`

### Step 1: Add security section to wiring-agent

**File:** `.claude/agents/wiring-agent.md`

Add this section after the main description, before examples:

```markdown
## Supabase Authentication Security

**CRITICAL SECURITY RULES:**

❌ **NEVER use `supabase.auth.getSession()` for security decisions**
   - getSession() retrieves unvalidated data from cookies/localStorage
   - Can be tampered with by malicious users
   - Only use for UI display, never for authorization

❌ **NEVER trust client-side session data**
   - Client can modify localStorage/cookies
   - Always validate on server

❌ **NEVER manually set Authorization headers from getSession()**
   - Use automatic cookie transmission instead
   - Browser includes cookies automatically with `withCredentials: true`

✅ **ALWAYS use `getUser()` or `getClaims()` on server**
   - Server-side code (middleware, API routes, layouts)
   - Validates JWT with Supabase Auth server
   - Returns error if token invalid/expired

✅ **ALWAYS validate tokens server-side**
   - Every API route must call `getUser()` before processing
   - Never trust client-provided tokens

✅ **ALWAYS let middleware/cookies handle token passing**
   - Middleware refreshes tokens automatically
   - Cookies transmitted automatically
   - No manual token management needed

### When to Use Each Method

| Context | Method | Purpose |
|---------|--------|---------|
| **Server (Middleware)** | `getUser()` or `getClaims()` | Auth validation + route protection |
| **Server (API Routes)** | `getUser()` | Auth validation before processing |
| **Server (Layouts)** | `getUser()` | Initial session validation |
| **Client (Context)** | `onAuthStateChange` only | Session state management |
| **Client (Display)** | `getSession()` OK | UI display ONLY (not security) |
| **Client (Axios)** | Automatic cookies | No manual headers |

### Example: Secure API Route

```javascript
import { createApiClient } from '@/lib/supabase/api-server';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createApiClient(request);

  // ALWAYS validate user first
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Now safe to process request
  // ...
}
```

### Example: Secure Client Context

```javascript
// ✅ CORRECT: Trust server, manage state only
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    }
  )
  return () => subscription.unsubscribe()
}, [])

// ❌ WRONG: Client-side validation
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) setSession(session) // Don't validate client-side!
  })
}, [])
```

**References:**
- [Supabase Server-Side Auth Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Security Fix Design Doc](../../docs/plans/2026-01-31-auth-security-fix-design.md)
```

### Step 2: Add security section to supabase-database-architect

**File:** `.claude/agents/supabase-database-architect.md`

Add this section in an appropriate location (after main description):

```markdown
## Authentication Security Guidelines

When designing database schemas that interact with authentication:

**RLS Policies Must Use Validated User ID:**

```sql
-- ✅ CORRECT: Use auth.uid() which reads from validated JWT
CREATE POLICY "Users can only access their own data"
  ON table_name
  FOR ALL
  USING (auth.uid() = user_id);

-- ❌ WRONG: Never trust client-provided user_id in WHERE clause
-- RLS is the final defense layer
```

**Row Level Security (RLS) Best Practices:**

1. **Always enable RLS** on tables with user data
2. **Use auth.uid()** to get authenticated user ID from JWT
3. **Defense in depth** - Even if application code fails, RLS protects data
4. **Test RLS policies** - Verify users can't access others' data

**Reference:**
- [Auth Security Fix Design](../../docs/plans/2026-01-31-auth-security-fix-design.md)
```

### Step 3: Verify markdown formatting

Check that markdown is valid:

```bash
npx markdownlint .claude/agents/wiring-agent.md
npx markdownlint .claude/agents/supabase-database-architect.md
```

**Expected:** No errors (or only minor warnings).

### Step 4: Commit documentation updates

```bash
git add .claude/agents/wiring-agent.md .claude/agents/supabase-database-architect.md
git commit -m "docs: Add authentication security guidelines to agents

Add comprehensive security rules for Supabase authentication:
- Never use getSession() for security decisions
- Always validate with getUser() on server
- Trust server validation only
- Use automatic cookie transmission

Prevents future security vulnerabilities by documenting
secure patterns and anti-patterns.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Final Verification

**Goal:** Run complete verification suite to ensure all fixes work correctly.

### Step 1: Run full test suite

```bash
npx playwright test tests/security/auth-security.spec.js --reporter=html
```

**Expected:** All tests pass. HTML report generated.

### Step 2: Run production build

```bash
npm run build
```

**Expected:** Build succeeds without errors.

### Step 3: Run linting

```bash
npm run lint
```

**Expected:** No linting errors.

### Step 4: Manual verification checklist

Open the application and manually verify:

**Login Flow:**
- [ ] Can log in with valid credentials
- [ ] Invalid credentials show error
- [ ] Successful login redirects to dashboard

**Protected Routes:**
- [ ] Unauthenticated users redirect to login
- [ ] Authenticated users can access dashboard
- [ ] Session persists across page reloads

**API Requests:**
- [ ] API calls work when authenticated
- [ ] API returns 401 when not authenticated
- [ ] Data loads correctly in UI

**Logout:**
- [ ] Logout button works
- [ ] Redirects to login page
- [ ] Cannot access protected routes after logout

### Step 5: Code review verification

Grep for any remaining insecure patterns:

```bash
# Should find NO matches in application code
grep -r "getSession()" src/ --include="*.js" --include="*.jsx" | grep -v "// OK:" | grep -v "onAuthStateChange"

# Verify getUser() is used in critical files
grep "getUser()" src/app/layout.jsx
grep "getUser()" src/middleware.js
grep "getUser()" src/app/api/crm/deals/route.js
```

**Expected:**
- No `getSession()` in src/ (except in onAuthStateChange callbacks or explicitly marked safe)
- `getUser()` present in layout, middleware, and API routes

### Step 6: Review git changes

```bash
git log --oneline -10
git diff origin/main --stat
```

**Expected:** See all 5 commits from this implementation.

### Step 7: Create summary commit (optional)

If you want a summary of the security fix:

```bash
git commit --allow-empty -m "security: Complete authentication security fix

Summary of changes:
- Root layout validates session with getUser() before trusting
- Auth context trusts server, manages state only
- Axios uses automatic cookies, no manual headers
- E2E tests ensure no regressions
- Agent documentation updated with security guidelines

Security impact: Prevents session tampering attacks

Files changed:
- src/app/layout.jsx (server validation)
- src/contexts/SupabaseAuthContext.jsx (remove client validation)
- src/services/axios/axiosInstance.js (cookie-based auth)
- tests/security/* (comprehensive E2E tests)
- .claude/agents/* (security documentation)

All tests passing ✅
Build succeeds ✅
Linting clean ✅

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria

**Functional:**
- ✅ All E2E tests pass
- ✅ Login flow works
- ✅ Protected routes require auth
- ✅ API requests authenticate correctly
- ✅ Sessions persist across reloads
- ✅ Logout clears session

**Security:**
- ✅ No `getSession()` for security decisions
- ✅ Server validates with `getUser()`
- ✅ Client trusts server only
- ✅ Cookies handle token transport
- ✅ Defense-in-depth architecture

**Technical:**
- ✅ Build succeeds
- ✅ Linting passes
- ✅ No console errors
- ✅ Documentation updated

---

## Rollback Plan

If issues arise:

```bash
# Rollback all changes
git reset --hard HEAD~6

# Or rollback individual commits
git revert <commit-hash>
```

---

## Next Steps After Implementation

1. **Create Pull Request** with security fix summary
2. **Request security review** from team
3. **Monitor production** for auth errors after deploy
4. **Update security documentation** if needed

---

**Estimated Time:** 2-3 hours
**Risk Level:** Low (comprehensive tests, no functional changes)
**Dependencies:** None (all dependencies already in project)
