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

  const isBackDisabled = !canGoBack();
  const isForwardDisabled = !canGoForward();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-20 no-print">
      <div className="container mx-auto px-4 py-4 max-w-5xl">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={handleBack}
            disabled={isBackDisabled}
            className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
              isBackDisabled
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 active:scale-[0.98]'
            }`}
            aria-label="Go to previous step"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                !isBackDisabled ? 'group-hover:-translate-x-0.5' : ''
              }`}
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
            <span className="px-3 py-1.5 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
              Step {currentStage}
            </span>
          </div>

          {/* Continue button */}
          <button
            onClick={handleNext}
            disabled={isForwardDisabled}
            className={`group relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
              isForwardDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
            }`}
            aria-label="Continue to next step"
          >
            <span>Continue</span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                !isForwardDisabled ? 'group-hover:translate-x-0.5' : ''
              }`}
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
