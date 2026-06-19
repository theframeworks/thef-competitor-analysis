import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { getStorageMode } from '../src/storage/mode.js';

describe('getStorageMode', () => {
  const keys = ['NODE_ENV', 'GITHUB_TOKEN', 'BOOKMARK_STORAGE'] as const;
  const previous: Record<(typeof keys)[number], string | undefined> = {
    NODE_ENV: process.env.NODE_ENV,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    BOOKMARK_STORAGE: process.env.BOOKMARK_STORAGE,
  };

  afterEach(() => {
    for (const key of keys) {
      if (previous[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous[key];
      }
    }
  });

  it('respects BOOKMARK_STORAGE=local override', () => {
    process.env.BOOKMARK_STORAGE = 'local';
    assert.equal(getStorageMode(), 'local');
  });

  it('respects BOOKMARK_STORAGE=github override', () => {
    process.env.BOOKMARK_STORAGE = 'github';
    assert.equal(getStorageMode(), 'github');
  });

  it('uses github storage in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.BOOKMARK_STORAGE;
    assert.equal(getStorageMode(), 'github');
  });
});
