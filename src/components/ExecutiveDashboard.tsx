import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  ShieldCheck,
  Flame,
  Code2,
  Globe,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
  Activity,
  Lock,
  GitPullRequest,
  AlertCircle,
} from 'lucide-react';

export const ExecutiveDashboard: React.FC = () => {
  const {
    metrics,
    healthSummaries,
    setSelectedSummary,
    setActiveTab,
    lastRefreshed,
  } = useDashboard();

  const cleanPercentage = metrics.total_tracked_repos > 0
    ? Math.round((metrics.healthy_repos_count / metrics.total_tracked_repos) * 100)
    : 100;

  // Grade: A (>=90%), B (>=75%), C (>=50%), D (<50%)
  const healthGrade = cleanPercentage >= 90 ? 'A' : cleanPercentage >= 75 ? 'B' : cleanPercentage >= 50 ? 'C' : 'D';

  // Only repositories that have active security alerts, failing builds, or merge conflicts
  const attentionRepos = healthSummaries.filter(
    (s) =>
      s.critical_count > 0 ||
      s.high_count > 0 ||
      s.code_scanning_error_count > 0 ||
      s.code_scanning_warning_count > 0 ||
      s.features.pages_status === 'errored' ||
      s.has_pr_conflicts
  ).sort((a, b) => {
    const score = (s: typeof a) =>
      s.critical_count * 1000 +
      s.high_count * 100 +
      s.code_scanning_error_count * 50 +
      (s.has_pr_conflicts ? 30 : 0);
    return score(b) - score(a);
  });

  // Repositories with Pages enabled
  const pagesRepos = healthSummaries.filter((s) => s.features.pages_enabled);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-150">
      {/* 1. TV & Monitor Telemetry Status Bar */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-gh-canvas-subtle via-gh-canvas-default to-gh-canvas-subtle border border-gh-border-default shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {/* Big Circular Health Meter */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gh-border-muted"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={cleanPercentage === 100 ? 'text-gh-success-fg' : cleanPercentage > 65 ? 'text-gh-warning-fg' : 'text-gh-danger-fg'}
                strokeDasharray={`${cleanPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base sm:text-xl font-black font-mono text-gh-fg-default leading-none">
                {cleanPercentage}%
              </span>
              <span className="text-[9px] uppercase font-mono text-gh-fg-muted font-bold">Grade {healthGrade}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gh-success-fg animate-pulse" />
              <h2 className="text-base sm:text-xl font-bold text-gh-fg-default tracking-tight">
                Security Operations Wallboard
              </h2>
            </div>
            <p className="text-xs text-gh-fg-muted mt-0.5">
              Real-time portfolio telemetry · {metrics.healthy_repos_count} of {metrics.total_tracked_repos} repositories currently passing all checks.
            </p>
            <div className="flex items-center space-x-3 text-[11px] text-gh-fg-muted font-mono mt-1">
              <span>Telemetry: <strong>ONLINE</strong></span>
              <span>·</span>
              <span>Last Scan: <strong>{lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Ready'}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick CTA to switch to the full repositories ledger */}
        <button
          onClick={() => setActiveTab('repositories')}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gh-accent-emphasis hover:bg-blue-600 text-white text-xs font-semibold transition-all shadow-sm group self-stretch sm:self-auto justify-center"
        >
          <span>View All {metrics.total_tracked_repos} Repositories</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Big Executive Telemetry Cards (Large numbers legible on TV / Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Repository Health Ratio */}
        <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gh-fg-muted text-xs font-semibold uppercase tracking-wider">
            <span>Portfolio Health</span>
            <ShieldCheck className="w-4 h-4 text-gh-success-fg" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-gh-fg-default">
              {metrics.total_tracked_repos}
            </span>
            <span className="text-xs text-gh-fg-muted font-mono">monitored</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gh-fg-muted pt-2 border-t border-gh-border-muted/60 font-mono">
            <span className="text-gh-success-fg font-semibold">{metrics.healthy_repos_count} Clean</span>
            <span className="text-gh-danger-fg font-semibold">{metrics.critical_repos_count} At Risk</span>
          </div>
        </div>

        {/* Card 2: Dependabot CVE Count */}
        <div
          className={`p-5 rounded-xl bg-gh-canvas-subtle border shadow-sm space-y-2 transition-all ${
            metrics.total_critical_alerts > 0
              ? 'border-gh-danger-fg/60 bg-gradient-to-br from-gh-canvas-subtle to-gh-danger-subtle/15'
              : 'border-gh-border-default'
          }`}
          style={
            metrics.total_critical_alerts > 0
              ? { boxShadow: '0 0 0 1px rgba(248, 81, 73, 0.4), inset 0 0 12px rgba(248, 81, 73, 0.12)' }
              : {}
          }
        >
          <div className="flex items-center justify-between text-gh-fg-muted text-xs font-semibold uppercase tracking-wider">
            <span>Dependabot CVEs</span>
            <Flame className={`w-4 h-4 ${metrics.total_critical_alerts > 0 ? 'text-gh-danger-fg animate-pulse' : 'text-gh-fg-muted'}`} />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl sm:text-4xl font-extrabold font-mono ${metrics.total_critical_alerts > 0 ? 'text-gh-danger-fg' : 'text-gh-fg-default'}`}>
              {metrics.total_critical_alerts + metrics.total_high_alerts}
            </span>
            <span className="text-xs text-gh-fg-muted font-mono">Urgent CVEs</span>
          </div>
          <div className="flex items-center space-x-2 pt-2 border-t border-gh-border-muted/60 text-xs font-mono">
            <span className="text-gh-danger-fg font-bold">{metrics.total_critical_alerts} Critical</span>
            <span>·</span>
            <span className="text-gh-severe-fg font-semibold">{metrics.total_high_alerts} High</span>
            <span>·</span>
            <span className="text-gh-warning-fg">+{metrics.total_medium_alerts} Med</span>
          </div>
        </div>

        {/* Card 3: CodeQL Code Scanning */}
        <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gh-fg-muted text-xs font-semibold uppercase tracking-wider">
            <span>CodeQL Flaws</span>
            <Code2 className="w-4 h-4 text-gh-purple-fg" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-gh-fg-default">
              {metrics.total_code_scanning_errors}
            </span>
            <span className="text-xs text-gh-fg-muted font-mono">Static Flaws</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gh-fg-muted pt-2 border-t border-gh-border-muted/60 font-mono">
            <span>{metrics.total_code_scanning_errors} Errors</span>
            <span>Static analysis</span>
          </div>
        </div>

        {/* Card 4: Pull Requests Telemetry */}
        <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gh-fg-muted text-xs font-semibold uppercase tracking-wider">
            <span>Pull Requests</span>
            <GitPullRequest className="w-4 h-4 text-gh-accent-fg" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-gh-fg-default">
              {metrics.total_open_prs}
            </span>
            <span className="text-xs text-gh-fg-muted font-mono">Open PRs</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gh-fg-muted pt-2 border-t border-gh-border-muted/60 font-mono">
            {healthSummaries.filter(s => s.has_pr_conflicts).length > 0 ? (
              <span className="text-gh-warning-fg font-semibold flex items-center space-x-1">
                <AlertCircle className="w-3 h-3" />
                <span>{healthSummaries.filter(s => s.has_pr_conflicts).length} with conflicts</span>
              </span>
            ) : (
              <span className="text-gh-success-fg">All Mergeable</span>
            )}
            <span>Pending Review</span>
          </div>
        </div>

        {/* Card 5: Pages Deployments */}
        <div className="p-5 rounded-xl bg-gh-canvas-subtle border border-gh-border-default shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gh-fg-muted text-xs font-semibold uppercase tracking-wider">
            <span>Pages & Deployments</span>
            <Globe className="w-4 h-4 text-gh-accent-fg" />
          </div>
          <div className="flex items-baseline space-x-2">
            {metrics.failing_pages_count > 0 ? (
              <>
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-gh-danger-fg">
                  {metrics.failing_pages_count}
                </span>
                <span className="text-xs text-gh-danger-fg font-mono">Failing</span>
              </>
            ) : (
              <>
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-gh-success-fg">
                  100%
                </span>
                <span className="text-xs text-gh-success-fg font-mono">Healthy</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-gh-fg-muted pt-2 border-t border-gh-border-muted/60 font-mono">
            <span>{pagesRepos.length} Pages Sites Active</span>
            <span className="text-gh-success-fg">Passing</span>
          </div>
        </div>
      </div>

      {/* 3. The Radar Grids: Needs Attention vs Live Deployments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: "Active Attention Radar" (Prioritized list of vulnerable repos) */}
        <div className="lg:col-span-2 rounded-2xl bg-gh-canvas-subtle border border-gh-border-default shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gh-border-default bg-gh-canvas-default/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gh-danger-fg" />
              <h3 className="font-bold text-sm text-gh-fg-default">Security Incidents & Attention Radar</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/30">
                {attentionRepos.length} Repositories
              </span>
            </div>
            <span className="text-xs text-gh-fg-muted hidden sm:inline">Prioritized by severity</span>
          </div>

          <div className="p-4 flex-1 space-y-2.5">
            {attentionRepos.length === 0 ? (
              <div className="p-12 text-center text-xs text-gh-fg-muted">
                <CheckCircle2 className="w-10 h-10 text-gh-success-fg mx-auto mb-2.5" />
                <p className="font-semibold text-sm text-gh-fg-default">Zero Active Incidents</p>
                <p className="mt-1">All monitored repositories have passed Dependabot, CodeQL, and Pages checks.</p>
              </div>
            ) : (
              attentionRepos.map((item) => {
                const isCrit = item.critical_count > 0;
                return (
                  <div
                    key={item.repo.id}
                    onClick={() => setSelectedSummary(item)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                      isCrit
                        ? 'bg-gh-canvas-default border-gh-danger-fg/40 hover:border-gh-danger-fg'
                        : 'bg-gh-canvas-default border-gh-warning-fg/30 hover:border-gh-warning-fg'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        {item.repo.private ? <Lock className="w-3.5 h-3.5 text-gh-warning-fg" /> : <Globe className="w-3.5 h-3.5 text-gh-fg-muted" />}
                        <span className="font-bold text-sm text-gh-accent-fg group-hover:underline truncate">
                          {item.repo.name}
                        </span>
                        <span className="text-[11px] text-gh-fg-muted font-mono">{item.repo.owner.login}</span>
                      </div>
                      {item.repo.description && (
                        <p className="text-xs text-gh-fg-muted line-clamp-1 mt-0.5">
                          {item.repo.description}
                        </p>
                      )}
                    </div>

                    {/* Alert Pill Badges */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {item.critical_count > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40">
                          {item.critical_count} Critical
                        </span>
                      )}
                      {item.high_count > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold font-mono bg-gh-severe-subtle text-gh-severe-fg border border-gh-severe-fg/30">
                          {item.high_count} High
                        </span>
                      )}
                      {item.medium_count > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium font-mono bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30">
                          {item.medium_count} Med
                        </span>
                      )}
                      {item.code_scanning_warning_count > 0 && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold font-mono bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30">
                          {item.code_scanning_warning_count} CodeQL
                        </span>
                      )}
                      {item.features.pages_status === 'errored' && (
                        <span className="px-2 py-0.5 rounded text-xs font-semibold font-mono bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40">
                          Build Failed
                        </span>
                      )}
                      {item.has_pr_conflicts ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/40 flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>PR Conflict</span>
                        </span>
                      ) : item.open_pr_count > 0 ? (
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-gh-canvas-subtle text-gh-fg-muted border border-gh-border-default">
                          {item.open_pr_count} PR{item.open_pr_count > 1 ? 's' : ''}
                        </span>
                      ) : null}

                      <ChevronRight className="w-4 h-4 text-gh-fg-muted group-hover:text-gh-fg-default group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: "Live GitHub Pages Deployments" */}
        <div className="rounded-2xl bg-gh-canvas-subtle border border-gh-border-default shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gh-border-default bg-gh-canvas-default/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gh-accent-fg" />
              <h3 className="font-bold text-sm text-gh-fg-default">Live Pages Deployments</h3>
            </div>
            <span className="text-xs font-mono text-gh-fg-muted">{pagesRepos.length} Active</span>
          </div>

          <div className="p-4 flex-1 space-y-2.5">
            {pagesRepos.length === 0 ? (
              <p className="text-xs text-gh-fg-muted p-6 text-center">No GitHub Pages sites detected.</p>
            ) : (
              pagesRepos.map((item) => (
                <div
                  key={item.repo.id}
                  className="p-3 rounded-xl bg-gh-canvas-default border border-gh-border-muted flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-gh-fg-default block truncate">
                      {item.repo.name}
                    </span>
                    {item.features.pages_url ? (
                      <a
                        href={item.features.pages_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-gh-accent-fg hover:underline truncate block font-mono"
                      >
                        {item.features.pages_url.replace('https://', '')}
                      </a>
                    ) : (
                      <span className="text-[11px] text-gh-fg-muted font-mono">Pages enabled</span>
                    )}
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold flex items-center space-x-1 flex-shrink-0 ${
                      item.features.pages_status === 'built'
                        ? 'bg-gh-success-subtle text-gh-success-fg border border-gh-success-fg/30'
                        : 'bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40'
                    }`}
                  >
                    {item.features.pages_status === 'built' ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                    <span>{item.features.pages_status === 'built' ? 'Built' : 'Failed'}</span>
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
