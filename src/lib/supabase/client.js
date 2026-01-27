import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for use in browser/client components
 * Uses singleton pattern to avoid creating multiple instances
 */
let browserClient = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return browserClient;
}

// Default export for convenience
export default createClient;
