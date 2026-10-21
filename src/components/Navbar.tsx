import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  RefreshCw,
  Settings,
  FolderGit2,
  ShieldAlert,
  LogOut,
  Key,
  LayoutDashboard,
  Folders,
} from 'lucide-react';

interface NavbarProps {
  onOpenRepoManager: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRepoManager, onOpenSettings }) => {
  const {
    currentUser,
    config,
    logout,
    isManualScanning,
    scanProgress,
    refreshNow,
    lastRefreshed,
    authError,
    activeTab,
    setActiveTab,
    setSelectedSummary,
    metrics,
  } = useDashboard();

  const handleTabClick = (tab: 'dashboard' | 'repositories') => {
    setSelectedSummary(null);
    setActiveTab(tab);
  };

  return (
    <header className="border-b border-gh-border-default bg-gh-canvas-subtle sticky top-0 z-30 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand & Main Navigation Tabs */}
          <div className="flex items-center space-x-6">
            {/* Brand */}
            <button
              onClick={() => handleTabClick('dashboard')}
              className="flex items-center space-x-2.5 text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-md bg-gh-canvas-default border border-gh-border-default flex items-center justify-center text-gh-accent-fg shadow-inner">
                <ShieldAlert className="w-4 h-4 text-gh-accent-fg" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base text-gh-fg-default tracking-tight">RepoPulse</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/30">
                  v1.2
                </span>
              </div>
            </button>

            {/* Navigation Tabs (Dashboard vs Repositories) */}
            <nav className="hidden sm:flex items-center space-x-1 border-l border-gh-border-default pl-4">
              <button
                onClick={() => handleTabClick('dashboard')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-gh-canvas-default text-gh-fg-default border border-gh-border-default shadow-sm'
                    : 'text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-default/40'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleTabClick('repositories')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  activeTab === 'repositories'
                    ? 'bg-gh-canvas-default text-gh-fg-default border border-gh-border-default shadow-sm'
                    : 'text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-default/40'
                }`}
              >
                <Folders className="w-3.5 h-3.5" />
                <span>Repositories</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] font-mono text-gh-fg-muted">
                  {metrics.total_tracked_repos}
                </span>
              </button>
            </nav>
          </div>

          {/* Center scan progress bar (manual click only) */}
          {isManualScanning && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-md bg-gh-canvas-default border border-gh-border-default text-xs text-gh-fg-muted animate-in fade-in duration-150">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-gh-accent-fg" />
              <span>
                Syncing ({scanProgress.current}/{scanProgress.total}):{' '}
                <strong className="text-gh-fg-default font-mono text-[11px]">{scanProgress.repoName}</strong>
              </span>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center space-x-2.5">
            {/* Refresh Button */}
            <button
              onClick={() => refreshNow(true)}
              disabled={isManualScanning}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-gh-canvas-default hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors disabled:opacity-50"
              title={`Last updated: ${lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Never'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isManualScanning ? 'animate-spin text-gh-accent-fg' : 'text-gh-fg-muted'}`} />
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

            {/* User Auth Profile */}
            <div className="flex items-center space-x-2 pl-1.5 border-l border-gh-border-default">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'GitHub User'}
                  className="w-7 h-7 rounded-full border border-gh-border-default ring-1 ring-gh-accent-emphasis/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gh-canvas-default border border-gh-border-default flex items-center justify-center text-xs font-bold text-gh-accent-fg">
                  {currentUser?.displayName ? currentUser.displayName[0] : <Key className="w-3.5 h-3.5 text-gh-accent-fg" />}
                </div>
              )}
              <span className="text-xs font-medium text-gh-fg-default hidden sm:inline max-w-[120px] truncate">
                {currentUser?.displayName || (config.githubToken ? 'Connected' : 'User')}
              </span>
              <button
                onClick={logout}
                className="p-1 rounded text-gh-fg-muted hover:text-gh-danger-fg hover:bg-gh-canvas-default transition-colors"
                title="Sign out / Disconnect"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-md hover:bg-gh-canvas-default border border-transparent hover:border-gh-border-default text-gh-fg-muted hover:text-gh-fg-default transition-colors"
              title="Settings, API Rate Limit & Credentials"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation tabs */}
        <div className="flex sm:hidden items-center space-x-2 pb-2 pt-1 border-t border-gh-border-muted">
          <button
            onClick={() => handleTabClick('dashboard')}
            className={`flex-1 py-1 rounded text-xs font-semibold text-center ${
              activeTab === 'dashboard'
                ? 'bg-gh-canvas-default text-gh-fg-default border border-gh-border-default'
                : 'text-gh-fg-muted'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => handleTabClick('repositories')}
            className={`flex-1 py-1 rounded text-xs font-semibold text-center ${
              activeTab === 'repositories'
                ? 'bg-gh-canvas-default text-gh-fg-default border border-gh-border-default'
                : 'text-gh-fg-muted'
            }`}
          >
            Repositories ({metrics.total_tracked_repos})
          </button>
        </div>

        {/* Auth error banner */}
        {authError && (
          <div className="py-1.5 px-3 mb-2 rounded bg-gh-danger-subtle border border-gh-danger-fg/40 text-xs text-gh-danger-fg flex items-center justify-between">
            <span>{authError}</span>
          </div>
        )}
      </div>
    </header>
  );
};
