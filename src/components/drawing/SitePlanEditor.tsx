'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import DrawingCanvas from './DrawingCanvas';
import DrawingToolbar, { TOOL_PROMPTS } from './DrawingToolbar';
import MeasurementInput, { Measurement } from './MeasurementInput';
import LabelInput, { Label } from './LabelInput';
import BackgroundImageControls, {
  BackgroundImageSettings,
  DEFAULT_BACKGROUND_SETTINGS,
} from './BackgroundImageControls';
import type { SitePlanDrawing, ParcelData, DrawingToolType, DrawingPoint } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface SitePlanEditorProps {
  onSave?: (drawing: SitePlanDrawing) => void;
  onExport?: (imageData: string) => void;
}

export default function SitePlanEditor({ onSave, onExport }: SitePlanEditorProps) {
  const { drawingState, initializeDrawing, saveDrawing, updateDrawingScale } = useStore();
  const { currentDrawing, savedDrawings } = drawingState;

  const [parcelNumber, setParcelNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [drawingName, setDrawingName] = useState('');
  const [showScaleDialog, setShowScaleDialog] = useState(false);
  const [scaleValue, setScaleValue] = useState('10');
  const [currentPrompt, setCurrentPrompt] = useState<string>(TOOL_PROMPTS['select']);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  // Measurement and label input state
  const [showMeasurementInput, setShowMeasurementInput] = useState(false);
  const [measurementData, setMeasurementData] = useState<{
    start: DrawingPoint;
    end: DrawingPoint;
    distance: number;
  } | null>(null);
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [labelPosition, setLabelPosition] = useState<DrawingPoint | null>(null);

  // Background image state
  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundImageSettings>(
    DEFAULT_BACKGROUND_SETTINGS
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcuts for tools
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const shortcuts: Record<string, DrawingToolType> = {
        'v': 'select',
        'h': 'pan',
        'r': 'rectangle',
        'c': 'circle',
        'l': 'line',
        'p': 'polyline',
        'g': 'polygon',
        't': 'text',
        'd': 'dimension',
        'b': 'freehand',
      };

      const tool = shortcuts[e.key.toLowerCase()];
      if (tool) {
        (window as any).drawingCanvas?.setTool?.(tool);
      }

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          (window as any).drawingCanvas?.undo?.();
        } else if (e.key === 'y') {
          e.preventDefault();
          (window as any).drawingCanvas?.redo?.();
        }
      }

      // Delete selected
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!(e.target instanceof HTMLInputElement)) {
          (window as any).drawingCanvas?.deleteSelected?.();
        }
      }

      // Escape to cancel
      if (e.key === 'Escape') {
        (window as any).drawingCanvas?.cancelCurrentOperation?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize drawing if none exists
  const handleNewDrawing = () => {
    initializeDrawing({
      id: uuidv4(),
      name: 'Untitled Site Plan',
      canvasWidth: 800,
      canvasHeight: 600,
      scale: {
        pixelsPerFoot: 10,
        displayUnit: 'feet',
        scaleRatio: '1 inch = 10 feet',
      },
      grid: {
        enabled: true,
        size: 20,
        snapToGrid: true,
        color: '#E5E7EB',
        opacity: 0.5,
      },
      layers: [
        { id: 'property_boundary', name: 'Property Boundary', visible: true, locked: false, opacity: 1, order: 1 },
        { id: 'existing_structures', name: 'Existing Structures', visible: true, locked: false, opacity: 1, order: 2 },
        { id: 'proposed_improvements', name: 'Proposed Improvements', visible: true, locked: false, opacity: 1, order: 3 },
        { id: 'dimensions', name: 'Dimensions', visible: true, locked: false, opacity: 1, order: 4 },
        { id: 'annotations', name: 'Annotations', visible: true, locked: false, opacity: 1, order: 5 },
      ],
      objects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Search for parcel data
  const handleParcelSearch = async () => {
    if (!parcelNumber.trim()) return;

    setIsSearching(true);
    setParcelError(null);

    try {
      // Pierce County GIS API endpoint
      const apiUrl = `https://gisdata.piercecountywa.gov/arcgis/rest/services/Property/Parcels/MapServer/0/query?where=PARCEL_ID='${encodeURIComponent(parcelNumber)}'&outFields=*&f=json`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const attributes = feature.attributes;
        const geometry = feature.geometry;

        // Convert geometry to drawing points if available
        const boundaryPoints = geometry?.rings?.[0]?.map((coord: number[]) => ({
          x: coord[0],
          y: coord[1],
        })) || [];

        const parcelData: ParcelData = {
          parcelNumber: attributes.PARCEL_ID || parcelNumber,
          ownerName: attributes.OWNER_NAME,
          address: attributes.SITE_ADDR,
          acreage: attributes.ACRES,
          boundaryCoordinates: boundaryPoints,
          fetchedAt: new Date().toISOString(),
          source: 'pierce_county',
        };

        // Update current drawing with parcel data
        if (currentDrawing) {
          initializeDrawing({
            ...currentDrawing,
            parcelData,
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setParcelError('Parcel not found. Please check the parcel number.');
      }
    } catch (error) {
      console.error('Error fetching parcel data:', error);
      setParcelError('Unable to fetch parcel data. You can continue with manual entry.');
    } finally {
      setIsSearching(false);
    }
  };

  // Import aerial image (quick add)
  const handleImportImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      (window as any).drawingCanvas?.addImage?.(imageData);
    };
    reader.readAsDataURL(file);
  };

  // Background image handlers
  const handleBackgroundSettingsChange = (newSettings: BackgroundImageSettings) => {
    setBackgroundSettings(newSettings);

    // Live preview - update background image as settings change
    if (newSettings.imageData) {
      (window as any).drawingCanvas?.updateBackgroundImage?.({
        opacity: newSettings.opacity,
        scale: newSettings.scale,
        offsetX: newSettings.offsetX,
        offsetY: newSettings.offsetY,
        rotation: newSettings.rotation,
        locked: newSettings.locked,
      });
    }
  };

  const handleApplyBackground = () => {
    if (backgroundSettings.imageData) {
      (window as any).drawingCanvas?.setBackgroundImage?.(
        backgroundSettings.imageData,
        {
          opacity: backgroundSettings.opacity,
          scale: backgroundSettings.scale,
          offsetX: backgroundSettings.offsetX,
          offsetY: backgroundSettings.offsetY,
          rotation: backgroundSettings.rotation,
          locked: backgroundSettings.locked,
        }
      );
    }
  };

  // Handle dimension request from canvas
  const handleDimensionRequest = (start: DrawingPoint, end: DrawingPoint, distance: number) => {
    setMeasurementData({ start, end, distance });
    setShowMeasurementInput(true);
  };

  // Handle measurement input submission
  const handleMeasurementSubmit = (measurement: Measurement) => {
    if (measurementData) {
      (window as any).drawingCanvas?.addMeasurement?.(
        measurementData.start,
        measurementData.end,
        measurement
      );
    }
    setShowMeasurementInput(false);
    setMeasurementData(null);
  };

  // Handle label request from canvas
  const handleLabelRequest = (position: DrawingPoint) => {
    setLabelPosition(position);
    setShowLabelInput(true);
  };

  // Handle label input submission
  const handleLabelSubmit = (label: Label) => {
    if (labelPosition) {
      (window as any).drawingCanvas?.addLabel?.(label.text, labelPosition, label.style);
    }
    setShowLabelInput(false);
    setLabelPosition(null);
  };

  // Add text annotation (quick add via toolbar button)
  const handleAddText = () => {
    setLabelPosition({ x: 400, y: 300 }); // Center of canvas
    setShowLabelInput(true);
  };

  // Add measurement (via toolbar button)
  const handleAddMeasurement = () => {
    (window as any).drawingCanvas?.setTool?.('dimension');
  };

  // Save drawing
  const handleSave = () => {
    if (!currentDrawing) return;

    const json = (window as any).drawingCanvas?.exportToJSON?.();
    const image = (window as any).drawingCanvas?.exportToImage?.();

    if (json && image) {
      const updatedDrawing: SitePlanDrawing = {
        ...currentDrawing,
        name: drawingName || currentDrawing.name,
        fabricCanvasJson: json,
        exportedImage: image,
        updatedAt: new Date().toISOString(),
      };

      saveDrawing(updatedDrawing);
      onSave?.(updatedDrawing);
      setShowSaveDialog(false);
    }
  };

  // Export drawing
  const handleExport = () => {
    const image = (window as any).drawingCanvas?.exportToImage?.();
    if (image) {
      onExport?.(image);

      // Also trigger download
      const link = document.createElement('a');
      link.download = `${currentDrawing?.name || 'site-plan'}.png`;
      link.href = image;
      link.click();
    }
  };

  // Update scale
  const handleScaleUpdate = () => {
    const pixels = parseInt(scaleValue) || 10;
    updateDrawingScale({
      pixelsPerFoot: pixels,
      displayUnit: 'feet',
      scaleRatio: `1 inch = ${Math.round(96 / pixels)} feet`,
    });
    setShowScaleDialog(false);
  };

  // Load saved drawing
  const handleLoadDrawing = (drawing: SitePlanDrawing) => {
    initializeDrawing(drawing);
    if (drawing.fabricCanvasJson) {
      setTimeout(() => {
        (window as any).drawingCanvas?.loadFromJSON?.(drawing.fabricCanvasJson);
      }, 100);
    }
  };

  return (
    <div className="site-plan-editor">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Site Plan Drawing</h2>
          <p className="text-sm text-slate-600">
            Draw your property layout and proposed improvements
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleNewDrawing} className="btn btn-secondary btn-sm">
            New
          </button>
          <button onClick={() => setShowSaveDialog(true)} className="btn btn-secondary btn-sm">
            Save
          </button>
          <button onClick={handleExport} className="btn btn-primary btn-sm">
            Export
          </button>
        </div>
      </div>

      {/* Parcel Search */}
      <div className="card mb-4">
        <h3 className="font-medium text-slate-900 mb-3">Property Information</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={parcelNumber}
            onChange={(e) => setParcelNumber(e.target.value)}
            placeholder="Enter Pierce County Parcel Number"
            className="flex-1"
          />
          <button
            onClick={handleParcelSearch}
            disabled={isSearching}
            className="btn btn-secondary"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {parcelError && (
          <p className="text-sm text-amber-600 mt-2">{parcelError}</p>
        )}
        {currentDrawing?.parcelData && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-sm text-emerald-800">
              <strong>Parcel Found:</strong> {currentDrawing.parcelData.parcelNumber}
            </p>
            {currentDrawing.parcelData.address && (
              <p className="text-sm text-emerald-700">
                Address: {currentDrawing.parcelData.address}
              </p>
            )}
            {currentDrawing.parcelData.acreage && (
              <p className="text-sm text-emerald-700">
                Size: {currentDrawing.parcelData.acreage.toFixed(2)} acres
              </p>
            )}
          </div>
        )}
      </div>

      {/* Drawing Area */}
      <div className="flex gap-4">
        {/* Left Panel - Toolbar and Background Controls */}
        <div className="w-64 flex-shrink-0 space-y-4">
          <DrawingToolbar onPromptChange={setCurrentPrompt} />

          {/* Background Image Controls */}
          <BackgroundImageControls
            settings={backgroundSettings}
            onSettingsChange={handleBackgroundSettingsChange}
            onApplyAsBackground={handleApplyBackground}
          />
        </div>

        {/* Canvas */}
        <div className="flex-1">
          {/* Canvas Toolbar */}
          <div className="flex items-center justify-between mb-2 p-2 bg-slate-100 rounded-lg">
            <div className="flex gap-2">
              <button onClick={handleImportImage} className="btn btn-sm btn-secondary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Import Image
              </button>
              <button onClick={handleAddText} className="btn btn-sm btn-secondary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Add Label
              </button>
              <button onClick={handleAddMeasurement} className="btn btn-sm btn-secondary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Add Measurement
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelected}
                className="hidden"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">
                Scale: {currentDrawing?.scale?.scaleRatio || '1 inch = 10 feet'}
              </span>
              <button
                onClick={() => setShowScaleDialog(true)}
                className="btn btn-sm btn-secondary"
              >
                Change
              </button>
            </div>
          </div>

          {/* Canvas Container */}
          <DrawingCanvas
            width={800}
            height={600}
            onObjectsChange={(_objects) => {
              // Handle objects change
            }}
            onCursorMove={setCursorPosition}
            onStatusChange={(_status) => {
              // Could update a secondary status if needed
            }}
            onDimensionRequest={handleDimensionRequest}
            onLabelRequest={handleLabelRequest}
          />

          {/* Canvas Footer - OMAX Layout Style Status Bar */}
          <div className="mt-2 bg-slate-800 text-white rounded-lg overflow-hidden">
            {/* Command Prompt Line */}
            <div className="px-3 py-2 bg-slate-900 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400">COMMAND:</span>
                <span className="text-sm font-mono text-white">
                  {currentPrompt}
                </span>
              </div>
            </div>
            {/* Status Line */}
            <div className="px-3 py-1.5 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-4">
                <span className="text-slate-400">
                  Objects: <span className="text-white">{currentDrawing?.objects.length || 0}</span>
                </span>
                <span className="text-slate-400">
                  Layer: <span className="text-blue-400">{drawingState.activeLayer.replace('_', ' ')}</span>
                </span>
                <span className="text-slate-400">
                  Tool: <span className="text-yellow-400">{drawingState.activeTool}</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                {cursorPosition && (
                  <span className="text-slate-400">
                    X: <span className="text-white">{cursorPosition.x.toFixed(1)}</span>
                    {' '}Y: <span className="text-white">{cursorPosition.y.toFixed(1)}</span>
                  </span>
                )}
                <span className="text-slate-400">
                  Scale: <span className="text-white">{currentDrawing?.scale?.scaleRatio || '1:10'}</span>
                </span>
                {drawingState.isModified && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                    Modified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Drawings */}
      {savedDrawings.length > 0 && (
        <div className="mt-6">
          <h3 className="font-medium text-slate-900 mb-3">Saved Drawings</h3>
          <div className="grid grid-cols-3 gap-4">
            {savedDrawings.map((drawing) => (
              <button
                key={drawing.id}
                onClick={() => handleLoadDrawing(drawing)}
                className="card card-hover text-left"
              >
                {drawing.exportedImage && (
                  <img
                    src={drawing.exportedImage}
                    alt={drawing.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <p className="font-medium text-slate-900">{drawing.name}</p>
                <p className="text-sm text-slate-500">
                  {new Date(drawing.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="modal-overlay" onClick={() => setShowSaveDialog(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Save Drawing</h3>
            <input
              type="text"
              value={drawingName}
              onChange={(e) => setDrawingName(e.target.value)}
              placeholder="Drawing name"
              className="w-full mb-4"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowSaveDialog(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary">
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scale Dialog */}
      {showScaleDialog && (
        <div className="modal-overlay" onClick={() => setShowScaleDialog(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Set Drawing Scale</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Pixels per Foot
              </label>
              <input
                type="number"
                value={scaleValue}
                onChange={(e) => setScaleValue(e.target.value)}
                min="1"
                max="100"
                className="w-full"
              />
              <p className="text-sm text-slate-500 mt-1">
                Higher values = more detail, smaller drawing area
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowScaleDialog(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleScaleUpdate} className="btn btn-primary">
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Input Dialog */}
      <MeasurementInput
        isOpen={showMeasurementInput}
        onClose={() => {
          setShowMeasurementInput(false);
          setMeasurementData(null);
        }}
        onSubmit={handleMeasurementSubmit}
        title="Enter Measurement"
        calculatedDistance={measurementData?.distance}
        pixelsPerFoot={currentDrawing?.scale?.pixelsPerFoot || 10}
      />

      {/* Label Input Dialog */}
      <LabelInput
        isOpen={showLabelInput}
        onClose={() => {
          setShowLabelInput(false);
          setLabelPosition(null);
        }}
        onSubmit={handleLabelSubmit}
        title="Add Label"
      />
    </div>
  );
}
