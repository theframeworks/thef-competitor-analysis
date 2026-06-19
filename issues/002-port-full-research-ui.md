# Port full research UI (setup + dashboard)

**Status:** completed  
**Type:** AFK  
**Blocked by:** #1  
**User stories:** 3, 4, 5, 6, 7, 20, 21

## What to build

Migrate all functionality from `index.html` into structured React components with feature parity. Project state lives in React state only (no persistence yet).

**Setup flow**
- Anchor brand + competitors input
- Build progress log, progress bar, cancel
- Sequential brand research via `/api/messages`
- Opportunity synthesis + cross-brand theme analysis
- Validation (empty anchor, no competitors, 30 competitor limit)

**Dashboard**
- Topbar, stats, search, tier filter, grid/list views
- Brand cards, detail panel with tabs
- Refresh single brand, refresh all, regenerate opportunities, regenerate cross-themes
- Toast notifications, tone colors, activity indicators

**Code organization**
- Shared types (`Project`, `Brand`, etc.)
- API client module (`/api/messages` wrapper)
- Prompt templates ported from current inline strings
- Components split logically (Setup, Dashboard, BrandCard, DetailPanel, etc.)
- Utility functions (`slugify`, `parseCompetitorList`, etc.)

## Acceptance criteria

- [x] User can complete full “Build dashboard” flow locally
- [x] Dashboard matches current app behavior (research, filter, detail, refresh)
- [x] All Claude calls go through `/api/messages`; no hardcoded Apps Script URL remains
- [x] UI visually matches the original dark theme (acceptable minor Tailwind translation differences)
- [x] No `localStorage` reads/writes for project data in this phase (in-memory only)

## Blocked by

- #1 Monorepo scaffold + local dev + Anthropic proxy

---

Source: [`plans/competitor-intel-migration.md`](../plans/competitor-intel-migration.md) Phase 2
