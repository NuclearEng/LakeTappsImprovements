'use client';

import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';
import { CompletionIndicator } from '@/components/ui/FormField';
import { checkProjectDetailsCompletion } from '@/lib/validation';

interface FormErrors {
  [key: string]: string;
}

export default function ProjectDetailsStage() {
  const { project, updateProjectDetails, saveProject, setRequiredPermits } = useStore();
  const [showCostHelp, setShowCostHelp] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  // Memoize completion status
  const completionStatus = useMemo(() => {
    if (!project) return null;
    return checkProjectDetailsCompletion(project.details);
  }, [project]);

  if (!project) return null;

  const { details } = project;

  const validateField = (name: string, value: string | number): string => {
    switch (name) {
      case 'description':
        if (!String(value).trim()) return 'Project description is required';
        if (String(value).length < 10) return 'Please provide more detail (at least 10 characters)';
        break;
      case 'startDate':
        if (!value) return 'Start date is required';
        break;
      case 'completionDate':
        if (!value) return 'Completion date is required';
        if (details.startDate && new Date(String(value)) < new Date(details.startDate)) {
          return 'Completion date must be after start date';
        }
        break;
    }
    return '';
  };

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

    // Validate on change if touched
    if (touched.has(name) && typeof processedValue !== 'boolean') {
      const error = validateField(name, processedValue);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
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

      {/* Completion Indicator */}
      {completionStatus && (
        <CompletionIndicator
          completedFields={completionStatus.completedFields}
          totalFields={completionStatus.totalFields}
          missingFields={completionStatus.missingFields}
          className="mb-6"
        />
      )}

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
              className={`w-full ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.description}
            />
            {errors.description ? (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-500">
                Include dimensions, materials, and any relevant technical details.
              </p>
            )}
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
              Planned Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={details.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${errors.startDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.startDate}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.startDate}
              </p>
            )}
          </div>

          {/* Completion Date */}
          <div>
            <label htmlFor="completionDate" className="block text-sm font-medium text-slate-700 mb-1">
              Expected Completion <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="completionDate"
              name="completionDate"
              value={details.completionDate}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${errors.completionDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.completionDate}
            />
            {errors.completionDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.completionDate}
              </p>
            )}
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
              Describe the existing structure <span className="text-red-500">*</span>
            </label>
            <textarea
              id="existingStructureDescription"
              name="existingStructureDescription"
              value={details.existingStructureDescription || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={2}
              placeholder="Existing dock, approximate age, current condition..."
              className={`w-full ${errors.existingStructureDescription ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.existingStructureDescription}
            />
            {errors.existingStructureDescription && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.existingStructureDescription}
              </p>
            )}
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
