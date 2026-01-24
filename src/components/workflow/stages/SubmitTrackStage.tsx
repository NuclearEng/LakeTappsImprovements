'use client';

import { useStore } from '@/store/useStore';

export default function SubmitTrackStage() {
  const { project, updatePermit, addNotification } = useStore();

  if (!project) return null;

  const submissions = [
    {
      id: 'cwa_license',
      name: 'CWA License Application',
      agency: 'Cascade Water Alliance',
      method: 'Email',
      to: 'panderson@cascadewater.org',
      contact: 'Paul Anderson',
      phone: '(425) 453-0930',
      status: project.permits.cwa_license?.status || 'not_started',
    },
    {
      id: 'shoreline',
      name: 'Shoreline Permit',
      agency: 'City of Bonney Lake',
      method: 'Online Portal',
      to: 'web.ci.bonney-lake.wa.us',
      contact: 'Permit Center',
      phone: '(253) 447-4356',
      status: 'not_started',
    },
  ];

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

  const statusConfig = {
    not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-600' },
    ready: { label: 'Ready to Submit', color: 'bg-amber-100 text-amber-700' },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
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
                  <div>
                    <p className="text-slate-500">Contact</p>
                    <p className="font-medium text-slate-900">{submission.contact}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Phone</p>
                    <p className="font-medium text-slate-900">{submission.phone}</p>
                  </div>
                </div>
              </div>

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
                {submission.method === 'Online Portal' && (
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
