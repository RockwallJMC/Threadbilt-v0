import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { createClient } from 'lib/supabase/server';
import 'locales/i18n';
import BreakpointsProvider from 'providers/BreakpointsProvider';
import LocalizationProvider from 'providers/LocalizationProvider';
import NotistackProvider from 'providers/NotistackProvider';
import { SupabaseAuthProvider } from 'providers/SupabaseAuthProvider';
import SettingsProvider from 'providers/SettingsProvider';
import ThemeProvider from 'providers/ThemeProvider';
import CRMAccountsProvider from 'providers/CRMAccountsProvider';
import CRMContactsProvider from 'providers/CRMContactsProvider';
import { plusJakartaSans, splineSansMono } from 'theme/typography';
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
  // Fetch authenticated user from Supabase on the server
  // Using getUser() instead of getSession() for security - validates with Supabase servers
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get session if user is authenticated
  const session = user ? (await supabase.auth.getSession()).data.session : null;

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
                      <CRMAccountsProvider>
                        <CRMContactsProvider>
                          <App>{children}</App>
                        </CRMContactsProvider>
                      </CRMAccountsProvider>
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
