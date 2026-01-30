'use client';

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';

export default function Header() {
  const { isSaving, lastSaved, project } = useStore();
  const [showSavedAnimation, setShowSavedAnimation] = useState(false);

  // Show brief animation when save completes
  useEffect(() => {
    if (lastSaved && !isSaving) {
      setShowSavedAnimation(true);
      const timer = setTimeout(() => setShowSavedAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSaved, isSaving]);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const date = new Date(lastSaved);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 max-w-5xl">
        <div className="flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-lake-500 to-lake-600 rounded-xl flex items-center justify-center shadow-lg shadow-lake-500/25 transition-transform hover:scale-105">
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
              {/* Subtle ripple effect on logo */}
              <div className="absolute inset-0 rounded-xl bg-lake-500/20 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Lake Tapps Permits
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                {project ? `Project: ${project.owner.lastName || 'New'}` : 'Permit Workflow'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Save status indicator - Enhanced */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
              isSaving
                ? 'bg-slate-100'
                : showSavedAnimation
                ? 'bg-emerald-50'
                : 'bg-transparent'
            }`}>
              {isSaving ? (
                <>
                  <div className="w-4 h-4 spinner spinner-sm" />
                  <span className="text-sm text-slate-600 font-medium">Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <div className={`transition-all duration-300 ${showSavedAnimation ? 'scale-110' : 'scale-100'}`}>
                    <svg
                      className={`w-4 h-4 transition-colors ${showSavedAnimation ? 'text-emerald-500' : 'text-slate-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    showSavedAnimation ? 'text-emerald-600' : 'text-slate-500'
                  }`}>
                    {showSavedAnimation ? 'Saved!' : formatLastSaved()}
                  </span>
                </>
              ) : null}
            </div>

            {/* Divider */}
            {lastSaved && <div className="w-px h-6 bg-slate-200" />}

            {/* Help button - Enhanced */}
            <button
              className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 group"
              aria-label="Help & Support"
              title="Help & Support"
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
              {/* Tooltip on hover */}
              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                Help
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
