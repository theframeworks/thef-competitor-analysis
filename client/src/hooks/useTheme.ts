import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  type ResolvedTheme,
  resolveTheme,
  setThemePreference,
  type ThemePreference,
} from "../lib/theme";

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    getStoredTheme(),
  );
  const [resolved, setResolved] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredTheme()),
  );

  useEffect(() => {
    setResolved(applyTheme(preference));
  }, [preference]);

  useEffect(() => {
    if (preference !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(applyTheme("system"));
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const setTheme = useCallback((next: ThemePreference) => {
    setPreference(next);
    setResolved(setThemePreference(next));
  }, []);

  return { preference, resolved, setTheme };
}
