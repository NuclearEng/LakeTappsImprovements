'use client';

import { ReactNode } from 'react';
import Header from './Header';
import ProgressBar from './ProgressBar';
import NavigationControls from './NavigationControls';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <ProgressBar />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-5xl">
        {children}
      </main>
      <NavigationControls />
    </div>
  );
}
