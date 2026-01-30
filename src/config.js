import { mainDrawerWidth } from 'lib/constants';

export const initialConfig = {
  assetsDir: process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? '',
  textDirection: 'ltr',
  navigationMenuType: 'sidenav',
  sidenavType: 'default',
  sidenavCollapsed: false,
  topnavType: 'default',
  navColor: 'default',
  openNavbarDrawer: false,
  drawerWidth: mainDrawerWidth.full,
  locale: 'en-US',
};

export const defaultJwtAuthCredentials = {
  email: 'demo@aurora.com',
  password: 'password123',
};
