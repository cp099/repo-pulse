import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Search, ShieldAlert, AlertTriangle, ShieldCheck, Globe, ListFilter } from 'lucide-react';

export const FilterToolbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    metrics,
    healthSummaries,
  } = useDashboard();

  const pagesCount = healthSummaries.filter(s => s.features.pages_enabled).length;

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b md:border-b-0 border-gh-border-muted overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {/* All */}
        <button
          onClick={() => setFilterStatus('all')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            filterStatus === 'all'
              ? 'bg-gh-canvas-subtle text-gh-fg-default border border-gh-border-default'
              : 'text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle/50'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>All Repos</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] text-gh-fg-muted">
            {metrics.total_tracked_repos}
          </span>
        </button>

        {/* Critical */}
        <button
          onClick={() => setFilterStatus('critical')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            filterStatus === 'critical'
              ? 'bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/30'
              : 'text-gh-fg-muted hover:text-gh-danger-fg hover:bg-gh-danger-subtle/20'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-gh-danger-fg" />
          <span>Critical</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-danger-subtle text-[10px] font-bold text-gh-danger-fg">
            {metrics.critical_repos_count}
          </span>
        </button>

        {/* Warning */}
        <button
          onClick={() => setFilterStatus('warning')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            filterStatus === 'warning'
              ? 'bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/30'
              : 'text-gh-fg-muted hover:text-gh-warning-fg hover:bg-gh-warning-subtle/20'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-gh-warning-fg" />
          <span>Warnings</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-warning-subtle text-[10px] font-semibold text-gh-warning-fg">
            {metrics.warning_repos_count}
          </span>
        </button>

        {/* Healthy */}
        <button
          onClick={() => setFilterStatus('healthy')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            filterStatus === 'healthy'
              ? 'bg-gh-success-subtle text-gh-success-fg border border-gh-success-fg/30'
              : 'text-gh-fg-muted hover:text-gh-success-fg hover:bg-gh-success-subtle/20'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-gh-success-fg" />
          <span>Clean</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] text-gh-fg-muted">
            {metrics.healthy_repos_count}
          </span>
        </button>

        {/* Pages */}
        <button
          onClick={() => setFilterStatus('pages')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            filterStatus === 'pages'
              ? 'bg-gh-canvas-subtle text-gh-accent-fg border border-gh-border-default'
              : 'text-gh-fg-muted hover:text-gh-accent-fg hover:bg-gh-canvas-subtle/50'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-gh-accent-fg" />
          <span>GitHub Pages</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] text-gh-fg-muted">
            {pagesCount}
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative min-w-[260px]">
        <Search className="w-4 h-4 text-gh-fg-muted absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter repositories..."
          className="w-full bg-gh-canvas-subtle border border-gh-border-default focus:border-gh-accent-fg focus:ring-1 focus:ring-gh-accent-fg rounded-md pl-9 pr-3 py-1.5 text-xs text-gh-fg-default placeholder-gh-fg-muted transition-colors outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-2 text-xs text-gh-fg-muted hover:text-gh-fg-default"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
