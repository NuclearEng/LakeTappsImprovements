'use client';

import { useStore } from '@/store/useStore';

export default function ReviewStage() {
  const { project, goToStage } = useStore();

  if (!project) return null;

  const { owner, details, site, insurance } = project;

  const Section = ({ title, children, editStage }: { title: string; children: React.ReactNode; editStage: number }) => (
    <div className="card mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <button
          onClick={() => goToStage(editStage)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );

  const Field = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="py-2 border-b border-slate-100 last:border-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-slate-900 mt-0.5">{value || '—'}</dd>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Review Your Information
        </h1>
        <p className="text-slate-600">
          Please review all information before generating your permit documents.
        </p>
      </div>

      {/* Owner Info */}
      <Section title="Property Owner" editStage={3}>
        <dl className="grid md:grid-cols-2 gap-x-6">
          <Field label="Name" value={`${owner.firstName} ${owner.lastName}`} />
          <Field label="Email" value={owner.email} />
          <Field label="Phone" value={owner.phone} />
          <Field label="Address" value={`${owner.address}, ${owner.city}, ${owner.state} ${owner.zip}`} />
          <Field label="Parcel Number" value={owner.parcelNumber} />
          <Field label="Agent" value={owner.isAgent ? 'Yes' : 'No'} />
        </dl>
      </Section>

      {/* Project Details */}
      <Section title="Project Details" editStage={4}>
        <dl className="grid md:grid-cols-2 gap-x-6">
          <Field label="Category" value={details.category === 'new_construction' ? 'New Construction' : 'Modification'} />
          <Field label="Improvement Types" value={details.improvementTypes?.join(', ')} />
          <Field label="Estimated Cost" value={`$${details.estimatedCost.toLocaleString()}`} />
          <Field label="Start Date" value={details.startDate} />
          <Field label="Work In Water" value={details.inWater ? 'Yes' : 'No'} />
          <Field label="Below 544' Elevation" value={details.belowHighWaterLine ? 'Yes' : 'No'} />
        </dl>
        <div className="mt-4 pt-4 border-t border-slate-200">
          <dt className="text-sm text-slate-500 mb-1">Project Description</dt>
          <dd className="text-slate-900">{details.description || '—'}</dd>
        </div>
      </Section>

      {/* Site Info */}
      <Section title="Site Information" editStage={5}>
        <dl className="grid md:grid-cols-2 gap-x-6">
          <Field label="Property Address" value={site.propertyAddress} />
          <Field label="Parcel Number" value={site.parcelNumber} />
          <Field label="Water Frontage" value={site.waterFrontage ? `${site.waterFrontage} ft` : undefined} />
          <Field label="Elevation" value={site.elevation ? `${site.elevation} ft` : undefined} />
          <Field label="Uploaded Files" value={`${site.sitePlanFiles?.length || 0} file(s)`} />
        </dl>
      </Section>

      {/* Insurance */}
      <Section title="Insurance" editStage={7}>
        <dl className="grid md:grid-cols-2 gap-x-6">
          <Field label="Has Insurance" value={insurance.hasInsurance ? 'Yes' : 'No'} />
          {insurance.hasInsurance && (
            <>
              <Field label="Provider" value={insurance.provider} />
              <Field label="Policy Number" value={insurance.policyNumber} />
              <Field label="Additional Insured Added" value={insurance.additionalInsuredAdded ? 'Yes' : 'No'} />
            </>
          )}
        </dl>
      </Section>

      {/* Required Permits */}
      <div className="card bg-emerald-50 border-emerald-200">
        <h3 className="font-semibold text-emerald-900 mb-3">Required Permits</h3>
        <ul className="space-y-2">
          {project.requiredPermits.map((permit) => (
            <li key={permit} className="flex items-center gap-2 text-emerald-800">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {permit.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
