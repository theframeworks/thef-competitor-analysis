import fs from 'node:fs/promises';
import path from 'node:path';
import { GitHubApiError } from '../github/storage.js';
import type { CreateProjectInput, Project, ProjectSummary } from '../types/project.js';
import { resolveDataDir } from '../paths.js';

function dataPath(): string {
  return process.env.GITHUB_DATA_PATH?.trim() || 'data/projects';
}

function projectFilePath(id: string): string {
  return path.join(resolveDataDir(dataPath()), `${id}.json`);
}

function projectIdFromName(filename: string): string | null {
  if (!filename.endsWith('.json')) return null;
  return filename.slice(0, -'.json'.length);
}

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(resolveDataDir(dataPath()), { recursive: true });
}

async function readProjectFile(id: string): Promise<Project> {
  try {
    const raw = await fs.readFile(projectFilePath(id), 'utf8');
    return JSON.parse(raw) as Project;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new GitHubApiError(`Project "${id}" not found.`, 404);
    }
    throw err;
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const dir = resolveDataDir(dataPath());
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }

  const summaries: ProjectSummary[] = [];

  for (const name of entries) {
    const id = projectIdFromName(name);
    if (!id) continue;

    try {
      const project = await readProjectFile(id);
      summaries.push({
        id: project.id,
        name: project.name,
        anchorName: project.anchorName,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      });
    } catch {
      // skip unreadable files
    }
  }

  summaries.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );

  return summaries;
}

export async function getProject(id: string): Promise<Project> {
  return readProjectFile(id);
}

export async function createProject(
  id: string,
  input: CreateProjectInput,
): Promise<Project> {
  await ensureDataDir();
  const now = new Date().toISOString();
  const project: Project = {
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await fs.writeFile(
      projectFilePath(id),
      JSON.stringify(project, null, 2),
      { encoding: 'utf8', flag: 'wx' },
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new GitHubApiError(`Project "${id}" already exists.`, 409);
    }
    throw err;
  }

  return project;
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await fs.unlink(projectFilePath(id));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new GitHubApiError(`Project "${id}" not found.`, 404);
    }
    throw err;
  }
}

export async function updateProject(project: Project): Promise<Project> {
  await ensureDataDir();
  const updated: Project = {
    ...project,
    updatedAt: new Date().toISOString(),
  };

  try {
    await fs.writeFile(projectFilePath(project.id), JSON.stringify(updated, null, 2));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new GitHubApiError(`Project "${project.id}" not found.`, 404);
    }
    throw err;
  }

  return updated;
}
