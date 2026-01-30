'use client';

import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useStore } from '@/store/useStore';
import type { DrawingToolType, DrawingPoint, DrawingObject, DrawingLayerType, DrawingStyle } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Fabric.js types — the module is loaded dynamically
type FabricModule = typeof import('fabric');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricCanvas = any;
type FabricObject = import('fabric').FabricObject;

export interface DrawingCanvasHandle {
  addText: (text: string, position?: DrawingPoint, style?: Record<string, unknown>) => void;
  addLabel: (text: string, position: DrawingPoint, style: Record<string, unknown>) => void;
  addDimension: (start: DrawingPoint, end: DrawingPoint, customLabel?: string) => void;
  addMeasurement: (start: DrawingPoint, end: DrawingPoint, measurement: { value: number; unit: string; displayText: string }) => void;
  addImage: (imageData: string) => Promise<void>;
  deleteSelected: () => void;
  exportToImage: () => string | null;
  exportToJSON: () => string | null;
  loadFromJSON: (json: string) => Promise<void>;
  clearCanvas: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  setTool: (tool: DrawingToolType) => void;
  cancelCurrentOperation: () => void;
  getCanvas: () => FabricCanvas | null;
  getScale: () => number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onObjectsChange?: (objects: DrawingObject[]) => void;
  onCursorMove?: (position: { x: number; y: number } | null) => void;
  onStatusChange?: (status: string) => void;
  onDimensionRequest?: (start: DrawingPoint, end: DrawingPoint, distance: number) => void;
  onLabelRequest?: (position: DrawingPoint) => void;
  onZoomChange?: (zoom: number) => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(function DrawingCanvas(
  {
    width = 800,
    height = 600,
    onObjectsChange,
    onCursorMove,
    onStatusChange,
    onDimensionRequest,
    onLabelRequest,
    onZoomChange,
  },
  ref
) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const fabricModuleRef = useRef<FabricModule | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fabricLoaded, setFabricLoaded] = useState(false);

  // Drawing state refs
  const polylinePointsRef = useRef<DrawingPoint[]>([]);
  const currentShapeRef = useRef<FabricObject | null>(null);
  const polylinePreviewRef = useRef<FabricObject | null>(null);
  const dimensionStartRef = useRef<DrawingPoint | null>(null);
  const dimensionPreviewRef = useRef<FabricObject | null>(null);
  const isDrawingRef = useRef(false);
  const startPointRef = useRef<DrawingPoint | null>(null);
  const activeToolRef = useRef<DrawingToolType>('select');
  const isShiftDownRef = useRef(false);

  // Pan state refs
  const isPanningRef = useRef(false);
  const lastPanPointRef = useRef<{ x: number; y: number } | null>(null);

  // Refs to avoid stale closures
  const activeStyleRef = useRef<DrawingStyle>({
    strokeColor: '#000000',
    strokeWidth: 2,
    strokeStyle: 'solid',
    fillColor: 'transparent',
    fillOpacity: 0.3,
  });
  const activeLayerRef = useRef<DrawingLayerType>('proposed_improvements');

  // History refs (canvas JSON snapshots)
  const historyStackRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const isLoadingSnapshotRef = useRef(false);

  const {
    drawingState,
    setActiveTool,
    updateDrawingObjects,
    addToDrawingHistory,
    setSelectedObjects,
    pushCanvasSnapshot,
    getSnapshotForUndo,
    getSnapshotForRedo,
  } = useStore();

  const { activeTool, activeStyle, activeLayer, currentDrawing } = drawingState;

