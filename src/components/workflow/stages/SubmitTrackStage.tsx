'use client';

import { useStore } from '@/store/useStore';

interface SubmissionInfo {
  id: string;
  name: string;
  agency: string;
  method: 'Email' | 'Online Portal' | 'Mail' | 'In Person';
  to: string;
  contact?: string;
  phone: string;
  website?: string;
}

const SUBMISSION_DATA: Record<string, SubmissionInfo> = {
  cwa_license: {
    id: 'cwa_license',
    name: 'CWA License Application',
    agency: 'Cascade Water Alliance',
    method: 'Email',
    to: 'panderson@cascadewater.org',
    contact: 'Paula Anderson',
    phone: '(425) 453-0930',
  },
  shoreline_exemption: {
    id: 'shoreline_exemption',
    name: 'Shoreline Exemption',
    agency: 'City of Bonney Lake',
    method: 'Online Portal',
    to: 'web.ci.bonney-lake.wa.us',
    contact: 'Permit Center',
    phone: '(253) 447-4356',
  },
  shoreline_substantial: {
    id: 'shoreline_substantial',
    name: 'Substantial Development Permit',
    agency: 'City of Bonney Lake',
    method: 'Online Portal',
    to: 'web.ci.bonney-lake.wa.us',
    contact: 'Permit Center',
    phone: '(253) 447-4356',
  },
  shoreline_conditional: {
    id: 'shoreline_conditional',
    name: 'Conditional Use Permit',
    agency: 'City of Bonney Lake',
    method: 'Online Portal',
    to: 'web.ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
  },
  shoreline_variance: {
    id: 'shoreline_variance',
    name: 'Shoreline Variance',
    agency: 'City of Bonney Lake',
    method: 'Online Portal',
    to: 'web.ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
  },
  hpa: {
    id: 'hpa',
    name: 'Hydraulic Project Approval (HPA)',
    agency: 'WA Dept. of Fish & Wildlife',
    method: 'Email',
    to: 'HPAapplications@dfw.wa.gov',
    phone: '(360) 902-2534',
  },
  section_10: {
    id: 'section_10',
    name: 'Section 10 Permit',
    agency: 'U.S. Army Corps of Engineers',
    method: 'Email',
    to: 'paoteam@nws02.usace.army.mil',
    phone: '(206) 764-3495',
  },
  section_404: {
    id: 'section_404',
    name: 'Section 404 Permit',
    agency: 'U.S. Army Corps of Engineers',
    method: 'Email',
    to: 'paoteam@nws02.usace.army.mil',
    phone: '(206) 764-3495',
  },
  water_quality_401: {
    id: 'water_quality_401',
    name: '401 Water Quality Certification',
    agency: 'WA Dept. of Ecology',
    method: 'Online Portal',
    to: 'ecology.wa.gov',
    phone: '(360) 407-6000',
  },
  pierce_building_permit: {
    id: 'pierce_building_permit',
    name: 'Pierce County Building Permit',
    agency: 'Pierce County Development Center',
    method: 'Online Portal',
    to: 'piercecountywa.gov/903',
    phone: '(253) 798-3739',
  },
  building_permit: {
    id: 'building_permit',
    name: 'Building Permit',
    agency: 'Pierce County Development Center',
    method: 'Online Portal',
    to: 'piercecountywa.gov/903',
    phone: '(253) 798-3739',
  },
  lni_electrical_permit: {
    id: 'lni_electrical_permit',
    name: 'WA State Electrical Work Permit',
    agency: 'WA Dept. of Labor & Industries',
    method: 'Online Portal',
    to: 'secure.lni.wa.gov/epispub',
    phone: '(360) 902-5800',
    website: 'lni.wa.gov',
  },
  solar_building_permit: {
    id: 'solar_building_permit',
    name: 'Solar Building Permit',
    agency: 'Pierce County Planning & Public Works',
    method: 'Online Portal',
    to: 'piercecountywa.gov/PPW',
    phone: '(253) 798-3739',
  },
  utility_interconnection: {
    id: 'utility_interconnection',
    name: 'Utility Interconnection Application',
    agency: 'Utility Provider',
    method: 'Online Portal',
    to: 'pse.com/green-options',
    phone: '1-800-562-1482',
  },
  adu_building_permit: {
    id: 'adu_building_permit',
    name: 'ADU Building Permit',
    agency: 'Pierce County Planning & Public Works',
    method: 'Online Portal',
    to: 'piercecountywa.gov/PPW',
    phone: '(253) 798-3739',
  },
  planning_approval: {
    id: 'planning_approval',
    name: 'Planning Department Approval',
    agency: 'Pierce County Planning & Public Works',
    method: 'Online Portal',
    to: 'piercecountywa.gov/PPW',
    phone: '(253) 798-3739',
  },
  septic_permit: {
    id: 'septic_permit',
    name: 'Septic System Permit',
    agency: 'Pierce County Health Department',
    method: 'In Person',
    to: 'Pierce County Health Dept.',
    phone: '(253) 798-6470',
  },
  adu_shoreline_permit: {
    id: 'adu_shoreline_permit',
    name: 'Shoreline Permit (ADU)',
    agency: 'City of Bonney Lake',
    method: 'Online Portal',
    to: 'web.ci.bonney-lake.wa.us',
    phone: '(253) 447-4356',
  },
};

