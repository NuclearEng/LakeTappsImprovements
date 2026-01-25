'use client';

import { ReactNode } from 'react';
import ThemeProvider from './ThemeProvider';

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lake-tapps-theme">
      {children}
    </ThemeProvider>
  );
}
