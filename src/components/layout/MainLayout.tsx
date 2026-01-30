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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50/30">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-lake-100/20 to-transparent rounded-full blur-3xl" />
      </div>

      <Header />
      <ProgressBar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl pb-28">
        {children}
      </main>
      <NavigationControls />
    </div>
  );
}
