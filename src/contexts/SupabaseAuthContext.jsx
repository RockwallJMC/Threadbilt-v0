'use client'

import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'

const AuthContext = createContext(undefined)

export const SupabaseAuthProvider = ({ children, initialSession }) => {
  const [session, setSession] = useState(initialSession)
  const [user, setUser] = useState(initialSession?.user ?? null)
  const [loading, setLoading] = useState(!initialSession)

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

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
    }),
    [session, user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useSupabaseAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider')
  }
  return context
}
