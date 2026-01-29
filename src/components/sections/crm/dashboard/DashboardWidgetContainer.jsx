'use client';

import { Paper, CircularProgress, Alert, Box } from '@mui/material';
import SectionHeader from 'components/common/SectionHeader';

/**
 * Reusable container for dashboard widgets
 * Provides consistent styling, loading states, and error handling
 *
 * @param {string} title - Widget title
 * @param {string} subtitle - Optional subtitle
 * @param {boolean} loading - Loading state
 * @param {string|Error|null} error - Error message or Error object
 * @param {React.ReactNode} menu - Optional action menu component
 * @param {number} minHeight - Minimum height in pixels (default: 200)
 * @param {React.ReactNode} children - Widget content
 * @param {Object} sx - Additional sx styles
 */
const DashboardWidgetContainer = ({
  title,
  subtitle,
  loading = false,
  error = null,
  menu = null,
  minHeight = 200,
  children,
  sx,
  ...props
}) => {
  return (
    <Paper
      background={1}
      sx={{
        p: { xs: 3, md: 5 },
        height: 1,
        minHeight,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle) && (
        <SectionHeader
          title={title}
          subTitle={subtitle}
          actionComponent={menu}
          sx={{ mb: { xs: 2, md: 4 } }}
        />
      )}

      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            minHeight: 120,
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.message || error}
        </Alert>
      )}

      {!loading && !error && <Box sx={{ flexGrow: 1 }}>{children}</Box>}
    </Paper>
  );
};

export default DashboardWidgetContainer;
