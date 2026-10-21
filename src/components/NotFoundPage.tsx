import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

interface NotFoundPageProps {
  onReturnHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onReturnHome }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-gh-canvas-subtle border border-gh-border-default flex items-center justify-center text-gh-accent-fg mb-6 shadow-xl">
        <ShieldAlert className="w-8 h-8 text-gh-accent-fg" />
      </div>

      <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/30 mb-3">
        HTTP 404 · Resource Not Located
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-gh-fg-default tracking-tight mb-3">
        Repository or View Not Found
      </h1>

      <p className="text-sm text-gh-fg-muted max-w-md mb-8 leading-relaxed">
        The repository report, alert deep link, or navigation target you requested does not exist or has been disconnected.
      </p>

      <div className="flex items-center space-x-3">
        <button
          onClick={onReturnHome}
          className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-all shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
};