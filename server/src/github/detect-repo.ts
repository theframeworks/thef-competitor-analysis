import { execSync } from 'node:child_process';
import { repoRoot } from '../paths.js';
import { parseGitHubRemoteUrl } from './parse-remote.js';

/** Resolve owner/repo from `git remote get-url origin` when GITHUB_REPO is unset. */
export function detectGitHubRepo(cwd: string = repoRoot): string | null {
  try {
    const remote = execSync('git remote get-url origin', {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    return parseGitHubRemoteUrl(remote);
  } catch {
    return null;
  }
}
