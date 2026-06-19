import { Root } from "./components/Root";
import { FloatingThemeToggle } from "./components/shared/FloatingThemeToggle";

export default function App() {
  return (
    <div className="min-h-screen bg-bg-page font-sans text-sm leading-normal text-text-1 antialiased">
      <FloatingThemeToggle />
      <div className="mx-auto w-full max-w-content px-8 pt-7 pb-16">
        <Root />
      </div>
    </div>
  );
}
