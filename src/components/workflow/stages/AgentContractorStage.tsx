'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';

type RepresentationType = 'none' | 'agent' | 'contractor' | 'both';

export default function AgentContractorStage() {
  const { project, updateAgent, updateContractor, saveProject } = useStore();
  const [representationType, setRepresentationType] = useState<RepresentationType>(() => {
    if (!project) return 'none';
    const hasAgent = project.agent && project.agent.name;
    const hasContractor = project.contractor && project.contractor.name;
    if (hasAgent && hasContractor) return 'both';
    if (hasAgent) return 'agent';
    if (hasContractor) return 'contractor';
    return 'none';
  });

  if (!project) return null;

  const agent = project.agent || { name: '', company: '', address: '', phone: '', email: '', authorizationScope: [] };
  const contractor = project.contractor || { name: '', waLicenseNumber: '', businessAddress: '', phone: '', email: '' };

  const showAgent = representationType === 'agent' || representationType === 'both';
  const showContractor = representationType === 'contractor' || representationType === 'both';

  const handleRepresentationChange = (type: RepresentationType) => {
    setRepresentationType(type);
    if (type === 'none') {
      // Clear agent and contractor from project
    }
  };

  const handleAgentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateAgent({ [name]: value });
  };

  const handleContractorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateContractor({ [name]: value });
  };

  const handleBlur = () => {
    saveProject();
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handleAgentPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAgent({ phone: formatPhoneNumber(e.target.value) });
  };

  const handleContractorPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateContractor({ phone: formatPhoneNumber(e.target.value) });
  };

  const handleScopeChange = (scope: string) => {
    const currentScope = agent.authorizationScope || [];
    const newScope = currentScope.includes(scope)
      ? currentScope.filter(s => s !== scope)
      : [...currentScope, scope];
    updateAgent({ authorizationScope: newScope });
    saveProject();
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white transition-all duration-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10";

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          Agent & Contractor Information
        </h1>
        <p className="text-slate-600 leading-relaxed">
          If someone is representing you or performing work on your project, provide their information here.
        </p>
      </div>

      {/* Representation Type */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          Will anyone represent you or perform work on this project?
        </h2>

        <div className="space-y-3">
          {([
            { value: 'none' as RepresentationType, label: "No, I'll handle everything myself", desc: 'You will submit applications and manage the project directly' },
            { value: 'agent' as RepresentationType, label: 'Yes, I have an authorized agent', desc: 'An agent will submit applications and/or communicate with agencies on your behalf' },
            { value: 'contractor' as RepresentationType, label: 'Yes, I have a contractor', desc: 'A licensed contractor will perform the construction work' },
            { value: 'both' as RepresentationType, label: 'Both agent and contractor', desc: 'You have both an authorized representative and a contractor' },
          ]).map(option => {
            const isSelected = representationType === option.value;
            return (
              <label
                key={option.value}
                className={`option-card group cursor-pointer ${isSelected ? 'option-card-selected' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300 group-hover:border-primary-400'
                    }`}>
                      {isSelected && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="representationType"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleRepresentationChange(option.value)}
                      className="sr-only"
                    />
                  </div>
                  <div>
                    <span className={`font-semibold transition-colors ${isSelected ? 'text-primary-700' : 'text-slate-900'}`}>
                      {option.label}
                    </span>
                    <p className={`text-sm mt-1 transition-colors ${isSelected ? 'text-primary-600' : 'text-slate-600'}`}>
                      {option.desc}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Agent Information */}
      {showAgent && (
        <div className="card mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            Authorized Agent
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="form-group">
              <label htmlFor="agent-name" className="block text-sm font-semibold text-slate-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="agent-name"
                name="name"
                value={agent.name}
                onChange={handleAgentChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="Full name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="agent-company" className="block text-sm font-semibold text-slate-700 mb-2">
                Company
              </label>
              <input
                type="text"
                id="agent-company"
                name="company"
                value={agent.company}
                onChange={handleAgentChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="Company name"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label htmlFor="agent-address" className="block text-sm font-semibold text-slate-700 mb-2">
                Address
              </label>
              <input
                type="text"
                id="agent-address"
                name="address"
                value={agent.address}
                onChange={handleAgentChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="Business address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="agent-phone" className="block text-sm font-semibold text-slate-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="agent-phone"
                name="phone"
                value={agent.phone}
                onChange={handleAgentPhoneChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="(xxx) xxx-xxxx"
              />
            </div>

            <div className="form-group">
              <label htmlFor="agent-email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="agent-email"
                name="email"
                value={agent.email}
                onChange={handleAgentChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="agent@example.com"
              />
            </div>
          </div>

          {/* Authorization Scope */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Authorization Scope
            </label>
            <div className="space-y-2">
              {[
                { value: 'submit_applications', label: 'Submit applications on my behalf' },
                { value: 'receive_correspondence', label: 'Receive correspondence from agencies' },
                { value: 'sign_documents', label: 'Sign documents on my behalf' },
                { value: 'all', label: 'Full authorization (all of the above)' },
              ].map(scope => {
                const isChecked = agent.authorizationScope?.includes(scope.value) || false;
                return (
                  <label key={scope.value} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                      isChecked
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-slate-300 group-hover:border-primary-400'
                    }`}>
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleScopeChange(scope.value)}
                      className="sr-only"
                    />
                    <span className="text-sm text-slate-700">{scope.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Authorization Letter Note */}
          <div className="mt-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Authorization Letter Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  A signed authorization letter from the property owner should be included with your application submissions. You can upload this in the Site Info stage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contractor Information */}
      {showContractor && (
        <div className="card mb-6 animate-fade-in">
          <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            Contractor Information
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="form-group">
              <label htmlFor="contractor-name" className="block text-sm font-semibold text-slate-700 mb-2">
                Contractor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contractor-name"
                name="name"
                value={contractor.name}
                onChange={handleContractorChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="Company or individual name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contractor-waLicenseNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                WA License # <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="contractor-waLicenseNumber"
                name="waLicenseNumber"
                value={contractor.waLicenseNumber}
                onChange={handleContractorChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="e.g., CONTRL*123AB"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label htmlFor="contractor-businessAddress" className="block text-sm font-semibold text-slate-700 mb-2">
                Business Address
              </label>
              <input
                type="text"
                id="contractor-businessAddress"
                name="businessAddress"
                value={contractor.businessAddress}
                onChange={handleContractorChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="Business address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contractor-phone" className="block text-sm font-semibold text-slate-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="contractor-phone"
                name="phone"
                value={contractor.phone}
                onChange={handleContractorPhoneChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="(xxx) xxx-xxxx"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contractor-email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="contractor-email"
                name="email"
                value={contractor.email}
                onChange={handleContractorChange}
                onBlur={handleBlur}
                className={inputClass}
                placeholder="contractor@example.com"
              />
            </div>
          </div>

          {/* L&I License Verification */}
          <div className="mt-5 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Verify Contractor License</p>
                <p className="text-sm text-blue-700 mt-1">
                  You can verify your contractor&apos;s license at the{' '}
                  <a
                    href="https://secure.lni.wa.gov/verify/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    WA L&I Contractor Verification
                  </a>{' '}
                  website.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No representation selected info */}
      {representationType === 'none' && (
        <div className="card bg-slate-50 border-slate-200">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-slate-700">Managing your own project</p>
              <p className="text-sm text-slate-600 mt-1">
                You can always come back to this step to add agent or contractor information later. Continue to the next step.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
