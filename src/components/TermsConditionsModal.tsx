import React from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, ShieldCheck, Scale, ExternalLink } from 'lucide-react';

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-gh-canvas-subtle border border-gh-border-default rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gh-border-default flex items-center justify-between bg-gh-canvas-default rounded-t-xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-gh-accent-subtle border border-gh-accent-emphasis/30 text-gh-accent-fg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gh-fg-default">Terms &amp; Conditions</h3>
              <p className="text-xs text-gh-fg-muted">Effective Date: October 2026 · MIT Open Source Standard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Terms & Conditions"
            className="p-1 rounded-md text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-gh-fg-muted leading-relaxed">
          {/* Section 1: Acceptance */}
          <section className="space-y-1.5">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-gh-success-fg" />
              <span>1. Acceptance of Terms</span>
            </h4>
            <p>
              By accessing or using RepoPulse (the &ldquo;Service&rdquo;), you agree to be bound by these Terms and Conditions.
              If you do not agree to these terms, please do not use the application.
            </p>
          </section>

          {/* Section 2: Permitted Use & GitHub Compliance */}
          <section className="space-y-1.5 pt-2 border-t border-gh-border-muted">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-gh-accent-fg" />
              <span>2. Permitted Use &amp; GitHub Compliance</span>
            </h4>
            <p>
              RepoPulse is intended for developers, DevOps teams, and engineering leaders to monitor the security
              health, Dependabot vulnerabilities, and static analysis alerts of GitHub repositories they have authorization to access.
            </p>
            <p>
              You agree to comply with all applicable laws, as well as the{' '}
              <a
                href="https://docs.github.com/en/site-policy/github-terms/github-terms-of-service"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gh-accent-fg hover:underline inline-flex items-center space-x-0.5"
              >
                <span>GitHub Terms of Service</span>
                <ExternalLink className="w-3 h-3 ml-0.5 inline" />
              </a>{' '}
              and GitHub Acceptable Use Policies. You must not attempt to use RepoPulse to access repositories or alerts for which you do not possess valid credentials or permissions.
            </p>
          </section>

          {/* Section 3: API Rate Limits */}
          <section className="space-y-1.5 pt-2 border-t border-gh-border-muted">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <Scale className="w-4 h-4 text-gh-purple-fg" />
              <span>3. GitHub API Quota &amp; Rate Limits</span>
            </h4>
            <p>
              All queries run directly against the GitHub REST API using your credentials. GitHub enforces an hourly
              rate limit (typically 5,000 requests per hour for authenticated accounts). RepoPulse implements caching and
              silent background synchronization to conserve quota, but you are responsible for maintaining your token permissions and avoiding abusive polling.
            </p>
          </section>

          {/* Section 4: Disclaimers & Limitation of Liability */}
          <section className="space-y-1.5 pt-2 border-t border-gh-border-muted">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-gh-warning-fg" />
              <span>4. Disclaimer of Warranty &amp; Limitation of Liability</span>
            </h4>
            <p className="uppercase tracking-wide font-mono text-[10px] text-gh-fg-default">
              Provided &ldquo;AS IS&rdquo; Without Warranty of Any Kind
            </p>
            <p>
              The Service is provided under the open-source MIT License on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis.
              While RepoPulse surfaces security alerts provided by GitHub Dependabot and CodeQL, the authors make no representations
              or warranties that all potential vulnerabilities will be detected, flagged, or prevented.
            </p>
            <p>
              In no event shall the authors or copyright holders be liable for any claim, damages, security breaches,
              or other liability arising from, out of, or in connection with the software or the use thereof.
            </p>
          </section>

          {/* Section 5: Modifications & Termination */}
          <section className="space-y-1.5 pt-2 border-t border-gh-border-muted">
            <h4 className="text-sm font-semibold text-gh-fg-default flex items-center space-x-2">
              <Scale className="w-4 h-4 text-gh-accent-fg" />
              <span>5. Termination &amp; Discontinuation</span>
            </h4>
            <p>
              You may terminate your use of the Service at any time simply by closing the application or signing out.
              To permanently revoke access, you can revoke RepoPulse&apos;s OAuth authorization in your GitHub settings.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gh-border-default bg-gh-canvas-default rounded-b-xl flex items-center justify-between">
          <span className="text-[11px] text-gh-fg-muted">
            Questions? Contact via our <a href="https://github.com/cp099/repo-pulse/issues" target="_blank" rel="noopener noreferrer" className="text-gh-accent-fg hover:underline">GitHub Issues</a>.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors"
          >
            Agree &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};