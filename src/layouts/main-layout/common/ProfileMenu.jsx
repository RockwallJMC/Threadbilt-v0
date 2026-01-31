'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import {
  Box,
  Button,
  Divider,
  Link,
  listClasses,
  ListItemIcon,
  listItemIconClasses,
  MenuItem,
  MenuItemProps,
  paperClasses,
  Stack,
  Switch,
  SxProps,
  Typography,
} from '@mui/material';
import Menu from '@mui/material/Menu';
import { useThemeMode } from 'hooks/useThemeMode';
import { demoUser } from 'lib/demoUser';
import { useBreakpoints } from 'providers/BreakpointsProvider';
import { useSettingsContext } from 'providers/SettingsProvider';
import paths, { authPaths } from 'routes/paths';
import IconifyIcon from 'components/base/IconifyIcon';
import StatusAvatar from 'components/base/StatusAvatar';
import useSWR from 'swr';

const ProfileMenu = ({ type = 'default' }) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const { up } = useBreakpoints();
  const upSm = up('sm');
  const {
    config: { textDirection },
  } = useSettingsContext();

  const { isDark, setThemeMode } = useThemeMode();

  const { user: authUser } = useSupabaseAuth();
  // Use demoUser as fallback if no session user
  const user = useMemo(() => {
    if (!authUser) return demoUser;
    // Map Supabase auth user to expected format
    return {
      name: authUser.user_metadata?.display_name || authUser.email,
      email: authUser.email,
      image: authUser.user_metadata?.avatar_url,
      designation: authUser.user_metadata?.designation,
    };
  }, [authUser]);

  // Fetch user organizations (only when authenticated)
  const { data: organizations } = useSWR(
    authUser ? 'user-organizations' : null,
    async () => {
      const { data, error } = await supabase
        .from('organization_members')
        .select(
          `
          id,
          role,
          is_active,
          joined_at,
          organizations (
            id,
            name,
            slug,
            created_at
          )
        `
        )
        .eq('user_id', authUser.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      // Flatten the structure
      return (data || []).map((membership) => ({
        membershipId: membership.id,
        id: membership.organizations.id,
        name: membership.organizations.name,
        slug: membership.organizations.slug,
        role: membership.role,
        isActive: membership.is_active,
        joinedAt: membership.joined_at,
        createdAt: membership.organizations.created_at,
      }));
    },
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  );

  // Get active organization
  const activeOrganization = useMemo(() => {
    return organizations?.find((org) => org.isActive);
  }, [organizations]);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const menuButton = upSm ? (
    <Button
      color="neutral"
      variant="text"
      onClick={handleClick}
      sx={{
        height: 44,
        gap: 1.5,
        px: 1,
      }}
    >
      <Stack direction="column" alignItems="flex-end" spacing={0.25}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
          {user?.name}
        </Typography>
        {activeOrganization && (
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
            {activeOrganization.name}
          </Typography>
        )}
      </Stack>
      <StatusAvatar
        alt={user?.name}
        status="online"
        src={user?.image || undefined}
        sx={{
          width: 32,
          height: 32,
          border: 2,
          borderColor: 'background.paper',
        }}
      />
    </Button>
  ) : (
    <Button
      color="neutral"
      variant="text"
      shape="circle"
      onClick={handleClick}
      sx={[
        {
          height: 44,
          width: 44,
        },
        type === 'slim' && {
          height: 30,
          width: 30,
          minWidth: 30,
        },
      ]}
    >
      <StatusAvatar
        alt={user?.name}
        status="online"
        src={user?.image || undefined}
        sx={[
          {
            width: 40,
            height: 40,
            border: 2,
            borderColor: 'background.paper',
          },
          type === 'slim' && { width: 24, height: 24, border: 1, borderColor: 'background.paper' },
        ]}
      />
    </Button>
  );

  return (
    <>
      {type === 'slim' && upSm ? (
        <Button color="neutral" variant="text" size="small" onClick={handleClick}>
          {user?.name}
        </Button>
      ) : (
        menuButton
      )}
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        transformOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: textDirection === 'rtl' ? 'left' : 'right',
          vertical: 'bottom',
        }}
        sx={{
          [`& .${paperClasses.root}`]: { minWidth: 320 },
          [`& .${listClasses.root}`]: { py: 0 },
        }}
      >
        <Stack
          sx={{
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <StatusAvatar
            status="online"
            alt={user?.name}
            src={user?.image || undefined}
            sx={{ width: 48, height: 48 }}
          />
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                mb: 0.5,
              }}
            >
              {user?.name}
            </Typography>
            {activeOrganization && (
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: user?.designation ? 0.5 : 0,
                }}
              >
                {activeOrganization.name}
              </Typography>
            )}
            {user?.designation && (
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'warning.main',
                }}
              >
                {user?.designation}
                <IconifyIcon
                  icon="material-symbols:diamond-rounded"
                  color="warning.main"
                  sx={{ verticalAlign: 'text-bottom', ml: 0.5 }}
                />
              </Typography>
            )}
          </Box>
        </Stack>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem icon="material-symbols:accessible-forward-rounded" onClick={handleClose}>
            Accessibility
          </ProfileMenuItem>

          <ProfileMenuItem icon="material-symbols:settings-outline-rounded" onClick={handleClose}>
            Preferences
          </ProfileMenuItem>

          <ProfileMenuItem
            onClick={() => setThemeMode()}
            icon="material-symbols:dark-mode-outline-rounded"
          >
            Dark mode
            <Switch checked={isDark} onChange={() => setThemeMode()} sx={{ ml: 'auto' }} />
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          <ProfileMenuItem
            icon="material-symbols:manage-accounts-outline-rounded"
            onClick={handleClose}
            href="#!"
          >
            Account Settings
          </ProfileMenuItem>
          <ProfileMenuItem
            icon="material-symbols:question-mark-rounded"
            onClick={handleClose}
            href="#!"
          >
            Help Center
          </ProfileMenuItem>
        </Box>
        <Divider />
        <Box sx={{ py: 1 }}>
          {authUser ? (
            <ProfileMenuItem
              onClick={async () => {
                await supabase.auth.signOut();
                router.push(paths.defaultLoggedOut);
              }}
              icon="material-symbols:logout-rounded"
            >
              Sign Out
            </ProfileMenuItem>
          ) : (
            <ProfileMenuItem href={authPaths.login} icon="material-symbols:login-rounded">
              Sign In
            </ProfileMenuItem>
          )}
        </Box>
      </Menu>
    </>
  );
};

const ProfileMenuItem = ({ icon, onClick, children, href, sx }) => {
  const linkProps = href ? { component: Link, href, underline: 'none' } : {};

  return (
    <MenuItem onClick={onClick} {...linkProps} sx={{ gap: 1, ...sx }}>
      <ListItemIcon
        sx={{
          [`&.${listItemIconClasses.root}`]: { minWidth: 'unset !important' },
        }}
      >
        <IconifyIcon icon={icon} sx={{ color: 'text.secondary' }} />
      </ListItemIcon>
      {children}
    </MenuItem>
  );
};

export default ProfileMenu;
