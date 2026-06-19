import { useState } from "react";
import {
  btnPillAccentSmall,
  btnPillNeutralSmall,
  cn,
  fieldBase,
} from "../lib/ui";

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
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-overlay p-6">
      <div className="w-full max-w-md rounded-lg border border-border-strong bg-bg-raised p-7 shadow-2xl">
        <div className="mb-2 font-serif text-xl font-semibold">
          Save this research?
        </div>
        <div className="mb-4.5 text-sm leading-relaxed text-text-2">
          Give this session a name so you and the team can open it later from
          the bookmark library.
        </div>
        <label
          className="mb-1.5 block text-xs font-semibold text-text-1"
          htmlFor="bookmark-name"
        >
          Bookmark name
        </label>
        <input
          id="bookmark-name"
          type="text"
          className={cn(fieldBase, "mb-4.5 w-full")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. UST vs IT services competitors"
          disabled={saving}
        />
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className={btnPillAccentSmall}
            onClick={() => onSave(name.trim() || defaultName)}
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              <>
                <i className="ti ti-bookmark" aria-hidden="true" />
                Save bookmark
              </>
            )}
          </button>
          <button
            type="button"
            className={btnPillNeutralSmall}
            onClick={onSkip}
            disabled={saving}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
