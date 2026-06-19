import { useThemeContext } from "../../context/ThemeContext";
import { ThemeToggle } from "./ThemeToggle";

export function FloatingThemeToggle() {
  const { preference, setTheme } = useThemeContext();

  return (
    <div className="fixed top-5 right-5 z-40">
      <ThemeToggle
        preference={preference}
        onChange={setTheme}
        variant="compact"
      />
    </div>
  );
}
