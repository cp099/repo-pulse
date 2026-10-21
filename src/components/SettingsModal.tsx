import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  X,
  Key,
  Cloud,
  Clock,
  CheckCircle2,
  Shield,
  Zap,
  Info,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, refreshNow, rateLimit } = useDashboard();

  const [token, setToken] = useState(config.githubToken || '');
  const [interval, setInterval] = useState(config.autoRefreshInterval || 120000);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedToken = token.trim();

    // Form Validation for PAT (if non-empty)
    if (trimmedToken.length > 0) {
      if (trimmedToken.length < 30) {
        setValidationError('Token appears too short (must be at least 30 characters).');
        return;
      }
      const isValid =
        trimmedToken.startsWith('ghp_') ||
        trimmedToken.startsWith('github_pat_') ||
        trimmedToken.startsWith('gho_') ||
        /^[a-f0-9]{40}$/i.test(trimmedToken);
      if (!isValid) {
        setValidationError('Invalid token prefix. Use "ghp_" for classic or "github_pat_" for fine-grained.');
        return;
      }
    }

    setValidationError(null);

    updateConfig({
      githubToken: trimmedToken,
      autoRefreshInterval: Math.max(0, Number(interval)),
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
      refreshNow(true);
    }, 600);
  };

  const resetTimeStr = new Date(rateLimit.reset * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const apiPercent = Math.max(0, Math.min(100, Math.round((rateLimit.remaining / rateLimit.limit) * 100)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-gh-canvas-subtle border border-gh-border-default rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gh-border-default flex items-center justify-between bg-gh-canvas-default rounded-t-xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-gh-canvas-subtle border border-gh-border-default text-gh-accent-fg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gh-fg-default">Settings &amp; Operations</h3>
              <p className="text-xs text-[#c9d1d9]">API quota, refresh frequency, and credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 rounded-md text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. GitHub API Rate Limit Info Card */}
          <div className="p-3.5 rounded-lg bg-gh-canvas-default border border-gh-border-default space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-gh-warning-fg" />
                <span className="text-xs font-semibold text-gh-fg-default">GitHub API Hourly Rate Limit</span>
              </div>
              <span className="font-mono text-xs font-bold text-gh-fg-default">
                {rateLimit.remaining.toLocaleString()} / {rateLimit.limit.toLocaleString()}
              </span>
            </div>

            {/* Gauge bar */}
            <div className="w-full bg-gh-border-muted rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  apiPercent > 40 ? 'bg-gh-success-fg' : apiPercent > 15 ? 'bg-gh-warning-fg' : 'bg-gh-danger-fg'
                }`}
                style={{ width: `${apiPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#c9d1d9]">
              <span>{apiPercent}% quota remaining</span>
              <span>Resets at {resetTimeStr}</span>
            </div>

            <div className="pt-2 border-t border-gh-border-muted text-[11px] text-[#c9d1d9] flex items-start space-x-1.5">
              <Info className="w-3.5 h-3.5 text-gh-accent-fg flex-shrink-0 mt-0.5" />
              <span>
                <strong>What is this count?</strong> GitHub grants each authenticated user a bucket of 5,000 API requests per hour. RepoPulse scans your repos efficiently and queries only when needed. The bucket refills every 60 minutes.
              </span>
            </div>
          </div>

          {/* 2. Auto-Refresh Interval with Rate-Limit Safe Bounds */}
          <div className="space-y-1.5">
            <label htmlFor="refresh-interval-select" className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gh-accent-fg" />
              <span>Silent Background Refresh Frequency</span>
            </label>
            <select
              id="refresh-interval-select"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full bg-gh-canvas-default border border-gh-border-default focus:border-gh-accent-fg rounded-md px-3 py-2 text-xs text-gh-fg-default outline-none cursor-pointer min-h-[38px]"
            >
              <option value={60000}>Every 1 minute (Fastest)</option>
              <option value={120000}>Every 2 minutes (Recommended)</option>
              <option value={300000}>Every 5 minutes</option>
              <option value={600000}>Every 10 minutes</option>
              <option value={0}>Manual refresh only</option>
            </select>
            <p className="text-[11px] text-[#8b949e]">
              Background updates execute completely silently without interface interruptions.
            </p>
          </div>

          {/* 3. GitHub Token (Optional manual override with validation) */}
          <div className="space-y-2 pt-2 border-t border-gh-border-muted">
            <div className="flex items-center justify-between">
              <label htmlFor="pat-override-input" className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-gh-accent-fg" />
                <span>Personal Access Token (PAT Override)</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,security_events,actions:read&description=RepoPulse"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-gh-accent-fg hover:underline inline-flex items-center space-x-0.5"
              >
                <span>Generate token</span>
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </div>

            <input
              id="pat-override-input"
              type="password"
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                setValidationError(null);
              }}
              aria-invalid={!!validationError}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className={`w-full bg-gh-canvas-default border ${
                validationError ? 'border-gh-danger-fg' : 'border-gh-border-default focus:border-gh-accent-fg'
              } rounded-md px-3 py-2 text-xs font-mono text-gh-fg-default placeholder-[#8b949e] outline-none min-h-[38px]`}
            />

            {validationError && (
              <p role="alert" className="text-[11px] text-gh-danger-fg font-medium flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{validationError}</span>
              </p>
            )}

            <p className="text-[11px] text-[#8b949e]">
              If signed in via GitHub OAuth, this token is managed automatically. You can paste a custom PAT here if you want to override permissions.
            </p>
          </div>

          {/* 4. Firebase Cloud Sync Status */}
          <div className="pt-2 border-t border-gh-border-muted">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
                    <Cloud className="w-3.5 h-3.5 text-gh-accent-fg" />
                    <span>Firebase Cloud Sync</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-gh-success-subtle text-gh-success-fg border border-gh-success-fg/30">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Active (repopulse-app-71baa)</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#8b949e] mt-1">
                  Synchronizes your monitored repositories and alert snapshots to production Firestore securely.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gh-border-default bg-gh-canvas-default rounded-b-xl flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs text-gh-success-fg flex items-center space-x-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settings saved!</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-md bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors min-h-[36px]"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors shadow-sm min-h-[36px]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};