'use client';

import { useStore } from '@/store/useStore';
import type { DrawingToolType, DrawingLayerType } from '@/types';
import { useMemo } from 'react';

// Tool prompts similar to OMAX Layout - clear guidance for each tool action
const TOOL_PROMPTS: Record<DrawingToolType, string> = {
  select: 'Click to select objects. Drag to move. Shift+click for multiple selection.',
  pan: 'Click and drag to pan around the canvas.',
  rectangle: 'Click and drag to draw a rectangle. Hold Shift for square.',
  circle: 'Click center point, then drag to set radius.',
  ellipse: 'Click and drag to draw an ellipse. Hold Shift for circle.',
  line: 'Click start point, then click end point to draw line.',
  triangle: 'Click and drag to draw a triangle.',
  polyline: 'Click to add points. Double-click to finish. ESC to cancel.',
  polygon: 'Click to add vertices. Double-click to close shape.',
  arc: 'Click center, then start point, then end point for arc.',
  curve: 'Click start, control point, then end point for bezier curve.',
  spline: 'Click to add control points. Double-click to finish spline.',
  dimension: 'Click two points to create a dimension line with measurement.',
  text: 'Click to place text. Type your annotation and press Enter.',
  image: 'Click to place imported image on canvas.',
  freehand: 'Click and drag to draw freehand. Release to finish.',
};

// Keyboard shortcuts
const TOOL_SHORTCUTS: Partial<Record<DrawingToolType, string>> = {
  select: 'V',
  pan: 'H',
  rectangle: 'R',
  circle: 'C',
  line: 'L',
  polyline: 'P',
  polygon: 'G',
  text: 'T',
  dimension: 'D',
  freehand: 'B',
};

interface ToolButtonProps {
  tool: DrawingToolType;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  shortcut?: string;
}

