'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import type { DrawingToolType, DrawingPoint, DrawingObject, DrawingLayerType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Fabric.js types
type FabricCanvas = any;
type FabricObject = any;

interface DrawingCanvasProps {
  width?: number;
  height?: number;
  onObjectsChange?: (objects: DrawingObject[]) => void;
  onCursorMove?: (position: { x: number; y: number } | null) => void;
  onStatusChange?: (status: string) => void;
  onDimensionRequest?: (start: DrawingPoint, end: DrawingPoint, distance: number) => void;
  onLabelRequest?: (position: DrawingPoint) => void;
}

export default function DrawingCanvas({
  width = 800,
  height = 600,
  onObjectsChange,
  onCursorMove,
  onStatusChange,
  onDimensionRequest,
  onLabelRequest,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fabric, setFabric] = useState<FabricCanvas>(null);
  const polylinePointsRef = useRef<DrawingPoint[]>([]);
  const currentShapeRef = useRef<FabricObject | null>(null);
  const polylinePreviewRef = useRef<FabricObject | null>(null);
  const dimensionStartRef = useRef<DrawingPoint | null>(null);
  const dimensionPreviewRef = useRef<FabricObject | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const startPointRef = useRef<DrawingPoint | null>(null);
  const activeToolRef = useRef<DrawingToolType>('select');

  const {
    drawingState,
    setActiveTool,
    updateDrawingObjects,
    addToDrawingHistory,
    setSelectedObjects,
  } = useStore();

  const { activeTool, activeStyle, activeLayer, currentDrawing } = drawingState;

  // Keep activeToolRef in sync with activeTool
  useEffect(() => {
    activeToolRef.current = activeTool;
  }, [activeTool]);

  // Define callbacks early so they can be used in effects
  const updateStatus = useCallback((status: string) => {
    onStatusChange?.(status);
  }, [onStatusChange]);

  const saveObjectToState = useCallback((obj: FabricObject) => {
    const drawingObject = fabricObjectToDrawingObject(obj, activeLayer);
    updateDrawingObjects([drawingObject]);
    addToDrawingHistory({
      timestamp: new Date().toISOString(),
      action: 'add',
      objectIds: [drawingObject.id],
      newState: JSON.stringify(drawingObject),
    });
  }, [activeLayer, updateDrawingObjects, addToDrawingHistory]);

  // Load Fabric.js dynamically (client-side only)
  useEffect(() => {
    const loadFabric = async () => {
      const fabricModule = await import('fabric');
      setFabric(fabricModule);
    };
    loadFabric();
  }, []);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !fabric) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Event handlers
    canvas.on('selection:created', handleSelectionChange);
    canvas.on('selection:updated', handleSelectionChange);
    canvas.on('selection:cleared', () => setSelectedObjects([]));
    canvas.on('object:modified', handleObjectModified);
    canvas.on('object:added', handleObjectAdded);

    // Load existing drawing if available
    if (currentDrawing?.fabricCanvasJson) {
      canvas.loadFromJSON(currentDrawing.fabricCanvasJson, () => {
        canvas.renderAll();
      });
    }

    // Draw grid if enabled
    if (currentDrawing?.grid?.enabled) {
      drawGrid(canvas, currentDrawing.grid.size, currentDrawing.grid.color);
    }

    setIsReady(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [fabric, width, height]);

  // Handle tool changes
  useEffect(() => {
    if (!fabricRef.current || !fabric) return;

    const canvas = fabricRef.current;

    // Clean up any in-progress drawing when tool changes
    if (currentShapeRef.current && !currentShapeRef.current.selectable) {
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
      canvas.freeDrawingBrush.color = activeStyle.strokeColor;
      canvas.freeDrawingBrush.width = activeStyle.strokeWidth;
    } else {
      canvas.defaultCursor = 'crosshair';
    }
  }, [activeTool, activeStyle, fabric]);

  // Mouse event handlers for shape drawing
  useEffect(() => {
    if (!fabricRef.current || !fabric || !isReady) return;

    const canvas = fabricRef.current;

    // Helper to get pointer from event (Fabric.js 7.x uses e.pointer)
    const getPointerFromEvent = (e: any): DrawingPoint => {
      // Fabric.js 7.x provides pointer directly on the event
      if (e.pointer) {
        return { x: e.pointer.x, y: e.pointer.y };
      }
      // Alternative: use absolutePointer for canvas coordinates
      if (e.absolutePointer) {
        return { x: e.absolutePointer.x, y: e.absolutePointer.y };
      }
      // Fallback: try scenePoint
      if (e.scenePoint) {
        return { x: e.scenePoint.x, y: e.scenePoint.y };
      }
      return { x: 0, y: 0 };
    };

    const handleMouseDown = (e: any) => {
      const tool = activeToolRef.current;
      if (tool === 'select' || tool === 'pan' || tool === 'freehand') return;

      const pointer = getPointerFromEvent(e);
      const startPoint = { x: pointer.x, y: pointer.y };
      startPointRef.current = startPoint;

      // Handle dimension tool - two-click mode
      if (tool === 'dimension') {
        if (!dimensionStartRef.current) {
          // First click - set start point
          dimensionStartRef.current = startPoint;
          updateStatus('Click second point for dimension end');

          // Create preview line
          dimensionPreviewRef.current = new fabric.Line(
            [startPoint.x, startPoint.y, startPoint.x, startPoint.y],
            {
              stroke: '#0066CC',
              strokeWidth: 2,
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
            }
          );
          canvas.add(dimensionPreviewRef.current);
        } else {
          // Second click - complete dimension
          const start = dimensionStartRef.current;
          const end = startPoint;
          const distance = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );

          // Remove preview
          if (dimensionPreviewRef.current) {
            canvas.remove(dimensionPreviewRef.current);
            dimensionPreviewRef.current = null;
          }

          // Request measurement input from parent
          onDimensionRequest?.(start, end, distance);

          // Reset
          dimensionStartRef.current = null;
          updateStatus('Dimension placed. Click to start new dimension.');
        }
        return;
      }

      // Handle text tool - single click to place
      if (tool === 'text') {
        onLabelRequest?.(startPoint);
        return;
      }

      isDrawingRef.current = true;

      // For polyline/polygon, accumulate points on click
      if (tool === 'polyline' || tool === 'polygon') {
        polylinePointsRef.current.push(startPoint);

        // Remove old shape and create new one with updated points
        // (Fabric.js 7.x requires recreating polyline to update points properly)
        if (currentShapeRef.current) {
          canvas.remove(currentShapeRef.current);
        }

        // Convert points to fabric.Point format for Fabric.js 7.x
        const fabricPoints = polylinePointsRef.current.map(p => ({ x: p.x, y: p.y }));

        // In Fabric.js 7.x, Polyline requires points as array of {x, y} objects
        // and we need to set left/top based on the bounding box
        const minX = Math.min(...fabricPoints.map(p => p.x));
        const minY = Math.min(...fabricPoints.map(p => p.y));

        currentShapeRef.current = new fabric.Polyline(fabricPoints, {
          stroke: activeStyle.strokeColor,
          strokeWidth: activeStyle.strokeWidth,
          fill: tool === 'polygon' ? activeStyle.fillColor : 'transparent',
          opacity: activeStyle.fillOpacity,
          selectable: false,
          objectCaching: false,
          left: minX,
          top: minY,
        });
        canvas.add(currentShapeRef.current);
        canvas.renderAll();

        updateStatus(`${tool === 'polygon' ? 'Polygon' : 'Polyline'}: ${polylinePointsRef.current.length} point(s) - Double-click to finish`);
        return;
      }

      // Create shape based on tool
      currentShapeRef.current = createShape(tool, startPoint, pointer, activeStyle, fabric);
      if (currentShapeRef.current) {
        currentShapeRef.current.set({ selectable: false });
        canvas.add(currentShapeRef.current);
      }
    };

    const handleMouseMove = (e: any) => {
      const tool = activeToolRef.current;
      const pointer = getPointerFromEvent(e);

      // Update dimension preview line
      if (tool === 'dimension' && dimensionStartRef.current && dimensionPreviewRef.current) {
        dimensionPreviewRef.current.set({
          x2: pointer.x,
          y2: pointer.y,
        });
        canvas.renderAll();
        return;
      }

      // Update polyline/polygon preview line
      if ((tool === 'polyline' || tool === 'polygon') && polylinePointsRef.current.length > 0) {
        const lastPoint = polylinePointsRef.current[polylinePointsRef.current.length - 1];

        // Remove old preview line
        if (polylinePreviewRef.current) {
          canvas.remove(polylinePreviewRef.current);
        }

        // Create new preview line from last point to current mouse position
        polylinePreviewRef.current = new fabric.Line(
          [lastPoint.x, lastPoint.y, pointer.x, pointer.y],
          {
            stroke: activeStyle.strokeColor,
            strokeWidth: activeStyle.strokeWidth,
            strokeDashArray: [5, 5],
            selectable: false,
            evented: false,
          }
        );
        canvas.add(polylinePreviewRef.current);
        canvas.renderAll();
        return;
      }

      if (!isDrawingRef.current || !startPointRef.current || !currentShapeRef.current) return;

      updateShape(tool, currentShapeRef.current, startPointRef.current, pointer, fabric);
      canvas.renderAll();
    };

    const handleMouseUp = () => {
      const tool = activeToolRef.current;
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
      // Finish polyline/polygon on double-click
      if ((tool === 'polyline' || tool === 'polygon') && polylinePointsRef.current.length >= 2) {
        // Remove the current preview shape and preview line
        if (currentShapeRef.current) {
          canvas.remove(currentShapeRef.current);
        }
        if (polylinePreviewRef.current) {
          canvas.remove(polylinePreviewRef.current);
          polylinePreviewRef.current = null;
        }

        // Get final points
        const finalPoints = [...polylinePointsRef.current];

        // Close the polygon if needed
        if (tool === 'polygon' && finalPoints.length >= 3) {
          // Add closing point
          finalPoints.push({ ...finalPoints[0] });
        }

        // Create the final shape
        const fabricPoints = finalPoints.map(p => ({ x: p.x, y: p.y }));
        const minX = Math.min(...fabricPoints.map(p => p.x));
        const minY = Math.min(...fabricPoints.map(p => p.y));

        const finalShape = new fabric.Polyline(fabricPoints, {
          stroke: activeStyle.strokeColor,
          strokeWidth: activeStyle.strokeWidth,
          fill: tool === 'polygon' ? activeStyle.fillColor : 'transparent',
          opacity: activeStyle.fillOpacity,
          selectable: true,
          objectCaching: false,
          left: minX,
          top: minY,
          id: uuidv4(),
        });

        canvas.add(finalShape);
        finalShape.setCoords();
        saveObjectToState(finalShape);
        canvas.renderAll();

        // Reset state
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
  }, [activeStyle, activeLayer, isReady, fabric, onDimensionRequest, onLabelRequest, updateStatus, saveObjectToState]);

  const handleSelectionChange = useCallback((e: any) => {
    const selected = e.selected || [];
    const ids = selected.map((obj: FabricObject) => obj.id).filter(Boolean);
    setSelectedObjects(ids);
  }, [setSelectedObjects]);

  const handleObjectModified = useCallback((e: any) => {
    if (e.target) {
      saveObjectToState(e.target);
    }
  }, []);

  const handleObjectAdded = useCallback(() => {
    if (onObjectsChange && fabricRef.current) {
      const objects = getCanvasObjects();
      onObjectsChange(objects);
    }
  }, [onObjectsChange]);

  const getCanvasObjects = (): DrawingObject[] => {
    if (!fabricRef.current) return [];
    const objects = fabricRef.current.getObjects();
    return objects
      .filter((obj: FabricObject) => !obj.isGrid)
      .map((obj: FabricObject) => fabricObjectToDrawingObject(obj, activeLayer));
  };

  // Exposed methods
  const addText = useCallback((text: string, position?: DrawingPoint, style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    hasBackground?: boolean;
    hasOutline?: boolean;
    outlineColor?: string;
  }) => {
    if (!fabricRef.current || !fabric) return;

    const textStyle = style || {};
    const textObj = new fabric.IText(text, {
      left: position?.x || 100,
      top: position?.y || 100,
      fontSize: textStyle.fontSize || activeStyle.fontSize || 14,
      fontFamily: textStyle.fontFamily || activeStyle.fontFamily || 'Arial',
      fontWeight: textStyle.fontWeight || 'normal',
      fill: textStyle.color || activeStyle.strokeColor,
      id: uuidv4(),
      // Add background if requested
      backgroundColor: textStyle.hasBackground ? textStyle.backgroundColor : undefined,
      // Add stroke for outline effect
      stroke: textStyle.hasOutline ? textStyle.outlineColor : undefined,
      strokeWidth: textStyle.hasOutline ? 0.5 : 0,
    });

    fabricRef.current.add(textObj);
    fabricRef.current.setActiveObject(textObj);
    fabricRef.current.renderAll();
    saveObjectToState(textObj);
  }, [activeStyle, fabric]);

  const addLabel = useCallback((text: string, position: DrawingPoint, style: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: string;
    backgroundColor: string;
    hasBackground: boolean;
    hasOutline: boolean;
    outlineColor: string;
  }) => {
    if (!fabricRef.current || !fabric) return;

    // Create text with optional background box
    if (style.hasBackground) {
      // Create a group with background rectangle and text
      const textForMeasure = new fabric.Text(text, {
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
      });

      const padding = 4;
      const bgRect = new fabric.Rect({
        width: textForMeasure.width! + padding * 2,
        height: textForMeasure.height! + padding * 2,
        fill: style.backgroundColor,
        stroke: style.hasOutline ? style.outlineColor : undefined,
        strokeWidth: style.hasOutline ? 1 : 0,
        rx: 2,
        ry: 2,
        originX: 'center',
        originY: 'center',
      });

      const labelText = new fabric.Text(text, {
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        fill: style.color,
        originX: 'center',
        originY: 'center',
      });

      const group = new fabric.Group([bgRect, labelText], {
        left: position.x,
        top: position.y,
        id: uuidv4(),
        originX: 'center',
        originY: 'center',
      });

      fabricRef.current.add(group);
      fabricRef.current.setActiveObject(group);
      fabricRef.current.renderAll();
      saveObjectToState(group);
    } else {
      // Simple text without background
      addText(text, position, style);
    }
  }, [fabric, addText]);

  const addDimension = useCallback((start: DrawingPoint, end: DrawingPoint, customLabel?: string) => {
    if (!fabricRef.current || !fabric) return;

    const canvas = fabricRef.current;
    const label = customLabel || calculateDistance(start, end, currentDrawing?.scale?.pixelsPerFoot || 10);

    // Create dimension line with arrows
    const group = createDimensionLine(start, end, label, fabric, activeStyle);
    group.set({ id: uuidv4() });
    canvas.add(group);
    canvas.renderAll();
    saveObjectToState(group);
  }, [currentDrawing?.scale, activeStyle, fabric]);

  const addMeasurement = useCallback((start: DrawingPoint, end: DrawingPoint, measurement: {
    value: number;
    unit: string;
    displayText: string;
  }) => {
    if (!fabricRef.current || !fabric) return;

    const canvas = fabricRef.current;
    const group = createDimensionLine(start, end, measurement.displayText, fabric, activeStyle);
    group.set({ id: uuidv4() });
    canvas.add(group);
    canvas.renderAll();
    saveObjectToState(group);
  }, [activeStyle, fabric]);

  const addImage = useCallback(async (imageData: string) => {
    if (!fabricRef.current || !fabric) return;

    fabric.Image.fromURL(imageData, (img: FabricObject) => {
      img.set({
        left: 0,
        top: 0,
        id: uuidv4(),
        selectable: true,
      });
      // Scale to fit canvas
      const maxWidth = width * 0.8;
      const maxHeight = height * 0.8;
      if (img.width > maxWidth || img.height > maxHeight) {
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        img.scale(scale);
      }
      fabricRef.current.add(img);
      fabricRef.current.sendToBack(img);
      fabricRef.current.renderAll();
    });
  }, [width, height, fabric]);

  const deleteSelected = useCallback(() => {
    if (!fabricRef.current) return;
    const activeObjects = fabricRef.current.getActiveObjects();
    activeObjects.forEach((obj: FabricObject) => {
      fabricRef.current.remove(obj);
    });
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();
  }, []);

  const exportToImage = useCallback((): string | null => {
    if (!fabricRef.current) return null;
    return fabricRef.current.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2,
    });
  }, []);

  const exportToJSON = useCallback((): string | null => {
    if (!fabricRef.current) return null;
    return JSON.stringify(fabricRef.current.toJSON(['id', 'isGrid']));
  }, []);

  const loadFromJSON = useCallback((json: string) => {
    if (!fabricRef.current) return;
    fabricRef.current.loadFromJSON(json, () => {
      fabricRef.current.renderAll();
    });
  }, []);

  const clearCanvas = useCallback(() => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = '#ffffff';
    fabricRef.current.renderAll();
  }, []);

  const undo = useCallback(() => {
    // Implement undo using history
    const { history, historyIndex } = drawingState;
    if (historyIndex > 0) {
      // Apply previous state
    }
  }, [drawingState]);

  const redo = useCallback(() => {
    // Implement redo using history
  }, [drawingState]);

  // Set tool programmatically
  const setTool = useCallback((tool: DrawingToolType) => {
    setActiveTool(tool);
    updateStatus(`Tool: ${tool.charAt(0).toUpperCase() + tool.slice(1)} selected`);
  }, [setActiveTool]);

  // Cancel current operation
  const cancelCurrentOperation = useCallback(() => {
    if (!fabricRef.current) return;

    // Clear any in-progress polyline/polygon
    if (currentShapeRef.current) {
      fabricRef.current.remove(currentShapeRef.current);
      currentShapeRef.current = null;
    }
    polylinePointsRef.current = [];

    // Clear selection
    fabricRef.current.discardActiveObject();
    fabricRef.current.renderAll();

    // Switch to select tool
    setActiveTool('select');
    updateStatus('Operation cancelled');
  }, [setActiveTool, updateStatus]);

  // Add cursor tracking to mouse move
  useEffect(() => {
    if (!fabricRef.current || !fabric || !isReady) return;

    const canvas = fabricRef.current;

    const handleMouseMoveForCursor = (e: any) => {
      // Fabric.js 7.x uses e.pointer
      if (e.pointer) {
        onCursorMove?.({ x: e.pointer.x, y: e.pointer.y });
      } else if (e.absolutePointer) {
        onCursorMove?.({ x: e.absolutePointer.x, y: e.absolutePointer.y });
      }
    };

    const handleMouseOut = () => {
      onCursorMove?.(null);
    };

    canvas.on('mouse:move', handleMouseMoveForCursor);
    canvas.on('mouse:out', handleMouseOut);

    return () => {
      canvas.off('mouse:move', handleMouseMoveForCursor);
      canvas.off('mouse:out', handleMouseOut);
    };
  }, [fabric, isReady, onCursorMove]);

  // Expose methods via ref
  useEffect(() => {
    (window as any).drawingCanvas = {
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
    };
  }, [addText, addLabel, addDimension, addMeasurement, addImage, deleteSelected, exportToImage, exportToJSON, loadFromJSON, clearCanvas, undo, redo, setTool, cancelCurrentOperation, currentDrawing?.scale]);

  return (
    <div className="drawing-canvas-container relative border border-slate-300 rounded-lg overflow-hidden bg-white">
      <canvas ref={canvasRef} id="drawing-canvas" />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-slate-600">Loading canvas...</div>
        </div>
      )}
    </div>
  );
}

