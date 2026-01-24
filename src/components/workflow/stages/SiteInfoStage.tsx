'use client';

import { useStore } from '@/store/useStore';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { v4 as uuidv4 } from 'uuid';
import type { UploadedFile } from '@/types';

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

export default function SiteInfoStage() {
  const { project, updateSiteInfo, saveProject, addNotification } = useStore();
  const [isUploading, setIsUploading] = useState(false);

  if (!project) return null;

  const { site } = project;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSiteInfo({ [name]: value });
  };

  const handleBlur = () => {
    saveProject();
  };

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

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach((rejection) => {
      const errors = rejection.errors.map((e: any) => e.message).join(', ');
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
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Upload failed',
        message: 'Failed to process one or more files',
        dismissible: true,
      });
    } finally {
      setIsUploading(false);
    }
  }, [site.sitePlanFiles, updateSiteInfo, saveProject, addNotification]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: true,
  });

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

      {/* File Upload */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Site Plans & Documents</h2>
        <p className="text-sm text-slate-600 mb-4">
          Upload site plans, surveys, photos, or any other relevant documents.
        </p>

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
