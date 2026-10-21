import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { FilterToolbar } from './components/FilterToolbar';
import { RepoTable } from './components/RepoTable';
import { RepoGrid } from './components/RepoGrid';
import { AlertPage } from './components/AlertPage';
import { RepoManagementModal } from './components/RepoManagementModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingHome } from './components/OnboardingHome';
import { useDashboard } from './context/DashboardContext';
import { ShieldCheck } from 'lucide-react';

export const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    selectedSummary,
    setSelectedSummary,
    activeTab,
    viewMode,
  } = useDashboard();

  const [isRepoManagerOpen, setIsRepoManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Unauthenticated landing page
  if (!isAuthenticated) {
    return <OnboardingHome />;
  }

  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans selection:bg-gh-accent-emphasis selection:text-white w-full">
      {/* Top Navbar with Tab Switcher */}
      <Navbar
        onOpenRepoManager={() => setIsRepoManagerOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5">
        {selectedSummary ? (
          /* Sub-page 1: Full-Page Alert Detail with Expandable Issues */
          <AlertPage
            summary={selectedSummary}
            onBack={() => setSelectedSummary(null)}
          />
        ) : activeTab === 'dashboard' ? (
          /* Main Page: Pure Executive/TV/Mobile Wallboard Dashboard */
          <ExecutiveDashboard />
        ) : (
          /* Sub-page 2: Dedicated Repositories Ledger Sub-Page */
          <div className="space-y-4">
            <FilterToolbar />
            {viewMode === 'grid' ? <RepoGrid /> : <RepoTable />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gh-border-default bg-gh-canvas-subtle py-5 text-xs text-gh-fg-muted mt-10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
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
