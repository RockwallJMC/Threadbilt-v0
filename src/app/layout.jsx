import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import 'locales/i18n';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import LocalizationProvider from 'providers/LocalizationProvider';
import NotistackProvider from 'providers/NotistackProvider';
import PageContextProvider from 'providers/PageContext';
import SettingsProvider from 'providers/SettingsProvider';
import ThemeProvider from 'providers/ThemeProvider';
import { plusJakartaSans, splineSansMono } from 'theme/typography';
import { createClient } from '@/lib/supabase/server';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import App from './App';

export const metadata = {
  title: 'Aurora',
  description: 'Admin Dashboard and Web App Template',
  icons: [
    {
      rel: 'icon',
      url: `/favicon.ico`,
    },
  ],
};

export default async function RootLayout({ children }) {
  let session = null;

  try {
    const supabase = await createClient();

    // Validate user with server before trusting session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!error && user) {
      // User is valid, safe to get session data
      const { data: { session: validSession } } = await supabase.auth.getSession();
      session = validSession;
    } else {
      // No valid user or error occurred
      session = null;
    }
  } catch (error) {
    // Build time or other errors - no session available
    if (process.env.NODE_ENV === 'development') {
      console.warn('Session validation failed:', error.message);
    }
    session = null;
  }

  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${plusJakartaSans.className} ${splineSansMono.className}`}
    >
      <body>
        <InitColorSchemeScript attribute="data-aurora-color-scheme" modeStorageKey="aurora-mode" />
        <AppRouterCacheProvider>
          <SupabaseAuthProvider initialSession={session}>
            <SettingsProvider>
              <LocalizationProvider>
                <ThemeProvider>
                  <NotistackProvider>
                    <BreakpointsProvider>
                      <PageContextProvider>
                        <App>{children}</App>
                      </PageContextProvider>
                    </BreakpointsProvider>
                  </NotistackProvider>
                </ThemeProvider>
              </LocalizationProvider>
            </SettingsProvider>
          </SupabaseAuthProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
