'use client';

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { getAllProjects } from '@/lib/db';
import ProjectDashboard from '@/components/ProjectDashboard';

export default function WelcomeStage() {
  const { nextStage, createProject, loadProject } = useStore();
  const [showDashboard, setShowDashboard] = useState(false);
  const [savedProjectCount, setSavedProjectCount] = useState(0);

  useEffect(() => {
    // Check for saved projects on mount
    getAllProjects().then((projects) => {
      setSavedProjectCount(projects.length);
    });
  }, []);

  const handleNewProject = () => {
    createProject();
    nextStage();
    setShowDashboard(false);
  };

  const handleSelectProject = async (projectId: string) => {
    await loadProject(projectId);
    setShowDashboard(false);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-lake-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-lake-600"
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Lake Tapps Permit Workflow
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Your guided assistant for navigating the permit process for improvements on Lake Tapps Reservoir.
        </p>
      </div>

      {/* Saved Projects Banner */}
      {savedProjectCount > 0 && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  You have {savedProjectCount} saved project{savedProjectCount !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-600">
                  Continue where you left off or start a new application
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDashboard(true)}
              className="btn btn-outline"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View All Projects
            </button>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Guided Process</h3>
          <p className="text-sm text-slate-600">
            Step-by-step guidance through every permit requirement
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Document Generation</h3>
          <p className="text-sm text-slate-600">
            Automatically generate properly formatted application documents
          </p>
        </div>

        <div className="card">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1">Local & Private</h3>
          <p className="text-sm text-slate-600">
            All data stays on your computer - nothing is uploaded to servers
          </p>
        </div>
      </div>

      {/* What You'll Need */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          What You&apos;ll Need
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Property Information</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Property address and parcel number
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Site plan or survey (if available)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Photos of proposed improvement location
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-700 mb-2">Project Details</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Description of planned improvements
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Estimated project cost
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Approximate start/completion dates
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Agencies Info */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Agencies Involved
        </h2>
        <p className="text-sm text-slate-600 mb-4">
          This application will help you prepare documents for submission to the following agencies (as required by your specific project):
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            'Cascade Water Alliance',
            'City of Bonney Lake',
            'Pierce County',
            'WA Dept. of Fish & Wildlife',
            'Army Corps of Engineers',
            'WA Dept. of Ecology',
          ].map((agency) => (
            <span
              key={agency}
              className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
            >
              {agency}
            </span>
          ))}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900">Your Data Stays Local</h3>
            <p className="text-sm text-blue-800 mt-1">
              This application stores all your information locally on your computer. Nothing is uploaded to external servers. Your data is saved automatically so you can return at any time.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {savedProjectCount > 0 && (
          <button
            onClick={() => setShowDashboard(true)}
            className="btn btn-secondary btn-lg w-full sm:w-auto"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Open Saved Project
          </button>
        )}
        <button
          onClick={handleNewProject}
          className="btn btn-primary btn-lg w-full sm:w-auto"
        >
          Start New Project
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Project Dashboard Modal */}
      {showDashboard && (
        <ProjectDashboard
          onClose={() => setShowDashboard(false)}
          onSelectProject={handleSelectProject}
          onNewProject={handleNewProject}
        />
      )}
    </div>
  );
}
