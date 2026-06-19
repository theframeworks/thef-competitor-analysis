interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <div className="settings-title">Settings</div>
        <button
          type="button"
          className="pill pill-neutral pill-icon"
          onClick={onClose}
          aria-label="Close settings"
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <div className="body-text settings-section-desc">
        Use the back link above to return to saved bookmarks or start new
        research. Theme can be changed with the button in the top-right corner.
      </div>
    </div>
  );
}