export default function SubmitTrackStage() {
  const { project, updatePermit, addNotification } = useStore();

  if (!project) return null;

  const { requiredPermits, solarPermits, aduPermits, workflowType, permits } = project;

  // Build dynamic submission list based on workflow type
  const allPermitTypes: string[] = workflowType === 'solar'
    ? [...(solarPermits || [])]
    : workflowType === 'adu'
    ? [...(aduPermits || [])]
    : [...requiredPermits];

  const submissions = allPermitTypes.map((permitType) => {
    const info = SUBMISSION_DATA[permitType];
    if (!info) return null;
    return {
      ...info,
      status: permits[permitType]?.status || 'not_started',
      confirmationNumber: permits[permitType]?.confirmationNumber || '',
    };
  }).filter(Boolean) as (SubmissionInfo & { status: string; confirmationNumber: string })[];

  const handleMarkSubmitted = (id: string) => {
    updatePermit(id as any, {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    });

    addNotification({
      type: 'success',
      title: 'Marked as Submitted',
      message: 'This application has been marked as submitted. Track your progress below.',
      dismissible: true,
      duration: 5000,
    });
  };

  const handleConfirmationNumber = (id: string, value: string) => {
    updatePermit(id as any, { confirmationNumber: value });
  };

  const statusConfig = {
    not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
    ready: { label: 'Ready to Submit', color: 'bg-amber-100 text-amber-700' },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
    denied: { label: 'Denied', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Submit & Track
        </h1>
        <p className="text-slate-600">
          Submit your applications and track their progress through the approval process.
        </p>
      </div>

      {/* Submission Checklist */}
      <div className="space-y-4 mb-8">
        {submissions.map((submission) => {
          const status = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.not_started;

          return (
            <div key={submission.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{submission.name}</h3>
                  <p className="text-sm text-slate-600">{submission.agency}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                  {status.label}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Submission Method</p>
                    <p className="font-medium text-slate-900">{submission.method}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Submit To</p>
                    <p className="font-medium text-slate-900">{submission.to}</p>
                  </div>
                  {submission.contact && (
                    <div>
                      <p className="text-slate-500">Contact</p>
                      <p className="font-medium text-slate-900">{submission.contact}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">{submission.phone}</p>
                  </div>
                </div>
              </div>

              {/* Confirmation number input for submitted permits */}
              {submission.status === 'submitted' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmation Number
                  </label>
                  <input
                    type="text"
                    value={submission.confirmationNumber}
                    onChange={(e) => handleConfirmationNumber(submission.id, e.target.value)}
                    placeholder="Enter confirmation or tracking number"
                    className="w-full max-w-md px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/10"
                  />
                </div>
              )}

              <div className="flex gap-2">
                {submission.method === 'Email' && (
                  <a
                    href={`mailto:${submission.to}`}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Open Email
                  </a>
                )}
                {(submission.method === 'Online Portal') && (
                  <a
                    href={`https://${submission.to}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Portal
                  </a>
                )}
                {submission.status !== 'submitted' && submission.status !== 'approved' && (
                  <button
                    onClick={() => handleMarkSubmitted(submission.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Mark as Submitted
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {submissions.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-slate-600">No permits have been identified yet.</p>
          <p className="text-sm text-slate-500 mt-1">Complete the previous steps to determine required permits.</p>
        </div>
      )}

      {/* Completion Message */}
      <div className="card bg-emerald-50 border-emerald-200">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900">Workflow Complete!</h3>
            <p className="text-sm text-emerald-800 mt-1">
              You have completed the Lake Tapps permit workflow. Your information has been saved locally and you can return at any time to generate additional documents or track your submissions.
            </p>
            <p className="text-sm text-emerald-700 mt-3">
              <strong>Next Steps:</strong> Submit your applications to the respective agencies and await their review. Processing times vary by agency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
