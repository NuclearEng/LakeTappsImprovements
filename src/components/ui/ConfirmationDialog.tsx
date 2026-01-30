'use client';

import { useStore } from '@/store/useStore';
import { useEffect, useRef, useState } from 'react';

export default function ConfirmationDialog() {
  const { confirmDialog, hideConfirmation } = useStore();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (confirmDialog?.isOpen) {
      dialogRef.current?.focus();
      setIsExiting(false);
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

  const handleClose = (callback: () => void) => {
    setIsExiting(true);
    setTimeout(() => {
      callback();
      hideConfirmation();
    }, 150);
  };

  const handleConfirm = () => {
    handleClose(() => confirmDialog.onConfirm());
  };

  const handleCancel = () => {
    handleClose(() => confirmDialog.onCancel());
  };

  const variantStyles = {
    warning: {
      icon: 'text-amber-500',
      iconBg: 'bg-amber-50',
      iconRing: 'ring-amber-100',
      button: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40',
    },
    danger: {
      icon: 'text-red-500',
      iconBg: 'bg-red-50',
      iconRing: 'ring-red-100',
      button: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
    },
    info: {
      icon: 'text-blue-500',
      iconBg: 'bg-blue-50',
      iconRing: 'ring-blue-100',
      button: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40',
    },
  };

  const styles = variantStyles[confirmDialog.variant];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-150 ${
        isExiting ? 'bg-black/0' : 'bg-black/40 backdrop-blur-sm'
      }`}
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-150 ${
          isExiting
            ? 'opacity-0 scale-95 translate-y-2'
            : 'opacity-100 scale-100 translate-y-0 animate-modal-enter'
        }`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex items-start gap-4">
          {/* Icon with ring effect */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full ${styles.iconBg} ${styles.iconRing} ring-4 flex items-center justify-center`}>
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
          <div className="flex-1 pt-1">
            <h3 id="dialog-title" className="text-lg font-semibold text-slate-900">
              {confirmDialog.title}
            </h3>
            <p className="mt-2 text-slate-600 leading-relaxed">
              {confirmDialog.message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition-all duration-200"
          >
            {confirmDialog.cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${styles.button}`}
          >
            {confirmDialog.confirmLabel}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal-enter {
          animation: modal-enter 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
