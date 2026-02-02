'use client';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import CRMGreeting from 'components/sections/dashboards/crm/CRMGreeting';
import AcquisitionCost from 'components/sections/dashboards/crm/acquisition-cost/AcquisitionCost';
import ActiveUsers from 'components/sections/dashboards/crm/active-users/ActiveUsers';
import AvgLifetimeValue from 'components/sections/dashboards/crm/avg-lifetime-value/AvgLifetimeValue';
import CustomerFeedback from 'components/sections/dashboards/crm/customer-feedback/CustomerFeedback';
import CRMGeneratedRevenue from 'components/sections/dashboards/crm/generated-revenue/CRMGeneratedRevenue';
import CRMKPIs from 'components/sections/dashboards/crm/kpi/CRMKPIs';
import LeadSources from 'components/sections/dashboards/crm/lead-sources/LeadSources';
import SaleFunnel from 'components/sections/dashboards/crm/sale-funnel/SaleFunnel';

const CRM = () => {
  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid size={12}>
        <CRMGreeting />
      </Grid>

      <Grid size={12}>
        <Paper
          background={1}
          sx={(theme) => ({
            p: { xs: 2, md: 3 },
            borderRadius: 6,
            bgcolor: 'transparent',
            border: `1px solid ${theme.vars.palette.divider}`,
            boxShadow: `inset 0 1px 0 ${theme.vars.palette.divider}, ${theme.vars.shadows[2]}`,
          })}
        >
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid container size={{ xs: 12, lg: 5, xl: 6 }} spacing={{ xs: 2, md: 3 }}>
              <CRMKPIs />
            </Grid>
            <Grid size={{ xs: 12, lg: 7, xl: 6 }}>
              <CRMGeneratedRevenue />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid size={12}>
        <Paper
          background={1}
          sx={(theme) => ({
            p: { xs: 2, md: 3 },
            borderRadius: 6,
            bgcolor: 'transparent',
            border: `1px solid ${theme.vars.palette.divider}`,
            boxShadow: `inset 0 1px 0 ${theme.vars.palette.divider}, ${theme.vars.shadows[2]}`,
          })}
        >
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid container size={{ xs: 12, xl: 8 }} spacing={{ xs: 2, md: 3 }}>
              <Grid container size={12} spacing={{ xs: 2, md: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomerFeedback />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <LeadSources />
                </Grid>
              </Grid>

              <Grid size={12}>
                <AcquisitionCost />
              </Grid>
            </Grid>

            <Grid size={{ xs: 12, xl: 4 }}>
              <SaleFunnel />
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid size={12}>
        <Paper
          background={1}
          sx={(theme) => ({
            p: { xs: 2, md: 3 },
            borderRadius: 6,
            bgcolor: 'transparent',
            border: `1px solid ${theme.vars.palette.divider}`,
            boxShadow: `inset 0 1px 0 ${theme.vars.palette.divider}, ${theme.vars.shadows[2]}`,
          })}
        >
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid size={{ xs: 12, md: 6, xl: 4 }}>
              <AvgLifetimeValue />
            </Grid>
            <Grid size={{ xs: 12, md: 6, xl: 8 }}>
              <ActiveUsers />
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default CRM;