// Helper functions

function createShape(
  tool: DrawingToolType,
  start: DrawingPoint,
  current: DrawingPoint,
  style: any,
  fabric: any
): FabricObject | null {
  const id = uuidv4();
  const baseProps = {
    id,
    stroke: style.strokeColor,
    strokeWidth: style.strokeWidth,
    fill: style.fillColor || 'transparent',
    opacity: style.fillOpacity,
  };

  switch (tool) {
    case 'rectangle':
      return new fabric.Rect({
        ...baseProps,
        left: start.x,
        top: start.y,
        width: 0,
        height: 0,
      });

    case 'circle':
      return new fabric.Circle({
        ...baseProps,
        left: start.x,
        top: start.y,
        radius: 0,
      });

    case 'ellipse':
      return new fabric.Ellipse({
        ...baseProps,
        left: start.x,
        top: start.y,
        rx: 0,
        ry: 0,
      });

    case 'line':
      return new fabric.Line([start.x, start.y, start.x, start.y], {
        ...baseProps,
        fill: undefined,
      });

    case 'triangle':
      return new fabric.Triangle({
        ...baseProps,
        left: start.x,
        top: start.y,
        width: 0,
        height: 0,
      });

    case 'arc':
      // Use a circle initially, we'll convert the visual to an arc during update
      // Store the arc as a circle with metadata about the arc
      const arcCircle = new fabric.Circle({
        ...baseProps,
        fill: 'transparent',
        left: start.x,
        top: start.y,
        radius: 1,
        startAngle: 0,
        endAngle: Math.PI, // semicircle
      });
      (arcCircle as any).isArc = true;
      (arcCircle as any).arcStart = start;
      return arcCircle;

    default:
      return null;
  }
}

