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
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsConditionsModal } from './TermsConditionsModal';

export const OnboardingHome: React.FC = () => {
  const { loginWithGitHub, updateConfig, authError, setAuthError } = useDashboard();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showManualPat, setShowManualPat] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [patError, setPatError] = useState<string | null>(null);
  
  // Spam & Bot Protection: Invisible Honeypot
  const [honeypot, setHoneypot] = useState('');

  // Modals for Legal & Compliance
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

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

    // 1. Spam / Bot Detection via Honeypot
    if (honeypot.trim().length > 0) {
      console.warn('Bot detected and blocked via honeypot.');
      return;
    }

    const trimmed = manualToken.trim();

    // 2. Strict Form Validation for GitHub Token
    if (!trimmed) {
      setPatError('Please enter a GitHub Personal Access Token.');
      return;
    }

    if (trimmed.length < 30) {
      setPatError('Token is too short. GitHub Personal Access Tokens are at least 40 characters.');
      return;
    }

    // Classic tokens start with ghp_, fine-grained tokens start with github_pat_
    const isValidFormat =
      trimmed.startsWith('ghp_') ||
      trimmed.startsWith('github_pat_') ||
      trimmed.startsWith('gho_') ||
      /^[a-f0-9]{40}$/i.test(trimmed);

    if (!isValidFormat) {
      setPatError(
        'Unrecognized token prefix. Classic tokens start with "ghp_" and Fine-grained tokens start with "github_pat_".'
      );
      return;
    }

    setPatError(null);
    updateConfig({ githubToken: trimmed });
  };

  return (
    <div className="min-h-screen bg-gh-canvas-default text-gh-fg-default flex flex-col font-sans selection:bg-gh-accent-emphasis selection:text-white">
      {/* Top minimal header */}
      <header className="border-b border-gh-border-default bg-gh-canvas-subtle/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-md bg-gh-canvas-default border border-gh-border-default flex items-center justify-center text-gh-accent-fg shadow-inner">
              <ShieldAlert className="w-4 h-4 text-gh-accent-fg" />
            </div>
            <span className="font-semibold text-base text-gh-fg-default tracking-tight">RepoPulse</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/40">
              v1.2
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/cp099/repo-pulse"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-gh-fg-muted hover:text-gh-fg-default transition-colors flex items-center space-x-1"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            {/* Direct 1-Click CTA in Header */}
            <button
              onClick={handleGitHubLogin}
              disabled={isLoggingIn}
              aria-label="Sign in with GitHub"
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#238636] hover:bg-[#2ea043] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2ea043] text-white transition-all shadow-sm disabled:opacity-50 min-h-[32px]"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <LogIn className="w-3 h-3" />
              )}
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center text-center">
        {/* Pill announcement with high contrast text */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gh-canvas-subtle border border-gh-border-default text-xs font-medium text-gh-fg-default mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-gh-success-fg animate-pulse" />
          <span>Real-time Health, Security &amp; Build Hub for GitHub Repos</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-gh-fg-default tracking-tight max-w-3xl leading-tight sm:leading-tight">
          Your entire GitHub portfolio’s health, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
            in a single pulse.
          </span>
        </h1>

        <p className="mt-4 text-sm sm:text-base text-[#c9d1d9] max-w-2xl leading-relaxed">
          Stop navigating repository-by-repository to check the Security tab. Consolidate your
          <strong className="text-gh-fg-default"> Dependabot CVEs</strong>, <strong className="text-gh-fg-default">CodeQL scanning flaws</strong>, and
          <strong className="text-gh-fg-default"> GitHub Pages build statuses</strong> into one concise, actionable dashboard with 1-click deep links.
        </p>

        {/* Auth Error Banner if popup blocked */}
        {authError && (
          <div
            role="alert"
            className="mt-5 p-3 rounded-lg bg-gh-danger-subtle border border-gh-danger-fg/40 text-xs text-gh-danger-fg max-w-md w-full text-left flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Authentication Notice:</span> {authError}
            </div>
          </div>
        )}

        {/* ONE CLEAR PRIMARY CALL TO ACTION */}
        <div className="mt-8 flex flex-col items-center w-full max-w-md">
          <button
            onClick={handleGitHubLogin}
            disabled={isLoggingIn}
            aria-label="Connect GitHub Account with 1-Click OAuth"
            className="w-full inline-flex items-center justify-center space-x-2 px-8 py-3.5 text-base font-bold rounded-xl bg-[#238636] hover:bg-[#2ea043] focus-visible:ring-4 focus-visible:ring-[#2ea043]/40 text-white transition-all shadow-lg hover:shadow-emerald-900/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 min-h-[48px]"
          >
            {isLoggingIn ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            <span>Connect GitHub Account</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Social Proof / Trust Indicators */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#8b949e]">
            <span className="inline-flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-gh-success-fg" />
              <span>1-Click OAuth Setup</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-gh-accent-fg" />
              <span>Zero-Intermediary Direct API</span>
            </span>
            <span>·</span>
            <span className="inline-flex items-center space-x-1">
              <span>Free &amp; Open Source</span>
            </span>
          </div>

          {/* Secondary Action: Subordinate manual token trigger */}
          <div className="mt-4 pt-4 border-t border-gh-border-muted w-full text-center">
            <button
              onClick={() => setShowManualPat(!showManualPat)}
              aria-expanded={showManualPat}
              className="text-xs font-medium text-gh-accent-fg hover:text-blue-300 transition-colors inline-flex items-center space-x-1.5 focus:outline-none focus:underline"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showManualPat ? 'Hide Personal Access Token input' : 'Or connect via Personal Access Token (PAT)'}</span>
            </button>
          </div>
        </div>

        {/* Manual PAT Accordion Form with Honeypot & Validation */}
        {showManualPat && (
          <form
            onSubmit={handleManualPatSubmit}
            noValidate
            className="mt-4 p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default max-w-md w-full text-left space-y-3.5 animate-in fade-in zoom-in-95 duration-150 shadow-md"
          >
            {/* Bot Honeypot: invisible to users, bots fill it */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="company_website_hp">Leave this empty</label>
              <input
                id="company_website_hp"
                name="company_website_hp"
                type="text"
                tabIndex={-1}
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="manual-pat-input" className="text-xs font-semibold text-gh-fg-default">
                  GitHub Personal Access Token
                </label>
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,security_events,actions:read&description=RepoPulse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-gh-accent-fg hover:underline font-medium inline-flex items-center space-x-0.5"
                >
                  <span>Generate token</span>
                  <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                </a>
              </div>
              <input
                id="manual-pat-input"
                type="password"
                value={manualToken}
                onChange={(e) => {
                  setManualToken(e.target.value);
                  setPatError(null);
                }}
                aria-invalid={!!patError}
                aria-describedby={patError ? 'pat-error-msg' : undefined}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className={`w-full bg-gh-canvas-default border ${
                  patError ? 'border-gh-danger-fg focus:ring-gh-danger-fg' : 'border-gh-border-default focus:border-gh-accent-fg'
                } rounded-md px-3 py-2 text-xs font-mono text-gh-fg-default placeholder-[#8b949e] outline-none focus:ring-1 min-h-[38px]`}
              />
              {patError && (
                <p id="pat-error-msg" role="alert" className="text-[11px] text-gh-danger-fg font-medium mt-1.5 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{patError}</span>
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 text-xs font-semibold rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors min-h-[38px] shadow-sm"
            >
              Connect with Token
            </button>
          </form>
        )}

        {/* Feature Cards Grid (Mobile responsive) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left">
          {/* Card 1: Dependabot */}
          <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default hover:border-gh-border-muted transition-colors shadow-sm relative overflow-hidden group">
            <div className="p-2 w-fit rounded-lg bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/30 mb-3.5">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-gh-fg-default mb-1">Dependabot CVE Triage</h2>
            <p className="text-xs text-[#c9d1d9] leading-relaxed">
              Consolidate urgent Critical &amp; High vulnerabilities across all package manifests. See vulnerable version ranges, patched releases, and open direct fix pages.
            </p>
          </div>

          {/* Card 2: CodeQL */}
          <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default hover:border-gh-border-muted transition-colors shadow-sm relative overflow-hidden group">
            <div className="p-2 w-fit rounded-lg bg-gh-purple-subtle text-gh-purple-fg border border-gh-purple-fg/30 mb-3.5">
              <Code2 className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-gh-fg-default mb-1">CodeQL Static Analysis</h2>
            <p className="text-xs text-[#c9d1d9] leading-relaxed">
              Surface security flaws, SQL injection risks, and CWE violations. Pinpoint the exact file path and line number with one-click navigation to CodeQL findings.
            </p>
          </div>

          {/* Card 3: Pages & Builds */}
          <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default hover:border-gh-border-muted transition-colors shadow-sm relative overflow-hidden group">
            <div className="p-2 w-fit rounded-lg bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/30 mb-3.5">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-semibold text-gh-fg-default mb-1">GitHub Pages &amp; Builds</h2>
            <p className="text-xs text-[#c9d1d9] leading-relaxed">
              Track static site deployment health and CI/CD workflow status. Instantly detect failed build runs and navigate straight to the error logs.
            </p>
          </div>
        </div>

        {/* Security / Privacy reassurance banner */}
        <div className="mt-10 p-4 rounded-xl bg-gh-canvas-subtle/80 border border-gh-border-muted max-w-2xl w-full flex items-center space-x-3 text-left">
          <div className="p-2 rounded-full bg-gh-canvas-default border border-gh-border-default text-gh-success-fg flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-gh-fg-default">Client-Direct &amp; Zero-Intermediary Architecture:</span>{' '}
            <span className="text-[#c9d1d9]">
              All GitHub API calls run directly between your browser and <code>api.github.com</code>. Tokens and alerts are never intercepted by third-party proxies.
            </span>
          </div>
        </div>
      </main>

      {/* Footer with Legal Links */}
      <footer className="border-t border-gh-border-default bg-gh-canvas-subtle py-5 text-xs text-[#8b949e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-3.5 h-3.5 text-gh-accent-fg" />
            <span className="text-gh-fg-default font-medium">RepoPulse</span>
            <span>· Open Source GitHub Security Operations</span>
          </div>
          <div className="flex items-center space-x-4">
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
              GitHub Source
            </a>
          </div>
        </div>
      </footer>

      {/* Legal Modals */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsConditionsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
};