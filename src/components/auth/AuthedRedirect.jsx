'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';

const AuthedRedirect = ({ to = '/apps/crm/deals' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useSupabaseAuth();

  useEffect(() => {
    if (!loading && user && pathname === '/') {
      router.replace(to);
    }
  }, [loading, user, pathname, router, to]);

  return null;
};

export default AuthedRedirect;
