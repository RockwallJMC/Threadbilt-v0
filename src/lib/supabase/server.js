import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  // During build, cookies() may not be available
  let cookieStore
  try {
    cookieStore = await cookies()
  } catch (error) {
    // Build time - create a mock cookie store
    cookieStore = {
      get: () => undefined,
      set: () => {},
      delete: () => {},
    }
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Cookie setting fails in Server Components during render
            // This is expected - cookies can only be set in:
            // - Server Actions
            // - Route Handlers
            // - Middleware
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `Failed to set cookie "${name}". This is expected in Server Components.`,
                error.message
              )
            }
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete({ name, ...options })
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                `Failed to delete cookie "${name}". This is expected in Server Components.`,
                error.message
              )
            }
          }
        },
      },
    }
  )
}
