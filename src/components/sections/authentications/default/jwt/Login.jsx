'use client';

import { useSupabaseAuth } from 'hooks/useSupabaseAuth';
import { defaultJwtAuthCredentials } from 'config';
import paths from 'routes/paths';
import LoginForm from 'components/sections/authentications/default/LoginForm';

const Login = () => {
  const { signIn } = useSupabaseAuth();

  const handleLogin = async (data) => {
    try {
      await signIn(data.email, data.password);
      // Redirect is handled by SupabaseAuthProvider
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.message || 'Authentication failed',
      };
    }
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
