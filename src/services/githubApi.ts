import {
  CodeScanningAlert,
  DependabotAlert,
  LanguageItem,
  RepoFeatures,
  RepoHealthSummary,
  Repository,
} from '../types';

export const GITHUB_LANGUAGE_COLORS: Record<string, string> = {
  Python: '#3572A5',
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Shell: '#89e051',
  Bash: '#89e051',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  'Jupyter Notebook': '#DA5B0B',
  Dockerfile: '#384d54',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  SCSS: '#c6538c',
  Lua: '#000080',
  R: '#198CE7',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Zig: '#ec915c',
  Perl: '#0298c3',
  SQL: '#e38c00',
  Assembly: '#6E4C13',
  TeX: '#3D6117',
  Other: '#8b949e',
};

export function computeLanguageBreakdown(
  rawLanguages?: Record<string, number>,
  fallbackLang?: string | null
): LanguageItem[] {
  if (rawLanguages && Object.keys(rawLanguages).length > 0) {
    const totalBytes = Object.values(rawLanguages).reduce((a, b) => a + b, 0);
    if (totalBytes > 0) {
      const sortedEntries = Object.entries(rawLanguages)
        .sort(([, a], [, b]) => b - a);

      const items: LanguageItem[] = [];
      let accountedPct = 0;

      for (let i = 0; i < sortedEntries.length; i++) {
        const [langName, bytes] = sortedEntries[i];
        const pct = Math.round((bytes / totalBytes) * 1000) / 10;

        if (i >= 4 && sortedEntries.length > 5) {
          const remainingBytes = sortedEntries.slice(i).reduce((acc, [, b]) => acc + b, 0);
          const remainingPct = Math.max(0.1, Math.round((100 - accountedPct) * 10) / 10);
          items.push({
            name: 'Other',
            percentage: remainingPct,
            color: '#8b949e',
            bytes: remainingBytes,
          });
          break;
        }

        if (pct > 0) {
          items.push({
            name: langName,
            percentage: pct,
            color: GITHUB_LANGUAGE_COLORS[langName] || '#58a6ff',
            bytes,
          });
          accountedPct += pct;
        }
      }
      return items;
    }
  }

  if (fallbackLang) {
    return [
      {
        name: fallbackLang,
        percentage: 100,
        color: GITHUB_LANGUAGE_COLORS[fallbackLang] || '#58a6ff',
        bytes: 1,
      },
    ];
  }

  return [];
}

export class GitHubApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

let latestRateLimit: RateLimitInfo = {
  limit: 5000,
  remaining: 5000,
  reset: Math.floor(Date.now() / 1000) + 3600,
};

export function getRateLimitInfo(): RateLimitInfo {
  return latestRateLimit;
}

function updateRateLimits(headers: Headers) {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  const reset = headers.get('x-ratelimit-reset');

  if (limit && remaining && reset) {
    latestRateLimit = {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
    };
  }
}

async function githubFetch(endpoint: string, token: string): Promise<any> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `https://api.github.com/${cleanEndpoint}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token.trim()}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  updateRateLimits(res.headers);

  if (res.status === 404 || res.status === 403) {
    const errorBody = await res.json().catch(() => ({}));
    throw new GitHubApiError(res.status, errorBody.message || 'Forbidden or Not Found');
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new GitHubApiError(res.status, errorBody.message || `GitHub API error: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch all repositories accessible to the user (personal + orgs)
 */
export async function fetchUserRepositories(token: string): Promise<Repository[]> {
  const repos: Repository[] = [];
  let page = 1;
  const perPage = 100;

  while (page <= 3) { // Fetch up to 300 repos to prevent excessive API consumption
    const url = `user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`;
    try {
      const pageRepos: Repository[] = await githubFetch(url, token);
      if (!pageRepos || pageRepos.length === 0) break;
      repos.push(...pageRepos);
      if (pageRepos.length < perPage) break;
      page++;
    } catch (err) {
      if (page === 1) throw err;
      break;
    }
  }

  return repos;
}

/**
 * Detect whether Dependabot, CodeQL, and Pages are enabled for a repository
 */
