'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { determineRequiredPermits, getPermitSummary, type PermitRecommendation } from '@/lib/permitLogic';

interface PermitCardProps {
  recommendation: PermitRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
}

function PermitCard({ recommendation, isExpanded, onToggle }: PermitCardProps) {
  const statusColor = recommendation.isRequired
    ? 'border-green-200 bg-green-50'
    : recommendation.isLikelyRequired
    ? 'border-amber-200 bg-amber-50'
    : 'border-slate-200 bg-slate-50';

  const statusBadge = recommendation.isRequired
    ? { label: 'Required', color: 'bg-green-100 text-green-800' }
    : recommendation.isLikelyRequired
    ? { label: 'Likely Required', color: 'bg-amber-100 text-amber-800' }
    : { label: 'May Be Required', color: 'bg-slate-100 text-slate-800' };

  return (
    <div className={`rounded-xl border ${statusColor} overflow-hidden transition-all`}>
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start justify-between gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-semibold text-slate-900">{recommendation.name}</h4>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>
          <p className="text-sm text-slate-600">{recommendation.agency}</p>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-200/50">
          <div className="pt-4 space-y-4">
            {/* Reasons */}
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-2">Why This Permit?</h5>
              <ul className="space-y-1">
                {recommendation.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>

            {/* Regulatory Basis */}
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-1">Regulatory Basis</h5>
              <p className="text-sm text-slate-600">{recommendation.regulatoryBasis}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              {recommendation.estimatedFee && (
                <div>
                  <h5 className="text-xs font-medium text-slate-500 uppercase">Estimated Fee</h5>
                  <p className="text-sm text-slate-900">{recommendation.estimatedFee}</p>
                </div>
              )}
              {recommendation.processingTime && (
                <div>
                  <h5 className="text-xs font-medium text-slate-500 uppercase">Processing Time</h5>
                  <p className="text-sm text-slate-900">{recommendation.processingTime}</p>
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="pt-2 border-t border-slate-200/50">
              <h5 className="text-sm font-medium text-slate-700 mb-2">Contact Information</h5>
              <div className="flex flex-wrap gap-3">
                {recommendation.contactEmail && (
                  <a
                    href={`mailto:${recommendation.contactEmail}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {recommendation.contactEmail}
                  </a>
                )}
                {recommendation.contactPhone && (
                  <a
                    href={`tel:${recommendation.contactPhone}`}
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {recommendation.contactPhone}
                  </a>
                )}
                {recommendation.portalUrl && (
                  <a
                    href={recommendation.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 hover:underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Online Portal
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PermitRecommendations() {
  const { project } = useStore();
  const [expandedPermits, setExpandedPermits] = useState<Set<string>>(new Set());

  const recommendations = useMemo(() => {
    if (!project) return [];
    return determineRequiredPermits(project.details, project.site.elevation);
  }, [project]);

  const summary = useMemo(() => {
    return getPermitSummary(recommendations);
  }, [recommendations]);

  if (!project || recommendations.length === 0) {
    return null;
  }

  const togglePermit = (permitType: string) => {
    setExpandedPermits((prev) => {
      const next = new Set(prev);
      if (next.has(permitType)) {
        next.delete(permitType);
      } else {
        next.add(permitType);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPermits(new Set(recommendations.map((r) => r.permitType)));
  };

  const collapseAll = () => {
    setExpandedPermits(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Permit Requirements Summary
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          Based on your project details, here are the permits you will need to obtain.
        </p>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.definitelyRequired.length}
            </div>
            <div className="text-xs text-slate-600">Required</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">
              {summary.likelyRequired.length}
            </div>
            <div className="text-xs text-slate-600">Likely Required</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-600">
              {summary.possiblyRequired.length}
            </div>
            <div className="text-xs text-slate-600">Possible</div>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Controls */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-slate-900">Permit Details</h4>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-sm text-primary-600 hover:underline"
          >
            Expand All
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-primary-600 hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Required Permits */}
      {summary.definitelyRequired.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Definitely Required
          </h5>
          <div className="space-y-3">
            {summary.definitelyRequired.map((rec) => (
              <PermitCard
                key={rec.permitType}
                recommendation={rec}
                isExpanded={expandedPermits.has(rec.permitType)}
                onToggle={() => togglePermit(rec.permitType)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Likely Required */}
      {summary.likelyRequired.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-amber-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Likely Required
          </h5>
          <div className="space-y-3">
            {summary.likelyRequired.map((rec) => (
              <PermitCard
                key={rec.permitType}
                recommendation={rec}
                isExpanded={expandedPermits.has(rec.permitType)}
                onToggle={() => togglePermit(rec.permitType)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Possibly Required */}
      {summary.possiblyRequired.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-slate-600 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            May Be Required (Verify)
          </h5>
          <div className="space-y-3">
            {summary.possiblyRequired.map((rec) => (
              <PermitCard
                key={rec.permitType}
                recommendation={rec}
                isExpanded={expandedPermits.has(rec.permitType)}
                onToggle={() => togglePermit(rec.permitType)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-slate-700">Disclaimer</p>
            <p className="mt-1">
              These recommendations are based on typical requirements for Lake Tapps projects.
              Actual permit requirements may vary based on specific project details.
              Always verify requirements with the respective agencies before starting your project.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
