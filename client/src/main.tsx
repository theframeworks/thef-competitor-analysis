import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { initTheme } from './lib/theme';
import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/source-serif-4/index.css';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import './index.css';

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
