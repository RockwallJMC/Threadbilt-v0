'use client';

import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import cytoscape from 'cytoscape';
import cola from 'cytoscape-cola';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';
import { getNodeStyles } from 'data/graph/nodeStyles';
import { getEdgeStyles } from 'data/graph/edgeStyles';
import { getLayoutConfig } from 'data/graph/layoutConfig';

// Register cola layout extension
cytoscape.use(cola);

/**
 * Core Cytoscape graph visualization component
 * Renders an interactive force-directed graph using the cola layout
 */
const GraphVisualization = forwardRef(function GraphVisualization(
  {
    nodes = [],
    edges = [],
    loading = false,
    error = null,
    onNodeSelect,
    onNodeDoubleClick,
    onEdgeSelect,
    selectedNodeId,
    isWidget = false,
    height = 600,
    sx,
  },
  ref
) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const theme = useTheme();
  const { getThemeColor } = useSettingsContext();

  // Expose cytoscape instance methods via ref
  useImperativeHandle(ref, () => ({
    fit: () => cyRef.current?.fit(),
    center: () => cyRef.current?.center(),
    zoom: (level) => cyRef.current?.zoom(level),
    reset: () => {
      cyRef.current?.fit();
      cyRef.current?.center();
    },
    exportPng: () => cyRef.current?.png({ full: true, scale: 2 }),
    exportSvg: () => cyRef.current?.svg({ full: true }),
    getCy: () => cyRef.current,
  }));

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current || loading) return;

    // Clean up existing instance
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // Prepare elements
    const elements = {
      nodes: nodes.map((node) => ({
        data: {
          ...node,
          id: node.id,
          label: node.label || node.name || node.id,
        },
      })),
      edges: edges.map((edge) => ({
        data: {
          ...edge,
          id: edge.id || `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
        },
      })),
    };

    // Create cytoscape instance
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        ...getNodeStyles(theme, getThemeColor),
        ...getEdgeStyles(theme, getThemeColor),
      ],
      layout: getLayoutConfig(nodes.length, isWidget),
      // Interaction settings
      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.3,
      boxSelectionEnabled: false,
      autounselectify: false,
      userZoomingEnabled: true,
      userPanningEnabled: true,
    });

    // Event handlers
    cyRef.current.on('tap', 'node', (e) => {
      const nodeData = e.target.data();
      onNodeSelect?.(nodeData);
    });

    cyRef.current.on('dbltap', 'node', (e) => {
      const nodeData = e.target.data();
      onNodeDoubleClick?.(nodeData);
    });

    cyRef.current.on('tap', 'edge', (e) => {
      const edgeData = e.target.data();
      onEdgeSelect?.(edgeData);
    });

    // Deselect when clicking on background
    cyRef.current.on('tap', (e) => {
      if (e.target === cyRef.current) {
        onNodeSelect?.(null);
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [nodes, edges, loading, theme, getThemeColor, onNodeSelect, onNodeDoubleClick, onEdgeSelect, isWidget]);

  // Handle container resize (fixes hidden container issue, e.g. TabPanel)
  useEffect(() => {
    if (!containerRef.current || !cyRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0 && cyRef.current) {
          cyRef.current.resize();
          cyRef.current.fit();
        }
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [nodes, edges, loading]);

  // Handle selected node highlighting
  useEffect(() => {
    if (!cyRef.current) return;

    // Remove previous selection
    cyRef.current.$('node:selected').unselect();

    // Select new node
    if (selectedNodeId) {
      const node = cyRef.current.$(`node[id="${selectedNodeId}"]`);
      if (node.length) {
        node.select();
      }
    }
  }, [selectedNodeId]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: isWidget ? 300 : height,
          bgcolor: 'background.paper',
          borderRadius: 2,
          ...sx,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: isWidget ? 300 : height,
          bgcolor: 'background.paper',
          borderRadius: 2,
          ...sx,
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Empty state
  if (!nodes.length) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: isWidget ? 300 : height,
          bgcolor: 'background.paper',
          borderRadius: 2,
          ...sx,
        }}
      >
        <Typography color="text.secondary">No data to display</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: isWidget ? 300 : height,
        bgcolor: 'background.paper',
        borderRadius: 2,
        cursor: 'grab',
        '&:active': {
          cursor: 'grabbing',
        },
        ...sx,
      }}
    />
  );
});

export default GraphVisualization;
