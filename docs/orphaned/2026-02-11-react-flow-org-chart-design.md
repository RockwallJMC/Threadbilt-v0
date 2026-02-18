# React Flow Organization Chart Design

**Date:** 2026-02-11
**Status:** Approved
**Scope:** Replace pure React/CSS tree in Organization Hierarchy tab with React Flow + dagre

## Motivation

The current pure React/CSS recursive tree works but lacks:
- Pan/zoom/drag interactions for large orgs
- Auto-layout algorithms (dagre, elk) for complex hierarchies
- Future graph features (cross-team links, dotted-line reports)
- Visual polish (smooth animations, curved edges, minimap)

## Technology Choice: React Flow (@xyflow/react)

**Why React Flow over Cytoscape.js:**
- React Flow renders nodes as **actual React DOM elements** — MUI Card/Paper/Avatar work natively
- Cytoscape.js is canvas-based — MUI components require HTML overlay workarounds
- React Flow has built-in pan/zoom/drag, dagre layout plugin, minimap, controls
- 20k+ GitHub stars, actively maintained, Next.js compatible
- No d3 prototype patching issues (unlike react-d3-tree which failed with Turbopack)

**Packages:**
```bash
npm install @xyflow/react @dagrejs/dagre --legacy-peer-deps
```

## Architecture

### File Structure

```
src/components/sections/account/organization-hierarchy/
├── OrganizationHierarchyTabPanel.jsx  (MODIFY - replace Section 2, delete TreeNode)
├── OrgChartFlow.jsx                   (NEW - React Flow canvas wrapper)
├── nodes/
│   ├── CompactOrgNode.jsx             (NEW - default small card node)
│   └── ExpandedOrgNode.jsx            (NEW - full Card on click)
├── edges/
│   └── OrgEdge.jsx                    (NEW - role-colored smoothstep connector)
└── useOrgLayout.js                    (NEW - dagre layout hook)
```

### Data Flow

1. `useOrganizationHierarchy()` SWR hook fetches members (unchanged)
2. `buildHierarchyTree()` builds hierarchy tree (unchanged)
3. **NEW** `useOrgLayout()` converts tree into React Flow nodes/edges with dagre positions
4. `OrgChartFlow` renders React Flow canvas with MUI-styled custom nodes
5. Click compact node → toggles to expanded Card (dagre re-layouts)
6. Click "View Details" in expanded CardActions → opens MemberDetailsCard section below

### What Stays Unchanged

- `AccountTabPanelSection` wrapper structure
- `RoleBadge`, `RoleLegend` components (reused in nodes)
- `MemberDetailsCard` (Card + CardActions pattern, Section 3)
- `buildHierarchyTree()`, `pickParent()`, `ROLE_ORDER` helpers
- `useOrganizationHierarchy()` SWR hook
- Loading/error/empty states (moved into OrgChartFlow as overlays)

## Custom Nodes

### CompactOrgNode (default)

Compact card with avatar + name on top, role + child count below. Uses Box with `borderLeft: 4px solid {roleColor}`. Dimensions: ~200x80px.

```jsx
<Box sx={{ borderLeft: `4px solid ${roleColor}`, borderRadius: 2, p: 1.5,
           minWidth: 160, maxWidth: 220, bgcolor: 'background.paper', boxShadow: 1 }}>
  <Stack spacing={0.75}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar sx={{ width: 28, height: 28 }} />
      <Typography variant="body2" fontWeight={600}>{name}</Typography>
    </Stack>
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="caption">{role}</Typography>
      <Chip label={childrenCount} size="small" />
    </Stack>
  </Stack>
  <Handle type="target" position="top" />
  <Handle type="source" position="bottom" />
</Box>
```

### ExpandedOrgNode (on click)

Full MUI Card with CardHeader + CardContent + CardActions. Dimensions: ~300x160px.

```jsx
<Card background={1} variant="outlined" sx={{ minWidth: 260, maxWidth: 320 }}>
  <CardHeader avatar={<Avatar />} title={name} subheader={email} />
  <CardContent>
    <Stack direction="row" spacing={2}>
      <RoleBadge role={role} />
      <Typography variant="body2">Joined {date}</Typography>
    </Stack>
  </CardContent>
  <CardActions>
    <Button size="small" onClick={onViewDetails}>View Details</Button>
    <Button size="small" onClick={onCollapse}>Collapse</Button>
  </CardActions>
  <Handle type="target" position="top" />
  <Handle type="source" position="bottom" />
</Card>
```

### Root Node

Uses CompactOrgNode style with purple border (#5E35B1), no avatar, shows "X direct reports".

## Layout Hook (useOrgLayout)

Uses `@dagrejs/dagre` for automatic tree positioning:

- `rankdir: 'TB'` (top-to-bottom)
- `nodesep: 40` (horizontal spacing between siblings)
- `ranksep: 80` (vertical spacing between levels)
- Recalculates when `expandedNodes` Set changes (larger card = different dimensions)
- Returns `{ nodes, edges }` ready for React Flow

## Edges

Custom `OrgEdge` using smoothstep path (right-angle connectors):
- Colored by target node's role color
- `strokeWidth: 2`
- Matches current vertical/horizontal line aesthetic but automated

## Canvas Controls

- `<Controls />` — zoom in/out/fit buttons (bottom-left)
- `<MiniMap />` — bird's-eye view (bottom-right, optional for large orgs)
- `<Background variant="dots" />` — subtle dot grid
- `fitView` on initial load — auto-centers and zooms to fit all nodes

## Integration

Section 2 of OrganizationHierarchyTabPanel changes:

```jsx
{/* BEFORE */}
<Paper variant="elevation" background={1} sx={{ overflow: 'auto', minHeight: 400, ... }}>
  <TreeNode node={treeData} onNodeClick={handleNodeClick} />
</Paper>

{/* AFTER */}
<Box sx={{ height: 500 }}>
  <OrgChartFlow
    treeData={treeData}
    isLoading={isLoading}
    error={error}
    onNodeClick={handleNodeClick}
    onRefresh={handleRefresh}
  />
</Box>
```

**Critical:** React Flow requires a fixed-height parent (`height: 500`). Cannot use `minHeight` / auto-height.

**CSS Import:** `import '@xyflow/react/dist/style.css'` in OrgChartFlow.jsx.

## Estimated File Sizes

| File | Action | Lines |
|------|--------|-------|
| `OrgChartFlow.jsx` | NEW | ~80 |
| `nodes/CompactOrgNode.jsx` | NEW | ~60 |
| `nodes/ExpandedOrgNode.jsx` | NEW | ~70 |
| `edges/OrgEdge.jsx` | NEW | ~25 |
| `useOrgLayout.js` | NEW | ~50 |
| `OrganizationHierarchyTabPanel.jsx` | MODIFY | -160, +10 |

## Sources

- [React Flow](https://reactflow.dev) — Node-based UI library for React
- [React Flow Dagre Layout Example](https://reactflow.dev/examples/layout/dagre)
- [Dagre](https://github.com/dagrejs/dagre) — Directed graph layout
- [react-cytoscapejs](https://github.com/plotly/react-cytoscapejs) — Evaluated but rejected (canvas-based, no native MUI node support)
