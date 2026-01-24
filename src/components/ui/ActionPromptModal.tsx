'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

export default function ActionPromptModal() {
  const { currentActionPrompt, hideActionPrompt, completeActionPrompt, addNotification } = useStore();
  const [acknowledged, setAcknowledged] = useState(false);

  if (!currentActionPrompt) return null;

  const handleComplete = () => {
    if (!acknowledged) {
      addNotification({
        type: 'warning',
        title: 'Acknowledgment Required',
        message: 'Please check the box to confirm you have completed this action.',
        dismissible: true,
        duration: 5000,
      });
      return;
    }

    completeActionPrompt(currentActionPrompt.id);
    hideActionPrompt();
    setAcknowledged(false);

    addNotification({
      type: 'success',
      title: 'Action Completed',
      message: `${currentActionPrompt.title} has been marked as complete.`,
      dismissible: true,
      duration: 5000,
    });
  };

  const handleSkip = () => {
    hideActionPrompt();
    setAcknowledged(false);
  };

  const getActionIcon = () => {
    switch (currentActionPrompt.type) {
      case 'download':
        return (
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        );
      case 'email':
        return (
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'submit':
        return (
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'upload':
        return (
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        );
      case 'call':
        return (
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay animate-fade-in" role="dialog" aria-modal="true">
      <div className="modal-content max-w-xl animate-slide-in">
        {/* Header */}
        <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
              {getActionIcon()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                {currentActionPrompt.title}
              </h2>
              <p className="text-sm text-slate-600">{currentActionPrompt.agency}</p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-6 py-4">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
            Instructions
          </h3>
          <ol className="space-y-3">
            {currentActionPrompt.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-slate-700">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Contact Info */}
        {currentActionPrompt.contactInfo && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {currentActionPrompt.contactInfo.email && (
                <div>
                  <p className="text-slate-500">Email</p>
                  <a
                    href={`mailto:${currentActionPrompt.contactInfo.email}`}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    {currentActionPrompt.contactInfo.email}
                  </a>
                </div>
              )}
              {currentActionPrompt.contactInfo.phone && (
                <div>
                  <p className="text-slate-500">Phone</p>
                  <a
                    href={`tel:${currentActionPrompt.contactInfo.phone}`}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    {currentActionPrompt.contactInfo.phone}
                  </a>
                </div>
              )}
              {currentActionPrompt.contactInfo.website && (
                <div>
                  <p className="text-slate-500">Website</p>
                  <a
                    href={currentActionPrompt.contactInfo.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Acknowledgment */}
        <div className="px-6 py-4 border-t border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-slate-700">
              I have completed this action or will complete it before continuing.
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
          <button onClick={handleSkip} className="btn btn-secondary">
            Skip for Now
          </button>
          <button onClick={handleComplete} className="btn btn-primary">
            Mark as Complete
          </button>
        </div>
      </div>
    </div>
  );
}
