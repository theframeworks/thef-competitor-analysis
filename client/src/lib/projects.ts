import type { Project, ProjectSummary } from "../types/domain";

interface ApiErrorBody {
  error?: string;
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody;
    if (body.error) return body.error;
  } catch {
    // ignore
  }
  return `Request failed (${res.status})`;
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return (await res.json()) as T;
}

export function listProjects(): Promise<ProjectSummary[]> {
  return apiJson<ProjectSummary[]>("/api/projects");
}

export function getProject(id: string): Promise<Project> {
  return apiJson<Project>(`/api/projects/${encodeURIComponent(id)}`);
}

export function createProject(
  input: Omit<Project, "id" | "createdAt" | "updatedAt">,
): Promise<Project> {
  return apiJson<Project>("/api/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProject(
  project: Project & { id: string },
): Promise<Project> {
  return apiJson<Project>(`/api/projects/${encodeURIComponent(project.id)}`, {
    method: "PUT",
    body: JSON.stringify(project),
  });
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
}
