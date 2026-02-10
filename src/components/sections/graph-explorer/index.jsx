'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Box, Paper, Grid, Typography, Breadcrumbs, Link } from '@mui/material';
import { useRouter } from 'next/navigation';
import paths from 'routes/paths';

import GraphVisualization from './GraphVisualization';
import GraphControls from './GraphControls';
import GraphFilters, { defaultFilters } from './GraphFilters';
import GraphLegend from './GraphLegend';
import GraphSidebar from './GraphSidebar';
import PerspectiveSelector from './PerspectiveSelector';
import { useGraphData } from 'services/swr/api-hooks/useGraphApi';

/**
 * Main Graph Explorer dashboard component
 * Displays an interactive graph visualization of entity relationships
 */
export default function GraphExplorer() {
  const router = useRouter();
  const graphRef = useRef(null);

  // State
  const [perspective, setPerspective] = useState('user');
  const [centerId, setCenterId] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedNode, setSelectedNode] = useState(null);
  const [depth, setDepth] = useState(2);

  // Get enabled entity types from filters
  const entityTypes = useMemo(() => {
    return Object.entries(filters)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type);
  }, [filters]);

  // Fetch graph data
  const { data, isLoading, error, mutate } = useGraphData(perspective, centerId, {
    depth,
    entityTypes,
  });

  // Event handlers
  const handleNodeSelect = useCallback((node) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDoubleClick = useCallback((node) => {
    // Navigate to entity detail page
    const entityId = node.entityId;
    switch (node.type) {
      case 'accounts':
      case 'contacts':
        router.push(paths.contactDetails?.(entityId) || paths.contacts);
        break;
      case 'opportunities':
      case 'deals':
        router.push(paths.dealDetails?.(entityId) || paths.deals);
        break;
      case 'projects':
        router.push(paths.projectBoards);
        break;
      case 'leads':
        router.push(paths.leadDetails);
        break;
      default:
        break;
    }
  }, [router]);

  const handleRefresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handlePerspectiveChange = useCallback((newPerspective) => {
    setPerspective(newPerspective);
    setCenterId(null); // Reset center when perspective changes
    setSelectedNode(null);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSelectedNode(null);
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            underline="hover"
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push(paths.crm);
            }}
          >
            Apps
          </Link>
          <Typography color="text.primary">Graph Explorer</Typography>
        </Breadcrumbs>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Relationship Graph
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Visualize connections between accounts, contacts, projects, and more
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left sidebar - Controls */}
        <Grid item xs={12} md={3} lg={2}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <PerspectiveSelector
              value={perspective}
              onChange={handlePerspectiveChange}
              disabled={isLoading}
            />
          </Paper>

          <Paper sx={{ mb: 2 }}>
            <GraphFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </Paper>

          <Paper>
            <GraphLegend />
          </Paper>
        </Grid>

        {/* Main graph area */}
        <Grid item xs={12} md={selectedNode ? 6 : 9} lg={selectedNode ? 7 : 10}>
          <Paper sx={{ position: 'relative' }}>
            {/* Controls overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                zIndex: 10,
              }}
            >
              <GraphControls
                graphRef={graphRef}
                onRefresh={handleRefresh}
                disabled={isLoading}
              />
            </Box>

            {/* Graph stats */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 10,
                bgcolor: 'background.paper',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {data?.nodes?.length || 0} nodes &bull; {data?.edges?.length || 0} edges
              </Typography>
            </Box>

            {/* Graph visualization */}
            <GraphVisualization
              ref={graphRef}
              nodes={data?.nodes || []}
              edges={data?.edges || []}
              loading={isLoading}
              error={error?.message}
              onNodeSelect={handleNodeSelect}
              onNodeDoubleClick={handleNodeDoubleClick}
              selectedNodeId={selectedNode?.id}
              height={600}
            />
          </Paper>
        </Grid>

        {/* Right sidebar - Node details */}
        {selectedNode && (
          <Grid item xs={12} md={3} lg={3}>
            <Paper sx={{ height: 600, overflow: 'auto' }}>
              <GraphSidebar
                selectedNode={selectedNode}
                onClose={handleCloseSidebar}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
