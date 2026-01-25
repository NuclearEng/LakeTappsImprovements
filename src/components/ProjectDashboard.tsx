'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { getAllProjects, deleteProject, duplicateProject } from '@/lib/db';
import { getProjectCompletionStatus } from '@/lib/stageValidation';
import type { Project } from '@/types';

interface ProjectDashboardProps {
  onClose: () => void;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
}

export default function ProjectDashboard({
  onClose,
  onSelectProject,
  onNewProject,
}: ProjectDashboardProps) {
  const { showConfirmation, addNotification } = useStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'name'>('updated');

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const allProjects = await getAllProjects();
      setProjects(allProjects);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to load projects',
        message: 'Could not retrieve your saved projects.',
        dismissible: true,
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDeleteProject = async (project: Project) => {
    showConfirmation({
      title: 'Delete Project?',
      message: `Are you sure you want to delete the project for "${project.owner.firstName} ${project.owner.lastName}"? This action cannot be undone.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteProject(project.id);
          setProjects((prev) => prev.filter((p) => p.id !== project.id));
          addNotification({
            type: 'success',
            title: 'Project Deleted',
            message: 'The project has been removed.',
            dismissible: true,
            duration: 3000,
          });
        } catch {
          addNotification({
            type: 'error',
            title: 'Delete Failed',
            message: 'Could not delete the project. Please try again.',
            dismissible: true,
          });
        }
      },
      onCancel: () => {},
    });
  };

  const handleDuplicateProject = async (project: Project) => {
    try {
      const newProject = await duplicateProject(project.id);
      if (newProject) {
        setProjects((prev) => [newProject, ...prev]);
        addNotification({
          type: 'success',
          title: 'Project Duplicated',
          message: 'A copy of the project has been created.',
          dismissible: true,
          duration: 3000,
        });
      }
    } catch {
      addNotification({
        type: 'error',
        title: 'Duplicate Failed',
        message: 'Could not duplicate the project. Please try again.',
        dismissible: true,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  const getProjectStatus = (project: Project) => {
    const completion = getProjectCompletionStatus(project);
    if (completion.overallComplete) {
      return { label: 'Complete', color: 'bg-green-100 text-green-800' };
    }
    if (project.currentStage >= 9) {
      return { label: 'Ready to Submit', color: 'bg-blue-100 text-blue-800' };
    }
    if (project.currentStage > 1) {
      return { label: 'In Progress', color: 'bg-amber-100 text-amber-800' };
    }
    return { label: 'Draft', color: 'bg-slate-100 text-slate-800' };
  };

  const getImprovementTypesLabel = (types: string[]) => {
    if (types.length === 0) return 'No types selected';
    const labels: Record<string, string> = {
      dock: 'Dock',
      pier: 'Pier',
      float: 'Float',
      boat_lift: 'Boat Lift',
      boat_ramp: 'Boat Ramp',
      boathouse: 'Boathouse',
      bulkhead: 'Bulkhead',
      mooring_pile: 'Mooring Pile',
      swim_float: 'Swim Float',
      other: 'Other',
    };
    return types.map((t) => labels[t] || t).join(', ');
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        project.owner.firstName.toLowerCase().includes(query) ||
        project.owner.lastName.toLowerCase().includes(query) ||
        project.owner.email.toLowerCase().includes(query) ||
        project.site.propertyAddress.toLowerCase().includes(query) ||
        project.owner.parcelNumber.includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          const nameA = `${a.owner.lastName} ${a.owner.firstName}`.toLowerCase();
          const nameB = `${b.owner.lastName} ${b.owner.firstName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-4xl p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Projects</h2>
            <p className="text-sm text-slate-600 mt-1">
              {projects.length} saved project{projects.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, address, or parcel number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'name')}
              className="py-2 px-3"
            >
              <option value="updated">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="name">Owner Name</option>
            </select>
            <button onClick={onNewProject} className="btn btn-primary whitespace-nowrap">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Project
            </button>
          </div>
        </div>

        {/* Project List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner w-8 h-8" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              {searchQuery ? (
                <>
                  <svg
                    className="mx-auto w-12 h-12 text-slate-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <p className="text-slate-600">No projects match your search.</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-primary-600 hover:underline"
                  >
                    Clear search
                  </button>
                </>
              ) : (
                <>
                  <svg
                    className="mx-auto w-12 h-12 text-slate-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-slate-600">No projects yet.</p>
                  <button onClick={onNewProject} className="mt-4 btn btn-primary">
                    Start Your First Project
                  </button>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {filteredProjects.map((project) => {
                const status = getProjectStatus(project);
                const completion = getProjectCompletionStatus(project);

                return (
                  <li
                    key={project.id}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => onSelectProject(project.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-900 truncate">
                            {project.owner.firstName && project.owner.lastName
                              ? `${project.owner.firstName} ${project.owner.lastName}`
                              : 'Unnamed Project'}
                          </h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {project.site.propertyAddress || 'No address entered'}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatRelativeTime(project.updatedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            {completion.completedStages}/{completion.totalStages} stages
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {getImprovementTypesLabel(project.details.improvementTypes)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDuplicateProject(project)}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                          title="Duplicate project"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete project"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{ width: `${completion.percentComplete}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {projects.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
            <p className="text-sm text-slate-500">
              {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''} shown
            </p>
            <button onClick={onClose} className="btn btn-secondary">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
