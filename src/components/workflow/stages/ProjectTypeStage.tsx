'use client';

import { useStore } from '@/store/useStore';
import type { ProjectCategory, ImprovementType } from '@/types';

const IMPROVEMENT_TYPES: { value: ImprovementType; label: string; description: string }[] = [
  { value: 'dock', label: 'Dock', description: 'Fixed or floating dock structure' },
  { value: 'pier', label: 'Pier', description: 'Fixed pier extending into the water' },
  { value: 'float', label: 'Float', description: 'Floating platform or swim float' },
  { value: 'boat_lift', label: 'Boat Lift', description: 'Mechanical lift for boats' },
  { value: 'boat_ramp', label: 'Boat Ramp', description: 'Sloped surface for launching boats' },
  { value: 'boathouse', label: 'Boathouse', description: 'Covered structure for boat storage' },
  { value: 'bulkhead', label: 'Bulkhead', description: 'Retaining wall along shoreline' },
  { value: 'mooring_pile', label: 'Mooring Pile', description: 'Pile for mooring boats' },
  { value: 'swim_float', label: 'Swim Float', description: 'Anchored floating platform for swimming' },
  { value: 'other', label: 'Other', description: 'Other improvement type' },
];

export default function ProjectTypeStage() {
  const { project, updateProjectDetails, saveProject } = useStore();

  if (!project) return null;

  const { category, improvementTypes } = project.details;

  const handleCategoryChange = (newCategory: ProjectCategory) => {
    updateProjectDetails({ category: newCategory });
    saveProject();
  };

  const handleImprovementToggle = (type: ImprovementType) => {
    const currentTypes = improvementTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    updateProjectDetails({ improvementTypes: newTypes });
    saveProject();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          What type of project are you planning?
        </h1>
        <p className="text-slate-600">
          This helps us determine which permits and applications you&apos;ll need.
        </p>
      </div>

      {/* Project Category */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Project Category</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => handleCategoryChange('new_construction')}
            className={`card card-hover text-left ${
              category === 'new_construction'
                ? 'ring-2 ring-primary-500 border-primary-500'
                : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                category === 'new_construction' ? 'bg-primary-100' : 'bg-slate-100'
              }`}>
                <svg
                  className={`w-6 h-6 ${
                    category === 'new_construction' ? 'text-primary-600' : 'text-slate-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">New Construction</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Building something new that doesn&apos;t currently exist
                </p>
              </div>
            </div>
            {category === 'new_construction' && (
              <div className="mt-3 flex items-center text-primary-600 text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Selected
              </div>
            )}
          </button>

          <button
            onClick={() => handleCategoryChange('modification')}
            className={`card card-hover text-left ${
              category === 'modification'
                ? 'ring-2 ring-primary-500 border-primary-500'
                : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                category === 'modification' ? 'bg-primary-100' : 'bg-slate-100'
              }`}>
                <svg
                  className={`w-6 h-6 ${
                    category === 'modification' ? 'text-primary-600' : 'text-slate-500'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Modify Existing</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Changing, expanding, or upgrading an existing structure
                </p>
              </div>
            </div>
            {category === 'modification' && (
              <div className="mt-3 flex items-center text-primary-600 text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Selected
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Improvement Types */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          What type of improvement?
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Select all that apply to your project
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {IMPROVEMENT_TYPES.map((type) => {
            const isSelected = improvementTypes?.includes(type.value);
            return (
              <button
                key={type.value}
                onClick={() => handleImprovementToggle(type.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}>
                    {type.label}
                  </span>
                  {isSelected && (
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className={`text-sm mt-1 ${isSelected ? 'text-primary-600' : 'text-slate-500'}`}>
                  {type.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Summary */}
      {improvementTypes && improvementTypes.length > 0 && (
        <div className="card bg-emerald-50 border-emerald-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-emerald-900">Selected Improvements</h3>
              <p className="text-sm text-emerald-700 mt-1">
                {improvementTypes
                  .map((t) => IMPROVEMENT_TYPES.find((it) => it.value === t)?.label)
                  .join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
