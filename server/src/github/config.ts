import { detectGitHubRepo } from './detect-repo.js';
import { resolveGitHubToken } from './detect-github-token.js';

export interface GitHubConfig {
  token: string;
  repo: string;
  dataPath: string;
}

export class GitHubConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubConfigError';
  }
}

export function getGitHubConfig(): GitHubConfig {
  const token = resolveGitHubToken();
  const repo = process.env.GITHUB_REPO?.trim() || detectGitHubRepo() || '';
  const dataPath = process.env.GITHUB_DATA_PATH?.trim() || 'data/projects';

  if (!token) {
    throw new GitHubConfigError(
      'Server not configured: set GITHUB_TOKEN, run `gh auth login`, or use local bookmark storage in development.',
    );
  }
  if (!repo || !repo.includes('/')) {
    throw new GitHubConfigError(
      'Server not configured: set GITHUB_REPO to owner/repo or run from a git checkout with origin configured.',
    );
  }

  return { token, repo, dataPath };
}
