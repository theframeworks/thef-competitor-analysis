import { TIER_PALETTE } from '../../constants/tone';

interface TierBadgeProps {
  tier: string;
  tiers: string[];
}

export function tierColor(tier: string, tiers: string[]): string {
  const idx = tiers.indexOf(tier);
  return TIER_PALETTE[((idx < 0 ? 0 : idx) % TIER_PALETTE.length)];
}

export function TierBadge({ tier, tiers }: TierBadgeProps) {
  const c = tierColor(tier, tiers);
  return (
    <span
      className="tier-badge"
      style={{ background: `${c}26`, color: c }}
    >
      {tier}
    </span>
  );
}
