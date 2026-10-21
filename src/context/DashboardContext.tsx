import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { GlobalMetrics, RepoHealthSummary, Repository, UserConfig } from '../types';
import { getLocalConfig, saveLocalConfig, getLocalHealthCache, saveLocalHealthCache, initializeFirebase, syncHealthToCloud } from '../services/firebase';
import { scanRepositoryHealth, fetchUserRepositories, getRateLimitInfo, RateLimitInfo } from '../services/githubApi';
import { MOCK_HEALTH_SUMMARIES, MOCK_REPOSITORIES } from '../services/mockData';

interface DashboardContextType {
  config: UserConfig;
  updateConfig: (newConfig: Partial<UserConfig>) => void;
  isDemoMode: boolean;
  setDemoMode: (demo: boolean) => void;
  healthSummaries: RepoHealthSummary[];
  selectedSummary: RepoHealthSummary | null;
  setSelectedSummary: (summary: RepoHealthSummary | null) => void;
  metrics: GlobalMetrics;
  isScanning: boolean;
  scanProgress: { current: number; total: number; repoName: string };
  lastRefreshed: Date | null;
  refreshNow: () => Promise<void>;
  availableRepos: Repository[];
  isLoadingRepos: boolean;
  fetchAvailableRepos: () => Promise<Repository[]>;
  rateLimit: RateLimitInfo;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterStatus: 'all' | 'critical' | 'warning' | 'healthy' | 'pages';
  setFilterStatus: (f: 'all' | 'critical' | 'warning' | 'healthy' | 'pages') => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<UserConfig>(getLocalConfig);
  const [isDemoMode, setDemoMode] = useState<boolean>(!config.githubToken);
  const [healthSummaries, setHealthSummaries] = useState<RepoHealthSummary[]>(() => {
    const cached = getLocalHealthCache();
    if (cached && cached.length > 0) return cached;
    return MOCK_HEALTH_SUMMARIES;
  });
  const [selectedSummary, setSelectedSummary] = useState<RepoHealthSummary | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0, repoName: '' });
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(new Date());
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>(getRateLimitInfo());
  const [availableRepos, setAvailableRepos] = useState<Repository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'critical' | 'warning' | 'healthy' | 'pages'>('all');

  // Initialize Firebase when config changes
  useEffect(() => {
    if (config.useFirebaseSync && config.firebaseConfig) {
      initializeFirebase(config.firebaseConfig);
    }
  }, [config.useFirebaseSync, config.firebaseConfig]);

  const updateConfig = useCallback((newConfig: Partial<UserConfig>) => {
    setConfigState(prev => {
      const updated = { ...prev, ...newConfig };
      saveLocalConfig(updated);
      if (updated.githubToken && isDemoMode) {
        setDemoMode(false);
      }
      return updated;
    });
  }, [isDemoMode]);

  // Load available user repositories
  const fetchAvailableRepos = useCallback(async (): Promise<Repository[]> => {
    if (isDemoMode || !config.githubToken) {
      setAvailableRepos(MOCK_REPOSITORIES);
      return MOCK_REPOSITORIES;
    }

    setIsLoadingRepos(true);
    try {
      const repos = await fetchUserRepositories(config.githubToken);
      setAvailableRepos(repos);
      setRateLimit(getRateLimitInfo());
      return repos;
    } catch (err) {
      console.error('Failed to load user repositories:', err);
      return [];
    } finally {
      setIsLoadingRepos(false);
    }
  }, [isDemoMode, config.githubToken]);

  // Refresh health data for all monitored repos
  const refreshNow = useCallback(async () => {
    if (isScanning) return;

    if (isDemoMode || !config.githubToken) {
      setIsScanning(true);
      setScanProgress({ current: 1, total: MOCK_HEALTH_SUMMARIES.length, repoName: 'Simulating refresh...' });
      await new Promise(r => setTimeout(r, 800));
      setHealthSummaries(MOCK_HEALTH_SUMMARIES);
      setLastRefreshed(new Date());
      setIsScanning(false);
      return;
    }

    if (config.monitoredRepos.length === 0) {
      setHealthSummaries([]);
      return;
    }

    setIsScanning(true);
    const results: RepoHealthSummary[] = [];

    // Ensure we have repo objects
    let reposList = availableRepos;
    if (reposList.length === 0) {
      reposList = await fetchAvailableRepos();
    }

    const reposToScan = reposList.filter(r => config.monitoredRepos.includes(r.full_name));
    const total = reposToScan.length;

    for (let i = 0; i < total; i++) {
      const repo = reposToScan[i];
      setScanProgress({ current: i + 1, total, repoName: repo.full_name });

      try {
        const summary = await scanRepositoryHealth(repo, config.githubToken);
        results.push(summary);
      } catch (err) {
        console.warn(`Failed scanning health for ${repo.full_name}:`, err);
      }
    }

    setHealthSummaries(results);
    saveLocalHealthCache(results);
    setRateLimit(getRateLimitInfo());
    setLastRefreshed(new Date());
    setIsScanning(false);

    if (config.useFirebaseSync) {
      syncHealthToCloud('default_user', results);
    }
  }, [isScanning, isDemoMode, config.githubToken, config.monitoredRepos, config.useFirebaseSync, availableRepos, fetchAvailableRepos]);

  // Auto-refresh interval
  useEffect(() => {
    if (config.autoRefreshInterval <= 0) return;
    const interval = setInterval(() => {
      refreshNow();
    }, config.autoRefreshInterval);

    return () => clearInterval(interval);
  }, [config.autoRefreshInterval, refreshNow]);

  // Calculate global summary metrics
  const metrics = useMemo<GlobalMetrics>(() => {
    const list = isDemoMode ? MOCK_HEALTH_SUMMARIES : healthSummaries;
    let totalCrit = 0;
    let totalHigh = 0;
    let totalMed = 0;
    let totalCodeErrors = 0;
    let failingPages = 0;
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    list.forEach(item => {
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
      total_tracked_repos: list.length,
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
  }, [healthSummaries, isDemoMode, lastRefreshed]);

  return (
    <DashboardContext.Provider
      value={{
        config,
        updateConfig,
        isDemoMode,
        setDemoMode,
        healthSummaries: isDemoMode ? MOCK_HEALTH_SUMMARIES : healthSummaries,
        selectedSummary,
        setSelectedSummary,
        metrics,
        isScanning,
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
