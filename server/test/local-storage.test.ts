import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../src/local/storage.js';

describe('local bookmark storage', () => {
  let tempDir: string;
  const previousDataPath = process.env.GITHUB_DATA_PATH;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bookmark-local-'));
    process.env.GITHUB_DATA_PATH = tempDir;
  });

  afterEach(async () => {
    process.env.GITHUB_DATA_PATH = previousDataPath;
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('creates, lists, updates, and deletes projects on disk', async () => {
    const input = {
      name: 'Local bookmark',
      anchorName: 'Acme',
      brands: [],
      opportunities: [],
      crossThemes: null,
    };

    const created = await createProject('acme-local-abcd1234', input);
    assert.equal(created.name, 'Local bookmark');

    const listed = await listProjects();
    assert.equal(listed.length, 1);
    assert.equal(listed[0]?.id, 'acme-local-abcd1234');

    const loaded = await getProject('acme-local-abcd1234');
    assert.equal(loaded.anchorName, 'Acme');

    const updated = await updateProject({ ...loaded, name: 'Updated local bookmark' });
    assert.equal(updated.name, 'Updated local bookmark');

    await deleteProject('acme-local-abcd1234');
    const afterDelete = await listProjects();
    assert.equal(afterDelete.length, 0);
  });
});
