'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useProjectDrawings } from 'services/swr/api-hooks/useProjectDrawingsApi';
import {
  useDrawingAnnotations,
  useCreateAnnotation,
  useUpdateAnnotation,
  useDeleteAnnotation,
  useDrawingCalibration,
  useUpdateCalibration,
} from 'services/swr/api-hooks/useDrawingAnnotationsApi';
import { supabase } from 'lib/supabase/client';
import SiteBoxToolbar from './SiteBoxToolbar';
import SiteBoxCanvas from './SiteBoxCanvas';
import PinPopover from './PinPopover';
import TextEditor from './TextEditor';
import StrokeOptions from './StrokeOptions';
import CalibrationDialog from './CalibrationDialog';
import MarkerRadialMenu from './MarkerRadialMenu';
import DeleteMarkerDialog from './DeleteMarkerDialog';
import MarkerInfoPopover from './MarkerInfoPopover';
import MarkerDetailDrawer from './MarkerDetailDrawer';
import DEVICE_TYPES from './deviceTypes';

const SiteBox = ({ projectId, drawingId }) => {
  const router = useRouter();
  const { data: drawings, isLoading, error } = useProjectDrawings(projectId);
  const { data: annotations = [], mutate: mutateAnnotations } = useDrawingAnnotations(drawingId);
  const { trigger: createAnnotation, isMutating: isCreating } = useCreateAnnotation(drawingId);
  const { trigger: updateAnnotation, isMutating: isUpdating } = useUpdateAnnotation(drawingId);
  const { trigger: deleteAnnotation, isMutating: isDeleting } = useDeleteAnnotation(drawingId);
  const { data: calibrationData } = useDrawingCalibration(drawingId);
  const { trigger: updateCalibration } = useUpdateCalibration(drawingId);

  const [activeTool, setActiveTool] = useState('select');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [pendingPin, setPendingPin] = useState(null);
  const [pendingText, setPendingText] = useState(null);
  const [textEditorPosition, setTextEditorPosition] = useState(null);
  const [strokeColor, setStrokeColor] = useState('#FF5252');
  const [strokeWidth, setStrokeWidth] = useState('medium');
  const [shapeType, setShapeType] = useState('rectangle');
  const [deviceType, setDeviceType] = useState('camera');
  const [calibrationMode, setCalibrationMode] = useState(false);
  const [calibrationPoints, setCalibrationPoints] = useState({ pointA: null, pointB: null });
  const [measurePoints, setMeasurePoints] = useState({ pointA: null, pointB: null });
  const [calibrationDialogOpen, setCalibrationDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAnnotation_, setDeleteAnnotation_] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const radialMenuRef = useRef(null);
  const [infoPopoverOpen, setInfoPopoverOpen] = useState(false);
  const [infoAnnotation, setInfoAnnotation] = useState(null);
  const [infoPosition, setInfoPosition] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAnnotation, setDrawerAnnotation] = useState(null);

  // Compute save status from mutation state
  const saveStatus = (isCreating || isUpdating || isDeleting) ? 'saving' : 'saved';

  const drawing = useMemo(() => {
    if (!drawings) return null;
    return drawings.find((d) => d.id === drawingId);
  }, [drawings, drawingId]);

  const handleBack = () => {
    router.push(`/apps/projects/boards/${projectId}`);
  };

  const handleFitToView = () => {
    if (mapInstance) {
      // Will be implemented in the canvas component
      mapInstance.fitDrawingBounds?.();
    }
  };

  // Record action for undo/redo
  const recordAction = (action) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]); // Clear redo on new action
  };

  // Undo handler
  const handleUndo = async () => {
    if (undoStack.length === 0) return;
    const action = undoStack[undoStack.length - 1];

    try {
      if (action.action === 'create') {
        // Undo create = delete the annotation
        await deleteAnnotation({ annotationId: action.annotationId });
        setRedoStack(prev => [...prev, action]);
      } else if (action.action === 'delete') {
        // Undo delete = re-create the annotation
        await createAnnotation({
          type: action.annotationData.type,
          geometry: action.annotationData.geometry,
          properties: action.annotationData.properties,
        });
        setRedoStack(prev => [...prev, action]);
      }

      setUndoStack(prev => prev.slice(0, -1));
    } catch (error) {
      console.error('Failed to undo:', error);
    }
  };

  // Redo handler
  const handleRedo = async () => {
    if (redoStack.length === 0) return;
    const action = redoStack[redoStack.length - 1];

    try {
      if (action.action === 'create') {
        // Redo create = re-create the annotation
        await createAnnotation({
          type: action.annotationData.type,
          geometry: action.annotationData.geometry,
          properties: action.annotationData.properties,
        });
        setUndoStack(prev => [...prev, action]);
      } else if (action.action === 'delete') {
        // Redo delete = delete the annotation again
        await deleteAnnotation({ annotationId: action.annotationData.id });
        setUndoStack(prev => [...prev, action]);
      }

      setRedoStack(prev => prev.slice(0, -1));
    } catch (error) {
      console.error('Failed to redo:', error);
    }
  };

  // Handle tool changes with calibration check for measure tool
  const handleToolChange = (tool) => {
    if (tool === 'measure' && !calibrationData?.calibration) {
      setCalibrationMode(true);
      setCalibrationDialogOpen(true);
    }
    setActiveTool(tool);
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        radialMenuRef.current?.hide();
        setActiveTool('select');
        handlePopoverClose();
        handleTextEditorClose();
        setCalibrationMode(false);
        setCalibrationDialogOpen(false);
        setCalibrationPoints({ pointA: null, pointB: null });
        setMeasurePoints({ pointA: null, pointB: null });
      }

      // Ctrl+Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Ctrl+Shift+Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack]);

  // Handle canvas click when pin, text, measure, or calibration mode is active
  const handleCanvasClick = (lngLat) => {
    if (calibrationMode) {
      // Calibration click handling
      if (!calibrationPoints.pointA) {
        setCalibrationPoints({ pointA: [lngLat.lng, lngLat.lat], pointB: null });
      } else if (!calibrationPoints.pointB) {
        setCalibrationPoints((prev) => ({ ...prev, pointB: [lngLat.lng, lngLat.lat] }));
        setCalibrationDialogOpen(true); // Show input form
      }
    } else if (activeTool === 'measure') {
      // Measurement click handling
      if (!measurePoints.pointA) {
        setMeasurePoints({ pointA: [lngLat.lng, lngLat.lat], pointB: null });
      } else if (!measurePoints.pointB) {
        const pointB = [lngLat.lng, lngLat.lat];
        setMeasurePoints((prev) => ({ ...prev, pointB }));
        handleMeasurementComplete(measurePoints.pointA, pointB);
      }
    } else if (activeTool === 'pin') {
      // Create pending pin at clicked location
      const newPin = {
        geometry: {
          type: 'Point',
          coordinates: [lngLat.lng, lngLat.lat],
        },
      };
      setPendingPin(newPin);
      setSelectedAnnotation(null);
      // Position popover near the click (offset a bit for visibility)
      setPopoverPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    } else if (activeTool === 'text') {
      // Create pending text at clicked location
      const newText = {
        geometry: {
          type: 'Point',
          coordinates: [lngLat.lng, lngLat.lat],
        },
      };
      setPendingText(newText);
      setSelectedAnnotation(null);
      // Position text editor near the click
      setTextEditorPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    } else if (activeTool === 'device') {
      const deviceConfig = DEVICE_TYPES[deviceType];
      const newPin = {
        geometry: {
          type: 'Point',
          coordinates: [lngLat.lng, lngLat.lat],
        },
        _deviceType: deviceType,
        _deviceColor: deviceConfig?.color || '#3B82F6',
      };
      setPendingPin(newPin);
      setSelectedAnnotation(null);
      setPopoverPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
  };

  // Handle clicking an existing pin
  const handlePinClick = async (annotation, screenPosition) => {
    // Eraser mode: delete immediately
    if (activeTool === 'eraser') {
      try {
        await deleteAnnotation({ annotationId: annotation.id });
        recordAction({ action: 'delete', annotationData: annotation });
      } catch (error) {
        console.error('Failed to delete pin:', error);
      }
      return;
    }

    // Show radial menu instead of PinPopover
    radialMenuRef.current?.show(screenPosition.x, screenPosition.y, annotation);
  };

  // Handle clicking an existing text annotation
  const handleTextClick = async (annotation, screenPosition) => {
    // Eraser mode: delete immediately
    if (activeTool === 'eraser') {
      try {
        await deleteAnnotation({ annotationId: annotation.id });
        recordAction({ action: 'delete', annotationData: annotation });
      } catch (error) {
        console.error('Failed to delete text:', error);
      }
      return;
    }

    setSelectedAnnotation(annotation);
    setPendingText(null);
    setTextEditorPosition(screenPosition);
  };

  // Handle marker drag end
  const handleMarkerDragEnd = async (annotationId, newLngLat) => {
    try {
      await updateAnnotation({
        annotationId,
        geometry: { type: 'Point', coordinates: [newLngLat.lng, newLngLat.lat] },
      });
    } catch (error) {
      console.error('Failed to move annotation:', error);
    }
  };

  // Handle saving pin (create or update)
  const handlePinSave = async ({ title, color }) => {
    try {
      if (pendingPin) {
        // Create new pin or device
        const isDevice = pendingPin._deviceType;
        const result = await createAnnotation({
          type: isDevice ? 'device' : 'pin',
          geometry: pendingPin.geometry,
          properties: isDevice
            ? { title, color: pendingPin._deviceColor, deviceType: pendingPin._deviceType }
            : { title, color },
        });
        recordAction({ action: 'create', annotationId: result.id, annotationData: result });
      } else if (selectedAnnotation) {
        // Update existing pin
        await updateAnnotation({
          annotationId: selectedAnnotation.id,
          properties: { title, color },
        });
      }
      handlePopoverClose();
    } catch (error) {
      console.error('Failed to save pin:', error);
    }
  };

  // Handle deleting a pin
  const handlePinDelete = async () => {
    if (selectedAnnotation) {
      try {
        const annotationData = selectedAnnotation;
        await deleteAnnotation({ annotationId: selectedAnnotation.id });
        recordAction({ action: 'delete', annotationData });
        handlePopoverClose();
      } catch (error) {
        console.error('Failed to delete pin:', error);
      }
    }
  };

  // Close popover and clear state
  const handlePopoverClose = () => {
    setPopoverPosition(null);
    setSelectedAnnotation(null);
    setPendingPin(null);
  };

  // Handle saving text (create or update)
  const handleTextSave = async ({ content, color, fontSize }) => {
    try {
      if (pendingText) {
        // Create new text annotation
        const result = await createAnnotation({
          type: 'text',
          geometry: pendingText.geometry,
          properties: { content, color, fontSize },
        });
        recordAction({ action: 'create', annotationId: result.id, annotationData: result });
      } else if (selectedAnnotation) {
        // Update existing text annotation
        await updateAnnotation({
          annotationId: selectedAnnotation.id,
          properties: { content, color, fontSize },
        });
      }
      handleTextEditorClose();
    } catch (error) {
      console.error('Failed to save text:', error);
    }
  };

  // Handle deleting a text annotation
  const handleTextDelete = async () => {
    if (selectedAnnotation) {
      try {
        const annotationData = selectedAnnotation;
        await deleteAnnotation({ annotationId: selectedAnnotation.id });
        recordAction({ action: 'delete', annotationData });
        handleTextEditorClose();
      } catch (error) {
        console.error('Failed to delete text:', error);
      }
    }
  };

  // Close text editor and clear state
  const handleTextEditorClose = () => {
    setTextEditorPosition(null);
    setSelectedAnnotation(null);
    setPendingText(null);
  };

  // Handle freehand stroke completion
  const handleFreehandComplete = async (coordinates) => {
    try {
      const result = await createAnnotation({
        type: 'freehand',
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {
          color: strokeColor,
          strokeWidth,
        },
      });
      recordAction({ action: 'create', annotationId: result.id, annotationData: result });
    } catch (error) {
      console.error('Failed to save freehand stroke:', error);
    }
  };

  // Handle shape completion
  const handleShapeComplete = async (geometry) => {
    try {
      const result = await createAnnotation({
        type: 'shape',
        geometry,
        properties: {
          shapeType,
          color: strokeColor,
          strokeWidth,
        },
      });
      recordAction({ action: 'create', annotationId: result.id, annotationData: result });
    } catch (error) {
      console.error('Failed to save shape:', error);
    }
  };

  // Handle calibration save
  const handleCalibrationSave = async ({ distance, unit }) => {
    const [ax, ay] = calibrationPoints.pointA;
    const [bx, by] = calibrationPoints.pointB;
    const pixelDistance = Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
    const pixelsPerUnit = pixelDistance / distance;

    try {
      await updateCalibration({
        calibration: {
          point_a: calibrationPoints.pointA,
          point_b: calibrationPoints.pointB,
          distance,
          unit,
          pixels_per_unit: pixelsPerUnit,
        },
      });
      setCalibrationDialogOpen(false);
      setCalibrationMode(false);
      setCalibrationPoints({ pointA: null, pointB: null });
    } catch (error) {
      console.error('Failed to save calibration:', error);
    }
  };

  // Handle measurement completion
  const handleMeasurementComplete = async (pointA, pointB) => {
    const calibration = calibrationData?.calibration;
    if (!calibration) return;

    const pixelDist = Math.sqrt(
      Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2)
    );
    const realDist = pixelDist / calibration.pixels_per_unit;
    const label = `${realDist.toFixed(1)} ${calibration.unit}`;

    try {
      const result = await createAnnotation({
        type: 'measurement',
        geometry: { type: 'LineString', coordinates: [pointA, pointB] },
        properties: { distanceLabel: label, color: '#FFEB3B' },
      });
      recordAction({ action: 'create', annotationId: result.id, annotationData: result });
      setMeasurePoints({ pointA: null, pointB: null });
    } catch (error) {
      console.error('Failed to save measurement:', error);
    }
  };

  // Handle eraser delete for line-based annotations (called from canvas)
  const handleEraserDelete = async (annotationId) => {
    const annotation = annotations.find(a => a.id === annotationId);
    if (annotation) {
      try {
        await deleteAnnotation({ annotationId });
        recordAction({ action: 'delete', annotationData: annotation });
      } catch (error) {
        console.error('Failed to delete annotation:', error);
      }
    }
  };

  // Handle calibration reset
  const handleCalibrationReset = () => {
    setCalibrationPoints({ pointA: null, pointB: null });
  };

  // Handle calibration dialog close
  const handleCalibrationClose = () => {
    setCalibrationDialogOpen(false);
    if (!calibrationData?.calibration) {
      setCalibrationMode(false);
      setActiveTool('select');
    }
    setCalibrationPoints({ pointA: null, pointB: null });
  };

  // Radial menu action handlers
  const handleRadialInfo = () => {
    const annotation = radialMenuRef.current?.getAnnotation();
    if (annotation) {
      // Get the marker's screen position from the map
      const map = mapInstance;
      let pos;
      if (map && annotation.geometry?.coordinates) {
        const point = map.project(annotation.geometry.coordinates);
        pos = { x: point.x, y: point.y };
      } else {
        pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      }
      setInfoAnnotation(annotation);
      setInfoPosition(pos);
      setInfoPopoverOpen(true);
    }
    radialMenuRef.current?.hide();
  };

  const handleRadialView = () => {
    const annotation = radialMenuRef.current?.getAnnotation();
    if (annotation) {
      setDrawerAnnotation(annotation);
      setDrawerOpen(true);
    }
    radialMenuRef.current?.hide();
  };

  const handleRadialDelete = () => {
    const annotation = radialMenuRef.current?.getAnnotation();
    if (annotation) {
      setDeleteAnnotation_(annotation);
      setDeleteDialogOpen(true);
    }
    radialMenuRef.current?.hide();
  };

  const handleDeleteConfirm = async () => {
    if (deleteAnnotation_) {
      try {
        await deleteAnnotation({ annotationId: deleteAnnotation_.id });
        recordAction({ action: 'delete', annotationData: deleteAnnotation_ });
      } catch (error) {
        console.error('Failed to delete annotation:', error);
      }
    }
    setDeleteDialogOpen(false);
    setDeleteAnnotation_(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteAnnotation_(null);
  };

  const handleInfoPopoverClose = () => {
    setInfoPopoverOpen(false);
    setInfoAnnotation(null);
    setInfoPosition(null);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerAnnotation(null);
  };

  const handleDrawerEdit = (annotation) => {
    // Open PinPopover for editing
    setSelectedAnnotation(annotation);
    setPopoverPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          bgcolor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error || !drawing) {
    return (
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          bgcolor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 400, p: 3 }}>
          <Alert severity="error" sx={{ width: '100%' }}>
            {error ? error.message : 'Drawing not found'}
          </Alert>
          <Button variant="contained" onClick={handleBack}>
            Back to Project
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1300,
        bgcolor: '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <SiteBoxToolbar
        drawing={drawing}
        activeTool={activeTool}
        onToolChange={handleToolChange}
        onBack={handleBack}
        zoomLevel={zoomLevel}
        onFitToView={handleFitToView}
        shapeType={shapeType}
        onShapeTypeChange={setShapeType}
        deviceType={deviceType}
        onDeviceTypeChange={setDeviceType}
        isCalibrated={Boolean(calibrationData?.calibration)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        saveStatus={saveStatus}
      />

      <StrokeOptions
        open={activeTool === 'freehand' || activeTool === 'shape'}
        color={strokeColor}
        strokeWidth={strokeWidth}
        onColorChange={setStrokeColor}
        onStrokeWidthChange={setStrokeWidth}
      />

      <SiteBoxCanvas
        drawing={drawing}
        projectId={projectId}
        onZoomChange={setZoomLevel}
        onMapReady={setMapInstance}
        activeTool={activeTool}
        annotations={annotations}
        onCanvasClick={handleCanvasClick}
        onPinClick={handlePinClick}
        onTextClick={handleTextClick}
        selectedAnnotationId={selectedAnnotation?.id}
        onFreehandComplete={handleFreehandComplete}
        onShapeComplete={handleShapeComplete}
        shapeType={shapeType}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        calibrationMode={calibrationMode}
        calibrationPoints={calibrationPoints}
        measurePoints={measurePoints}
        onEraserDelete={handleEraserDelete}
        onMarkerDragEnd={handleMarkerDragEnd}
        deviceType={deviceType}
      />

      {/* Radial Menu for Pin Markers */}
      <MarkerRadialMenu
        ref={radialMenuRef}
        onInfo={handleRadialInfo}
        onView={handleRadialView}
        onDelete={handleRadialDelete}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteMarkerDialog
        open={deleteDialogOpen}
        annotation={deleteAnnotation_}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Marker Info Popover */}
      <MarkerInfoPopover
        open={infoPopoverOpen}
        anchorPosition={infoPosition}
        annotation={infoAnnotation}
        onClose={handleInfoPopoverClose}
      />

      {/* Marker Detail Drawer */}
      <MarkerDetailDrawer
        open={drawerOpen}
        annotation={drawerAnnotation}
        onClose={handleDrawerClose}
        onEdit={handleDrawerEdit}
      />

      {/* Pin Popover */}
      <PinPopover
        open={Boolean(popoverPosition)}
        anchorPosition={popoverPosition}
        annotation={selectedAnnotation}
        onSave={handlePinSave}
        onDelete={handlePinDelete}
        onClose={handlePopoverClose}
      />

      {/* Text Editor */}
      <TextEditor
        open={Boolean(textEditorPosition)}
        anchorPosition={textEditorPosition}
        annotation={selectedAnnotation?.type === 'text' ? selectedAnnotation : null}
        onSave={handleTextSave}
        onDelete={handleTextDelete}
        onClose={handleTextEditorClose}
      />

      {/* Calibration Dialog */}
      <CalibrationDialog
        open={calibrationDialogOpen}
        calibrationPoints={calibrationPoints}
        onSave={handleCalibrationSave}
        onClose={handleCalibrationClose}
        onReset={handleCalibrationReset}
      />
    </Box>
  );
};

export default SiteBox;
