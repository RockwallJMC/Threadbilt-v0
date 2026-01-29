import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useOpportunitiesContext } from 'providers/OpportunitiesProvider';
import { SET_CREATE_OPPORTUNITY_DIALOG } from 'reducers/OpportunitiesReducer';
import IconifyIcon from 'components/base/IconifyIcon';

const AddNewDeal = ({ listId }) => {
  const { opportunitiesDispatch } = useOpportunitiesContext();

  return (
    <Box sx={{ p: 1, borderRadius: 4, bgcolor: 'background.elevation1' }}>
      <Button
        variant="text"
        color="neutral"
        onClick={() =>
          opportunitiesDispatch({ type: SET_CREATE_OPPORTUNITY_DIALOG, payload: { isOpen: true, listId } })
        }
        startIcon={
          <IconifyIcon icon="material-symbols:add-2-rounded" sx={{ fontSize: '20px !important' }} />
        }
        fullWidth
      >
        Add new Opportunity
      </Button>
    </Box>
  );
};

export default AddNewDeal;
