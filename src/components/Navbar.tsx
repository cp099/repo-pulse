import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { RefreshCw, Settings, FolderGit2, ShieldAlert, Zap } from 'lucide-react';

interface NavbarProps {
  onOpenRepoManager: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRepoManager, onOpenSettings }) => {
  const {
    isDemoMode,
    isScanning,
    scanProgress,
    refreshNow,
    rateLimit,
    lastRefreshed,
  } = useDashboard();

  return (
    <header className="border-b border-gh-border-default bg-gh-canvas-subtle sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-gh-canvas-default border border-gh-border-default flex items-center justify-center text-gh-accent-fg shadow-inner">
              <ShieldAlert className="w-5 h-5 text-gh-accent-fg" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg text-gh-fg-default tracking-tight">RepoPulse</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/30">
                  v1.0
                </span>
                {isDemoMode && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30">
                    Demo Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-gh-fg-muted hidden sm:block">
                GitHub Security, Dependabot & Pages Health Hub
              </p>
            </div>
          </div>

          {/* Center scan progress */}
          {isScanning && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-gh-canvas-default border border-gh-border-default text-xs text-gh-fg-muted">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-gh-accent-fg" />
              <span>
                Scanning ({scanProgress.current}/{scanProgress.total}):{' '}
                <strong className="text-gh-fg-default">{scanProgress.repoName}</strong>
              </span>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {/* Live Rate Limit */}
            <div className="hidden lg:flex items-center space-x-1.5 text-xs text-gh-fg-muted px-2.5 py-1 rounded bg-gh-canvas-default border border-gh-border-muted" title="GitHub API Rate Limit Remaining">
              <Zap className="w-3.5 h-3.5 text-gh-warning-fg" />
              <span>API:</span>
              <span className={`font-mono font-medium ${rateLimit.remaining < 500 ? 'text-gh-danger-fg' : 'text-gh-fg-default'}`}>
                {rateLimit.remaining.toLocaleString()}
              </span>
            </div>

            {/* Refresh Now */}
            <button
              onClick={() => refreshNow()}
              disabled={isScanning}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gh-canvas-default hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors disabled:opacity-50"
              title={`Last updated: ${lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Never'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-gh-accent-fg' : 'text-gh-fg-muted'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Manage Repos */}
            <button
              onClick={onOpenRepoManager}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors shadow-sm"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Track Repos</span>
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-md hover:bg-gh-canvas-default border border-transparent hover:border-gh-border-default text-gh-fg-muted hover:text-gh-fg-default transition-colors"
              title="Settings & Credentials"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
