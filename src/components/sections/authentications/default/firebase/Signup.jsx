'use client';

import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import SignupForm from 'components/sections/authentications/default/SignupForm';

const SignUp = () => {
  const router = useRouter();

  const handleSignup = async (data) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    });

    const res = {
      ok: !error,
      error: error?.message,
      url: error ? null : '/',
    };

    if (res?.ok && res?.url) {
      router.push(res.url);
    }

    return res;
  };

  return <SignupForm provider="firebase" handleSignup={handleSignup} />;
};

export default SignUp;
