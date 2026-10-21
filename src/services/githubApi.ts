import {
  CodeScanningAlert,
  DependabotAlert,
  LanguageItem,
  PullRequestAlert,
  RepoFeatures,
  RepoHealthSummary,
  Repository,
} from '../types';

export const GITHUB_LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  SCSS: '#c6538c',
  Sass: '#a53b70',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Shell: '#89e051',
  Bash: '#89e051',
  Batchfile: '#C1F12E',
  PowerShell: '#012456',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  'Jupyter Notebook': '#DA5B0B',
  Dockerfile: '#384d54',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Lua: '#000080',
  R: '#198CE7',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Zig: '#ec915c',
  Perl: '#0298c3',
  SQL: '#e38c00',
  PLpgSQL: '#336790',
  Assembly: '#6E4C13',
  TeX: '#3D6117',
  LaTeX: '#3D6117',
  Markdown: '#083fa1',
  JSON: '#292929',
  YAML: '#cb171e',
  Makefile: '#427819',
  CMake: '#DA3434',
  Solidity: '#AA6746',
  GraphQL: '#e10098',
  Clojure: '#db5855',
  Erlang: '#B83998',
  OCaml: '#ef7a08',
  F: '#b845fc',
  'F#': '#b845fc',
  Vim: '#199f4b',
  'Vim Script': '#199f4b',
  Other: '#8b949e',
};

/**
 * Returns a standardized, consistent color for any programming language.
 * Always returns the exact same color for a language everywhere across the app.
 */
