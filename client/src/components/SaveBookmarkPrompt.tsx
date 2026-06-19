import { useState } from 'react';

interface SaveBookmarkPromptProps {
  defaultName: string;
  saving: boolean;
  onSave: (name: string) => void;
  onSkip: () => void;
}

export function SaveBookmarkPrompt({
  defaultName,
  saving,
  onSave,
  onSkip,
}: SaveBookmarkPromptProps) {
  const [name, setName] = useState(defaultName);

  return (
    <div className="save-prompt-overlay">
      <div className="save-prompt">
        <div className="save-prompt-title">Save this research?</div>
        <div className="save-prompt-body">
          Give this session a name so you and the team can open it later from the bookmark
          library.
        </div>
        <label className="setup-label" htmlFor="bookmark-name">
          Bookmark name
        </label>
        <input
          id="bookmark-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. UST vs IT services competitors"
          disabled={saving}
        />
        <div className="save-prompt-actions">
          <button
            type="button"
            className="primary"
            onClick={() => onSave(name.trim() || defaultName)}
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="ti ti-loader-2 spin" aria-hidden="true" /> Saving…
              </>
            ) : (
              <>
                <i className="ti ti-bookmark" aria-hidden="true" /> Save bookmark
              </>
            )}
          </button>
          <button type="button" className="ghost" onClick={onSkip} disabled={saving}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
