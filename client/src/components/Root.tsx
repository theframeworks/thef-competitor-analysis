import { useState } from 'react';
import type { Project } from '../types/domain';
import { Dashboard } from './Dashboard';
import { SetupScreen } from './SetupScreen';

export function Root() {
  const [project, setProject] = useState<Project | null>(null);

  function updateProject(updater: Project | ((prev: Project) => Project)) {
    setProject((prev) => {
      if (!prev) return prev;
      return typeof updater === 'function' ? updater(prev) : updater;
    });
  }

  if (!project) {
    return <SetupScreen onStart={setProject} />;
  }

  return (
    <Dashboard
      project={project}
      updateProject={updateProject}
      onNewProject={() => setProject(null)}
    />
  );
}
