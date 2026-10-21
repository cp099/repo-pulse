import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { RepoHealthSummary } from '../types';
import { LanguageBreakdown } from './LanguageBreakdown';
import {
  Lock,
  Globe,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Package,
  Flame,
  GitPullRequest,
  AlertCircle,
} from 'lucide-react';

export const RepoGrid: React.FC = () => {
  const {
    healthSummaries,
    searchQuery,
    filterStatus,
    sortBy,
    setSelectedSummary,
  } = useDashboard();

  // 1. Filter
  const filtered = healthSummaries.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.repo.full_name.toLowerCase().includes(q);
      const matchDesc = item.repo.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    if (filterStatus === 'critical') return item.health_status === 'critical';
    if (filterStatus === 'warning') return item.health_status === 'warning';
    if (filterStatus === 'healthy') return item.health_status === 'healthy';
    if (filterStatus === 'pages') return item.features.pages_enabled;
    if (filterStatus === 'prs') return item.open_pr_count > 0;

    return true;
  });

  // 2. Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'severity') {
      const severityScore = (s: RepoHealthSummary) =>
        s.critical_count * 1000 +
        s.high_count * 100 +
        s.code_scanning_error_count * 50 +
        s.medium_count * 10 +
        (s.features.pages_status === 'errored' ? 200 : 0);
      return severityScore(b) - severityScore(a);
    }
    if (sortBy === 'alerts') {
      const totalAlerts = (s: RepoHealthSummary) =>
        s.dependabot_alerts.length + s.code_scanning_alerts.length;
      return totalAlerts(b) - totalAlerts(a);
    }
    if (sortBy === 'prs') {
      return (b.open_pr_count || 0) - (a.open_pr_count || 0);
    }
    if (sortBy === 'pages') {
      const pageRank = (s: RepoHealthSummary) =>
        s.features.pages_status === 'errored' ? 3 : s.features.pages_status === 'built' ? 2 : 1;
      return pageRank(b) - pageRank(a);
    }
    return a.repo.name.localeCompare(b.repo.name);
  });

  if (sorted.length === 0) {
    return (
      <div className="border border-gh-border-default rounded-xl p-12 text-center bg-gh-canvas-subtle">
        <ShieldCheck className="w-10 h-10 text-gh-fg-muted mx-auto mb-2.5 opacity-60" />
        <h3 className="text-sm font-semibold text-gh-fg-default">No repositories matched your filters</h3>
        <p className="text-xs text-gh-fg-muted mt-1 max-w-sm mx-auto">
          Try adjusting your search criteria or click "Track Repos" to add more projects to your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {sorted.map((item) => (
        <RepoDashboardCard
          key={item.repo.id}
          summary={item}
          onSelect={() => setSelectedSummary(item)}
        />
      ))}
    </div>
  );
};

