import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
}

const STORAGE_KEY_CONSENT = 'repo_pulse_cookie_consent';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY_CONSENT);
      if (!consent) {
        // Small delay so it animates in smoothly after load
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleConsent = (level: 'all' | 'essential') => {
    try {
      localStorage.setItem(STORAGE_KEY_CONSENT, JSON.stringify({ level, timestamp: new Date().toISOString() }));
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie and Storage Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 p-4 rounded-xl bg-gh-canvas-subtle border border-gh-border-default shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-gh-canvas-default border border-gh-border-muted text-gh-warning-fg flex-shrink-0 mt-0.5">
          <Cookie className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <h4 className="text-xs font-semibold text-gh-fg-default">Essential Storage &amp; Privacy</h4>
            <span className="inline-flex items-center text-[10px] text-gh-success-fg font-mono bg-gh-success-subtle px-1 rounded border border-gh-success-fg/30">
              <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> No Trackers
            </span>
          </div>
          <p className="text-[11px] text-gh-fg-muted leading-relaxed">
            RepoPulse uses browser LocalStorage strictly for session authentication, rate limit tracking, and caching GitHub security summaries. No third-party profiling or advertising cookies are utilized.{' '}
            <button
              onClick={onOpenPrivacy}
              className="text-gh-accent-fg hover:underline font-medium inline"
            >
              Privacy Policy
            </button>
          </p>

          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => handleConsent('all')}
              className="flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-md bg-[#238636] hover:bg-[#2ea043] text-white transition-colors flex items-center justify-center space-x-1 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept Essential</span>
            </button>
            <button
              onClick={() => handleConsent('essential')}
              className="py-1.5 px-3 text-xs font-medium rounded-md bg-gh-canvas-default hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors"
            >
              Strict Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};