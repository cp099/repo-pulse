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

  if (!isOpen) return null;

  const handleSave = () => {
    updateConfig({
      githubToken: token.trim(),
      autoRefreshInterval: Number(interval),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-gh-canvas-subtle border border-gh-border-default rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gh-border-default flex items-center justify-between bg-gh-canvas-default rounded-t-xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-gh-canvas-subtle border border-gh-border-default text-gh-accent-fg">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gh-fg-default">Settings & Operations</h3>
              <p className="text-xs text-gh-fg-muted">API quota, refresh frequency, and credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. GitHub API Rate Limit Info Card (Moved from Navbar) */}
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

            <div className="flex items-center justify-between text-[11px] text-gh-fg-muted">
              <span>{apiPercent}% quota remaining</span>
              <span>Resets at {resetTimeStr}</span>
            </div>

            <div className="pt-2 border-t border-gh-border-muted text-[11px] text-gh-fg-muted flex items-start space-x-1.5">
              <Info className="w-3.5 h-3.5 text-gh-accent-fg flex-shrink-0 mt-0.5" />
              <span>
                <strong>What is this count?</strong> GitHub grants each authenticated user a bucket of 5,000 API requests per hour. RepoPulse scans your repos efficiently and queries only when needed. The bucket refills every 60 minutes.
              </span>
            </div>
          </div>

          {/* 2. Auto-Refresh Interval */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gh-accent-fg" />
              <span>Silent Background Refresh Frequency</span>
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full bg-gh-canvas-default border border-gh-border-default focus:border-gh-accent-fg rounded-md px-3 py-2 text-xs text-gh-fg-default outline-none cursor-pointer"
            >
              <option value={60000}>Every 1 minute (Fastest)</option>
              <option value={120000}>Every 2 minutes (Recommended)</option>
              <option value={300000}>Every 5 minutes</option>
              <option value={600000}>Every 10 minutes</option>
              <option value={0}>Manual refresh only</option>
            </select>
            <p className="text-[11px] text-gh-fg-muted">
              Background updates execute completely silently without interface interruptions.
            </p>
          </div>

          {/* 3. GitHub Token (Optional manual override) */}
          <div className="space-y-2 pt-2 border-t border-gh-border-muted">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-gh-accent-fg" />
                <span>Personal Access Token (PAT Override)</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,security_events,actions:read&description=RepoPulse"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-gh-accent-fg hover:underline"
              >
                Generate token on GitHub ↗
              </a>
            </div>

            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-gh-canvas-default border border-gh-border-default focus:border-gh-accent-fg focus:ring-1 focus:ring-gh-accent-fg rounded-md px-3 py-2 text-xs font-mono text-gh-fg-default placeholder-gh-fg-muted outline-none"
            />
            <p className="text-[11px] text-gh-fg-muted">
              If signed in via GitHub OAuth, this token is managed automatically. You can paste a custom PAT here if you want to override permissions.
            </p>
          </div>

          {/* 4. Firebase Cloud Sync Status */}
          <div className="pt-2 border-t border-gh-border-muted">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
                    <Cloud className="w-3.5 h-3.5 text-gh-accent-fg" />
                    <span>Firebase Cloud Sync</span>
                  </label>
                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-gh-success-subtle text-gh-success-fg border border-gh-success-fg/30">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Active (repopulse-app-71baa)</span>
                  </span>
                </div>
                <p className="text-[11px] text-gh-fg-muted mt-0.5">
                  Synchronizes your monitored repositories and alert snapshots to production Firestore.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gh-border-default bg-gh-canvas-default rounded-b-xl flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs text-gh-success-fg flex items-center space-x-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settings saved!</span>
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