const RepoDashboardCard: React.FC<{
  summary: RepoHealthSummary;
  onSelect: () => void;
}> = ({ summary, onSelect }) => {
  const {
    repo,
    features,
    critical_count,
    high_count,
    medium_count,
    code_scanning_error_count,
    code_scanning_warning_count,
    health_status,
  } = summary;

  const totalVulnerabilities = critical_count + high_count + medium_count;
  const isCritical = health_status === 'critical';
  const isWarning = health_status === 'warning';

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
        isCritical
          ? 'bg-gh-canvas-subtle border-gh-danger-fg/40 hover:border-gh-danger-fg/70'
          : isWarning
          ? 'bg-gh-canvas-subtle border-gh-warning-fg/30 hover:border-gh-warning-fg/60'
          : 'bg-gh-canvas-subtle border-gh-border-default hover:border-gh-border-muted'
      }`}
      style={
        critical_count > 0
          ? { boxShadow: '0 0 0 1px rgba(248, 81, 73, 0.25), inset 0 0 8px rgba(248, 81, 73, 0.06)' }
          : {}
      }
    >
      {/* Top Header */}
      <div className="p-4 border-b border-gh-border-muted/60">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            {repo.private ? (
              <Lock className="w-3.5 h-3.5 text-gh-warning-fg flex-shrink-0" />
            ) : (
              <Globe className="w-3.5 h-3.5 text-gh-fg-muted flex-shrink-0" />
            )}
            <h3 className="font-semibold text-sm text-gh-accent-fg hover:underline truncate">
              {repo.name}
            </h3>
          </div>

          <a
            href={`${repo.html_url}/security`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-default transition-colors flex-shrink-0"
            title="Open in GitHub Security"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <p className="text-[11px] text-gh-fg-muted font-mono mt-0.5 truncate">
          {repo.owner.login} · {repo.default_branch}
        </p>

        {repo.description ? (
          <p className="text-xs text-gh-fg-muted/80 line-clamp-2 mt-2 leading-relaxed">
            {repo.description}
          </p>
        ) : (
          <p className="text-xs text-gh-fg-muted/40 italic mt-2">No description provided</p>
        )}
      </div>

      {/* Middle Body: Alerts & Features */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-center">
        {/* Active Features */}
        <div className="flex flex-wrap gap-1">
          {features.dependabot_enabled && (
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-gh-purple-subtle text-gh-purple-fg border border-gh-purple-fg/20">
              <Package className="w-2.5 h-2.5" />
              <span>Dependabot</span>
            </span>
          )}
          {features.code_scanning_enabled && (
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/20">
              <Code2 className="w-2.5 h-2.5" />
              <span>CodeQL</span>
            </span>
          )}
          {features.pages_enabled && (
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-gh-canvas-default text-gh-fg-default border border-gh-border-default">
              <Globe className="w-2.5 h-2.5" />
              <span>Pages</span>
            </span>
          )}
        </div>

        {/* Languages Breakdown */}
        <div className="pt-2 border-t border-gh-border-muted/50">
          <LanguageBreakdown
            languages={summary.languages}
            primaryLanguage={summary.primary_language || repo.language}
            mode="card"
          />
        </div>

        {/* Severity Metrics Bar */}
        <div className="pt-2 border-t border-gh-border-muted/40">
          {totalVulnerabilities > 0 || code_scanning_error_count > 0 || code_scanning_warning_count > 0 || features.pages_status === 'errored' || summary.open_pr_count > 0 ? (
            <div className="space-y-1.5">
              {/* Dependabot Pills */}
              {totalVulnerabilities > 0 && (
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="text-[11px] text-gh-fg-muted font-medium flex items-center space-x-1">
                    <Flame className="w-3 h-3 text-gh-danger-fg" />
                    <span>CVEs:</span>
                  </span>
                  {critical_count > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40">
                      {critical_count} Critical
                    </span>
                  )}
                  {high_count > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono bg-gh-severe-subtle text-gh-severe-fg border border-gh-severe-fg/30">
                      {high_count} High
                    </span>
                  )}
                  {medium_count > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium font-mono bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30">
                      {medium_count} Med
                    </span>
                  )}
                </div>
              )}

              {/* CodeQL Alerts */}
              {(code_scanning_error_count > 0 || code_scanning_warning_count > 0) && (
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] text-gh-fg-muted font-medium flex items-center space-x-1">
                    <Code2 className="w-3 h-3 text-gh-purple-fg" />
                    <span>CodeQL:</span>
                  </span>
                  {code_scanning_error_count > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/30">
                      {code_scanning_error_count} Error
                    </span>
                  )}
                  {code_scanning_warning_count > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30">
                      {code_scanning_warning_count} Warning
                    </span>
                  )}
                </div>
              )}

              {/* Pull Requests Alert */}
              {summary.open_pr_count > 0 && (
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <span className="text-[11px] text-gh-fg-muted font-medium flex items-center space-x-1">
                    <GitPullRequest className="w-3 h-3 text-gh-accent-fg" />
                    <span>PRs:</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono bg-gh-canvas-default text-gh-fg-default border border-gh-border-default">
                    {summary.open_pr_count} Open
                  </span>
                  {summary.has_pr_conflicts && (
                    <span
                      title="Merge conflicts detected in open pull requests"
                      className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/40 flex items-center space-x-0.5"
                    >
                      <AlertCircle className="w-2.5 h-2.5" />
                      <span>Conflict</span>
                    </span>
                  )}
                </div>
              )}

              {/* Pages status */}
              {features.pages_status === 'errored' && (
                <div className="flex items-center space-x-1 text-[11px] text-gh-danger-fg font-medium">
                  <XCircle className="w-3 h-3" />
                  <span>GitHub Pages build failed</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-gh-success-fg text-xs font-medium py-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Security Checks Clean</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="px-4 py-2.5 bg-gh-canvas-default/60 border-t border-gh-border-muted/60 flex items-center justify-between text-xs">
        {/* Pages Build Badge */}
        <div>
          {features.pages_enabled ? (
            features.pages_status === 'built' ? (
              <span className="inline-flex items-center space-x-1 text-[11px] text-gh-success-fg font-mono">
                <CheckCircle2 className="w-3 h-3" />
                <span>Pages Built</span>
              </span>
            ) : features.pages_status === 'building' ? (
              <span className="inline-flex items-center space-x-1 text-[11px] text-gh-warning-fg font-mono">
                <Clock className="w-3 h-3 animate-spin" />
                <span>Building</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 text-[11px] text-gh-danger-fg font-mono">
                <XCircle className="w-3 h-3" />
                <span>Build Failed</span>
              </span>
            )
          ) : (
            <span className="text-[11px] text-gh-fg-muted font-mono">Pages N/A</span>
          )}
        </div>

        <button className="text-xs font-semibold text-gh-accent-fg hover:text-blue-400 inline-flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
          <span>View Alerts</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