  // Keep refs synced
  useEffect(() => { activeToolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { activeStyleRef.current = activeStyle; }, [activeStyle]);
  useEffect(() => { activeLayerRef.current = activeLayer; }, [activeLayer]);

  // Shift key tracking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') isShiftDownRef.current = true; };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') isShiftDownRef.current = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const updateStatus = useCallback((status: string) => {
    onStatusChange?.(status);
  }, [onStatusChange]);

  // --- Snapshot-based undo/redo ---
  const pushSnapshot = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas || isLoadingSnapshotRef.current) return;
    const json = JSON.stringify(canvas.toJSON(['id', 'isGrid']));
    // Local history
    const stack = historyStackRef.current;
    const idx = historyIndexRef.current;
    // Truncate forward history
    const truncated = stack.slice(0, idx + 1);
    truncated.push(json);
    // Cap at 50
    if (truncated.length > 50) truncated.splice(0, truncated.length - 50);
    historyStackRef.current = truncated;
    historyIndexRef.current = truncated.length - 1;
    // Also push to store
    pushCanvasSnapshot(json);
  }, [pushCanvasSnapshot]);

  const saveObjectToState = useCallback((obj: any) => {
    const layer = activeLayerRef.current;
    const drawingObject = fabricObjectToDrawingObject(obj, layer);
    updateDrawingObjects([drawingObject]);
    addToDrawingHistory({
      timestamp: new Date().toISOString(),
      action: 'add',
      objectIds: [drawingObject.id],
      newState: JSON.stringify(drawingObject),
    });
    pushSnapshot();
  }, [updateDrawingObjects, addToDrawingHistory, pushSnapshot]);

  // --- Load Fabric.js dynamically ---
  useEffect(() => {
    const loadFabric = async () => {
      const mod = await import('fabric');
      fabricModuleRef.current = mod;
      setFabricLoaded(true);
    };
    loadFabric();
  }, []);

  // --- Initialize canvas ---
  useEffect(() => {
    if (!canvasElRef.current || !fabricLoaded) return;
    const fabric = fabricModuleRef.current!;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Selection events
    const handleSelectionChange = (e: any) => {
      const selected = e.selected || [];
      const ids = selected.map((obj: any) => obj.id).filter(Boolean);
      setSelectedObjects(ids);
    };
    canvas.on('selection:created', handleSelectionChange);
    canvas.on('selection:updated', handleSelectionChange);
    canvas.on('selection:cleared', () => setSelectedObjects([]));

    // Object modified
    canvas.on('object:modified', (e: any) => {
      if (e.target) {
        const layer = activeLayerRef.current;
        const drawingObject = fabricObjectToDrawingObject(e.target, layer);
        updateDrawingObjects([drawingObject]);
        pushSnapshot();
      }
    });

    // Object added — notify parent
    canvas.on('object:added', () => {
      if (onObjectsChange && fabricRef.current) {
        const objects = getCanvasObjects();
        onObjectsChange(objects);
      }
    });

    // Freehand path created
    canvas.on('path:created', (e: any) => {
      if (e.path) {
        e.path.set({ id: uuidv4() });
        pushSnapshot();
      }
    });

    // Mouse wheel zoom
    canvas.on('mouse:wheel', (opt: any) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;
      zoom = Math.min(Math.max(zoom, 0.25), 5.0);
      const point = new fabric.Point(opt.e.offsetX, opt.e.offsetY);
      canvas.zoomToPoint(point, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      onZoomChange?.(zoom);
    });

    // Cursor tracking
    canvas.on('mouse:move', (e: any) => {
      const pt = getPointerFromEvent(e);
      onCursorMove?.(pt);
    });
    canvas.on('mouse:out', () => {
      onCursorMove?.(null);
    });

    // Load existing drawing if available
    if (currentDrawing?.fabricCanvasJson) {
      isLoadingSnapshotRef.current = true;
      canvas.loadFromJSON(currentDrawing.fabricCanvasJson).then(() => {
        canvas.renderAll();
        isLoadingSnapshotRef.current = false;
        // Take initial snapshot
        pushSnapshot();
      });
    } else {
      // Draw grid if enabled
      if (currentDrawing?.grid?.enabled) {
        drawGrid(canvas, currentDrawing.grid.size, currentDrawing.grid.color, fabric);
      }
      // Take initial snapshot
      pushSnapshot();
    }

    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricLoaded, width, height]);

  // --- Handle tool changes ---
  useEffect(() => {
    if (!fabricRef.current || !fabricLoaded) return;
    const canvas = fabricRef.current;
    const fabric = fabricModuleRef.current!;

    // Clean up any in-progress drawing
    if (currentShapeRef.current) {
      canvas.remove(currentShapeRef.current);
      currentShapeRef.current = null;
    }
    if (polylinePreviewRef.current) {
      canvas.remove(polylinePreviewRef.current);
      polylinePreviewRef.current = null;
    }
    if (dimensionPreviewRef.current) {
      canvas.remove(dimensionPreviewRef.current);
      dimensionPreviewRef.current = null;
    }
    isDrawingRef.current = false;
    startPointRef.current = null;
    dimensionStartRef.current = null;
    polylinePointsRef.current = [];
    canvas.renderAll();

    // Reset drawing mode
    canvas.isDrawingMode = false;
    canvas.selection = true;

    if (activeTool === 'select') {
      canvas.defaultCursor = 'default';
    } else if (activeTool === 'pan') {
      canvas.defaultCursor = 'grab';
      canvas.selection = false;
    } else if (activeTool === 'freehand') {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = activeStyle.strokeColor;
        canvas.freeDrawingBrush.width = activeStyle.strokeWidth;
      }
    } else {
      canvas.defaultCursor = 'crosshair';
    }
  }, [activeTool, activeStyle, fabricLoaded]);

  // --- Mouse event handlers ---
  useEffect(() => {
    if (!fabricRef.current || !fabricLoaded || !isReady) return;
    const canvas = fabricRef.current;
    const fabric = fabricModuleRef.current!;

    const handleMouseDown = (e: any) => {
      const tool = activeToolRef.current;
      const style = activeStyleRef.current;
      const pointer = getPointerFromEvent(e);
      const snappedPointer = snapPointer(pointer);

      // Pan tool
      if (tool === 'pan') {
        isPanningRef.current = true;
        lastPanPointRef.current = { x: e.e.clientX, y: e.e.clientY };
        canvas.defaultCursor = 'grabbing';
        return;
      }

      if (tool === 'select' || tool === 'freehand') return;

      const startPoint = { x: snappedPointer.x, y: snappedPointer.y };
      startPointRef.current = startPoint;

      // Dimension tool
      if (tool === 'dimension') {
        if (!dimensionStartRef.current) {
          dimensionStartRef.current = startPoint;
          updateStatus('Click second point for dimension end');
          dimensionPreviewRef.current = new fabric.Line(
            [startPoint.x, startPoint.y, startPoint.x, startPoint.y],
            { stroke: '#0066CC', strokeWidth: 2, strokeDashArray: [5, 5], selectable: false, evented: false }
          );
          canvas.add(dimensionPreviewRef.current);
        } else {
          const start = dimensionStartRef.current;
          const end = startPoint;
          const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
          if (dimensionPreviewRef.current) {
            canvas.remove(dimensionPreviewRef.current);
            dimensionPreviewRef.current = null;
          }
          onDimensionRequest?.(start, end, distance);
          dimensionStartRef.current = null;
          updateStatus('Dimension placed. Click to start new dimension.');
        }
        return;
      }

      // Text tool
      if (tool === 'text') {
        onLabelRequest?.(startPoint);
        return;
      }

      isDrawingRef.current = true;

      // Polyline/Polygon
      if (tool === 'polyline' || tool === 'polygon') {
        polylinePointsRef.current.push(startPoint);
        if (currentShapeRef.current) canvas.remove(currentShapeRef.current);

        const fabricPoints = polylinePointsRef.current.map(p => ({ x: p.x, y: p.y }));

        currentShapeRef.current = new fabric.Polyline(fabricPoints, {
          stroke: style.strokeColor,
          strokeWidth: style.strokeWidth,
          fill: tool === 'polygon' ? style.fillColor : 'transparent',
          opacity: style.fillOpacity,
          selectable: false,
          objectCaching: false,
        });
        canvas.add(currentShapeRef.current);
        canvas.renderAll();
        updateStatus(`${tool === 'polygon' ? 'Polygon' : 'Polyline'}: ${polylinePointsRef.current.length} point(s) - Double-click to finish`);
        return;
      }

      // Create shape
      currentShapeRef.current = createShape(tool, startPoint, snappedPointer, style, fabric);
      if (currentShapeRef.current) {
        currentShapeRef.current.set({ selectable: false });
        canvas.add(currentShapeRef.current);
      }
    };

    const handleMouseMove = (e: any) => {
      const tool = activeToolRef.current;
      const style = activeStyleRef.current;
      const pointer = getPointerFromEvent(e);
      const snappedPointer = snapPointer(pointer);

      // Pan
      if (tool === 'pan' && isPanningRef.current && lastPanPointRef.current) {
        const dx = e.e.clientX - lastPanPointRef.current.x;
        const dy = e.e.clientY - lastPanPointRef.current.y;
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] += dx;
          vpt[5] += dy;
          canvas.setViewportTransform(vpt);
          canvas.requestRenderAll();
        }
        lastPanPointRef.current = { x: e.e.clientX, y: e.e.clientY };
        return;
      }

      // Dimension preview
      if (tool === 'dimension' && dimensionStartRef.current && dimensionPreviewRef.current) {
        dimensionPreviewRef.current.set({ x2: snappedPointer.x, y2: snappedPointer.y });
        canvas.renderAll();
        return;
      }

      // Polyline preview
      if ((tool === 'polyline' || tool === 'polygon') && polylinePointsRef.current.length > 0) {
        const lastPoint = polylinePointsRef.current[polylinePointsRef.current.length - 1];
        if (polylinePreviewRef.current) canvas.remove(polylinePreviewRef.current);
        polylinePreviewRef.current = new fabric.Line(
          [lastPoint.x, lastPoint.y, snappedPointer.x, snappedPointer.y],
          { stroke: style.strokeColor, strokeWidth: style.strokeWidth, strokeDashArray: [5, 5], selectable: false, evented: false }
        );
        canvas.add(polylinePreviewRef.current);
        canvas.renderAll();
        return;
      }

      if (!isDrawingRef.current || !startPointRef.current || !currentShapeRef.current) return;
      updateShape(tool, currentShapeRef.current, startPointRef.current, snappedPointer, isShiftDownRef.current);
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      const tool = activeToolRef.current;

      // Pan
      if (tool === 'pan') {
        isPanningRef.current = false;
        lastPanPointRef.current = null;
        canvas.defaultCursor = 'grab';
        return;
      }

      if (tool === 'polyline' || tool === 'polygon') return;

      if (currentShapeRef.current) {
        currentShapeRef.current.set({ selectable: true });
        currentShapeRef.current.setCoords();
        saveObjectToState(currentShapeRef.current);
      }

      isDrawingRef.current = false;
      startPointRef.current = null;
      currentShapeRef.current = null;
    };

    const handleDoubleClick = () => {
      const tool = activeToolRef.current;
      const style = activeStyleRef.current;
      if ((tool === 'polyline' || tool === 'polygon') && polylinePointsRef.current.length >= 2) {
        if (currentShapeRef.current) canvas.remove(currentShapeRef.current);
        if (polylinePreviewRef.current) { canvas.remove(polylinePreviewRef.current); polylinePreviewRef.current = null; }

        const finalPoints = [...polylinePointsRef.current];
        if (tool === 'polygon' && finalPoints.length >= 3) {
          finalPoints.push({ ...finalPoints[0] });
        }

        const fabricPoints = finalPoints.map(p => ({ x: p.x, y: p.y }));

        const finalShape = new fabric.Polyline(fabricPoints, {
          stroke: style.strokeColor,
          strokeWidth: style.strokeWidth,
          fill: tool === 'polygon' ? style.fillColor : 'transparent',
          opacity: style.fillOpacity,
          selectable: true,
          objectCaching: false,
          id: uuidv4(),
        } as any);

        canvas.add(finalShape);
        finalShape.setCoords();
        saveObjectToState(finalShape);
        canvas.renderAll();

        polylinePointsRef.current = [];
        currentShapeRef.current = null;
        isDrawingRef.current = false;
        updateStatus(`${tool === 'polygon' ? 'Polygon' : 'Polyline'} completed`);
      }
    };

    canvas.on('mouse:down', handleMouseDown);
    canvas.on('mouse:move', handleMouseMove);
    canvas.on('mouse:up', handleMouseUp);
    canvas.on('mouse:dblclick', handleDoubleClick);

    return () => {
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
      canvas.off('mouse:dblclick', handleDoubleClick);
    };
  }, [isReady, fabricLoaded, onDimensionRequest, onLabelRequest, updateStatus, saveObjectToState, onZoomChange]);

  // --- Snap helper ---
  const snapPointer = (pointer: DrawingPoint): DrawingPoint => {
    if (currentDrawing?.grid?.snapToGrid && currentDrawing.grid.enabled) {
      const gridSize = currentDrawing.grid.size;
      return {
        x: Math.round(pointer.x / gridSize) * gridSize,
        y: Math.round(pointer.y / gridSize) * gridSize,
      };
    }
    return pointer;
  };

  // --- Canvas objects helper ---
  const getCanvasObjects = (): DrawingObject[] => {
    if (!fabricRef.current) return [];
    const objects = fabricRef.current.getObjects();
    return objects
      .filter((obj: any) => !(obj as any).isGrid)
      .map((obj: any) => fabricObjectToDrawingObject(obj, activeLayerRef.current));
  };

  // --- Exposed methods ---
  const addText = useCallback((text: string, position?: DrawingPoint, style?: Record<string, unknown>) => {
    const fabric = fabricModuleRef.current;
    if (!fabricRef.current || !fabric) return;
    const s = activeStyleRef.current;
    const textStyle = style || {};

    const textObj = new fabric.IText(text, {
      left: position?.x || 100,
      top: position?.y || 100,
      fontSize: (textStyle.fontSize as number) || s.fontSize || 14,
      fontFamily: (textStyle.fontFamily as string) || s.fontFamily || 'Arial',
      fontWeight: (textStyle.fontWeight as string) || 'normal',
      fill: (textStyle.color as string) || s.strokeColor,
      id: uuidv4(),
      backgroundColor: textStyle.hasBackground ? (textStyle.backgroundColor as string) : undefined,
      stroke: textStyle.hasOutline ? (textStyle.outlineColor as string) : undefined,
      strokeWidth: textStyle.hasOutline ? 0.5 : 0,
    } as any);

    fabricRef.current.add(textObj);
    fabricRef.current.setActiveObject(textObj);
    fabricRef.current.renderAll();
    saveObjectToState(textObj);
  }, [saveObjectToState]);

  const addLabel = useCallback((text: string, position: DrawingPoint, style: Record<string, unknown>) => {
    const fabric = fabricModuleRef.current;
    if (!fabricRef.current || !fabric) return;

    if (style.hasBackground) {
      const textForMeasure = new fabric.Text(text, {
        fontSize: style.fontSize as number,
        fontFamily: style.fontFamily as string,
        fontWeight: style.fontWeight as string,
      });

      const padding = 4;
      const bgRect = new fabric.Rect({
        width: (textForMeasure.width || 0) + padding * 2,
        height: (textForMeasure.height || 0) + padding * 2,
        fill: style.backgroundColor as string,
        stroke: style.hasOutline ? (style.outlineColor as string) : undefined,
        strokeWidth: style.hasOutline ? 1 : 0,
        rx: 2,
        ry: 2,
        originX: 'center',
        originY: 'center',
      });

      const labelText = new fabric.Text(text, {
        fontSize: style.fontSize as number,
        fontFamily: style.fontFamily as string,
        fontWeight: style.fontWeight as string,
        fill: style.color as string,
        originX: 'center',
        originY: 'center',
      });

      const group = new fabric.Group([bgRect, labelText], {
        left: position.x,
        top: position.y,
        id: uuidv4(),
        originX: 'center',
        originY: 'center',
      } as any);

      fabricRef.current.add(group);
      fabricRef.current.setActiveObject(group);
      fabricRef.current.renderAll();
      saveObjectToState(group);
    } else {
      addText(text, position, style);
    }
  }, [addText, saveObjectToState]);

  const addDimension = useCallback((start: DrawingPoint, end: DrawingPoint, customLabel?: string) => {
    const fabric = fabricModuleRef.current;
    if (!fabricRef.current || !fabric) return;
    const style = activeStyleRef.current;
    const label = customLabel || calculateDistance(start, end, currentDrawing?.scale?.pixelsPerFoot || 10);
    const group = createDimensionLine(start, end, label, fabric, style);
    (group as any).set({ id: uuidv4() });
    fabricRef.current.add(group);
    fabricRef.current.renderAll();
    saveObjectToState(group);
  }, [currentDrawing?.scale, saveObjectToState]);

  const addMeasurement = useCallback((start: DrawingPoint, end: DrawingPoint, measurement: { value: number; unit: string; displayText: string }) => {
    const fabric = fabricModuleRef.current;
    if (!fabricRef.current || !fabric) return;
    const style = activeStyleRef.current;
    const group = createDimensionLine(start, end, measurement.displayText, fabric, style);
    (group as any).set({ id: uuidv4() });
    fabricRef.current.add(group);
    fabricRef.current.renderAll();
    saveObjectToState(group);
  }, [saveObjectToState]);

  const addImage = useCallback(async (imageData: string) => {
    const fabric = fabricModuleRef.current;
    if (!fabricRef.current || !fabric) return;

    const img = await fabric.Image.fromURL(imageData);
    img.set({
      left: 0,
      top: 0,
      id: uuidv4(),
      selectable: true,
    } as any);
    const maxWidth = width * 0.8;
    const maxHeight = height * 0.8;
    if ((img.width || 0) > maxWidth || (img.height || 0) > maxHeight) {
      const scale = Math.min(maxWidth / (img.width || 1), maxHeight / (img.height || 1));
      img.scale(scale);
    }
    fabricRef.current.add(img);
    fabricRef.current.sendObjectToBack(img);
    fabricRef.current.renderAll();
    pushSnapshot();
  }, [width, height, pushSnapshot]);

  const deleteSelected = useCallback(() => {
    if (!fabricRef.current) return;
    const activeObjects = fabricRef.current.getActiveObjects();
    activeObjects.forEach((obj: FabricObject) => {
      fabricRef.current!.remove(obj);
    });
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    pushSnapshot();
  }, [pushSnapshot]);

  const exportToImage = useCallback((): string | null => {
    if (!fabricRef.current) return null;
    return fabricRef.current.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
  }, []);

  const exportToJSON = useCallback((): string | null => {
    if (!fabricRef.current) return null;
    return JSON.stringify(fabricRef.current.toJSON(['id', 'isGrid']));
  }, []);

  const loadFromJSON = useCallback(async (json: string) => {
    if (!fabricRef.current) return;
    isLoadingSnapshotRef.current = true;
    await fabricRef.current.loadFromJSON(json);
    fabricRef.current.renderAll();
    isLoadingSnapshotRef.current = false;
  }, []);

  const clearCanvas = useCallback(() => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = '#ffffff';
    fabricRef.current.renderAll();
    pushSnapshot();
  }, [pushSnapshot]);

  const undo = useCallback(async () => {
    const stack = historyStackRef.current;
    const idx = historyIndexRef.current;
    if (idx <= 0 || !fabricRef.current) return;
    const newIdx = idx - 1;
    historyIndexRef.current = newIdx;
    isLoadingSnapshotRef.current = true;
    await fabricRef.current.loadFromJSON(stack[newIdx]);
    fabricRef.current.renderAll();
    isLoadingSnapshotRef.current = false;
    // Also update store
    getSnapshotForUndo();
  }, [getSnapshotForUndo]);

  const redo = useCallback(async () => {
    const stack = historyStackRef.current;
    const idx = historyIndexRef.current;
    if (idx >= stack.length - 1 || !fabricRef.current) return;
    const newIdx = idx + 1;
    historyIndexRef.current = newIdx;
    isLoadingSnapshotRef.current = true;
    await fabricRef.current.loadFromJSON(stack[newIdx]);
    fabricRef.current.renderAll();
    isLoadingSnapshotRef.current = false;
    // Also update store
    getSnapshotForRedo();
  }, [getSnapshotForRedo]);

  const setTool = useCallback((tool: DrawingToolType) => {
    setActiveTool(tool);
    updateStatus(`Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)} selected`);
  }, [setActiveTool, updateStatus]);

  const cancelCurrentOperation = useCallback(() => {
    if (!fabricRef.current) return;
    if (currentShapeRef.current) {
      fabricRef.current.remove(currentShapeRef.current);
      currentShapeRef.current = null;
    }
    if (polylinePreviewRef.current) {
      fabricRef.current.remove(polylinePreviewRef.current);
      polylinePreviewRef.current = null;
    }
    polylinePointsRef.current = [];
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
    setActiveTool('select');
    updateStatus('Operation cancelled');
  }, [setActiveTool, updateStatus]);

  const zoomIn = useCallback(() => {
    if (!fabricRef.current) return;
    let zoom = fabricRef.current.getZoom() * 1.2;
    zoom = Math.min(zoom, 5.0);
    const center = fabricRef.current.getCenterPoint();
    fabricRef.current.zoomToPoint(center, zoom);
    onZoomChange?.(zoom);
  }, [onZoomChange]);

  const zoomOut = useCallback(() => {
    if (!fabricRef.current) return;
    let zoom = fabricRef.current.getZoom() * 0.8;
    zoom = Math.max(zoom, 0.25);
    const center = fabricRef.current.getCenterPoint();
    fabricRef.current.zoomToPoint(center, zoom);
    onZoomChange?.(zoom);
  }, [onZoomChange]);

  const resetZoom = useCallback(() => {
    if (!fabricRef.current) return;
    fabricRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
    onZoomChange?.(1);
  }, [onZoomChange]);

  // Expose handle via ref
  useImperativeHandle(ref, () => ({
    addText,
    addLabel,
    addDimension,
    addMeasurement,
    addImage,
    deleteSelected,
    exportToImage,
    exportToJSON,
    loadFromJSON,
    clearCanvas,
    undo,
    redo,
    setTool,
    cancelCurrentOperation,
    getCanvas: () => fabricRef.current,
    getScale: () => currentDrawing?.scale?.pixelsPerFoot || 10,
    zoomIn,
    zoomOut,
    resetZoom,
  }), [addText, addLabel, addDimension, addMeasurement, addImage, deleteSelected, exportToImage, exportToJSON, loadFromJSON, clearCanvas, undo, redo, setTool, cancelCurrentOperation, currentDrawing?.scale, zoomIn, zoomOut, resetZoom]);

  return (
    <div className="drawing-canvas-container relative border border-slate-300 rounded-lg overflow-hidden bg-white">
      <canvas ref={canvasElRef} id="drawing-canvas" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-slate-600">Loading canvas...</div>
        </div>
      )}
    </div>
  );
});

