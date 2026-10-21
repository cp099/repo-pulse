import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MetricsOverview } from './components/MetricsOverview';
import { FilterToolbar } from './components/FilterToolbar';
import { RepoTable } from './components/RepoTable';
import { AlertDetailDrawer } from './components/AlertDetailDrawer';
import { RepoManagementModal } from './components/RepoManagementModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingHome } from './components/OnboardingHome';
import { useDashboard } from './context/DashboardContext';
import { ShieldCheck } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { isAuthenticated } = useDashboard();
  const [isRepoManagerOpen, setIsRepoManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // If not authenticated, render the high-converting Onboarding Home Landing Page!
  if (!isAuthenticated) {
    return <OnboardingHome />;
  }

  // Once authenticated (via 1-click GitHub OAuth or manual PAT), render the Full Dashboard!
  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans selection:bg-gh-accent-emphasis selection:text-white">
      {/* Navbar */}
      <Navbar
        onOpenRepoManager={() => setIsRepoManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

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
