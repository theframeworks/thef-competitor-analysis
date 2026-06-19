import { resolveGitHubToken } from '../github/detect-github-token.js';

export type StorageMode = 'github' | 'local';

export function getStorageMode(): StorageMode {
  const override = process.env.BOOKMARK_STORAGE?.trim().toLowerCase();
  if (override === 'local') return 'local';
  if (override === 'github') return 'github';

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) return 'github';

  return resolveGitHubToken() ? 'github' : 'local';
}
