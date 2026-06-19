import type { Brand } from "../types/domain";
import { ActivityDot } from "./shared/ActivityDot";
import { TierBadge } from "./shared/TierBadge";

interface BrandListRowProps {
  brand: Brand;
  selected: boolean;
  tiers: string[];
  onSelect: () => void;
}

export function BrandListRow({
  brand,
  selected,
  tiers,
  onSelect,
}: BrandListRowProps) {
  return (
    <button
      type="button"
      className={`list-row ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div>
        <div className="brand-name brand-name-sm">
          {brand.name}
          {brand.isAnchor && <span className="anchor-pip">YOU</span>}
        </div>
        <div className="list-tier">
          <TierBadge tier={brand.tier} tiers={tiers} />
        </div>
      </div>
      <div className="key-message key-message-flush">{brand.keyMessage}</div>
      <div className="list-row-meta">
        <span className="channel-stat">
          <i className="ti ti-brand-linkedin" aria-hidden="true" />{" "}
          {brand.linkedin || 0}K
        </span>
        <span className="activity-inline">
          <ActivityDot level={brand.activity} />
          <span className="activity-label">{brand.activity}</span>
        </span>
      </div>
    </button>
  );
}
