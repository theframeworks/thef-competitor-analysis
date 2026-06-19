import { btnPillNeutralIcon } from "../lib/ui";

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  return (
    <div className="mb-5.5 rounded-lg border border-border-strong bg-bg-card px-5.5 py-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="text-sm font-semibold">Settings</div>
        <button
          type="button"
          className={btnPillNeutralIcon}
          onClick={onClose}
          aria-label="Close settings"
        >
          <i className="ti ti-x" aria-hidden="true" />
        </button>
      </div>

      <div className="text-sm leading-relaxed text-text-2">
        Use the back link above to return to saved bookmarks or start new
        research. Theme can be changed with the button in the top-right corner.
      </div>
    </div>
  );
}
