'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Stack, Typography, Button, CircularProgress } from '@mui/material';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CompactOrgNode from './nodes/CompactOrgNode';
import ExpandedOrgNode from './nodes/ExpandedOrgNode';
import OrgEdge from './edges/OrgEdge';
import useOrgLayout from './useOrgLayout';

const nodeTypes = { compact: CompactOrgNode, expanded: ExpandedOrgNode };
const edgeTypes = { orgEdge: OrgEdge };

const OrgChartFlow = ({ treeData, isLoading, error, onNodeClick, onRefresh }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const { nodes: layoutNodes, edges: layoutEdges } = useOrgLayout(treeData, expandedNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  // Sync layout when data or expanded state changes
  useMemo(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  const handleNodeClick = useCallback(
    (_event, node) => {
      const kind = node.data?.attributes?.kind;
      const isMember = kind === 'member';

      if (!isMember) return;

      // Check if click was on a CardActions button
      const target = _event.target.closest('[data-action]');
      const action = target?.dataset?.action;

      if (action === 'view-details') {
        onNodeClick?.(node.data.member);
        return;
      }

      if (action === 'collapse') {
        setExpandedNodes((prev) => {
          const next = new Set(prev);
          next.delete(node.id);
          return next;
        });
        return;
      }

      // Toggle expand/collapse on card click
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        if (next.has(node.id)) {
          next.delete(node.id);
        } else {
          next.add(node.id);
        }
        return next;
      });
    },
    [onNodeClick],
  );

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }} spacing={2}>
        <Typography color="error">
          {error.message || 'Failed to load organization hierarchy'}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={onRefresh}
          startIcon={<RefreshRoundedIcon />}
        >
          Retry
        </Button>
      </Stack>
    );
  }

  if (!treeData) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
        <Typography color="text.secondary">No hierarchy data available</Typography>
      </Stack>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      minZoom={0.3}
      maxZoom={2}
      proOptions={{ hideAttribution: true }}
    >
      <Controls showInteractive={false} />
      <MiniMap
        nodeStrokeWidth={3}
        pannable
        zoomable
        style={{ height: 80, width: 120 }}
      />
      <Background variant="dots" gap={16} size={1} />
    </ReactFlow>
  );
};

export default OrgChartFlow;
