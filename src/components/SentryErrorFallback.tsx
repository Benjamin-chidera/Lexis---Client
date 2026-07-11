interface FallbackProps {
  error: unknown;
  componentStack: string | null;
  eventId: string | null;
  resetError: () => void;
}

export function SentryErrorFallback({ error, eventId, resetError }: FallbackProps) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-gray-100 overflow-hidden relative">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold mb-3 tracking-tight">Something went wrong</h1>
        <p className="text-gray-400 mb-8 text-sm leading-relaxed">
          We encountered an unexpected error. Our team has been notified.
        </p>

        <div className="w-full text-left bg-gray-950/50 rounded-xl p-4 mb-8 border border-gray-800/50 overflow-x-auto">
          <p className="text-red-400 font-mono text-sm mb-2 font-medium">Error details:</p>
          <code className="text-gray-300 text-xs font-mono whitespace-pre-wrap">
            {error instanceof Error ? error.toString() : String(error)}
          </code>
          {eventId && (
            <p className="text-gray-500 text-xs mt-3 pt-3 border-t border-gray-800/50">
              Error ID: {eventId}
            </p>
          )}
        </div>

        <button
          onClick={() => { resetError(); window.location.reload(); }}
          className="w-full bg-white text-black font-medium py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-[0.98]"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}
