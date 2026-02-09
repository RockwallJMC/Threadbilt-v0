# Supabase Auth Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace NextAuth.js with Supabase Auth while maintaining existing Aurora UI/UX.

**Architecture:** Browser + server Supabase clients with cookie-based session persistence. Auth context provider wraps app, middleware protects routes server-side, hooks protect client-side. Axios interceptor injects Supabase JWT for backend API calls.

**Tech Stack:** Next.js 15 (App Router), Supabase Auth (@supabase/ssr, @supabase/supabase-js), React 19, Material-UI 7

---

## Task 1: Create Supabase Client Files

**Files:**
- Create: `src/lib/supabase/client.js`
- Create: `src/lib/supabase/server.js`

**Step 1: Create browser client**

Create `src/lib/supabase/client.js`:

```javascript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**Step 2: Create server client**

Create `src/lib/supabase/server.js`:

```javascript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting in middleware
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            // Handle cookie removal in middleware
          }
        },
      },
    }
  )
}
```

**Step 3: Verify environment variables**

Run: `grep SUPABASE .env`

Expected output showing:
```
NEXT_PUBLIC_SUPABASE_URL=https://iixfjulmrexivuehoxti.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Step 4: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat(auth): add Supabase client initialization

- Browser client for client components
- Server client with cookie access
- Ready for auth context integration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Auth Context Provider

**Files:**
- Create: `src/contexts/SupabaseAuthContext.jsx`

**Step 1: Create auth context with provider**

Create `src/contexts/SupabaseAuthContext.jsx`:

```javascript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
})

export const SupabaseAuthProvider = ({ children, initialSession }) => {
  const [session, setSession] = useState(initialSession)
  const [user, setUser] = useState(initialSession?.user ?? null)
  const [loading, setLoading] = useState(!initialSession)

  useEffect(() => {
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
  }, [])

  const value = {
    session,
    user,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  }
  return context
}
```

**Step 2: Commit**

```bash
git add src/contexts/SupabaseAuthContext.jsx
git commit -m "feat(auth): add Supabase auth context provider

- Context provides session, user, loading state
- Auth state listener for real-time updates
- useSupabaseAuth hook for consuming components

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Update Root Layout with Supabase Provider

**Files:**
- Modify: `src/app/layout.jsx`

**Step 1: Read current layout**

Run: `cat src/app/layout.jsx | grep -A 5 -B 5 SessionProvider`

Expected: See NextAuth SessionProvider usage

**Step 2: Update imports and session fetching**

In `src/app/layout.jsx`, replace:

```javascript
import { getServerSession } from 'next-auth'
import { SessionProvider } from '@/providers/SessionProvider'
import { authOptions } from '@/lib/next-auth/nextAuthOptions'
```

With:

```javascript
import { createClient } from '@/lib/supabase/server'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'
```

**Step 3: Update session retrieval in RootLayout function**

Replace:

```javascript
const session = await getServerSession(authOptions)
```

With:

```javascript
const supabase = createClient()
const {
  data: { session },
} = await supabase.auth.getSession()
```

**Step 4: Update provider in JSX**

Replace:

```jsx
<SessionProvider session={session}>
  {/* children */}
</SessionProvider>
```

With:

```jsx
<SupabaseAuthProvider initialSession={session}>
  {/* children */}
</SupabaseAuthProvider>
```

**Step 5: Verify syntax**

Run: `npm run build`

Expected: Build should complete (may have type warnings, that's ok)

**Step 6: Commit**

```bash
git add src/app/layout.jsx
git commit -m "feat(auth): integrate Supabase auth in root layout

- Replace NextAuth session with Supabase
- Pass initial session to provider
- Maintains server-side session fetch

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Update Login Page

**Files:**
- Modify: `src/app/(auth)/authentication/default/jwt/login/page.jsx`

**Step 1: Read current login page**

Run: `cat src/app/\(auth\)/authentication/default/jwt/login/page.jsx`

Expected: See NextAuth signIn usage

**Step 2: Update imports**

Replace:

```javascript
import { signIn } from 'next-auth/react'
```

With:

```javascript
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
```

**Step 3: Find and update login handler**

Find the login/submit handler function. Replace NextAuth signIn call:

```javascript
const result = await signIn('credentials', {
  redirect: false,
  email: values.email,
  password: values.password,
})

if (result?.error) {
  // handle error
} else {
  // handle success
}
```

With:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: values.email,
  password: values.password,
})

if (error) {
  // handle error - error.message contains the error
  setErrorMessage(error.message)
} else {
  // handle success - redirect to dashboard
  router.push('/dashboards/default')
}
```

**Step 4: Test build**

Run: `npm run build`

Expected: Build completes successfully

**Step 5: Commit**

```bash
git add src/app/\(auth\)/authentication/default/jwt/login/page.jsx
git commit -m "feat(auth): update login page to use Supabase

