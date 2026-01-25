'use client';

import { ReactNode } from 'react';
import Header from './Header';
import ProgressBar from './ProgressBar';
import NavigationControls from './NavigationControls';
import SkipLinks from '@/components/ui/SkipLinks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Skip links for keyboard navigation */}
      <SkipLinks />

      <Header />
      <ProgressBar />
      <main
        id="main-content"
        className="flex-1 container mx-auto px-4 py-6 max-w-5xl"
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
      <nav
        id="navigation"
        aria-label="Workflow navigation"
      >
        <NavigationControls />
      </nav>
    </div>
  );
}
