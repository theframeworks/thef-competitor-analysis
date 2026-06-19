import type { CrossThemes } from '../types/domain';

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
  items: CrossThemes['messagingAngles'] | undefined;
}) {
  if (!items || items.length === 0) return null;

  return (
    <div className="cross-theme-group">
      <div className="cross-theme-group-head">
        <i className={`ti ${icon}`} aria-hidden="true" />
        <div>{title}</div>
      </div>
      <div className="opp-grid">
        {items.map((item, i) => (
          <div key={i} className="opp-card">
            <div className="opp-title cross-theme-label">{item.label}</div>
            {item.brands && item.brands.length > 0 && (
              <div className="theme-pills cross-theme-brands">
                {item.brands.map((b) => (
                  <span key={b} className="theme-pill">
                    {b}
                  </span>
                ))}
              </div>
            )}
            <div className="opp-body">{item.body}</div>
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
    <div className="opp-section">
      <div className="opp-section-head">
        <div className="eyebrow eyebrow-flush">Cross-brand themes</div>
        <button
          type="button"
          className="pill pill-accent small"
          onClick={onRefresh}
          disabled={refreshing}><i className={`ti ti-refresh ${refreshing ? 'spin' : ''}`} aria-hidden="true" />{refreshing ? 'Analyzing…' : 'Regenerate'}</button>
      </div>
      {hasData ? (
        <>
          <ThemeGroup
            title="Common messaging angles"
            icon="ti-message-2"
            items={crossThemes!.messagingAngles}
          />
          <ThemeGroup
            title="Recurring content themes"
            icon="ti-stack-2"
            items={crossThemes!.contentThemes}
          />
          <ThemeGroup
            title="Tone-of-voice clusters"
            icon="ti-vocabulary"
            items={crossThemes!.toneClusters}
          />
        </>
      ) : (
        <div className="opp-empty">
          No cross-brand theme analysis yet. Click Regenerate to identify shared messaging
          angles, content themes, and tonal patterns across the full brand set.
        </div>
      )}
    </div>
  );
}
