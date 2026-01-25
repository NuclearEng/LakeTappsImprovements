'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ThemeToggle } from '@/components/ThemeProvider';
import VersionHistoryPanel from '@/components/VersionHistoryPanel';

export default function Header() {
  const { isSaving, lastSaved } = useStore();
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const date = new Date(lastSaved);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-30"
      role="banner"
    >
      <div className="container mx-auto px-4 py-3 max-w-5xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 bg-lake-600 dark:bg-lake-500 rounded-lg flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Lake Tapps Permits
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Permit Workflow Application</p>
            </div>
          </div>

          <div className="flex items-center gap-4" role="toolbar" aria-label="Application tools">
            {/* Save status indicator */}
            <div
              className="flex items-center gap-2 text-sm"
              role="status"
              aria-live="polite"
              aria-label={isSaving ? 'Saving project' : lastSaved ? `Last saved at ${formatLastSaved()}` : ''}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 spinner border-2" aria-hidden="true" />
                  <span className="text-slate-500 dark:text-slate-400">Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <svg
                    className="w-4 h-4 text-emerald-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-slate-500 dark:text-slate-400">
                    Saved {formatLastSaved()}
                  </span>
                </>
              ) : null}
            </div>

            {/* Version History button */}
            <button
              onClick={() => setShowVersionHistory(true)}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Version History"
              title="Version History"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Help button */}
            <button
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Help"
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
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Version History Panel */}
      <VersionHistoryPanel
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
      />
    </header>
  );
}
