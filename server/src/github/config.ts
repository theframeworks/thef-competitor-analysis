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
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const dataPath = process.env.GITHUB_DATA_PATH?.trim() || 'data/projects';

  if (!token) {
    throw new GitHubConfigError('Server not configured: missing GITHUB_TOKEN.');
  }
  if (!repo || !repo.includes('/')) {
    throw new GitHubConfigError('Server not configured: GITHUB_REPO must be owner/repo.');
  }

  return { token, repo, dataPath };
}
