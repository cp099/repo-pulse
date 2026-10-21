import React, { useState, useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import {
  X,
  Search,
  CheckSquare,
  Square,
  Package,
  Code2,
  Globe,
  RefreshCw,
  FolderGit2,
  Lock,
  Filter,
} from 'lucide-react';
import { detectRepositoryFeatures } from '../services/githubApi';
import { RepoFeatures } from '../types';

interface RepoManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RepoManagementModal: React.FC<RepoManagementModalProps> = ({ isOpen, onClose }) => {
  const {
    config,
    updateConfig,
    availableRepos,
    isLoadingRepos,
    fetchAvailableRepos,
    refreshNow,
    isDemoMode,
  } = useDashboard();

  const [selected, setSelected] = useState<string[]>(config.monitoredRepos || []);
  const [search, setSearch] = useState('');
  const [filterOnlyActiveFeatures, setFilterOnlyActiveFeatures] = useState(false);
  const [repoFeaturesMap, setRepoFeaturesMap] = useState<Record<string, RepoFeatures>>({});
  const [probingFeatures, setProbingFeatures] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelected(config.monitoredRepos || []);
      if (availableRepos.length === 0) {
        fetchAvailableRepos();
      }
    }
  }, [isOpen, config.monitoredRepos, availableRepos.length, fetchAvailableRepos]);

  // Probe features for visible repositories
  const probeFeaturesForRepos = async () => {
    if (isDemoMode || !config.githubToken) return;
    setProbingFeatures(true);
    const newMap: Record<string, RepoFeatures> = { ...repoFeaturesMap };

    for (const r of availableRepos.slice(0, 30)) {
      if (!newMap[r.full_name]) {
        try {
          const [owner, name] = r.full_name.split('/');
          const f = await detectRepositoryFeatures(owner, name, config.githubToken);
          newMap[r.full_name] = f;
          setRepoFeaturesMap({ ...newMap });
        } catch {
          // ignore error
        }
      }
    }
    setProbingFeatures(false);
  };

  if (!isOpen) return null;

  const toggleRepo = (fullName: string) => {
    if (selected.includes(fullName)) {
      setSelected(selected.filter((item) => item !== fullName));
    } else {
      setSelected([...selected, fullName]);
    }
  };

  const selectAllFiltered = () => {
    const filteredNames = filteredRepos.map((r) => r.full_name);
    const combined = Array.from(new Set([...selected, ...filteredNames]));
    setSelected(combined);
  };

  const deselectAllFiltered = () => {
    const filteredNames = new Set(filteredRepos.map((r) => r.full_name));
    setSelected(selected.filter((name) => !filteredNames.has(name)));
  };

  const handleSave = async () => {
    updateConfig({ monitoredRepos: selected });
    onClose();
    // Trigger immediate scan of the newly selected repos
    refreshNow();
  };

  const filteredRepos = availableRepos.filter((r) => {
    if (search) {
      const matchName = r.full_name.toLowerCase().includes(search.toLowerCase());
      const matchDesc = r.description?.toLowerCase().includes(search.toLowerCase());
      if (!matchName && !matchDesc) return false;
    }

    if (filterOnlyActiveFeatures) {
      const f = repoFeaturesMap[r.full_name];
      if (f && !f.dependabot_enabled && !f.code_scanning_enabled && !f.pages_enabled) {
        return false;
      }
      if (!f && !r.has_pages) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-gh-canvas-subtle border border-gh-border-default rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gh-border-default flex items-center justify-between bg-gh-canvas-default rounded-t-xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-gh-canvas-subtle border border-gh-border-default text-gh-accent-fg">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gh-fg-default">Select Repositories to Monitor</h3>
              <p className="text-xs text-gh-fg-muted">
                Track Dependabot security vulnerabilities, CodeQL analysis and Pages deployments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-gh-border-muted bg-gh-canvas-default/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gh-fg-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accessible repositories..."
              className="w-full bg-gh-canvas-default border border-gh-border-default focus:border-gh-accent-fg rounded-md pl-9 pr-3 py-1.5 text-xs text-gh-fg-default placeholder-gh-fg-muted outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterOnlyActiveFeatures(!filterOnlyActiveFeatures)}
              className={`px-2.5 py-1.5 rounded text-xs font-medium border flex items-center space-x-1.5 transition-colors ${
                filterOnlyActiveFeatures
                  ? 'bg-gh-accent-subtle text-gh-accent-fg border-gh-accent-emphasis/40'
                  : 'bg-gh-canvas-default text-gh-fg-muted border-gh-border-default hover:text-gh-fg-default'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Only Enabled Features</span>
            </button>

            {!isDemoMode && config.githubToken && (
              <button
                onClick={probeFeaturesForRepos}
                disabled={probingFeatures}
                className="px-2.5 py-1.5 rounded text-xs font-medium bg-gh-canvas-default text-gh-fg-muted hover:text-gh-fg-default border border-gh-border-default flex items-center space-x-1"
                title="Deep scan feature presence for repos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${probingFeatures ? 'animate-spin text-gh-accent-fg' : ''}`} />
                <span>{probingFeatures ? 'Probing...' : 'Detect Features'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Selection summary bar */}
        <div className="px-4 py-2 bg-gh-canvas-inset border-b border-gh-border-muted flex items-center justify-between text-xs text-gh-fg-muted">
          <span>
            Selected <strong className="text-gh-fg-default">{selected.length}</strong> of{' '}
            <strong className="text-gh-fg-default">{availableRepos.length}</strong> repositories
          </span>
          <div className="flex items-center space-x-3">
            <button onClick={selectAllFiltered} className="hover:text-gh-accent-fg transition-colors">
              Select Visible
            </button>
            <span>·</span>
            <button onClick={deselectAllFiltered} className="hover:text-gh-danger-fg transition-colors">
              Deselect Visible
            </button>
          </div>
        </div>

        {/* Repository List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingRepos ? (
            <div className="py-12 text-center text-xs text-gh-fg-muted">
              <RefreshCw className="w-6 h-6 animate-spin text-gh-accent-fg mx-auto mb-2" />
              <span>Loading repositories from GitHub...</span>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-12 text-center text-xs text-gh-fg-muted">
              <span>No repositories found matching your search.</span>
            </div>
          ) : (
            filteredRepos.map((repo) => {
              const isChecked = selected.includes(repo.full_name);
              const features = repoFeaturesMap[repo.full_name];

              return (
                <div
                  key={repo.id}
                  onClick={() => toggleRepo(repo.full_name)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-gh-canvas-default border-gh-accent-emphasis/50 shadow-sm'
                      : 'bg-gh-canvas-default/50 border-gh-border-muted hover:border-gh-border-default'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      type="button"
                      className="text-gh-fg-muted hover:text-gh-fg-default flex-shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-gh-accent-fg" />
                      ) : (
                        <Square className="w-4 h-4 text-gh-fg-muted" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        {repo.private ? (
                          <Lock className="w-3 h-3 text-gh-warning-fg flex-shrink-0" />
                        ) : (
                          <Globe className="w-3 h-3 text-gh-fg-muted flex-shrink-0" />
                        )}
                        <span className="font-semibold text-xs text-gh-fg-default truncate">
                          {repo.full_name}
                        </span>
                      </div>
                      {repo.description && (
                        <p className="text-[11px] text-gh-fg-muted truncate max-w-lg mt-0.5">
                          {repo.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Feature badges */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0 ml-3">
                    {/* Dependabot */}
                    {(features?.dependabot_enabled ?? true) && (
                      <span
                        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gh-purple-subtle text-gh-purple-fg border border-gh-purple-fg/20"
                        title="Dependabot alerts enabled"
                      >
                        <Package className="w-3 h-3" />
                        <span className="hidden sm:inline">Dependabot</span>
                      </span>
                    )}

                    {/* CodeQL */}
                    {(features?.code_scanning_enabled ?? true) && (
                      <span
                        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/20"
                        title="CodeQL scanning enabled"
                      >
                        <Code2 className="w-3 h-3" />
                        <span className="hidden sm:inline">CodeQL</span>
                      </span>
                    )}

                    {/* Pages */}
                    {(repo.has_pages || features?.pages_enabled) && (
                      <span
                        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-gh-canvas-subtle text-gh-success-fg border border-gh-success-fg/20"
                        title="GitHub Pages deployment active"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="hidden sm:inline">Pages</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gh-border-default bg-gh-canvas-default rounded-b-xl flex items-center justify-between">
          <span className="text-xs text-gh-fg-muted">
            {isDemoMode && 'Demo mode is active. Add your GitHub PAT in Settings for your real repositories.'}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-medium rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors shadow-sm"
            >
              Save Monitored Repos ({selected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
