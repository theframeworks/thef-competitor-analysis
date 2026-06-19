import type { CreateProjectInput, Project, ProjectSummary } from '../types/project.js';
import { getGitHubConfig } from './config.js';

interface GitHubContentItem {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
  content?: string;
  encoding?: 'base64';
}

interface GitHubContentResponse {
  content: GitHubContentItem;
}

export class GitHubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GitHubApiError';
    this.status = status;
  }
}

function decodeContent(content: string): string {
  return Buffer.from(content, 'base64').toString('utf8');
}

function encodeContent(content: string): string {
  return Buffer.from(content, 'utf8').toString('base64');
}

function projectFilePath(dataPath: string, id: string): string {
  return `${dataPath.replace(/\/$/, '')}/${id}.json`;
}

function projectIdFromName(filename: string): string | null {
  if (!filename.endsWith('.json')) {
    return null;
  }
  return filename.slice(0, -'.json'.length);
}

async function githubRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const config = getGitHubConfig();
  const url = `https://api.github.com/repos/${config.repo}/contents/${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${config.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) {
        detail = body.message;
      }
    } catch {
      // ignore parse errors
    }

    if (response.status === 401 || response.status === 403) {
      throw new GitHubApiError(
        'GitHub authentication failed. Check GITHUB_TOKEN permissions.',
        response.status,
      );
    }

    throw new GitHubApiError(`GitHub API error: ${detail}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function readProjectFile(id: string): Promise<{ project: Project; sha: string }> {
  const config = getGitHubConfig();
  const path = projectFilePath(config.dataPath, id);

  try {
    const item = await githubRequest<GitHubContentItem>(path);
    if (!item.content) {
      throw new GitHubApiError(`Project file "${id}" has no content.`, 500);
    }

    const project = JSON.parse(decodeContent(item.content)) as Project;
    return { project, sha: item.sha };
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 404) {
      throw new GitHubApiError(`Project "${id}" not found.`, 404);
    }
    throw err;
  }
}

export async function listProjects(): Promise<ProjectSummary[]> {
  const config = getGitHubConfig();

  let items: GitHubContentItem[];
  try {
    items = await githubRequest<GitHubContentItem[]>(config.dataPath);
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 404) {
      return [];
    }
    throw err;
  }

  const summaries: ProjectSummary[] = [];

  for (const item of items) {
    if (item.type !== 'file') {
      continue;
    }

    const id = projectIdFromName(item.name);
    if (!id) {
      continue;
    }

    try {
      const { project } = await readProjectFile(id);
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
  const { project } = await readProjectFile(id);
  return project;
}

export async function createProject(
  id: string,
  input: CreateProjectInput,
): Promise<Project> {
  const config = getGitHubConfig();
  const now = new Date().toISOString();
  const project: Project = {
    id,
    ...input,
    createdAt: now,
    updatedAt: now,
  };

  const path = projectFilePath(config.dataPath, id);
  const message = `Save bookmark: ${project.name} [skip ci]`;

  try {
    await githubRequest<GitHubContentResponse>(path, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: encodeContent(JSON.stringify(project, null, 2)),
      }),
    });
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 422) {
      throw new GitHubApiError(`Project "${id}" already exists.`, 409);
    }
    throw err;
  }

  return project;
}

export async function deleteProject(id: string): Promise<void> {
  const config = getGitHubConfig();
  const path = projectFilePath(config.dataPath, id);
  const { project, sha } = await readProjectFile(id);
  const message = `Delete bookmark: ${project.name} [skip ci]`;

  await githubRequest(path, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha }),
  });
}

export async function updateProject(project: Project): Promise<Project> {
  const config = getGitHubConfig();
  const path = projectFilePath(config.dataPath, project.id);
  const message = `Refresh bookmark: ${project.name} [skip ci]`;
  const content = encodeContent(
    JSON.stringify(
      {
        ...project,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  const attemptUpdate = async (sha: string): Promise<Project> => {
    await githubRequest<GitHubContentResponse>(path, {
      method: 'PUT',
      body: JSON.stringify({ message, content, sha }),
    });

    return {
      ...project,
      updatedAt: new Date().toISOString(),
    };
  };

  const { sha } = await readProjectFile(project.id);

  try {
    return await attemptUpdate(sha);
  } catch (err) {
    if (err instanceof GitHubApiError && err.status === 409) {
      const { sha: latestSha } = await readProjectFile(project.id);
      return attemptUpdate(latestSha);
    }
    throw err;
  }
}
