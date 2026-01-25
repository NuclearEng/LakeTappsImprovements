'use client';

import { useState, useRef } from 'react';

export interface BackgroundImageSettings {
  imageData: string | null;
  opacity: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
  locked: boolean;
}

interface BackgroundImageControlsProps {
  settings: BackgroundImageSettings;
  onSettingsChange: (settings: BackgroundImageSettings) => void;
  onApplyAsBackground: () => void;
}

const DEFAULT_SETTINGS: BackgroundImageSettings = {
  imageData: null,
  opacity: 0.5,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  rotation: 0,
  locked: false,
};

export default function BackgroundImageControls({
  settings,
  onSettingsChange,
  onApplyAsBackground,
}: BackgroundImageControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Maximum size is 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      onSettingsChange({
        ...settings,
        imageData,
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  const handleRemoveImage = () => {
    onSettingsChange(DEFAULT_SETTINGS);
  };

  const updateSetting = <K extends keyof BackgroundImageSettings>(
    key: K,
    value: BackgroundImageSettings[K]
  ) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const handleQuickAlign = (position: 'center' | 'top-left' | 'fit-width' | 'fit-height') => {
    switch (position) {
      case 'center':
        updateSetting('offsetX', 0);
        updateSetting('offsetY', 0);
        break;
      case 'top-left':
        // Negative offset to align to top-left
        onSettingsChange({
          ...settings,
          offsetX: -200,
          offsetY: -150,
        });
        break;
      case 'fit-width':
        onSettingsChange({
          ...settings,
          scale: 1,
          offsetX: 0,
        });
        break;
      case 'fit-height':
        onSettingsChange({
          ...settings,
          scale: 1,
          offsetY: 0,
        });
        break;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-slate-700">Background Image</span>
          {settings.imageData && (
            <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded-full">
              Loaded
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Upload Section */}
          {!settings.imageData ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Upload an aerial photo, survey, or site plan image to use as a tracing background.
              </p>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="dropzone p-6 cursor-pointer"
              >
                <div className="text-center">
                  <svg className="w-10 h-10 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="text-sm text-slate-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <>
              {/* Preview */}
              <div className="relative">
                <img
                  src={settings.imageData}
                  alt="Background preview"
                  className="w-full h-32 object-contain rounded border border-slate-200 bg-slate-50"
                  style={{ opacity: settings.opacity }}
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="Remove image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Alignment Controls */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quick Align
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleQuickAlign('center')}
                    className="btn btn-sm btn-secondary"
                    title="Center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleQuickAlign('top-left')}
                    className="btn btn-sm btn-secondary"
                    title="Top Left"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleQuickAlign('fit-width')}
                    className="btn btn-sm btn-secondary"
                    title="Fit Width"
                  >
                    W
                  </button>
                  <button
                    onClick={() => handleQuickAlign('fit-height')}
                    className="btn btn-sm btn-secondary"
                    title="Fit Height"
                  >
                    H
                  </button>
                </div>
              </div>

              {/* Opacity Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Opacity</label>
                  <span className="text-sm text-slate-500">{Math.round(settings.opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.opacity}
                  onChange={(e) => updateSetting('opacity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Scale Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Scale</label>
                  <span className="text-sm text-slate-500">{Math.round(settings.scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.05"
                  value={settings.scale}
                  onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Position Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    X Offset
                  </label>
                  <input
                    type="number"
                    value={settings.offsetX}
                    onChange={(e) => updateSetting('offsetX', parseInt(e.target.value) || 0)}
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Y Offset
                  </label>
                  <input
                    type="number"
                    value={settings.offsetY}
                    onChange={(e) => updateSetting('offsetY', parseInt(e.target.value) || 0)}
                    className="w-full text-sm"
                  />
                </div>
              </div>

              {/* Rotation */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-slate-700">Rotation</label>
                  <span className="text-sm text-slate-500">{settings.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  value={settings.rotation}
                  onChange={(e) => updateSetting('rotation', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>-180°</span>
                  <button
                    onClick={() => updateSetting('rotation', 0)}
                    className="text-primary-600 hover:underline"
                  >
                    Reset
                  </button>
                  <span>180°</span>
                </div>
              </div>

              {/* Lock Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-700">Lock Image</span>
                  <p className="text-xs text-slate-500">Prevent accidental movement</p>
                </div>
                <button
                  onClick={() => updateSetting('locked', !settings.locked)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.locked ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.locked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Apply Button */}
              <button
                onClick={onApplyAsBackground}
                className="btn btn-primary w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply Background
              </button>
            </>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-blue-800">
                <p className="font-medium">Tips for best results:</p>
                <ul className="text-xs mt-1 space-y-0.5">
                  <li>• Use aerial photos from Pierce County GIS for accurate property boundaries</li>
                  <li>• Adjust opacity to make tracing easier</li>
                  <li>• Lock the image before drawing to prevent accidental movement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_SETTINGS as DEFAULT_BACKGROUND_SETTINGS };