function updateShape(
  tool: DrawingToolType,
  shape: FabricObject,
  start: DrawingPoint,
  current: DrawingPoint,
  fabric: any
): void {
  const width = current.x - start.x;
  const height = current.y - start.y;

  switch (tool) {
    case 'rectangle':
      shape.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width > 0 ? start.x : current.x,
        top: height > 0 ? start.y : current.y,
      });
      break;

    case 'circle':
      const radius = Math.sqrt(width * width + height * height) / 2;
      shape.set({
        radius,
        left: start.x - radius,
        top: start.y - radius,
      });
      break;

    case 'ellipse':
      shape.set({
        rx: Math.abs(width) / 2,
        ry: Math.abs(height) / 2,
        left: width > 0 ? start.x : current.x,
        top: height > 0 ? start.y : current.y,
      });
      break;

    case 'line':
      shape.set({
        x2: current.x,
        y2: current.y,
      });
      break;

    case 'triangle':
      shape.set({
        width: Math.abs(width),
        height: Math.abs(height),
        left: width > 0 ? start.x : current.x,
        top: height > 0 ? start.y : current.y,
      });
      break;

    case 'arc':
      // Create a semicircle arc from start to current position
      // We draw this as a circle positioned between start and end
      const arcRadius = Math.sqrt(width * width + height * height) / 2;
      const midX = (start.x + current.x) / 2;
      const midY = (start.y + current.y) / 2;
      shape.set({
        radius: arcRadius,
        left: midX - arcRadius,
        top: midY - arcRadius,
      });
      break;
  }
}

