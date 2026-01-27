'use client';

import { useSupabaseAuth } from 'hooks/useSupabaseAuth';
import { useRouter } from 'next/navigation';
import SignupForm from 'components/sections/authentications/default/SignupForm';

const SignUp = () => {
  const router = useRouter();
  const { signUp } = useSupabaseAuth();

  const handleSignup = async (data) => {
    try {
      // Sign up with Supabase - includes user metadata for full_name
      await signUp(data.email, data.password, {
        data: {
          full_name: data.name,
        },
      });

      // Supabase sends confirmation email by default
      // User needs to confirm email before they can log in
      // Consider redirecting to a confirmation notice page
      // For now, just return success
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.message || 'Sign up failed',
      };
    }
  };

  return <SignupForm handleSignup={handleSignup} />;
};

export default SignUp;
