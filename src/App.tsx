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
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { TermsConditionsModal } from './components/TermsConditionsModal';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { NotFoundPage } from './components/NotFoundPage';
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
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Check if current URL requests a 404 error view
  const [isNotFound, setIsNotFound] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') === '404' || params.get('status') === '404' || window.location.pathname.endsWith('/404');
    } catch {
      return false;
    }
  });

  // Custom 404 Page View
  if (isNotFound) {
    return (
      <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans">
        <header className="border-b border-gh-border-default bg-gh-canvas-subtle h-14 flex items-center px-6">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-gh-accent-fg" />
            <span className="font-semibold text-base text-gh-fg-default">RepoPulse</span>
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <NotFoundPage
            onReturnHome={() => {
              window.history.replaceState(null, '', window.location.pathname.replace(/\/404$/, '') || './');
              setIsNotFound(false);
            }}
          />
        </main>
      </div>
    );
  }

  // Unauthenticated landing page
  if (!isAuthenticated) {
    return (
      <>
        <OnboardingHome />
        <CookieConsentBanner onOpenPrivacy={() => setIsPrivacyOpen(true)} />
        <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
        <TermsConditionsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans selection:bg-gh-accent-emphasis selection:text-white w-full">
      {/* Top Navbar with Tab Switcher & Refresh Cooldown */}
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
      <footer className="border-t border-gh-border-default bg-gh-canvas-subtle py-5 text-xs text-[#8b949e] mt-10 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-gh-accent-fg" />
            <span className="text-gh-fg-default font-medium">RepoPulse</span>
            <span>· Automated GitHub Security &amp; Health Operations</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="hover:text-gh-fg-default transition-colors underline-offset-2 hover:underline"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-gh-fg-default transition-colors underline-offset-2 hover:underline"
            >
              Terms &amp; Conditions
            </button>
            <span>·</span>
            <a
              href="https://github.com/cp099/repo-pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gh-fg-default transition-colors underline-offset-2 hover:underline"
            >
              GitHub Repository
            </a>
            <span>·</span>
            <a
              href="https://docs.github.com/en/code-security"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gh-fg-default transition-colors underline-offset-2 hover:underline"
            >
              Security Docs
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

      {/* Legal Modals */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
      <TermsConditionsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* Cookie Consent Banner */}
      <CookieConsentBanner onOpenPrivacy={() => setIsPrivacyOpen(true)} />
    </div>
  );
};