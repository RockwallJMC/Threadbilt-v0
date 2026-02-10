'use client';

import { Box, Chip, Typography, FormControlLabel, Switch, Collapse } from '@mui/material';
import { useState } from 'react';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { nodeTypeConfig } from 'data/graph/nodeStyles';

// Default filter configuration
const defaultFilters = {
  accounts: true,
  contacts: true,
  opportunities: true,
  deals: true,
  projects: true,
  tasks: false,
  leads: false,
  properties: false,
  devices: false,
  proposals: false,
  companies: true,
  crm_contacts: true,
};

/**
 * Entity type filter controls for the graph
 */
export default function GraphFilters({
  filters = defaultFilters,
  onFilterChange,
  showAdvanced = false,
  onAdvancedToggle,
}) {
  const [expanded, setExpanded] = useState(false);

  const handleFilterToggle = (type) => {
    onFilterChange?.({
      ...filters,
      [type]: !filters[type],
    });
  };

  // Primary filters (always visible)
  const primaryFilters = ['accounts', 'contacts', 'opportunities', 'projects'];

  // Secondary filters (collapsed by default)
  const secondaryFilters = ['deals', 'leads', 'tasks', 'properties', 'devices', 'proposals'];

  const renderChip = (type) => {
    const config = nodeTypeConfig[type];
    if (!config) return null;

    const isActive = filters[type] ?? defaultFilters[type] ?? false;

    return (
      <Chip
        key={type}
        label={config.label}
        size="small"
        variant={isActive ? 'filled' : 'outlined'}
        onClick={() => handleFilterToggle(type)}
        sx={{
          cursor: 'pointer',
          bgcolor: isActive ? `${config.color.replace('.', '')}.main` : 'transparent',
          borderColor: `${config.color.replace('.', '')}.main`,
          color: isActive ? 'white' : 'text.primary',
          '&:hover': {
            bgcolor: isActive
              ? `${config.color.replace('.', '')}.dark`
              : `${config.color.replace('.', '')}.light`,
          },
        }}
      />
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Show Entities
      </Typography>

      {/* Primary filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        {primaryFilters.map(renderChip)}
      </Box>

      {/* Expand/collapse toggle */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          cursor: 'pointer',
          color: 'text.secondary',
          '&:hover': { color: 'primary.main' },
          mt: 1,
          mb: 0.5,
        }}
      >
        <Typography variant="caption">
          {expanded ? 'Show less' : 'Show more entity types'}
        </Typography>
        {expanded ? (
          <ExpandLessRoundedIcon fontSize="small" />
        ) : (
          <ExpandMoreRoundedIcon fontSize="small" />
        )}
      </Box>

      {/* Secondary filters (collapsible) */}
      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 1 }}>
          {secondaryFilters.map(renderChip)}
        </Box>
      </Collapse>

      {/* Advanced options */}
      {showAdvanced && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showAdvanced}
                onChange={onAdvancedToggle}
              />
            }
            label={
              <Typography variant="caption">Show organization links</Typography>
            }
          />
        </Box>
      )}
    </Box>
  );
}

export { defaultFilters };
