'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { defaultJwtAuthCredentials } from 'config';
import paths from 'routes/paths';
import LoginForm from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const router = useRouter();

  const handleLogin = async (data) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { error: { message: error.message }, ok: false };
    }

    router.push('/dashboard/crm');
    return { ok: true };
  };

  return (
    <LoginForm
      handleLogin={handleLogin}
      signUpLink={paths.defaultJwtSignup}
      forgotPasswordLink={paths.defaultJwtForgotPassword}
      defaultCredential={defaultJwtAuthCredentials}
    />
  );
};

export default Login;
