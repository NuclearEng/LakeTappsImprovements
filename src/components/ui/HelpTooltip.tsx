'use client';

import { useState, useRef, useEffect } from 'react';

interface HelpTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  width?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export default function HelpTooltip({
  content,
  title,
  placement = 'top',
  width = 'md',
  children,
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const widthClasses = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
  };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (placement) {
        case 'top':
          top = trigger.top - tooltip.height - 8;
          left = trigger.left + trigger.width / 2 - tooltip.width / 2;
          break;
        case 'bottom':
          top = trigger.bottom + 8;
          left = trigger.left + trigger.width / 2 - tooltip.width / 2;
          break;
        case 'left':
          top = trigger.top + trigger.height / 2 - tooltip.height / 2;
          left = trigger.left - tooltip.width - 8;
          break;
        case 'right':
          top = trigger.top + trigger.height / 2 - tooltip.height / 2;
          left = trigger.right + 8;
          break;
      }

      // Keep within viewport
      left = Math.max(8, Math.min(left, window.innerWidth - tooltip.width - 8));
      top = Math.max(8, Math.min(top, window.innerHeight - tooltip.height - 8));

      setPosition({ top, left });
    }
  }, [isVisible, placement]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsVisible(false);
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isVisible]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={title || 'Help'}
      >
        {children || (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`fixed z-50 bg-slate-800 text-white rounded-lg shadow-lg p-3 text-sm ${widthClasses[width]}`}
          style={{ top: position.top, left: position.left }}
        >
          {title && (
            <div className="font-medium text-slate-100 mb-1">{title}</div>
          )}
          <div className="text-slate-300">{content}</div>
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-slate-800 transform rotate-45 ${
              placement === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              placement === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              placement === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </>
  );
}

// Inline help component for form fields
interface FieldHelpProps {
  text: string;
}

export function FieldHelp({ text }: FieldHelpProps) {
  return (
    <p className="text-xs text-slate-500 mt-1">{text}</p>
  );
}

// Section help header with expandable explanation
interface SectionHelpProps {
  title: string;
  description: string;
  tips?: string[];
  defaultExpanded?: boolean;
}

export function SectionHelp({ title, description, tips, defaultExpanded = false }: SectionHelpProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900">{title}</h4>
            {!isExpanded && (
              <p className="text-sm text-blue-700 mt-0.5 line-clamp-1">{description}</p>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-blue-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-3 pl-8">
          <p className="text-sm text-blue-800">{description}</p>
          {tips && tips.length > 0 && (
            <ul className="mt-2 space-y-1">
              {tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-blue-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Contextual help sidebar
interface HelpSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export function HelpSidebar({ isOpen, onClose, title, content }: HelpSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-40 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {content}
      </div>
    </div>
  );
}
