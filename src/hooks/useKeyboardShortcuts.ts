'use client';

import { useEffect, useCallback } from 'react';
import { useStore } from '@/store/useStore';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts() {
  const {
    nextStage,
    previousStage,
    canGoBack,
    canGoForward,
    saveProject,
    addNotification,
  } = useStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'ArrowRight',
          alt: true,
          description: 'Go to next stage',
          action: () => {
            if (canGoForward()) {
              nextStage();
            }
          },
        },
        {
          key: 'ArrowLeft',
          alt: true,
          description: 'Go to previous stage',
          action: () => {
            if (canGoBack()) {
              previousStage();
            }
          },
        },
        {
          key: 's',
          ctrl: true,
          description: 'Save project',
          action: () => {
            saveProject();
            addNotification({
              type: 'success',
              title: 'Project Saved',
              message: 'Your project has been saved.',
              dismissible: true,
              duration: 2000,
            });
          },
        },
        {
          key: '?',
          shift: true,
          description: 'Show keyboard shortcuts',
          action: () => {
            // This would trigger a shortcuts modal
            addNotification({
              type: 'info',
              title: 'Keyboard Shortcuts',
              message: 'Alt+Arrow: Navigate stages | Ctrl+S: Save',
              dismissible: true,
              duration: 5000,
            });
          },
        },
      ];

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const keyMatch = event.key === shortcut.key || event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [nextStage, previousStage, canGoBack, canGoForward, saveProject, addNotification]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Keyboard shortcuts help modal content
export const KEYBOARD_SHORTCUTS = [
  { keys: ['Alt', '\u2192'], description: 'Go to next stage' },
  { keys: ['Alt', '\u2190'], description: 'Go to previous stage' },
  { keys: ['Ctrl/Cmd', 'S'], description: 'Save project' },
  { keys: ['Shift', '?'], description: 'Show keyboard shortcuts' },
  { keys: ['Tab'], description: 'Navigate between elements' },
  { keys: ['Shift', 'Tab'], description: 'Navigate backwards' },
  { keys: ['Enter'], description: 'Activate focused button' },
  { keys: ['Escape'], description: 'Close modals and dialogs' },
];
