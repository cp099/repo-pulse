import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { RepoHealthSummary } from '../types';
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
} from 'lucide-react';

export const RepoTable: React.FC = () => {
  const {
    healthSummaries,
    searchQuery,
    filterStatus,
    setSelectedSummary,
  } = useDashboard();

  // Filter logic
  const filtered = healthSummaries.filter((item) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.repo.full_name.toLowerCase().includes(q);
      const matchDesc = item.repo.description?.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    // Filter status
    if (filterStatus === 'critical') {
      return item.health_status === 'critical';
    }
    if (filterStatus === 'warning') {
      return item.health_status === 'warning';
    }
    if (filterStatus === 'healthy') {
      return item.health_status === 'healthy';
    }
    if (filterStatus === 'pages') {
      return item.features.pages_enabled;
    }

    return true;
  });

  if (filtered.length === 0) {
    return (
      <div className="border border-gh-border-default rounded-lg p-12 text-center bg-gh-canvas-subtle">
        <ShieldCheck className="w-12 h-12 text-gh-fg-muted mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gh-fg-default">No repositories matched your criteria</h3>
        <p className="text-xs text-gh-fg-muted mt-1 max-w-sm mx-auto">
          Try adjusting your search filters or click "Track Repos" in the top bar to add more repositories to your dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gh-border-default rounded-lg overflow-hidden bg-gh-canvas-subtle">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-gh-border-default bg-gh-canvas-default/60 text-gh-fg-muted uppercase text-[11px] font-semibold tracking-wider">
              <th className="py-3 px-4">Repository</th>
              <th className="py-3 px-4">Features</th>
              <th className="py-3 px-4">Dependabot Alerts</th>
              <th className="py-3 px-4">CodeQL Alerts</th>
              <th className="py-3 px-4">Pages Build</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gh-border-muted">
            {filtered.map((item) => (
              <RepoTableRow
                key={item.repo.id}
                summary={item}
                onSelect={() => setSelectedSummary(item)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RepoTableRow: React.FC<{
  summary: RepoHealthSummary;
  onSelect: () => void;
}> = ({ summary, onSelect }) => {
  const { repo, features, critical_count, high_count, medium_count, code_scanning_error_count, code_scanning_warning_count } = summary;

  const totalVulnerabilities = critical_count + high_count + medium_count;

  return (
    <tr className="hover:bg-gh-canvas-default/40 transition-colors group">
      {/* 1. Repository name and details */}
      <td className="py-3.5 px-4 align-top max-w-[280px]">
        <div className="flex items-start space-x-2">
          {repo.private ? (
            <span title="Private Repository">
              <Lock className="w-3.5 h-3.5 text-gh-warning-fg mt-0.5 flex-shrink-0" />
            </span>
          ) : (
            <span title="Public Repository">
              <Globe className="w-3.5 h-3.5 text-gh-fg-muted mt-0.5 flex-shrink-0" />
            </span>
          )}
          <div className="min-w-0">
            <button
              onClick={onSelect}
              className="font-semibold text-gh-accent-fg hover:underline text-left block truncate max-w-[220px]"
            >
              {repo.name}
            </button>
            <span className="text-[11px] text-gh-fg-muted block truncate">
              {repo.owner.login} · {repo.default_branch}
            </span>
            {repo.description && (
              <p className="text-[11px] text-gh-fg-muted/80 line-clamp-1 mt-0.5">
                {repo.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* 2. Feature flags */}
      <td className="py-3.5 px-4 align-top">
        <div className="flex flex-wrap gap-1.5">
          {features.dependabot_enabled && (
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gh-purple-subtle text-gh-purple-fg border border-gh-purple-fg/20">
              <Package className="w-3 h-3" />
              <span>Dependabot</span>
            </span>
          )}
          {features.code_scanning_enabled && (
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/20">
              <Code2 className="w-3 h-3" />
              <span>CodeQL</span>
            </span>
          )}
          {features.pages_enabled && (
            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gh-canvas-default text-gh-fg-default border border-gh-border-default">
              <Globe className="w-3 h-3" />
              <span>Pages</span>
            </span>
          )}
          {!features.dependabot_enabled && !features.code_scanning_enabled && !features.pages_enabled && (
            <span className="text-gh-fg-muted text-[11px]">None active</span>
          )}
        </div>
      </td>

      {/* 3. Dependabot Alerts */}
      <td className="py-3.5 px-4 align-top">
        {!features.dependabot_enabled ? (
          <span className="text-gh-fg-muted/60 text-[11px]">Disabled</span>
        ) : totalVulnerabilities === 0 ? (
          <span className="inline-flex items-center space-x-1 text-gh-success-fg text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>0 alerts</span>
          </span>
        ) : (
          <div className="flex items-center space-x-1.5">
            {critical_count > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40">
                {critical_count} Critical
              </span>
            )}
            {high_count > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-gh-severe-subtle text-gh-severe-fg border border-gh-severe-fg/30">
                {high_count} High
              </span>
            )}
            {medium_count > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30">
                {medium_count} Med
              </span>
            )}
          </div>
        )}
      </td>

      {/* 4. CodeQL Scanning Alerts */}
      <td className="py-3.5 px-4 align-top">
        {!features.code_scanning_enabled ? (
          <span className="text-gh-fg-muted/60 text-[11px]">Disabled</span>
        ) : code_scanning_error_count === 0 && code_scanning_warning_count === 0 ? (
          <span className="inline-flex items-center space-x-1 text-gh-success-fg text-[11px] font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>0 issues</span>
          </span>
        ) : (
          <div className="flex items-center space-x-1.5">
            {code_scanning_error_count > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/30">
                {code_scanning_error_count} Error
              </span>
            )}
            {code_scanning_warning_count > 0 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30">
                {code_scanning_warning_count} Warning
              </span>
            )}
          </div>
        )}
      </td>

      {/* 5. GitHub Pages Build Status */}
      <td className="py-3.5 px-4 align-top">
        {!features.pages_enabled ? (
          <span className="text-gh-fg-muted/60 text-[11px]">N/A</span>
        ) : features.pages_status === 'built' ? (
          <div className="flex items-center space-x-1.5">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gh-success-subtle text-gh-success-fg border border-gh-success-fg/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>Built</span>
            </span>
            {features.pages_url && (
              <a
                href={features.pages_url}
                target="_blank"
                rel="noreferrer"
                className="text-gh-accent-fg hover:text-blue-400"
                title={`Visit ${features.pages_url}`}
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : features.pages_status === 'errored' ? (
          <div className="flex items-center space-x-1.5">
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40">
              <XCircle className="w-3 h-3" />
              <span>Failed</span>
            </span>
            {features.last_pages_run && (
              <a
                href={features.last_pages_run.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-gh-danger-fg hover:underline font-mono text-[10px]"
                title="View build workflow run log on GitHub"
              >
                View Log
              </a>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center space-x-1 text-gh-warning-fg text-[11px]">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Building...</span>
          </span>
        )}
      </td>

      {/* 6. Action buttons & Deep Link */}
      <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
        <div className="inline-flex items-center space-x-2">
          <button
            onClick={onSelect}
            className="px-2.5 py-1 text-xs font-medium rounded bg-gh-canvas-default hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors inline-flex items-center space-x-1"
          >
            <span>Alerts</span>
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Direct link to repo security on GitHub */}
          <a
            href={`${repo.html_url}/security`}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-default border border-transparent hover:border-gh-border-default transition-colors"
            title="Open Security Center on GitHub"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </td>
    </tr>
  );
};
