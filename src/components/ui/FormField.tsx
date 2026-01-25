'use client';

import { useState, useCallback, useEffect } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  helpText?: string;
  options?: { value: string; label: string }[];
  validate?: (value: string | number) => string | null;
  className?: string;
  inputClassName?: string;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  error: externalError,
  helpText,
  options,
  validate,
  className = '',
  inputClassName = '',
  rows = 4,
  min,
  max,
  step,
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = externalError || (touched ? localError : null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
      onChange(newValue);

      // Real-time validation if validator is provided
      if (validate && touched) {
        const validationError = validate(newValue);
        setLocalError(validationError);
      }
    },
    [onChange, type, validate, touched]
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    onBlur?.();

    // Validate on blur
    if (validate) {
      const validationError = validate(value);
      setLocalError(validationError);
    }
  }, [onBlur, validate, value]);

  // Update local error when external error changes
  useEffect(() => {
    if (externalError) {
      setTouched(true);
    }
  }, [externalError]);

  const baseInputClasses = `
    w-full px-4 py-3 rounded-lg border transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50'
        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
    }
    ${inputClassName}
  `;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={baseInputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        />
      );
    }

    if (type === 'select' && options) {
      return (
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          className={baseInputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        >
          <option value="">{placeholder || 'Select an option...'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={baseInputClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
      />
    );
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {renderInput()}

      {error && (
        <p
          id={`${name}-error`}
          className="mt-1 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${name}-help`} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}

// Checkbox field component
interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  helpText?: string;
  className?: string;
}

export function CheckboxField({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  helpText,
  className = '',
}: CheckboxFieldProps) {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={name}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
        />
      </div>
      <div className="ml-3">
        <label
          htmlFor={name}
          className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
        >
          {label}
        </label>
        {helpText && <p className="text-sm text-gray-500">{helpText}</p>}
      </div>
    </div>
  );
}

// Multi-select checkbox group
interface CheckboxGroupProps {
  label: string;
  name: string;
  options: { value: string; label: string; description?: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string | null;
  required?: boolean;
  className?: string;
}

export function CheckboxGroup({
  label,
  name,
  options,
  selectedValues,
  onChange,
  error,
  required = false,
  className = '',
}: CheckboxGroupProps) {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className={className}>
      <span className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>

      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedValues.includes(option.value)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              name={`${name}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div className="ml-3">
              <span className="text-sm font-medium text-gray-900">
                {option.label}
              </span>
              {option.description && (
                <p className="text-sm text-gray-500">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1" role="alert">
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

// Completion indicator component
interface CompletionIndicatorProps {
  completedFields: number;
  totalFields: number;
  missingFields: string[];
  className?: string;
}

export function CompletionIndicator({
  completedFields,
  totalFields,
  missingFields,
  className = '',
}: CompletionIndicatorProps) {
  const percentage = Math.round((completedFields / totalFields) * 100);
  const isComplete = missingFields.length === 0;

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Section Completion
        </span>
        <span
          className={`text-sm font-bold ${
            isComplete ? 'text-green-600' : 'text-blue-600'
          }`}
        >
          {percentage}%
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-blue-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!isComplete && missingFields.length > 0 && (
        <div className="text-sm">
          <p className="text-gray-600 mb-1">Missing fields:</p>
          <ul className="list-disc list-inside text-gray-500 space-y-0.5">
            {missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      )}

      {isComplete && (
        <div className="flex items-center gap-2 text-green-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">All required fields complete</span>
        </div>
      )}
    </div>
  );
}