- Replace NextAuth signIn with Supabase
- Handle authentication with signInWithPassword
- Redirect to dashboard on success

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Update Signup Page

**Files:**
- Modify: `src/app/(auth)/authentication/default/jwt/sign-up/page.jsx`

**Step 1: Read current signup page**

Run: `cat src/app/\(auth\)/authentication/default/jwt/sign-up/page.jsx`

Expected: See signup/registration logic

**Step 2: Update imports**

Add:

```javascript
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
```

**Step 3: Update signup handler**

Replace the signup API call logic with:

```javascript
const { data, error } = await supabase.auth.signUp({
  email: values.email,
  password: values.password,
  options: {
    data: {
      name: values.name, // or first_name/last_name depending on form
    },
  },
})

if (error) {
  setErrorMessage(error.message)
} else {
  // Supabase may require email confirmation
  // Check if user needs to confirm email
  if (data.user && !data.session) {
    setSuccessMessage('Check your email to confirm your account')
  } else {
    // Auto-logged in, redirect
    router.push('/dashboards/default')
  }
}
```

**Step 4: Test build**

Run: `npm run build`

Expected: Build completes successfully

**Step 5: Commit**

```bash
git add src/app/\(auth\)/authentication/default/jwt/sign-up/page.jsx
git commit -m "feat(auth): update signup page to use Supabase

- Replace API call with Supabase signUp
- Handle email confirmation flow
- Store user metadata (name)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Update Logout Functionality

**Files:**
- Find and modify: Components using NextAuth signOut (likely in profile menu/navbar)

**Step 1: Find signOut usage**

Run: `grep -r "signOut" src/components --include="*.jsx" --include="*.js"`

Expected: Find file(s) with signOut from next-auth/react

**Step 2: Update each file with signOut**

For each file found, replace:

```javascript
import { signOut } from 'next-auth/react'
```

With:

```javascript
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
```

**Step 3: Update signOut calls**

Replace:

```javascript
await signOut({ redirect: false })
router.push('/authentication/default/jwt/login')
```

With:

```javascript
await supabase.auth.signOut()
router.push('/authentication/default/jwt/login')
```

**Step 4: Test build**

Run: `npm run build`

Expected: Build completes successfully

**Step 5: Commit**

```bash
git add src/components/
git commit -m "feat(auth): update logout to use Supabase

- Replace NextAuth signOut with Supabase
- Maintain redirect to login page

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Update Session Usage in Components

**Files:**
- Find and modify: All components using NextAuth useSession

**Step 1: Find useSession usage**

Run: `grep -r "useSession" src/components src/layouts --include="*.jsx" --include="*.js"`

Expected: Find files using NextAuth useSession

**Step 2: Update imports in each file**

Replace:

```javascript
import { useSession } from 'next-auth/react'
```

With:

```javascript
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
```

**Step 3: Update hook usage**

Replace:

```javascript
const { data: session, status } = useSession()
const user = session?.user
```

With:

```javascript
const { session, user, loading } = useSupabaseAuth()
```

**Step 4: Update status/loading checks**

Replace status checks:
- `status === 'loading'` → `loading`
- `status === 'authenticated'` → `!!session` or `!!user`
- `status === 'unauthenticated'` → `!session` or `!user`

**Step 5: Test build**

Run: `npm run build`

Expected: Build completes successfully

**Step 6: Commit**

