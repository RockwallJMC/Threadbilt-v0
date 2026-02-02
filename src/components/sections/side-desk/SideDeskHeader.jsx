import { Box, Divider, FormControlLabel, IconButton, Stack, Switch, Typography } from '@mui/material';
import { formatDate, getUserDisplayName } from 'helpers/side-desk-utils';
import { useSupabaseAuth } from 'contexts/SupabaseAuthContext';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_SIDE_DESK_LOCKED, TOGGLE_SIDE_DESK } from 'reducers/SettingsReducer';
import IconifyIcon from 'components/base/IconifyIcon';
import { useMemo } from 'react';

const SideDeskHeader = ({ deskName }) => {
  const { user: authUser } = useSupabaseAuth();
  const {
    config: { sideDeskLocked },
    configDispatch,
  } = useSettingsContext();

  const userName = useMemo(() => getUserDisplayName(authUser), [authUser]);
  const todayDate = useMemo(() => formatDate(), []);

  const handleLockToggle = (event) => {
    configDispatch({
      type: SET_SIDE_DESK_LOCKED,
      payload: event.target.checked,
    });
  };

  const handleClose = () => {
    configDispatch({
      type: TOGGLE_SIDE_DESK,
    });
  };

  return (
    <>
      <Box
        sx={{
          pt: 3,
          px: 3,
          pb: 2,
        }}
      >
        {/* Title and Controls Row */}
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
            {deskName} Desk
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <FormControlLabel
              control={<Switch checked={sideDeskLocked} onChange={handleLockToggle} size="small" />}
              label="Keep open"
              sx={{
                m: 0,
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.75rem',
                  color: 'text.secondary',
                },
              }}
            />
            <IconButton onClick={handleClose} size="small" sx={{ ml: 0.5 }}>
              <IconifyIcon icon="material-symbols:close" sx={{ fontSize: 20 }} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Date and User Info */}
        <Stack direction="column" spacing={0.25}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {todayDate}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {userName}
          </Typography>
        </Stack>
      </Box>
      <Divider />
    </>
  );
};

export default SideDeskHeader;
