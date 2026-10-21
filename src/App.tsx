import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { FilterToolbar } from './components/FilterToolbar';
import { RepoTable } from './components/RepoTable';
import { AlertDetailDrawer } from './components/AlertDetailDrawer';
import { RepoManagementModal } from './components/RepoManagementModal';
import { SettingsModal } from './components/SettingsModal';
import { useDashboard } from './context/DashboardContext';
import { Sparkles, ShieldCheck, LogIn } from 'lucide-react';

export const AppContent: React.FC = () => {
  const {
    currentUser,
    config,
    loginWithGitHub,
  } = useDashboard();

  const [isRepoManagerOpen, setIsRepoManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGitHubLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGitHub();
    } catch {
      // Handled in context
    } finally {
      setIsLoggingIn(false);
    }
  };

  const isGuest = !currentUser && !config.githubToken;

  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans selection:bg-gh-accent-emphasis selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenRepoManager={() => setIsRepoManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Guest Onboarding Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-blue-950/60 via-purple-950/40 to-blue-950/60 border-b border-gh-accent-emphasis/30 py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-full bg-gh-accent-emphasis/20 text-gh-accent-fg border border-gh-accent-emphasis/30 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gh-fg-default">
                  Welcome to RepoPulse! You are previewing simulated repositories in Demo Mode.
                </p>
                <p className="text-[11px] text-gh-fg-muted">
                  Sign in with GitHub with 1-click to auto-detect and monitor your real repositories.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={handleGitHubLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#238636] hover:bg-[#2ea043] text-white transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in with GitHub</span>
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-muted hover:text-gh-fg-default transition-colors"
              >
                Manual PAT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Metric Overview Cards */}
        <MetricsOverview />

        {/* Filter and Search Bar */}
        <FilterToolbar />

        {/* Repository Ledger Table */}
        <RepoTable />
      </main>

      {/* Footer */}
      <footer className="border-t border-gh-border-default bg-gh-canvas-subtle py-5 text-xs text-gh-fg-muted mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-gh-accent-fg" />
            <span>RepoPulse · Automated GitHub Security & Health Operations</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/cp099/repo-pulse"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gh-fg-default transition-colors"
            >
              GitHub Repository
            </a>
            <span>·</span>
            <a
              href="https://docs.github.com/en/code-security"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gh-fg-default transition-colors"
            >
              GitHub Code Security Docs
            </a>
          </div>
        </div>
      </footer>

      {/* Slide-over Drawer for Granular Alert Details */}
      <AlertDetailDrawer />

      {/* Modal for Selecting Tracked Repos */}
      <RepoManagementModal
        isOpen={isRepoManagerOpen}
        onClose={() => setIsRepoManagerOpen(false)}
      />

      {/* Modal for Settings & GitHub PAT */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
