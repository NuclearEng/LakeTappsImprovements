'use client';

import { useStore } from '@/store/useStore';
import { useCallback, useState, lazy, Suspense } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import type { UploadedFile, SitePlanDrawing } from '@/types';
import ParcelLookup from '@/components/forms/ParcelLookup';

// Lazy load the drawing editor to avoid SSR issues with Fabric.js
const SitePlanEditor = lazy(() => import('@/components/drawing/SitePlanEditor'));

const ACCEPTED_FILE_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.tif', '.bmp', '.heic', '.heif', '.svg'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/vnd.dwg': ['.dwg'],
  'image/vnd.dxf': ['.dxf'],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

type SiteInputMode = 'upload' | 'draw';

interface FileError {
  message: string;
  code: string;
}

export default function SiteInfoStage() {
  const { project, updateSiteInfo, saveProject, addNotification, saveDrawing, updateEnvironmental } = useStore();
  const [isUploading, setIsUploading] = useState(false);
  const [inputMode, setInputMode] = useState<SiteInputMode>('upload');

  // Get site from project, with fallback for hooks that need it
  const site = project?.site;

  const processFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve({
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64.split(',')[1], // Remove data URL prefix
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (!site) return;

    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const errors = rejection.errors.map((e: FileError) => e.message).join(', ');
      addNotification({
        type: 'error',
        title: 'File rejected',
        message: `${rejection.file.name}: ${errors}`,
        dismissible: true,
        duration: 5000,
      });
    });

    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedFiles = await Promise.all(acceptedFiles.map(processFile));
      updateSiteInfo({
        sitePlanFiles: [...(site.sitePlanFiles || []), ...uploadedFiles],
      });
      saveProject();

      addNotification({
        type: 'success',
        title: 'Files uploaded',
        message: `${acceptedFiles.length} file(s) uploaded successfully`,
        dismissible: true,
        duration: 3000,
      });
    } catch (_err) {
      addNotification({
        type: 'error',
        title: 'Upload failed',
        message: 'Failed to process one or more files',
        dismissible: true,
      });
    } finally {
      setIsUploading(false);
    }
  }, [site, updateSiteInfo, saveProject, addNotification]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

  // Early return AFTER all hooks
  if (!project || !site) return null;

  // Handle drawing save - convert to uploadable file
  const handleDrawingSave = (drawing: SitePlanDrawing) => {
    saveDrawing(drawing);

    // If there's an exported image, add it to site plan files
    if (drawing.exportedImage) {
      const drawingFile: UploadedFile = {
        id: `drawing-${drawing.id}`,
        name: `${drawing.name}.png`,
        type: 'image/png',
        size: drawing.exportedImage.length,
        data: drawing.exportedImage.split(',')[1] || drawing.exportedImage,
        uploadedAt: new Date().toISOString(),
        preview: drawing.exportedImage,
      };

      // Update or add the drawing file
      const existingFiles = site.sitePlanFiles || [];
      const existingIndex = existingFiles.findIndex((f) => f.id === drawingFile.id);

      if (existingIndex >= 0) {
        existingFiles[existingIndex] = drawingFile;
      } else {
        existingFiles.push(drawingFile);
      }

      updateSiteInfo({ sitePlanFiles: [...existingFiles] });
      saveProject();

      addNotification({
        type: 'success',
        title: 'Drawing saved',
        message: 'Your site plan drawing has been saved and added to your documents.',
        dismissible: true,
        duration: 3000,
      });
    }
  };

  // Handle drawing export
  const handleDrawingExport = (_imageData: string) => {
    addNotification({
      type: 'success',
      title: 'Drawing exported',
      message: 'Your site plan has been exported as an image.',
      dismissible: true,
      duration: 3000,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSiteInfo({ [name]: value });
  };

  const handleBlur = () => {
    saveProject();
  };

  const removeFile = (fileId: string) => {
    updateSiteInfo({
      sitePlanFiles: site.sitePlanFiles?.filter((f) => f.id !== fileId) || [],
    });
    saveProject();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Site Information
        </h1>
        <p className="text-slate-600">
          Provide information about the property location and upload site plans or documents.
        </p>
      </div>

      {/* Property Address */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Property Location</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="propertyAddress" className="block text-sm font-medium text-slate-700 mb-1">
              Property Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="propertyAddress"
              name="propertyAddress"
              value={site.propertyAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="123 Lakeside Drive"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="parcelNumber" className="block text-sm font-medium text-slate-700 mb-1">
              Parcel Number
            </label>
            <input
              type="text"
              id="parcelNumber"
              name="parcelNumber"
              value={site.parcelNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0123456789"
              className="w-full"
            />
            <ParcelLookup
              onParcelFound={(parcelNumber) => {
                updateSiteInfo({ parcelNumber });
                saveProject();
              }}
            />
          </div>

          <div>
            <label htmlFor="waterFrontage" className="block text-sm font-medium text-slate-700 mb-1">
              Water Frontage (feet)
            </label>
            <input
              type="text"
              id="waterFrontage"
              name="waterFrontage"
              value={site.waterFrontage}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 75"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="elevation" className="block text-sm font-medium text-slate-700 mb-1">
              Elevation at shoreline (feet)
            </label>
            <input
              type="number"
              id="elevation"
              name="elevation"
              value={site.elevation || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 542"
              className="w-full"
            />
            <p className="mt-1 text-xs text-slate-500">
              Lake Tapps typical summer level is 541.5&apos; to 543&apos;
            </p>
          </div>
        </div>
      </div>

      {/* Site Plan Input Mode Toggle */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Site Plans & Documents</h2>
        <p className="text-sm text-slate-600 mb-4">
          Upload existing site plans or create a new drawing using our built-in editor.
        </p>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setInputMode('upload')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              inputMode === 'upload'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="font-medium">Upload Files</span>
            </div>
            <p className="text-xs mt-1 opacity-70">Upload existing plans, surveys, or photos</p>
          </button>
          <button
            onClick={() => setInputMode('draw')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              inputMode === 'draw'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="font-medium">Draw Site Plan</span>
            </div>
            <p className="text-xs mt-1 opacity-70">Create a drawing with our CAD-style editor</p>
          </button>
        </div>
      </div>

      {/* Drawing Editor */}
      {inputMode === 'draw' && (
        <div className="card mb-6">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="w-8 h-8 spinner border-4 mx-auto mb-2" />
                  <p className="text-slate-600">Loading drawing editor...</p>
                </div>
              </div>
            }
          >
            <SitePlanEditor
              onSave={handleDrawingSave}
              onExport={handleDrawingExport}
            />
          </Suspense>
        </div>
      )}

      {/* File Upload */}
      {inputMode === 'upload' && (
      <div className="card mb-6">

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${isDragReject ? 'dropzone-reject' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            {isUploading ? (
              <>
                <div className="w-12 h-12 spinner border-4 mb-4" />
                <p className="text-slate-600">Processing files...</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <p className="text-slate-600 font-medium">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-slate-500 text-sm mt-1">or click to browse</p>
                <p className="text-slate-400 text-xs mt-3">
                  Accepts: Images, PDFs, Word docs, CAD files (max 100MB each)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Uploaded Files */}
        {site.sitePlanFiles && site.sitePlanFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-700">Uploaded Files</h3>
            {site.sitePlanFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Environmental Screening */}
      {project.workflowType === 'waterfront' && (
        <div className="card mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Environmental Screening
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Answer these questions to help identify potential environmental review requirements.
          </p>

          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={project.environmental?.nearWetlands || false}
                onChange={(e) => { updateEnvironmental({ nearWetlands: e.target.checked }); saveProject(); }}
                className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-slate-900">Wetlands nearby?</span>
                <p className="text-sm text-slate-600 mt-0.5">Are there wetlands, marshes, or riparian areas near the project site?</p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={project.environmental?.vegetationRemoval || false}
                onChange={(e) => { updateEnvironmental({ vegetationRemoval: e.target.checked }); saveProject(); }}
                className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-slate-900">Vegetation removal required?</span>
                <p className="text-sm text-slate-600 mt-0.5">Will trees, shrubs, or other vegetation need to be removed?</p>
              </div>
            </label>

            {project.environmental?.vegetationRemoval && (
              <div className="ml-8 animate-fade-in">
                <label className="block text-sm font-medium text-slate-700 mb-1">Describe vegetation to be removed</label>
                <textarea
                  value={project.environmental?.vegetationDescription || ''}
                  onChange={(e) => updateEnvironmental({ vegetationDescription: e.target.value })}
                  onBlur={() => saveProject()}
                  rows={2}
                  placeholder="Type and quantity of vegetation..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 resize-none"
                />
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={project.environmental?.groundDisturbance || false}
                onChange={(e) => { updateEnvironmental({ groundDisturbance: e.target.checked }); saveProject(); }}
                className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-slate-900">Significant ground disturbance?</span>
                <p className="text-sm text-slate-600 mt-0.5">Will the project involve excavation, grading, or significant soil disturbance?</p>
              </div>
            </label>

            {project.environmental?.groundDisturbance && (
              <div className="ml-8 animate-fade-in">
                <label className="block text-sm font-medium text-slate-700 mb-1">Describe erosion control plan</label>
                <textarea
                  value={project.environmental?.erosionControlPlan || ''}
                  onChange={(e) => updateEnvironmental({ erosionControlPlan: e.target.value })}
                  onBlur={() => saveProject()}
                  rows={2}
                  placeholder="Erosion control measures planned..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 resize-none"
                />
              </div>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={project.environmental?.nearFishSpawning || false}
                onChange={(e) => { updateEnvironmental({ nearFishSpawning: e.target.checked }); saveProject(); }}
                className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <div>
                <span className="font-medium text-slate-900">Near fish spawning areas?</span>
                <p className="text-sm text-slate-600 mt-0.5">Is the project near known fish spawning or rearing habitat?</p>
              </div>
            </label>
          </div>

          {(project.environmental?.nearWetlands || project.environmental?.vegetationRemoval || project.environmental?.groundDisturbance || project.environmental?.nearFishSpawning) && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-in">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-800">
                  <strong>Additional environmental review may be required.</strong> Based on your answers, your project may need environmental assessment or additional agency consultation.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">What to Include</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Site plan or survey showing property boundaries</li>
          <li>• Location of proposed improvement relative to shoreline</li>
          <li>• Photos of the project area</li>
          <li>• Engineering drawings (if available)</li>
          <li>• Existing structure photos (if modifying)</li>
        </ul>
      </div>
    </div>
  );
}
