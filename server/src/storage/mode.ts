import { resolveGitHubToken } from '../github/detect-github-token.js';

export type StorageMode = 'postgres' | 'github' | 'local';

export function getStorageMode(): StorageMode {
  const override = process.env.BOOKMARK_STORAGE?.trim().toLowerCase();
  if (override === 'local') return 'local';
  if (override === 'github') return 'github';
  if (override === 'postgres') return 'postgres';

  if (process.env.DATABASE_URL?.trim()) {
    return 'postgres';
  }

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) return 'postgres';

  return resolveGitHubToken() ? 'github' : 'local';
}

export function describeStorageMode(mode: StorageMode): string {
  switch (mode) {
    case 'postgres':
      return 'PostgreSQL (DATABASE_URL)';
    case 'github':
      return 'GitHub Contents API';
    case 'local':
      return 'local files (data/projects/)';
  }
}