```bash
git add src/components/ src/layouts/
git commit -m "feat(auth): update components to use Supabase auth hook

- Replace useSession with useSupabaseAuth
- Update loading/status checks
- Maintain component functionality

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Create Route Protection Middleware

**Files:**
- Create: `src/middleware.js`

**Step 1: Create middleware file**

Create `src/middleware.js`:

```javascript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect dashboard routes - redirect to login if not authenticated
  if (request.nextUrl.pathname.startsWith('/dashboards') && !user) {
    const loginUrl = new URL('/authentication/default/jwt/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith('/authentication') && user) {
    const dashboardUrl = new URL('/dashboards/default', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/dashboards/:path*',
    '/authentication/:path*',
    // Add other protected routes here
  ],
}
```

**Step 2: Test build**

Run: `npm run build`

Expected: Build completes successfully

**Step 3: Commit**

```bash
git add src/middleware.js
git commit -m "feat(auth): add route protection middleware

- Protect /dashboards routes (require auth)
- Redirect authenticated users from /authentication
- Server-side protection before page load

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Update Axios Interceptor

**Files:**
- Modify: `src/services/axios/axiosInstance.js`

**Step 1: Read current axios instance**

Run: `cat src/services/axios/axiosInstance.js | grep -A 10 "interceptors.request"`

Expected: See NextAuth session token injection

**Step 2: Update imports**

Replace:

```javascript
import { getSession } from 'next-auth/react'
```

With:

```javascript
import { supabase } from '@/lib/supabase/client'
```

**Step 3: Update request interceptor**

Replace:

```javascript
axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.authToken) {
    config.headers.Authorization = `Bearer ${session.authToken}`
  }
  return config
})
```

With:

```javascript
axiosInstance.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})
```

**Step 4: Test build**

Run: `npm run build`

Expected: Build completes successfully

**Step 5: Commit**

```bash
git add src/services/axios/axiosInstance.js
git commit -m "feat(auth): update axios to inject Supabase JWT

- Replace NextAuth token with Supabase access_token
- Maintain authorization header injection
- Backend receives valid Supabase JWT

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Remove NextAuth Dependencies

**Files:**
- Delete: `src/lib/next-auth/nextAuthOptions.js`
- Delete: `src/providers/SessionProvider.jsx` (if it only wraps NextAuth)
- Modify: `package.json`

**Step 1: Remove NextAuth configuration file**

Run: `rm -f src/lib/next-auth/nextAuthOptions.js`

Expected: File removed

**Step 2: Check SessionProvider**

Run: `cat src/providers/SessionProvider.jsx`

If it only wraps NextAuth SessionProvider, remove it:

Run: `rm -f src/providers/SessionProvider.jsx`

**Step 3: Remove next-auth package**

Run: `npm uninstall next-auth`

Expected: Package removed from package.json and node_modules

**Step 4: Clean up any NextAuth API routes**

Run: `find src/app -name "*auth*" -path "*/api/*" -type f`

If any NextAuth API routes exist (like `src/app/api/auth/[...nextauth]/route.js`), remove them:

Run: `rm -rf src/app/api/auth`

**Step 5: Verify no NextAuth imports remain**

Run: `grep -r "next-auth" src/ --include="*.js" --include="*.jsx"`

Expected: No results (or only in comments/docs)

**Step 6: Test build**

Run: `npm run build`

Expected: Build completes successfully with no NextAuth errors

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor(auth): remove NextAuth dependencies

- Delete NextAuth configuration
- Remove next-auth package
- Clean up NextAuth API routes
- Supabase auth now fully integrated

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 11: Manual Testing

**Prerequisites:**
- Dev server running: `npm run dev`
- Supabase project has email/password auth enabled

**Step 1: Start dev server**

Run: `npm run dev`

Expected: Server starts on http://localhost:4000

**Step 2: Test signup flow**

1. Navigate to: http://localhost:4000/authentication/default/jwt/sign-up
2. Fill in name, email, password
3. Submit form
4. Expected: Either redirect to dashboard OR see "check email" message (if confirmation required)

**Step 3: Check Supabase dashboard**

1. Go to Supabase dashboard → Authentication → Users
2. Expected: New user appears in list

**Step 4: Test login flow**

1. Navigate to: http://localhost:4000/authentication/default/jwt/login
2. Enter same email/password from signup
3. Submit form
4. Expected: Redirect to dashboard

**Step 5: Test protected routes**

1. While logged in, verify dashboard is accessible
2. Click logout
3. Try to access: http://localhost:4000/dashboards/default
4. Expected: Redirect to login page

**Step 6: Test auth page redirect**

1. While logged in, try to access: http://localhost:4000/authentication/default/jwt/login
2. Expected: Redirect to dashboard

**Step 7: Test session persistence**

1. Login successfully
2. Refresh the page
3. Expected: Still logged in (no redirect to login)

**Step 8: Document test results**

Create test results note with any issues found.

---

## Task 12: Create Playwright E2E Tests

**Files:**
- Create: `tests/e2e/auth/supabase-auth.spec.ts`

**Step 1: Create test file**

Create `tests/e2e/auth/supabase-auth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test'

// Generate unique email for test isolation
const generateTestEmail = () => `test-${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'

test.describe('Supabase Authentication', () => {
  test('should signup, login, and logout successfully', async ({ page }) => {
    const testEmail = generateTestEmail()

    // Step 1: Signup
    await page.goto('/authentication/default/jwt/sign-up')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard or confirmation message
    await page.waitForURL(/dashboards|authentication/, { timeout: 10000 })

    // Step 2: If redirected to dashboard, logout first
    const currentUrl = page.url()
    if (currentUrl.includes('dashboards')) {
      // Find and click logout button (adjust selector based on your UI)
      await page.click('[data-testid="logout-button"]') // or appropriate selector
      await page.waitForURL(/authentication/)
    }

    // Step 3: Login
    await page.goto('/authentication/default/jwt/login')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await page.waitForURL(/dashboards/, { timeout: 10000 })
    await expect(page).toHaveURL(/dashboards/)

    // Step 4: Logout
    await page.click('[data-testid="logout-button"]') // Adjust selector
    await page.waitForURL(/authentication/)
    await expect(page).toHaveURL(/authentication/)
  })

  test('should protect dashboard routes when not authenticated', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboards/default')

    // Should redirect to login
    await page.waitForURL(/authentication/, { timeout: 5000 })
    await expect(page).toHaveURL(/authentication/)
  })

  test('should redirect authenticated users from auth pages', async ({ page }) => {
    const testEmail = generateTestEmail()

    // Signup/login first
    await page.goto('/authentication/default/jwt/sign-up')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    await page.waitForURL(/dashboards/, { timeout: 10000 })

    // Try to access login page while authenticated
    await page.goto('/authentication/default/jwt/login')

    // Should redirect back to dashboard
    await page.waitForURL(/dashboards/, { timeout: 5000 })
    await expect(page).toHaveURL(/dashboards/)
  })

  test('should persist session after page refresh', async ({ page }) => {
    const testEmail = generateTestEmail()

    // Login
    await page.goto('/authentication/default/jwt/sign-up')
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    await page.waitForURL(/dashboards/, { timeout: 10000 })

    // Refresh page
    await page.reload()

    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/dashboards/)
  })
})
```

**Step 2: Update test selectors**

Review the test file and update selectors to match your actual component structure:
- Form input names
- Button selectors
- Logout button selector

Run: `grep -r "data-testid" src/components src/layouts`

Add data-testid attributes to logout buttons if needed.

**Step 3: Run tests**

Run: `npx playwright test tests/e2e/auth/supabase-auth.spec.ts`

Expected: All tests pass

**Step 4: Review test output**

If tests fail, check:
- Are input field names correct?
- Is logout button selector correct?
- Are redirects working?
- Check Playwright trace/screenshots

**Step 5: Commit**

```bash
git add tests/e2e/auth/supabase-auth.spec.ts
git commit -m "test(auth): add Supabase auth E2E tests

- Signup, login, logout flow
- Protected route middleware
- Auth page redirect for logged-in users
- Session persistence after refresh

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 13: Final Verification

**Step 1: Run full build**

Run: `npm run build`

Expected: Build completes with no errors

**Step 2: Run linter**

Run: `npm run lint`

Expected: No critical errors (warnings acceptable)

**Step 3: Run all tests**

Run: `npx playwright test`

Expected: All auth tests pass

**Step 4: Manual smoke test**

1. Start dev server: `npm run dev`
2. Test signup with new user
3. Test login with that user
4. Test logout
5. Test protected route access
6. Test session persistence

**Step 5: Document completion**

Create completion note listing:
- ✅ All manual tests passed
- ✅ All Playwright tests passed
- ✅ Build succeeds
- ✅ Lint passes
- ✅ NextAuth fully removed
- ✅ Supabase auth fully integrated

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore(auth): final verification and cleanup

All tests passing:
- Manual testing complete
- E2E tests passing
- Build successful
- NextAuth removed
- Supabase auth fully integrated

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria

- [x] Supabase client files created (browser + server)
- [x] Auth context provider implemented
- [x] Root layout updated with Supabase provider
- [x] Login page using Supabase auth
- [x] Signup page using Supabase auth
- [x] Logout functionality updated
- [x] All useSession hooks updated to useSupabaseAuth
- [x] Route protection middleware created
- [x] Axios interceptor updated for Supabase JWT
- [x] NextAuth dependencies removed
- [x] Manual testing passed
- [x] Playwright E2E tests created and passing
- [x] Build succeeds with no errors
- [x] Lint passes

---

## Notes for Implementation

**Supabase Configuration:**
- Email confirmation may be required (check Supabase dashboard → Authentication → Providers → Email)
- If confirmation required, users must click email link before logging in
- Can disable email confirmation in Supabase for faster testing

**Backend Integration:**
- Backend at localhost:8000 needs to validate Supabase JWT
- JWT Secret available in: Supabase Dashboard → Settings → API → JWT Secret
- Token structure: `{ sub: userId, email: userEmail, exp: timestamp }`

**Common Issues:**
- Cookie errors in middleware: Wrapped in try/catch blocks
- Email confirmation: Check Supabase email provider settings
- Session not persisting: Verify cookie settings in middleware
- Redirect loops: Check middleware matcher config

**Testing Tips:**
- Use Playwright in headed mode for debugging: `npx playwright test --headed`
- Generate unique emails per test to avoid conflicts
- Check Supabase dashboard for created users
- Review browser devtools for auth errors

---

## Related Skills

- @superpowers:test-driven-development - TDD workflow
- @superpowers:verification-before-completion - Verify before claiming done
- @superpowers:systematic-debugging - Debug any issues
- @github-workflow - Create PR after completion
