# SiteBox Drawing Lab — Feature Design

**Date:** 2026-02-11
**Status:** Approved
**Route:** `/apps/labs/sitebox/[projectId]/[drawingId]`

## Overview

SiteBox is a full-screen drawing lab that opens project drawings (PNG/JPG/PDF) as zoomable, pannable canvases using Mapbox GL with no base map tiles. Users can annotate drawings with pins, freehand marks, shapes, text labels, and measurement lines. Annotations are shared per-drawing and persisted in Supabase.

## Navigation

- **Entry point:** DrawingCard 3-dot menu → "Open in Drawing Lab"
- **URL:** `/apps/labs/sitebox/[projectId]/[drawingId]`
- **Back:** Arrow button returns to `/apps/projects/boards/[projectId]`
- `projectId` available via kanban context; `drawingId` from the card's data

## Page Structure

### Layout
- Full-screen canvas — no sidebar, no app chrome beyond a minimal top toolbar
- **Top toolbar** (sticky, semi-transparent dark bar):
  - Left: Back arrow, drawing title + version chip
  - Center: Tool palette (Select, Pin, Freehand, Shape, Text, Measure, Eraser)
  - Right: Undo/Redo, Save status indicator, Zoom level display
- **Canvas area:** Mapbox GL with blank style, drawing as image source
  - Pan: click-drag (Select tool active)
  - Zoom: scroll wheel + pinch + toolbar buttons
  - Fit-to-view button to reset zoom/position

### How the Drawing Loads
1. Page fetches drawing record from Supabase using `drawingId`
2. Gets signed URL for the image file
3. Creates Mapbox GL map with empty style: `{ version: 8, sources: {}, layers: [] }`
4. Adds drawing as `image` source mapped to arbitrary coordinates (`[[0, 0], [width, 0], [width, height], [0, height]]`)
5. Canvas background: neutral dark gray
6. **PDF handling:** Render first page to canvas/image client-side using `pdf.js` before loading into Mapbox

## Markup Tools

| Tool | Icon | Behavior |
|------|------|----------|
| **Select** | Cursor arrow | Default. Click to select annotations, drag to pan canvas. Selected items show resize handles + delete button. |
| **Pin** | Map pin | Click to drop pin. Popover: title field + color picker (6 preset colors). Renders as colored markers with label. |
| **Freehand** | Pen/pencil | Click-drag to draw. Configurable: stroke color (6 presets), stroke width (thin/medium/thick). Renders as GeoJSON line features. |
| **Shape** | Rectangle | Sub-menu: Rectangle, Circle, Arrow. Click-drag to draw. Same color/width options. Renders as GeoJSON polygon/line features. |
| **Text** | "T" icon | Click to place text box. Inline editing, font size (S/M/L) and color. Renders as Mapbox symbol layer. |
| **Measure** | Ruler | Click two points → distance line with label. Requires calibration. Dashed line style. |
| **Eraser** | Eraser | Click any annotation to delete. Confirmation on pins (may have notes). |

### Shared Tool Behaviors
- Active tool highlighted in toolbar
- `Escape` returns to Select tool
- All annotations stored as GeoJSON features in single Mapbox source (`annotations`)
- Each annotation has metadata: `type`, `color`, `createdBy`, `createdAt`, `properties`

### Undo/Redo
- In-memory action stack (not persisted)
- Tracks: create, delete, move, resize operations
- `Ctrl+Z` / `Ctrl+Shift+Z` keyboard shortcuts

## Two-Point Calibration & Measurement

### Calibration Flow
1. Triggered first time user activates Measure tool (or via toolbar settings icon)
2. Banner: "Calibrate scale: Click two points where you know the real distance"
3. User clicks Point A → red dot
4. User clicks Point B → red dot + dashed line
5. Dialog anchored to line: distance input, unit dropdown (feet/inches/meters/cm), "Calibrate" button
6. System calculates `pixelsPerUnit = pixelDistance / enteredDistance`
7. Calibration saved to drawing record in Supabase (persists across sessions/users)

### After Calibration
- Measure tool: click two points → dashed line with distance label (e.g., "14.5 ft")
- Shapes show dimensions on hover (width × height for rectangles, diameter for circles)
- Recalibrate option always available

### Calibration Data
```json
{
  "point_a": [x, y],
  "point_b": [x, y],
  "distance": 25,
  "unit": "feet",
  "pixels_per_unit": 42.3
}
```

## Database Schema

### New Table: `drawing_annotations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `drawing_id` | uuid FK → project_drawings | |
| `type` | text | `pin`, `freehand`, `shape`, `text`, `measurement` |
| `geometry` | jsonb | GeoJSON geometry (point, linestring, polygon) |
| `properties` | jsonb | `{ title, notes, color, strokeWidth, fontSize, shapeType, distanceLabel }` |
| `created_by` | uuid FK → auth.users | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Modified Table: `project_drawings` (add column)

| Column | Type | Notes |
|--------|------|-------|
| `calibration` | jsonb | Nullable. Null = uncalibrated. |

### RLS Policies
- `drawing_annotations`: Read/write for authenticated users with access to parent project (same pattern as existing `project_drawings` RLS)
- Calibration column follows existing `project_drawings` policies

## API Endpoints

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/projects/[projectId]/drawings/[drawingId]/annotations` | Fetch all annotations |
| POST | `/api/projects/[projectId]/drawings/[drawingId]/annotations` | Create annotation |
| PATCH | `/api/projects/[projectId]/drawings/[drawingId]/annotations/[annotationId]` | Update annotation |
| DELETE | `/api/projects/[projectId]/drawings/[drawingId]/annotations/[annotationId]` | Delete annotation |
| PATCH | `/api/projects/[projectId]/drawings/[drawingId]/calibration` | Save/update calibration |

### SWR Hook
`useDrawingAnnotations(projectId, drawingId)` — fetches annotations, provides mutate functions for optimistic UI updates.

## Component Tree

```
/apps/labs/sitebox/[projectId]/[drawingId]/page.jsx
├── SiteBoxToolbar
│   ├── BackButton
│   ├── DrawingTitle + VersionChip
│   ├── ToolPalette (Select|Pin|Freehand|Shape|Text|Measure|Eraser)
│   └── UndoRedo + ZoomDisplay + SaveStatus
├── SiteBoxCanvas (Mapbox GL wrapper)
│   ├── DrawingLayer (image source)
│   └── AnnotationsLayer (GeoJSON source)
├── CalibrationDialog (modal, on-demand)
├── PinPopover (anchored to selected pin)
└── TextEditor (inline, anchored to text annotation)
```

## Implementation Phases

| Phase | Scope | Deliverable |
|-------|-------|-------------|
| **Phase 1** | Page + Canvas | Route, toolbar shell, Mapbox blank canvas, drawing image loaded, pan/zoom working. PDF.js rendering for PDFs. |
| **Phase 2** | Pin + Text tools | Pin drop with popover, text placement, annotations table + API, save/load cycle. |
| **Phase 3** | Freehand + Shapes | Freehand drawing capture, rectangle/circle/arrow shapes, color/width options. |
| **Phase 4** | Measure + Calibration | Two-point calibration flow, measurement tool, dimension display on shapes. |
| **Phase 5** | Polish | Undo/redo stack, keyboard shortcuts, save status indicator, eraser tool, responsive edge cases. |

Each phase is independently deployable — Phase 1 alone gives a functional drawing viewer.
