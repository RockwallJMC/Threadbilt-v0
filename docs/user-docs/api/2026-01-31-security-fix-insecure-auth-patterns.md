# Security Fix: Replace Insecure Auth Patterns

**Date:** 2026-01-31
**Priority:** CRITICAL - Security Vulnerability
**Type:** Bug Fix / Security Patch

## Executive Summary

Replace all insecure `getSession()` calls with secure authentication patterns following Supabase best practices. Current implementation uses client-side session data without server validation, creating a security vulnerability where attackers can tamper with authentication tokens.

---

## Phase 1: Root Cause Investigation ✅

### Security Vulnerability: Unvalidated Session Data

**Root Cause:** Using `supabase.auth.getSession()` retrieves session data directly from client-side storage (cookies/localStorage) without cryptographic verification. This data can be tampered with.

### Affected Files

1. **[src/contexts/SupabaseAuthContext.jsx:16](../src/contexts/SupabaseAuthContext.jsx#L16)** - CRITICAL
   - Line 16: Uses `getSession()` to validate initial session
   - Lines 28-30: Uses user data from `onAuthStateChange()` callback directly

2. **[src/services/axios/axiosInstance.js:25](../src/services/axios/axiosInstance.js#L25)** - HIGH
   - Uses `getSession()` to extract access token for API authorization headers

3. **[src/middleware.js:31](../src/middleware.js#L31)** - SECURE ✅
   - Correctly uses `getUser()` for server-side validation

### Why This is Critical

**From Supabase Official Documentation:**

> "Always use `supabase.auth.getUser()` to protect pages and user data. Never trust `supabase.auth.getSession()` inside server code such as middleware. It isn't guaranteed to revalidate the Auth token."

**Security Impact:**
- ❌ Attackers can manipulate localStorage/cookies to impersonate users
- ❌ No protection against token tampering
- ❌ Session data cannot be trusted for authorization decisions
- ❌ Access tokens in axios headers may be invalid/expired/forged

### Method Comparison

| Method | Use Case | Security | Performance | Validates Token |
|--------|----------|----------|-------------|-----------------|
| `getSession()` | ❌ Not recommended | INSECURE | Fast | ❌ No |
| `getUser()` | ✅ Server-side auth | SECURE | Slower | ✅ Yes (contacts Auth server) |
| `getClaims()` | ✅ **RECOMMENDED** | SECURE | Fast | ✅ Yes (validates JWT signature) |

---

## Phase 2: Pattern Analysis ✅

### Working Examples in Codebase

**✅ SECURE Pattern (middleware.js:31):**
```javascript
const { data: { user } } = await supabase.auth.getUser()
if (!user) {
  return NextResponse.redirect(loginUrl)
}
```

**✅ SECURE Pattern (API routes):**
```javascript
const supabase = createApiClient(request)
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Supabase Official Recommendations

**From Next.js App Router Documentation:**

1. **Server-side (Middleware/API Routes):**
   - Use `getClaims()` for best performance with security
   - Falls back to `getUser()` if `getClaims()` not available
   - Validates JWT signature against published public keys

2. **Client-side (React Context):**
   - OK to use `getSession()` for UI display only
   - NOT for security decisions
   - Should rely on server-side validation for protection

3. **Session Refresh:**
   - Middleware should refresh tokens automatically
   - Pass refreshed tokens via cookies
   - Client context listens to `onAuthStateChange`

### Differences Between Working and Broken

| Aspect | ❌ INSECURE (Current) | ✅ SECURE (Target) |
|--------|---------------------|-------------------|
| **Auth Context** | Validates with `getSession()` | Manages session from `onAuthStateChange` only |
| **Token Trust** | Trusts unverified tokens | Never trusts client-side tokens |
| **Axios Interceptor** | Gets token via `getSession()` | Gets token from secure context/cookies |
| **Security Model** | Client-side validation | Server-side validation only |

---

## Phase 3: Implementation Plan

### 3.1 Fix Client-Side Auth Context

**File:** `src/contexts/SupabaseAuthContext.jsx`

**Problem:**
- Line 16: `getSession()` used to validate initial session
- Lines 28-30: User data from `onAuthStateChange` used without validation

**Solution:**
```javascript
// BEFORE (INSECURE):
supabase.auth.getSession().then(({ data: { session } }) => {
  if (!session) {
    setSession(null)
    setUser(null)
  }
})

// AFTER (SECURE):
// Don't validate initial session client-side
// Let middleware handle validation
// Context only manages session state from auth events
```

**Implementation:**
1. Remove `getSession()` call on line 16
2. Trust `initialSession` prop (validated by server)
3. Only update session from `onAuthStateChange` events
4. Never use session data for security decisions

### 3.2 Fix Axios Interceptor

**File:** `src/services/axios/axiosInstance.js`

**Problem:**
- Line 25: `getSession()` used to extract access token

**Solution:**
```javascript
// BEFORE (INSECURE):
const { data: { session } } = await supabase.auth.getSession()
if (session?.access_token) {
  config.headers.Authorization = `Bearer ${session.access_token}`
}

// AFTER (SECURE):
// Option 1: Get token from cookies (handled by middleware)
// Cookies are automatically sent with requests

// Option 2: Use getClaims() for validated token
const { data: { claims } } = await supabase.auth.getClaims()
// But getClaims() may not be available on client
```

**Recommended Approach:**
- Remove manual Authorization header setting
- Let browser send cookies automatically
- API routes will extract token from cookies via `createApiClient(request)`

### 3.3 Update Middleware (Optional Optimization)

**File:** `src/middleware.js`

**Current:** Uses `getUser()` ✅ Secure but slower
**Recommended:** Use `getClaims()` for better performance

```javascript
// CURRENT (SECURE):
const { data: { user } } = await supabase.auth.getUser()

// OPTIMIZED (SECURE + FASTER):
const { data: { user } } = await supabase.auth.getClaims()
```

### 3.4 Update Agent Documentation

**File:** `.claude/agents/wiring-agent.md` and `.claude/agents/supabase-database-architect.md`

Add security guidelines:
```markdown
## Supabase Authentication Security

**CRITICAL SECURITY RULES:**

❌ NEVER use `supabase.auth.getSession()` for security decisions
❌ NEVER trust client-side session data
❌ NEVER manually set Authorization headers from `getSession()`

✅ ALWAYS use `getUser()` or `getClaims()` on server
✅ ALWAYS validate tokens server-side
✅ ALWAYS let middleware/cookies handle token passing

**When to Use Each Method:**

| Context | Method | Purpose |
|---------|--------|---------|
| Middleware | `getClaims()` or `getUser()` | Auth validation |
| API Routes | `getUser()` | Auth validation |
| Client Context | `onAuthStateChange` only | Session state management |
| Client Display | `getSession()` OK | UI display only (NOT security) |
```

---

## Phase 4: Testing Strategy

### 4.1 Security Tests

Create tests to verify:
1. ✅ Client cannot bypass auth with tampered localStorage
2. ✅ API routes reject invalid/expired tokens
3. ✅ Middleware properly validates tokens
4. ✅ Axios requests include valid tokens

### 4.2 Integration Tests

Verify:
1. ✅ Login flow works end-to-end
2. ✅ Session refresh works automatically
3. ✅ Protected routes redirect unauthenticated users
4. ✅ API calls authenticate properly

### 4.3 Regression Tests

Ensure:
1. ✅ Existing auth flows continue working
2. ✅ No breaking changes to user experience
3. ✅ Build succeeds
4. ✅ Linting passes

---

## Phase 5: Rollout Plan

### Step 1: Create Security Test Suite
- Implement failing tests for current insecure patterns
- Document expected secure behavior

### Step 2: Fix Client-Side Auth Context
- Remove `getSession()` validation
- Update to trust server-validated sessions only
- Test auth flows

### Step 3: Fix Axios Interceptor
- Remove manual token setting
- Rely on cookie-based authentication
- Test API requests

### Step 4: Update Documentation
- Update agent prompts with security rules
- Document secure patterns for future development

### Step 5: Verify and Deploy
- Run all tests
- Run build
- Run linting
- Code review
- Merge to main

---

## References

### Supabase Documentation
- [User Sessions](https://supabase.com/docs/guides/auth/sessions)
- [Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [getSession() API Reference](https://supabase.com/docs/reference/javascript/auth-getsession)

### GitHub Discussions
- [getUser() is too slow and getSession() is insecure](https://github.com/orgs/supabase/discussions/28983)
- [Security and performance risk with getUser and getSession](https://github.com/supabase/auth-js/issues/898)
- [Clarify when to use getClaims and getUser](https://github.com/supabase/supabase/issues/40985)

---

## Success Criteria

✅ No `getSession()` calls used for security decisions
✅ All auth validation happens server-side
✅ Tests pass with secure patterns
✅ Build and lint succeed
✅ Agent documentation updated with security rules
✅ Code review completed

---

**Status:** Phase 2 Complete - Ready for Phase 3 (Test Creation)
**Next Action:** Create failing test suite to verify insecure patterns
