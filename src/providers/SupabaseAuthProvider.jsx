'use client';

import { createContext, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from 'lib/supabase/client';

export const SupabaseAuthContext = createContext(undefined);

/**
 * Supabase Authentication Provider
 * Manages auth state, session, and organization context for the application
 *
 * Provides:
 * - user: Current authenticated user
 * - session: Supabase session object
 * - loading: Loading state during auth operations
 * - organizationId: Current active organization ID
 * - signIn: Email/password sign in
 * - signUp: Email/password sign up
 * - signOut: Sign out user
 * - setOrganization: Change active organization
 */
export function SupabaseAuthProvider({ children, initialSession = null }) {
  const router = useRouter();
  const [user, setUser] = useState(initialSession?.user ?? null);
  const [session, setSession] = useState(initialSession);
  const [loading, setLoading] = useState(!initialSession);
  const [organizationId, setOrganizationId] = useState(null);
  const supabase = createClient();

  /**
   * Fetch user's current organization from organization_members
   * Sets the first active organization as the current one
   */
  const fetchUserOrganization = useCallback(async (userId) => {
    if (!userId) {
      setOrganizationId(null);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('organization_id, is_active')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('joined_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // User has no organizations
        if (error.code === 'PGRST116') {
          setOrganizationId(null);
          return null;
        }
        throw error;
      }

      setOrganizationId(data.organization_id);
      return data.organization_id;
    } catch (error) {
      console.error('Error fetching user organization:', error);
      setOrganizationId(null);
      return null;
    }
  }, [supabase]);

  /**
   * Handle auth state changes
   * Redirects user to organization setup if no organization exists
   */
  const handleAuthStateChange = useCallback(async (event, newSession) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);

    if (newSession?.user) {
      // Fetch user's organization
      const orgId = await fetchUserOrganization(newSession.user.id);

      // Redirect to organization setup if no organization
      if (!orgId && !window.location.pathname.includes('/organization-setup')) {
        router.push('/organization-setup');
      } else if (orgId && window.location.pathname.includes('/organization-setup')) {
        // Redirect to dashboard if organization exists
        router.push('/');
      }
    } else {
      setOrganizationId(null);
    }

    setLoading(false);
  }, [fetchUserOrganization, router]);

  /**
   * Set up auth state listener
   */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      handleAuthStateChange('INITIAL_SESSION', currentSession);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, handleAuthStateChange]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Auth state change handler will manage redirect
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [supabase]);

  /**
   * Sign up with email, password, and optional metadata
   */
  const signUp = useCallback(async (email, password, metadata = {}) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;

      // User needs to confirm email before proceeding
      return data;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [supabase]);

  /**
   * Sign out current user
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear state
      setUser(null);
      setSession(null);
      setOrganizationId(null);

      // Redirect to login
      router.push('/authentication/default/jwt/login');
    } catch (error) {
      setLoading(false);
      throw error;
    }
  }, [supabase, router]);

  /**
   * Set active organization for current user
   */
  const setOrganization = useCallback(async (orgId) => {
    if (!user) {
      throw new Error('User must be authenticated to set organization');
    }

    try {
      // Verify user is a member of this organization
      const { data, error } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('organization_id', orgId)
        .single();

      if (error || !data) {
        throw new Error('User is not a member of this organization');
      }

      setOrganizationId(orgId);

      // Persist to localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_organization_id', orgId);
      }

      return orgId;
    } catch (error) {
      console.error('Error setting organization:', error);
      throw error;
    }
  }, [user, supabase]);

  const value = {
    user,
    session,
    loading,
    organizationId,
    signIn,
    signUp,
    signOut,
    setOrganization,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}
