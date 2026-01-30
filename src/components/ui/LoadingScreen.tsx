'use client';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center z-50">
      <div className="text-center animate-fade-in">
        {/* Logo with pulse effect */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-lake-500 to-lake-600 rounded-2xl flex items-center justify-center shadow-xl shadow-lake-500/30">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-2xl bg-lake-500/30 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-lake-400 to-lake-600 rounded-full animate-loading-bar"
            style={{
              animation: 'loading-bar 1.5s ease-in-out infinite',
            }}
          />
        </div>

        <p className="text-slate-600 font-medium">{message}</p>
      </div>

      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            margin-left: 0%;
          }
          50% {
            width: 70%;
            margin-left: 15%;
          }
          100% {
            width: 0%;
            margin-left: 100%;
          }
        }
      `}</style>
    </div>
  );
}
