'use client';

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
    dismissible: boolean;
  };
  onRemove: (id: string) => void;
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(notification.id), 250);
  };

  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  };

  const bgColors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    warning: 'text-amber-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      className={`notification notification-${notification.type} ${
        isExiting ? 'notification-exit' : ''
      }`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon with background */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${bgColors[notification.type]} bg-opacity-10 flex items-center justify-center`}>
          {notification.type === 'success' && (
            <svg className={`w-5 h-5 ${iconColors.success}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {notification.type === 'error' && (
            <svg className={`w-5 h-5 ${iconColors.error}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {notification.type === 'warning' && (
            <svg className={`w-5 h-5 ${iconColors.warning}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          {notification.type === 'info' && (
            <svg className={`w-5 h-5 ${iconColors.info}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="font-semibold text-sm">{notification.title}</p>
          <p className="text-sm mt-0.5 opacity-80">{notification.message}</p>
          {notification.details && (
            <p className="text-xs mt-2 opacity-60 font-mono">{notification.details}</p>
          )}
          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-semibold hover:underline transition-all"
            >
              {notification.action.label} →
            </button>
          )}
        </div>

        {/* Dismiss button */}
        {notification.dismissible && (
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 hover:bg-black/5 rounded-lg transition-all hover:scale-110 active:scale-95"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4 opacity-50 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function NotificationContainer() {
  const { notifications, removeNotification } = useStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
}