export default DrawingCanvas;

// ============================================================
// Helper functions
// ============================================================

function getPointerFromEvent(e: any): DrawingPoint {
  if (e.scenePoint) return { x: e.scenePoint.x, y: e.scenePoint.y };
  if (e.pointer) return { x: e.pointer.x, y: e.pointer.y };
  if (e.absolutePointer) return { x: e.absolutePointer.x, y: e.absolutePointer.y };
  return { x: 0, y: 0 };
}

function createShape(
  tool: DrawingToolType,
  start: DrawingPoint,
  _current: DrawingPoint,
  style: DrawingStyle,
  fabric: FabricModule,
): any | null {
  const id = uuidv4();
  const baseProps: Record<string, unknown> = {
    id,
    stroke: style.strokeColor,
    strokeWidth: style.strokeWidth,
    fill: style.fillColor || 'transparent',
    opacity: style.fillOpacity,
  };

  switch (tool) {
    case 'rectangle':
      return new fabric.Rect({ ...baseProps, left: start.x, top: start.y, width: 0, height: 0 });
    case 'circle':
      return new fabric.Circle({ ...baseProps, left: start.x, top: start.y, radius: 0 });
    case 'ellipse':
      return new fabric.Ellipse({ ...baseProps, left: start.x, top: start.y, rx: 0, ry: 0 });
    case 'line':
      return new fabric.Line([start.x, start.y, start.x, start.y], { ...baseProps, fill: undefined });
    case 'triangle':
      return new fabric.Triangle({ ...baseProps, left: start.x, top: start.y, width: 0, height: 0 });
    // arc, curve, spline are removed — return null (no-op)
    case 'arc':
    case 'curve':
    case 'spline':
      return null;
    default:
      return null;
  }
}

