'use client';

import { useStore } from '@/store/useStore';
import type { ProjectCategory, ImprovementType, SolarImprovementType, ADUImprovementType } from '@/types';

// Waterfront improvement types
const WATERFRONT_TYPES: { value: ImprovementType; label: string; description: string }[] = [
  { value: 'dock', label: 'Dock', description: 'Fixed or floating dock structure' },
  { value: 'pier', label: 'Pier', description: 'Fixed pier extending into the water' },
  { value: 'float', label: 'Float', description: 'Floating platform or swim float' },
  { value: 'boat_lift', label: 'Boat Lift', description: 'Mechanical lift for boats' },
  { value: 'boat_ramp', label: 'Boat Ramp', description: 'Sloped surface for launching boats' },
  { value: 'boathouse', label: 'Boathouse', description: 'Covered structure for boat storage' },
  { value: 'bulkhead', label: 'Bulkhead', description: 'Retaining wall along shoreline' },
  { value: 'mooring_pile', label: 'Mooring Pile', description: 'Pile for mooring boats' },
  { value: 'swim_float', label: 'Swim Float', description: 'Anchored floating platform for swimming' },
  { value: 'beach_area', label: 'Beach Area', description: 'Sandy or gravel beach area improvement' },
  { value: 'lighting', label: 'Waterfront Lighting', description: 'Dock or shoreline lighting installation' },
  { value: 'fire_pit', label: 'Fire Pit', description: 'Lakeside fire pit or fire feature' },
  { value: 'stairs_path', label: 'Stairs / Path', description: 'Shoreline stairs or pathway to water' },
  { value: 'other', label: 'Other', description: 'Other improvement type' },
];

// Solar improvement types
const SOLAR_TYPES: { value: SolarImprovementType; label: string; description: string }[] = [
  { value: 'rooftop_solar', label: 'Rooftop Solar', description: 'Solar panels mounted on existing roof' },
  { value: 'ground_mount_solar', label: 'Ground Mount', description: 'Solar array mounted on ground structure' },
  { value: 'solar_carport', label: 'Solar Carport', description: 'Covered parking with solar panels' },
  { value: 'battery_storage', label: 'Battery Storage', description: 'Energy storage system (Tesla Powerwall, etc.)' },
];

// ADU improvement types
const ADU_TYPES: { value: ADUImprovementType; label: string; description: string }[] = [
  { value: 'detached_adu', label: 'Detached ADU', description: 'Standalone accessory dwelling unit' },
  { value: 'attached_adu', label: 'Attached ADU', description: 'ADU attached to primary residence' },
  { value: 'garage_conversion', label: 'Garage Conversion', description: 'Converting existing garage to living space' },
  { value: 'basement_conversion', label: 'Basement/Attic', description: 'Converting basement or attic to ADU' },
];

