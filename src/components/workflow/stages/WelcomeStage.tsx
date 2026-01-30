'use client';

import { useStore } from '@/store/useStore';
import type { WorkflowType } from '@/types';

interface WorkflowOption {
  type: WorkflowType;
  title: string;
  description: string;
  icon: React.ReactNode;
  examples: string[];
  permits: string[];
  gradient: string;
  iconBg: string;
}

const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    type: 'waterfront',
    title: 'Waterfront Improvements',
    description: 'Docks, boat lifts, shoreline modifications, and other lake improvements',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
    examples: ['Dock installation', 'Boat lift', 'Swim float', 'Bulkhead'],
    permits: ['CWA License', 'Shoreline Permit', 'HPA (if in water)'],
    gradient: 'from-lake-400 to-lake-600',
    iconBg: 'bg-lake-100',
  },
  {
    type: 'solar',
    title: 'Solar Installation',
    description: 'Rooftop solar panels, ground-mounted arrays, and battery storage systems',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    examples: ['Rooftop panels', 'Ground mount', 'Solar carport', 'Battery storage'],
    permits: ['Building Permit', 'Electrical Permit', 'Utility Interconnection'],
    gradient: 'from-amber-400 to-orange-500',
    iconBg: 'bg-amber-100',
  },
  {
    type: 'adu',
    title: 'ADU Construction',
    description: 'Accessory dwelling units, garage conversions, and secondary living spaces',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    examples: ['Detached ADU', 'Attached ADU', 'Garage conversion', 'Basement ADU'],
    permits: ['Building Permit', 'Planning Approval', 'Septic (if needed)'],
    gradient: 'from-emerald-400 to-teal-500',
    iconBg: 'bg-emerald-100',
  },
];

export default function WelcomeStage() {
  const { project, setWorkflowType, nextStage } = useStore();

  const handleWorkflowSelect = (type: WorkflowType) => {
    setWorkflowType(type);
    nextStage();
  };

  const selectedType = project?.workflowType;

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-lake-400 to-lake-600 rounded-2xl flex items-center justify-center shadow-xl shadow-lake-500/30 transform rotate-3 transition-transform hover:rotate-0">
            <svg
              className="w-12 h-12 text-white"
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
          </div>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-lake-500/20 rounded-2xl blur-xl" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
          Lake Tapps Permit Workflow
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Your guided assistant for navigating the permit process. Select your project type to get started.
        </p>
      </div>

      {/* Workflow Selection Cards */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">
          What type of project are you planning?
        </h2>
        <div className="grid md:grid-cols-3 gap-5 stagger-animation">
          {WORKFLOW_OPTIONS.map((option) => (
            <button
              key={option.type}
              onClick={() => handleWorkflowSelect(option.type)}
              className={`card text-left group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                selectedType === option.type
                  ? 'ring-2 ring-primary-500 border-primary-500'
                  : ''
              }`}
            >
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 bg-gradient-to-br ${option.gradient}`}>
                <div className="text-white">
                  {option.icon}
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2 text-lg">{option.title}</h3>
              <p className="text-slate-600 text-sm mb-4">
                {option.description}
              </p>

              {/* Examples */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Examples</p>
                <div className="flex flex-wrap gap-1.5">
                  {option.examples.map((example) => (
                    <span
                      key={example}
                      className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              {/* Permits */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Permits Required</p>
                <div className="flex flex-wrap gap-1.5">
                  {option.permits.map((permit) => (
                    <span
                      key={permit}
                      className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                    >
                      {permit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selection indicator */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
                  Select this workflow
                </span>
                <svg className="w-5 h-5 text-primary-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features Info */}
      <div className="grid md:grid-cols-3 gap-5 mb-10 stagger-animation">
        <div className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2 text-lg">Guided Process</h3>
          <p className="text-slate-600">
            Step-by-step guidance through every permit requirement
          </p>
        </div>

        <div className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2 text-lg">Document Generation</h3>
          <p className="text-slate-600">
            Automatically generate properly formatted application documents
          </p>
        </div>

        <div className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-2 text-lg">Local & Private</h3>
          <p className="text-slate-600">
            All data stays on your computer - nothing is uploaded to servers
          </p>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-5 overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Your Data Stays Local</h3>
            <p className="text-blue-800 mt-1 leading-relaxed">
              This application stores all your information locally on your computer. Nothing is uploaded to external servers. Your data is saved automatically so you can return at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
