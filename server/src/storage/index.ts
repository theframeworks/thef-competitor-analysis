import * as github from '../github/storage.js';
import * as local from '../local/storage.js';
import * as postgres from '../postgres/storage.js';
import { getStorageMode } from './mode.js';

export { GitHubApiError } from '../github/storage.js';
export { GitHubConfigError } from '../github/config.js';
export { getStorageMode, describeStorageMode } from './mode.js';

function backend() {
  const mode = getStorageMode();
  if (mode === 'local') return local;
  if (mode === 'postgres') return postgres;
  return github;
}

export const listProjects = (...args: Parameters<typeof github.listProjects>) =>
  backend().listProjects(...args);

export const getProject = (...args: Parameters<typeof github.getProject>) =>
  backend().getProject(...args);

export const createProject = (...args: Parameters<typeof github.createProject>) =>
  backend().createProject(...args);

export const deleteProject = (...args: Parameters<typeof github.deleteProject>) =>
  backend().deleteProject(...args);

export const updateProject = (...args: Parameters<typeof github.updateProject>) =>
  backend().updateProject(...args);
