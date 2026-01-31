# Authentication Security Fix - Design Document

**Date:** 2026-01-31
**Priority:** CRITICAL - Security Vulnerability
**Type:** Security Refactoring
**Status:** Design Validated - Ready for Implementation

---

## Executive Summary

Replace all insecure `getSession()` calls with secure authentication patterns following Supabase best practices. Current implementation retrieves session data from client-side storage without cryptographic verification, creating a security vulnerability where attackers can tamper with authentication tokens.

**Impact:** Zero functional changes to user experience. All authentication flows continue working identically. Only the internal security implementation changes.

---

## 1. Architecture Overview

### Current Security Vulnerability

The application currently uses `supabase.auth.getSession()` in three critical locations, which retrieves session data from client-side storage (localStorage/cookies) without cryptographic verification:

1. **Root Layout** ([src/app/layout.jsx:30](../../src/app/layout.jsx#L30)) - Server-side ❌
2. **Auth Context** ([src/contexts/SupabaseAuthContext.jsx:16](../../src/contexts/SupabaseAuthContext.jsx#L16)) - Client-side ❌
3. **Axios Interceptor** ([src/services/axios/axiosInstance.js:25](../../src/services/axios/axiosInstance.js#L25)) - Client-side ❌

This creates attack vectors where malicious users can tamper with session data to impersonate others or bypass authentication.

### Target Architecture

We'll implement a defense-in-depth authentication strategy:

**Server Layer (Middleware + Layout):**
- Middleware: Uses `getUser()` for route protection ✅ (already secure)
- Root Layout: Change `getSession()` to `getUser()` for initial session validation
- API Routes: Continue using `getUser()` ✅ (already secure)

**Client Layer (Auth Context):**
- Replace `getSession()` validation with trust in server-validated `initialSession`
- Manage session state from `onAuthStateChange` events only
- Client context becomes state manager, not validator

**Request Layer (Axios):**
- Remove manual Authorization header setting entirely
- Rely on browser's automatic cookie transmission
- Let server-side code extract tokens from cookies

This creates a zero-trust model where tokens are always validated server-side, never blindly trusted from client-side storage.

### Security Principles

1. **Server-Side Validation Only:** All authentication decisions happen on the server
2. **Cookie-Based Transport:** Tokens transmitted via HTTP-only cookies (more secure than localStorage)
3. **No Client-Side Trust:** Client code manages state but never makes security decisions
4. **Defense in Depth:** Multiple layers (middleware, layout, API routes, RLS) validate independently

---

## 2. Component Changes

### Change 1: Root Layout (src/app/layout.jsx)

**Current (INSECURE):**
```javascript
try {
  const supabase = await createClient();
  const result = await supabase.auth.getSession();
  session = result.data?.session || null;
} catch (error) {
  // Handle error
}
```

**New (SECURE):**
```javascript
try {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (!error && user) {
    // Only get session after validating user exists
    const { data: { session } } = await supabase.auth.getSession();
    session = session;
  } else {
    session = null;
  }
} catch (error) {
  // Build time or other errors - no session available
  session = null;
}
```

**Rationale:**
- Server-side code must validate tokens with Supabase Auth server
- `getUser()` makes a network request to verify the JWT is authentic
- Only after validation can we trust session data
- Graceful degradation during build time when cookies unavailable

**Lines Changed:** 28-37

---

### Change 2: Auth Context (src/contexts/SupabaseAuthContext.jsx)

**Current (INSECURE):**
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

**New (SECURE):**
```javascript
useEffect(() => {
  // Trust initialSession (already validated by server)
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

**Rationale:**
- Remove `getSession()` validation entirely
- Trust `initialSession` prop (validated by server in layout.jsx)
- Context only manages state from auth events
- Simpler code, more secure (no client-side validation)

**Lines Changed:** 13-37

---

### Change 3: Axios Interceptor (src/services/axios/axiosInstance.js)

**Current (INSECURE):**
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

**New (SECURE):**
```javascript
// Remove the entire interceptor
// Cookies are automatically sent by browser
// API routes extract tokens from cookies via createApiClient(request)
```

**Rationale:**
- Next.js App Router pattern uses HTTP-only cookies
- Browser automatically includes cookies in all requests
- No manual token handling needed
- API routes extract tokens using `createApiClient(request)` which reads from cookies
- More secure (cookies can be HTTP-only) and simpler (no manual token management)

**Lines Changed:** Delete lines 19-33

---

## 3. Authentication Data Flow

### Login Flow
1. User submits credentials → Supabase Auth
2. Supabase sets auth cookies in browser (`sb-*-auth-token`)
3. Browser redirects to dashboard
4. **Middleware** intercepts request:
   - Validates token with `getUser()`
   - Refreshes token if near expiry
   - Updates cookies
5. **Layout** renders:
   - Validates session with `getUser()`
   - Passes validated session to client context as `initialSession`
6. **Client context** receives session:
   - Sets up `onAuthStateChange` listener
   - Manages session state (no validation)

### API Request Flow
1. Browser makes axios request to `/api/crm/deals`
2. **Browser automatically includes cookies** (no manual Authorization header)
3. **API route handler:**
   - Creates Supabase client with `createApiClient(request)`
   - Extracts token from request cookies
   - Validates with `getUser()`
   - Returns data or 401 Unauthorized
4. Response returned to client

### Session Refresh Flow
1. **Middleware** detects token near expiry
2. Calls `getUser()` which triggers automatic token refresh
3. Updates response cookies with new tokens
4. Browser receives new cookies
5. **Auth context** receives `TOKEN_REFRESHED` event via `onAuthStateChange`
6. Updates client-side session state
7. All subsequent requests use new token automatically

### Logout Flow
1. User clicks logout
2. Calls `supabase.auth.signOut()`
3. Supabase clears auth cookies
4. **Auth context** receives `SIGNED_OUT` event
5. Updates state: `session = null, user = null`
6. Next navigation triggers **middleware**
7. No valid session found → redirect to login

---

## 4. Testing Strategy

### E2E Security Tests (Playwright)

Create comprehensive test suite that verifies authentication works correctly before AND after the security fix. These tests prove we didn't break functionality while fixing security.

**Test File:** `tests/security/auth-security.spec.js`

#### Test Suite 1: Protected Route Access

```javascript
test('unauthenticated users redirected to login', async ({ page }) => {
  // Clear all cookies/storage
  await page.context().clearCookies();

  // Attempt to access protected route
  await page.goto('/dashboard/crm');

  // Should redirect to login
  await expect(page).toHaveURL(/\/authentication.*login/);
});

test('authenticated users can access dashboard', async ({ page }) => {
  // Login via auth helper
  await loginAsTestUser(page);

  // Navigate to protected route
  await page.goto('/dashboard/crm');

  // Should stay on dashboard
  await expect(page).toHaveURL('/dashboard/crm');
  await expect(page.locator('h1')).toContainText('CRM');
});
```

#### Test Suite 2: API Authentication

```javascript
test('API rejects unauthenticated requests', async ({ request }) => {
  const response = await request.get('/api/crm/deals');
  expect(response.status()).toBe(401);

  const body = await response.json();
  expect(body.error).toBe('Unauthorized');
});

test('API accepts authenticated requests', async ({ page }) => {
  // Login via auth helper
  await loginAsTestUser(page);

  // Make API request (cookies automatically included)
  const response = await page.request.get('/api/crm/deals');
  expect(response.status()).toBe(200);

  const deals = await response.json();
  expect(Array.isArray(deals)).toBe(true);
});

test('API rejects requests with tampered cookies', async ({ page }) => {
  // Login first
  await loginAsTestUser(page);

  // Tamper with auth cookie
  const cookies = await page.context().cookies();
  const authCookie = cookies.find(c => c.name.includes('auth-token'));
  await page.context().addCookies([{
    ...authCookie,
    value: 'tampered-token-value'
  }]);

  // API should reject
  const response = await page.request.get('/api/crm/deals');
  expect(response.status()).toBe(401);
});
```

#### Test Suite 3: Session Persistence

```javascript
test('session persists across page reloads', async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto('/dashboard/crm');

  // Reload page
  await page.reload();

  // Should still be authenticated
  await expect(page).toHaveURL('/dashboard/crm');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});

test('session persists across navigation', async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto('/dashboard/crm');
  await page.goto('/dashboard/projects');
  await page.goto('/dashboard/crm');

  // Should still be authenticated
  await expect(page).toHaveURL('/dashboard/crm');
});

test('logout clears session completely', async ({ page }) => {
  await loginAsTestUser(page);
  await page.goto('/dashboard/crm');

  // Click logout
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');

  // Wait for redirect to login
  await expect(page).toHaveURL(/\/authentication.*login/);

  // Attempt to access dashboard again
  await page.goto('/dashboard/crm');

  // Should redirect back to login
  await expect(page).toHaveURL(/\/authentication.*login/);
});
```

### Code Review Verification Checklist

After implementation, manually verify:

- [ ] No `getSession()` calls used for security decisions
- [ ] Server-side code (layout, middleware, API routes) uses `getUser()` for validation
- [ ] Client context only manages state, doesn't validate
- [ ] No manual Authorization headers in axios
- [ ] All auth cookies use Secure, HttpOnly, SameSite flags
- [ ] Build succeeds without errors
- [ ] Linting passes
- [ ] All E2E tests pass

---

## 5. Error Handling & Edge Cases

### Error Scenarios

#### 1. Expired/Invalid Tokens

**Server (Layout):**
```javascript
const { data: { user }, error } = await supabase.auth.getUser();
if (error) {
  // Token invalid/expired
  session = null; // Client shows logged out state
}
```

**Server (API Routes):**
```javascript
const { data: { user }, error: authError } = await supabase.auth.getUser();
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**Client (Context):**
```javascript
// Receives SIGNED_OUT event from onAuthStateChange
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT') {
    setSession(null);
    setUser(null);
  }
})
```

#### 2. Network Failures

**Server validation fails:**
```javascript
try {
  const { data: { user }, error } = await supabase.auth.getUser();
  // Handle error
} catch (error) {
  console.warn('Auth validation failed:', error.message);
  session = null; // Graceful degradation
}
```

**API requests fail:**
- Axios error handling already in place
- Returns appropriate HTTP status (500, network error)
- Client handles via error states

**Auth state change listener fails:**
- Error logged to console
- State remains unchanged
- User remains authenticated until explicit logout

#### 3. Build Time / SSR Edge Cases

**Layout during build:**
```javascript
try {
  const supabase = await createClient();
  // ... auth code
} catch (error) {
  // Build time - cookies unavailable
  session = null; // Safe default
}
```

**Server components:**
- Use `createClient()` which handles missing cookies gracefully
- Mock cookie store during build (see implementation in server.js)

**Client hydration:**
- `initialSession` from server may be `null`
- Context handles null session correctly
- No hydration mismatches

### Security Considerations

#### Defense in Depth Layers

1. **Middleware (First Line):**
   - Validates all requests to `/dashboard/*`
   - Redirects unauthenticated users
   - Refreshes tokens automatically

2. **Layout (Second Line):**
   - Validates session before passing to client
   - Ensures client starts with verified session

3. **API Routes (Independent Validation):**
   - Never trusts client
   - Validates every request independently
   - Returns 401 if invalid

4. **RLS Policies (Final Safeguard):**
   - Database enforces user isolation
   - Even if all else fails, data is protected
   - Users can only access their own records

#### Cookie Security

Supabase automatically sets cookies with:
- `Secure` flag (HTTPS only in production)
- `SameSite=Lax` (CSRF protection)
- `HttpOnly` where possible (prevents JavaScript access)
- Automatic refresh via middleware (prevents stale tokens)

#### What We're NOT Changing

These components are already secure and remain unchanged:

- ✅ Middleware auth validation (already uses `getUser()`)
- ✅ API route auth validation (already uses `getUser()`)
- ✅ RLS policies (database-level security)
- ✅ Supabase client creation (already uses `@supabase/ssr`)
- ✅ Cookie configuration (handled by Supabase)

---

## 6. Rollout Strategy

### Pre-Implementation

1. **Run baseline tests:**
   ```bash
   npx playwright test tests/security/auth-security.spec.js
   ```
   - Establish baseline (some may fail due to insecure patterns)
   - Document current behavior

2. **Create feature branch:**
   ```bash
   git checkout -b security/fix-insecure-auth-patterns
   ```

### Implementation Phase

Execute all three fixes atomically in single commit:

1. Fix `src/app/layout.jsx` (Change 1)
2. Fix `src/contexts/SupabaseAuthContext.jsx` (Change 2)
3. Fix `src/services/axios/axiosInstance.js` (Change 3)
4. Create E2E test suite `tests/security/auth-security.spec.js`

### Verification Phase

1. **Run tests:**
   ```bash
   npx playwright test tests/security/auth-security.spec.js
   npm run build
   npm run lint
   ```

2. **Code review checklist:**
   - [ ] No `getSession()` for security decisions
   - [ ] Server uses `getUser()` for validation
   - [ ] Client context only manages state
   - [ ] No manual Authorization headers
   - [ ] All tests pass

3. **Manual verification:**
   - [ ] Login flow works
   - [ ] Protected routes require auth
   - [ ] API requests authenticate correctly
   - [ ] Logout clears session
   - [ ] Session persists across reloads

### Post-Deployment

1. **Monitor error logs** for auth failures
2. **Watch for 401 errors** in API responses
3. **Verify session refresh** works automatically
4. **Confirm no user complaints** about unexpected logouts

---

## 7. Success Criteria

### Functional Requirements

- ✅ All authentication flows work identically to before
- ✅ Users can log in successfully
- ✅ Protected routes require authentication
- ✅ API requests authenticate correctly
- ✅ Sessions persist across page reloads
- ✅ Logout clears session completely
- ✅ Session refresh happens automatically

### Security Requirements

- ✅ No `getSession()` calls for security decisions
- ✅ All server-side code validates with `getUser()`
- ✅ Client-side code never makes security decisions
- ✅ Tokens transmitted via HTTP-only cookies
- ✅ Defense-in-depth architecture implemented
- ✅ RLS policies provide final safeguard

### Technical Requirements

- ✅ All E2E tests pass
- ✅ Build succeeds without errors
- ✅ Linting passes
- ✅ No TypeScript errors
- ✅ No console errors/warnings
- ✅ Code review approved

---

## 8. References

### Supabase Official Documentation

- [User Sessions](https://supabase.com/docs/guides/auth/sessions)
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [getSession() API Reference](https://supabase.com/docs/reference/javascript/auth-getsession)
- [getUser() API Reference](https://supabase.com/docs/reference/javascript/auth-getuser)

### GitHub Discussions & Issues

- [getUser() is too slow and getSession() is insecure](https://github.com/orgs/supabase/discussions/28983)
- [Security and performance risk with getUser and getSession](https://github.com/supabase/auth-js/issues/898)
- [Clarify when to use getClaims and getUser](https://github.com/supabase/supabase/issues/40985)

### Related Documentation

- [Initial security vulnerability analysis](./2026-01-31-security-fix-insecure-auth-patterns.md)
- [CLAUDE.md - Authentication patterns](../../CLAUDE.md)

---

## Appendix: Comparison Table

| Aspect | Before (INSECURE) | After (SECURE) |
|--------|-------------------|----------------|
| **Layout validation** | `getSession()` (unverified) | `getUser()` (server-verified) |
| **Client context** | Validates with `getSession()` | Trusts server, manages state only |
| **Axios auth** | Manual header from `getSession()` | Automatic cookies |
| **Token transport** | Manual Authorization header | HTTP-only cookies |
| **Security model** | Client-side validation | Server-side validation only |
| **Attack surface** | Can tamper localStorage/cookies | Server validates all tokens |
| **Token refresh** | Manual | Automatic via middleware |

---

**Status:** Design Complete ✅
**Next Step:** Create implementation plan
**Estimated Effort:** 2-3 hours (implementation + testing)
**Risk Level:** Low (no functional changes, comprehensive tests)
