interface SettingsPanelProps {
  onClose: () => void;
  onNewProject: () => void;
}

export function SettingsPanel({ onClose, onNewProject }: SettingsPanelProps) {
  function handleNewProject() {
    if (confirm('Start a new project? This discards all current research.')) {
      onNewProject();
    }
  }

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <div className="settings-title">Settings</div>
        <button
          type="button"
          className="ghost small"
          onClick={onClose}
          aria-label="Close settings"
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>
      <div>
        <div className="settings-section-title">Start a new project</div>
        <div className="body-text settings-section-desc">
          This discards the current brand and competitor set and returns you to setup.
        </div>
        <button
          type="button"
          className="small btn-danger"
          onClick={handleNewProject}
        >
          <i className="ti ti-trash" aria-hidden="true" /> New project
        </button>
      </div>
    </div>
  );
}
