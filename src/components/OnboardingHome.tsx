import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  ShieldAlert,
  LogIn,
  Key,
  Code2,
  Globe,
  RefreshCw,
  Lock,
  ArrowRight,
  ExternalLink,
  Flame,
} from 'lucide-react';

export const OnboardingHome: React.FC = () => {
  const { loginWithGitHub, updateConfig, authError, setAuthError } = useDashboard();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showManualPat, setShowManualPat] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [patError, setPatError] = useState<string | null>(null);

  const handleGitHubLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      await loginWithGitHub();
    } catch {
      // Handled in context
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleManualPatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setPatError('Please enter a valid GitHub token');
      return;
    }
    updateConfig({ githubToken: manualToken.trim() });
  };

  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans selection:bg-gh-accent-emphasis selection:text-white">
      {/* Top minimal header */}
      <header className="border-b border-gh-border-default bg-gh-canvas-subtle/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-gh-canvas-default border border-gh-border-default flex items-center justify-center text-gh-accent-fg shadow-inner">
              <ShieldAlert className="w-4 h-4 text-gh-accent-fg" />
            </div>
            <span className="font-semibold text-base text-gh-fg-default tracking-tight">RepoPulse</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/30">
              v1.2
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/cp099/repo-pulse"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gh-fg-muted hover:text-gh-fg-default transition-colors flex items-center space-x-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={handleGitHubLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md bg-[#238636] hover:bg-[#2ea043] text-white transition-colors shadow-sm"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <LogIn className="w-3 h-3" />
              )}
              <span>Sign in</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col items-center text-center">
        {/* Pill announcement */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gh-canvas-subtle border border-gh-border-default text-xs text-gh-fg-muted mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-gh-success-fg animate-pulse" />
          <span>Real-time Health, Security & Build Hub for GitHub Repos</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gh-fg-default tracking-tight max-w-3xl leading-tight sm:leading-tight">
          Your entire GitHub portfolio’s health, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            in a single pulse.
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-gh-fg-muted max-w-2xl leading-relaxed">
          Stop navigating repository-by-repository to check the Security tab. Consolidate your
          <strong> Dependabot CVEs</strong>, <strong>CodeQL scanning flaws</strong>, and
          <strong> GitHub Pages build statuses</strong> into one concise, actionable dashboard with 1-click deep links.
        </p>

        {/* Auth Error Banner if popup blocked */}
        {authError && (
          <div className="mt-5 p-3 rounded-lg bg-gh-danger-subtle border border-gh-danger-fg/40 text-xs text-gh-danger-fg max-w-md w-full text-left flex items-start space-x-2">
            <span className="font-bold flex-shrink-0">Authentication notice:</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleGitHubLogin}
            disabled={isLoggingIn}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isLoggingIn ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Sign in with GitHub (1-Click)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowManualPat(!showManualPat)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium rounded-lg bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors flex items-center justify-center space-x-1.5"
          >
            <Key className="w-3.5 h-3.5 text-gh-accent-fg" />
            <span>Use Personal Access Token</span>
          </button>
        </div>

        {/* Manual PAT Accordion Form */}
        {showManualPat && (
          <form
            onSubmit={handleManualPatSubmit}
            className="mt-5 p-4 rounded-xl bg-gh-canvas-subtle border border-gh-border-default max-w-md w-full text-left space-y-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gh-fg-default">GitHub Personal Access Token</label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,security_events,actions:read&description=RepoPulse"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-gh-accent-fg hover:underline"
                >
                  Generate token ↗
                </a>
              </div>
              <input
                type="password"
                value={manualToken}
                onChange={(e) => {
                  setManualToken(e.target.value);
                  setPatError(null);
                }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-gh-canvas-default border border-gh-border-default focus:border-gh-accent-fg rounded-md px-3 py-1.5 text-xs font-mono text-gh-fg-default placeholder-gh-fg-muted outline-none"
              />
              {patError && <p className="text-[11px] text-gh-danger-fg mt-1">{patError}</p>}
            </div>
            <button
              type="submit"
              className="w-full py-1.5 text-xs font-semibold rounded bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors"
            >
              Connect with Token
            </button>
          </form>
        )}

        {/* Feature Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
          {/* Card 1: Dependabot */}
          <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default hover:border-gh-border-muted transition-colors shadow-sm relative overflow-hidden group">
            <div className="p-2 w-fit rounded-lg bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/30 mb-3.5">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gh-fg-default mb-1">Dependabot CVE Triage</h3>
            <p className="text-xs text-gh-fg-muted leading-relaxed">
              Consolidate urgent Critical & High vulnerabilities across all package manifests. See vulnerable version ranges, patched releases, and open direct fix pages.
            </p>
          </div>

          {/* Card 2: CodeQL */}
          <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default hover:border-gh-border-muted transition-colors shadow-sm relative overflow-hidden group">
            <div className="p-2 w-fit rounded-lg bg-gh-purple-subtle text-gh-purple-fg border border-gh-purple-fg/30 mb-3.5">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gh-fg-default mb-1">CodeQL Static Analysis</h3>
            <p className="text-xs text-gh-fg-muted leading-relaxed">
              Surface security flaws, SQL injection risks, and CWE violations. Pinpoint the exact file path and line number with one-click navigation to CodeQL findings.
            </p>
          </div>

          {/* Card 3: Pages & Builds */}
          <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default hover:border-gh-border-muted transition-colors shadow-sm relative overflow-hidden group">
            <div className="p-2 w-fit rounded-lg bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/30 mb-3.5">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-gh-fg-default mb-1">GitHub Pages & Builds</h3>
            <p className="text-xs text-gh-fg-muted leading-relaxed">
              Track static site deployment health and CI/CD workflow status. Instantly detect failed build runs and navigate straight to the error logs.
            </p>
          </div>
        </div>

        {/* Security / Privacy reassurance banner */}
        <div className="mt-12 p-4 rounded-xl bg-gh-canvas-subtle/60 border border-gh-border-muted max-w-2xl w-full flex items-center space-x-3 text-left">
          <div className="p-2 rounded-full bg-gh-canvas-default border border-gh-border-default text-gh-success-fg flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-gh-fg-default">Client-Direct & Zero-Intermediary Architecture:</span>{' '}
            <span className="text-gh-fg-muted">
              All GitHub API calls run directly between your browser and <code>api.github.com</code>. Tokens and alerts are never intercepted by third-party proxies.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gh-border-default bg-gh-canvas-subtle py-5 text-xs text-gh-fg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-gh-accent-fg" />
            <span>RepoPulse · Open Source GitHub Security Operations</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/cp099/repo-pulse"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gh-fg-default transition-colors"
            >
              Source Code
            </a>
            <span>·</span>
            <a
              href="https://docs.github.com/en/code-security"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gh-fg-default transition-colors"
            >
              GitHub Code Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
