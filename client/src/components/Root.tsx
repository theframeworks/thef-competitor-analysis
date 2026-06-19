import { useCallback, useState } from 'react';
import type { Project } from '../types/domain';
import { createProject, getProject, updateProject as saveProject } from '../lib/projects';
import { BookmarkLibrary } from './BookmarkLibrary';
import { Dashboard } from './Dashboard';
import { SaveBookmarkPrompt } from './SaveBookmarkPrompt';
import { SetupScreen } from './SetupScreen';
import { Toast } from './shared/Toast';

type AppView = 'library' | 'setup' | 'dashboard';

export function Root() {
  const [view, setView] = useState<AppView>('library');
  const [project, setProject] = useState<Project | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isSaved = Boolean(project?.id);

  function updateProject(updater: Project | ((prev: Project) => Project)) {
    setProject((prev) => {
      if (!prev) return prev;
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }

  const persistProject = useCallback(async (p: Project) => {
    if (!p.id) return;
    try {
      const saved = await saveProject({
        ...p,
        id: p.id,
        name: p.name ?? p.anchorName,
      });
      setProject(saved);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save bookmark';
      setToast(message);
    }
  }, []);

  async function handleLoadBookmark(id: string) {
    const loaded = await getProject(id);
    setProject(loaded);
    setShowSavePrompt(false);
    setView('dashboard');
  }

  function handleBuildComplete(p: Project) {
    setProject(p);
    setShowSavePrompt(true);
    setView('dashboard');
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
      setProject(saved);
      setShowSavePrompt(false);
      setToast(`Saved "${saved.name}".`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not save bookmark';
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
        const message = e instanceof Error ? e.message : 'Could not save bookmark';
        setToast(message);
      } finally {
        setSaving(false);
      }
      return;
    }

    await handleSaveBookmark(name);
  }

  function handleBackToLibrary() {
    setProject(null);
    setShowSavePrompt(false);
    setView('library');
  }

  if (view === 'library') {
    return (
      <>
        <BookmarkLibrary
          onNewResearch={() => setView('setup')}
          onLoad={handleLoadBookmark}
        />
        {toast && <Toast text={toast} onDismiss={() => setToast(null)} />}
      </>
    );
  }

  if (view === 'setup') {
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
