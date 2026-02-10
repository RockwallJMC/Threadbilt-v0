'use client';

import { Box, Typography, Chip, Divider } from '@mui/material';
import { nodeTypeConfig } from 'data/graph/nodeStyles';
import { edgeTypeConfig } from 'data/graph/edgeStyles';

/**
 * Legend showing node and edge type visual mappings
 */
export default function GraphLegend({ compact = false }) {
  // Filter to commonly used types for compact view
  const visibleNodeTypes = compact
    ? ['user_profiles', 'accounts', 'contacts', 'opportunities', 'projects']
    : Object.keys(nodeTypeConfig);

  const visibleEdgeTypes = compact
    ? ['owner_id', 'account_id', 'assigned_to']
    : ['owner_id', 'account_id', 'contact_id', 'project_id', 'assigned_to', 'created_by'];

  return (
    <Box sx={{ p: 2 }}>
      {/* Node Types */}
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Node Types
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {visibleNodeTypes.map((type) => {
          const config = nodeTypeConfig[type];
          if (!config) return null;

          return (
            <Box
              key={type}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: `${config.color.split('.')[0]}.${config.color.split('.')[1] || 'main'}`,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {config.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {!compact && (
        <>
          <Divider sx={{ my: 2 }} />

          {/* Edge Types */}
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Relationships
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {visibleEdgeTypes.map((type) => {
              const config = edgeTypeConfig[type];
              if (!config) return null;

              return (
                <Box
                  key={type}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 2,
                      bgcolor: `${config.color}.main`,
                      borderStyle: config.style === 'dashed' ? 'dashed' : config.style === 'dotted' ? 'dotted' : 'solid',
                      borderWidth: config.style !== 'solid' ? 1 : 0,
                      borderColor: `${config.color}.main`,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {config.label}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </>
      )}

      {/* Legend notes */}
      {!compact && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Node size indicates relative value (for accounts, opportunities, deals)
          </Typography>
        </Box>
      )}
    </Box>
  );
}
