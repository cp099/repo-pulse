import React from 'react';
import { X, ShieldCheck, Lock, Database, Cookie, Trash2, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-gh-canvas-subtle border border-gh-border-default rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gh-border-default flex items-center justify-between bg-gh-canvas-default rounded-t-xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-gh-accent-subtle border border-gh-accent-emphasis/30 text-gh-accent-fg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gh-fg-default">Privacy Policy</h3>
              <p className="text-xs text-gh-fg-muted">Last updated: October 2026 · Transparent &amp; Client-Direct</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Privacy Policy"
            className="p-1 rounded-md text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-gh-fg-muted leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-1.5">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gh-success-fg" />
              <span>1. Zero-Intermediary / Client-Direct Architecture</span>
            </h4>
            <p>
              RepoPulse is built from the ground up to protect your code and security posture. All queries to GitHub
              (including Dependabot alerts, CodeQL static analysis findings, and GitHub Pages deployments) execute
              directly from your web browser to <code className="text-gh-accent-fg bg-gh-canvas-default px-1 py-0.5 rounded border border-gh-border-muted font-mono">api.github.com</code> using official HTTPS endpoints.
            </p>
            <p>
              We run no proprietary backend server or proxy. Your GitHub OAuth tokens, Personal Access Tokens, and private repository vulnerability alerts are <strong>never</strong> transmitted to or intercepted by any third-party intermediary.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-1.5 pt-2 border-t border-gh-border-muted">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <Database className="w-4 h-4 text-gh-accent-fg" />
              <span>2. What Data We Process</span>
            </h4>
            <p>RepoPulse only reads repository metadata required to construct your health wallboard:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Repository Identifiers:</strong> Names, visibility (public/private), and default branch.</li>
              <li><strong>Security Alerts:</strong> Dependabot CVE identifiers, severity ratings (Critical, High, Moderate, Low), and patched package versions.</li>
              <li><strong>Code Scanning:</strong> CodeQL CWE classifications, rule descriptions, and offending file paths.</li>
              <li><strong>CI/CD &amp; Pages Status:</strong> GitHub Pages deployment status (built/errored) and workflow run conclusions.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-1.5 pt-2 border-t border-gh-border-muted">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <Database className="w-4 h-4 text-gh-purple-fg" />
              <span>3. Optional Cloud Synchronization (Firebase Firestore)</span>
            </h4>
            <p>
              If enabled, your list of monitored repositories and summarized alert statistics are synchronized with
              Google Cloud Firestore under the project <code className="text-gh-fg-default font-mono">repopulse-app-71baa</code>.
              This data is strictly locked down using production security rules:
            </p>
            <div className="p-2.5 rounded bg-gh-canvas-default border border-gh-border-muted font-mono text-[11px] text-gh-fg-default">
              match /user_dashboards/{'{userId}'} &#123; allow read, write: if request.auth != null &amp;&amp; request.auth.uid == userId; &#125;
            </div>
            <p>No other user or external service can read or write your personal dashboard state.</p>
          </section>

          {/* Section 4 */}
          <section className="space-y-1.5 pt-2 border-t border-gh-border-muted">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <Cookie className="w-4 h-4 text-gh-warning-fg" />
              <span>4. Local Storage &amp; Cookies</span>
            </h4>
            <p>
              RepoPulse does not use any advertising, tracking, or cross-site profiling cookies. We store essential configuration strictly within your browser&apos;s HTML5 LocalStorage:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><code className="text-gh-fg-default font-mono">repo_pulse_user_config</code>: Monitored repository selections, token preferences, and refresh interval.</li>
              <li><code className="text-gh-fg-default font-mono">repo_pulse_health_cache</code>: Local snapshot of recent scan results for instant offline/re-open load times.</li>
              <li><code className="text-gh-fg-default font-mono">repo_pulse_cookie_consent</code>: Your acknowledgment of our essential cookie banner.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-1.5 pt-2 border-t border-gh-border-muted">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <Trash2 className="w-4 h-4 text-gh-danger-fg" />
              <span>5. User Rights &amp; Data Deletion</span>
            </h4>
            <p>
              You maintain total control over your data at all times. Clicking <strong>Sign out</strong> or disconnecting
              instantly wipes all active tokens and cached summaries from browser memory. You can revoke RepoPulse OAuth access at any time in your{' '}
              <a
                href="https://github.com/settings/applications"
                target="_blank"
                rel="noreferrer"
                className="text-gh-accent-fg hover:underline inline-flex items-center space-x-0.5"
              >
                <span>GitHub Authorized Applications</span>
                <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gh-border-default bg-gh-canvas-default rounded-b-xl flex items-center justify-between">
          <span className="text-[11px] text-gh-fg-muted">
            RepoPulse is open source under the MIT License.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};