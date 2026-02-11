'use client';

import { useMemo } from 'react';
import dagre from '@dagrejs/dagre';

const COMPACT_WIDTH = 280;
const COMPACT_HEIGHT = 130;
const EXPANDED_WIDTH = 300;
const EXPANDED_HEIGHT = 160;

/**
 * Converts a hierarchy tree into React Flow nodes/edges using dagre for auto-layout.
 * Re-runs layout when expandedNodes changes to accommodate larger card sizes.
 */
const useOrgLayout = (treeData, expandedNodes) => {
  return useMemo(() => {
    if (!treeData) return { nodes: [], edges: [] };

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 20, ranksep: 60 });

    const flowNodes = [];
    const flowEdges = [];

    const walk = (node, parentId) => {
      const isExpanded = expandedNodes.has(node.id);
      const width = isExpanded ? EXPANDED_WIDTH : COMPACT_WIDTH;
      const height = isExpanded ? EXPANDED_HEIGHT : COMPACT_HEIGHT;

      g.setNode(node.id, { width, height });

      flowNodes.push({
        id: node.id,
        type: isExpanded ? 'expanded' : 'compact',
        data: { ...node },
        position: { x: 0, y: 0 },
      });

      if (parentId) {
        const edgeId = `${parentId}-${node.id}`;
        g.setEdge(parentId, node.id);
        flowEdges.push({
          id: edgeId,
          source: parentId,
          target: node.id,
          type: 'orgEdge',
          data: { role: node.attributes?.role },
        });
      }

      if (node.children) {
        node.children.forEach((child) => walk(child, node.id));
      }
    };

    walk(treeData, null);
    dagre.layout(g);

    const layoutNodes = flowNodes.map((n) => {
      const dagreNode = g.node(n.id);
      return {
        ...n,
        position: {
          x: dagreNode.x - dagreNode.width / 2,
          y: dagreNode.y - dagreNode.height / 2,
        },
      };
    });

    return { nodes: layoutNodes, edges: flowEdges };
  }, [treeData, expandedNodes]);
};

export default useOrgLayout;
