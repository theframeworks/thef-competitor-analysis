import { Router } from 'express';
import { GitHubConfigError } from '../github/config.js';
import {
  GitHubApiError,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
} from '../storage/index.js';
import type { CreateProjectInput, Project, UpdateProjectInput } from '../types/project.js';
import { generateProjectId } from '../utils/slugify.js';

export const projectsRouter = Router();

function handleGitHubError(err: unknown, res: import('express').Response): boolean {
  if (err instanceof GitHubConfigError) {
    res.status(503).json({ error: err.message });
    return true;
  }

  if (err instanceof GitHubApiError) {
    const status = err.status === 404 ? 404 : err.status >= 500 ? 502 : err.status;
    res.status(status).json({ error: err.message });
    return true;
  }

  return false;
}

function isCreateProjectInput(body: unknown): body is CreateProjectInput {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const value = body as Record<string, unknown>;
  return (
    typeof value.name === 'string' &&
    typeof value.anchorName === 'string' &&
    Array.isArray(value.brands) &&
    Array.isArray(value.opportunities) &&
    (value.crossThemes === null || typeof value.crossThemes === 'object')
  );
}

function isUpdateProjectInput(body: unknown): body is UpdateProjectInput {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const value = body as Record<string, unknown>;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.anchorName === 'string' &&
    Array.isArray(value.brands) &&
    Array.isArray(value.opportunities) &&
    (value.crossThemes === null || typeof value.crossThemes === 'object')
  );
}

projectsRouter.get('/', async (_req, res) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (err) {
    if (!handleGitHubError(err, res)) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
});

projectsRouter.get('/:id', async (req, res) => {
  try {
    const project = await getProject(req.params.id);
    res.json(project);
  } catch (err) {
    if (!handleGitHubError(err, res)) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
});

projectsRouter.post('/', async (req, res) => {
  if (!isCreateProjectInput(req.body)) {
    res.status(400).json({
      error:
        'Invalid body. Expected name, anchorName, brands, opportunities, and crossThemes.',
    });
    return;
  }

  try {
    const id = generateProjectId(req.body.anchorName, req.body.name);
    const project = await createProject(id, req.body);
    res.status(201).json(project);
  } catch (err) {
    if (!handleGitHubError(err, res)) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
});

projectsRouter.delete('/:id', async (req, res) => {
  try {
    await deleteProject(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (!handleGitHubError(err, res)) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
});

projectsRouter.put('/:id', async (req, res) => {
  if (!isUpdateProjectInput(req.body)) {
    res.status(400).json({
      error:
        'Invalid body. Expected id, name, anchorName, brands, opportunities, and crossThemes.',
    });
    return;
  }

  if (req.body.id !== req.params.id) {
    res.status(400).json({ error: 'Body id must match URL id.' });
    return;
  }

  try {
    const existing = await getProject(req.params.id);
    const project: Project = {
      ...req.body,
      createdAt: req.body.createdAt ?? existing.createdAt,
      updatedAt: existing.updatedAt,
    };

    const updated = await updateProject(project);
    res.json(updated);
  } catch (err) {
    if (!handleGitHubError(err, res)) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
});
