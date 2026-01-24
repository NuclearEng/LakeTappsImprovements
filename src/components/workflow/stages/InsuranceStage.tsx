'use client';

import { useStore } from '@/store/useStore';

export default function InsuranceStage() {
  const { project, updateInsurance, saveProject } = useStore();

  if (!project) return null;

  const { insurance } = project;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    updateInsurance({ [name]: type === 'checkbox' ? checked : value });
  };

  const handleBlur = () => {
    saveProject();
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Insurance Requirements
        </h1>
        <p className="text-slate-600">
          Cascade Water Alliance requires all license holders to maintain liability insurance.
        </p>
      </div>

      {/* Insurance Requirements Info */}
      <div className="card mb-6 bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-blue-900">CWA Insurance Requirements</h3>
            <ul className="mt-2 text-sm text-blue-800 space-y-1">
              <li>• Homeowner&apos;s liability insurance is required</li>
              <li>• <strong>Cascade Water Alliance</strong> must be named as Additional Insured</li>
              <li>• Certificate of Insurance must be provided annually</li>
              <li>• Contractor insurance is also required during construction</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Insurance Form */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Insurance Information</h2>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="hasInsurance"
              checked={insurance.hasInsurance}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="font-medium text-slate-900">
                I have homeowner&apos;s liability insurance
              </span>
              <p className="text-sm text-slate-600 mt-1">
                Check this box if you currently have homeowner&apos;s insurance.
              </p>
            </div>
          </label>

          {insurance.hasInsurance && (
            <div className="ml-8 space-y-4 pt-4 border-t border-slate-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-slate-700 mb-1">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    id="provider"
                    name="provider"
                    value={insurance.provider || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., State Farm, Allstate"
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="policyNumber" className="block text-sm font-medium text-slate-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    id="policyNumber"
                    name="policyNumber"
                    value={insurance.policyNumber || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="effectiveDate" className="block text-sm font-medium text-slate-700 mb-1">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    id="effectiveDate"
                    name="effectiveDate"
                    value={insurance.effectiveDate || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="expirationDate" className="block text-sm font-medium text-slate-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    id="expirationDate"
                    name="expirationDate"
                    value={insurance.expirationDate || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  name="additionalInsuredAdded"
                  checked={insurance.additionalInsuredAdded || false}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                />
                <div>
                  <span className="font-medium text-amber-900">
                    Cascade Water Alliance is named as Additional Insured
                  </span>
                  <p className="text-sm text-amber-700 mt-1">
                    You must contact your insurance agent to add CWA as an Additional Insured on your policy.
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Action Required */}
      {insurance.hasInsurance && !insurance.additionalInsuredAdded && (
        <div className="card bg-amber-50 border-amber-200">
          <div className="flex gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="font-semibold text-amber-900">Action Required</h3>
              <p className="text-sm text-amber-800 mt-1">
                Contact your insurance agent to add <strong>&quot;Cascade Water Alliance&quot;</strong> as an Additional Insured on your homeowner&apos;s policy. Once complete, request an updated Certificate of Insurance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
