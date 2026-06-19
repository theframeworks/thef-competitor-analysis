import { TONE_COLORS } from "../constants/tone";
import { cn } from "../lib/ui";
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
      className={cn(
        "block w-full cursor-pointer rounded-lg border border-border bg-bg-card p-4 px-4.5 text-left font-inherit text-inherit transition-colors transition-transform duration-150 hover:bg-bg-card-hover hover:border-border-strong appearance-none",
        selected && "border-accent bg-bg-card-hover",
        brand.isAnchor && "border-accent-border",
      )}
      onClick={onSelect}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <div className="text-base font-semibold text-text-1">
            {brand.name}
          </div>
          <div className="mt-0.5 font-serif text-xs italic text-text-2">
            {brand.tagline}
          </div>
        </div>
        <ActivityDot level={brand.activity} />
      </div>
      <div className="mb-2">
        <TierBadge tier={brand.tier} tiers={tiers} />
      </div>
      <div className="my-2.5 text-xs leading-normal text-text-2">
        {brand.keyMessage}
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {(brand.themes || []).slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-full bg-bg-raised px-2.5 py-1 text-xs leading-snug font-medium text-text-2"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2.5">
        <div>
          <span className="mr-3 inline-flex items-center gap-1 text-xs text-text-3">
            <i className="ti ti-brand-linkedin" aria-hidden="true" />{" "}
            {brand.linkedin || 0}K
          </span>
          {(brand.instagram || 0) > 0 && (
            <span className="mr-3 inline-flex items-center gap-1 text-xs text-text-3">
              <i className="ti ti-brand-instagram" aria-hidden="true" />{" "}
              {brand.instagram}K
            </span>
          )}
        </div>
        <span
          className="rounded-full bg-bg-raised px-2.5 py-1 text-xs leading-snug font-semibold"
          style={{ color: toneColor }}
        >
          {brand.tone}
        </span>
      </div>
    </button>
  );
}
