export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
  has_pages: boolean;
  fork: boolean;
  archived: boolean;
  language?: string | null;
  languages?: Record<string, number>;
}

export interface RepoFeatures {
  dependabot_enabled: boolean;
  code_scanning_enabled: boolean;
  pages_enabled: boolean;
  pages_status?: 'built' | 'building' | 'errored' | 'disabled' | 'unknown';
  pages_url?: string;
  last_pages_run?: {
    id: number;
    name: string;
    conclusion: string | null;
    status: string;
    html_url: string;
    updated_at: string;
  } | null;
}

export interface DependabotAlert {
  number: number;
  state: 'open' | 'fixed' | 'dismissed';
  dependency: {
    package: {
      name: string;
      ecosystem: string;
    };
    manifest_path: string;
  };
  security_advisory: {
    ghsa_id: string;
    cve_id: string | null;
    summary: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    cvss?: {
      score: number;
    } | null;
  };
  security_vulnerability?: {
    package: {
      name: string;
    };
    vulnerable_version_range: string;
    first_patched_version?: {
      identifier: string;
    } | null;
  };
  html_url: string;
  created_at: string;
}

export interface CodeScanningAlert {
  number: number;
  state: 'open' | 'closed' | 'fixed' | 'dismissed';
  rule: {
    id: string;
    name: string;
    severity: 'error' | 'warning' | 'note' | 'none';
    description: string;
    tags?: string[];
  };
  tool: {
    name: string;
    version: string | null;
  };
  most_recent_instance: {
    ref: string;
    state: string;
    location: {
      path: string;
      start_line: number;
      end_line: number;
    };
  };
  html_url: string;
  created_at: string;
}

export interface PullRequestAlert {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed';
  draft: boolean;
  html_url: string;
  created_at: string;
  updated_at: string;
  user: {
    login: string;
    avatar_url: string;
    type: string;
  };
  head: {
    ref: string;
    label: string;
  };
  base: {
    ref: string;
  };
  labels: {
    id: number;
    name: string;
    color: string;
  }[];
  mergeable_state?: string;
  has_conflicts?: boolean;
}

export interface LanguageItem {
  name: string;
  percentage: number;
  color: string;
  bytes: number;
}

export interface RepoHealthSummary {
  repo: Repository;
  features: RepoFeatures;
  dependabot_alerts: DependabotAlert[];
  code_scanning_alerts: CodeScanningAlert[];
  pull_requests?: PullRequestAlert[];
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  code_scanning_error_count: number;
  code_scanning_warning_count: number;
  open_pr_count: number;
  has_pr_conflicts?: boolean;
  pages_status: 'built' | 'building' | 'errored' | 'disabled' | 'unknown';
  health_status: 'healthy' | 'warning' | 'critical';
  languages?: LanguageItem[];
  primary_language?: string | null;
  last_scanned: string;
}

export interface GlobalMetrics {
  total_tracked_repos: number;
  healthy_repos_count: number;
  warning_repos_count: number;
  critical_repos_count: number;
  total_critical_alerts: number;
  total_high_alerts: number;
  total_medium_alerts: number;
  total_code_scanning_errors: number;
  total_open_prs: number;
  failing_pages_count: number;
  last_updated: string;
}

export interface UserConfig {
  githubToken: string;
  monitoredRepos: string[]; // array of full_name e.g. "owner/repo"
  autoRefreshInterval: number; // in milliseconds (0 for manual)
  useFirebaseSync: boolean;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
