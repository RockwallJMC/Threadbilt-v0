'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import IconifyIcon from 'components/base/IconifyIcon';
import { useCRMDashboard } from 'providers/CRMDashboardProvider';
import { exportToPDF, exportToCSV, exportToExcel } from 'utils/crm/dashboardExports';

const DashboardControls = () => {
  const { dateRange, setDateRange } = useCRMDashboard();
  const [exportAnchor, setExportAnchor] = useState(null);
  const [exporting, setExporting] = useState(false);

  const handleDateRangeChange = (days) => {
    setDateRange(days);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportToPDF('dashboard-content', 'CRM-Dashboard.pdf');
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
      setExportAnchor(null);
    }
  };

  const handleExportCSV = () => {
    // Export mock data as example
    const data = [{ metric: 'Example', value: 100 }];
    exportToCSV(data, 'dashboard-metrics.csv');
    setExportAnchor(null);
  };

  const handleExportExcel = () => {
    // Export mock data as example
    const sheets = {
      KPIs: [{ metric: 'Pipeline Value', value: 8420000 }],
    };
    exportToExcel(sheets, 'dashboard-report.xlsx');
    setExportAnchor(null);
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
      <ButtonGroup size="small" variant="outlined">
        <Button
          onClick={() => handleDateRangeChange(7)}
          variant={dateRange.preset === 7 ? 'contained' : 'outlined'}
        >
          7 Days
        </Button>
        <Button
          onClick={() => handleDateRangeChange(30)}
          variant={dateRange.preset === 30 ? 'contained' : 'outlined'}
        >
          30 Days
        </Button>
        <Button
          onClick={() => handleDateRangeChange(90)}
          variant={dateRange.preset === 90 ? 'contained' : 'outlined'}
        >
          90 Days
        </Button>
      </ButtonGroup>

      <Tooltip title="Export Dashboard">
        <IconButton
          size="small"
          onClick={(e) => setExportAnchor(e.currentTarget)}
          disabled={exporting}
        >
          <IconifyIcon icon="material-symbols:download-rounded" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
      >
        <MenuItem onClick={handleExportPDF}>
          <IconifyIcon icon="material-symbols:picture-as-pdf-rounded" sx={{ mr: 1 }} />
          Export as PDF
        </MenuItem>
        <MenuItem onClick={handleExportCSV}>
          <IconifyIcon icon="material-symbols:table-chart-rounded" sx={{ mr: 1 }} />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={handleExportExcel}>
          <IconifyIcon icon="material-symbols:table-rounded" sx={{ mr: 1 }} />
          Export as Excel
        </MenuItem>
      </Menu>
    </Stack>
  );
};

export default DashboardControls;
