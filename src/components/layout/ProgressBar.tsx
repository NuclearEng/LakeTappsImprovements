'use client';

import { useStore, WORKFLOW_STAGES } from '@/store/useStore';
import { useMemo } from 'react';
import { validateStage, getProjectCompletionStatus } from '@/lib/stageValidation';

export default function ProgressBar() {
  const { currentStage, project, goToStage } = useStore();
  const totalStages = WORKFLOW_STAGES.length;
  const progress = ((currentStage - 1) / (totalStages - 1)) * 100;

  const currentStageName = WORKFLOW_STAGES.find((s) => s.id === currentStage)?.name || '';

  // Get completion status for all stages
  const completionStatus = useMemo(() => {
    return getProjectCompletionStatus(project);
  }, [project]);

  // Handle clicking on a stage dot to navigate
  const handleStageClick = (stageId: number) => {
    // Only allow going back to previous stages or current
    if (stageId <= currentStage && stageId !== currentStage) {
      goToStage(stageId);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 py-4 no-print">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Stage indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Step {currentStage} of {totalStages}
            </span>
            <span className="text-slate-400 dark:text-slate-500">|</span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{currentStageName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {completionStatus.completedStages}/{completionStatus.totalStages} sections complete
            </span>
            <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Progress: ${Math.round(progress)}% complete`}
          />
        </div>

        {/* Stage dots */}
        <div className="hidden md:flex items-center justify-between mt-4">
          {WORKFLOW_STAGES.map((stage, index) => {
            const isPast = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;
            const stageValidation = completionStatus.stageStatuses[stage.id];
            const isComplete = stageValidation?.isComplete;
            const canNavigate = stage.id < currentStage;

            return (
              <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleStageClick(stage.id)}
                    disabled={!canNavigate}
                    className={`stage-dot transition-all ${
                      isPast && isComplete
                        ? 'stage-dot-complete'
                        : isPast && !isComplete
                        ? 'stage-dot-warning'
                        : isCurrent
                        ? 'stage-dot-current'
                        : 'stage-dot-upcoming'
                    } ${canNavigate ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                    title={
                      isPast && !isComplete
                        ? 'Incomplete - click to return'
                        : canNavigate
                        ? 'Click to return to this step'
                        : ''
                    }
                    aria-label={`${stage.name}: ${isComplete ? 'Complete' : 'Incomplete'}${canNavigate ? ' - Click to return' : ''}`}
                  >
                    {isPast && isComplete ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : isPast && !isComplete ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                      </svg>
                    ) : (
                      stage.id
                    )}
                  </button>
                  <span
                    className={`mt-1 text-xs text-center max-w-[60px] ${
                      isCurrent
                        ? 'text-primary-600 dark:text-primary-400 font-medium'
                        : isPast && !isComplete
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
                {index < WORKFLOW_STAGES.length - 1 && (
                  <div
                    className={`stage-line ${
                      isPast && isComplete
                        ? 'stage-line-complete'
                        : isPast && !isComplete
                        ? 'stage-line-warning'
                        : 'stage-line-incomplete'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
