'use client';

import { useStore } from '@/store/useStore';

export default function NavigationControls() {
  const {
    currentStage,
    previousStage,
    nextStage,
    canGoBack,
    canGoForward,
    saveProject,
    showConfirmation,
  } = useStore();

  const handleBack = () => {
    if (canGoBack()) {
      showConfirmation({
        title: 'Go Back?',
        message: 'Your progress on this step will be saved. Do you want to go back to the previous step?',
        confirmLabel: 'Go Back',
        cancelLabel: 'Stay Here',
        onConfirm: () => {
          saveProject();
          previousStage();
        },
        onCancel: () => {},
        variant: 'info',
      });
    }
  };

  const handleNext = () => {
    // Save before moving forward
    saveProject();
    nextStage();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-20 no-print">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={!canGoBack()}
            className="btn btn-secondary flex items-center gap-2"
            aria-label="Go to previous step"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back</span>
          </button>

          {/* Stage info (mobile) */}
          <div className="md:hidden text-center">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStage}
            </span>
          </div>

          {/* Continue button */}
          <button
            onClick={handleNext}
            disabled={!canGoForward()}
            className="btn btn-primary flex items-center gap-2"
            aria-label="Continue to next step"
          >
            <span>Continue</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