function updateShape(
  tool: DrawingToolType,
  shape: any,
  start: DrawingPoint,
  current: DrawingPoint,
  shiftHeld: boolean,
): void {
  const width = current.x - start.x;
  const height = current.y - start.y;

  switch (tool) {
    case 'rectangle': {
      const w = Math.abs(width);
      const h = shiftHeld ? w : Math.abs(height);
      shape.set({
        width: w,
        height: h,
        left: width > 0 ? start.x : start.x - w,
        top: height > 0 ? start.y : start.y - h,
      });
      break;
    }
    case 'circle': {
      const radius = Math.sqrt(width * width + height * height) / 2;
      shape.set({ radius, left: start.x - radius, top: start.y - radius });
      break;
    }
    case 'ellipse': {
      const rx = Math.abs(width) / 2;
      const ry = shiftHeld ? rx : Math.abs(height) / 2;
      shape.set({
        rx,
        ry,
        left: width > 0 ? start.x : current.x,
        top: height > 0 ? start.y : current.y,
      });
      break;
    }
    case 'line': {
      let x2 = current.x;
      let y2 = current.y;
      if (shiftHeld) {
        // Snap to nearest 45-degree increment
        const dx = current.x - start.x;
        const dy = current.y - start.y;
        const angle = Math.atan2(dy, dx);
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        const dist = Math.sqrt(dx * dx + dy * dy);
        x2 = start.x + dist * Math.cos(snappedAngle);
        y2 = start.y + dist * Math.sin(snappedAngle);
      }
      shape.set({ x2, y2 });
      break;
    }
    case 'triangle': {
      const tw = Math.abs(width);
      const th = shiftHeld ? tw : Math.abs(height);
      shape.set({
        width: tw,
        height: th,
        left: width > 0 ? start.x : start.x - tw,
        top: height > 0 ? start.y : start.y - th,
      });
      break;
    }
  }
}

