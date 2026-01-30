'use client';

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import ParcelLookup from '@/components/forms/ParcelLookup';
import type { CoOwner, OwnershipType } from '@/types';

interface FormErrors {
  [key: string]: string;
}

export default function PropertyOwnerStage() {
  const { project, updateOwner, saveProject } = useStore();
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  if (!project) return null;

  const { owner } = project;

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return 'This field is required';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
        break;
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[\d\s\-\(\)]+$/.test(value)) return 'Please enter a valid phone number';
        break;
      case 'address':
        if (!value.trim()) return 'Address is required';
        break;
      case 'city':
        if (!value.trim()) return 'City is required';
        break;
      case 'zip':
        if (!value.trim()) return 'ZIP code is required';
        if (!/^\d{5}(-\d{4})?$/.test(value)) return 'Please enter a valid ZIP code';
        break;
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    updateOwner({ [name]: newValue });

    // Validate on change if field was touched
    if (touched.has(name)) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => new Set(prev).add(name));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    saveProject();
  };

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateOwner({ phone: formatted });
  };

  const inputBaseClass = "w-full px-4 py-3 rounded-xl border bg-white transition-all duration-200 focus:outline-none focus:ring-4";
  const inputNormalClass = `${inputBaseClass} border-slate-200 focus:border-primary-400 focus:ring-primary-500/10`;
  const inputErrorClass = `${inputBaseClass} border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50/50`;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
          Property Owner Information
        </h1>
        <p className="text-slate-600 leading-relaxed">
          Enter the property owner&apos;s contact information. This will be used on all permit applications.
        </p>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          Contact Information
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          {/* First Name */}
          <div className="form-group">
            <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={owner.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.firstName ? inputErrorClass : inputNormalClass}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-2 text-sm text-red-600 flex items-center gap-1.5 error-shake">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="form-group">
            <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={owner.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.lastName ? inputErrorClass : inputNormalClass}
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 error-shake">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.lastName}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={owner.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${errors.email ? inputErrorClass : inputNormalClass} pl-11`}
                aria-invalid={!!errors.email}
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 error-shake">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={owner.phone}
                onChange={handlePhoneChange}
                onBlur={handleBlur}
                placeholder="(xxx) xxx-xxxx"
                className={`${errors.phone ? inputErrorClass : inputNormalClass} pl-11`}
                aria-invalid={!!errors.phone}
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            {errors.phone && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 error-shake">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          Mailing Address
        </h2>

        <div className="space-y-5">
          {/* Street Address */}
          <div className="form-group">
            <label htmlFor="address" className="block text-sm font-semibold text-slate-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={owner.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.address ? inputErrorClass : inputNormalClass}
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 error-shake">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.address}
              </p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {/* City */}
            <div className="form-group">
              <label htmlFor="city" className="block text-sm font-semibold text-slate-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={owner.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.city ? inputErrorClass : inputNormalClass}
                aria-invalid={!!errors.city}
              />
              {errors.city && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 error-shake">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.city}
                </p>
              )}
            </div>

            {/* State */}
            <div className="form-group">
              <label htmlFor="state" className="block text-sm font-semibold text-slate-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="state"
                  name="state"
                  value={owner.state}
                  onChange={handleChange}
                  className={`${inputNormalClass} appearance-none cursor-pointer`}
                >
                  <option value="WA">Washington</option>
                  <option value="OR">Oregon</option>
                  <option value="ID">Idaho</option>
                  <option value="CA">California</option>
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* ZIP */}
            <div className="form-group">
              <label htmlFor="zip" className="block text-sm font-semibold text-slate-700 mb-2">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zip"
                name="zip"
                value={owner.zip}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="98391"
                className={errors.zip ? inputErrorClass : inputNormalClass}
                aria-invalid={!!errors.zip}
              />
              {errors.zip && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5 error-shake">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.zip}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          Property Information
        </h2>

        <div className="form-group">
          <label htmlFor="parcelNumber" className="block text-sm font-semibold text-slate-700 mb-2">
            Parcel Number
            <span className="text-slate-400 font-normal ml-2">(optional)</span>
          </label>
          <input
            type="text"
            id="parcelNumber"
            name="parcelNumber"
            value={owner.parcelNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., 0123456789"
            className={`${inputNormalClass} max-w-md`}
          />
          <ParcelLookup
            onParcelFound={(parcelNumber, result) => {
              updateOwner({
                parcelNumber,
                address: result.address || owner.address,
              });
              saveProject();
            }}
          />
          <p className="mt-2 text-sm text-slate-500 flex items-start gap-2">
            <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              You can also find this on your property tax statement or the{' '}
              <a
                href="https://matterhornwab.co.pierce.wa.us/publicgis/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 underline font-medium"
              >
                Pierce County GIS
              </a>.
            </span>
          </p>
        </div>
      </div>

      {/* Ownership Type */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          Ownership Type
        </h2>

        <div className="form-group mb-5">
          <label htmlFor="ownershipType" className="block text-sm font-semibold text-slate-700 mb-2">
            How is the property owned? <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="ownershipType"
              name="ownershipType"
              value={owner.ownershipType || 'individual'}
              onChange={(e) => {
                updateOwner({ ownershipType: e.target.value as OwnershipType });
                saveProject();
              }}
              className={`${inputNormalClass} appearance-none cursor-pointer`}
            >
              <option value="individual">Individual</option>
              <option value="joint">Joint Ownership</option>
              <option value="llc">LLC</option>
              <option value="trust">Trust</option>
              <option value="corporation">Corporation</option>
            </select>
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Co-Owners (joint ownership) */}
        {owner.ownershipType === 'joint' && (
          <div className="animate-fade-in">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Co-Owners</h3>
            {(owner.coOwners || []).map((coOwner: CoOwner, index: number) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl mb-3 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-600">Co-Owner {index + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newCoOwners = [...(owner.coOwners || [])];
                      newCoOwners.splice(index, 1);
                      updateOwner({ coOwners: newCoOwners });
                      saveProject();
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={coOwner.name}
                    onChange={(e) => {
                      const newCoOwners = [...(owner.coOwners || [])];
                      newCoOwners[index] = { ...newCoOwners[index], name: e.target.value };
                      updateOwner({ coOwners: newCoOwners });
                    }}
                    onBlur={handleBlur}
                    className={inputNormalClass}
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={coOwner.phone}
                    onChange={(e) => {
                      const newCoOwners = [...(owner.coOwners || [])];
                      newCoOwners[index] = { ...newCoOwners[index], phone: e.target.value };
                      updateOwner({ coOwners: newCoOwners });
                    }}
                    onBlur={handleBlur}
                    className={inputNormalClass}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={coOwner.email}
                    onChange={(e) => {
                      const newCoOwners = [...(owner.coOwners || [])];
                      newCoOwners[index] = { ...newCoOwners[index], email: e.target.value };
                      updateOwner({ coOwners: newCoOwners });
                    }}
                    onBlur={handleBlur}
                    className={inputNormalClass}
                  />
                  <select
                    value={coOwner.relationship}
                    onChange={(e) => {
                      const newCoOwners = [...(owner.coOwners || [])];
                      newCoOwners[index] = { ...newCoOwners[index], relationship: e.target.value };
                      updateOwner({ coOwners: newCoOwners });
                      saveProject();
                    }}
                    className={`${inputNormalClass} appearance-none cursor-pointer`}
                  >
                    <option value="">Relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="partner">Partner</option>
                    <option value="family">Family Member</option>
                    <option value="business_partner">Business Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newCoOwners = [...(owner.coOwners || []), { name: '', phone: '', email: '', relationship: '' }];
                updateOwner({ coOwners: newCoOwners });
              }}
              className="text-primary-600 hover:text-primary-700 text-sm font-semibold flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Co-Owner
            </button>
          </div>
        )}

        {/* Entity Info (LLC/Trust/Corporation) */}
        {(owner.ownershipType === 'llc' || owner.ownershipType === 'trust' || owner.ownershipType === 'corporation') && (
          <div className="animate-fade-in">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Entity Information</h3>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="form-group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Legal Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={owner.entityInfo?.legalName || ''}
                  onChange={(e) => updateOwner({ entityInfo: { ...(owner.entityInfo || { legalName: '', entityType: '', ubiEin: '', registeredAgent: '' }), legalName: e.target.value } })}
                  onBlur={handleBlur}
                  className={inputNormalClass}
                  placeholder="Legal entity name"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Entity Type
                </label>
                <input
                  type="text"
                  value={owner.entityInfo?.entityType || ''}
                  onChange={(e) => updateOwner({ entityInfo: { ...(owner.entityInfo || { legalName: '', entityType: '', ubiEin: '', registeredAgent: '' }), entityType: e.target.value } })}
                  onBlur={handleBlur}
                  className={inputNormalClass}
                  placeholder={owner.ownershipType === 'llc' ? 'e.g., WA LLC' : owner.ownershipType === 'trust' ? 'e.g., Revocable Living Trust' : 'e.g., WA S-Corp'}
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  UBI / EIN
                </label>
                <input
                  type="text"
                  value={owner.entityInfo?.ubiEin || ''}
                  onChange={(e) => updateOwner({ entityInfo: { ...(owner.entityInfo || { legalName: '', entityType: '', ubiEin: '', registeredAgent: '' }), ubiEin: e.target.value } })}
                  onBlur={handleBlur}
                  className={inputNormalClass}
                  placeholder="UBI or EIN number"
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Registered Agent
                </label>
                <input
                  type="text"
                  value={owner.entityInfo?.registeredAgent || ''}
                  onChange={(e) => updateOwner({ entityInfo: { ...(owner.entityInfo || { legalName: '', entityType: '', ubiEin: '', registeredAgent: '' }), registeredAgent: e.target.value } })}
                  onBlur={handleBlur}
                  className={inputNormalClass}
                  placeholder="Registered agent name"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent checkbox */}
      <div className="card">
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              name="isAgent"
              checked={owner.isAgent}
              onChange={handleChange}
              className="peer sr-only"
            />
            <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
              owner.isAgent
                ? 'bg-primary-500 border-primary-500'
                : 'border-slate-300 group-hover:border-primary-400'
            }`}>
              {owner.isAgent && (
                <svg className="w-4 h-4 text-white animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <div>
            <span className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">I am an authorized agent</span>
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Check this box if you are filling out this application on behalf of the property owner.
              You will need to provide agent authorization documentation.
            </p>
          </div>
        </label>

        {owner.isAgent && (
          <div className="mt-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl animate-fade-in">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-amber-800">Agent Authorization Required</p>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                  You will need to provide a signed authorization letter from the property owner in a later step.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
