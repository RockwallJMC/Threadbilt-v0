# Auth + Wiring Pattern Map (Code)

Use these files as the canonical implementation patterns:

- `src/app/layout.jsx` – server-side session validation
- `src/middleware.js` – auth redirects + route protection
- `src/contexts/SupabaseAuthContext.jsx` – client auth state
- `src/lib/supabase/server.js` and `src/lib/supabase/client.js` – client/server factories
- `src/services/swr/api-hooks/` – SWR hook patterns (useDashboardApi, useContactApi, etc.)
- `src/app/api/crm/` – API route patterns with Supabase server client
