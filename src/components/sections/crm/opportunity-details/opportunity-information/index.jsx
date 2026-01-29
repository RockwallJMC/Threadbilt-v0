import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconifyIcon from 'components/base/IconifyIcon';
import OpportunityInfoItem from './OpportunityInfoItem';

const OpportunityInformation = ({ opportunityInformation }) => {
  return (
    <Paper component={Stack} direction="column" sx={{ p: { xs: 3, md: 5 }, gap: 3 }}>
      <Stack sx={{ justifyContent: 'space-between' }}>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          Opportunity Information
        </Typography>
        <Button
          variant="soft"
          color="neutral"
          size="small"
          startIcon={<IconifyIcon icon="material-symbols:edit-outline-rounded" />}
        >
          Modify
        </Button>
      </Stack>
      <Stack direction="column" gap={2}>
        <div>
          {opportunityInformation.slice(0, 6).map((item) => (
            <OpportunityInfoItem
              key={item.id}
              attribute={item.attribute}
              value={item.value}
              background={item.background}
            />
          ))}
        </div>
        <div>
          {opportunityInformation.slice(6).map((item) => (
            <OpportunityInfoItem
              key={item.id}
              attribute={item.attribute}
              value={item.value}
              background={item.background}
            />
          ))}
        </div>
      </Stack>
    </Paper>
  );
};

export default OpportunityInformation;
