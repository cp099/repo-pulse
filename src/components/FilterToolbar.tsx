import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  Search,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Globe,
  ListFilter,
  ArrowUpDown,
  LayoutGrid,
  List,
} from 'lucide-react';
import { SortOption } from '../context/DashboardContext';

export const FilterToolbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    metrics,
    healthSummaries,
  } = useDashboard();

  const pagesCount = healthSummaries.filter(s => s.features.pages_enabled).length;

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4">
      {/* Status filter tabs */}
      <div
        role="tablist"
        aria-label="Repository filter tabs"
        className="flex items-center space-x-1 border-b lg:border-b-0 border-gh-border-muted overflow-x-auto pb-1.5 lg:pb-0 scrollbar-none"
      >
        {/* All */}
        <button
          role="tab"
          aria-selected={filterStatus === 'all'}
          onClick={() => setFilterStatus('all')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors min-h-[32px] ${
            filterStatus === 'all'
              ? 'bg-gh-canvas-subtle text-gh-fg-default border border-gh-border-default shadow-sm'
              : 'text-[#c9d1d9] hover:text-gh-fg-default hover:bg-gh-canvas-subtle/50'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>All Repos</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] text-gh-fg-default font-mono">
            {metrics.total_tracked_repos}
          </span>
        </button>

        {/* Critical */}
        <button
          role="tab"
          aria-selected={filterStatus === 'critical'}
          onClick={() => setFilterStatus('critical')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors min-h-[32px] ${
            filterStatus === 'critical'
              ? 'bg-gh-danger-subtle text-gh-danger-fg border border-gh-danger-fg/40 shadow-sm'
              : 'text-[#c9d1d9] hover:text-gh-danger-fg hover:bg-gh-danger-subtle/20'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-gh-danger-fg" />
          <span>Critical</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-danger-subtle text-[10px] font-bold text-gh-danger-fg font-mono border border-gh-danger-fg/30">
            {metrics.critical_repos_count}
          </span>
        </button>

        {/* Warning */}
        <button
          role="tab"
          aria-selected={filterStatus === 'warning'}
          onClick={() => setFilterStatus('warning')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors min-h-[32px] ${
            filterStatus === 'warning'
              ? 'bg-gh-warning-subtle text-gh-warning-fg border border-gh-warning-fg/40 shadow-sm'
              : 'text-[#c9d1d9] hover:text-gh-warning-fg hover:bg-gh-warning-subtle/20'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-gh-warning-fg" />
          <span>Warnings</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-warning-subtle text-[10px] font-bold text-gh-warning-fg font-mono border border-gh-warning-fg/30">
            {metrics.warning_repos_count}
          </span>
        </button>

        {/* Healthy */}
        <button
          role="tab"
          aria-selected={filterStatus === 'healthy'}
          onClick={() => setFilterStatus('healthy')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors min-h-[32px] ${
            filterStatus === 'healthy'
              ? 'bg-gh-success-subtle text-gh-success-fg border border-gh-success-fg/40 shadow-sm'
              : 'text-[#c9d1d9] hover:text-gh-success-fg hover:bg-gh-success-subtle/20'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-gh-success-fg" />
          <span>Clean</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] text-gh-fg-default font-mono">
            {metrics.healthy_repos_count}
          </span>
        </button>

        {/* Pages */}
        <button
          role="tab"
          aria-selected={filterStatus === 'pages'}
          onClick={() => setFilterStatus('pages')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors min-h-[32px] ${
            filterStatus === 'pages'
              ? 'bg-gh-canvas-subtle text-gh-accent-fg border border-gh-border-default shadow-sm'
              : 'text-[#c9d1d9] hover:text-gh-accent-fg hover:bg-gh-canvas-subtle/50'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-gh-accent-fg" />
          <span>GitHub Pages</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gh-border-default text-[10px] text-gh-fg-default font-mono">
            {pagesCount}
          </span>
        </button>
      </div>

      {/* View switch, sort & search */}
      <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
        {/* View Switcher: Dashboard Cards vs Table */}
        <div className="flex items-center p-0.5 rounded-md bg-gh-canvas-subtle border border-gh-border-default">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Dashboard Cards View"
            className={`p-1.5 rounded text-xs transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center ${
              viewMode === 'grid'
                ? 'bg-gh-canvas-default text-gh-fg-default shadow-sm'
                : 'text-[#8b949e] hover:text-gh-fg-default'
            }`}
            title="Dashboard Cards View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            aria-label="Dense Table View"
            className={`p-1.5 rounded text-xs transition-colors min-h-[28px] min-w-[28px] flex items-center justify-center ${
              viewMode === 'table'
                ? 'bg-gh-canvas-default text-gh-fg-default shadow-sm'
                : 'text-[#8b949e] hover:text-gh-fg-default'
            }`}
            title="Dense Table View"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-1.5 bg-gh-canvas-subtle border border-gh-border-default rounded-md px-2.5 py-1 text-xs min-h-[32px]">
          <ArrowUpDown className="w-3 h-3 text-[#c9d1d9]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort repositories by"
            className="bg-transparent text-gh-fg-default text-xs outline-none cursor-pointer"
          >
            <option value="severity">Sort: Highest Severity</option>
            <option value="alerts">Sort: Most Alerts</option>
            <option value="name">Sort: Repository Name</option>
            <option value="pages">Sort: Pages Build Status</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter repositories..."
            aria-label="Filter repositories by name or topic"
            className="w-full bg-gh-canvas-subtle border border-gh-border-default focus:border-gh-accent-fg rounded-md pl-8 pr-7 py-1.5 text-xs text-gh-fg-default placeholder-[#8b949e] transition-colors outline-none min-h-[32px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear filter query"
              className="absolute right-2 top-1.5 text-xs text-[#8b949e] hover:text-gh-fg-default p-0.5"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
};