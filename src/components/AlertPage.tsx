import React, { useState } from 'react';
import { RepoHealthSummary } from '../types';
import { LanguageBreakdown } from './LanguageBreakdown';
import {
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  Code2,
  Globe,
  Package,
  FileCode,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Flame,
  AlertTriangle,
  GitCommit,
  Lock,
  Copy,
  Check,
} from 'lucide-react';

interface AlertPageProps {
  summary: RepoHealthSummary;
  onBack: () => void;
}

export const AlertPage: React.FC<AlertPageProps> = ({ summary, onBack }) => {
  const { repo, features, dependabot_alerts, code_scanning_alerts } = summary;

  const [activeTab, setActiveTab] = useState<'dependabot' | 'codeql' | 'pages'>('dependabot');
  const [expandedDependabot, setExpandedDependabot] = useState<Set<number>>(new Set([dependabot_alerts[0]?.number]));
  const [expandedCodeQL, setExpandedCodeQL] = useState<Set<number>>(new Set([code_scanning_alerts[0]?.number]));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleDependabot = (alertNumber: number) => {
    setExpandedDependabot((prev) => {
      const next = new Set(prev);
      if (next.has(alertNumber)) next.delete(alertNumber);
      else next.add(alertNumber);
      return next;
    });
  };

  const toggleCodeQL = (alertNumber: number) => {
    setExpandedCodeQL((prev) => {
      const next = new Set(prev);
      if (next.has(alertNumber)) next.delete(alertNumber);
      else next.add(alertNumber);
      return next;
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Back Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gh-accent-fg hover:underline group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        <a
          href={`${repo.html_url}/security`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors shadow-sm"
        >
          <span>Open GitHub Security Center</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Repository Header Plinth */}
      <div className="p-6 rounded-xl bg-gh-canvas-subtle border border-gh-border-default shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-lg bg-gh-canvas-default border border-gh-border-default text-gh-accent-fg shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-gh-fg-default tracking-tight">
                  {repo.name}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-gh-canvas-default text-gh-fg-muted border border-gh-border-default flex items-center space-x-1">
                  {repo.private ? <Lock className="w-3 h-3 text-gh-warning-fg" /> : <Globe className="w-3 h-3" />}
                  <span>{repo.private ? 'Private' : 'Public'}</span>
                </span>
              </div>
              <p className="text-xs text-gh-fg-muted font-mono mt-0.5">
                {repo.full_name} · default branch: <strong className="text-gh-fg-default">{repo.default_branch}</strong>
              </p>
            </div>
          </div>

          {/* Quick status pill */}
          <div className="flex items-center space-x-2">
            {summary.critical_count > 0 ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40 flex items-center space-x-1.5">
                <Flame className="w-3.5 h-3.5" />
                <span>Action Required: {summary.critical_count} Critical CVE</span>
              </span>
            ) : summary.high_count > 0 ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold font-mono bg-gh-severe-subtle text-gh-severe-fg border border-gh-severe-fg/30 flex items-center space-x-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{summary.high_count} High Severity CVEs</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium font-mono bg-gh-success-subtle text-gh-success-fg border border-gh-success-fg/30 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Security Checks Clean</span>
              </span>
            )}
          </div>
        </div>

        {repo.description && (
          <p className="text-xs sm:text-sm text-gh-fg-muted max-w-3xl leading-relaxed pt-2 border-t border-gh-border-muted/60">
            {repo.description}
          </p>
        )}

        {/* Languages Breakdown */}
        <div className="pt-3 border-t border-gh-border-muted/60">
          <LanguageBreakdown
            languages={summary.languages}
            primaryLanguage={summary.primary_language || repo.language}
            mode="card"
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gh-border-default space-x-2">
        <button
          onClick={() => setActiveTab('dependabot')}
          className={`flex items-center space-x-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'dependabot'
              ? 'border-gh-accent-fg text-gh-fg-default'
              : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
          }`}
        >
          <Package className="w-4 h-4 text-gh-purple-fg" />
          <span>Dependabot Alerts</span>
          <span className="px-2 py-0.5 rounded-full bg-gh-canvas-subtle border border-gh-border-default text-xs font-mono">
            {dependabot_alerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('codeql')}
          className={`flex items-center space-x-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'codeql'
              ? 'border-gh-accent-fg text-gh-fg-default'
              : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
          }`}
        >
          <Code2 className="w-4 h-4 text-gh-accent-fg" />
          <span>CodeQL Scanning</span>
          <span className="px-2 py-0.5 rounded-full bg-gh-canvas-subtle border border-gh-border-default text-xs font-mono">
            {code_scanning_alerts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('pages')}
          className={`flex items-center space-x-2 pb-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'pages'
              ? 'border-gh-accent-fg text-gh-fg-default'
              : 'border-transparent text-gh-fg-muted hover:text-gh-fg-default'
          }`}
        >
          <Globe className="w-4 h-4 text-gh-success-fg" />
          <span>Pages & Builds</span>
          {features.pages_enabled && (
            <span
              className={`w-2 h-2 rounded-full ${
                features.pages_status === 'built' ? 'bg-gh-success-fg' : 'bg-gh-danger-fg'
              }`}
            />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {/* 1. Dependabot Tab */}
        {activeTab === 'dependabot' && (
          <div className="space-y-3">
            {dependabot_alerts.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-gh-border-default bg-gh-canvas-subtle">
                <CheckCircle2 className="w-10 h-10 text-gh-success-fg mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gh-fg-default">No Open Dependabot Vulnerabilities</h3>
                <p className="text-xs text-gh-fg-muted mt-1 max-w-md mx-auto">
                  All dependencies in this repository are up-to-date and have no known security advisories.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-xs text-gh-fg-muted flex items-center justify-between pb-1">
                  <span>Showing {dependabot_alerts.length} open vulnerabilities. Click any issue to expand details:</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => setExpandedDependabot(new Set(dependabot_alerts.map((a) => a.number)))}
                      className="text-gh-accent-fg hover:underline"
                    >
                      Expand All
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => setExpandedDependabot(new Set())}
                      className="text-gh-accent-fg hover:underline"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {dependabot_alerts.map((alert) => {
                  const isExpanded = expandedDependabot.has(alert.number);
                  const severity = alert.security_advisory?.severity || 'low';

                  return (
                    <div
                      key={alert.number}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isExpanded
                          ? 'bg-gh-canvas-subtle border-gh-border-default shadow-sm'
                          : 'bg-gh-canvas-subtle/70 border-gh-border-muted hover:border-gh-border-default'
                      }`}
                    >
                      {/* Accordion Row Header */}
                      <div
                        onClick={() => toggleDependabot(alert.number)}
                        className="p-4 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none group"
                      >
                        <div className="flex items-start sm:items-center space-x-3 min-w-0">
                          <button className="text-gh-fg-muted group-hover:text-gh-fg-default mt-0.5 sm:mt-0 flex-shrink-0 transition-transform">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>

                          {/* Severity Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono flex-shrink-0 ${
                              severity === 'critical'
                                ? 'bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40'
                                : severity === 'high'
                                ? 'bg-gh-severe-subtle text-gh-severe-fg border border-gh-severe-fg/30'
                                : 'bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30'
                            }`}
                          >
                            {severity}
                          </span>

                          {/* Package name & summary */}
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="font-mono text-xs font-bold text-gh-fg-default">
                                {alert.dependency?.package?.name}
                              </span>
                              <span className="text-xs text-gh-fg-default font-medium line-clamp-1">
                                {alert.security_advisory?.summary}
                              </span>
                            </div>

                            {/* Manifest path annotation */}
                            <span className="text-[11px] text-gh-fg-muted font-mono block mt-0.5">
                              {alert.dependency?.manifest_path}
                            </span>
                          </div>
                        </div>

                        {/* Right side CVE tag & direct fix button */}
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {alert.security_advisory?.cve_id && (
                            <span className="hidden md:inline text-[11px] font-mono text-gh-accent-fg px-2 py-0.5 rounded bg-gh-accent-subtle/30 border border-gh-accent-emphasis/20">
                              {alert.security_advisory.cve_id}
                            </span>
                          )}

                          <a
                            href={alert.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded bg-[#238636] hover:bg-[#2ea043] text-white transition-colors shadow-sm"
                            title="Open this vulnerability directly on GitHub to fix or dismiss"
                          >
                            <span>Fix on GitHub</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      {/* Accordion Expanded Detail Body */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 border-t border-gh-border-muted/60 space-y-4 text-xs bg-gh-canvas-default/50 animate-in fade-in duration-150">
                          {/* Advisory Description */}
                          {alert.security_advisory?.description && (
                            <div>
                              <h4 className="text-[11px] font-semibold text-gh-fg-muted uppercase tracking-wider mb-1">
                                Advisory Description
                              </h4>
                              <p className="text-xs text-gh-fg-default leading-relaxed whitespace-pre-line bg-gh-canvas-subtle p-3.5 rounded-lg border border-gh-border-muted">
                                {alert.security_advisory.description}
                              </p>
                            </div>
                          )}

                          {/* Version Remediation Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg bg-gh-canvas-subtle border border-gh-border-muted">
                              <span className="text-[10px] text-gh-fg-muted uppercase font-semibold block mb-1">
                                Vulnerable Versions
                              </span>
                              <span className="font-mono text-xs font-bold text-gh-danger-fg">
                                {alert.security_vulnerability?.vulnerable_version_range || 'Unknown'}
                              </span>
                            </div>

                            <div className="p-3 rounded-lg bg-gh-canvas-subtle border border-gh-border-muted">
                              <span className="text-[10px] text-gh-fg-muted uppercase font-semibold block mb-1">
                                Patched In
                              </span>
                              <span className="font-mono text-xs font-bold text-gh-success-fg">
                                {alert.security_vulnerability?.first_patched_version?.identifier || 'No fix available yet'}
                              </span>
                            </div>

                            <div className="p-3 rounded-lg bg-gh-canvas-subtle border border-gh-border-muted">
                              <span className="text-[10px] text-gh-fg-muted uppercase font-semibold block mb-1">
                                CVSS Score
                              </span>
                              <span className="font-mono text-xs font-bold text-gh-fg-default">
                                {alert.security_advisory?.cvss?.score
                                  ? `${alert.security_advisory.cvss.score} / 10.0`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Identifiers & Copy Buttons */}
                          <div className="flex items-center space-x-3 text-xs pt-2">
                            {alert.security_advisory?.ghsa_id && (
                              <button
                                onClick={() => handleCopy(alert.security_advisory.ghsa_id)}
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-gh-canvas-subtle border border-gh-border-default hover:text-gh-fg-default text-gh-fg-muted font-mono text-[11px]"
                              >
                                {copiedId === alert.security_advisory.ghsa_id ? (
                                  <Check className="w-3 h-3 text-gh-success-fg" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{alert.security_advisory.ghsa_id}</span>
                              </button>
                            )}

                            {alert.security_advisory?.cve_id && (
                              <button
                                onClick={() => handleCopy(alert.security_advisory.cve_id!)}
                                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-gh-canvas-subtle border border-gh-border-default hover:text-gh-fg-default text-gh-fg-muted font-mono text-[11px]"
                              >
                                {copiedId === alert.security_advisory.cve_id ? (
                                  <Check className="w-3 h-3 text-gh-success-fg" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                                <span>{alert.security_advisory.cve_id}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. CodeQL Tab */}
        {activeTab === 'codeql' && (
          <div className="space-y-3">
            {code_scanning_alerts.length === 0 ? (
              <div className="p-12 text-center rounded-xl border border-gh-border-default bg-gh-canvas-subtle">
                <CheckCircle2 className="w-10 h-10 text-gh-success-fg mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gh-fg-default">No Open Code Scanning Findings</h3>
                <p className="text-xs text-gh-fg-muted mt-1 max-w-md mx-auto">
                  CodeQL static code analysis discovered 0 security vulnerabilities in this codebase.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-xs text-gh-fg-muted flex items-center justify-between pb-1">
                  <span>Showing {code_scanning_alerts.length} static analysis findings. Click any issue to expand details:</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => setExpandedCodeQL(new Set(code_scanning_alerts.map((a) => a.number)))}
                      className="text-gh-accent-fg hover:underline"
                    >
                      Expand All
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => setExpandedCodeQL(new Set())}
                      className="text-gh-accent-fg hover:underline"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {code_scanning_alerts.map((alert) => {
                  const isExpanded = expandedCodeQL.has(alert.number);

                  return (
                    <div
                      key={alert.number}
                      className={`rounded-xl border transition-all overflow-hidden ${
                        isExpanded
                          ? 'bg-gh-canvas-subtle border-gh-border-default shadow-sm'
                          : 'bg-gh-canvas-subtle/70 border-gh-border-muted hover:border-gh-border-default'
                      }`}
                    >
                      <div
                        onClick={() => toggleCodeQL(alert.number)}
                        className="p-4 flex items-start sm:items-center justify-between gap-3 cursor-pointer select-none group"
                      >
                        <div className="flex items-start sm:items-center space-x-3 min-w-0">
                          <button className="text-gh-fg-muted group-hover:text-gh-fg-default mt-0.5 sm:mt-0 flex-shrink-0 transition-transform">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono flex-shrink-0 ${
                              alert.rule?.severity === 'error'
                                ? 'bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40'
                                : 'bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30'
                            }`}
                          >
                            {alert.rule?.severity || 'CodeQL'}
                          </span>

                          <div className="min-w-0">
                            <span className="font-mono text-xs font-bold text-gh-fg-default block truncate">
                              {alert.rule?.name || alert.rule?.id}
                            </span>
                            {alert.most_recent_instance?.location && (
                              <span className="text-[11px] text-gh-fg-muted font-mono block mt-0.5 truncate">
                                {alert.most_recent_instance.location.path}#L{alert.most_recent_instance.location.start_line}
                              </span>
                            )}
                          </div>
                        </div>

                        <a
                          href={alert.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-xs font-semibold rounded bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors shadow-sm flex-shrink-0"
                          title="Open CodeQL alert in GitHub"
                        >
                          <span>View in CodeQL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {/* Expanded CodeQL finding detail */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 border-t border-gh-border-muted/60 space-y-3 text-xs bg-gh-canvas-default/50 animate-in fade-in duration-150">
                          <p className="text-xs text-gh-fg-default leading-relaxed bg-gh-canvas-subtle p-3 rounded-lg border border-gh-border-muted">
                            {alert.rule?.description}
                          </p>

                          {alert.most_recent_instance?.location && (
                            <div className="p-3 rounded-lg bg-gh-canvas-subtle border border-gh-border-muted font-mono text-xs flex items-center space-x-2 text-gh-fg-muted">
                              <FileCode className="w-4 h-4 text-gh-accent-fg flex-shrink-0" />
                              <span className="text-gh-fg-default">
                                {alert.most_recent_instance.location.path}
                              </span>
                              <span className="text-gh-accent-fg">
                                :lines {alert.most_recent_instance.location.start_line} - {alert.most_recent_instance.location.end_line}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. Pages & Builds Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-4">
            {!features.pages_enabled ? (
              <div className="p-12 text-center rounded-xl border border-gh-border-default bg-gh-canvas-subtle">
                <Globe className="w-10 h-10 text-gh-fg-muted mx-auto mb-3 opacity-60" />
                <h3 className="text-sm font-semibold text-gh-fg-default">GitHub Pages is Not Active</h3>
                <p className="text-xs text-gh-fg-muted mt-1 max-w-md mx-auto">
                  This repository has not been enabled for GitHub Pages deployment in repository settings.
                </p>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-gh-canvas-subtle border border-gh-border-default space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-gh-fg-default">GitHub Pages Deployment</h3>
                    {features.pages_url && (
                      <a
                        href={features.pages_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gh-accent-fg hover:underline inline-flex items-center space-x-1 mt-1 font-mono"
                      >
                        <span>{features.pages_url}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <span
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono ${
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
                  <div className="p-4 rounded-lg bg-gh-canvas-default border border-gh-border-muted space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gh-fg-default">
                        Latest Workflow Run: {features.last_pages_run.name}
                      </span>
                      <a
                        href={features.last_pages_run.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs text-gh-accent-fg hover:underline font-semibold"
                      >
                        <span>View Build Workflow Log</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gh-fg-muted font-mono">
                      <div className="flex items-center space-x-1">
                        <GitCommit className="w-3.5 h-3.5" />
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
  );
};
