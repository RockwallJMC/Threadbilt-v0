# Supabase Auth Integration Design

**Date:** 2026-01-30
**Status:** Approved
**Author:** Claude (Orchestrator)

## Overview

Replace NextAuth.js completely with Supabase Auth while maintaining existing UI/UX. Implement email/password authentication with server + client route protection, keeping backend API for business logic.

## Requirements

- Replace NextAuth completely with Supabase Auth
- Email/password authentication only (no OAuth, no magic links)
- Keep existing Material-UI auth pages/forms (Aurora template)
- Fresh setup (no user migration initially)
- Skip password reset implementation (add later)
- Both server-side (middleware) and client-side route protection
- Hybrid architecture: Auth via Supabase, backend API at localhost:8000 for business logic

## Architecture Overview

### Authentication Flow
1. User interacts with existing Material-UI auth pages (login/signup)
2. Pages call Supabase client methods (`signInWithPassword`, `signUp`)
3. Supabase returns JWT token + user session
4. Session stored in cookies (server-accessible) and client state
5. Protected routes check session via middleware (server) and hooks (client)

### API Integration
- Axios instance intercepts requests, injects Supabase JWT token
- Backend at localhost:8000 validates Supabase token
- Backend handles business logic, returns data
- Frontend uses existing SWR hooks with updated auth headers

### What Gets Removed
- NextAuth.js (`next-auth` package)
- `src/lib/next-auth/nextAuthOptions.js`
- NextAuth API routes (`/api/auth/*`)
- NextAuth SessionProvider

### What Gets Added
- Supabase client initialization (`src/lib/supabase/client.js`, `server.js`)
- Supabase auth context (`src/contexts/SupabaseAuthContext.jsx`)
- Auth middleware (`src/middleware.js`)
- Updated auth pages to call Supabase methods
- Updated axios interceptor for Supabase tokens

### What Stays
- Existing auth UI/pages (Login, SignUp forms)
- Existing layouts and components
- Backend API at localhost:8000
- SWR data fetching hooks

## Implementation Details

### 1. Supabase Client Setup

**Client-side (`src/lib/supabase/client.js`):**
```javascript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**Server-side (`src/lib/supabase/server.js`):**
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
        get(name) { return cookieStore.get(name)?.value },
        set(name, value, options) { cookieStore.set({ name, value, ...options }) },
        remove(name, options) { cookieStore.delete({ name, ...options }) }
      }
    }
  )
}
```

**Rationale:**
- Browser client for client components (login forms, hooks)
- Server client for middleware, server components, API routes
- Server client has cookie access for session persistence
- Ensures session works across server/client boundary

### 2. Auth Context & Hooks

**Auth Context (`src/contexts/SupabaseAuthContext.jsx`):**
```javascript
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

const AuthContext = createContext({})

export const SupabaseAuthProvider = ({ children, initialSession }) => {
  const [session, setSession] = useState(initialSession)
  const [user, setUser] = useState(initialSession?.user ?? null)
  const [loading, setLoading] = useState(!initialSession)

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  return context
}
```

**Usage:**
- Replace `useSession()` → `useSupabaseAuth()`
- Replace `SessionProvider` → `SupabaseAuthProvider`
- Access user: `const { user, session, loading } = useSupabaseAuth()`

### 3. Auth Pages Updates

**Login Page (`src/app/(auth)/authentication/default/jwt/login/page.jsx`):**

Before (NextAuth):
```javascript
import { signIn } from 'next-auth/react'

const handleSubmit = async (email, password) => {
  const result = await signIn('credentials', {
    redirect: false,
    email,
    password
  })
}
```

After (Supabase):
```javascript
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const handleSubmit = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (!error) {
    router.push('/dashboards/default')
  }
}
```

**Signup Page (`sign-up/page.jsx`):**
```javascript
const handleSubmit = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name } // Store name in user metadata
    }
  })
}
```

**Key Changes:**
- Remove NextAuth imports
- Add Supabase client imports
- Replace `signIn()` with `supabase.auth.signInWithPassword()`
- Replace signup logic with `supabase.auth.signUp()`
- Handle errors from Supabase (they come back as `{ data, error }`)

### 4. Session Management

**Root Layout Update (`src/app/layout.jsx`):**

Before (NextAuth):
```javascript
import { getServerSession } from 'next-auth'
import { SessionProvider } from '@/providers/SessionProvider'

const session = await getServerSession(authOptions)
```

After (Supabase):
```javascript
import { createClient } from '@/lib/supabase/server'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'

const supabase = createClient()
const { data: { session } } = await supabase.auth.getSession()

// In JSX:
<SupabaseAuthProvider initialSession={session}>
  {children}
</SupabaseAuthProvider>
```

