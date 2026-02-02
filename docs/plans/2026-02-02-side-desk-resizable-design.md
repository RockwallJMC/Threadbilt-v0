# Side Desk Resizable Width Feature Design

**Date:** 2026-02-02
**Feature:** Manual width adjuster for Side Desk Drawer
**Width Range:** 250px (min) - 500px (max)
**Persistence:** localStorage (preserved across sessions)

## Overview

Add horizontal resize capability to the Side Desk Drawer, allowing users to manually adjust the drawer width between 250-500px. The selected width persists across sessions via localStorage, following the same pattern as existing drawer settings (`sideDeskOpen`, `sideDeskLocked`).

## Design Sections

### 1. State Management & Persistence

Extend the existing SettingsReducer pattern to manage drawer width:

**src/reducers/SettingsReducer.js:**
- Add new action: `SET_SIDE_DESK_WIDTH`
- Add new state value: `sideDeskWidth: 500` (default)
- Add to localStorage persistence array
- Reducer case validates width is between 250-500px

**src/config.js:**
- Add `sideDeskWidth: 500` to initial config

**src/lib/constants.js:**
- Add new constants:
  ```javascript
  export const SIDE_DESK_WIDTH_DEFAULT = 500;
  export const SIDE_DESK_WIDTH_MIN = 250;
  export const SIDE_DESK_WIDTH_MAX = 500;
  ```
- Keep existing `sideDeskDrawerWidth = 500` for backward compatibility

### 2. Component Integration

Wrap drawer content with the existing `Resizable` component (used by ChatSidebar):

**src/components/sections/side-desk/SideDeskDrawer.jsx:**
- Import `Resizable` from `components/base/Resizable`
- Get `sideDeskWidth` from `useSettingsContext().config`
- Dispatch `SET_SIDE_DESK_WIDTH` action on resize
- Wrap drawer content with Resizable:
  ```javascript
  <Resizable
    size={{ width: sideDeskWidth, height: '100%' }}
    handleResize={handleResize}
    minWidth={SIDE_DESK_WIDTH_MIN}
    maxWidth={SIDE_DESK_WIDTH_MAX}
    sx={{
      '.resizable-handler': {
        width: '6px !important',
        outlineWidth: 1,
        outlineColor: 'divider',
      }
    }}
  >
    {drawerContent}
  </Resizable>
  ```
- Update paper width from constant to dynamic: `width: sideDeskWidth`

The resize handle appears on the right edge (left for RTL), enabling horizontal dragging. The `re-resizable` library handles the drag interaction.

### 3. Layout Adjustments

Update main content width calculations to use dynamic drawer width:

**src/layouts/main-layout/MainLayout.jsx:**
- Get `sideDeskWidth` from `useSettingsContext().config`
- Update width calculation:
  ```javascript
  width: {
    xs: '100%',
    md: navigationMenuType === 'threadnavbar'
      ? `calc(100% - ${sideDeskOpen ? drawerWidth + sideDeskWidth : drawerWidth}px)`
      : `calc(100% - ${drawerWidth}px)`,
  }
  ```
- Update margin-left with transition:
  ```javascript
  navigationMenuType === 'threadnavbar' && {
    ml: {
      xs: 0,
      md: sideDeskOpen ? `${sideDeskWidth}px` : 0,
    },
    transition: 'margin-left 0.3s, width 0.3s',
  }
  ```

The width transition ensures smooth animation during resize. Main content automatically adjusts while maintaining proper spacing with ThreadNavbar (80px).

## Implementation Details

### Existing Pattern Reference
- **Component:** `src/components/base/Resizable.jsx` (wrapper for `re-resizable`)
- **Usage Example:** `src/components/sections/chat/sidebar/layouts/ResizableSidebar.jsx`
- **Library:** `re-resizable` (already installed)

### Files to Modify

1. **src/lib/constants.js** - Add width constants
2. **src/config.js** - Add initial sideDeskWidth
3. **src/reducers/SettingsReducer.js** - Add action and state
4. **src/components/sections/side-desk/SideDeskDrawer.jsx** - Integrate Resizable
5. **src/layouts/main-layout/MainLayout.jsx** - Update width calculations

### User Experience

- Drag handle (6px width) appears on drawer's right edge
- Visual outline on hover (using `outlineColor: 'divider'`)
- Width constrained between 250-500px
- Smooth transitions for main content adjustment
- Width persists across browser sessions
- Works with both persistent (desktop) and temporary (mobile) drawer variants

## Success Criteria

- ✅ Drawer width adjustable via drag handle
- ✅ Width constrained to 250-500px range
- ✅ Width persists to localStorage
- ✅ Main content width/margin updates in real-time
- ✅ Smooth transitions during resize
- ✅ No layout breaks at min/max widths
- ✅ Works with ThreadNavbar positioning (80px offset)
- ✅ Resize handle visually consistent with app theme

## Technical Notes

- Uses existing `re-resizable` library (no new dependencies)
- Follows established SettingsReducer pattern
- RTL support handled by Resizable component
- Minimum 250px ensures iframe content remains usable
- Maximum 500px matches original design intent
