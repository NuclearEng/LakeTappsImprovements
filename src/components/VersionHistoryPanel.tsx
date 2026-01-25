'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import {
  getProjectVersions,
  restoreProjectVersion,
  saveProjectVersion,
  validateProjectData,
  type ProjectVersion,
} from '@/lib/db';

interface VersionHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionHistoryPanel({ isOpen, onClose }: VersionHistoryPanelProps) {
  const { project, addNotification, showConfirmation } = useStore();
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ProjectVersion | null>(null);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);

  const loadVersions = useCallback(async () => {
    if (!project) return;

    setIsLoading(true);
    try {
      const projectVersions = await getProjectVersions(project.id);
      setVersions(projectVersions);
    } catch (error) {
      console.error('Failed to load versions:', error);
      addNotification({
        type: 'error',
        title: 'Failed to load version history',
        message: 'Could not retrieve previous versions of your project.',
        dismissible: true,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [project, addNotification]);

  const validateProject = useCallback(async () => {
    if (!project) return;

    try {
      const result = await validateProjectData(project.id);
      setValidationStatus(result);

      if (!result.isValid) {
        addNotification({
          type: 'warning',
          title: 'Data Validation Issues',
          message: 'Some issues were found with your project data. Consider restoring from a previous version.',
          dismissible: true,
          duration: 10000,
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [project, addNotification]);

  useEffect(() => {
    if (isOpen) {
      loadVersions();
      validateProject();
    }
  }, [isOpen, loadVersions, validateProject]);

  const handleCreateSnapshot = async () => {
    if (!project) return;

    setIsLoading(true);
    try {
      await saveProjectVersion(project, 'manual', 'Manual snapshot');
      await loadVersions();
      addNotification({
        type: 'success',
        title: 'Snapshot Created',
        message: 'A snapshot of your current project has been saved.',
        dismissible: true,
        duration: 3000,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to create snapshot',
        message: 'Could not save the current project state.',
        dismissible: true,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (version: ProjectVersion) => {
    showConfirmation({
      title: 'Restore Previous Version?',
      message: `This will restore your project to version ${version.versionNumber} from ${new Date(version.createdAt).toLocaleString()}. Your current state will be saved as a backup first.`,
      confirmLabel: 'Restore',
      cancelLabel: 'Cancel',
      variant: 'warning',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          const restored = await restoreProjectVersion(version.id);
          if (restored) {
            // Reload the page to apply changes
            window.location.reload();
          }
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Restore Failed',
            message: 'Could not restore the selected version.',
            dismissible: true,
            duration: 5000,
          });
          setIsLoading(false);
        }
      },
      onCancel: () => {},
    });
  };

  const getTriggerTypeLabel = (type: ProjectVersion['triggerType']) => {
    switch (type) {
      case 'auto':
        return 'Auto-save';
      case 'manual':
        return 'Snapshot';
      case 'stage_complete':
        return 'Stage Complete';
      case 'before_restore':
        return 'Pre-restore Backup';
      default:
        return type;
    }
  };

  const getTriggerTypeColor = (type: ProjectVersion['triggerType']) => {
    switch (type) {
      case 'auto':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
      case 'manual':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
      case 'stage_complete':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
      case 'before_restore':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Version History
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View and restore previous versions of your project
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Validation Status */}
        {validationStatus && !validationStatus.isValid && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Data Issues Detected
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {validationStatus.errors.map((error, i) => (
                    <li key={i}>- {error}</li>
                  ))}
                </ul>
                {versions.length > 0 && (
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                    Consider restoring from a previous version below.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <button
              onClick={handleCreateSnapshot}
              disabled={isLoading}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Create Snapshot
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {versions.length} version{versions.length !== 1 ? 's' : ''} saved
            </span>
          </div>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 spinner border-2" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400">
                No version history yet
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                Versions are saved automatically as you complete stages
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedVersion?.id === version.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  onClick={() => setSelectedVersion(version)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          Version {version.versionNumber}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTriggerTypeColor(version.triggerType)}`}>
                          {getTriggerTypeLabel(version.triggerType)}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 text-xs bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded-full">
                            Latest
                          </span>
                        )}
                      </div>
                      {version.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {version.description}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        {formatDate(version.createdAt)} - {new Date(version.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRestore(version);
                      }}
                      className="btn btn-secondary btn-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restore
                    </button>
                  </div>

                  {/* Version Details (expanded) */}
                  {selectedVersion?.id === version.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Version Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Stage</p>
                          <p className="text-slate-900 dark:text-slate-100">
                            {version.data.currentStage} of 10
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Owner</p>
                          <p className="text-slate-900 dark:text-slate-100">
                            {version.data.owner.firstName} {version.data.owner.lastName || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Project Type</p>
                          <p className="text-slate-900 dark:text-slate-100 capitalize">
                            {version.data.details.category.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 dark:text-slate-400">Permits</p>
                          <p className="text-slate-900 dark:text-slate-100">
                            {version.data.requiredPermits.length} required
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Versions are automatically saved when you complete stages. The last 50 versions are kept.
            </p>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
