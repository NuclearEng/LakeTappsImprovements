'use client';

import { useStore, WORKFLOW_STAGES } from '@/store/useStore';
import { useMemo } from 'react';
import { validateStage } from '@/lib/stageValidation';
import { saveStageCompletionVersion } from '@/lib/db';

export default function NavigationControls() {
  const {
    currentStage,
    project,
    previousStage,
    nextStage,
    canGoBack,
    canGoForward,
    saveProject,
    showConfirmation,
    addNotification,
  } = useStore();

  // Validate current stage
  const stageValidation = useMemo(() => {
    return validateStage(currentStage, project);
  }, [currentStage, project]);

  const handleBack = () => {
    if (canGoBack()) {
      // Don't show confirmation, just save and go back
      saveProject();
      previousStage();
    }
  };

  const handleNext = async () => {
    // Check if we can proceed
    if (!stageValidation.canProceed) {
      addNotification({
        type: 'error',
        title: 'Cannot Proceed',
        message: stageValidation.blockingMessage || 'Please complete the required fields before continuing.',
        dismissible: true,
        duration: 5000,
      });
      return;
    }

    const currentStageName = WORKFLOW_STAGES.find(s => s.id === currentStage)?.name || `Stage ${currentStage}`;

    // Show warning if there are incomplete fields but we can still proceed
    if (stageValidation.warningMessage) {
      showConfirmation({
        title: 'Continue with Incomplete Information?',
        message: `Some optional fields are missing: ${stageValidation.warningMessage}. You can complete them later. Continue anyway?`,
        confirmLabel: 'Continue',
        cancelLabel: 'Stay & Complete',
        onConfirm: async () => {
          saveProject();
          // Save version when completing a stage
          if (project && stageValidation.isComplete) {
            await saveStageCompletionVersion(project, currentStageName);
          }
          nextStage();
        },
        onCancel: () => {},
        variant: 'warning',
      });
      return;
    }

    // Save before moving forward
    saveProject();

    // Save version when completing a stage (if stage is complete)
    if (project && stageValidation.isComplete) {
      await saveStageCompletionVersion(project, currentStageName);
    }

    nextStage();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-lg z-20 no-print">
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

          {/* Stage info and validation status (mobile) */}
          <div className="md:hidden text-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Step {currentStage}
            </span>
            {!stageValidation.canProceed && (
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                Complete required fields
              </div>
            )}
          </div>

          {/* Desktop validation message */}
          <div className="hidden md:block">
            {!stageValidation.canProceed ? (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm">{stageValidation.blockingMessage}</span>
              </div>
            ) : stageValidation.warningMessage ? (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">Optional fields remaining</span>
              </div>
            ) : stageValidation.isComplete ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Section complete</span>
              </div>
            ) : null}
          </div>

          {/* Continue button */}
          <button
            onClick={handleNext}
            disabled={!canGoForward()}
            className={`btn flex items-center gap-2 ${
              stageValidation.canProceed ? 'btn-primary' : 'btn-secondary'
            }`}
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
