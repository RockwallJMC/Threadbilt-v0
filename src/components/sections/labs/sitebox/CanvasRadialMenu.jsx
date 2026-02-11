'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

/**
 * CanvasRadialMenu component
 *
 * A React wrapper around the customizable-radial-menu library.
 * Shows a two-tier radial context menu when the canvas is right-clicked.
 *
 * Main menu options:
 * - 📍 Marker (Pin): Creates a pin marker at the clicked location
 * - 🔧 Devices: Opens device sub-menu
 * - 👁 Observation: Creates an observation
 * - ❓ RFI: Creates an RFI (Request for Information)
 * - 📝 Note: Creates a note
 *
 * Device sub-menu options (shown when Devices is clicked):
 * - 🚪 Door: Door device
 * - 📷 Camera: Camera device
 * - 📺 Enclosure: Enclosure device
 * - 🔔 Alarm: Alarm device
 * - 🌐 Network: Network device
 *
 * Props:
 * - onSelect(type, subType): callback when user selects an item
 *   - ('pin', null) for Marker
 *   - ('device', deviceType) for a device (e.g., ('device', 'camera'))
 *   - ('observation', null) for Observation
 *   - ('rfi', null) for RFI
 *   - ('note', null) for Note
 *
 * Exposed methods (via ref):
 * - show(screenX, screenY, lngLat): shows the menu at the given screen position and stores lngLat
 * - hide(): hides the menu
 * - getLngLat(): returns the stored lngLat coordinates
 */
const CanvasRadialMenu = forwardRef(({ onSelect }, ref) => {
  // Refs for callbacks to avoid stale closures
  const onSelectRef = useRef(onSelect);
  const mainMenuRef = useRef(null);
  const deviceMenuRef = useRef(null);
  const lngLatRef = useRef(null);
  const posRef = useRef({ x: 0, y: 0 });

  // Sync callback ref
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create both menu instances once
  useEffect(() => {
    // Dynamic import to avoid SSR issues (library accesses document/window)
    import('customizable-radial-menu/src/RadialMenu')
      .then(({ default: RadialMenu }) => {
        // Main menu configuration
        const mainMenu = new RadialMenu({
          fontFamily: 'Arial',
          fontSize: 22,
          innerCircle: 25,
          outerCircle: 80,
          rotation: Math.PI / 2, // Rotate for better alignment
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          textColor: '#ffffff',
          hoverTextColor: '#ffffff',
          shadowBlur: 12,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          buttonGap: 0.05,
          zIndex: 1400, // Above SiteBox (1300) but below dialogs
          buttons: [
            {
              text: '📍',
              action: () => {
                onSelectRef.current?.('pin', null);
                mainMenuRef.current?.hide();
              },
            },
            {
              text: '🔧',
              action: () => {
                mainMenuRef.current?.hide();
                const dm = deviceMenuRef.current;
                if (dm) {
                  dm.setPos(posRef.current.x - dm.w2, posRef.current.y - dm.h2);
                  dm.show();
                }
              },
            },
            {
              text: '👁',
              action: () => {
                onSelectRef.current?.('observation', null);
                mainMenuRef.current?.hide();
              },
            },
            {
              text: '❓',
              action: () => {
                onSelectRef.current?.('rfi', null);
                mainMenuRef.current?.hide();
              },
            },
            {
              text: '📝',
              action: () => {
                onSelectRef.current?.('note', null);
                mainMenuRef.current?.hide();
              },
            },
          ],
        });

        // CRITICAL: Restore default context menu (library overrides it)
        document.oncontextmenu = null;

        // Start hidden
        mainMenu.hide();
        mainMenuRef.current = mainMenu;

        // Device sub-menu configuration
        const deviceMenu = new RadialMenu({
          fontFamily: 'Arial',
          fontSize: 22,
          innerCircle: 30, // Slightly larger to differentiate
          outerCircle: 85,
          rotation: Math.PI / 2,
          backgroundColor: 'rgba(26, 26, 26, 0.9)',
          hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
          textColor: '#ffffff',
          hoverTextColor: '#ffffff',
          shadowBlur: 12,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          buttonGap: 0.05,
          zIndex: 1400,
          buttons: [
            {
              text: '🚪',
              action: () => {
                onSelectRef.current?.('device', 'door');
                deviceMenuRef.current?.hide();
              },
            },
            {
              text: '📷',
              action: () => {
                onSelectRef.current?.('device', 'camera');
                deviceMenuRef.current?.hide();
              },
            },
            {
              text: '📺',
              action: () => {
                onSelectRef.current?.('device', 'enclosure');
                deviceMenuRef.current?.hide();
              },
            },
            {
              text: '🔔',
              action: () => {
                onSelectRef.current?.('device', 'alarm');
                deviceMenuRef.current?.hide();
              },
            },
            {
              text: '🌐',
              action: () => {
                onSelectRef.current?.('device', 'network');
                deviceMenuRef.current?.hide();
              },
            },
          ],
        });

        // CRITICAL: Restore default context menu (library overrides it)
        document.oncontextmenu = null;

        // Start hidden
        deviceMenu.hide();
        deviceMenuRef.current = deviceMenu;
      })
      .catch((error) => {
        console.error('Failed to load RadialMenu:', error);
      });

    return () => {
      // Cleanup: remove both canvas elements
      if (mainMenuRef.current?.canvas) {
        mainMenuRef.current.canvas.remove();
        mainMenuRef.current = null;
      }
      if (deviceMenuRef.current?.canvas) {
        deviceMenuRef.current.canvas.remove();
        deviceMenuRef.current = null;
      }
    };
  }, []);

  // Expose show/hide/getLngLat methods via ref
  useImperativeHandle(ref, () => ({
    show: (screenX, screenY, lngLat) => {
      // Store position and lngLat
      posRef.current = { x: screenX, y: screenY };
      lngLatRef.current = lngLat;

      // Show only the main menu
      const menu = mainMenuRef.current;
      if (!menu) return;

      // The menu's canvas center is at (w2, h2), so position accounts for that
      menu.setPos(screenX - menu.w2, screenY - menu.h2);
      menu.show();
    },
    hide: () => {
      // Hide both menus
      mainMenuRef.current?.hide();
      deviceMenuRef.current?.hide();
      lngLatRef.current = null;
    },
    getLngLat: () => lngLatRef.current,
  }));

  // No React DOM — library manages its own canvas
  return null;
});

CanvasRadialMenu.displayName = 'CanvasRadialMenu';

export default CanvasRadialMenu;
