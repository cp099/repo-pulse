import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import { GlobalMetrics, RepoHealthSummary, Repository, UserConfig } from '../types';
import {
  getLocalConfig,
  saveLocalConfig,
  getLocalHealthCache,
  saveLocalHealthCache,
  signInWithGitHub,
  signOutUser,
  subscribeToAuth,
  syncHealthToCloud,
  fetchHealthFromCloud,
  isFirebaseConfigured,
} from '../services/firebase';
import { scanRepositoryHealth, fetchUserRepositories, getRateLimitInfo, RateLimitInfo } from '../services/githubApi';

export type SortOption = 'severity' | 'alerts' | 'name' | 'pages';
export type ViewMode = 'grid' | 'table';
export type ActiveTab = 'dashboard' | 'repositories';

interface DashboardContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseReady: boolean;
  config: UserConfig;
  updateConfig: (newConfig: Partial<UserConfig>) => void;
  healthSummaries: RepoHealthSummary[];
  selectedSummary: RepoHealthSummary | null;
  setSelectedSummary: (summary: RepoHealthSummary | null) => void;
  metrics: GlobalMetrics;
  isScanning: boolean;
  isManualScanning: boolean;
  scanProgress: { current: number; total: number; repoName: string };
  lastRefreshed: Date | null;
  refreshNow: (manual?: boolean) => Promise<void>;
  availableRepos: Repository[];
  isLoadingRepos: boolean;
  fetchAvailableRepos: () => Promise<Repository[]>;
  rateLimit: RateLimitInfo;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: 'all' | 'critical' | 'warning' | 'healthy' | 'pages';
  setFilterStatus: (f: 'all' | 'critical' | 'warning' | 'healthy' | 'pages') => void;
  sortBy: SortOption;
  setSortBy: (s: SortOption) => void;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  activeTab: ActiveTab;
  setActiveTab: (t: ActiveTab) => void;
  authError: string | null;
  setAuthError: (e: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [config, setConfigState] = useState<UserConfig>(getLocalConfig);
  const [healthSummaries, setHealthSummaries] = useState<RepoHealthSummary[]>(() => {
    return getLocalHealthCache() || [];
  });
  const [selectedSummary, setSelectedSummary] = useState<RepoHealthSummary | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isManualScanning, setIsManualScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, repoName: '' });
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>(getRateLimitInfo());
  const [availableRepos, setAvailableRepos] = useState<Repository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);

  // Top level views: 'dashboard' (Pure NOC Monitor for TV/Mobile/Laptop) vs 'repositories' (List/Grid ledger)
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('repo_pulse_active_tab');
      if (saved === 'dashboard' || saved === 'repositories') return saved;
    } catch {}
    return 'dashboard';
  });

  const setActiveTab = (tab: ActiveTab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('repo_pulse_active_tab', tab);
    } catch {}
  };

  // Filters & Sorting & View Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'warning' | 'healthy' | 'pages'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('severity');
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem('repo_pulse_view_mode');
      if (saved === 'grid' || saved === 'table') return saved;
    } catch {}
    return 'table';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem('repo_pulse_view_mode', mode);
    } catch {}
  };

  const isAuthenticated = !!currentUser || !!config.githubToken;

  const updateConfig = useCallback((newConfig: Partial<UserConfig>) => {
    setConfigState(prev => {
      const updated = { ...prev, ...newConfig };
      saveLocalConfig(updated);
      return updated;
    });
  }, []);

  // Track Firebase Auth state & load cloud data
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        const cloudData = await fetchHealthFromCloud(user.uid);
        if (cloudData) {
          if (cloudData.monitoredRepos && cloudData.monitoredRepos.length > 0) {
            setConfigState(prev => {
              const updated = { ...prev, monitoredRepos: cloudData.monitoredRepos };
              saveLocalConfig(updated);
              return updated;
            });
          }
          if (cloudData.summaries && cloudData.summaries.length > 0) {
            setHealthSummaries(cloudData.summaries);
            setLastRefreshed(new Date());
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // 1-Click Sign in with GitHub
  const loginWithGitHub = useCallback(async () => {
    setAuthError(null);
    try {
      const { user, githubToken } = await signInWithGitHub();
      setCurrentUser(user);
      if (githubToken) {
        updateConfig({ githubToken });
      }
    } catch (err: any) {
      console.error('GitHub Sign-In error:', err);
      setAuthError(err.message || 'GitHub Authentication failed');
      throw err;
    }
  }, [updateConfig]);

  // Sign out
  const logout = useCallback(async () => {
    await signOutUser();
    setCurrentUser(null);
    setHealthSummaries([]);
    setSelectedSummary(null);
    updateConfig({ githubToken: '', monitoredRepos: [] });
    saveLocalHealthCache([]);
  }, [updateConfig]);

  // Load available user repositories
  const fetchAvailableRepos = useCallback(async (): Promise<Repository[]> => {
    if (!config.githubToken) {
      return [];
    }

    setIsLoadingRepos(true);
    try {
      const repos = await fetchUserRepositories(config.githubToken);
      setAvailableRepos(repos);
      setRateLimit(getRateLimitInfo());

      if (config.monitoredRepos.length === 0 && repos.length > 0) {
        const initialTracked = repos.slice(0, 15).map(r => r.full_name);
        updateConfig({ monitoredRepos: initialTracked });
      }

      return repos;
    } catch (err) {
      console.error('Failed to load user repositories:', err);
      return [];
    } finally {
      setIsLoadingRepos(false);
    }
  }, [config.githubToken, config.monitoredRepos.length, updateConfig]);

  // Refresh health data for all monitored repos
  const refreshNow = useCallback(async (manual: boolean = false) => {
    if (isScanning || !config.githubToken) return;

    setIsScanning(true);
    if (manual) {
      setIsManualScanning(true);
    }

    const results: RepoHealthSummary[] = [];

    let reposList = availableRepos;
    if (reposList.length === 0) {
      reposList = await fetchAvailableRepos();
    }

    const reposToScan = reposList.filter(r => config.monitoredRepos.includes(r.full_name));
    const total = reposToScan.length;

    if (total === 0 && reposList.length > 0) {
      const defaultRepos = reposList.slice(0, 15);
      for (let i = 0; i < defaultRepos.length; i++) {
        const repo = defaultRepos[i];
        if (manual) {
          setScanProgress({ current: i + 1, total: defaultRepos.length, repoName: repo.full_name });
        }
        try {
          const summary = await scanRepositoryHealth(repo, config.githubToken);
          results.push(summary);
        } catch (err) {
          console.warn(`Failed scanning health for ${repo.full_name}:`, err);
        }
      }
    } else {
      for (let i = 0; i < total; i++) {
        const repo = reposToScan[i];
        if (manual) {
          setScanProgress({ current: i + 1, total, repoName: repo.full_name });
        }
        try {
          const summary = await scanRepositoryHealth(repo, config.githubToken);
          results.push(summary);
        } catch (err) {
          console.warn(`Failed scanning health for ${repo.full_name}:`, err);
        }
      }
    }

    setHealthSummaries(results);
    saveLocalHealthCache(results);
    setRateLimit(getRateLimitInfo());
    setLastRefreshed(new Date());
    setIsScanning(false);
    setIsManualScanning(false);

    if (selectedSummary) {
      const updatedMatch = results.find(s => s.repo.id === selectedSummary.repo.id);
      if (updatedMatch) {
        setSelectedSummary(updatedMatch);
      }
    }

    if (currentUser) {
      syncHealthToCloud(currentUser.uid, config.monitoredRepos, results);
    }
  }, [isScanning, config.githubToken, config.monitoredRepos, availableRepos, fetchAvailableRepos, selectedSummary, currentUser]);

  // Initial scan on login
  useEffect(() => {
    if (config.githubToken && healthSummaries.length === 0 && !isScanning) {
      refreshNow(true);
    }
  }, [config.githubToken]);

  // Auto-refresh interval (silent background sync)
  useEffect(() => {
    if (config.autoRefreshInterval <= 0 || !config.githubToken) return;
    const interval = setInterval(() => {
      refreshNow(false);
    }, config.autoRefreshInterval);

    return () => clearInterval(interval);
  }, [config.autoRefreshInterval, config.githubToken, refreshNow]);

  // Calculate global summary metrics
  const metrics = useMemo<GlobalMetrics>(() => {
    let totalCrit = 0;
    let totalHigh = 0;
    let totalMed = 0;
    let totalCodeErrors = 0;
    let failingPages = 0;
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    healthSummaries.forEach(item => {
      totalCrit += item.critical_count;
      totalHigh += item.high_count;
      totalMed += item.medium_count;
      totalCodeErrors += item.code_scanning_error_count;
      if (item.features.pages_status === 'errored') failingPages++;

      if (item.health_status === 'critical') criticalCount++;
      else if (item.health_status === 'warning') warningCount++;
      else healthyCount++;
    });

    return {
      total_tracked_repos: healthSummaries.length,
      healthy_repos_count: healthyCount,
      warning_repos_count: warningCount,
      critical_repos_count: criticalCount,
      total_critical_alerts: totalCrit,
      total_high_alerts: totalHigh,
      total_medium_alerts: totalMed,
      total_code_scanning_errors: totalCodeErrors,
      failing_pages_count: failingPages,
      last_updated: lastRefreshed ? lastRefreshed.toLocaleTimeString() : 'Never',
    };
  }, [healthSummaries, lastRefreshed]);

  return (
    <DashboardContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loginWithGitHub,
        logout,
        isFirebaseReady: isFirebaseConfigured(),
        config,
        updateConfig,
        healthSummaries,
        selectedSummary,
        setSelectedSummary,
        metrics,
        isScanning,
        isManualScanning,
        scanProgress,
        lastRefreshed,
        refreshNow,
        availableRepos,
        isLoadingRepos,
        fetchAvailableRepos,
        rateLimit,
        searchQuery,
        setSearchQuery,
        filterStatus,
        setFilterStatus,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        activeTab,
        setActiveTab,
        authError,
        setAuthError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
