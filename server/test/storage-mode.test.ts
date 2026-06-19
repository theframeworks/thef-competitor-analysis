import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import { getStorageMode } from '../src/storage/mode.js';

describe('getStorageMode', () => {
  const keys = ['NODE_ENV', 'GITHUB_TOKEN', 'BOOKMARK_STORAGE', 'DATABASE_URL'] as const;
  const previous: Record<(typeof keys)[number], string | undefined> = {
    NODE_ENV: process.env.NODE_ENV,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    BOOKMARK_STORAGE: process.env.BOOKMARK_STORAGE,
    DATABASE_URL: process.env.DATABASE_URL,
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

  it('respects BOOKMARK_STORAGE=postgres override', () => {
    process.env.BOOKMARK_STORAGE = 'postgres';
    assert.equal(getStorageMode(), 'postgres');
  });

  it('uses postgres storage when DATABASE_URL is set', () => {
    delete process.env.BOOKMARK_STORAGE;
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
    assert.equal(getStorageMode(), 'postgres');
  });

  it('uses postgres storage in production', () => {
    process.env.NODE_ENV = 'production';
    delete process.env.BOOKMARK_STORAGE;
    delete process.env.DATABASE_URL;
    assert.equal(getStorageMode(), 'postgres');
  });
});
