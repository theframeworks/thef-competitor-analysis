import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectGitHubRepo } from '../src/github/detect-repo.js';
import { parseGitHubRemoteUrl } from '../src/github/parse-remote.js';

describe('parseGitHubRemoteUrl', () => {
  it('parses ssh:// URLs', () => {
    assert.equal(
      parseGitHubRemoteUrl('ssh://git@github.com/theframeworks/thef-competitor-analysis.git'),
      'theframeworks/thef-competitor-analysis',
    );
  });

  it('parses git@host:path URLs', () => {
    assert.equal(
      parseGitHubRemoteUrl('git@github.com:owner/repo.git'),
      'owner/repo',
    );
  });

  it('parses https URLs', () => {
    assert.equal(
      parseGitHubRemoteUrl('https://github.com/owner/repo'),
      'owner/repo',
    );
  });

  it('returns null for invalid remotes', () => {
    assert.equal(parseGitHubRemoteUrl('not-a-remote'), null);
  });
});

describe('detectGitHubRepo', () => {
  it('detects owner/repo from origin in this checkout', () => {
    assert.equal(detectGitHubRepo(), 'theframeworks/thef-competitor-analysis');
  });
});
