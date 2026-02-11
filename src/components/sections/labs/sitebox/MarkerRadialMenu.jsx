'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

/**
 * MarkerRadialMenu component
 *
 * A React wrapper around the customizable-radial-menu library.
 * Shows a radial context menu when a pin marker is clicked.
 *
 * Props:
 * - onInfo: callback when the Info button is clicked
 * - onView: callback when the View button is clicked
 * - onDelete: callback when the Delete button is clicked
 *
 * Exposed methods (via ref):
 * - show(screenX, screenY, annotation): shows the menu at the given screen position for the annotation
 * - hide(): hides the menu
 * - getAnnotation(): returns the currently selected annotation
 */
const MarkerRadialMenu = forwardRef(({ onInfo, onView, onDelete }, ref) => {
  // Refs for callbacks to avoid stale closures
  const onInfoRef = useRef(onInfo);
  const onViewRef = useRef(onView);
  const onDeleteRef = useRef(onDelete);
  const menuRef = useRef(null);
  const annotationRef = useRef(null);

  // Sync callback refs
  useEffect(() => {
    onInfoRef.current = onInfo;
  }, [onInfo]);

  useEffect(() => {
    onViewRef.current = onView;
  }, [onView]);

  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  // Create menu instance once
  useEffect(() => {
    // Dynamic import to avoid SSR issues (library accesses document/window)
    import('customizable-radial-menu/src/RadialMenu')
      .then(({ default: RadialMenu }) => {
        const menu = new RadialMenu({
          fontFamily: 'Arial',
          fontSize: 11,
          innerCircle: 25,
          outerCircle: 70,
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
            { text: 'ℹ️', action: () => onInfoRef.current?.() },
            { text: '👁', action: () => onViewRef.current?.() },
            { text: '🗑', action: () => onDeleteRef.current?.() },
          ],
        });

        // CRITICAL: Restore default context menu (library overrides it)
        document.oncontextmenu = null;

        // Start hidden
        menu.hide();

        menuRef.current = menu;
      })
      .catch((error) => {
        console.error('Failed to load RadialMenu:', error);
      });

    return () => {
      // Cleanup: remove the canvas element
      if (menuRef.current?.canvas) {
        menuRef.current.canvas.remove();
        menuRef.current = null;
      }
    };
  }, []);

  // Expose show/hide/getAnnotation methods via ref
  useImperativeHandle(ref, () => ({
    show: (screenX, screenY, annotation) => {
      annotationRef.current = annotation;
      const menu = menuRef.current;
      if (!menu) return;

      // The menu's canvas center is at (w2, h2), so position accounts for that
      menu.setPos(screenX - menu.w2, screenY - menu.h2);
      menu.show();
    },
    hide: () => {
      menuRef.current?.hide();
      annotationRef.current = null;
    },
    getAnnotation: () => annotationRef.current,
  }));

  // No React DOM — library manages its own canvas
  return null;
});

MarkerRadialMenu.displayName = 'MarkerRadialMenu';

export default MarkerRadialMenu;
