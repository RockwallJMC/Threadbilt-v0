'use client';

import {
  Box,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  AccountTree as DependenciesIcon,
  Timeline as CriticalPathIcon,
  MoreVert as MoreIcon,
  Fullscreen as FullscreenIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useState } from 'react';

const GanttControls = ({
  viewMode,
  showDependencies,
  showCriticalPath,
  onViewModeChange,
  onToggleDependencies,
  onToggleCriticalPath,
  onZoomIn,
  onZoomOut,
  isMobile = false
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    handleMenuClose();
  };

  if (isMobile) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Zoom In">
          <IconButton size="small" onClick={onZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Zoom Out">
          <IconButton size="small" onClick={onZoomOut}>
            <ZoomOutIcon />
          </IconButton>
        </Tooltip>
        <IconButton size="small" onClick={handleMenuClick}>
          <MoreIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={() => { onToggleDependencies(!showDependencies); handleMenuClose(); }}>
            {showDependencies ? 'Hide' : 'Show'} Dependencies
          </MenuItem>
          <MenuItem onClick={() => { onToggleCriticalPath(!showCriticalPath); handleMenuClose(); }}>
            {showCriticalPath ? 'Hide' : 'Show'} Critical Path
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleFullscreen}>
            Fullscreen
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="Show/Hide Dependencies">
        <ToggleButton
          value="dependencies"
          selected={showDependencies}
          onChange={() => onToggleDependencies(!showDependencies)}
          size="small"
        >
          <DependenciesIcon />
        </ToggleButton>
      </Tooltip>
      
      <Tooltip title="Show/Hide Critical Path">
        <ToggleButton
          value="criticalPath"
          selected={showCriticalPath}
          onChange={() => onToggleCriticalPath(!showCriticalPath)}
          size="small"
        >
          <CriticalPathIcon />
        </ToggleButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <Tooltip title="Zoom In">
        <IconButton size="small" onClick={onZoomIn}>
          <ZoomInIcon />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Zoom Out">
        <IconButton size="small" onClick={onZoomOut}>
          <ZoomOutIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Fullscreen">
        <IconButton size="small" onClick={handleFullscreen}>
          <FullscreenIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default GanttControls;
