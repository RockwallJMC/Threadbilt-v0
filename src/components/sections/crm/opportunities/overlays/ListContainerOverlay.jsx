import Box from '@mui/material/Box';
import ListContainer from 'components/sections/crm/opportunities/list-container/ListContainer';

const ListContainerOverlay = ({ opportunityList }) => {
  return (
    <Box sx={{ cursor: 'grabbing', height: 1, boxShadow: (theme) => theme.vars.shadows[5] }}>
      <ListContainer opportunityList={opportunityList} />
    </Box>
  );
};

export default ListContainerOverlay;
