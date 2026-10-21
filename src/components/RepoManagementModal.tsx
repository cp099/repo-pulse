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
  Plus,
  AlertCircle,
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
  } = useDashboard();

  const [selected, setSelected] = useState<string[]>(config.monitoredRepos || []);
  const [search, setSearch] = useState('');
  const [filterOnlyActiveFeatures, setFilterOnlyActiveFeatures] = useState(false);
  const [repoFeaturesMap, setRepoFeaturesMap] = useState<Record<string, RepoFeatures>>({});
  const [probingFeatures, setProbingFeatures] = useState(false);

  // Custom Repo Addition with Validation
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRepo, setCustomRepo] = useState('');
  const [customRepoError, setCustomRepoError] = useState<string | null>(null);

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
    if (!config.githubToken) return;
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

  const handleAddCustomRepo = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customRepo.trim();

    // Form validation for owner/repo format
    const repoRegex = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
    if (!repoRegex.test(trimmed)) {
      setCustomRepoError('Invalid format. Please enter as "owner/repository" (e.g. facebook/react)');
      return;
    }

    if (selected.includes(trimmed)) {
      setCustomRepoError('This repository is already in your monitored list.');
      return;
    }

    setSelected([...selected, trimmed]);
    setCustomRepo('');
    setCustomRepoError(null);
    setShowCustomInput(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-gh-canvas-subtle border border-gh-border-default rounded-xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-gh-border-default flex items-center justify-between bg-gh-canvas-default rounded-t-xl">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded bg-gh-canvas-subtle border border-gh-border-default text-gh-accent-fg">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gh-fg-default">Select Repositories to Monitor</h3>
              <p className="text-xs text-[#c9d1d9]">
                Track Dependabot security vulnerabilities, CodeQL analysis and Pages deployments
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close repository modal"
            className="p-1 rounded-md text-gh-fg-muted hover:text-gh-fg-default hover:bg-gh-canvas-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-gh-border-muted bg-gh-canvas-default/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accessible repositories..."
              aria-label="Search accessible repositories"
              className="w-full bg-gh-canvas-default border border-gh-border-default focus:border-gh-accent-fg rounded-md pl-9 pr-3 py-1.5 text-xs text-gh-fg-default placeholder-[#8b949e] outline-none min-h-[36px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterOnlyActiveFeatures(!filterOnlyActiveFeatures)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center space-x-1.5 transition-colors min-h-[36px] ${
                filterOnlyActiveFeatures
                  ? 'bg-gh-accent-subtle text-gh-accent-fg border-gh-accent-emphasis/40'
                  : 'bg-gh-canvas-default text-[#c9d1d9] border-gh-border-default hover:text-gh-fg-default'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Only Enabled Features</span>
            </button>

            <button
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold bg-gh-canvas-default text-[#c9d1d9] hover:text-gh-fg-default border border-gh-border-default flex items-center space-x-1.5 min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Repo</span>
            </button>

            {config.githubToken && (
              <button
                onClick={probeFeaturesForRepos}
                disabled={probingFeatures}
                className="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-gh-canvas-default text-[#c9d1d9] hover:text-gh-fg-default border border-gh-border-default flex items-center space-x-1 min-h-[36px]"
                title="Deep scan feature presence for repos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${probingFeatures ? 'animate-spin text-gh-accent-fg' : ''}`} />
                <span className="hidden sm:inline">{probingFeatures ? 'Probing...' : 'Detect Features'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Repo Add Form */}
        {showCustomInput && (
          <form
            onSubmit={handleAddCustomRepo}
            className="p-3.5 bg-gh-canvas-default border-b border-gh-border-muted flex flex-col sm:flex-row items-stretch sm:items-center gap-2 animate-in fade-in duration-150"
          >
            <div className="flex-1">
              <input
                type="text"
                value={customRepo}
                onChange={(e) => {
                  setCustomRepo(e.target.value);
                  setCustomRepoError(null);
                }}
                placeholder="e.g. organization/repository"
                aria-label="Repository name in owner/repo format"
                className={`w-full bg-gh-canvas-subtle border ${
                  customRepoError ? 'border-gh-danger-fg' : 'border-gh-border-default focus:border-gh-accent-fg'
                } rounded px-3 py-1.5 text-xs font-mono text-gh-fg-default placeholder-[#8b949e] outline-none min-h-[36px]`}
              />
              {customRepoError && (
                <p role="alert" className="text-[11px] text-gh-danger-fg font-medium mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{customRepoError}</span>
                </p>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded bg-gh-accent-emphasis hover:bg-blue-600 text-white min-h-[36px]"
            >
              Add to Monitor
            </button>
          </form>
        )}

        {/* Selection summary bar */}
        <div className="px-4 py-2 bg-gh-canvas-inset border-b border-gh-border-muted flex items-center justify-between text-xs text-[#c9d1d9]">
          <span>
            Selected <strong className="text-gh-fg-default font-bold">{selected.length}</strong> repositories
          </span>
          <div className="flex items-center space-x-3">
            <button onClick={selectAllFiltered} className="hover:text-gh-accent-fg transition-colors font-medium">
              Select Visible
            </button>
            <span>·</span>
            <button onClick={deselectAllFiltered} className="hover:text-gh-danger-fg transition-colors font-medium">
              Deselect Visible
            </button>
          </div>
        </div>

        {/* Repository List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoadingRepos ? (
            <div className="py-12 text-center text-xs text-[#c9d1d9]">
              <RefreshCw className="w-6 h-6 animate-spin text-gh-accent-fg mx-auto mb-2" />
              <span>Loading repositories from GitHub...</span>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#c9d1d9]">
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
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between min-h-[48px] ${
                    isChecked
                      ? 'bg-gh-canvas-default border-gh-accent-emphasis/50 shadow-sm'
                      : 'bg-gh-canvas-default/60 border-gh-border-muted hover:border-gh-border-default'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      type="button"
                      aria-label={`Toggle selection for ${repo.full_name}`}
                      className="text-[#8b949e] hover:text-gh-fg-default flex-shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-gh-accent-fg" />
                      ) : (
                        <Square className="w-4 h-4 text-[#8b949e]" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        {repo.private ? (
                          <Lock className="w-3 h-3 text-gh-warning-fg flex-shrink-0" />
                        ) : (
                          <Globe className="w-3 h-3 text-[#8b949e] flex-shrink-0" />
                        )}
                        <span className="font-semibold text-xs text-gh-fg-default truncate">
                          {repo.full_name}
                        </span>
                      </div>
                      {repo.description && (
                        <p className="text-[11px] text-[#c9d1d9] truncate max-w-lg mt-0.5">
                          {repo.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Feature badges with accessible contrast */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0 ml-3">
                    {/* Dependabot */}
                    {(features?.dependabot_enabled ?? true) && (
                      <span
                        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-gh-purple-subtle text-gh-purple-fg border border-gh-purple-fg/20"
                        title="Dependabot alerts enabled"
                      >
                        <Package className="w-3 h-3" />
                        <span className="hidden sm:inline">Dependabot</span>
                      </span>
                    )}

                    {/* CodeQL */}
                    {(features?.code_scanning_enabled ?? true) && (
                      <span
                        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-gh-accent-subtle text-gh-accent-fg border border-gh-accent-emphasis/20"
                        title="CodeQL scanning enabled"
                      >
                        <Code2 className="w-3 h-3" />
                        <span className="hidden sm:inline">CodeQL</span>
                      </span>
                    )}

                    {/* Pages */}
                    {(repo.has_pages || features?.pages_enabled) && (
                      <span
                        className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-gh-canvas-subtle text-gh-success-fg border border-gh-success-fg/20"
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
          <span className="text-xs text-[#8b949e] hidden sm:inline">
            Select repositories to monitor their security alerts and build deployments.
          </span>
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-md bg-gh-canvas-subtle hover:bg-gh-border-muted border border-gh-border-default text-gh-fg-default transition-colors min-h-[36px]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-gh-accent-emphasis hover:bg-blue-600 text-white transition-colors shadow-sm min-h-[36px]"
            >
              Save Monitored Repos ({selected.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};