export async function detectRepositoryFeatures(owner: string, repo: string, token: string): Promise<RepoFeatures> {
  const features: RepoFeatures = {
    dependabot_enabled: false,
    code_scanning_enabled: false,
    pages_enabled: false,
    pages_status: 'disabled',
  };

  // 1. Check Dependabot
  try {
    await githubFetch(`repos/${owner}/${repo}/dependabot/alerts?per_page=1`, token);
    features.dependabot_enabled = true;
  } catch (err: any) {
    // 404/403 means dependabot is disabled or inaccessible
    features.dependabot_enabled = false;
  }

  // 2. Check Code Scanning (CodeQL)
  try {
    await githubFetch(`repos/${owner}/${repo}/code-scanning/alerts?per_page=1`, token);
    features.code_scanning_enabled = true;
  } catch (err: any) {
    features.code_scanning_enabled = false;
  }

  // 3. Check Pages
  try {
    const pagesInfo = await githubFetch(`repos/${owner}/${repo}/pages`, token);
    features.pages_enabled = true;
    features.pages_url = pagesInfo.html_url;
    features.pages_status = pagesInfo.status === 'built' ? 'built' : pagesInfo.status === 'building' ? 'building' : 'errored';
  } catch (err: any) {
    features.pages_enabled = false;
    features.pages_status = 'disabled';
  }

  // 4. If Pages is enabled, fetch latest workflow run for pages deployment
  if (features.pages_enabled) {
    try {
      const runsData = await githubFetch(`repos/${owner}/${repo}/actions/runs?per_page=1`, token);
      if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
        const run = runsData.workflow_runs[0];
        features.last_pages_run = {
          id: run.id,
          name: run.name,
          conclusion: run.conclusion,
          status: run.status,
          html_url: run.html_url,
          updated_at: run.updated_at,
        };
        if (run.conclusion === 'failure') {
          features.pages_status = 'errored';
        } else if (run.status === 'in_progress' || run.status === 'queued') {
          features.pages_status = 'building';
        } else if (run.conclusion === 'success') {
          features.pages_status = 'built';
        }
      }
    } catch {
      // Ignored if actions runs cannot be queried
    }
  }

  return features;
}

/**
 * Fetch all open Dependabot alerts for a repo
 */
export async function fetchDependabotAlerts(owner: string, repo: string, token: string): Promise<DependabotAlert[]> {
  try {
    return await githubFetch(`repos/${owner}/${repo}/dependabot/alerts?state=open&per_page=50&sort=created&direction=desc`, token);
  } catch {
    return [];
  }
}

/**
 * Fetch all open Code Scanning / CodeQL alerts for a repo
 */
export async function fetchCodeScanningAlerts(owner: string, repo: string, token: string): Promise<CodeScanningAlert[]> {
  try {
    return await githubFetch(`repos/${owner}/${repo}/code-scanning/alerts?state=open&per_page=50&sort=created&direction=desc`, token);
  } catch {
    return [];
  }
}

/**
 * Fetch language breakdown in bytes for a repository
 */
export async function fetchRepositoryLanguages(owner: string, repo: string, token: string): Promise<Record<string, number>> {
  try {
    return await githubFetch(`repos/${owner}/${repo}/languages`, token);
  } catch {
    return {};
  }
}

/**
 * Scan a single repository completely and build its health summary
 */
export async function scanRepositoryHealth(repo: Repository, token: string): Promise<RepoHealthSummary> {
  const [owner, name] = repo.full_name.split('/');
  const features = await detectRepositoryFeatures(owner, name, token);

  let dependabotAlerts: DependabotAlert[] = [];
  if (features.dependabot_enabled) {
    dependabotAlerts = await fetchDependabotAlerts(owner, name, token);
  }

  let codeScanningAlerts: CodeScanningAlert[] = [];
  if (features.code_scanning_enabled) {
    codeScanningAlerts = await fetchCodeScanningAlerts(owner, name, token);
  }

  // Fetch languages breakdown
  let rawLanguages = repo.languages;
  if (!rawLanguages || Object.keys(rawLanguages).length === 0) {
    rawLanguages = await fetchRepositoryLanguages(owner, name, token);
  }
  const languages = computeLanguageBreakdown(rawLanguages, repo.language);

  const criticalCount = dependabotAlerts.filter(a => a.security_advisory?.severity === 'critical').length;
  const highCount = dependabotAlerts.filter(a => a.security_advisory?.severity === 'high').length;
  const mediumCount = dependabotAlerts.filter(a => a.security_advisory?.severity === 'medium').length;
  const lowCount = dependabotAlerts.filter(a => a.security_advisory?.severity === 'low').length;

  const codeScanningErrorCount = codeScanningAlerts.filter(a => a.rule?.severity === 'error').length;
  const codeScanningWarningCount = codeScanningAlerts.filter(a => a.rule?.severity === 'warning').length;

  let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (criticalCount > 0 || codeScanningErrorCount > 0 || features.pages_status === 'errored') {
    healthStatus = 'critical';
  } else if (highCount > 0 || mediumCount > 0 || codeScanningWarningCount > 0) {
    healthStatus = 'warning';
  }

  return {
    repo,
    features,
    dependabot_alerts: dependabotAlerts,
    code_scanning_alerts: codeScanningAlerts,
    critical_count: criticalCount,
    high_count: highCount,
    medium_count: mediumCount,
    low_count: lowCount,
    code_scanning_error_count: codeScanningErrorCount,
    code_scanning_warning_count: codeScanningWarningCount,
    pages_status: features.pages_status || 'disabled',
    health_status: healthStatus,
    languages,
    primary_language: languages[0]?.name || repo.language || null,
    last_scanned: new Date().toISOString(),
  };
}
