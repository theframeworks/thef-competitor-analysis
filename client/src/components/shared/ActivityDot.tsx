import { ACTIVITY_DOT_COLORS } from "../../constants/tone";
import type { ActivityLevel } from "../../types/domain";

interface ActivityDotProps {
  level: ActivityLevel | string;
}

export function ActivityDot({ level }: ActivityDotProps) {
  const color = ACTIVITY_DOT_COLORS[level as ActivityLevel] ?? "#888";
  return (
    <span
      className="activity-dot"
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}
