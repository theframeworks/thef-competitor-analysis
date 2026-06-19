import { TONE_COLORS } from "../constants/tone";
import type { Brand } from "../types/domain";
import { ActivityDot } from "./shared/ActivityDot";
import { TierBadge } from "./shared/TierBadge";

interface BrandCardProps {
  brand: Brand;
  selected: boolean;
  tiers: string[];
  onSelect: () => void;
}

export function BrandCard({
  brand,
  selected,
  tiers,
  onSelect,
}: BrandCardProps) {
  const toneColor = TONE_COLORS[brand.tone] ?? "var(--color-text-2)";

  return (
    <button
      type="button"
      className={`brand-card ${selected ? "selected" : ""} ${brand.isAnchor ? "is-anchor" : ""}`}
      onClick={onSelect}
    >
      <div className="brand-card-head">
        <div>
          <div className="brand-name">
            {brand.name}
            {brand.isAnchor && <span className="anchor-pip">YOU</span>}
          </div>
          <div className="brand-tagline">{brand.tagline}</div>
        </div>
        <ActivityDot level={brand.activity} />
      </div>
      <div className="tier-badge-wrap">
        <TierBadge tier={brand.tier} tiers={tiers} />
      </div>
      <div className="key-message">{brand.keyMessage}</div>
      <div className="theme-pills">
        {(brand.themes || []).slice(0, 3).map((t) => (
          <span key={t} className="theme-pill">
            {t}
          </span>
        ))}
      </div>
      <div className="card-footer">
        <div>
          <span className="channel-stat">
            <i className="ti ti-brand-linkedin" aria-hidden="true" />{" "}
            {brand.linkedin || 0}K
          </span>
          {(brand.instagram || 0) > 0 && (
            <span className="channel-stat">
              <i className="ti ti-brand-instagram" aria-hidden="true" />{" "}
              {brand.instagram}K
            </span>
          )}
        </div>
        <span className="tone-tag" style={{ color: toneColor }}>
          {brand.tone}
        </span>
      </div>
    </button>
  );
}
