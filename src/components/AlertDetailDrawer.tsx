import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  X,
  ExternalLink,
  ShieldAlert,
  Code2,
  Globe,
  Package,
  FileCode,
  CheckCircle2,
  XCircle,
  Clock,
  GitCommit,
} from 'lucide-react';

export const AlertDetailDrawer: React.FC = () => {
  const { selectedSummary, setSelectedSummary } = useDashboard();
  const [activeTab, setActiveTab] = useState<'dependabot' | 'codeql' | 'pages'>('dependabot');

  if (!selectedSummary) return null;

  const {
    repo,
    features,
    dependabot_alerts,
    code_scanning_alerts,
  } = selectedSummary;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-2xl bg-gh-canvas-subtle border-l border-gh-border-default h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gh-border-default flex items-center justify-between bg-gh-canvas-default">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-gh-canvas-subtle border border-gh-border-default">
              <ShieldAlert className="w-5 h-5 text-gh-accent-fg" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-gh-fg-default">{repo.name}</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-gh-border-muted text-gh-fg-muted border border-gh-border-default">
                  {repo.private ? 'Private' : 'Public'}
                </span>
              </div>
              <p className="text-xs text-gh-fg-muted">{repo.full_name} · {repo.default_branch}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={`${repo.html_url}/security`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors"
            >
              <span>GitHub Security</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setSelectedSummary(null)}
              className="p-1.5 rounded-md text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gh-border-default bg-gh-canvas-default/50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('dependabot')}
            className={`flex items-center space-x-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'dependabot'
                ? 'border-gh-accent-fg text-gh-fg-default'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Dependabot Alerts</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] text-gh-fg-muted">
              {dependabot_alerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('codeql')}
            className={`flex items-center space-x-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'codeql'
                ? 'border-gh-accent-fg text-gh-fg-default'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>CodeQL Scanning</span>
            <span className="px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] text-gh-fg-muted">
              {code_scanning_alerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center space-x-2 pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'pages'
                ? 'border-gh-accent-fg text-gh-fg-default'
                : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Pages & Builds</span>
            {features.pages_enabled && (
              <span className={`w-2 h-2 rounded-full ${features.pages_status === 'built' ? 'bg-gh-success-fg' : 'bg-gh-danger-fg'}`} />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* 1. Dependabot Tab */}
          {activeTab === 'dependabot' && (
            <div>
              {dependabot_alerts.length === 0 ? (
                <div className="p-8 text-center border border-gh-border-muted rounded-md bg-gh-canvas-default">
                  <CheckCircle2 className="w-8 h-8 text-gh-success-fg mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gh-fg-default">No Open Dependabot Alerts</p>
                  <p className="text-xs text-gh-fg-muted mt-1">All known package dependencies are up-to-date and secure.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dependabot_alerts.map((alert) => (
                    <div
                      key={alert.number}
                      className="p-4 rounded-lg bg-gh-canvas-default border border-gh-border-default hover:border-gh-border-muted transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          {/* Severity Pill */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              alert.security_advisory?.severity === 'critical'
                                ? 'bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40'
                                : alert.security_advisory?.severity === 'high'
                                ? 'bg-gh-severe-subtle text-gh-severe-fg border border-gh-severe-fg/30'
                                : 'bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30'
                            }`}
                          >
                            {alert.security_advisory?.severity || 'Alert'}
                          </span>

                          <span className="font-mono text-xs font-semibold text-gh-fg-default">
                            {alert.dependency?.package?.name}
                          </span>

                          {alert.security_advisory?.ghsa_id && (
                            <span className="text-[10px] font-mono text-gh-fg-muted px-1.5 py-0.2 rounded bg-gh-canvas-subtle border border-gh-border-muted">
                              {alert.security_advisory.ghsa_id}
                            </span>
                          )}

                          {alert.security_advisory?.cve_id && (
                            <span className="text-[10px] font-mono text-gh-accent-fg px-1.5 py-0.2 rounded bg-gh-accent-subtle/40 border border-gh-accent-emphasis/20">
                              {alert.security_advisory.cve_id}
                            </span>
                          )}
                        </div>

                        {/* Direct Deep Link to GitHub Dependabot Alert */}
                        <a
                          href={alert.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors"
                          title="Open this specific vulnerability on GitHub to fix or dismiss"
                        >
                          <span>Fix on GitHub</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <h4 className="text-xs font-medium text-gh-fg-default mb-1.5">
                        {alert.security_advisory?.summary}
                      </h4>

                      {alert.security_advisory?.description && (
                        <p className="text-[11px] text-gh-fg-muted line-clamp-2 mb-2.5">
                          {alert.security_advisory.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gh-fg-muted pt-2 border-t border-gh-border-muted/60">
                        <span>
                          Manifest: <code className="text-gh-fg-default font-mono text-[10px]">{alert.dependency?.manifest_path}</code>
                        </span>
                        {alert.security_vulnerability?.vulnerable_version_range && (
                          <span>
                            Vulnerable: <strong className="text-gh-danger-fg font-mono text-[10px]">{alert.security_vulnerability.vulnerable_version_range}</strong>
                          </span>
                        )}
                        {alert.security_vulnerability?.first_patched_version?.identifier && (
                          <span className="text-gh-success-fg font-mono text-[10px]">
                            Patched in: <strong>{alert.security_vulnerability.first_patched_version.identifier}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. CodeQL Tab */}
          {activeTab === 'codeql' && (
            <div>
              {code_scanning_alerts.length === 0 ? (
                <div className="p-8 text-center border border-gh-border-muted rounded-md bg-gh-canvas-default">
                  <CheckCircle2 className="w-8 h-8 text-gh-success-fg mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gh-fg-default">No Open Code Scanning Alerts</p>
                  <p className="text-xs text-gh-fg-muted mt-1">CodeQL analysis found zero open security vulnerabilities.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {code_scanning_alerts.map((alert) => (
                    <div
                      key={alert.number}
                      className="p-4 rounded-lg bg-gh-canvas-default border border-gh-border-default hover:border-gh-border-muted transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              alert.rule?.severity === 'error'
                                ? 'bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40'
                                : 'bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30'
                            }`}
                          >
                            {alert.rule?.severity || 'CodeQL'}
                          </span>
                          <span className="font-mono text-xs font-semibold text-gh-fg-default">
                            {alert.rule?.id}
                          </span>
                          <span className="text-[10px] text-gh-fg-muted px-1.5 py-0.2 rounded bg-gh-canvas-subtle border border-gh-border-muted">
                            {alert.tool?.name || 'CodeQL'}
                          </span>
                        </div>

                        {/* Direct Deep Link to GitHub CodeQL Alert */}
                        <a
                          href={alert.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-shrink-0 inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors"
                          title="Open this CodeQL finding in GitHub repository"
                        >
                          <span>View in CodeQL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <h4 className="text-xs font-medium text-gh-fg-default mb-1">
                        {alert.rule?.name}
                      </h4>
                      <p className="text-[11px] text-gh-fg-muted mb-2">
                        {alert.rule?.description}
                      </p>

                      {/* File location */}
                      {alert.most_recent_instance?.location && (
                        <div className="flex items-center space-x-1.5 text-xs text-gh-fg-muted font-mono bg-gh-canvas-subtle p-2 rounded border border-gh-border-muted">
                          <FileCode className="w-3.5 h-3.5 text-gh-accent-fg flex-shrink-0" />
                          <span className="text-gh-fg-default truncate">
                            {alert.most_recent_instance.location.path}
                          </span>
                          <span className="text-gh-accent-fg">
                            #L{alert.most_recent_instance.location.start_line}-{alert.most_recent_instance.location.end_line}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Pages & Builds Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-4">
              {!features.pages_enabled ? (
                <div className="p-8 text-center border border-gh-border-muted rounded-md bg-gh-canvas-default">
                  <Globe className="w-8 h-8 text-gh-fg-muted mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gh-fg-default">GitHub Pages is Not Configured</p>
                  <p className="text-xs text-gh-fg-muted mt-1">This repository does not have GitHub Pages enabled in repository settings.</p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-gh-canvas-default border border-gh-border-default space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gh-fg-default">GitHub Pages Deployment</h4>
                      {features.pages_url && (
                        <a
                          href={features.pages_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-gh-accent-fg hover:underline inline-flex items-center space-x-1 mt-0.5"
                        >
                          <span>{features.pages_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold ${
                        features.pages_status === 'built'
                          ? 'bg-gh-success-subtle text-gh-success-fg border border-gh-success-fg/30'
                          : features.pages_status === 'errored'
                          ? 'bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40'
                          : 'bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30'
                      }`}
                    >
                      {features.pages_status === 'built' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {features.pages_status === 'errored' && <XCircle className="w-3.5 h-3.5" />}
                      {features.pages_status === 'building' && <Clock className="w-3.5 h-3.5 animate-spin" />}
                      <span className="capitalize">{features.pages_status}</span>
                    </span>
                  </div>

                  {/* Latest workflow run */}
                  {features.last_pages_run && (
                    <div className="p-3 rounded bg-gh-canvas-subtle border border-gh-border-muted space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-gh-fg-default">
                          Latest Workflow Run: {features.last_pages_run.name}
                        </span>
                        <a
                          href={features.last_pages_run.html_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-gh-accent-fg hover:underline"
                        >
                          <span>View Action Log</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gh-fg-muted font-mono">
                        <div className="flex items-center space-x-1">
                          <GitCommit className="w-3 h-3" />
                          <span>Run ID: #{features.last_pages_run.id}</span>
                        </div>
                        <span>Status: {features.last_pages_run.status}</span>
                        <span>Conclusion: {features.last_pages_run.conclusion || 'Running'}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
