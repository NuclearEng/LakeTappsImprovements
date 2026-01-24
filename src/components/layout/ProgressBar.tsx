'use client';

import { useStore, WORKFLOW_STAGES } from '@/store/useStore';

export default function ProgressBar() {
  const { currentStage } = useStore();
  const totalStages = WORKFLOW_STAGES.length;
  const progress = ((currentStage - 1) / (totalStages - 1)) * 100;

  const currentStageName = WORKFLOW_STAGES.find((s) => s.id === currentStage)?.name || '';

  return (
    <div className="bg-white border-b border-slate-200 py-4 no-print">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Stage indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">
              Step {currentStage} of {totalStages}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-sm text-slate-600">{currentStageName}</span>
          </div>
          <span className="text-sm font-medium text-primary-600">
            {Math.round(progress)}% Complete
          </span>
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
          {WORKFLOW_STAGES.map((stage, index) => {
            const isComplete = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;

            return (
              <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`stage-dot ${
                      isComplete
                        ? 'stage-dot-complete'
                        : isCurrent
                        ? 'stage-dot-current'
                        : 'stage-dot-upcoming'
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stage.id
                    )}
                  </div>
                  <span
                    className={`mt-1 text-xs text-center max-w-[60px] ${
                      isCurrent ? 'text-primary-600 font-medium' : 'text-slate-500'
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
                {index < WORKFLOW_STAGES.length - 1 && (
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
