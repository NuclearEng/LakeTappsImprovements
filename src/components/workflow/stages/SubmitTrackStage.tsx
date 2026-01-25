'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { getRequiredEmails, AGENCY_CONTACTS, type EmailTemplate } from '@/lib/emailTemplates';
import type { PermitType } from '@/types';

interface EmailPreviewModalProps {
  isOpen: boolean;
  template: EmailTemplate | null;
  mailtoUrl: string | null;
  onClose: () => void;
  onSend: () => void;
}

function EmailPreviewModal({ isOpen, template, mailtoUrl, onClose, onSend }: EmailPreviewModalProps) {
  if (!isOpen || !template) return null;

  const handleCopyBody = () => {
    navigator.clipboard.writeText(template.body);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl p-0" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Email Preview</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Email Header */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 w-16">To:</span>
              <span className="text-sm text-slate-900">{template.to}</span>
            </div>
            {template.cc && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 w-16">CC:</span>
                <span className="text-sm text-slate-900">{template.cc}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 w-16">Subject:</span>
              <span className="text-sm text-slate-900 font-medium">{template.subject}</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="border border-slate-200 rounded-lg">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Message Body</span>
              <button
                onClick={handleCopyBody}
                className="text-sm text-primary-600 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Text
              </button>
            </div>
            <pre className="p-4 text-sm text-slate-700 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">
              {template.body}
            </pre>
          </div>

          {/* Attachment Reminder */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="text-sm text-amber-800">
                <p className="font-medium">Remember to attach:</p>
                <ul className="mt-1 space-y-0.5">
                  <li>• Completed application form (PDF)</li>
                  <li>• Site plan drawing</li>
                  <li>• Photos of the project area</li>
                  <li>• Any additional required documents</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <a
            href={mailtoUrl || '#'}
            onClick={onSend}
            className="btn btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Open in Email Client
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SubmitTrackStage() {
  const { project, updatePermit, addNotification } = useStore();
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [previewMailtoUrl, setPreviewMailtoUrl] = useState<string | null>(null);

  // Generate required emails based on project
  const requiredEmails = useMemo(() => {
    if (!project) return [];
    return getRequiredEmails(project);
  }, [project]);

  // Count submissions by status
  const statusCounts = useMemo(() => {
    const counts = {
      pending: 0,
      submitted: 0,
      approved: 0,
    };

    if (!project) return counts;

    requiredEmails.forEach((email) => {
      const permit = project.permits[email.id as PermitType];
      const status = permit?.status || 'not_started';
      if (status === 'submitted') counts.submitted++;
      else if (status === 'approved') counts.approved++;
      else counts.pending++;
    });

    return counts;
  }, [requiredEmails, project]);

  if (!project) return null;

  const handlePreviewEmail = (template: EmailTemplate, mailtoUrl: string) => {
    setPreviewTemplate(template);
    setPreviewMailtoUrl(mailtoUrl);
  };

  const handleClosePreview = () => {
    setPreviewTemplate(null);
    setPreviewMailtoUrl(null);
  };

  const handleMarkSubmitted = (id: string) => {
    updatePermit(id as PermitType, {
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

    handleClosePreview();
  };

  const getAgencyContact = (agencyName: string) => {
    const key = Object.keys(AGENCY_CONTACTS).find(
      (k) => AGENCY_CONTACTS[k as keyof typeof AGENCY_CONTACTS].name === agencyName
    );
    return key ? AGENCY_CONTACTS[key as keyof typeof AGENCY_CONTACTS] : null;
  };

  const statusConfig = {
    not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-600' },
    in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-700' },
    ready: { label: 'Ready to Submit', color: 'bg-blue-100 text-blue-700' },
    submitted: { label: 'Submitted', color: 'bg-purple-100 text-purple-700' },
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

      {/* Progress Overview */}
      <div className="card mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Submission Progress</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-3xl font-bold text-slate-600">{statusCounts.pending}</div>
            <div className="text-sm text-slate-500">Pending</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{statusCounts.submitted}</div>
            <div className="text-sm text-purple-600">Submitted</div>
          </div>
          <div className="text-center p-4 bg-emerald-50 rounded-lg">
            <div className="text-3xl font-bold text-emerald-600">{statusCounts.approved}</div>
            <div className="text-sm text-emerald-600">Approved</div>
          </div>
        </div>
      </div>

      {/* Submission Checklist */}
      <div className="space-y-4 mb-8">
        {requiredEmails.map((email) => {
          const permit = project.permits[email.id as PermitType];
          const status = permit?.status || 'not_started';
          const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_started;
          const contact = getAgencyContact(email.agency);

          return (
            <div key={email.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900">{email.template.subject.split(' - ')[0]}</h3>
                  <p className="text-sm text-slate-600">{email.agency}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Submit To</p>
                    <p className="font-medium text-slate-900">{email.template.to}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Contact</p>
                    <p className="font-medium text-slate-900">{contact?.contact || 'Agency Contact'}</p>
                  </div>
                  {contact?.phone && (
                    <div>
                      <p className="text-slate-500">Phone</p>
                      <a href={`tel:${contact.phone}`} className="font-medium text-primary-600 hover:underline">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                  {permit?.submittedAt && (
                    <div>
                      <p className="text-slate-500">Submitted On</p>
                      <p className="font-medium text-slate-900">
                        {new Date(permit.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePreviewEmail(email.template, email.mailtoUrl)}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {status === 'submitted' || status === 'approved' ? 'View Email' : 'Compose Email'}
                </button>

                {status !== 'submitted' && status !== 'approved' && (
                  <button
                    onClick={() => handleMarkSubmitted(email.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    Mark as Submitted
                  </button>
                )}

                {status === 'submitted' && (
                  <>
                    <button
                      onClick={() => updatePermit(email.id as PermitType, { status: 'approved' })}
                      className="btn btn-success btn-sm"
                    >
                      Mark Approved
                    </button>
                    <button
                      onClick={() => updatePermit(email.id as PermitType, { status: 'denied' })}
                      className="btn btn-danger btn-sm"
                    >
                      Mark Denied
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              // Open all email previews sequentially
              if (requiredEmails.length > 0) {
                handlePreviewEmail(requiredEmails[0].template, requiredEmails[0].mailtoUrl);
              }
            }}
            className="btn btn-outline flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Compose All Emails
          </button>

          <a
            href={AGENCY_CONTACTS.bonney_lake.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Bonney Lake Permit Portal
          </a>
        </div>
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
              You have completed the Lake Tapps permit workflow. Your information has been saved locally
              and you can return at any time to generate additional documents or track your submissions.
            </p>
            <p className="text-sm text-emerald-700 mt-3">
              <strong>Next Steps:</strong> Use the pre-populated emails above to submit your applications.
              Remember to attach your generated documents before sending.
            </p>
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={!!previewTemplate}
        template={previewTemplate}
        mailtoUrl={previewMailtoUrl}
        onClose={handleClosePreview}
        onSend={() => handleMarkSubmitted(requiredEmails.find(e => e.template === previewTemplate)?.id || '')}
      />
    </div>
  );
}
