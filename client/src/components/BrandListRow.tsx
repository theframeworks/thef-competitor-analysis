import { cn } from "../lib/ui";
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
      className={cn(
        "flex w-full cursor-pointer flex-col items-start gap-4 border-0 border-b border-border bg-transparent px-4.5 py-3.5 text-left font-inherit text-inherit transition-colors duration-150 hover:bg-bg-card-hover appearance-none md:flex-row md:items-center",
        selected && "bg-accent-dim",
      )}
      onClick={onSelect}
    >
      <div className="md:w-44 md:shrink-0">
        <div className="text-sm font-semibold text-text-1">{brand.name}</div>
        <div className="mt-1">
          <TierBadge tier={brand.tier} tiers={tiers} />
        </div>
      </div>
      <div className="m-0 flex-1 text-xs leading-normal text-text-2">
        {brand.keyMessage}
      </div>
      <div className="flex shrink-0 items-center gap-3.5">
        <span className="inline-flex items-center gap-1 text-xs text-text-3">
          <i className="ti ti-brand-linkedin" aria-hidden="true" />{" "}
          {brand.linkedin || 0}K
        </span>
        <span className="flex items-center gap-1.5">
          <ActivityDot level={brand.activity} />
          <span className="text-xs text-text-3">{brand.activity}</span>
        </span>
      </div>
    </button>
  );
}
