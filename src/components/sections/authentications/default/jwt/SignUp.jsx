'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import SignupForm from 'components/sections/authentications/default/SignupForm';

const SignUp = () => {
  const router = useRouter();

  const handleSignup = async (data) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        },
      },
    });

    if (error) {
      return { error: { message: error.message }, ok: false };
    }

    if (authData.user && !authData.session) {
      // Email confirmation required
      return { ok: true, message: 'Check your email to confirm your account' };
    }

    router.push('/dashboards/default');
    return { ok: true };
  };

  return <SignupForm handleSignup={handleSignup} />;
};

export default SignUp;
