'use client';

import { useStore } from '@/store/useStore';
import { useEffect, useRef } from 'react';

export default function ConfirmationDialog() {
  const { confirmDialog, hideConfirmation } = useStore();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (confirmDialog?.isOpen) {
      dialogRef.current?.focus();
    }
  }, [confirmDialog?.isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmDialog?.isOpen) {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmDialog]);

  if (!confirmDialog?.isOpen) return null;

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    hideConfirmation();
  };

  const handleCancel = () => {
    confirmDialog.onCancel();
    hideConfirmation();
  };

  const variantStyles = {
    warning: {
      icon: 'text-amber-500',
      iconBg: 'bg-amber-100',
      button: 'btn-primary',
    },
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-100',
      button: 'btn-danger',
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-100',
      button: 'btn-primary',
    },
  };

  const styles = variantStyles[confirmDialog.variant];

  return (
    <div
      className="modal-overlay animate-fade-in"
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className="modal-content p-6 animate-slide-in"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
            {confirmDialog.variant === 'warning' && (
              <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {confirmDialog.variant === 'danger' && (
              <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {confirmDialog.variant === 'info' && (
              <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">
              {confirmDialog.title}
            </h3>
            <p className="mt-2 text-slate-600">
              {confirmDialog.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            {confirmDialog.cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`btn ${styles.button}`}
          >
            {confirmDialog.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