**Why pass `initialSession`?**
- Server fetches session on initial page load
- Prevents flash of unauthenticated content
- Client takes over after hydration
- Auth state listener keeps it in sync

**Logout Functionality:**
```javascript
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/authentication/default/jwt/login')
}
```

**Session Access Patterns:**
- Client components: `const { user, session } = useSupabaseAuth()`
- Server components: `const { data: { session } } = await supabase.auth.getSession()`
- Middleware: `const { data: { user } } = await supabase.auth.getUser()`

### 5. Route Protection

**Server-side Middleware (`src/middleware.js`):**
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
        get(name) { return request.cookies.get(name)?.value },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboards') && !user) {
    return NextResponse.redirect(new URL('/authentication/default/jwt/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/authentication') && user) {
    return NextResponse.redirect(new URL('/dashboards/default', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboards/:path*', '/authentication/:path*']
}
```

**Client-side Protection:**
```javascript
// In protected pages/components
const { user, loading } = useSupabaseAuth()

if (loading) return <CircularProgress />
if (!user) {
  router.push('/authentication/default/jwt/login')
  return null
}
```

**Two-layer Protection:**
- Middleware blocks at server (before page loads)
- Client hooks provide smooth UX during navigation

### 6. Axios Integration

**Update Axios Instance (`src/services/axios/axiosInstance.js`):**

Before (NextAuth):
```javascript
import { getSession } from 'next-auth/react'

axiosInstance.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.authToken) {
    config.headers.Authorization = `Bearer ${session.authToken}`
  }
  return config
})
```

After (Supabase):
```javascript
import { supabase } from '@/lib/supabase/client'

axiosInstance.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }

  return config
})
```

**Backend Validation:**
- Backend at localhost:8000 validates Supabase JWT tokens
- Token contains: `sub` (user ID), `email`, `exp` (expiration)
- Backend verifies using `SUPABASE_JWT_SECRET` from Supabase dashboard

**Result:**
- All existing SWR hooks continue working
- All API calls automatically get Supabase token
- No changes needed to individual API hooks
- Backend receives valid Supabase JWT for authorization

## Testing Strategy

### Manual Testing (Priority 1)
1. Test signup flow (create new user)
2. Test login flow (authenticate existing user)
3. Test logout (clear session)
4. Test protected route access (middleware redirect)
5. Test API calls (verify token in axios)

### Playwright E2E Tests (Priority 2)
1. Auth flow: signup → login → logout
2. Protected routes: unauthorized → redirect → login → access
3. Session persistence: login → refresh → still logged in

## Implementation Order

1. Create Supabase client files (`client.js`, `server.js`)
2. Create auth context (`SupabaseAuthContext.jsx`)
3. Update root layout (replace SessionProvider)
4. Update login page (replace NextAuth with Supabase)
5. Update signup page
6. Update logout functionality (profile menu)
7. Create middleware for route protection
8. Update axios interceptor
9. Remove NextAuth dependencies and files
10. Test full flow manually
11. Create Playwright tests

## Out of Scope (Future Enhancements)

- Password reset (forgot-password, set-password pages)
- 2FA page implementation
- User migration from existing backend
- Custom email templates
- OAuth providers (Google, GitHub, etc.)
- Magic link authentication

## Rollback Plan

- Keep NextAuth code in git history
- Test on dev environment first
- Can revert commits if issues arise
- Staged rollout: test locally → deploy to dev → production

## Environment Variables

Already configured in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=https://iixfjulmrexivuehoxti.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_u_kTgJu3GNdkUKG2rqMimQ_I6z97COw
```

Backend will need:
```
SUPABASE_JWT_SECRET=(from Supabase dashboard → Settings → API → JWT Secret)
```

## Dependencies

Already installed:
- `@supabase/supabase-js` (v2.93.1)
- `@supabase/ssr` (v0.8.0)
- `@supabase/auth-helpers-nextjs` (v0.15.0)

To remove after implementation:
- `next-auth` (v4.24.13)

## Success Criteria

- [ ] Users can sign up with email/password
- [ ] Users can log in with email/password
- [ ] Users can log out successfully
- [ ] Middleware protects dashboard routes
- [ ] Middleware redirects authenticated users from auth pages
- [ ] Axios automatically injects Supabase JWT token
- [ ] Backend API receives and validates token
- [ ] No NextAuth code remains in codebase
- [ ] Manual testing passes all scenarios
- [ ] Playwright tests cover critical auth flows
