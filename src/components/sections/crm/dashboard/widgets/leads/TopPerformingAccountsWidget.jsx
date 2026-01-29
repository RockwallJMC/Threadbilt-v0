'use client';

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
} from '@mui/material';
import { useTopAccounts } from 'services/swr/api-hooks/useDashboardApi';
import useNumberFormat from 'hooks/useNumberFormat';
import DashboardWidgetContainer from '../../DashboardWidgetContainer';

/**
 * Top Performing Accounts Widget - Table View
 * Shows accounts with highest opportunity value
 */
const TopPerformingAccountsWidget = () => {
  const { data: accounts, isLoading, error } = useTopAccounts(5);
  const { currencyFormat } = useNumberFormat();

  const tableData = useMemo(() => {
    if (!accounts) return [];
    return accounts;
  }, [accounts]);

  return (
    <DashboardWidgetContainer
      title="Top Performing Accounts"
      subtitle="By total opportunity value"
      loading={isLoading}
      error={error}
      minHeight={350}
    >
      <TableContainer sx={{ height: '100%' }}>
        <Table size="small" sx={{ minWidth: 400 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Account
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Opportunities
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Total Value
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((account, index) => (
              <TableRow
                key={account.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <TableCell>
                  <Typography variant="body2" fontWeight={index === 0 ? 600 : 500}>
                    {account.name}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    label={account.opportunityCount}
                    size="small"
                    color={index === 0 ? 'primary' : 'default'}
                    sx={{ minWidth: 40 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={index === 0 ? 600 : 500}
                    color={index === 0 ? 'primary.main' : 'text.primary'}
                  >
                    {currencyFormat(account.totalValue)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardWidgetContainer>
  );
};

export default TopPerformingAccountsWidget;
