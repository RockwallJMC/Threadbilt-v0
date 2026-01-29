import { memo } from 'react';
import { isWindows } from 'react-device-detect';
import { useTheme } from '@mui/material';
import Badge, { badgeClasses } from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import OpportunityItems from './OpportunityItems';
import ListHeader from './ListHeader';

const ListContainer = memo(({ opportunityList, listeners }) => {
  const { id, title, opportunities, compactMode } = opportunityList;
  const theme = useTheme();

  return (
    <Paper
      {...listeners}
      sx={[
        { height: 1, width: { xs: 375, sm: 464 }, flexShrink: 0 },
        compactMode && { width: { xs: 72 }, bgcolor: 'background.elevation1' },
      ]}
    >
      <ListHeader
        listId={id}
        title={title}
        totalBudget={opportunities.reduce((acc, curr) => acc + curr.amount, 0)}
        opportunityCount={opportunities.length}
        compactMode={compactMode}
      />
      {compactMode ? (
        <Stack
          sx={{
            mt: 6,
            gap: 1,
            width: 1,
            alignItems: 'center',
            justifyContent: theme.direction === 'rtl' ? 'flex-start' : 'flex-end',
            transform: 'rotate(-90deg)',
          }}
        >
          <Badge
            badgeContent={`${opportunities.length}`}
            color="primary"
            sx={{
              mr: 3.5,
              [`& .${badgeClasses.badge}`]: {
                right: -28,
                top: '50%',
                transform: 'translateY(-50%)',
              },
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                overflow: 'hidden',
                textWrap: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>
          </Badge>
        </Stack>
      ) : (
        <Stack
          direction="column"
          sx={{
            height: `calc(100% - 63px)`,
            overflowY: 'auto',
            ...(isWindows && {
              '&::-webkit-scrollbar': { display: 'none' },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }),
          }}
        >
          <OpportunityItems listId={id} opportunities={opportunities} />
        </Stack>
      )}
    </Paper>
  );
});

export default ListContainer;
