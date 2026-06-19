/** Parse owner/repo from common GitHub remote URL formats. */
export function parseGitHubRemoteUrl(remote: string): string | null {
  const trimmed = remote.trim();
  if (!trimmed) return null;

  const sshUrl = trimmed.match(/^ssh:\/\/git@[^/]+\/(.+?)(?:\.git)?$/i);
  if (sshUrl) return normalizeRepoPath(sshUrl[1]);

  const scpStyle = trimmed.match(/^git@[^:]+:(.+?)(?:\.git)?$/i);
  if (scpStyle) return normalizeRepoPath(scpStyle[1]);

  try {
    const url = new URL(trimmed);
    const segments = url.pathname.replace(/^\/+/, '').replace(/\.git$/, '').split('/');
    if (segments.length >= 2 && segments[0] && segments[1]) {
      return `${segments[0]}/${segments[1]}`;
    }
  } catch {
    // Not a URL — fall through.
  }

  return null;
}

function normalizeRepoPath(path: string): string | null {
  const cleaned = path.replace(/^\/+/, '').replace(/\.git$/, '');
  return cleaned.includes('/') ? cleaned : null;
}
