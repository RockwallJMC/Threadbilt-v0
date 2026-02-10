'use client';

import { useRef, useCallback } from 'react';
import { Box, Paper, Typography, Button, IconButton, Tooltip, Skeleton } from '@mui/material';
import { useRouter } from 'next/navigation';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import paths from 'routes/paths';

import GraphVisualization from './GraphVisualization';
import GraphLegend from './GraphLegend';
import { useGraphData } from 'services/swr/api-hooks/useGraphApi';

/**
 * Compact graph widget for dashboard integration
 * Shows a simplified view of the user's relationship network
 */
export default function GraphWidget({ sx }) {
  const router = useRouter();
  const graphRef = useRef(null);

  // Fetch graph data with limited depth for widget view
  const { data, isLoading, error, mutate } = useGraphData('user', null, {
    depth: 1,
    entityTypes: ['accounts', 'contacts', 'opportunities', 'projects'],
  });

  const handleViewFullGraph = useCallback(() => {
    router.push(paths.graphExplorer);
  }, [router]);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleNodeDoubleClick = useCallback((node) => {
    // Navigate to full graph explorer with this node selected
    router.push(paths.graphExplorer);
  }, [router]);

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          pb: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Relationship Network
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data?.nodes?.length || 0} connections
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Refresh">
            <IconButton size="small" onClick={handleRefresh} disabled={isLoading}>
              <RefreshRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="View Full Graph">
            <IconButton size="small" onClick={handleViewFullGraph}>
              <OpenInFullRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Graph */}
      <Box sx={{ flex: 1, position: 'relative', minHeight: 250 }}>
        {isLoading ? (
          <Box sx={{ p: 2, height: '100%' }}>
            <Skeleton variant="rectangular" height="100%" sx={{ borderRadius: 1 }} />
          </Box>
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 2,
            }}
          >
            <Typography variant="body2" color="error">
              Failed to load graph
            </Typography>
          </Box>
        ) : (
          <GraphVisualization
            ref={graphRef}
            nodes={data?.nodes || []}
            edges={data?.edges || []}
            loading={isLoading}
            onNodeDoubleClick={handleNodeDoubleClick}
            isWidget
            sx={{ borderRadius: 0 }}
          />
        )}
      </Box>

      {/* Compact legend */}
      <Box sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}>
        <GraphLegend compact />
      </Box>

      {/* Footer action */}
      <Box sx={{ p: 2, pt: 0 }}>
        <Button
          variant="outlined"
          size="small"
          fullWidth
          onClick={handleViewFullGraph}
          endIcon={<OpenInFullRoundedIcon />}
        >
          Explore Full Network
        </Button>
      </Box>
    </Paper>
  );
}