export function getLanguageColor(language?: string | null): string {
  if (!language) return '#8b949e';
  if (GITHUB_LANGUAGE_COLORS[language]) {
    return GITHUB_LANGUAGE_COLORS[language];
  }
  // Deterministic color generation based on string hash for unlisted languages
  let hash = 0;
  for (let i = 0; i < language.length; i++) {
    hash = language.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 68%, 52%)`;
}

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

        if (i >= 5 && sortedEntries.length > 6) {
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
            color: getLanguageColor(langName),
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
        color: getLanguageColor(fallbackLang),
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

async function githubFetch(endpoint: string, token: string, retries: number = 1): Promise<any> {
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

  if (res.status === 429 && retries > 0) {
    await new Promise((r) => setTimeout(r, 1200));
    return githubFetch(endpoint, token, retries - 1);
  }

  if (res.status === 404 || res.status === 403) {
    const errorBody = await res.json().catch(() => ({}));
    if (
      res.status === 403 &&
      typeof errorBody.message === 'string' &&
      errorBody.message.toLowerCase().includes('secondary rate limit') &&
      retries > 0
    ) {
      await new Promise((r) => setTimeout(r, 1800));
      return githubFetch(endpoint, token, retries - 1);
    }
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
 * Fetch language breakdown in bytes for a repository.
 * Attempts authenticated fetch first, then falls back to public fetch
 * to ensure languages always load and never get blocked.
 */
export async function fetchRepositoryLanguages(
  owner: string,
  repo: string,
  token?: string
): Promise<Record<string, number>> {
  if (token) {
    try {
      const data = await githubFetch(`repos/${owner}/${repo}/languages`, token);
      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        return data;
      }
    } catch {
      // Continue to public endpoint fallback
    }
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Ignore fallback failure
  }

  return {};
}

/**
 * Fetch open pull requests for a repository
 */
export async function fetchOpenPullRequests(owner: string, repo: string, token: string): Promise<PullRequestAlert[]> {
  try {
    const rawPulls = await githubFetch(`repos/${owner}/${repo}/pulls?state=open&per_page=30&sort=updated&direction=desc`, token);
    if (!Array.isArray(rawPulls)) return [];

    return rawPulls.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      state: pr.state,
      draft: !!pr.draft,
      html_url: pr.html_url,
      created_at: pr.created_at,
      updated_at: pr.updated_at,
      user: {
        login: pr.user?.login || 'unknown',
        avatar_url: pr.user?.avatar_url || '',
        type: pr.user?.type || (pr.user?.login?.includes('[bot]') ? 'Bot' : 'User'),
      },
      head: {
        ref: pr.head?.ref || '',
        label: pr.head?.label || '',
      },
      base: {
        ref: pr.base?.ref || '',
      },
      labels: Array.isArray(pr.labels)
        ? pr.labels.map((l: any) => ({ id: l.id, name: l.name, color: l.color }))
        : [],
      mergeable_state: pr.mergeable_state || 'unknown',
      has_conflicts: pr.mergeable === false || pr.mergeable_state === 'dirty',
    }));
  } catch {
    return [];
  }
}

/**
 * Scan a single repository completely and build its health summary.
 * Efficiently combines alert fetching with presence detection to minimize
 * GitHub API calls and prevent secondary rate-limiting.
 */
export async function scanRepositoryHealth(repo: Repository, token: string): Promise<RepoHealthSummary> {
  const [owner, name] = repo.full_name.split('/');

  const features: RepoFeatures = {
    dependabot_enabled: false,
    code_scanning_enabled: false,
    pages_enabled: false,
    pages_status: 'disabled',
  };

  // 1. Fetch Dependabot alerts (1 API call detects presence AND retrieves open CVEs)
  let dependabotAlerts: DependabotAlert[] = [];
  try {
    const alerts = await githubFetch(
      `repos/${owner}/${name}/dependabot/alerts?state=open&per_page=50&sort=created&direction=desc`,
      token
    );
    if (Array.isArray(alerts)) {
      features.dependabot_enabled = true;
      dependabotAlerts = alerts;
    }
  } catch {
    features.dependabot_enabled = false;
  }

  // 2. Fetch Code Scanning / CodeQL alerts (1 API call detects presence AND retrieves open flaws)
  let codeScanningAlerts: CodeScanningAlert[] = [];
  try {
    const alerts = await githubFetch(
      `repos/${owner}/${name}/code-scanning/alerts?state=open&per_page=50&sort=created&direction=desc`,
      token
    );
    if (Array.isArray(alerts)) {
      features.code_scanning_enabled = true;
      codeScanningAlerts = alerts;
    }
  } catch {
    features.code_scanning_enabled = false;
  }

  // 3. GitHub Pages: only query if repository actually indicates pages presence
  if (repo.has_pages !== false) {
    try {
      const pagesInfo = await githubFetch(`repos/${owner}/${name}/pages`, token);
      if (pagesInfo && (pagesInfo.status || pagesInfo.html_url)) {
        features.pages_enabled = true;
        features.pages_url = pagesInfo.html_url;
        features.pages_status =
          pagesInfo.status === 'built'
            ? 'built'
            : pagesInfo.status === 'building'
            ? 'building'
            : 'errored';

        try {
          const runsData = await githubFetch(`repos/${owner}/${name}/actions/runs?per_page=1`, token);
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
          // Workflow query optional
        }
      }
    } catch {
      features.pages_enabled = false;
      features.pages_status = 'disabled';
    }
  }

  // 4. Fetch open pull requests
  let pullRequests: PullRequestAlert[] = [];
  try {
    pullRequests = await fetchOpenPullRequests(owner, name, token);
  } catch {
    // continue
  }

  // 5. Fetch languages breakdown
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

  const openPrCount = pullRequests.length;
  const hasPrConflicts = pullRequests.some(pr => pr.has_conflicts);

  let healthStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (criticalCount > 0 || codeScanningErrorCount > 0 || features.pages_status === 'errored') {
    healthStatus = 'critical';
  } else if (highCount > 0 || mediumCount > 0 || codeScanningWarningCount > 0 || hasPrConflicts) {
    healthStatus = 'warning';
  }

  return {
    repo,
    features,
    dependabot_alerts: dependabotAlerts,
    code_scanning_alerts: codeScanningAlerts,
    pull_requests: pullRequests,
    critical_count: criticalCount,
    high_count: highCount,
    medium_count: mediumCount,
    low_count: lowCount,
    code_scanning_error_count: codeScanningErrorCount,
    code_scanning_warning_count: codeScanningWarningCount,
    open_pr_count: openPrCount,
    has_pr_conflicts: hasPrConflicts,
    pages_status: features.pages_status || 'disabled',
    health_status: healthStatus,
    languages,
    primary_language: languages[0]?.name || repo.language || null,
    last_scanned: new Date().toISOString(),
  };
}
