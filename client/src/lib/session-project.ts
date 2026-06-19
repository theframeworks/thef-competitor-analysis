import type { Project } from "../types/domain";

const SESSION_KEY = "cim-session-project";

export function saveSessionProject(project: Project) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(project));
}

export function loadSessionProject(): Project | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Project;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function clearSessionProject() {
  sessionStorage.removeItem(SESSION_KEY);
}
