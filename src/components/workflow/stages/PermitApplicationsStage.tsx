'use client';

import { useStore } from '@/store/useStore';
import { useMemo, useEffect } from 'react';
import { determineRequiredPermits, getPermitSummary } from '@/lib/permitLogic';
import PermitRecommendations from '@/components/PermitRecommendations';
import type { PermitType } from '@/types';

// Map permit logic types to store permit types
const PERMIT_TYPE_MAP: Record<string, PermitType> = {
  cwa_license: 'cwa_license',
  shoreline_exemption: 'shoreline_exemption',
  shoreline_substantial: 'shoreline_substantial',
  hpa: 'hpa',
  section_10: 'section_10',
  section_404: 'section_10', // Map to section_10 as they're often combined
  building_permit: 'cwa_license', // Placeholder - would need to add to PermitType
};

export default function PermitApplicationsStage() {
  const { project, setRequiredPermits, updatePermit } = useStore();

  // Determine required permits based on project details
  const recommendations = useMemo(() => {
    if (!project) return [];
    return determineRequiredPermits(project.details, project.site.elevation);
  }, [project]);

  const summary = useMemo(() => {
    return getPermitSummary(recommendations);
  }, [recommendations]);

  // Sync required permits to store when recommendations change
  useEffect(() => {
    if (!project) return;

    // Get definitely required and likely required permits
    const requiredPermitTypes: PermitType[] = [];

    [...summary.definitelyRequired, ...summary.likelyRequired].forEach((rec) => {
      const permitType = PERMIT_TYPE_MAP[rec.permitType];
      if (permitType && !requiredPermitTypes.includes(permitType)) {
        requiredPermitTypes.push(permitType);
      }
    });

    // Always include CWA license
    if (!requiredPermitTypes.includes('cwa_license')) {
      requiredPermitTypes.unshift('cwa_license');
    }

    // Update store if different
    const currentPermits = project.requiredPermits;
    const isDifferent =
      requiredPermitTypes.length !== currentPermits.length ||
      requiredPermitTypes.some((p) => !currentPermits.includes(p));

    if (isDifferent) {
      setRequiredPermits(requiredPermitTypes);
    }
  }, [summary, project, setRequiredPermits]);

  if (!project) return null;

  const { permits } = project;

  const statusColors = {
    not_started: 'bg-slate-100 text-slate-600',
    in_progress: 'bg-amber-100 text-amber-700',
    ready: 'bg-emerald-100 text-emerald-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    denied: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    ready: 'Ready to Submit',
    submitted: 'Submitted',
    approved: 'Approved',
    denied: 'Denied',
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Permit Requirements
        </h1>
        <p className="text-slate-600">
          Based on your project details, we&apos;ve identified the permits you&apos;ll need.
          Review the requirements below and track your application progress.
        </p>
      </div>

      {/* Smart Permit Recommendations */}
      <PermitRecommendations />

      {/* Application Progress Section */}
      {project.requiredPermits.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Application Progress
          </h2>
          <div className="space-y-3">
            {project.requiredPermits.map((permitType) => {
              const permit = permits[permitType];
              const recommendation = recommendations.find(
                (r) => PERMIT_TYPE_MAP[r.permitType] === permitType
              );

              if (!permit) return null;

              return (
                <div key={permitType} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">
                          {recommendation?.name || permitType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {recommendation?.agency || 'Agency TBD'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[permit.status]}`}>
                        {statusLabels[permit.status]}
                      </span>
                      <select
                        value={permit.status}
                        onChange={(e) => updatePermit(permitType, { status: e.target.value as typeof permit.status })}
                        className="text-sm border-slate-300 rounded-lg"
                      >
                        <option value="not_started">Not Started</option>
                        <option value="in_progress">In Progress</option>
                        <option value="ready">Ready to Submit</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="denied">Denied</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {recommendations.length === 0 && (
        <div className="card text-center py-12">
          <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-600">No permits have been identified yet.</p>
          <p className="text-sm text-slate-500 mt-1">
            Complete the previous steps to determine required permits.
          </p>
        </div>
      )}

      {/* Permit Timeline Info */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-900">Processing Timeline</h3>
            <p className="text-sm text-blue-800 mt-1">
              Permit processing times vary by agency. The CWA License typically takes 2-4 weeks,
              while Shoreline permits may take 4-8 weeks. Federal permits (Section 10/404) can take
              60-120 days. Plan your project timeline accordingly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
