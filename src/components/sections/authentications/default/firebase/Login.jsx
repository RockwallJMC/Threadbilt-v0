'use client';

import { supabase } from '@/lib/supabase/client';
import { defaultJwtAuthCredentials } from 'config';
import paths from 'routes/paths';
import LoginForm from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const handleLogin = async (data) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    return {
      ok: !error,
      error: error?.message,
    };
  };

  return (
    <>
      <LoginForm
        provider="firebase"
        handleLogin={handleLogin}
        signUpLink={paths.defaultFirebaseSignup}
        forgotPasswordLink={paths.defaultFirebaseForgotPassword}
        defaultCredential={defaultJwtAuthCredentials}
      />
    </>
  );
};

export default Login;
