'use client';

import { useState, useEffect, useRef } from 'react';

export interface LabelStyle {
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  color: string;
  backgroundColor: string;
  hasBackground: boolean;
  hasOutline: boolean;
  outlineColor: string;
}

export interface Label {
  text: string;
  style: LabelStyle;
}

interface LabelInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (label: Label) => void;
  initialText?: string;
  initialStyle?: Partial<LabelStyle>;
  title?: string;
  position?: { x: number; y: number };
  multiline?: boolean;
}

const DEFAULT_STYLE: LabelStyle = {
  fontSize: 14,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#000000',
  backgroundColor: '#FFFFFF',
  hasBackground: false,
  hasOutline: false,
  outlineColor: '#000000',
};

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
];

const PRESET_LABELS = [
  'PROPERTY LINE',
  'SETBACK',
  'EXISTING DOCK',
  'PROPOSED DOCK',
  'SHORELINE',
  'HIGH WATER LINE (544\')',
  'PROPOSED IMPROVEMENTS',
  'EXISTING STRUCTURE',
  'UTILITIES',
  'DRIVEWAY',
  'WALKWAY',
  'DECK',
  'PATIO',
  'FENCE',
  'BOAT LIFT',
  'SWIM FLOAT',
];

export default function LabelInput({
  isOpen,
  onClose,
  onSubmit,
  initialText = '',
  initialStyle = {},
  title = 'Add Label',
  position,
  multiline = false,
}: LabelInputProps) {
  const [text, setText] = useState(initialText);
  const [style, setStyle] = useState<LabelStyle>({ ...DEFAULT_STYLE, ...initialStyle });
  const [showPresets, setShowPresets] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setText(initialText);
    setStyle({ ...DEFAULT_STYLE, ...initialStyle });
  }, [initialText, initialStyle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ text: text.trim(), style });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && !multiline && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  const handlePresetSelect = (preset: string) => {
    setText(preset);
    setShowPresets(false);
  };

  const updateStyle = (updates: Partial<LabelStyle>) => {
    setStyle((prev) => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  const dialogStyle = position
    ? {
        position: 'fixed' as const,
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }
    : {};

  return (
    <div
      className={position ? '' : 'modal-overlay'}
      onClick={position ? undefined : onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl border border-slate-200 ${
          position ? 'absolute z-50 w-80' : 'modal-content max-w-md'
        }`}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {/* Text Input */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Label Text
              </label>
              {multiline ? (
                <textarea
                  ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  className="w-full resize-none"
                  placeholder="Enter label text..."
                />
              ) : (
                <input
                  ref={inputRef as React.RefObject<HTMLInputElement>}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full"
                  placeholder="Enter label text..."
                />
              )}
            </div>

            {/* Preset Labels */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setShowPresets(!showPresets)}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Common Labels
              </button>
              {showPresets && (
                <div className="mt-2 max-h-32 overflow-y-auto border border-slate-200 rounded p-1">
                  <div className="flex flex-wrap gap-1">
                    {PRESET_LABELS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className="px-2 py-0.5 text-xs bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Style Options */}
            <div className="mb-3 space-y-2">
              <div className="flex gap-2">
                {/* Font Size */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Size
                  </label>
                  <select
                    value={style.fontSize}
                    onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })}
                    className="w-full text-sm"
                  >
                    {FONT_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}px
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Family */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Font
                  </label>
                  <select
                    value={style.fontFamily}
                    onChange={(e) => updateStyle({ fontFamily: e.target.value })}
                    className="w-full text-sm"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bold */}
                <div className="w-16">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Bold
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateStyle({
                        fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
                      })
                    }
                    className={`w-full h-9 rounded border ${
                      style.fontWeight === 'bold'
                        ? 'bg-primary-100 border-primary-500 text-primary-700'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    <strong>B</strong>
                  </button>
                </div>
              </div>

              {/* Colors */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={style.color}
                      onChange={(e) => updateStyle({ color: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={style.color}
                      onChange={(e) => updateStyle({ color: e.target.value })}
                      className="flex-1 text-xs font-mono"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>

              {/* Background */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={style.hasBackground}
                    onChange={(e) => updateStyle({ hasBackground: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-xs text-slate-600">Background</span>
                </label>
                {style.hasBackground && (
                  <input
                    type="color"
                    value={style.backgroundColor}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                  />
                )}
              </div>

              {/* Outline */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={style.hasOutline}
                    onChange={(e) => updateStyle({ hasOutline: e.target.checked })}
                    className="rounded border-slate-300"
                  />
                  <span className="text-xs text-slate-600">Outline</span>
                </label>
                {style.hasOutline && (
                  <input
                    type="color"
                    value={style.outlineColor}
                    onChange={(e) => updateStyle({ outlineColor: e.target.value })}
                    className="w-6 h-6 rounded border border-slate-300 cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-3 p-3 bg-slate-100 rounded">
              <p className="text-xs text-slate-500 mb-1">Preview:</p>
              <div
                className="inline-block px-1 py-0.5 rounded"
                style={{
                  fontFamily: style.fontFamily,
                  fontSize: `${style.fontSize}px`,
                  fontWeight: style.fontWeight,
                  color: style.color,
                  backgroundColor: style.hasBackground ? style.backgroundColor : 'transparent',
                  textShadow: style.hasOutline
                    ? `1px 1px 0 ${style.outlineColor}, -1px -1px 0 ${style.outlineColor}, 1px -1px 0 ${style.outlineColor}, -1px 1px 0 ${style.outlineColor}`
                    : 'none',
                }}
              >
                {text || 'Label Preview'}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!text.trim()}
                className="btn btn-primary btn-sm"
              >
                Add Label
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
