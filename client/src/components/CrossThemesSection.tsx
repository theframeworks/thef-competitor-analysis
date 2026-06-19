import { btnPillAccentSmall, cn } from "../lib/ui";
import type { CrossThemes } from "../types/domain";

interface CrossThemesSectionProps {
  crossThemes: CrossThemes | null;
  onRefresh: () => void;
  refreshing: boolean;
}

function ThemeGroup({
  title,
  icon,
  items,
}: {
  title: string;
  icon: string;
  items: CrossThemes["messagingAngles"] | undefined;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-text-2">
        <i className={`ti ${icon} text-sm text-text-3`} aria-hidden="true" />
        <div>{title}</div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-bg-card px-4 py-4"
          >
            <div className="mb-2 text-sm font-semibold">{item.label}</div>
            {item.brands && item.brands.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {item.brands.map((b) => (
                  <span
                    key={b}
                    className="rounded-full bg-bg-raised px-2.5 py-1 text-xs leading-snug font-medium text-text-2"
                  >
                    {b}
                  </span>
                ))}
              </div>
            )}
            <div className="text-xs leading-normal text-text-2">
              {item.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CrossThemesSection({
  crossThemes,
  onRefresh,
  refreshing,
}: CrossThemesSectionProps) {
  const hasData =
    crossThemes &&
    ((crossThemes.messagingAngles && crossThemes.messagingAngles.length > 0) ||
      (crossThemes.contentThemes && crossThemes.contentThemes.length > 0) ||
      (crossThemes.toneClusters && crossThemes.toneClusters.length > 0));

  return (
    <div className="mt-9 border-t border-border pt-6.5">
      <div className="mb-4.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="m-0 text-xs tracking-widest uppercase text-text-3">
          Cross-brand themes
        </div>
        <button
          type="button"
          className={btnPillAccentSmall}
          onClick={onRefresh}
          disabled={refreshing}
        >
          <i
            className={cn("ti ti-refresh", refreshing && "animate-spin")}
            aria-hidden="true"
          />
          {refreshing ? "Analyzing…" : "Regenerate"}
        </button>
      </div>
      {hasData ? (
        <>
          <ThemeGroup
            title="Common messaging angles"
            icon="ti-message-2"
            items={crossThemes?.messagingAngles}
          />
          <ThemeGroup
            title="Recurring content themes"
            icon="ti-stack-2"
            items={crossThemes?.contentThemes}
          />
          <ThemeGroup
            title="Tone-of-voice clusters"
            icon="ti-vocabulary"
            items={crossThemes?.toneClusters}
          />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border-strong px-6 py-6 text-center text-sm text-text-3">
          No cross-brand theme analysis yet. Click Regenerate to identify shared
          messaging angles, content themes, and tonal patterns across the full
          brand set.
        </div>
      )}
    </div>
  );
}
