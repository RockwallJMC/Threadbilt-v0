'use client';

import { Box, IconButton, Tooltip, Divider, ButtonGroup } from '@mui/material';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import FitScreenRoundedIcon from '@mui/icons-material/FitScreenRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

/**
 * Graph control toolbar with zoom, fit, and export buttons
 */
export default function GraphControls({
  graphRef,
  onRefresh,
  disabled = false,
}) {
  const handleZoomIn = () => {
    const cy = graphRef.current?.getCy?.();
    if (cy) {
      cy.zoom(cy.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    const cy = graphRef.current?.getCy?.();
    if (cy) {
      cy.zoom(cy.zoom() / 1.2);
    }
  };

  const handleFit = () => {
    graphRef.current?.fit?.();
  };

  const handleCenter = () => {
    graphRef.current?.center?.();
  };

  const handleExport = () => {
    const pngData = graphRef.current?.exportPng?.();
    if (pngData) {
      const link = document.createElement('a');
      link.download = `graph-export-${new Date().toISOString().split('T')[0]}.png`;
      link.href = pngData;
      link.click();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        p: 1,
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <ButtonGroup size="small" variant="outlined" disabled={disabled}>
        <Tooltip title="Zoom In">
          <IconButton size="small" onClick={handleZoomIn}>
            <ZoomInRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton size="small" onClick={handleZoomOut}>
            <ZoomOutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </ButtonGroup>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Fit to Screen">
        <IconButton size="small" onClick={handleFit} disabled={disabled}>
          <FitScreenRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Center">
        <IconButton size="small" onClick={handleCenter} disabled={disabled}>
          <CenterFocusStrongRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      <Tooltip title="Refresh Data">
        <IconButton size="small" onClick={onRefresh} disabled={disabled}>
          <RefreshRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Export as PNG">
        <IconButton size="small" onClick={handleExport} disabled={disabled}>
          <DownloadRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
