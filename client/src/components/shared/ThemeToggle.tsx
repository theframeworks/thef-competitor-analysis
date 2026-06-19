import type { ThemePreference } from "../../lib/theme";

interface ThemeToggleProps {
  preference: ThemePreference;
  onChange: (preference: ThemePreference) => void;
  variant?: "compact" | "segmented";
}

const OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "ti-sun" },
  { value: "dark", label: "Dark", icon: "ti-moon" },
  { value: "system", label: "System", icon: "ti-device-desktop" },
];

export function ThemeToggle({
  preference,
  onChange,
  variant = "segmented",
}: ThemeToggleProps) {
  if (variant === "compact") {
    const next: ThemePreference =
      preference === "light"
        ? "dark"
        : preference === "dark"
          ? "system"
          : "light";
    const icon =
      preference === "light"
        ? "ti-sun"
        : preference === "dark"
          ? "ti-moon"
          : "ti-device-desktop";
    const label =
      preference === "light"
        ? "Light"
        : preference === "dark"
          ? "Dark"
          : "System";

    return (
      <button
        type="button"
        className="pill pill-neutral pill-icon"
        onClick={() => onChange(next)}
        aria-label={`${label} theme. Click to change.`}
      >
        <i className={`ti ${icon}`} aria-hidden="true" />
      </button>
    );
  }

  return (
    <fieldset className="theme-toggle" aria-label="Color theme">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`pill pill-neutral pill-icon ${preference === option.value ? "is-active" : ""}`}
          onClick={() => onChange(option.value)}
          aria-label={`${option.label} theme`}
          aria-pressed={preference === option.value}
        >
          <i className={`ti ${option.icon}`} aria-hidden="true" />
        </button>
      ))}
    </fieldset>
  );
}
