import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  RefreshCw,
  Settings,
  FolderGit2,
  ShieldAlert,
  Zap,
  LogIn,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenRepoManager: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRepoManager, onOpenSettings }) => {
  const {
    currentUser,
    loginWithGitHub,
    logout,
    isDemoMode,
    isScanning,
    scanProgress,
    refreshNow,
    rateLimit,
    lastRefreshed,
    authError,
  } = useDashboard();

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGitHub();
    } catch {
      // Error handled in context
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <header className="border-b border-gh-border-default bg-gh-canvas-subtle sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-md bg-gh-canvas-default border border-gh-border-default flex items-center justify-center text-gh-accent-fg shadow-inner">
              <ShieldAlert className="w-4 h-4 text-gh-accent-fg" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base text-gh-fg-default tracking-tight">RepoPulse</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/30">
                  v1.1
                </span>
                {isDemoMode && !currentUser && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30 flex items-center space-x-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Demo Mode</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Center scan progress */}
          {isScanning && (
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-md bg-gh-canvas-default border border-gh-border-default text-xs text-gh-fg-muted">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-gh-accent-fg" />
              <span>
                Scanning ({scanProgress.current}/{scanProgress.total}):{' '}
                <strong className="text-gh-fg-default font-mono text-[11px]">{scanProgress.repoName}</strong>
              </span>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center space-x-2.5">
            {/* Live Rate Limit */}
            <div
              className="hidden lg:flex items-center space-x-1 text-xs text-gh-fg-muted px-2 py-1 rounded bg-gh-canvas-default border border-gh-border-muted"
              title="GitHub REST API Rate Limit Remaining"
            >
              <Zap className="w-3 h-3 text-gh-warning-fg" />
              <span className="text-[11px]">API:</span>
              <span className={`font-mono font-medium text-[11px] ${rateLimit.remaining < 500 ? 'text-gh-danger-fg' : 'text-gh-fg-default'}`}>
                {rateLimit.remaining.toLocaleString()}
              </span>
            </div>

            {/* Refresh Now */}
            <button
              onClick={() => refreshNow()}
              disabled={isScanning}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-gh-canvas-default hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors disabled:opacity-50"
              title={`Last updated: ${lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Never'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-gh-accent-fg' : 'text-gh-fg-muted'}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Manage Repos */}
            <button
              onClick={onOpenRepoManager}
              className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-medium rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors shadow-sm"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Track Repos</span>
            </button>

            {/* User Auth Profile or 1-Click Login Button */}
            {currentUser ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-gh-border-default">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'GitHub User'}
                    className="w-7 h-7 rounded-full border border-gh-border-default ring-1 ring-gh-accent-emphasis/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gh-canvas-default border border-gh-border-default flex items-center justify-center text-xs font-bold text-gh-accent-fg">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <span className="text-xs font-medium text-gh-fg-default hidden sm:inline max-w-[100px] truncate">
                  {currentUser.displayName || 'GitHub User'}
                </span>
                <button
                  onClick={logout}
                  className="p-1 rounded text-gh-fg-muted hover:text-gh-danger-fg hover:bg-gh-canvas-default transition-colors"
                  title="Sign out of GitHub"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleGitHubLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-[#238636] hover:bg-[#2ea043] text-white transition-colors shadow-sm"
                title="Sign in with GitHub OAuth (Instant 1-click onboarding)"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogIn className="w-3.5 h-3.5" />
                )}
                <span>Sign in with GitHub</span>
              </button>
            )}

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md hover:bg-gh-canvas-default border border-transparent hover:border-gh-border-default text-gh-fg-muted hover:text-gh-fg-default transition-colors"
              title="Settings & Manual PAT"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auth error notification banner if any */}
        {authError && (
          <div className="py-1.5 px-3 mb-2 rounded bg-gh-danger-subtle border border-gh-danger-fg/40 text-xs text-gh-danger-fg flex items-center justify-between">
            <span>{authError}</span>
            <button onClick={() => {}} className="text-gh-danger-fg font-bold ml-2">×</button>
          </div>
        )}
      </div>
    </header>
  );
};
