'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function ProjectDetailsStage() {
  const { project, updateProjectDetails, saveProject, setRequiredPermits } = useStore();
  const [showCostHelp, setShowCostHelp] = useState(false);

  if (!project) return null;

  const { details } = project;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'estimatedCost') {
      processedValue = parseInt(value.replace(/\D/g, '')) || 0;
    }

    updateProjectDetails({ [name]: processedValue });
  };

  const handleBlur = () => {
    saveProject();
    calculateRequiredPermits();
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('en-US');
  };

  const calculateRequiredPermits = () => {
    const permits: string[] = ['cwa_license']; // Always required

    // Shoreline permits based on cost and type
    if (details.estimatedCost <= 7047) {
      permits.push('shoreline_exemption');
    } else {
      permits.push('shoreline_substantial');
    }

    // HPA for in-water work
    if (details.inWater || details.belowHighWaterLine) {
      permits.push('hpa');
    }

    // Federal permits for mooring piles, significant in-water work
    if (
      project.details.improvementTypes?.includes('mooring_pile') ||
      (details.inWater && details.estimatedCost > 50000)
    ) {
      permits.push('section_10');
    }

    setRequiredPermits(permits as any);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Project Details
        </h1>
        <p className="text-slate-600">
          Provide details about your planned improvement. This information helps determine required permits.
        </p>
      </div>

      {/* Project Description */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Project Description</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
              Describe your planned improvement <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={details.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={4}
              placeholder="Example: Install a new 6' x 24' floating dock with aluminum frame and composite decking, connected to shoreline with a 4' x 16' gangway..."
              className="w-full"
            />
            <p className="mt-1 text-sm text-slate-500">
              Include dimensions, materials, and any relevant technical details.
            </p>
          </div>
        </div>
      </div>

      {/* Cost and Timeline */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Cost & Timeline</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Estimated Cost */}
          <div>
            <label htmlFor="estimatedCost" className="block text-sm font-medium text-slate-700 mb-1">
              Estimated Total Cost <span className="text-red-500">*</span>
              <button
                type="button"
                onClick={() => setShowCostHelp(!showCostHelp)}
                className="ml-2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <input
                type="text"
                id="estimatedCost"
                name="estimatedCost"
                value={formatCurrency(details.estimatedCost)}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full pl-7"
                placeholder="0"
              />
            </div>
            {showCostHelp && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="text-blue-800">
                  <strong>Why cost matters:</strong> Projects under $7,047 may qualify for a Shoreline Exemption.
                  Projects over this amount typically require a Substantial Development Permit.
                </p>
              </div>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-1">
              Planned Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={details.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full"
            />
          </div>

          {/* Completion Date */}
          <div>
            <label htmlFor="completionDate" className="block text-sm font-medium text-slate-700 mb-1">
              Expected Completion
            </label>
            <input
              type="date"
              id="completionDate"
              name="completionDate"
              value={details.completionDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Location Questions */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Location & Scope</h2>
        <p className="text-sm text-slate-600 mb-4">
          These questions help determine which permits are required for your project.
        </p>

        <div className="space-y-4">
          {/* In Water */}
          <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              name="inWater"
              checked={details.inWater}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="font-medium text-slate-900">Work will occur in the water</span>
              <p className="text-sm text-slate-600 mt-1">
                Any construction, installation, or modification that takes place below the ordinary high water line.
              </p>
            </div>
          </label>

          {/* Below High Water Line */}
          <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              name="belowHighWaterLine"
              checked={details.belowHighWaterLine}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="font-medium text-slate-900">Structure extends below 544&apos; elevation</span>
              <p className="text-sm text-slate-600 mt-1">
                Any part of the structure will be below the 544-foot elevation line (CWA can raise lake levels to 543&apos;).
              </p>
            </div>
          </label>

          {/* Existing Structure */}
          <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              name="existingStructure"
              checked={details.existingStructure}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="font-medium text-slate-900">Modifying an existing licensed structure</span>
              <p className="text-sm text-slate-600 mt-1">
                You have an existing CWA license for a structure you plan to modify, repair, or replace.
              </p>
            </div>
          </label>
        </div>

        {details.existingStructure && (
          <div className="mt-4">
            <label htmlFor="existingStructureDescription" className="block text-sm font-medium text-slate-700 mb-1">
              Describe the existing structure
            </label>
            <textarea
              id="existingStructureDescription"
              name="existingStructureDescription"
              value={details.existingStructureDescription || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={2}
              placeholder="Existing dock, approximate age, current condition..."
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Permit Preview */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900">Based on your answers, you&apos;ll likely need:</h3>
            <ul className="mt-2 space-y-1 text-sm text-blue-800">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                CWA License Application (always required)
              </li>
              {details.estimatedCost <= 7047 ? (
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Shoreline Exemption (project under $7,047)
                </li>
              ) : (
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Shoreline Substantial Development Permit
                </li>
              )}
              {(details.inWater || details.belowHighWaterLine) && (
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hydraulic Project Approval (HPA) - WDFW
                </li>
              )}
            </ul>
            <p className="mt-3 text-xs text-blue-700">
              This is a preliminary assessment. Final permit requirements will be confirmed in later steps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
