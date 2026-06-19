import { Root } from './components/Root';
import { FloatingThemeToggle } from './components/shared/FloatingThemeToggle';

export default function App() {
  return (
    <>
      <FloatingThemeToggle />
      <div className="app-shell">
        <Root />
      </div>
    </>
  );
}
