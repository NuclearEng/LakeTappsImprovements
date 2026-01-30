'use client';

import { useStore, getWorkflowStages } from '@/store/useStore';

export default function ProgressBar() {
  const { currentStage, goToStage, project } = useStore();
  const workflowType = project?.workflowType || 'waterfront';
  const stages = getWorkflowStages(workflowType);
  const totalStages = stages.length;
  const progress = ((currentStage - 1) / (totalStages - 1)) * 100;

  const currentStageName = stages.find((s) => s.id === currentStage)?.name || '';

  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-4 no-print sticky top-[73px] z-20">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Stage indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full">
              Step {currentStage} of {totalStages}
            </span>
            <span className="text-sm font-medium text-slate-700">{currentStageName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-slate-600">
              {Math.round(progress)}% Complete
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
          />
        </div>

        {/* Stage dots */}
        <div className="hidden md:flex items-center justify-between mt-4">
          {stages.map((stage, index) => {
            const isComplete = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;
            const isClickable = isComplete || isCurrent;

            const handleStageClick = () => {
              if (isClickable && stage.id !== currentStage) {
                goToStage(stage.id);
              }
            };

            return (
              <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <button
                    onClick={handleStageClick}
                    disabled={!isClickable}
                    className={`stage-dot ${
                      isComplete
                        ? 'stage-dot-complete'
                        : isCurrent
                        ? 'stage-dot-current'
                        : 'stage-dot-upcoming'
                    } ${
                      isClickable && !isCurrent
                        ? 'cursor-pointer hover:ring-2 hover:ring-primary-300 hover:ring-offset-2 transition-all'
                        : isCurrent
                        ? 'cursor-default'
                        : 'cursor-not-allowed'
                    }`}
                    title={isClickable ? `Go to ${stage.name}` : `Complete previous steps first`}
                    aria-label={`${stage.name}${isComplete ? ' (completed)' : isCurrent ? ' (current)' : ' (upcoming)'}`}
                  >
                    {isComplete ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stage.id
                    )}
                  </button>
                  <span
                    className={`mt-1 text-xs text-center max-w-[60px] ${
                      isCurrent ? 'text-primary-600 font-medium' : 'text-slate-500'
                    } ${isClickable && !isCurrent ? 'cursor-pointer' : ''}`}
                    onClick={handleStageClick}
                  >
                    {stage.name}
                  </span>
                </div>
                {index < stages.length - 1 && (
                  <div
                    className={`stage-line ${
                      isComplete ? 'stage-line-complete' : 'stage-line-incomplete'
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
