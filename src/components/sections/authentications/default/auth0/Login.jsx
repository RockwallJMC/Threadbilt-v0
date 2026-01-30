'use client';

import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { rootPaths } from 'routes/paths';
import Auth0Login from 'components/sections/authentications/default/Auth0Login';

const Login = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl || rootPaths.root)}`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl || rootPaths.root)}`,
          queryParams: {
            screen_hint: 'signup',
          },
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error(error);
    }
  };

  return <Auth0Login handleLogin={handleLogin} handleSignUp={handleSignUp} />;
};

export default Login;
