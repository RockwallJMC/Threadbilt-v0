import Box from '@mui/material/Box';
import OpportunityCard from 'components/sections/crm/opportunities/opportunity-card/OpportunityCard';

const OpportunityCardOverlay = ({ opportunity }) => {
  return (
    <Box sx={{ cursor: 'grabbing', borderRadius: 4, boxShadow: (theme) => theme.vars.shadows[5] }}>
      <OpportunityCard opportunity={opportunity} />
    </Box>
  );
};

export default OpportunityCardOverlay;
