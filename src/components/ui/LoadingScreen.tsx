'use client';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="w-16 h-16 spinner border-4 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-300 font-medium">{message}</p>
      </div>
    </div>
  );
}