function createDimensionLine(
  start: DrawingPoint,
  end: DrawingPoint,
  label: string,
  fabric: FabricModule,
  style: DrawingStyle,
): any {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
  const color = style.strokeColor || '#000000';

  const line = new fabric.Line([start.x, start.y, end.x, end.y], { stroke: color, strokeWidth: 1 });

  const tickLength = 10;
  const perpAngle = (angle + 90) * (Math.PI / 180);

  const tick1 = new fabric.Line([
    start.x - Math.cos(perpAngle) * tickLength,
    start.y - Math.sin(perpAngle) * tickLength,
    start.x + Math.cos(perpAngle) * tickLength,
    start.y + Math.sin(perpAngle) * tickLength,
  ], { stroke: color, strokeWidth: 1 });

  const tick2 = new fabric.Line([
    end.x - Math.cos(perpAngle) * tickLength,
    end.y - Math.sin(perpAngle) * tickLength,
    end.x + Math.cos(perpAngle) * tickLength,
    end.y + Math.sin(perpAngle) * tickLength,
  ], { stroke: color, strokeWidth: 1 });

  const text = new fabric.Text(label, {
    left: midX,
    top: midY - 15,
    fontSize: 12,
    fontFamily: 'Arial',
    fill: color,
    textAlign: 'center',
    originX: 'center',
  });

  return new fabric.Group([line, tick1, tick2, text], { selectable: true });
}

