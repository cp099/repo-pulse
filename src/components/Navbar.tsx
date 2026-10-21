import React, { useState, useEffect } from 'react';
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

  // Spam protection: 5-second cooldown on manual refresh to protect GitHub API limits
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleManualRefresh = () => {
    if (isManualScanning || cooldown > 0) return;
    setCooldown(5);
    refreshNow(true);
  };

  const handleTabClick = (tab: 'dashboard' | 'repositories') => {
    setSelectedSummary(null);
    setActiveTab(tab);
  };

  return (
    <header className="border-b border-gh-border-default bg-gh-canvas-subtle sticky top-0 z-30 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Brand & Main Navigation Tabs */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Brand */}
            <button
              onClick={() => handleTabClick('dashboard')}
              aria-label="RepoPulse Home Dashboard"
              className="flex items-center space-x-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gh-accent-fg rounded-md p-1 -m-1"
            >
              <div className="w-8 h-8 rounded-md bg-gh-canvas-default border border-gh-border-default flex items-center justify-center text-gh-accent-fg shadow-inner">
                <ShieldAlert className="w-4 h-4 text-gh-accent-fg" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base text-gh-fg-default tracking-tight">RepoPulse</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-semibold bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/30">
                  v1.2
                </span>
              </div>
            </button>

            {/* Navigation Tabs (Dashboard vs Repositories) */}
            <nav aria-label="Main Navigation" className="hidden sm:flex items-center space-x-1 border-l border-gh-border-default pl-4">
              <button
                onClick={() => handleTabClick('dashboard')}
                aria-current={activeTab === 'dashboard' ? 'page' : undefined}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors min-h-[32px] ${
                  activeTab === 'dashboard'
                    ? 'bg-gh-canvas-default text-gh-fg-default border border-gh-border-default shadow-sm'
                    : 'text-[#c9d1d9] hover:text-gh-fg-default hover:bg-gh-canvas-default/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => handleTabClick('repositories')}
                aria-current={activeTab === 'repositories' ? 'page' : undefined}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors min-h-[32px] ${
                  activeTab === 'repositories'
                    ? 'bg-gh-canvas-default text-gh-fg-default border border-gh-border-default shadow-sm'
                    : 'text-[#c9d1d9] hover:text-gh-fg-default hover:bg-gh-canvas-default/60'
                }`}
              >
                <Folders className="w-3.5 h-3.5" />
                <span>Repositories</span>
                <span className="px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] font-mono font-semibold text-gh-fg-default">
                  {metrics.total_tracked_repos}
                </span>
              </button>
            </nav>
          </div>

          {/* Center scan progress bar (manual click only) */}
          {isManualScanning && (
            <div className="hidden lg:flex items-center space-x-2 px-3 py-1 rounded-md bg-gh-canvas-default border border-gh-border-default text-xs text-[#c9d1d9] animate-in fade-in duration-150">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-gh-accent-fg" />
              <span>
                Syncing ({scanProgress.current}/{scanProgress.total}):{' '}
                <strong className="text-gh-fg-default font-mono text-[11px]">{scanProgress.repoName}</strong>
              </span>
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Refresh Button with Spam/Rate-Limit Cooldown */}
            <button
              onClick={handleManualRefresh}
              disabled={isManualScanning || cooldown > 0}
              aria-label={cooldown > 0 ? `Refresh cooldown ${cooldown}s` : 'Refresh Repositories Now'}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md bg-gh-canvas-default hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors disabled:opacity-50 min-h-[32px]"
              title={
                cooldown > 0
                  ? `Rate limit cooldown: ${cooldown}s`
                  : `Last updated: ${lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Never'}`
              }
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isManualScanning ? 'animate-spin text-gh-accent-fg' : 'text-gh-accent-fg'}`}
              />
              <span className="hidden sm:inline">
                {cooldown > 0 ? `${cooldown}s` : 'Refresh'}
              </span>
            </button>

            {/* Manage Repos */}
            <button
              onClick={onOpenRepoManager}
              aria-label="Manage Tracked Repositories"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors shadow-sm min-h-[32px]"
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Track Repos</span>
              <span className="sm:hidden">Repos</span>
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
              <span className="text-xs font-medium text-gh-fg-default hidden md:inline max-w-[120px] truncate">
                {currentUser?.displayName || (config.githubToken ? 'Connected' : 'User')}
              </span>
              <button
                onClick={logout}
                aria-label="Sign out of RepoPulse"
                className="p-1.5 rounded text-[#8b949e] hover:text-gh-danger-fg hover:bg-gh-canvas-default transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                title="Sign out / Disconnect"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              aria-label="Settings, API Rate Limit & Credentials"
              className="p-1.5 rounded-md hover:bg-gh-canvas-default border border-transparent hover:border-gh-border-default text-[#c9d1d9] hover:text-gh-fg-default transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
              title="Settings, API Rate Limit & Credentials"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation tabs (Touch-Friendly) */}
        <div className="flex sm:hidden items-center space-x-2 pb-2.5 pt-1.5 border-t border-gh-border-muted">
          <button
            onClick={() => handleTabClick('dashboard')}
            aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold text-center min-h-[36px] flex items-center justify-center space-x-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-gh-canvas-default text-gh-fg-default border border-gh-border-default shadow-sm'
                : 'text-[#c9d1d9]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => handleTabClick('repositories')}
            aria-current={activeTab === 'repositories' ? 'page' : undefined}
            className={`flex-1 py-1.5 rounded-md text-xs font-semibold text-center min-h-[36px] flex items-center justify-center space-x-1.5 ${
              activeTab === 'repositories'
                ? 'bg-gh-canvas-default text-gh-fg-default border border-gh-border-default shadow-sm'
                : 'text-[#c9d1d9]'
            }`}
          >
            <Folders className="w-3.5 h-3.5" />
            <span>Repositories ({metrics.total_tracked_repos})</span>
          </button>
        </div>

        {/* Auth error banner */}
        {authError && (
          <div role="alert" className="py-1.5 px-3 mb-2 rounded bg-gh-danger-subtle border border-gh-danger-fg/40 text-xs text-gh-danger-fg flex items-center justify-between">
            <span>{authError}</span>
          </div>
        )}
      </div>
    </header>
  );
};