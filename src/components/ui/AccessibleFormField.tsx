'use client';

import { ReactNode, useId } from 'react';

interface AccessibleFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean;
    'aria-required': boolean;
  }) => ReactNode;
}

export default function AccessibleFormField({
  label,
  required = false,
  error,
  hint,
  children,
}: AccessibleFormFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [
    error ? errorId : null,
    hint ? hintId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-hidden="true">
            *
          </span>
        )}
        {required && (
          <span className="sr-only">(required)</span>
        )}
      </label>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': !!error,
        'aria-required': required,
      })}

      {hint && !error && (
        <p
          id={hintId}
          className="text-xs text-slate-500 dark:text-slate-400"
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-3 h-3 flex-shrink-0"
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

// Announce changes to screen readers
export function useAnnouncement() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const element = document.createElement('div');
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', priority);
    element.setAttribute('aria-atomic', 'true');
    element.className = 'sr-only';
    element.textContent = message;

    document.body.appendChild(element);

    // Remove after announcement is made
    setTimeout(() => {
      document.body.removeChild(element);
    }, 1000);
  };

  return { announce };
}
