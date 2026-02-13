# Marker Tags — Design Document

**Date:** 2026-02-11
**Feature:** Add sequential tag labels below each map marker with type-specific prefixes (MRK-0001, DOR-0001, CAM-0001, etc.)

## Tag Prefix Configuration

3-letter prefixes per marker type, stored as a shared constant in `deviceTypes.js`:

| Marker Type | Prefix | Example Tag |
|-------------|--------|-------------|
| Pin (generic) | MRK | MRK-0001 |
| Door | DOR | DOR-0001 |
| Camera | CAM | CAM-0001 |
| Enclosure | ENC | ENC-0001 |
| Alarm | ALM | ALM-0001 |
| Network | NET | NET-0001 |

```js
export const TAG_PREFIXES = {
  pin: 'MRK',
  device_door: 'DOR',
  device_camera: 'CAM',
  device_enclosure: 'ENC',
  device_alarm: 'ALM',
  device_network: 'NET',
};
```

## Tag Generation

- **Per-type sequential numbering**: each prefix maintains its own counter within a drawing
- **Computed at creation time** in `SiteBox.jsx` via `getNextTag(annotations, prefix)`:
  - Filter annotations matching the prefix
  - Find max `tagSequence` among them
  - Return max + 1 (or 1 if none exist)
- **Stored separately** as `properties.tagPrefix` (string) and `properties.tagSequence` (number) for future customization
- **Immutable once assigned**: gaps from deletions are acceptable, tags never renumber
- **No DB migration needed**: tags stored in existing JSONB `properties` column

## Visual Tag Label

A small label div appended below each marker element on the canvas:

```
font: bold 9px monospace
color: #fff
background: rgba(0,0,0,0.6)
border-radius: 3px
padding: 1px 4px
text-align: center
pointer-events: none
white-space: nowrap
margin-top: 2px
```

Display format: `{prefix}-{sequence.toString().padStart(4, '0')}` (e.g., `CAM-0001`)

## Pin Marker Conversion

Pin markers currently use Mapbox's built-in `new mapboxgl.Marker({ color, draggable: true, scale: 0.85 })` which renders its own internal DOM. This prevents appending a tag label div.

**Conversion approach:**
- Replace built-in markers with custom HTML elements using the same teardrop SVG path as device markers
- Solid color fill (no white circle or icon, since pins don't have device icons)
- Same dimensions (32x44 viewBox), same `anchor: 'bottom'`, same drag/click behavior
- Tag label div appended to the wrapper, appearing below the teardrop point

## Implementation Changes

### Modified Files

| File | Changes |
|------|---------|
| `deviceTypes.js` | Add exported `TAG_PREFIXES` constant |
| `SiteBox.jsx` | Add `getNextTag()` helper. Include `tagPrefix` and `tagSequence` in annotation properties at creation for both pins and devices. |
| `SiteBoxCanvas.jsx` | Convert pin markers from built-in Mapbox markers to custom HTML elements with teardrop SVG (solid fill, no icon). Add tag label div below both pin and device marker elements. |

### Implementation Phases

#### Phase 1 — TAG_PREFIXES constant
1. Add `TAG_PREFIXES` export to `deviceTypes.js`

#### Phase 2 — Tag generation in SiteBox.jsx
2. Add `getNextTag(annotations, prefix)` helper
3. Compute and include `tagPrefix` / `tagSequence` in properties when creating pins
4. Compute and include `tagPrefix` / `tagSequence` in properties when creating devices

#### Phase 3 — Canvas rendering
5. Convert pin markers from built-in to custom HTML teardrop SVG elements
6. Add tag label div to pin marker elements
7. Add tag label div to device marker elements
8. Verify drag, click, radial menu all still work for both marker types
