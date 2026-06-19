interface SettingsPanelProps {
  onClose: () => void;
  onBackToLibrary: () => void;
}

export function SettingsPanel({ onClose, onBackToLibrary }: SettingsPanelProps) {
  function handleBackToLibrary() {
    if (confirm('Return to the bookmark library? Unsaved changes stay in this browser session only.')) {
      onBackToLibrary();
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
        <div className="settings-section-title">Bookmark library</div>
        <div className="body-text settings-section-desc">
          Return to saved bookmarks or start new research.
        </div>
        <button
          type="button"
          className="small"
          onClick={handleBackToLibrary}
        >
          <i className="ti ti-bookmark" aria-hidden="true" /> Back to library
        </button>
      </div>
    </div>
  );
}
