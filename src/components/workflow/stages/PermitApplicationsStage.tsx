'use client';

import { useStore } from '@/store/useStore';

const PERMIT_INFO = {
  cwa_license: {
    name: 'CWA License Application',
    agency: 'Cascade Water Alliance',
    description: 'Required for all improvements within Lake Tapps Reservoir property',
    contact: 'Paul Anderson',
    email: 'panderson@cascadewater.org',
    phone: '(425) 453-0930',
  },
  shoreline_exemption: {
    name: 'Shoreline Exemption',
    agency: 'City of Bonney Lake',
    description: 'For projects under $7,047 in value',
    email: 'permits@cobl.us',
    phone: '(253) 447-4356',
  },
  shoreline_substantial: {
    name: 'Substantial Development Permit',
    agency: 'City of Bonney Lake',
    description: 'For projects over $7,047 in value',
    email: 'permits@cobl.us',
    phone: '(253) 447-4356',
  },
  hpa: {
    name: 'Hydraulic Project Approval (HPA)',
    agency: 'WA Dept. of Fish & Wildlife',
    description: 'Required for work in or near water',
    email: 'HPAapplications@dfw.wa.gov',
    phone: '(360) 902-2534',
  },
  section_10: {
    name: 'Section 10 Permit',
    agency: 'U.S. Army Corps of Engineers',
    description: 'For structures in navigable waters',
    email: 'paoteam@nws02.usace.army.mil',
    phone: '(206) 764-3495',
  },
};

export default function PermitApplicationsStage() {
  const { project, updatePermit } = useStore();

  if (!project) return null;

  const { requiredPermits, permits } = project;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Permit Applications
        </h1>
        <p className="text-slate-600">
          Complete the required permit applications based on your project details.
        </p>
      </div>

      {/* Required Permits List */}
      <div className="space-y-4">
        {requiredPermits.map((permitType) => {
          const info = PERMIT_INFO[permitType as keyof typeof PERMIT_INFO];
          const permit = permits[permitType];

          if (!info) return null;

          const statusColors = {
            not_started: 'bg-slate-100 text-slate-600',
            in_progress: 'bg-amber-100 text-amber-700',
            ready: 'bg-emerald-100 text-emerald-700',
            submitted: 'bg-blue-100 text-blue-700',
            approved: 'bg-green-100 text-green-700',
            denied: 'bg-red-100 text-red-700',
          };

          const statusLabels = {
            not_started: 'Not Started',
            in_progress: 'In Progress',
            ready: 'Ready to Submit',
            submitted: 'Submitted',
            approved: 'Approved',
            denied: 'Denied',
          };

          return (
            <div key={permitType} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{info.name}</h3>
                  <p className="text-sm text-slate-600">{info.agency}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[permit?.status || 'not_started']}`}>
                  {statusLabels[permit?.status || 'not_started']}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4">{info.description}</p>

              <div className="flex items-center gap-4 text-sm">
                {info.email && (
                  <a
                    href={`mailto:${info.email}`}
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {info.email}
                  </a>
                )}
                {info.phone && (
                  <a
                    href={`tel:${info.phone}`}
                    className="text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {info.phone}
                  </a>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => updatePermit(permitType, { status: 'in_progress' })}
                  className="btn btn-primary btn-sm"
                >
                  Start Application
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {requiredPermits.length === 0 && (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-600">No permits have been identified yet.</p>
          <p className="text-sm text-slate-500 mt-1">
            Complete the previous steps to determine required permits.
          </p>
        </div>
      )}
    </div>
  );
}
