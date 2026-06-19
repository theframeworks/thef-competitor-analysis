# Legacy Apps Script application

These files are **deprecated** and kept for reference only.

| File | Purpose |
|---|---|
| `index.html` | Original monolithic React app (CDN + Babel in-browser) |
| `Code.gs` | Google Apps Script proxy for the Anthropic Messages API |

The migrated app lives in `client/` (Vite + React) and `server/` (Express). Use `npm run dev` at the repo root instead of deploying to Apps Script.
