import Stack from '@mui/material/Stack';
import AddNewOpportunity from 'components/sections/crm/opportunities/opportunity-card/AddNewOpportunity';
import SortableOpportunityItem from 'components/sections/crm/opportunities/opportunity-card/SortableOpportunityItem';

const OpportunityItems = ({ listId, opportunities }) => {
  return (
    <Stack direction="column" sx={{ gap: 2, p: 2, pb: 3 }}>
      {opportunities.map((item) => (
        <SortableOpportunityItem key={item.id} opportunity={item} />
      ))}
      <AddNewOpportunity listId={listId} />
    </Stack>
  );
};

export default OpportunityItems;
