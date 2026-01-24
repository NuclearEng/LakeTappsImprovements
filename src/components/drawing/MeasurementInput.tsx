'use client';

import { useState, useEffect, useRef } from 'react';

export type MeasurementUnit = 'feet' | 'inches' | 'meters' | 'centimeters';

export interface Measurement {
  value: number;
  unit: MeasurementUnit;
  displayText: string;
}

interface MeasurementInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (measurement: Measurement) => void;
  initialValue?: number;
  initialUnit?: MeasurementUnit;
  title?: string;
  position?: { x: number; y: number };
  calculatedDistance?: number; // Auto-calculated distance in pixels
  pixelsPerFoot?: number; // Current scale
}

const UNIT_CONVERSIONS: Record<MeasurementUnit, number> = {
  feet: 1,
  inches: 12,
  meters: 0.3048,
  centimeters: 30.48,
};

const UNIT_SYMBOLS: Record<MeasurementUnit, string> = {
  feet: "'",
  inches: '"',
  meters: 'm',
  centimeters: 'cm',
};

export default function MeasurementInput({
  isOpen,
  onClose,
  onSubmit,
  initialValue = 0,
  initialUnit = 'feet',
  title = 'Enter Measurement',
  position,
  calculatedDistance,
  pixelsPerFoot = 10,
}: MeasurementInputProps) {
  const [value, setValue] = useState<string>(initialValue.toString());
  const [unit, setUnit] = useState<MeasurementUnit>(initialUnit);
  const [useCalculated, setUseCalculated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate the auto-measured value based on scale
  const autoMeasuredValue = calculatedDistance
    ? (calculatedDistance / pixelsPerFoot).toFixed(2)
    : null;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && autoMeasuredValue && useCalculated) {
      setValue(autoMeasuredValue);
    }
  }, [isOpen, autoMeasuredValue, useCalculated]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value) || 0;
    const displayText = `${numValue}${UNIT_SYMBOLS[unit]}`;
    onSubmit({ value: numValue, unit, displayText });
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
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
          position ? 'absolute z-50' : 'modal-content'
        }`}
        style={dialogStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">{title}</h3>

          <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            {/* Auto-calculated toggle */}
            {autoMeasuredValue && (
              <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCalculated}
                    onChange={(e) => {
                      setUseCalculated(e.target.checked);
                      if (e.target.checked) {
                        setValue(autoMeasuredValue);
                      }
                    }}
                    className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-blue-800">
                    Use measured distance: <strong>{autoMeasuredValue}&apos;</strong>
                  </span>
                </label>
              </div>
            )}

            {/* Manual input */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Value
                </label>
                <input
                  ref={inputRef}
                  type="number"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    setUseCalculated(false);
                  }}
                  step="0.01"
                  min="0"
                  className="w-full text-lg font-mono"
                  placeholder="0.00"
                />
              </div>
              <div className="w-28">
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as MeasurementUnit)}
                  className="w-full"
                >
                  <option value="feet">Feet (&apos;)</option>
                  <option value="inches">Inches (&quot;)</option>
                  <option value="meters">Meters (m)</option>
                  <option value="centimeters">Centimeters (cm)</option>
                </select>
              </div>
            </div>

            {/* Preview */}
            <div className="mb-3 p-2 bg-slate-100 rounded text-center">
              <span className="text-lg font-semibold text-slate-900">
                {parseFloat(value) || 0}{UNIT_SYMBOLS[unit]}
              </span>
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
              <button type="submit" className="btn btn-primary btn-sm">
                Apply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