function drawGrid(canvas: any, size: number, color: string, fabric: FabricModule): void {
  const w = canvas.getWidth();
  const h = canvas.getHeight();

  for (let i = 0; i <= w / size; i++) {
    const line = new fabric.Line([i * size, 0, i * size, h], {
      stroke: color,
      strokeWidth: 0.5,
      selectable: false,
      evented: false,
      isGrid: true,
    } as any);
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }

  for (let i = 0; i <= h / size; i++) {
    const line = new fabric.Line([0, i * size, w, i * size], {
      stroke: color,
      strokeWidth: 0.5,
      selectable: false,
      evented: false,
      isGrid: true,
    } as any);
    canvas.add(line);
    canvas.sendObjectToBack(line);
  }
}

function calculateDistance(start: DrawingPoint, end: DrawingPoint, pixelsPerFoot: number): string {
  const distance = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2);
  const feet = distance / pixelsPerFoot;
  if (feet >= 1) {
    return `${feet.toFixed(1)}'`;
  }
  const inches = feet * 12;
  return `${inches.toFixed(1)}"`;
}

function fabricObjectToDrawingObject(obj: any, layer: DrawingLayerType): DrawingObject {
  return {
    id: obj.id || uuidv4(),
    type: obj.type as DrawingToolType,
    layer,
    points: [{ x: obj.left || 0, y: obj.top || 0 }],
    style: {
      strokeColor: obj.stroke || '#000000',
      strokeWidth: obj.strokeWidth || 1,
      strokeStyle: 'solid',
      fillColor: obj.fill || 'transparent',
      fillOpacity: obj.opacity || 1,
    },
    dimensions: {
      width: obj.width,
      height: obj.height,
      radius: obj.radius,
      unit: 'feet',
    },
    rotation: obj.angle || 0,
    locked: obj.lockMovementX && obj.lockMovementY,
    visible: obj.visible !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fabricData: JSON.stringify(obj.toJSON()),
  };
}