function ToolButton({ tool, icon, label, active, onClick, shortcut }: ToolButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all flex flex-col items-center gap-1 relative ${
        active
          ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-500'
          : 'hover:bg-slate-100 text-slate-600'
      }`}
      title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      aria-label={label}
      data-tool={tool}
    >
      {icon}
      <span className="text-xs">{label}</span>
      {shortcut && (
        <span className="absolute -top-1 -right-1 bg-slate-600 text-white text-[10px] px-1 rounded">
          {shortcut}
        </span>
      )}
    </button>
  );
}

interface DrawingToolbarProps {
  onPromptChange?: (prompt: string) => void;
}

export default function DrawingToolbar({ onPromptChange }: DrawingToolbarProps) {
  const {
    drawingState,
    setActiveTool,
    setActiveLayer,
    setActiveStyle,
  } = useStore();

  const { activeTool, activeLayer, activeStyle, selectedObjectIds, isModified } = drawingState;

  // Current tool prompt for status bar
  const currentPrompt = useMemo(() => TOOL_PROMPTS[activeTool], [activeTool]);

  // Notify parent of prompt changes
  useMemo(() => {
    onPromptChange?.(currentPrompt);
  }, [currentPrompt, onPromptChange]);

  // Handle tool selection with prompt update
  const handleToolSelect = (tool: DrawingToolType) => {
    setActiveTool(tool);
  };

  const tools: { category: string; items: { tool: DrawingToolType; label: string; icon: React.ReactNode }[] }[] = [
    {
      category: 'Select',
      items: [
        {
          tool: 'select',
          label: 'Select',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          ),
        },
        {
          tool: 'pan',
          label: 'Pan',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
            </svg>
          ),
        },
      ],
    },
    {
      category: 'Basic Shapes',
      items: [
        {
          tool: 'rectangle',
          label: 'Rectangle',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
            </svg>
          ),
        },
        {
          tool: 'circle',
          label: 'Circle',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" strokeWidth={2} />
            </svg>
          ),
        },
        {
          tool: 'ellipse',
          label: 'Ellipse',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <ellipse cx="12" cy="12" rx="10" ry="6" strokeWidth={2} />
            </svg>
          ),
        },
        {
          tool: 'line',
          label: 'Line',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <line x1="4" y1="20" x2="20" y2="4" strokeWidth={2} strokeLinecap="round" />
            </svg>
          ),
        },
        {
          tool: 'triangle',
          label: 'Triangle',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L22 21H2L12 3Z" strokeWidth={2} strokeLinejoin="round" />
            </svg>
          ),
        },
      ],
    },
    {
      category: 'Curves & Polygons',
      items: [
        {
          tool: 'polyline',
          label: 'Polyline',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polyline points="4,20 8,10 14,16 20,4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
        },
        {
          tool: 'polygon',
          label: 'Polygon',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <polygon points="12,2 22,8.5 18,21 6,21 2,8.5" strokeWidth={2} />
            </svg>
          ),
        },
        {
          tool: 'arc',
          label: 'Arc',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 12 A8 8 0 0 1 20 12" strokeWidth={2} strokeLinecap="round" />
            </svg>
          ),
        },
        {
          tool: 'curve',
          label: 'Curve',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 20 Q12 4 20 20" strokeWidth={2} strokeLinecap="round" />
            </svg>
          ),
        },
      ],
    },
    {
      category: 'Annotation',
      items: [
        {
          tool: 'dimension',
          label: 'Dimension',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          ),
        },
        {
          tool: 'text',
          label: 'Text',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          ),
        },
        {
          tool: 'freehand',
          label: 'Freehand',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          ),
        },
      ],
    },
  ];

  const layers: { id: DrawingLayerType; name: string; color: string }[] = [
    { id: 'property_boundary', name: 'Property Boundary', color: '#EF4444' },
    { id: 'existing_structures', name: 'Existing Structures', color: '#6B7280' },
    { id: 'proposed_improvements', name: 'Proposed Improvements', color: '#3B82F6' },
    { id: 'dimensions', name: 'Dimensions', color: '#000000' },
    { id: 'annotations', name: 'Annotations', color: '#10B981' },
  ];

  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF',
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899',
  ];

  const strokeWidths = [1, 2, 3, 4, 6, 8];

  return (
    <div className="drawing-toolbar bg-white border border-slate-200 rounded-lg p-3">
      {/* Tools */}
      <div className="space-y-4">
        {tools.map((category) => (
          <div key={category.category}>
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">
              {category.category}
            </div>
            <div className="flex flex-wrap gap-1">
              {category.items.map((item) => (
                <ToolButton
                  key={item.tool}
                  tool={item.tool}
                  icon={item.icon}
                  label={item.label}
                  active={activeTool === item.tool}
                  onClick={() => handleToolSelect(item.tool)}
                  shortcut={TOOL_SHORTCUTS[item.tool]}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <hr className="my-4 border-slate-200" />

      {/* Style Options */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-slate-500 uppercase">Style</div>

        {/* Stroke Color */}
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Stroke Color</label>
          <div className="flex flex-wrap gap-1">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setActiveStyle({ ...activeStyle, strokeColor: color })}
                className={`w-6 h-6 rounded border-2 ${
                  activeStyle.strokeColor === color ? 'border-primary-500' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Fill Color */}
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Fill Color</label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveStyle({ ...activeStyle, fillColor: 'transparent' })}
              className={`w-6 h-6 rounded border-2 ${
                activeStyle.fillColor === 'transparent' ? 'border-primary-500' : 'border-slate-300'
              }`}
              title="No fill"
            >
              <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24">
                <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setActiveStyle({ ...activeStyle, fillColor: color })}
                className={`w-6 h-6 rounded border-2 ${
                  activeStyle.fillColor === color ? 'border-primary-500' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div>
          <label className="text-xs text-slate-600 mb-1 block">Stroke Width</label>
          <div className="flex gap-1">
            {strokeWidths.map((width) => (
              <button
                key={width}
                onClick={() => setActiveStyle({ ...activeStyle, strokeWidth: width })}
                className={`w-8 h-8 rounded flex items-center justify-center ${
                  activeStyle.strokeWidth === width
                    ? 'bg-primary-100 text-primary-700'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
                title={`${width}px`}
              >
                <div
                  className="bg-current rounded-full"
                  style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Fill Opacity */}
        <div>
          <label className="text-xs text-slate-600 mb-1 block">
            Fill Opacity: {Math.round(activeStyle.fillOpacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={activeStyle.fillOpacity}
            onChange={(e) => setActiveStyle({ ...activeStyle, fillOpacity: parseFloat(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      {/* Divider */}
      <hr className="my-4 border-slate-200" />

      {/* Layers */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase">Layer</div>
        <div className="space-y-1">
          {layers.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`w-full px-2 py-1.5 rounded text-left text-sm flex items-center gap-2 ${
                activeLayer === layer.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: layer.color }}
              />
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <hr className="my-4 border-slate-200" />

      {/* Actions */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase">Actions</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => (window as any).drawingCanvas?.undo?.()}
            className="btn btn-sm btn-secondary"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Undo
          </button>
          <button
            onClick={() => (window as any).drawingCanvas?.redo?.()}
            className="btn btn-sm btn-secondary"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
            Redo
          </button>
          <button
            onClick={() => (window as any).drawingCanvas?.deleteSelected?.()}
            className="btn btn-sm btn-secondary text-red-600"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
          <button
            onClick={() => {
              if (confirm('Clear all drawings?')) {
                (window as any).drawingCanvas?.clearCanvas?.();
              }
            }}
            className="btn btn-sm btn-secondary text-red-600"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        </div>
      </div>
      {/* Status/Prompt Bar - OMAX Layout Style */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="text-xs font-semibold text-slate-500 uppercase mb-1">
          Command Prompt
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {currentPrompt}
        </p>
        {selectedObjectIds.length > 0 && (
          <p className="text-xs text-primary-600 mt-2">
            {selectedObjectIds.length} object(s) selected
          </p>
        )}
        {isModified && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Unsaved changes
          </p>
        )}
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-xs font-semibold text-blue-600 uppercase mb-2">
          Quick Tips
        </div>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• ESC to cancel current operation</li>
          <li>• Delete/Backspace to remove selected</li>
          <li>• Ctrl+Z to undo, Ctrl+Y to redo</li>
          <li>• Hold Shift for constrained shapes</li>
        </ul>
      </div>
    </div>
  );
}

// Export the prompts for use in other components
export { TOOL_PROMPTS };
