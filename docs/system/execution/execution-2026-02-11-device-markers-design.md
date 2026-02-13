# Device Markers — Design Document

**Date:** 2026-02-11
**Feature:** Add categorized device markers (Door, Camera, Enclosure, Alarm, Network) to SiteBox toolbar with custom teardrop+icon map markers.

## Toolbar Integration

A new **Device** tool is inserted at position 2 in the toolbar (after Select, before Pin). Follows the same dropdown pattern as Shape:

```
Select | Device ▾ | Pin | Freehand | Shape ▾ | Text | Measure | Eraser
```

Clicking Device activates `device` tool and opens a dropdown with 5 device types.

## Device Types

Shared constant `DEVICE_TYPES` in `deviceTypes.js`:

| Device Type | Icon | Color | Label |
|-------------|------|-------|-------|
| door | `material-symbols:door-front` | #8B5CF6 (purple) | Door |
| camera | `material-symbols:videocam-outline` | #3B82F6 (blue) | Camera |
| enclosure | `material-symbols:tv-gen-outline` | #22C55E (green) | Enclosure |
| alarm | `material-symbols:alarm-on` | #EF4444 (red) | Alarm |
| network | `material-symbols:lan` | #F97316 (orange) | Network |

Toolbar button shows `material-symbols:devices-other` as the generic icon.

## Custom Teardrop Marker with Icon

Custom HTML element for Mapbox markers:
- SVG teardrop path (32x44px) filled with device type color
- White circle (r=9) centered in the bulb portion
- Device icon (16px) rendered inside the circle via Iconify CDN SVG
- `anchor: 'bottom'` since the teardrop point is at the bottom
- Draggable, with same click→radial menu and drag→move behavior as pins

Icon fetched from: `https://api.iconify.design/material-symbols/{name}.svg?color={encodedColor}`

## Data Model

No schema changes to `drawing_annotations` table structure. New annotation type value:

```js
{
  type: 'device',
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: {
    deviceType: 'camera',    // door|camera|enclosure|alarm|network
    title: 'Front Entrance', // user-entered
    color: '#3B82F6',        // auto-set from DEVICE_TYPES
  }
}
```

**Database migration required:** Add `'device'` to the CHECK constraint on `drawing_annotations.type`.

## Interaction Flow

1. User selects Device tool → dropdown shows 5 device types
2. User picks a type (e.g., Camera) → cursor changes to crosshair
3. User clicks on drawing → device marker placed at location
4. PinPopover opens for title entry (color is auto-set, not user-picked)
5. Marker appears as teardrop with camera icon inside
6. Click marker → radial menu (Info/View/Delete) — same as pins

## New Files

| File | Purpose |
|------|---------|
| `src/components/sections/labs/sitebox/deviceTypes.js` | Shared DEVICE_TYPES constant |

## Modified Files

| File | Changes |
|------|---------|
| `SiteBoxToolbar.jsx` | Add device tool (position 2) with dropdown menu. New props: deviceType, onDeviceTypeChange |
| `SiteBox.jsx` | New state: deviceType (default 'camera'). Handle activeTool==='device' in canvas click. Auto-set color from DEVICE_TYPES. Pass deviceType props to toolbar and canvas. |
| `SiteBoxCanvas.jsx` | New useEffect for device annotations. Custom HTML teardrop SVG element with Iconify icon. deviceMarkersRef for cleanup. Same drag/click handlers as pins. |
| Database | Migration: add 'device' to type CHECK constraint |

## Implementation Phases

### Phase 1 — Shared constant + DB migration
1. Create `deviceTypes.js`
2. Add 'device' to CHECK constraint via Supabase migration

### Phase 2 — Toolbar
3. Add Device tool to TOOLS array (position 2)
4. Add DEVICE_TYPES dropdown menu (same pattern as SHAPE_TYPES)
5. Wire deviceType/onDeviceTypeChange props

### Phase 3 — SiteBox wiring
6. Add deviceType state
7. Handle activeTool==='device' in handleCanvasClick
8. Pass deviceType to toolbar and canvas

### Phase 4 — Canvas rendering
9. New useEffect for device annotations
10. Custom HTML teardrop SVG + Iconify icon element
11. Draggable marker with click→radial menu, drag→move
12. Cleanup ref pattern matching pins
