import { useCallback, useEffect, useState } from "react";
import { useAppRouter } from "../hooks/useAppRouter";
import {
  createProject,
  getProject,
  updateProject as saveProject,
} from "../lib/projects";
import { navigateTo, type parsePath, pathForRoute } from "../lib/routes";
import {
  clearSessionProject,
  loadSessionProject,
  saveSessionProject,
} from "../lib/session-project";
import type { Project } from "../types/domain";
import { BookmarkLibrary } from "./BookmarkLibrary";
import { Dashboard } from "./Dashboard";
import { SaveBookmarkPrompt } from "./SaveBookmarkPrompt";
import { SetupScreen } from "./SetupScreen";
import { Toast } from "./shared/Toast";

type AppView = "library" | "setup" | "dashboard";

export function Root() {
  const [view, setView] = useState<AppView>("library");
  const [project, setProject] = useState<Project | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isSaved = Boolean(project?.id);

  const applyRoute = useCallback(
    async (route: ReturnType<typeof parsePath>) => {
      switch (route.name) {
        case "library":
          setView("library");
          setProject(null);
          setShowSavePrompt(false);
          return;
        case "setup":
          setView("setup");
          setProject(null);
          setShowSavePrompt(false);
          return;
        case "session": {
          const sessionProject = loadSessionProject();
          if (!sessionProject) {
            navigateTo("/");
            setView("library");
            setProject(null);
            setShowSavePrompt(false);
            return;
          }
          setProject(sessionProject);
          setView("dashboard");
          setShowSavePrompt(!sessionProject.id);
          return;
        }
        case "research":
          try {
            const loaded = await getProject(route.id);
            setProject(loaded);
            setView("dashboard");
            setShowSavePrompt(false);
          } catch (e) {
            const message =
              e instanceof Error ? e.message : "Could not load bookmark";
            setToast(message);
            navigateTo("/");
            setView("library");
            setProject(null);
            setShowSavePrompt(false);
          }
          return;
      }
    },
    [],
  );

  const { ready, goTo } = useAppRouter(applyRoute);

  function updateProject(updater: Project | ((prev: Project) => Project)) {
    setProject((prev) => {
      if (!prev) return prev;
      return typeof updater === "function" ? updater(prev) : updater;
    });
  }

  useEffect(() => {
    if (view === "dashboard" && project && !project.id) {
      saveSessionProject(project);
    }
  }, [view, project]);

  const persistProject = useCallback(async (p: Project): Promise<boolean> => {
    if (!p.id) return true;
    try {
      const saved = await saveProject({
        ...p,
        id: p.id,
        name: p.name ?? p.anchorName,
      });
      setProject(saved);
      return true;
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not save bookmark";
      setToast(message);
      return false;
    }
  }, []);

  async function handleLoadBookmark(id: string) {
    goTo({ name: "research", id });
  }

  function handleBuildComplete(p: Project) {
    saveSessionProject(p);
    goTo({ name: "session" });
  }

  async function handleSaveBookmark(name: string) {
    if (!project) return;
    setSaving(true);
    try {
      const saved = await createProject({
        name,
        anchorName: project.anchorName,
        brands: project.brands,
        opportunities: project.opportunities,
        crossThemes: project.crossThemes,
      });
      if (!saved.id) throw new Error("Save failed");
      clearSessionProject();
      setProject(saved);
      setShowSavePrompt(false);
      navigateTo(pathForRoute({ name: "research", id: saved.id }));
      setToast(`Saved "${saved.name}".`);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not save bookmark";
      setToast(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDashboardSave(name: string) {
    if (!project) return;

    if (project.id) {
      setSaving(true);
      try {
        const saved = await saveProject({ ...project, id: project.id, name });
        setProject(saved);
        setToast(`Saved "${saved.name}".`);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Could not save bookmark";
        setToast(message);
      } finally {
        setSaving(false);
      }
      return;
    }

    await handleSaveBookmark(name);
  }

  function handleBackToLibrary() {
    clearSessionProject();
    goTo({ name: "library" });
  }

  if (!ready) {
    return (
      <div className="library-state">
        <i className="ti ti-loader-2 spin" aria-hidden="true" />
        Loading…
      </div>
    );
  }

  if (view === "library") {
    return (
      <>
        <BookmarkLibrary
          onNewResearch={() => goTo({ name: "setup" })}
          onLoad={handleLoadBookmark}
        />
        {toast && <Toast text={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  if (view === "setup") {
    return (
      <>
        <SetupScreen
          onStart={handleBuildComplete}
          onBack={handleBackToLibrary}
        />
        {toast && <Toast text={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <>
      <Dashboard
        project={project}
        updateProject={updateProject}
        isSaved={isSaved}
        saving={saving}
        onSaveBookmark={handleDashboardSave}
        onPersist={persistProject}
        onBackToLibrary={handleBackToLibrary}
      />
      {showSavePrompt && (
        <SaveBookmarkPrompt
          defaultName={`${project.anchorName} competitors`}
          saving={saving}
          onSave={handleSaveBookmark}
          onSkip={() => setShowSavePrompt(false)}
        />
      )}
      {toast && <Toast text={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
