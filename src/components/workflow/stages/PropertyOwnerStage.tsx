'use client';

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';

interface FormErrors {
  [key: string]: string;
}

export default function PropertyOwnerStage() {
  const { project, updateOwner, saveProject, addNotification } = useStore();
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

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Property Owner Information
        </h1>
        <p className="text-slate-600">
          Enter the property owner&apos;s contact information. This will be used on all permit applications.
        </p>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Information</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={owner.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.firstName}
              aria-describedby={errors.firstName ? 'firstName-error' : undefined}
            />
            {errors.firstName && (
              <p id="firstName-error" className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={owner.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={owner.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={owner.phone}
              onChange={handlePhoneChange}
              onBlur={handleBlur}
              placeholder="(xxx) xxx-xxxx"
              className={`w-full ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Mailing Address</h2>

        <div className="space-y-4">
          {/* Street Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={owner.address}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              aria-invalid={!!errors.address}
            />
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-slate-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={owner.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                aria-invalid={!!errors.city}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-slate-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={owner.state}
                onChange={handleChange}
                className="w-full"
              >
                <option value="WA">Washington</option>
                <option value="OR">Oregon</option>
                <option value="ID">Idaho</option>
                <option value="CA">California</option>
              </select>
            </div>

            {/* ZIP */}
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-slate-700 mb-1">
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
                className={`w-full ${errors.zip ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                aria-invalid={!!errors.zip}
              />
              {errors.zip && (
                <p className="mt-1 text-sm text-red-600">{errors.zip}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Property Information</h2>

        <div>
          <label htmlFor="parcelNumber" className="block text-sm font-medium text-slate-700 mb-1">
            Parcel Number
            <span className="text-slate-500 font-normal ml-2">(if known)</span>
          </label>
          <input
            type="text"
            id="parcelNumber"
            name="parcelNumber"
            value={owner.parcelNumber}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., 0123456789"
            className="w-full max-w-md"
          />
          <p className="mt-1 text-sm text-slate-500">
            You can find this on your property tax statement or at the Pierce County Assessor website.
          </p>
        </div>
      </div>

      {/* Agent checkbox */}
      <div className="card">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isAgent"
            checked={owner.isAgent}
            onChange={handleChange}
            className="mt-1 w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
          />
          <div>
            <span className="font-medium text-slate-900">I am an authorized agent</span>
            <p className="text-sm text-slate-600 mt-1">
              Check this box if you are filling out this application on behalf of the property owner.
              You will need to provide agent authorization documentation.
            </p>
          </div>
        </label>

        {owner.isAgent && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium text-amber-800">Agent Authorization Required</p>
                <p className="text-sm text-amber-700 mt-1">
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