function createDimensionLine(
  start: DrawingPoint,
  end: DrawingPoint,
  label: string,
  fabric: any,
  style: any
): FabricObject {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

  // Main line
  const line = new fabric.Line([start.x, start.y, end.x, end.y], {
    stroke: style.strokeColor || '#000000',
    strokeWidth: 1,
  });

  // End ticks
  const tickLength = 10;
  const perpAngle = (angle + 90) * (Math.PI / 180);

  const tick1 = new fabric.Line([
    start.x - Math.cos(perpAngle) * tickLength,
    start.y - Math.sin(perpAngle) * tickLength,
    start.x + Math.cos(perpAngle) * tickLength,
    start.y + Math.sin(perpAngle) * tickLength,
  ], {
    stroke: style.strokeColor || '#000000',
    strokeWidth: 1,
  });

  const tick2 = new fabric.Line([
    end.x - Math.cos(perpAngle) * tickLength,
    end.y - Math.sin(perpAngle) * tickLength,
    end.x + Math.cos(perpAngle) * tickLength,
    end.y + Math.sin(perpAngle) * tickLength,
  ], {
    stroke: style.strokeColor || '#000000',
    strokeWidth: 1,
  });

  // Label
  const text = new fabric.Text(label, {
    left: midX,
    top: midY - 15,
    fontSize: 12,
    fontFamily: 'Arial',
    fill: style.strokeColor || '#000000',
    textAlign: 'center',
    originX: 'center',
  });

  return new fabric.Group([line, tick1, tick2, text], {
    selectable: true,
  });
}

function drawGrid(canvas: FabricCanvas, size: number, color: string): void {
  const width = canvas.getWidth();
  const height = canvas.getHeight();

  for (let i = 0; i < width / size; i++) {
    const line = new (window as any).fabric.Line([i * size, 0, i * size, height], {
      stroke: color,
      strokeWidth: 0.5,
      selectable: false,
      evented: false,
      isGrid: true,
    });
    canvas.add(line);
    canvas.sendToBack(line);
  }

  for (let i = 0; i < height / size; i++) {
    const line = new (window as any).fabric.Line([0, i * size, width, i * size], {
      stroke: color,
      strokeWidth: 0.5,
      selectable: false,
      evented: false,
      isGrid: true,
    });
    canvas.add(line);
    canvas.sendToBack(line);
  }
}

function calculateDistance(start: DrawingPoint, end: DrawingPoint, pixelsPerFoot: number): string {
  const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
  const feet = distance / pixelsPerFoot;
  if (feet >= 1) {
    return `${feet.toFixed(1)}'`;
  } else {
    const inches = feet * 12;
    return `${inches.toFixed(1)}"`;
  }
}

function fabricObjectToDrawingObject(obj: FabricObject, layer: DrawingLayerType): DrawingObject {
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
