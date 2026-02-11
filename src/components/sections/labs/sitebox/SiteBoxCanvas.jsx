'use client';

import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, ButtonGroup, CircularProgress, Stack, Typography } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as pdfjsLib from 'pdfjs-dist';
import IconifyIcon from 'components/base/IconifyIcon';
import { supabase } from 'lib/supabase/client';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

// Set PDF.js worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

const SiteBoxCanvas = ({
  drawing,
  projectId,
  onZoomChange,
  onMapReady,
  activeTool,
  annotations,
  onCanvasClick,
  onPinClick,
  onTextClick,
  selectedAnnotationId,
  onFreehandComplete,
  onShapeComplete,
  shapeType,
  strokeColor,
  strokeWidth,
  calibrationMode,
  calibrationPoints,
  measurePoints,
  onEraserDelete,
  onMarkerDragEnd,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const drawingBoundsRef = useRef(null);
  const markersRef = useRef([]);
  const textMarkersRef = useRef([]);
  const calibrationMarkersRef = useRef([]);
  const measureMarkersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Use refs to avoid recreating map on tool/callback changes
  const activeToolRef = useRef(activeTool);
  const onCanvasClickRef = useRef(onCanvasClick);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef([]);
  const strokeColorRef = useRef(strokeColor);
  const strokeWidthRef = useRef(strokeWidth);
  const onFreehandCompleteRef = useRef(onFreehandComplete);
  const onShapeCompleteRef = useRef(onShapeComplete);
  const shapeTypeRef = useRef(shapeType);
  const shapeStartRef = useRef(null);
  const onEraserDeleteRef = useRef(onEraserDelete);
  const onMarkerDragEndRef = useRef(onMarkerDragEnd);

  // Keep refs in sync
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  useEffect(() => {
    onCanvasClickRef.current = onCanvasClick;
  }, [onCanvasClick]);

  useEffect(() => {
    onEraserDeleteRef.current = onEraserDelete;
  }, [onEraserDelete]);

  useEffect(() => {
    onMarkerDragEndRef.current = onMarkerDragEnd;
  }, [onMarkerDragEnd]);

  useEffect(() => {
    strokeColorRef.current = strokeColor;
  }, [strokeColor]);

  useEffect(() => {
    strokeWidthRef.current = strokeWidth;
  }, [strokeWidth]);

  useEffect(() => {
    onFreehandCompleteRef.current = onFreehandComplete;
  }, [onFreehandComplete]);

  useEffect(() => {
    onShapeCompleteRef.current = onShapeComplete;
  }, [onShapeComplete]);

  useEffect(() => {
    shapeTypeRef.current = shapeType;
  }, [shapeType]);

  const hasAccessToken = Boolean(mapboxgl.accessToken);

  // Helper to compute shape geometry based on type
  const computeShapeGeometry = (shapeType, start, end) => {
    const [x1, y1] = start;
    const [x2, y2] = end;

    if (shapeType === 'rectangle') {
      return {
        type: 'Polygon',
        coordinates: [[[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]]],
      };
    } else if (shapeType === 'circle') {
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const rx = Math.abs(x2 - x1) / 2;
      const ry = Math.abs(y2 - y1) / 2;
      const points = [];
      for (let i = 0; i <= 36; i++) {
        const angle = (i / 36) * 2 * Math.PI;
        points.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
      }
      return { type: 'Polygon', coordinates: [points] };
    } else if (shapeType === 'arrow') {
      // Arrow with arrowhead
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const headLen = len * 0.15; // 15% of arrow length
      const angle = Math.atan2(dy, dx);
      const head1 = [
        x2 - headLen * Math.cos(angle - Math.PI / 6),
        y2 - headLen * Math.sin(angle - Math.PI / 6),
      ];
      const head2 = [
        x2 - headLen * Math.cos(angle + Math.PI / 6),
        y2 - headLen * Math.sin(angle + Math.PI / 6),
      ];

      return {
        type: 'MultiLineString',
        coordinates: [
          [start, end],       // Main shaft
          [head1, end, head2] // Arrowhead
        ],
      };
    }
  };

  // Disable drag pan when freehand or shape tool is active
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (activeTool === 'freehand' || activeTool === 'shape') {
      map.dragPan.disable();
    } else {
      map.dragPan.enable();
    }
  }, [activeTool]);

  // Update live stroke styling when color/width changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const widthMap = { thin: 2, medium: 4, thick: 6 };

    if (map.getLayer('live-stroke-layer')) {
      map.setPaintProperty('live-stroke-layer', 'line-color', strokeColor);
      map.setPaintProperty('live-stroke-layer', 'line-width', widthMap[strokeWidth] || 4);
    }

    if (map.getLayer('live-shape-line')) {
      map.setPaintProperty('live-shape-line', 'line-color', strokeColor);
      map.setPaintProperty('live-shape-line', 'line-width', widthMap[strokeWidth] || 4);
    }
  }, [strokeColor, strokeWidth]);

  // Helper to fit drawing bounds
  const fitDrawingBounds = () => {
    if (mapRef.current && drawingBoundsRef.current) {
      mapRef.current.fitBounds(drawingBoundsRef.current, { padding: 50 });
    }
  };

  // Helper to get signed URL for PDF
  const getPdfSignedUrl = async (storagePath) => {
    const { data, error } = await supabase.storage
      .from('project-drawings')
      .createSignedUrl(storagePath, 3600);

    if (error) {
      throw new Error(`Failed to get PDF signed URL: ${error.message}`);
    }

    return data.signedUrl;
  };

  // Helper to render PDF to data URL
  const renderPdfToDataUrl = async (pdfUrl) => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const scale = 2; // 2x for quality
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: viewport.width / scale,
      height: viewport.height / scale,
    };
  };

  // Helper to load image dimensions
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = url;
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !hasAccessToken) return;

    // Initialize Mapbox with empty style
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        name: 'empty',
        sources: {},
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#1a1a1a' },
          },
        ],
      },
      center: [0, 0],
      zoom: 0,
      scrollZoom: true,
      dragPan: true,
      touchZoomRotate: true,
    });

    mapRef.current = map;

    // Expose fitDrawingBounds for toolbar
    map.fitDrawingBounds = fitDrawingBounds;
    onMapReady?.(map);

    // Track zoom changes
    map.on('zoom', () => {
      const zoom = map.getZoom();
      // Convert zoom level to approximate percentage
      const percentage = Math.pow(2, zoom) * 100;
      onZoomChange?.(percentage);
    });

    // Handle map clicks for pin, text, measure, and eraser tools
    map.on('click', (e) => {
      const tool = activeToolRef.current;

      // Check eraser on line annotations first
      if (tool === 'eraser') {
        const style = map.getStyle();
        if (style?.layers) {
          const features = map.queryRenderedFeatures(e.point, {
            layers: style.layers
              .filter(l => l.id.startsWith('freehand-') || l.id.startsWith('shape-') || l.id.startsWith('measure-'))
              .map(l => l.id)
          });
          if (features.length > 0) {
            const layerId = features[0].layer.id;
            const annotationId = layerId.replace(/^(freehand-|shape-|measure-)/, '');
            onEraserDeleteRef.current?.(annotationId);
            return; // Don't proceed to other click handlers
          }
        }
      }

      if ((tool === 'pin' || tool === 'text' || tool === 'measure') && onCanvasClickRef.current) {
        onCanvasClickRef.current(e.lngLat);
      }
    });

    // Freehand drawing - mousedown
    map.on('mousedown', (e) => {
      if (activeToolRef.current === 'freehand') {
        isDrawingRef.current = true;
        currentStrokeRef.current = [[e.lngLat.lng, e.lngLat.lat]];

        // Add live line source and layer if not present
        if (!map.getSource('live-stroke')) {
          map.addSource('live-stroke', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } },
          });
          map.addLayer({
            id: 'live-stroke-layer',
            type: 'line',
            source: 'live-stroke',
            paint: {
              'line-color': strokeColorRef.current,
              'line-width':
                strokeWidthRef.current === 'thin' ? 2 : strokeWidthRef.current === 'thick' ? 6 : 4,
              'line-opacity': 0.8,
              'line-cap': 'round',
              'line-join': 'round',
            },
          });
        }
      } else if (activeToolRef.current === 'shape') {
        isDrawingRef.current = true;
        shapeStartRef.current = [e.lngLat.lng, e.lngLat.lat];

        // Add live shape source if not present
        if (!map.getSource('live-shape')) {
          map.addSource('live-shape', {
            type: 'geojson',
            data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [[]] } },
          });
          // Line layer (for all shape types - outlines only, no fill)
          map.addLayer({
            id: 'live-shape-line',
            type: 'line',
            source: 'live-shape',
            paint: {
              'line-color': strokeColorRef.current,
              'line-width':
                strokeWidthRef.current === 'thin' ? 2 : strokeWidthRef.current === 'thick' ? 6 : 4,
              'line-opacity': 0.8,
              'line-cap': 'round',
              'line-join': 'round',
            },
          });
        }
      }
    });

    // Freehand drawing - mousemove
    map.on('mousemove', (e) => {
      if (!isDrawingRef.current) return;

      if (activeToolRef.current === 'freehand') {
        const coords = currentStrokeRef.current;
        coords.push([e.lngLat.lng, e.lngLat.lat]);

        // Update live stroke
        const source = map.getSource('live-stroke');
        if (source) {
          source.setData({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
          });
        }
      } else if (activeToolRef.current === 'shape') {
        const start = shapeStartRef.current;
        const end = [e.lngLat.lng, e.lngLat.lat];
        const shapeGeometry = computeShapeGeometry(shapeTypeRef.current, start, end);

        const source = map.getSource('live-shape');
        if (source) {
          source.setData({ type: 'Feature', geometry: shapeGeometry });
        }
      }
    });

    // Freehand drawing - mouseup
    map.on('mouseup', (e) => {
      if (!isDrawingRef.current) return;
      isDrawingRef.current = false;

      if (activeToolRef.current === 'freehand') {
        const coords = currentStrokeRef.current;
        if (coords.length >= 2) {
          onFreehandCompleteRef.current?.(coords);
        }

        // Clear live stroke
        currentStrokeRef.current = [];
        const source = map.getSource('live-stroke');
        if (source) {
          source.setData({
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [] },
          });
        }
      } else if (activeToolRef.current === 'shape') {
        const start = shapeStartRef.current;
        const end = [e.lngLat.lng, e.lngLat.lat];

        // Only save if dragged a meaningful distance
        const dist = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));
        if (dist > 0.5) {
          const geometry = computeShapeGeometry(shapeTypeRef.current, start, end);
          onShapeCompleteRef.current?.(geometry);
        }

        // Clear live shape
        const source = map.getSource('live-shape');
        if (source) {
          source.setData({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [[]] } });
        }
      }
    });

    // Load drawing after map is ready
    map.on('load', async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        let imageUrl, width, height;

        // Handle image vs PDF
        if (drawing.mime_type?.startsWith('image/')) {
          // Use signed_url from API hook
          if (!drawing.signed_url) {
            throw new Error('Image signed URL not available');
          }
          const imageData = await loadImage(drawing.signed_url);
          imageUrl = imageData.url;
          width = imageData.width;
          height = imageData.height;
        } else if (drawing.mime_type === 'application/pdf') {
          // Generate signed URL and render PDF
          const pdfUrl = await getPdfSignedUrl(drawing.storage_path);
          const pdfData = await renderPdfToDataUrl(pdfUrl);
          imageUrl = pdfData.dataUrl;
          width = pdfData.width;
          height = pdfData.height;
        } else {
          throw new Error('Unsupported file type');
        }

        // Normalize dimensions to fit within valid Mapbox geographic bounds
        // Latitude must be -90 to 90, longitude -180 to 180
        const maxDim = Math.max(width, height);
        const scale = 80 / maxDim; // Map largest dimension to 80 degrees
        const nw = width * scale;
        const nh = height * scale;

        // Add image source to Mapbox
        // Use normalized coordinates - top-left is [0, nh], bottom-right is [nw, 0]
        map.addSource('drawing', {
          type: 'image',
          url: imageUrl,
          coordinates: [
            [0, nh],   // top-left
            [nw, nh],  // top-right
            [nw, 0],   // bottom-right
            [0, 0],    // bottom-left
          ],
        });

        // Add raster layer
        map.addLayer({
          id: 'drawing-layer',
          type: 'raster',
          source: 'drawing',
          paint: {
            'raster-fade-duration': 0,
          },
        });

        // Save bounds for fit-to-view
        drawingBoundsRef.current = [
          [0, 0],
          [nw, nh],
        ];

        // Fit to drawing
        map.fitBounds(drawingBoundsRef.current, { padding: 50 });

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load drawing:', error);
        setLoadError(error.message);
        setIsLoading(false);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [drawing, hasAccessToken, onZoomChange, onMapReady]);

  // Render pin markers from annotations
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !annotations || isLoading) return;

    // Clean up old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter and render pin annotations
    const pinAnnotations = annotations.filter((a) => a.type === 'pin');

    pinAnnotations.forEach((annotation) => {
      const el = document.createElement('div');
      const isSelected = annotation.id === selectedAnnotationId;
      let wasDragged = false;

      // Style the pin marker
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = annotation.properties?.color || '#FF5252';
      el.style.border = isSelected
        ? '3px solid rgba(255,255,255,0.6)'
        : '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.transition = 'box-shadow 0.2s';

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.3)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      });

      // Add click handler - skip if marker was just dragged
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wasDragged) {
          wasDragged = false;
          return;
        }
        if (onPinClick) {
          onPinClick(annotation, { x: e.clientX, y: e.clientY });
        }
      });

      // Create draggable marker
      const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat(annotation.geometry.coordinates)
        .addTo(map);

      // Track drag to distinguish from click
      marker.on('dragstart', () => {
        wasDragged = true;
      });

      marker.on('dragend', () => {
        const newLngLat = marker.getLngLat();
        onMarkerDragEndRef.current?.(annotation.id, newLngLat);
      });

      markersRef.current.push(marker);
    });

    // Cleanup on unmount
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [annotations, isLoading, selectedAnnotationId, onPinClick]);

  // Render text markers from annotations
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !annotations || isLoading) return;

    // Clean up old text markers
    textMarkersRef.current.forEach((marker) => marker.remove());
    textMarkersRef.current = [];

    // Filter and render text annotations
    const textAnnotations = annotations.filter((a) => a.type === 'text');

    textAnnotations.forEach((annotation) => {
      const el = document.createElement('div');
      const isSelected = annotation.id === selectedAnnotationId;
      let wasDragged = false;

      // Get font size
      const fontSizeMap = {
        small: '12px',
        medium: '16px',
        large: '20px',
      };
      const fontSize = fontSizeMap[annotation.properties?.fontSize] || '16px';

      // Style the text label
      el.textContent = annotation.properties?.content || 'Text';
      el.style.color = annotation.properties?.color || '#FFFFFF';
      el.style.fontSize = fontSize;
      el.style.fontWeight = '600';
      el.style.textShadow = '0 1px 3px rgba(0,0,0,0.8)';
      el.style.cursor = 'pointer';
      el.style.whiteSpace = 'nowrap';
      el.style.padding = '2px 6px';
      el.style.borderRadius = '4px';
      el.style.backgroundColor = 'rgba(0,0,0,0.4)';
      el.style.border = isSelected
        ? '2px solid rgba(255,255,255,0.6)'
        : '1px solid rgba(255,255,255,0.2)';
      el.style.transition = 'background-color 0.2s, box-shadow 0.2s';

      // Add hover effect
      el.addEventListener('mouseenter', () => {
        el.style.backgroundColor = 'rgba(0,0,0,0.6)';
        el.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.3)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.backgroundColor = 'rgba(0,0,0,0.4)';
        el.style.boxShadow = 'none';
      });

      // Add click handler - skip if marker was just dragged
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        if (wasDragged) {
          wasDragged = false;
          return;
        }
        if (onTextClick) {
          onTextClick(annotation, { x: e.clientX, y: e.clientY });
        }
      });

      // Create draggable marker
      const marker = new mapboxgl.Marker({ element: el, draggable: true })
        .setLngLat(annotation.geometry.coordinates)
        .addTo(map);

      // Track drag to distinguish from click
      marker.on('dragstart', () => {
        wasDragged = true;
      });

      marker.on('dragend', () => {
        const newLngLat = marker.getLngLat();
        onMarkerDragEndRef.current?.(annotation.id, newLngLat);
      });

      textMarkersRef.current.push(marker);
    });

    // Cleanup on unmount
    return () => {
      textMarkersRef.current.forEach((marker) => marker.remove());
      textMarkersRef.current = [];
    };
  }, [annotations, isLoading, selectedAnnotationId, onTextClick]);

  // Render calibration points
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !calibrationMode) {
      // Clean up when not in calibration mode
      calibrationMarkersRef.current.forEach((m) => m.remove());
      calibrationMarkersRef.current = [];
      if (map) {
        if (map.getLayer('calibration-line')) map.removeLayer('calibration-line');
        if (map.getSource('calibration-line')) map.removeSource('calibration-line');
      }
      return;
    }

    // Clean up old calibration markers
    calibrationMarkersRef.current.forEach((m) => m.remove());
    calibrationMarkersRef.current = [];

    // Clean up calibration line
    if (map.getLayer('calibration-line')) map.removeLayer('calibration-line');
    if (map.getSource('calibration-line')) map.removeSource('calibration-line');

    if (!calibrationPoints) return;

    // Red dot for pointA
    if (calibrationPoints.pointA) {
      const el = document.createElement('div');
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#FF0000';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(calibrationPoints.pointA)
        .addTo(map);
      calibrationMarkersRef.current.push(marker);
    }

    // Red dot for pointB + dashed line
    if (calibrationPoints.pointB) {
      const el = document.createElement('div');
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#FF0000';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.5)';
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(calibrationPoints.pointB)
        .addTo(map);
      calibrationMarkersRef.current.push(marker);

      // Dashed line between points
      map.addSource('calibration-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [calibrationPoints.pointA, calibrationPoints.pointB],
          },
        },
      });
      map.addLayer({
        id: 'calibration-line',
        type: 'line',
        source: 'calibration-line',
        paint: {
          'line-color': '#FF0000',
          'line-width': 2,
          'line-dasharray': [4, 4],
        },
      });
    }

    return () => {
      if (!mapRef.current) return;
      calibrationMarkersRef.current.forEach((m) => m.remove());
      calibrationMarkersRef.current = [];
      if (map.getLayer('calibration-line')) map.removeLayer('calibration-line');
      if (map.getSource('calibration-line')) map.removeSource('calibration-line');
    };
  }, [calibrationPoints, calibrationMode]);

  // Render freehand annotations as GeoJSON layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !annotations || isLoading) return;

    const freehandAnnotations = annotations.filter((a) => a.type === 'freehand');

    // Clean up all existing freehand layers and sources
    const style = map.getStyle();
    if (style?.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith('freehand-') && layer.id !== 'freehand-drawing') {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
          if (map.getSource(layer.id)) {
            map.removeSource(layer.id);
          }
        }
      });
    }

    // Add each freehand annotation as its own source+layer
    freehandAnnotations.forEach((annotation) => {
      const id = `freehand-${annotation.id}`;
      const widthMap = { thin: 2, medium: 4, thick: 6 };
      const width = widthMap[annotation.properties?.strokeWidth] || 4;

      // Skip if already exists
      if (map.getSource(id)) {
        return;
      }

      map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: annotation.geometry,
        },
      });

      map.addLayer({
        id: id,
        type: 'line',
        source: id,
        paint: {
          'line-color': annotation.properties?.color || '#FF5252',
          'line-width': width,
          'line-opacity': 0.9,
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    });

    // Cleanup on unmount
    return () => {
      if (!mapRef.current) return;
      freehandAnnotations.forEach((annotation) => {
        const id = `freehand-${annotation.id}`;
        if (map.getLayer(id)) {
          map.removeLayer(id);
        }
        if (map.getSource(id)) {
          map.removeSource(id);
        }
      });
    };
  }, [annotations, isLoading]);

  // Render shape annotations as GeoJSON layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !annotations || isLoading) return;

    const shapeAnnotations = annotations.filter((a) => a.type === 'shape');

    // Clean up all existing shape layers and sources
    const style = map.getStyle();
    if (style?.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith('shape-')) {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
          if (map.getSource(layer.id)) {
            map.removeSource(layer.id);
          }
        }
      });
    }

    // Add each shape annotation as its own source+layer
    shapeAnnotations.forEach((annotation) => {
      const id = `shape-${annotation.id}`;
      const widthMap = { thin: 2, medium: 4, thick: 6 };
      const width = widthMap[annotation.properties?.strokeWidth] || 4;

      // Skip if already exists
      if (map.getSource(id)) {
        return;
      }

      map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: annotation.geometry,
        },
      });

      map.addLayer({
        id: id,
        type: 'line',
        source: id,
        paint: {
          'line-color': annotation.properties?.color || '#FF5252',
          'line-width': width,
          'line-opacity': 0.9,
          'line-cap': 'round',
          'line-join': 'round',
        },
      });
    });

    // Cleanup on unmount
    return () => {
      if (!mapRef.current) return;
      shapeAnnotations.forEach((annotation) => {
        const id = `shape-${annotation.id}`;
        if (map.getLayer(id)) {
          map.removeLayer(id);
        }
        if (map.getSource(id)) {
          map.removeSource(id);
        }
      });
    };
  }, [annotations, isLoading]);

  // Render measurement annotations
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !annotations || isLoading) return;

    const measureAnnotations = annotations.filter((a) => a.type === 'measurement');

    // Clean up old measurement layers
    const style = map.getStyle();
    if (style?.layers) {
      style.layers.forEach((layer) => {
        if (layer.id.startsWith('measure-')) {
          if (map.getLayer(layer.id)) map.removeLayer(layer.id);
          if (map.getSource(layer.id)) map.removeSource(layer.id);
        }
      });
    }

    // Clean up old measurement label markers
    measureMarkersRef.current.forEach((m) => m.remove());
    measureMarkersRef.current = [];

    measureAnnotations.forEach((annotation) => {
      const id = `measure-${annotation.id}`;
      const coords = annotation.geometry.coordinates;

      // Dashed line
      map.addSource(id, {
        type: 'geojson',
        data: { type: 'Feature', geometry: annotation.geometry },
      });
      map.addLayer({
        id: id,
        type: 'line',
        source: id,
        paint: {
          'line-color': annotation.properties?.color || '#FFEB3B',
          'line-width': 2,
          'line-dasharray': [6, 3],
        },
      });

      // Label at midpoint
      if (coords.length >= 2) {
        const midX = (coords[0][0] + coords[1][0]) / 2;
        const midY = (coords[0][1] + coords[1][1]) / 2;

        const el = document.createElement('div');
        el.textContent = annotation.properties?.distanceLabel || '';
        el.style.color = '#FFEB3B';
        el.style.fontSize = '13px';
        el.style.fontWeight = '700';
        el.style.backgroundColor = 'rgba(0,0,0,0.7)';
        el.style.padding = '2px 8px';
        el.style.borderRadius = '4px';
        el.style.whiteSpace = 'nowrap';
        el.style.border = '1px solid rgba(255,235,59,0.5)';

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([midX, midY])
          .addTo(map);
        measureMarkersRef.current.push(marker);
      }
    });

    return () => {
      if (!mapRef.current) return;
      measureAnnotations.forEach((a) => {
        const id = `measure-${a.id}`;
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      });
      measureMarkersRef.current.forEach((m) => m.remove());
      measureMarkersRef.current = [];
    };
  }, [annotations, isLoading]);

  if (!hasAccessToken) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          Mapbox access token is missing. Please add NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN to your
          environment variables.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
      {/* Map container */}
      <Box
        ref={mapContainerRef}
        sx={{
          width: '100%',
          height: '100%',
          cursor:
            activeTool === 'eraser'
              ? 'not-allowed'
              : activeTool === 'pin'
                ? 'crosshair'
                : activeTool === 'text'
                  ? 'text'
                  : activeTool === 'freehand'
                    ? 'crosshair'
                    : activeTool === 'shape'
                      ? 'crosshair'
                      : activeTool === 'measure'
                        ? 'crosshair'
                        : 'default',
        }}
      />

      {/* Loading overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(26,26,26,0.9)',
            zIndex: 10,
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress sx={{ color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Loading drawing...
            </Typography>
          </Stack>
        </Box>
      )}

      {/* Error overlay */}
      {loadError && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(26,26,26,0.9)',
            zIndex: 10,
          }}
        >
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 400, p: 3 }}>
            <Alert severity="error" sx={{ width: '100%' }}>
              {loadError}
            </Alert>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Stack>
        </Box>
      )}

      {/* Zoom controls */}
      <ButtonGroup
        orientation="vertical"
        aria-label="Zoom controls"
        variant="contained"
        sx={{
          position: 'absolute',
          left: 24,
          bottom: 24,
          boxShadow: 3,
          bgcolor: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          '& .MuiButton-root': {
            minWidth: 40,
            minHeight: 40,
            bgcolor: 'white',
            color: 'text.primary',
            border: 'none',
            '&:hover': {
              bgcolor: 'grey.100',
            },
          },
        }}
      >
        <Button onClick={() => mapRef.current?.zoomIn()} aria-label="zoom in">
          <IconifyIcon icon="material-symbols:zoom-in-rounded" fontSize={20} />
        </Button>
        <Button onClick={() => mapRef.current?.zoomOut()} aria-label="zoom out">
          <IconifyIcon icon="material-symbols:zoom-out-rounded" fontSize={20} />
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default SiteBoxCanvas;
