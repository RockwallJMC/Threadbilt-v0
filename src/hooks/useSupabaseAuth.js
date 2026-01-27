import { useContext } from 'react';
import { SupabaseAuthContext } from 'providers/SupabaseAuthProvider';

/**
 * Custom hook to consume Supabase authentication context
 *
 * @returns {Object} Auth context value
 * @property {Object|null} user - Current authenticated user
 * @property {Object|null} session - Supabase session object
 * @property {boolean} loading - Loading state during auth operations
 * @property {string|null} organizationId - Current active organization ID
 * @property {Function} signIn - Sign in with email/password
 * @property {Function} signUp - Sign up with email/password
 * @property {Function} signOut - Sign out current user
 * @property {Function} setOrganization - Set active organization
 *
 * @throws {Error} If used outside SupabaseAuthProvider
 *
 * @example
 * const { user, signIn, signOut } = useSupabaseAuth();
 *
 * const handleLogin = async () => {
 *   await signIn('user@example.com', 'password');
 * };
 */
export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);

  if (context === undefined) {
    throw new Error(
      'useSupabaseAuth must be used within a SupabaseAuthProvider. ' +
      'Make sure your component is wrapped with <SupabaseAuthProvider>.'
    );
  }

  return context;
}

export default useSupabaseAuth;
