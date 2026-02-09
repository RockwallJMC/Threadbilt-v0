import { mainDrawerWidth, SIDE_DESK_WIDTH_DEFAULT } from 'lib/constants';

export const initialConfig = {
  assetsDir: process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? '',
  textDirection: 'ltr',
  navigationMenuType: 'threadnavbar',
  sidenavType: 'default',
  sidenavCollapsed: false,
  topnavType: 'default',
  navColor: 'default',
  openNavbarDrawer: false,
  drawerWidth: mainDrawerWidth.slim, // slim width for threadnavbar
  locale: 'en-US',
  sideDeskOpen: false,
  sideDeskLocked: false,
  sideDeskWidth: SIDE_DESK_WIDTH_DEFAULT,
};

export const defaultJwtAuthCredentials = {
  email: 'demo@aurora.com',
  password: 'password123',
};
