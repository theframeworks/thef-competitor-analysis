import { useThemeContext } from '../../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

export function FloatingThemeToggle() {
  const { preference, setTheme } = useThemeContext();

  return (
    <div className="theme-toggle-float">
      <ThemeToggle preference={preference} onChange={setTheme} variant="compact" />
    </div>
  );
}
