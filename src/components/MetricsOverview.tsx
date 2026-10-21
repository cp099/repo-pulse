import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { ShieldCheck, Flame, Code2, Globe, CheckCircle2, XCircle } from 'lucide-react';

export const MetricsOverview: React.FC = () => {
  const { metrics, setFilterStatus } = useDashboard();

  const cleanPercentage = metrics.total_tracked_repos > 0
    ? Math.round((metrics.healthy_repos_count / metrics.total_tracked_repos) * 100)
    : 100;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Tracked Repos & Health Score */}
      <div
        onClick={() => setFilterStatus('all')}
        className="p-4 rounded-lg bg-gh-canvas-subtle border border-gh-border-default hover:border-gh-border-muted transition-all cursor-pointer relative overflow-hidden group"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gh-fg-muted uppercase tracking-wider">
            Repository Health
          </span>
          <ShieldCheck className="w-4 h-4 text-gh-success-fg" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gh-fg-default">{metrics.total_tracked_repos}</span>
          <span className="text-xs text-gh-fg-muted">monitored</span>
        </div>
        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gh-fg-muted mb-1">
            <span>{cleanPercentage}% Clean</span>
            <span>{metrics.healthy_repos_count}/{metrics.total_tracked_repos} passing</span>
          </div>
          <div className="w-full bg-gh-border-muted rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                cleanPercentage === 100
                  ? 'bg-gh-success-fg'
                  : cleanPercentage > 60
                  ? 'bg-gh-warning-fg'
                  : 'bg-gh-danger-fg'
              }`}
              style={{ width: `${cleanPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Critical & High Dependabot */}
      <div
        onClick={() => setFilterStatus('critical')}
        className={`p-4 rounded-lg bg-gh-canvas-subtle border transition-all cursor-pointer ${
          metrics.total_critical_alerts > 0
            ? 'border-gh-danger-fg/40 hover:border-gh-danger-fg/70 bg-gradient-to-br from-gh-canvas-subtle to-gh-danger-subtle/20'
            : 'border-gh-border-default hover:border-gh-border-muted'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gh-fg-muted uppercase tracking-wider">
            Dependabot Alerts
          </span>
          <Flame className={`w-4 h-4 ${metrics.total_critical_alerts > 0 ? 'text-gh-danger-fg animate-pulse' : 'text-gh-fg-muted'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold ${metrics.total_critical_alerts > 0 ? 'text-gh-danger-fg' : 'text-gh-fg-default'}`}>
            {metrics.total_critical_alerts + metrics.total_high_alerts}
          </span>
          <span className="text-xs text-gh-fg-muted">Urgent CVEs</span>
        </div>
        <div className="mt-3 flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/30">
            {metrics.total_critical_alerts} Critical
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gh-severe-subtle text-gh-severe-fg border border-gh-severe-fg/30">
            {metrics.total_high_alerts} High
          </span>
          <span className="text-xs text-gh-fg-muted">
            +{metrics.total_medium_alerts} Med
          </span>
        </div>
      </div>

      {/* 3. CodeQL Code Scanning */}
      <div
        onClick={() => setFilterStatus('warning')}
        className={`p-4 rounded-lg bg-gh-canvas-subtle border transition-all cursor-pointer ${
          metrics.total_code_scanning_errors > 0
            ? 'border-gh-purple-fg/40 hover:border-gh-purple-fg/70 bg-gradient-to-br from-gh-canvas-subtle to-gh-purple-subtle/20'
            : 'border-gh-border-default hover:border-gh-border-muted'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gh-fg-muted uppercase tracking-wider">
            CodeQL Scanning
          </span>
          <Code2 className="w-4 h-4 text-gh-purple-fg" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gh-fg-default">{metrics.total_code_scanning_errors}</span>
          <span className="text-xs text-gh-fg-muted">Security Flaws</span>
        </div>
        <div className="mt-3 flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gh-purple-subtle text-gh-purple-fg border border-gh-purple-fg/30">
            {metrics.total_code_scanning_errors} Errors
          </span>
          <span className="text-xs text-gh-fg-muted">
            Static code analysis
          </span>
        </div>
      </div>

      {/* 4. GitHub Pages Builds */}
      <div
        onClick={() => setFilterStatus('pages')}
        className={`p-4 rounded-lg bg-gh-canvas-subtle border transition-all cursor-pointer ${
          metrics.failing_pages_count > 0
            ? 'border-gh-danger-fg/40 hover:border-gh-danger-fg/70'
            : 'border-gh-border-default hover:border-gh-border-muted'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gh-fg-muted uppercase tracking-wider">
            Pages & Builds
          </span>
          <Globe className="w-4 h-4 text-gh-accent-fg" />
        </div>
        <div className="flex items-baseline space-x-2">
          {metrics.failing_pages_count > 0 ? (
            <>
              <span className="text-2xl font-bold text-gh-danger-fg">{metrics.failing_pages_count}</span>
              <span className="text-xs text-gh-danger-fg font-medium">Build Failed</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-gh-success-fg">All Passing</span>
              <span className="text-xs text-gh-fg-muted">or idle</span>
            </>
          )}
        </div>
        <div className="mt-3 flex items-center space-x-2 text-xs">
          {metrics.failing_pages_count > 0 ? (
            <span className="inline-flex items-center text-gh-danger-fg space-x-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>Fix build failures</span>
            </span>
          ) : (
            <span className="inline-flex items-center text-gh-success-fg space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Deployments healthy</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
