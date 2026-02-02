import { Divider, FormControlLabel, Stack, Switch } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';
import { SET_SIDE_DESK_LOCKED } from 'reducers/SettingsReducer';

const SideDeskFooter = () => {
  const {
    config: { sideDeskLocked },
    configDispatch,
  } = useSettingsContext();

  const handleLockToggle = (event) => {
    configDispatch({
      type: SET_SIDE_DESK_LOCKED,
      payload: event.target.checked,
    });
  };

  return (
    <>
      <Divider />
      <Stack
        direction="row"
        sx={{
          px: 3,
          py: 2,
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
        }}
      >
        <FormControlLabel
          control={<Switch checked={sideDeskLocked} onChange={handleLockToggle} size="small" />}
          label="Keep drawer open"
          sx={{
            m: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
              color: 'text.secondary',
            },
          }}
        />
      </Stack>
    </>
  );
};

export default SideDeskFooter;
