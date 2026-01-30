'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function ProjectDetailsStage() {
  const { project, updateProjectDetails, saveProject, setRequiredPermits, setSolarPermits, setADUPermits } = useStore();
  const [showCostHelp, setShowCostHelp] = useState(false);

  if (!project) return null;

  const { details } = project;
  const workflowType = project.workflowType;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'estimatedCost' || name === 'solarSystemSize' || name === 'panelCount' || name === 'batteryCapacity' || name === 'aduSquareFootage' || name === 'aduBedrooms' || name === 'aduBathrooms' || name === 'aduParkingSpaces' || name === 'estimatedAnnualProduction' || name === 'totalSquareFootage') {
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
    if (workflowType === 'waterfront') {
      const permits: string[] = ['cwa_license']; // Always required

      // Shoreline permits based on cost and type
      if (details.estimatedCost <= 8504) {
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

      // Pierce County building permit for structural waterfront work
      const structuralTypes = ['boathouse', 'bulkhead'] as const;
      const hasCoveredDock = details.improvementTypes?.includes('dock') && details.description?.toLowerCase().includes('covered');
      if (
        details.improvementTypes?.some(t => (structuralTypes as readonly string[]).includes(t)) ||
        hasCoveredDock
      ) {
        permits.push('pierce_building_permit');
      }

      // LNI electrical permit when electrical work is indicated
      if (details.hasElectricalWork) {
        permits.push('lni_electrical_permit');
      }

      setRequiredPermits(permits as any);
    } else if (workflowType === 'solar') {
      const permits: string[] = ['solar_building_permit', 'lni_electrical_permit'];

      // Add utility interconnection if grid-tied (always for residential)
      permits.push('utility_interconnection');

      setSolarPermits(permits as any);
    } else if (workflowType === 'adu') {
      const permits: string[] = ['adu_building_permit', 'planning_approval'];

      // Add septic permit if not on sewer
      if (!details.onSewer) {
        permits.push('septic_permit');
      }

      // Add shoreline permit if near water
      if (details.nearShoreline) {
        permits.push('adu_shoreline_permit');
      }

      // LNI electrical permit when electrical work is indicated
      if (details.hasElectricalWork) {
        permits.push('lni_electrical_permit');
      }

      setADUPermits(permits as any);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10";

  // Get workflow-specific content
  const getPageTitle = () => {
    switch (workflowType) {
      case 'solar':
        return { title: 'Solar System Details', subtitle: 'Provide specifications for your solar installation.' };
      case 'adu':
        return { title: 'ADU Details', subtitle: 'Provide details about your accessory dwelling unit.' };
      default:
        return { title: 'Project Details', subtitle: 'Provide details about your planned improvement. This information helps determine required permits.' };
    }
  };

  const pageContent = getPageTitle();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          {pageContent.title}
        </h1>
        <p className="text-slate-600 leading-relaxed">
          {pageContent.subtitle}
        </p>
      </div>

      {/* Waterfront-Specific Fields */}
      {workflowType === 'waterfront' && (
        <>
          {/* Project Description */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              Project Description
            </h2>

            <div className="space-y-4">
              <div className="form-group">
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className={`${inputClass} resize-none`}
                />
                <p className="mt-2 text-sm text-slate-500 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Include dimensions, materials, and any relevant technical details.
                </p>
              </div>
            </div>
          </div>

          {/* Cost and Timeline */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Cost & Timeline
            </h2>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Estimated Cost */}
              <div className="form-group">
                <label htmlFor="estimatedCost" className="block text-sm font-semibold text-slate-700 mb-2">
                  Estimated Total Cost <span className="text-red-500">*</span>
                  <button
                    type="button"
                    onClick={() => setShowCostHelp(!showCostHelp)}
                    className="ml-2 text-slate-400 hover:text-primary-500 transition-colors"
                  >
                    <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="text"
                    id="estimatedCost"
                    name="estimatedCost"
                    value={formatCurrency(details.estimatedCost)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputClass} pl-9`}
                    placeholder="0"
                  />
                </div>
                {showCostHelp && (
                  <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl text-sm animate-fade-in">
                    <p className="text-blue-800">
                      <strong>Why cost matters:</strong> Projects under $8,504 (effective August 5, 2023) may qualify for a Shoreline Exemption.
                      Projects over this amount typically require a Substantial Development Permit.
                    </p>
                    <p className="text-blue-800 mt-2">
                      <strong>Dock-specific thresholds (Lake Tapps fresh water):</strong> New docks ≤ $10,000 or
                      replacement docks ≤ $20,000 may be exempt even if they exceed the general $8,504 (effective August 5, 2023) threshold
                      (PCC 18S.60.020). Combined construction within 5 years is aggregated.
                    </p>
                  </div>
                )}
              </div>

              {/* Start Date */}
              <div className="form-group">
                <label htmlFor="startDate" className="block text-sm font-semibold text-slate-700 mb-2">
                  Planned Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={details.startDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                />
              </div>

              {/* Completion Date */}
              <div className="form-group">
                <label htmlFor="completionDate" className="block text-sm font-semibold text-slate-700 mb-2">
                  Expected Completion
                </label>
                <input
                  type="date"
                  id="completionDate"
                  name="completionDate"
                  value={details.completionDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Location Questions */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              Location & Scope
            </h2>
            <p className="text-sm text-slate-600 mb-5">
              These questions help determine which permits are required for your project.
            </p>

            <div className="space-y-3">
              {/* In Water */}
              <label className={`option-card group cursor-pointer ${details.inWater ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.inWater
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300 group-hover:border-primary-400'
                    }`}>
                      {details.inWater && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="inWater"
                      checked={details.inWater}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.inWater ? 'text-primary-700' : 'text-slate-900 group-hover:text-primary-700'}`}>
                      Work will occur in the water
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.inWater ? 'text-primary-600' : 'text-slate-600'}`}>
                      Any construction, installation, or modification that takes place below the ordinary high water line.
                    </p>
                  </div>
                </div>
              </label>

              {/* Below High Water Line */}
              <label className={`option-card group cursor-pointer ${details.belowHighWaterLine ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.belowHighWaterLine
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300 group-hover:border-primary-400'
                    }`}>
                      {details.belowHighWaterLine && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="belowHighWaterLine"
                      checked={details.belowHighWaterLine}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.belowHighWaterLine ? 'text-primary-700' : 'text-slate-900 group-hover:text-primary-700'}`}>
                      Structure extends below 544&apos; elevation
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.belowHighWaterLine ? 'text-primary-600' : 'text-slate-600'}`}>
                      Any part of the structure will be below the 544-foot elevation line (CWA can raise lake levels to 543&apos;).
                    </p>
                  </div>
                </div>
              </label>

              {/* Existing Structure */}
              <label className={`option-card group cursor-pointer ${details.existingStructure ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.existingStructure
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300 group-hover:border-primary-400'
                    }`}>
                      {details.existingStructure && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="existingStructure"
                      checked={details.existingStructure}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.existingStructure ? 'text-primary-700' : 'text-slate-900 group-hover:text-primary-700'}`}>
                      Modifying an existing licensed structure
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.existingStructure ? 'text-primary-600' : 'text-slate-600'}`}>
                      You have an existing CWA license for a structure you plan to modify, repair, or replace.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {details.existingStructure && (
              <div className="mt-5 animate-fade-in">
                <label htmlFor="existingStructureDescription" className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className={`${inputClass} resize-none`}
                />
              </div>
            )}
          </div>

          {/* Work Window Info Banner */}
          <div className="card mb-6 bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200/50">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-cyan-800">In-Water Work Window: July 16 - February 15</p>
                <p className="text-sm text-cyan-700 mt-1">
                  Work outside this window may require additional WDFW review. Plan your project timeline accordingly.
                </p>
              </div>
            </div>
          </div>

          {/* Dock Specifications */}
          {details.improvementTypes?.includes('dock') || details.improvementTypes?.includes('pier') ? (
            <div className="card mb-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                Dock / Pier Specifications
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Configuration</label>
                  <select
                    value={details.dockSpecs?.configuration || ''}
                    onChange={(e) => updateProjectDetails({ dockSpecs: { ...(details.dockSpecs || { configuration: '', length: 0, width: 0, deckingMaterial: '', pilingsCount: 0, pilingMaterial: '', pilingDiameter: 0, waterDepth: 0 }), configuration: e.target.value as any } })}
                    onBlur={handleBlur}
                    className={inputClass}
                  >
                    <option value="">Select configuration</option>
                    <option value="straight">Straight</option>
                    <option value="L">L-Shape</option>
                    <option value="T">T-Shape</option>
                    <option value="U">U-Shape</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Length (feet)</label>
                  <input type="number" value={details.dockSpecs?.length || ''} onChange={(e) => updateProjectDetails({ dockSpecs: { ...(details.dockSpecs || { configuration: '', length: 0, width: 0, deckingMaterial: '', pilingsCount: 0, pilingMaterial: '', pilingDiameter: 0, waterDepth: 0 }), length: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Width (feet)</label>
                  <input type="number" value={details.dockSpecs?.width || ''} onChange={(e) => updateProjectDetails({ dockSpecs: { ...(details.dockSpecs || { configuration: '', length: 0, width: 0, deckingMaterial: '', pilingsCount: 0, pilingMaterial: '', pilingDiameter: 0, waterDepth: 0 }), width: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                  {(details.dockSpecs?.width || 0) > 6 && (
                    <p className="mt-1 text-xs text-amber-600 font-medium">Note: Dock width exceeds 6 feet - may require additional review</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Decking Material</label>
                  <input type="text" value={details.dockSpecs?.deckingMaterial || ''} onChange={(e) => updateProjectDetails({ dockSpecs: { ...(details.dockSpecs || { configuration: '', length: 0, width: 0, deckingMaterial: '', pilingsCount: 0, pilingMaterial: '', pilingDiameter: 0, waterDepth: 0 }), deckingMaterial: e.target.value } })} onBlur={handleBlur} className={inputClass} placeholder="e.g., Composite, Cedar, Aluminum" />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Number of Pilings</label>
                  <input type="number" value={details.dockSpecs?.pilingsCount || ''} onChange={(e) => updateProjectDetails({ dockSpecs: { ...(details.dockSpecs || { configuration: '', length: 0, width: 0, deckingMaterial: '', pilingsCount: 0, pilingMaterial: '', pilingDiameter: 0, waterDepth: 0 }), pilingsCount: parseInt(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Piling Material</label>
                  <input type="text" value={details.dockSpecs?.pilingMaterial || ''} onChange={(e) => updateProjectDetails({ dockSpecs: { ...(details.dockSpecs || { configuration: '', length: 0, width: 0, deckingMaterial: '', pilingsCount: 0, pilingMaterial: '', pilingDiameter: 0, waterDepth: 0 }), pilingMaterial: e.target.value } })} onBlur={handleBlur} className={inputClass} placeholder="e.g., Steel, Wood, Aluminum" />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Piling Diameter (inches)</label>
                  <input type="number" value={details.dockSpecs?.pilingDiameter || ''} onChange={(e) => updateProjectDetails({ dockSpecs: { ...(details.dockSpecs || { configuration: '', length: 0, width: 0, deckingMaterial: '', pilingsCount: 0, pilingMaterial: '', pilingDiameter: 0, waterDepth: 0 }), pilingDiameter: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                  {(details.dockSpecs?.pilingDiameter || 0) > 6 && (
                    <p className="mt-1 text-xs text-amber-600 font-medium">Note: Piling diameter exceeds 6 inches - may require additional review</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Water Depth at End (feet)</label>
                  <input type="number" value={details.dockSpecs?.waterDepth || ''} onChange={(e) => updateProjectDetails({ dockSpecs: { ...(details.dockSpecs || { configuration: '', length: 0, width: 0, deckingMaterial: '', pilingsCount: 0, pilingMaterial: '', pilingDiameter: 0, waterDepth: 0 }), waterDepth: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
              </div>
            </div>
          ) : null}

          {/* Bulkhead Specifications */}
          {details.improvementTypes?.includes('bulkhead') ? (
            <div className="card mb-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Bulkhead Specifications</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Length (feet)</label>
                  <input type="number" value={details.bulkheadSpecs?.length || ''} onChange={(e) => updateProjectDetails({ bulkheadSpecs: { ...(details.bulkheadSpecs || { length: 0, height: 0, topElevation: 0, material: '', backfillRequired: false, backfillVolume: 0 }), length: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Height (feet)</label>
                  <input type="number" value={details.bulkheadSpecs?.height || ''} onChange={(e) => updateProjectDetails({ bulkheadSpecs: { ...(details.bulkheadSpecs || { length: 0, height: 0, topElevation: 0, material: '', backfillRequired: false, backfillVolume: 0 }), height: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Top Elevation (feet)</label>
                  <input type="number" value={details.bulkheadSpecs?.topElevation || ''} onChange={(e) => updateProjectDetails({ bulkheadSpecs: { ...(details.bulkheadSpecs || { length: 0, height: 0, topElevation: 0, material: '', backfillRequired: false, backfillVolume: 0 }), topElevation: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                  {(details.bulkheadSpecs?.topElevation || 0) > 0 && (details.bulkheadSpecs?.topElevation || 0) < 544 && (
                    <p className="mt-1 text-xs text-amber-600 font-medium">Warning: Top elevation is below 544 feet - CWA can raise lake levels to 543 feet</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Material</label>
                  <input type="text" value={details.bulkheadSpecs?.material || ''} onChange={(e) => updateProjectDetails({ bulkheadSpecs: { ...(details.bulkheadSpecs || { length: 0, height: 0, topElevation: 0, material: '', backfillRequired: false, backfillVolume: 0 }), material: e.target.value } })} onBlur={handleBlur} className={inputClass} placeholder="e.g., Concrete, Vinyl sheet pile" />
                </div>
              </div>
            </div>
          ) : null}

          {/* Boat Lift Specifications */}
          {details.improvementTypes?.includes('boat_lift') ? (
            <div className="card mb-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Boat Lift Specifications</h2>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Lift Type</label>
                  <input type="text" value={details.boatLiftSpecs?.type || ''} onChange={(e) => updateProjectDetails({ boatLiftSpecs: { ...(details.boatLiftSpecs || { type: '', powerSource: '', hydraulicSystem: '', capacity: 0 }), type: e.target.value } })} onBlur={handleBlur} className={inputClass} placeholder="e.g., Cantilever, Hydraulic, Floating" />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Power Source</label>
                  <input type="text" value={details.boatLiftSpecs?.powerSource || ''} onChange={(e) => updateProjectDetails({ boatLiftSpecs: { ...(details.boatLiftSpecs || { type: '', powerSource: '', hydraulicSystem: '', capacity: 0 }), powerSource: e.target.value } })} onBlur={handleBlur} className={inputClass} placeholder="e.g., Electric, Manual, Solar" />
                  {details.boatLiftSpecs?.powerSource?.toLowerCase().includes('oil') && (
                    <p className="mt-1 text-xs text-red-600 font-medium">Warning: Oil-based hydraulic systems may require additional environmental review</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Capacity (lbs)</label>
                  <input type="number" value={details.boatLiftSpecs?.capacity || ''} onChange={(e) => updateProjectDetails({ boatLiftSpecs: { ...(details.boatLiftSpecs || { type: '', powerSource: '', hydraulicSystem: '', capacity: 0 }), capacity: parseInt(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
              </div>
            </div>
          ) : null}

          {/* Boathouse Specifications */}
          {details.improvementTypes?.includes('boathouse') ? (
            <div className="card mb-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Boathouse Specifications</h2>
              <div className="grid md:grid-cols-3 gap-5 mb-5">
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Length (feet)</label>
                  <input type="number" value={details.boathouseSpecs?.length || ''} onChange={(e) => updateProjectDetails({ boathouseSpecs: { ...(details.boathouseSpecs || { length: 0, width: 0, height: 0, confirmedNoHabitableSpace: false, confirmedNoPlumbing: false }), length: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Width (feet)</label>
                  <input type="number" value={details.boathouseSpecs?.width || ''} onChange={(e) => updateProjectDetails({ boathouseSpecs: { ...(details.boathouseSpecs || { length: 0, width: 0, height: 0, confirmedNoHabitableSpace: false, confirmedNoPlumbing: false }), width: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Height (feet)</label>
                  <input type="number" value={details.boathouseSpecs?.height || ''} onChange={(e) => updateProjectDetails({ boathouseSpecs: { ...(details.boathouseSpecs || { length: 0, width: 0, height: 0, confirmedNoHabitableSpace: false, confirmedNoPlumbing: false }), height: parseFloat(e.target.value) || 0 } })} onBlur={handleBlur} className={inputClass} />
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={details.boathouseSpecs?.confirmedNoHabitableSpace || false}
                    onChange={(e) => updateProjectDetails({ boathouseSpecs: { ...(details.boathouseSpecs || { length: 0, width: 0, height: 0, confirmedNoHabitableSpace: false, confirmedNoPlumbing: false }), confirmedNoHabitableSpace: e.target.checked } })}
                    onBlur={handleBlur}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">I confirm this boathouse will NOT contain habitable space <span className="text-red-500">*</span></span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={details.boathouseSpecs?.confirmedNoPlumbing || false}
                    onChange={(e) => updateProjectDetails({ boathouseSpecs: { ...(details.boathouseSpecs || { length: 0, width: 0, height: 0, confirmedNoHabitableSpace: false, confirmedNoPlumbing: false }), confirmedNoPlumbing: e.target.checked } })}
                    onBlur={handleBlur}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">I confirm this boathouse will NOT have plumbing <span className="text-red-500">*</span></span>
                </label>
              </div>
            </div>
          ) : null}

          {/* HPA Exemption Check */}
          {details.category === 'repair_maintenance' && details.existingStructure && (
            <div className="card mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/50 animate-fade-in">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">May Qualify for HPA Exemption</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Repair/maintenance of existing structures may be exempt from HPA requirements if the work restores the structure to its original condition without expanding its footprint or capacity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Electrical Work & Contractor */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Electrical Work & Contractor
            </h2>

            <div className="space-y-3">
              <label className={`option-card group cursor-pointer ${details.hasElectricalWork ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.hasElectricalWork
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300 group-hover:border-primary-400'
                    }`}>
                      {details.hasElectricalWork && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="hasElectricalWork"
                      checked={details.hasElectricalWork || false}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.hasElectricalWork ? 'text-primary-700' : 'text-slate-900 group-hover:text-primary-700'}`}>
                      Project includes electrical work
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.hasElectricalWork ? 'text-primary-600' : 'text-slate-600'}`}>
                      Dock lighting, boat lift power, outlets, or any other electrical wiring. Requires a WA State L&I electrical permit.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            {details.hasElectricalWork && (
              <div className="mt-5 grid md:grid-cols-2 gap-5 animate-fade-in">
                <div className="form-group">
                  <label htmlFor="contractorName" className="block text-sm font-semibold text-slate-700 mb-2">
                    Contractor Name (if applicable)
                  </label>
                  <input
                    type="text"
                    id="contractorName"
                    name="contractorName"
                    value={details.contractorName || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass}
                    placeholder="Leave blank if owner-performed"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contractorLicense" className="block text-sm font-semibold text-slate-700 mb-2">
                    WA Contractor License #
                  </label>
                  <input
                    type="text"
                    id="contractorLicense"
                    name="contractorLicense"
                    value={details.contractorLicense || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass}
                    placeholder="e.g., CONTRL*123AB"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Permit Preview */}
          <div className="relative overflow-hidden card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50">
            {/* Decorative element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Based on your answers, you&apos;ll likely need:</h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-3 text-blue-800">
                    <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    CWA License Application (always required)
                  </li>
                  {details.estimatedCost <= 8504 ? (
                    <li className="flex items-center gap-3 text-blue-800">
                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Shoreline Exemption (project under $8,504 effective August 5, 2023)
                    </li>
                  ) : (
                    <li className="flex items-center gap-3 text-blue-800">
                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Shoreline Substantial Development Permit
                    </li>
                  )}
                  {(details.inWater || details.belowHighWaterLine) && (
                    <li className="flex items-center gap-3 text-blue-800">
                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Hydraulic Project Approval (HPA) - WDFW
                    </li>
                  )}
                  {(details.improvementTypes?.includes('boathouse') || details.improvementTypes?.includes('bulkhead')) && (
                    <li className="flex items-center gap-3 text-blue-800">
                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Pierce County Building Permit (structural work)
                    </li>
                  )}
                  {details.hasElectricalWork && (
                    <li className="flex items-center gap-3 text-blue-800">
                      <div className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      WA State Electrical Permit - L&I
                    </li>
                  )}
                </ul>
                <p className="mt-4 text-xs text-blue-700 bg-blue-100/50 px-3 py-2 rounded-lg">
                  This is a preliminary assessment. Final permit requirements will be confirmed in later steps.
                  Dock projects on Lake Tapps may qualify for higher exemption thresholds (new ≤ $10K / replacement ≤ $20K per PCC 18S.60.020).
                  SEPA environmental review is not required for minor dock repairs or ≤ 4 residential units (WAC 197-11-800).
                </p>
              </div>
            </div>
          </div>

          {/* Pierce County Residential Construction Guide Info */}
          <div className="relative overflow-hidden card mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Permit Process Guide
              </h2>
              <p className="text-xs text-indigo-700 mb-4 ml-10">
                Per Pierce County Residential Construction Guide &amp; Appendix A
              </p>

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                  <p className="font-semibold text-indigo-900 text-xs uppercase tracking-wide mb-2">Pre-Application Screening</p>
                  <ul className="space-y-1.5 text-indigo-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      $250 fee — recommended for all projects
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      Required for critical areas &amp; shoreline
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      Identifies all required permits early
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                  <p className="font-semibold text-indigo-900 text-xs uppercase tracking-wide mb-2">Fire Flow Requirements</p>
                  <ul className="space-y-1.5 text-indigo-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      &lt; 3,600 sq ft: 750 GPM at 45 min
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      ≥ 3,600 sq ft: 1,000 GPM at 60 min
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      Fire hydrant required within 350 ft
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-100 md:col-span-2">
                  <p className="font-semibold text-indigo-900 text-xs uppercase tracking-wide mb-2">Drainage Plan Thresholds</p>
                  <ul className="space-y-1.5 text-indigo-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <strong>Basic plan:</strong> new or replaced impervious surface &lt; 2,000 sq ft
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <strong>Engineered plan:</strong> new or replaced impervious surface ≥ 2,000 sq ft
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <strong>Drainage control plan:</strong> new or replaced impervious surface &gt; 5,000 sq ft or land clearing &gt; 1 acre
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Solar-Specific Fields */}
      {workflowType === 'solar' && (
        <>
          {/* System Specifications */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              System Specifications
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              {/* System Size */}
              <div className="form-group">
                <label htmlFor="solarSystemSize" className="block text-sm font-semibold text-slate-700 mb-2">
                  System Size (kW) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="solarSystemSize"
                    name="solarSystemSize"
                    value={details.solarSystemSize || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass}
                    placeholder="e.g., 8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">kW</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Typical residential: 5-15 kW</p>
              </div>

              {/* Panel Count */}
              <div className="form-group">
                <label htmlFor="panelCount" className="block text-sm font-semibold text-slate-700 mb-2">
                  Number of Panels
                </label>
                <input
                  type="text"
                  id="panelCount"
                  name="panelCount"
                  value={details.panelCount || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                  placeholder="e.g., 20"
                />
              </div>

              {/* Mounting Type */}
              <div className="form-group">
                <label htmlFor="mountingType" className="block text-sm font-semibold text-slate-700 mb-2">
                  Mounting Type
                </label>
                <select
                  id="mountingType"
                  name="mountingType"
                  value={details.mountingType || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                >
                  <option value="">Select mounting type</option>
                  <option value="roof_flush">Roof Mount - Flush</option>
                  <option value="roof_tilted">Roof Mount - Tilted</option>
                  <option value="ground">Ground Mount</option>
                  <option value="carport">Carport Structure</option>
                </select>
              </div>

              {/* Inverter Type */}
              <div className="form-group">
                <label htmlFor="inverterType" className="block text-sm font-semibold text-slate-700 mb-2">
                  Inverter Type
                </label>
                <select
                  id="inverterType"
                  name="inverterType"
                  value={details.inverterType || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                >
                  <option value="">Select inverter type</option>
                  <option value="string">String Inverter</option>
                  <option value="micro">Microinverters</option>
                  <option value="hybrid">Hybrid (with Battery)</option>
                </select>
              </div>

              {/* Battery Capacity */}
              {details.solarImprovements?.includes('battery_storage') && (
                <div className="form-group">
                  <label htmlFor="batteryCapacity" className="block text-sm font-semibold text-slate-700 mb-2">
                    Battery Capacity (kWh)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="batteryCapacity"
                      name="batteryCapacity"
                      value={details.batteryCapacity || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={inputClass}
                      placeholder="e.g., 13.5"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">kWh</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Tesla Powerwall: 13.5 kWh</p>
                </div>
              )}

              {/* Estimated Annual Production */}
              <div className="form-group">
                <label htmlFor="estimatedAnnualProduction" className="block text-sm font-semibold text-slate-700 mb-2">
                  Est. Annual Production
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="estimatedAnnualProduction"
                    name="estimatedAnnualProduction"
                    value={details.estimatedAnnualProduction || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass}
                    placeholder="e.g., 10000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">kWh/yr</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pierce County Technical Bulletin Guidance */}
          <div className="relative overflow-hidden card mb-6 bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200/50">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-sky-900 mb-1 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                Pierce County Code Requirements
              </h2>
              <p className="text-xs text-sky-700 mb-4 ml-10">
                Per Technical Bulletin — Residential Rooftop PV Panel Systems (2021 International Codes, Rev. 3/26/2024)
              </p>

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-lg p-3 border border-sky-100">
                  <p className="font-semibold text-sky-900 text-xs uppercase tracking-wide mb-2">Structural</p>
                  <ul className="space-y-1.5 text-sky-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Dead load ≤ 4 lbs/sq ft, no point loads &gt; 50 lbs
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Panels ≤ 18&quot; above roof surface
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Designed for local wind speed per manufacturer specs
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-sky-100">
                  <p className="font-semibold text-sky-900 text-xs uppercase tracking-wide mb-2">Fire / Safety</p>
                  <ul className="space-y-1.5 text-sky-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      36&quot; pathway from roof edge to ridge
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Ridge setback: 18&quot; (≤33% roof) or 36&quot; (&gt;33% roof)
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      Rapid shutdown labels per IFC 1204.5
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-sky-100">
                  <p className="font-semibold text-sky-900 text-xs uppercase tracking-wide mb-2">Applicable Codes</p>
                  <ul className="space-y-1.5 text-sky-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      2021 IRC Section R324 (WA amended)
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      NFPA 70, UL 1741
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-sky-400 mt-0.5">•</span>
                      IFC Section R104.11 &amp; 1205
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-red-100">
                  <p className="font-semibold text-red-800 text-xs uppercase tracking-wide mb-2">Engineering Required If</p>
                  <ul className="space-y-1.5 text-red-700">
                    <li className="flex items-start gap-1.5">
                      <svg className="w-3.5 h-3.5 mt-0.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Dead load &gt; 4 lbs/sq ft or point load &gt; 50 lbs
                    </li>
                    <li className="flex items-start gap-1.5">
                      <svg className="w-3.5 h-3.5 mt-0.5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Ground snow load ≥ 70 lbs/sq ft
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-xs text-sky-600 ml-10">
                A separate electrical permit from WA L&amp;I is also required. Solar panels may not cover plumbing vents without Pierce County approval.
              </p>

              <div className="mt-3 p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-lg ml-10">
                <p className="text-xs text-emerald-800">
                  <span className="font-semibold">SEPA:</span> Solar energy equipment installed on existing structures is
                  categorically exempt from environmental review per WAC 197-11-800(2)(l).
                </p>
              </div>
            </div>
          </div>

          {/* Utility Information */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Utility Information
            </h2>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="form-group">
                <label htmlFor="utilityProvider" className="block text-sm font-semibold text-slate-700 mb-2">
                  Utility Provider
                </label>
                <select
                  id="utilityProvider"
                  name="utilityProvider"
                  value={details.utilityProvider || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                >
                  <option value="">Select utility provider</option>
                  <option value="pse">Puget Sound Energy (PSE)</option>
                  <option value="tacoma_power">Tacoma Power</option>
                  <option value="seattle_city_light">Seattle City Light</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estimatedCost" className="block text-sm font-semibold text-slate-700 mb-2">
                  Estimated Project Cost
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="text"
                    id="estimatedCost"
                    name="estimatedCost"
                    value={formatCurrency(details.estimatedCost)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputClass} pl-9`}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Project Description */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">Additional Details</h2>
            <div className="form-group">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                Project Description
              </label>
              <textarea
                id="description"
                name="description"
                value={details.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Any additional details about your solar installation..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Permit Preview */}
          <div className="relative overflow-hidden card bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Required Permits for Solar Installation:</h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-3 text-amber-800">
                    <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Building Permit (structural review)
                  </li>
                  <li className="flex items-center gap-3 text-amber-800">
                    <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    WA State Electrical Permit (L&I)
                  </li>
                  <li className="flex items-center gap-3 text-amber-800">
                    <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Utility Interconnection Agreement
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ADU-Specific Fields */}
      {workflowType === 'adu' && (
        <>
          {/* ADU Specifications */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              ADU Specifications
            </h2>

            <div className="grid md:grid-cols-3 gap-5">
              {/* Square Footage */}
              <div className="form-group">
                <label htmlFor="aduSquareFootage" className="block text-sm font-semibold text-slate-700 mb-2">
                  Square Footage <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="aduSquareFootage"
                    name="aduSquareFootage"
                    value={details.aduSquareFootage || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass}
                    placeholder="e.g., 800"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">sq ft</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Max: 1,000 sq ft (UGA) or 1,250 sq ft (outside UGA) per PCC 18A.37.120</p>
              </div>

              {/* Bedrooms */}
              <div className="form-group">
                <label htmlFor="aduBedrooms" className="block text-sm font-semibold text-slate-700 mb-2">
                  Bedrooms
                </label>
                <select
                  id="aduBedrooms"
                  name="aduBedrooms"
                  value={details.aduBedrooms || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="0">Studio (0)</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                </select>
              </div>

              {/* Bathrooms */}
              <div className="form-group">
                <label htmlFor="aduBathrooms" className="block text-sm font-semibold text-slate-700 mb-2">
                  Bathrooms
                </label>
                <select
                  id="aduBathrooms"
                  name="aduBathrooms"
                  value={details.aduBathrooms || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                </select>
              </div>

              {/* Parking Spaces */}
              <div className="form-group">
                <label htmlFor="aduParkingSpaces" className="block text-sm font-semibold text-slate-700 mb-2">
                  Parking Spaces
                </label>
                <select
                  id="aduParkingSpaces"
                  name="aduParkingSpaces"
                  value={details.aduParkingSpaces || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="0">0 (allowed within ½ mile of major transit stop)</option>
                  <option value="1">1 Space</option>
                  <option value="2">2 Spaces</option>
                </select>
              </div>

              {/* Estimated Cost */}
              <div className="form-group">
                <label htmlFor="estimatedCost" className="block text-sm font-semibold text-slate-700 mb-2">
                  Estimated Cost
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                  <input
                    type="text"
                    id="estimatedCost"
                    name="estimatedCost"
                    value={formatCurrency(details.estimatedCost)}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${inputClass} pl-9`}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pierce County ADU Code Requirements */}
          <div className="relative overflow-hidden card mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/50">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-emerald-900 mb-1 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                Pierce County ADU Requirements
              </h2>
              <p className="text-xs text-emerald-700 mb-4 ml-10">
                Per PCC 18A.37.120 (Ord. 2025-516s) &amp; PCC 18A.15.040 (Setback &amp; Height)
              </p>

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                  <p className="font-semibold text-emerald-900 text-xs uppercase tracking-wide mb-2">Size &amp; Density</p>
                  <ul className="space-y-1.5 text-emerald-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Max 1,000 sq ft (UGA) or 1,250 sq ft (outside UGA)
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Up to 2 ADUs per lot in UGA; 1 outside UGA
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      No owner-occupancy requirement
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                  <p className="font-semibold text-emerald-900 text-xs uppercase tracking-wide mb-2">Height</p>
                  <ul className="space-y-1.5 text-emerald-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Cannot exceed principal dwelling height
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      ADU above detached garage may exceed by 1 story
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Minimum 24 ft unless principal dwelling is less
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                  <p className="font-semibold text-emerald-900 text-xs uppercase tracking-wide mb-2">Setbacks (UGA)</p>
                  <ul className="space-y-1.5 text-emerald-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Side/interior &amp; rear: may be reduced to 5 ft
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Rear abutting alley: may be reduced to 2 ft
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Existing structures convertible within setback
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-emerald-100">
                  <p className="font-semibold text-emerald-900 text-xs uppercase tracking-wide mb-2">Parking &amp; Access</p>
                  <ul className="space-y-1.5 text-emerald-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      No parking required within &frac12; mile of major transit
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Street improvements not required for ADU
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-400 mt-0.5">•</span>
                      Per RCW 36.70A.681 &amp; PCC 18A.37.120.D.5
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-3 bg-amber-50/80 border border-amber-200/60 rounded-lg">
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">Permit note:</span> ADUs are <span className="font-semibold">not exempt</span> from
                  building permit (habitable space, PCC 17C.30.040 §1a). However, ancillary work such as
                  fences ≤ 6 ft, retaining walls ≤ 4 ft, decks ≤ 30&quot; above grade, re-roofing, siding replacement,
                  and finish work (paint, tile, cabinets) does not require a permit.
                </p>
              </div>
              <div className="mt-2 p-3 bg-emerald-50/80 border border-emerald-200/60 rounded-lg">
                <p className="text-xs text-emerald-800">
                  <span className="font-semibold">SEPA:</span> Construction of ≤ 4 residential units (including ADUs)
                  is categorically exempt from environmental review per WAC 197-11-800(1).
                </p>
              </div>
              <div className="mt-2 p-3 bg-red-50/80 border border-red-200/60 rounded-lg">
                <p className="text-xs text-red-800">
                  <span className="font-semibold">Shoreline conflict:</span> ADUs are <span className="font-semibold">not exempt</span> from
                  shoreline substantial development permits (PCC 18S.60.020) — even though single-family homes
                  ≤ 35 ft are exempt, ADUs are explicitly excluded as &quot;not a normal appurtenance.&quot; A shoreline
                  permit is required if within 200 ft of water, regardless of project cost.
                </p>
              </div>
            </div>
          </div>

          {/* Permit Process Guide (Residential Construction Guide) */}
          <div className="relative overflow-hidden card mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200/50">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative">
              <h2 className="text-lg font-semibold text-indigo-900 mb-1 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Permit Process Guide
              </h2>
              <p className="text-xs text-indigo-700 mb-4 ml-10">
                Per Pierce County Residential Construction Guide
              </p>

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                  <p className="font-semibold text-indigo-900 text-xs uppercase tracking-wide mb-2">Pre-Application Screening</p>
                  <ul className="space-y-1.5 text-indigo-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      $250 fee — recommended for all projects
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      Required for critical areas &amp; shoreline
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      Identifies all required permits early
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-100">
                  <p className="font-semibold text-indigo-900 text-xs uppercase tracking-wide mb-2">Fire Flow Requirements</p>
                  <ul className="space-y-1.5 text-indigo-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      &lt; 3,600 sq ft: 750 GPM at 45 min
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      ≥ 3,600 sq ft: 1,000 GPM at 60 min
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      Fire hydrant required within 350 ft
                    </li>
                  </ul>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-indigo-100 md:col-span-2">
                  <p className="font-semibold text-indigo-900 text-xs uppercase tracking-wide mb-2">Drainage Plan Thresholds</p>
                  <ul className="space-y-1.5 text-indigo-800">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <strong>Basic plan:</strong> new or replaced impervious surface &lt; 2,000 sq ft
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <strong>Engineered plan:</strong> new or replaced impervious surface ≥ 2,000 sq ft
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <strong>Drainage control plan:</strong> new or replaced impervious &gt; 5,000 sq ft or land clearing &gt; 1 acre
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ADU Location Questions */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              Site Conditions
            </h2>

            <div className="space-y-3">
              {/* Separate Entrance */}
              <label className={`option-card group cursor-pointer ${details.hasSeparateEntrance ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.hasSeparateEntrance
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-300 group-hover:border-emerald-400'
                    }`}>
                      {details.hasSeparateEntrance && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="hasSeparateEntrance"
                      checked={details.hasSeparateEntrance || false}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.hasSeparateEntrance ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                      ADU will have separate entrance
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.hasSeparateEntrance ? 'text-emerald-600' : 'text-slate-600'}`}>
                      Required for most ADU types
                    </p>
                  </div>
                </div>
              </label>

              {/* On Sewer */}
              <label className={`option-card group cursor-pointer ${details.onSewer ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.onSewer
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-300 group-hover:border-emerald-400'
                    }`}>
                      {details.onSewer && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="onSewer"
                      checked={details.onSewer || false}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.onSewer ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                      Property is connected to public sewer
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.onSewer ? 'text-emerald-600' : 'text-slate-600'}`}>
                      If not, septic permit will be required
                    </p>
                  </div>
                </div>
              </label>

              {/* Near Shoreline */}
              <label className={`option-card group cursor-pointer ${details.nearShoreline ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.nearShoreline
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-300 group-hover:border-emerald-400'
                    }`}>
                      {details.nearShoreline && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="nearShoreline"
                      checked={details.nearShoreline || false}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.nearShoreline ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                      ADU will be within 200 feet of water
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.nearShoreline ? 'text-emerald-600' : 'text-slate-600'}`}>
                      Shoreline permit may be required
                    </p>
                  </div>
                </div>
              </label>

              {/* Existing ADU */}
              <label className={`option-card group cursor-pointer ${details.hasExistingADU ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.hasExistingADU
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-300 group-hover:border-emerald-400'
                    }`}>
                      {details.hasExistingADU && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="hasExistingADU"
                      checked={details.hasExistingADU || false}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.hasExistingADU ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                      Property already has an ADU
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.hasExistingADU ? 'text-emerald-600' : 'text-slate-600'}`}>
                      Pierce County allows up to 2 ADUs per lot (UGA) or 1 ADU (outside UGA) per PCC 18A.37.120.C
                    </p>
                  </div>
                </div>
              </label>

              {/* Has Electrical Work */}
              <label className={`option-card group cursor-pointer ${details.hasElectricalWork ? 'option-card-selected' : ''}`}>
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                      details.hasElectricalWork
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-300 group-hover:border-emerald-400'
                    }`}>
                      {details.hasElectricalWork && (
                        <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      name="hasElectricalWork"
                      checked={details.hasElectricalWork || false}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${details.hasElectricalWork ? 'text-emerald-700' : 'text-slate-900 group-hover:text-emerald-700'}`}>
                      ADU includes electrical work
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${details.hasElectricalWork ? 'text-emerald-600' : 'text-slate-600'}`}>
                      Requires a WA State L&I electrical permit (most ADUs require this)
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Project Description */}
          <div className="card mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">Project Description</h2>
            <div className="form-group">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                Describe your ADU project
              </label>
              <textarea
                id="description"
                name="description"
                value={details.description}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Describe the ADU, materials, design style, etc..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Permit Preview */}
          <div className="relative overflow-hidden card bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-emerald-900">Based on your answers, you&apos;ll likely need:</h3>
                <ul className="mt-3 space-y-2">
                  <li className="flex items-center gap-3 text-emerald-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Building Permit
                  </li>
                  <li className="flex items-center gap-3 text-emerald-800">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Planning Approval
                  </li>
                  {!details.onSewer && (
                    <li className="flex items-center gap-3 text-emerald-800">
                      <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Septic Permit (not on sewer)
                    </li>
                  )}
                  {details.nearShoreline && (
                    <li className="flex items-center gap-3 text-emerald-800">
                      <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      Shoreline Permit (within 200ft of water)
                    </li>
                  )}
                  {details.hasElectricalWork && (
                    <li className="flex items-center gap-3 text-emerald-800">
                      <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      WA State Electrical Permit (L&I)
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
