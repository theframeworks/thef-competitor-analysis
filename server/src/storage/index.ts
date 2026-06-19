import * as github from '../github/storage.js';
import * as local from '../local/storage.js';
import { getStorageMode } from './mode.js';

export { GitHubApiError } from '../github/storage.js';
export { GitHubConfigError } from '../github/config.js';
export { getStorageMode } from './mode.js';

function backend() {
  return getStorageMode() === 'local' ? local : github;
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