export default function ProjectTypeStage() {
  const { project, updateProjectDetails, saveProject } = useStore();

  if (!project) return null;

  const workflowType = project.workflowType;
  const { category, improvementTypes } = project.details;
  const solarImprovements = project.details.solarImprovements || [];
  const aduImprovements = project.details.aduImprovements || [];

  const handleCategoryChange = (newCategory: ProjectCategory) => {
    updateProjectDetails({ category: newCategory });
    saveProject();
  };

  const handleWaterfrontToggle = (type: ImprovementType) => {
    const currentTypes = improvementTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    updateProjectDetails({ improvementTypes: newTypes });
    saveProject();
  };

  const handleSolarToggle = (type: SolarImprovementType) => {
    const currentTypes = solarImprovements || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    updateProjectDetails({ solarImprovements: newTypes });
    saveProject();
  };

  const handleADUToggle = (type: ADUImprovementType) => {
    const currentTypes = aduImprovements || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    updateProjectDetails({ aduImprovements: newTypes });
    saveProject();
  };

  // Get workflow-specific title and description
  const getStageContent = () => {
    switch (workflowType) {
      case 'solar':
        return {
          title: 'What type of solar system are you installing?',
          subtitle: 'Select all components that apply to your project',
          categoryTitle: 'Installation Type',
        };
      case 'adu':
        return {
          title: 'What type of ADU are you building?',
          subtitle: 'Select the type of accessory dwelling unit',
          categoryTitle: 'Project Type',
        };
      default:
        return {
          title: 'What type of project are you planning?',
          subtitle: 'This helps us determine which permits and applications you\'ll need.',
          categoryTitle: 'Project Category',
        };
    }
  };

  const content = getStageContent();

  // Get selected improvements for summary
  const getSelectedImprovements = () => {
    switch (workflowType) {
      case 'solar':
        return solarImprovements.map((t) => SOLAR_TYPES.find((st) => st.value === t)?.label);
      case 'adu':
        return aduImprovements.map((t) => ADU_TYPES.find((at) => at.value === t)?.label);
      default:
        return improvementTypes?.map((t) => WATERFRONT_TYPES.find((it) => it.value === t)?.label);
    }
  };

  const selectedImprovements = getSelectedImprovements();
  const hasSelections = selectedImprovements && selectedImprovements.length > 0;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {content.title}
        </h1>
        <p className="text-slate-600">
          {content.subtitle}
        </p>
      </div>

      {/* Project Category - Only show for waterfront and ADU */}
      {(workflowType === 'waterfront' || workflowType === 'adu') && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{content.categoryTitle}</h2>
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

            <button
              onClick={() => handleCategoryChange('repair_maintenance')}
              className={`card card-hover text-left ${
                category === 'repair_maintenance'
                  ? 'ring-2 ring-primary-500 border-primary-500'
                  : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  category === 'repair_maintenance' ? 'bg-primary-100' : 'bg-slate-100'
                }`}>
                  <svg
                    className={`w-6 h-6 ${
                      category === 'repair_maintenance' ? 'text-primary-600' : 'text-slate-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Repair / Maintenance</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Restoring or maintaining an existing structure to its original condition
                  </p>
                </div>
              </div>
              {category === 'repair_maintenance' && (
                <div className="mt-3 flex items-center text-primary-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Selected
                </div>
              )}
            </button>

            <button
              onClick={() => handleCategoryChange('replace_structure')}
              className={`card card-hover text-left ${
                category === 'replace_structure'
                  ? 'ring-2 ring-primary-500 border-primary-500'
                  : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  category === 'replace_structure' ? 'bg-primary-100' : 'bg-slate-100'
                }`}>
                  <svg
                    className={`w-6 h-6 ${
                      category === 'replace_structure' ? 'text-primary-600' : 'text-slate-500'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Replace Structure</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Removing and rebuilding an existing structure with new materials
                  </p>
                </div>
              </div>
              {category === 'replace_structure' && (
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
      )}

      {/* Improvement Types - Workflow Specific */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          {workflowType === 'solar' ? 'Solar System Components' :
           workflowType === 'adu' ? 'ADU Type' :
           'What type of improvement?'}
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          Select all that apply to your project
        </p>

        {/* Waterfront Types */}
        {workflowType === 'waterfront' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger-animation">
            {WATERFRONT_TYPES.map((type) => {
              const isSelected = improvementTypes?.includes(type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => handleWaterfrontToggle(type.value)}
                  className={`option-card text-left group ${
                    isSelected ? 'option-card-selected' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold transition-colors ${isSelected ? 'text-primary-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {type.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300 group-hover:border-primary-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mt-1.5 transition-colors ${isSelected ? 'text-primary-600' : 'text-slate-500 group-hover:text-slate-600'}`}>
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* Solar Types */}
        {workflowType === 'solar' && (
          <div className="grid sm:grid-cols-2 gap-4 stagger-animation">
            {SOLAR_TYPES.map((type) => {
              const isSelected = solarImprovements?.includes(type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => handleSolarToggle(type.value)}
                  className={`option-card text-left group ${
                    isSelected ? 'option-card-selected' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold transition-colors ${isSelected ? 'text-amber-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {type.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-500 border-amber-500'
                        : 'border-slate-300 group-hover:border-amber-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mt-1.5 transition-colors ${isSelected ? 'text-amber-600' : 'text-slate-500 group-hover:text-slate-600'}`}>
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {/* ADU Types */}
        {workflowType === 'adu' && (
          <div className="grid sm:grid-cols-2 gap-4 stagger-animation">
            {ADU_TYPES.map((type) => {
              const isSelected = aduImprovements?.includes(type.value);
              return (
                <button
                  key={type.value}
                  onClick={() => handleADUToggle(type.value)}
                  className={`option-card text-left group ${
                    isSelected ? 'option-card-selected' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold transition-colors ${isSelected ? 'text-emerald-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      {type.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-300 group-hover:border-emerald-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm mt-1.5 transition-colors ${isSelected ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-600'}`}>
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Summary */}
      {hasSelections && (
        <div className={`card ${
          workflowType === 'solar' ? 'bg-amber-50 border-amber-200' :
          workflowType === 'adu' ? 'bg-emerald-50 border-emerald-200' :
          'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-start gap-3">
            <svg className={`w-5 h-5 mt-0.5 ${
              workflowType === 'solar' ? 'text-amber-600' :
              workflowType === 'adu' ? 'text-emerald-600' :
              'text-emerald-600'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className={`font-medium ${
                workflowType === 'solar' ? 'text-amber-900' :
                workflowType === 'adu' ? 'text-emerald-900' :
                'text-emerald-900'
              }`}>
                {workflowType === 'solar' ? 'Selected Components' :
                 workflowType === 'adu' ? 'Selected ADU Type' :
                 'Selected Improvements'}
              </h3>
              <p className={`text-sm mt-1 ${
                workflowType === 'solar' ? 'text-amber-700' :
                workflowType === 'adu' ? 'text-emerald-700' :
                'text-emerald-700'
              }`}>
                {selectedImprovements?.join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
