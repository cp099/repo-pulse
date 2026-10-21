import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { X, Key, Cloud, Clock, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig, setDemoMode, refreshNow } = useDashboard();

  const [token, setToken] = useState(config.githubToken || '');
  const [interval, setInterval] = useState(config.autoRefreshInterval || 120000);
  const [useFirebase, setUseFirebase] = useState(config.useFirebaseSync || false);
  const [firebaseApiKey, setFirebaseApiKey] = useState(config.firebaseConfig?.apiKey || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(config.firebaseConfig?.projectId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    updateConfig({
      githubToken: token.trim(),
      autoRefreshInterval: Number(interval),
      useFirebaseSync: useFirebase,
      firebaseConfig: useFirebase
        ? {
            apiKey: firebaseApiKey.trim(),
            projectId: firebaseProjectId.trim(),
            authDomain: `${firebaseProjectId.trim()}.firebaseapp.com`,
            storageBucket: `${firebaseProjectId.trim()}.appspot.com`,
            messagingSenderId: '',
            appId: '',
          }
        : undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
      refreshNow();
    }, 600);
  };

  const handleSwitchToDemo = () => {
    setDemoMode(true);
    setToken('');
    updateConfig({ githubToken: '' });
    onClose();
  };

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
              <h3 className="text-base font-semibold text-gh-fg-default">Dashboard Settings & Credentials</h3>
              <p className="text-xs text-gh-fg-muted">Configure GitHub API access and cloud synchronization</p>
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
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. GitHub Token */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-gh-accent-fg" />
                <span>GitHub Personal Access Token (PAT)</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo,security_events,read:packages,actions:read&description=RepoPulse%20Security%20Dashboard"
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
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-gh-canvas-default border border-gh-border-default focus:border-gh-accent-fg focus:ring-1 focus:ring-gh-accent-fg rounded-md px-3 py-2 text-xs font-mono text-gh-fg-default placeholder-gh-fg-muted outline-none"
            />

            <div className="p-2.5 rounded bg-gh-canvas-default border border-gh-border-muted text-[11px] text-gh-fg-muted space-y-1">
              <p className="font-semibold text-gh-fg-default flex items-center space-x-1">
                <AlertCircle className="w-3 h-3 text-gh-warning-fg" />
                <span>Required Scopes for Security & Builds:</span>
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-gh-fg-muted">
                <li><code className="text-gh-accent-fg font-mono">security_events</code> — read CodeQL code scanning alerts</li>
                <li><code className="text-gh-accent-fg font-mono">repo</code> — read Dependabot alerts and private repo status</li>
                <li><code className="text-gh-accent-fg font-mono">actions:read</code> — read Pages build workflow runs</li>
              </ul>
            </div>
          </div>

          {/* 2. Auto-Refresh Interval */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gh-accent-fg" />
              <span>Live Auto-Refresh Interval</span>
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full bg-gh-canvas-default border border-gh-border-default focus:border-gh-accent-fg rounded-md px-3 py-2 text-xs text-gh-fg-default outline-none"
            >
              <option value={60000}>Every 1 minute (Fastest)</option>
              <option value={120000}>Every 2 minutes (Recommended)</option>
              <option value={300000}>Every 5 minutes</option>
              <option value={600000}>Every 10 minutes</option>
              <option value={0}>Manual refresh only</option>
            </select>
            <p className="text-[11px] text-gh-fg-muted">
              The dashboard queries the GitHub REST API in the background. PAT rate limits allow 5,000 requests/hour.
            </p>
          </div>

          {/* 3. Firebase Cloud Sync */}
          <div className="space-y-3 pt-2 border-t border-gh-border-muted">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-gh-fg-default flex items-center space-x-1.5">
                  <Cloud className="w-3.5 h-3.5 text-gh-accent-fg" />
                  <span>Firebase Multi-Device Cloud Sync</span>
                </label>
                <p className="text-[11px] text-gh-fg-muted mt-0.5">
                  Sync your monitored repositories and alert snapshots to Firestore so your phone and laptop stay identical.
                </p>
              </div>
              <input
                type="checkbox"
                checked={useFirebase}
                onChange={(e) => setUseFirebase(e.target.checked)}
                className="rounded border-gh-border-default text-gh-accent-emphasis focus:ring-gh-accent-fg h-4 w-4"
              />
            </div>

            {useFirebase && (
              <div className="space-y-2 p-3 rounded-lg bg-gh-canvas-default border border-gh-border-muted">
                <div>
                  <label className="text-[11px] text-gh-fg-muted block mb-1">Firebase Project ID</label>
                  <input
                    type="text"
                    value={firebaseProjectId}
                    onChange={(e) => setFirebaseProjectId(e.target.value)}
                    placeholder="my-github-health-hub"
                    className="w-full bg-gh-canvas-subtle border border-gh-border-default rounded px-2.5 py-1.5 text-xs text-gh-fg-default font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gh-fg-muted block mb-1">Firebase Web API Key</label>
                  <input
                    type="password"
                    value={firebaseApiKey}
                    onChange={(e) => setFirebaseApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-gh-canvas-subtle border border-gh-border-default rounded px-2.5 py-1.5 text-xs text-gh-fg-default font-mono outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Demo Mode Toggle */}
          <div className="pt-2 border-t border-gh-border-muted flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gh-fg-default">Demo / Preview Mode</span>
              <p className="text-[11px] text-gh-fg-muted">Reset credentials and preview sample repositories</p>
            </div>
            <button
              onClick={handleSwitchToDemo}
              className="px-2.5 py-1 text-xs font-medium rounded border border-gh-border-default hover:bg-gh-canvas-default text-gh-fg-muted hover:text-gh-fg-default transition-colors"
            >
              Load Demo Data
            </button>
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
              Cancel
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
