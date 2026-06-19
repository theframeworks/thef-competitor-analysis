import { execSync } from 'node:child_process';

/** Resolve a GitHub PAT from GITHUB_TOKEN or the GitHub CLI (`gh auth token`). */
export function resolveGitHubToken(): string | null {
  const fromEnv = process.env.GITHUB_TOKEN?.trim();
  if (fromEnv) return fromEnv;

  try {
    const token = execSync('gh auth token', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return token || null;
  } catch {
    return null;
  }
}
