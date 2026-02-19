# Canvas Radial Menu — Design Document

**Date:** 2026-02-11
**Feature:** Add a radial menu that appears when clicking on the map canvas (not on a marker) in Select mode, offering quick placement of markers, devices, observations, RFIs, and notes.

## Trigger Behavior

- **Select tool only**: The canvas radial menu appears only when the active tool is `select` and the user clicks on an empty area of the map (no marker hit).
- Map click handler checks `activeTool === 'select'` and verifies the click target is not a marker element.
- The menu appears centered at the click position, storing the corresponding `lngLat` for annotation placement.

## Menu Layout

5 segments arranged radially:

| Segment | Label | Icon | Action |
|---------|-------|------|--------|
| Marker | Marker | `material-symbols:location-on` | Create pin annotation at click point |
| Devices | Devices | `material-symbols:devices` | Open device sub-menu (5 device types) |
| Observation | Observation | `material-symbols:visibility` | Create observation annotation |
| RFI | RFI | `material-symbols:help-circle-outline` | Create RFI annotation |
| Note | Note | `material-symbols:sticky-note-2` | Create note annotation |

### Device Sub-Menu

Selecting "Devices" opens a second-level radial with 5 segments matching existing device types:

| Segment | Label | Icon | Color |
|---------|-------|------|-------|
| Door | Door | `material-symbols:door-front` | #8B5CF6 |
| Camera | Camera | `material-symbols:videocam-outline` | #3B82F6 |
| Enclosure | Enclosure | `material-symbols:tv-gen-outline` | #22C55E |
| Alarm | Alarm | `material-symbols:alarm-on` | #EF4444 |
| Network | Network | `material-symbols:lan` | #F97316 |

## New Annotation Types

Three new annotation types added to the system:

| Type | Icon | Color | Tag Prefix | Marker Shape |
|------|------|-------|------------|--------------|
| `observation` | `material-symbols:visibility` | Cyan #06B6D4 | OBS | Rounded square badge |
| `rfi` | `material-symbols:help-circle-outline` | Amber #F59E0B | RFI | Rounded square badge |
| `note` | `material-symbols:sticky-note-2` | Slate #94A3B8 | NTE | Rounded square badge |

### Rounded-Square Badge Markers

New marker shape distinct from teardrop pins/devices:

```
SVG: 30x30 viewBox
<rect width="30" height="30" rx="6" fill="{color}"/>
White Iconify icon centered (16x16 img overlay)
```

- Same flex-column wrapper pattern as existing markers
- Ground shadow (same ellipse style)
- Tag label below (same style: bold 9px monospace, white on dark bg)
- Draggable, clickable, supports radial context menu

### ANNOTATION_TYPES Constant

Added to `deviceTypes.js`:

```js
export const ANNOTATION_TYPES = {
  observation: { icon: 'material-symbols:visibility',            color: '#06B6D4', label: 'Observation' },
  rfi:         { icon: 'material-symbols:help-circle-outline',   color: '#F59E0B', label: 'RFI' },
  note:        { icon: 'material-symbols:sticky-note-2',         color: '#94A3B8', label: 'Note' },
};
```

### Extended TAG_PREFIXES

```js
export const TAG_PREFIXES = {
  pin: 'MRK',
  device_door: 'DOR',
  device_camera: 'CAM',
  device_enclosure: 'ENC',
  device_alarm: 'ALM',
  device_network: 'NET',
  observation: 'OBS',
  rfi: 'RFI',
  note: 'NTE',
};
```

## CanvasRadialMenu Component

New file: `CanvasRadialMenu.jsx`

- Uses `customizable-radial-menu` (dynamic import for SSR safety)
- `forwardRef` + `useImperativeHandle` exposing `show(x, y, lngLat)`, `hide()`, `getLngLat()`
- Internal state: `{ visible, x, y, lngLat }`
- 2-level radial: main menu → device sub-menu
- On item select: calls `onSelect(type, subType)` prop
  - `('pin', null)` for Marker
  - `('device', 'camera')` for a device
  - `('observation', null)` for Observation
  - `('rfi', null)` for RFI
  - `('note', null)` for Note

## Database Migration

Add 3 new values to the CHECK constraint on `drawing_annotations.type`:

```sql
ALTER TABLE drawing_annotations
  DROP CONSTRAINT drawing_annotations_type_check,
  ADD CONSTRAINT drawing_annotations_type_check
    CHECK (type IN ('pin', 'text', 'line', 'polygon', 'rectangle', 'circle',
                    'device_door', 'device_camera', 'device_enclosure',
                    'device_alarm', 'device_network',
                    'observation', 'rfi', 'note'));
```

## Wiring in SiteBox.jsx

- Add `canvasRadialMenuRef` (useRef)
- Canvas click handler: if `activeTool === 'select'` and click is not on a marker, call `canvasRadialMenuRef.current.show(x, y, lngLat)`
- `handleCanvasRadialSelect(type, subType)`:
  - For `'pin'`: set `pendingPin` with lngLat (existing flow → PinPopover)
  - For `'device'`: set `pendingPin` with lngLat + `_deviceType: subType` (existing flow → PinPopover with device title)
  - For `'observation'`/`'rfi'`/`'note'`: set `pendingPin` with lngLat + `_annotationType: type` → PinPopover with type-specific title, hide color picker

## SiteBoxCanvas.jsx Changes

- Add `select` to the map click handler tool check
- New `useEffect` for rendering rounded-square badge markers (observation/rfi/note):
  - Filter annotations by type
  - Create custom HTML elements with rounded-square SVG + icon overlay
  - Same drag/click/context-menu wiring as existing markers
  - Store refs in `badgeMarkersRef`

## Implementation Phases

### Phase 1 — Constants & DB
1. Add `ANNOTATION_TYPES` to `deviceTypes.js`
2. Extend `TAG_PREFIXES` with OBS/RFI/NTE
3. DB migration: update CHECK constraint

### Phase 2 — CanvasRadialMenu Component
4. Create `CanvasRadialMenu.jsx` with forwardRef, 2-level radial

### Phase 3 — SiteBox Wiring
5. Add canvas radial menu ref and render in SiteBox.jsx
6. Add `handleCanvasRadialSelect` handler
7. Update canvas click handler for Select tool
8. Extend `handlePinSave` for new annotation types

### Phase 4 — Canvas Rendering
9. Add `select` to map click condition in SiteBoxCanvas
10. Add rounded-square badge marker rendering useEffect
11. Verify drag, click, radial context menu work for new marker types

### Modified Files

| File | Changes |
|------|---------|
| `deviceTypes.js` | Add `ANNOTATION_TYPES`, extend `TAG_PREFIXES` |
| `CanvasRadialMenu.jsx` | New component — 2-level radial menu |
| `SiteBox.jsx` | Canvas radial ref, handlers, extended `handlePinSave` |
| `SiteBoxCanvas.jsx` | Select tool click handling, badge marker rendering |
| DB migration | Add observation/rfi/note to type CHECK constraint |
