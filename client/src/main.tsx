import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { initTheme } from "./lib/theme";
import "@fontsource-variable/geist/wght.css";
import "@fontsource-variable/geist-mono/wght.css";
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import "./index.css";

initTheme();

const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element "#root" not found');
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
