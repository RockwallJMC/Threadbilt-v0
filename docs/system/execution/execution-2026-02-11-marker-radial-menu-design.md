# Marker Radial Menu — Design Document

**Date:** 2026-02-11
**Feature:** Replace pin marker click → PinPopover with a radial context menu (cxtmenu-style) offering Info, View, and Delete actions.

## Interaction Flow

When a user **single-clicks** a pin marker on the SiteBox canvas:

1. A **radial menu** appears centered on the marker with 3 wedges
2. User clicks a wedge to select an action:
   - **Info** (FontAwesome `\uf05a`) → Small popover/tooltip near the marker showing title + color dot + coordinates. Dismisses on click-away.
   - **View** (FontAwesome `\uf06e`) → Opens a persistent left-side drawer (360px) with 3 tabs: Linked Data | History | Details
   - **Delete** (FontAwesome `\uf1f8`) → Confirmation dialog. On confirm, deletes the annotation.
3. Clicking outside the radial menu dismisses it
4. Drag still moves the marker (radial menu doesn't appear on drag)

This replaces the current `onPinClick → PinPopover` flow.

## RadialMenu Integration

Library: [victorqribeiro/radialMenu](https://github.com/victorqribeiro/radialMenu) — vanilla JS, canvas-rendered, zero React deps.

**Single shared instance** managed by SiteBox:
- One radial menu instance created once and reused for all markers
- On marker click: `radialMenu.setPos(x, y)` → `radialMenu.show()`
- On action select or click-away: `radialMenu.hide()`
- Canvas overlay with z-index above map but below dialogs

**Configuration:**
```
innerCircle: 30
outerCircle: 80
backgroundColor: 'rgba(26, 26, 26, 0.9)'
hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)'
textColor: '#ffffff'
fontFamily: 'FontAwesome'
buttons: [
  { text: '\uf05a', action: handleInfo },   // info circle
  { text: '\uf06e', action: handleView },   // eye
  { text: '\uf1f8', action: handleDelete }, // trash
]
```

## Left Drawer — 3-Tab Detail Panel

New component `MarkerDetailDrawer.jsx`:
- MUI `Drawer`, `anchor="left"`, `variant="persistent"`, width `360px`
- Dark theme (`bgcolor: '#1e1e1e'`) matching SiteBox
- Header: marker title + color dot + close button
- MUI `Tabs` with 3 tabs

### Tab 1 — Linked Data (default)
- Project items linked to this pin location (tasks, photos, documents)
- Each item as clickable list row with icon + title + status chip
- "Link Item" button at bottom
- **MVP:** Empty state — "No linked items yet"

### Tab 2 — History
- Activity log for this annotation
- Created by / created date
- List of changes: moved, renamed, color changed
- **MVP:** Show created_by + created_at as single entry + "Full history coming soon"

### Tab 3 — Annotation Details
- Read-only: title, color swatch, type badge, coordinates, created by, dates
- "Edit" button opens existing PinPopover dialog

## Delete Confirmation Dialog

New component `DeleteMarkerDialog.jsx`:
- MUI Dialog (Aurora pattern): `DialogTitle` → `DialogContent` → `DialogActions`
- Title: "Delete Marker?"
- Content: "Are you sure you want to delete **{title}**? This action cannot be undone."
- Actions: Cancel (text) | Delete (red contained)
- Dark themed (`bgcolor: '#2a2a2a'`)

## New Files

| File | Purpose |
|------|---------|
| `src/components/sections/labs/sitebox/MarkerRadialMenu.jsx` | Wrapper around radialMenu library. Exposes show/hide via ref. |
| `src/components/sections/labs/sitebox/MarkerDetailDrawer.jsx` | Left drawer with 3 tabs |
| `src/components/sections/labs/sitebox/DeleteMarkerDialog.jsx` | Confirm-delete dialog |

## Modified Files

| File | Changes |
|------|---------|
| `SiteBox.jsx` | New state: `radialMenuAnnotation`, `drawerOpen`, `deleteDialogOpen`. Replace `onPinClick` to show radial menu. Wire 3 actions. |
| `SiteBoxCanvas.jsx` | No changes — `onPinClick` callback stays the same |
| `package.json` | Add radialMenu (install via `npm install victorqribeiro/radialMenu` or vendor single file) |

## Existing Files Affected

- `PinPopover.jsx` — Still used when user clicks "Edit" from Details tab. Not deleted.

## Implementation Phases

### Phase 1 — RadialMenu integration (core)
1. Install/vendor radialMenu library
2. Create `MarkerRadialMenu.jsx` wrapper component
3. Update `SiteBox.jsx` — replace pin click flow with radial menu
4. Update marker click handler to show radial menu instead of PinPopover

### Phase 2 — Delete confirmation
5. Create `DeleteMarkerDialog.jsx` (Aurora Dialog pattern)
6. Wire delete action: radial menu → dialog → deleteAnnotation

### Phase 3 — Info popover
7. Wire info action: radial menu → small popover with title, color, coordinates

### Phase 4 — Detail drawer
8. Create `MarkerDetailDrawer.jsx` with 3 tabs
9. Tab 1: Linked Data (empty state MVP)
10. Tab 2: History (created_at + "coming soon")
11. Tab 3: Annotation Details (read-only + Edit button → PinPopover)
12. Wire view action: radial menu → open drawer
