import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { FilterToolbar } from './components/FilterToolbar';
import { RepoTable } from './components/RepoTable';
import { AlertDetailDrawer } from './components/AlertDetailDrawer';
import { RepoManagementModal } from './components/RepoManagementModal';
import { SettingsModal } from './components/SettingsModal';
import { useDashboard } from './context/DashboardContext';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { isDemoMode } = useDashboard();
  const [isRepoManagerOpen, setIsRepoManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans selection:bg-gh-accent-emphasis selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenRepoManager={() => setIsRepoManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Demo Banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border-b border-gh-accent-emphasis/30 py-2.5 px-4 text-xs text-center text-gh-fg-default">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-gh-accent-fg flex-shrink-0" />
            <span>
              You are exploring <strong>Demo Mode</strong> with simulated repositories, Dependabot CVEs, CodeQL findings, and Pages builds.
            </span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="ml-2 font-semibold text-gh-accent-fg hover:underline inline-flex items-center space-x-0.5"
            >
              <span>Connect your GitHub token</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Metric Overview Cards */}
        <MetricsOverview />

        {/* Filter and Search Bar */}
        <FilterToolbar />

        {/* Repository Ledger Table */}
        <RepoTable />
      </main>

      {/* Footer */}
      <footer className="border-t border-gh-border-default bg-gh-canvas-subtle py-6 text-xs text-gh-fg-muted mt-12">
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
