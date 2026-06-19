# Bookmark library UI + wire persistence

**Type:** AFK  
**Blocked by:** #2, #3  
**User stories:** 8, 9, 10, 11, 12, 13, 16, 17  
**Status:** completed

## What to build

Replace in-memory-only project lifecycle with Git-backed bookmarks in the UI.

**New / updated UI**
- Home / library view when no project loaded: list saved bookmarks + “New research” button
- Save bookmark action from dashboard (prompt for name or auto-generate from anchor)
- Load bookmark from library → opens dashboard with full state
- Refresh loaded bookmark persists updates back via `PUT /api/projects/:id`
- Remove `localStorage` as primary store; GitHub API is source of truth
- Loading and error states for bookmark operations
- Optional: delete bookmark

**Flow changes**
- App entry: bookmark library (not immediately setup screen)
- After build completes: offer save (or auto-save with editable name)
- Refresh operations on loaded bookmark update stored JSON on completion

## Acceptance criteria

- [x] Saved bookmark appears in library for all team members (same GitHub data)
- [x] Loading a bookmark restores full dashboard state
- [x] Refreshing brands/opportunities on a loaded bookmark persists to GitHub
- [x] Local dev shows identical bookmark lists to production (once deployed)
- [x] Save/load errors show user-friendly toast/message
- [x] No `competitor_intel_project_v1` localStorage dependency remains

## Blocked by

- #2 Port full research UI (setup + dashboard)
- #3 GitHub storage layer + bookmark API

---

Source: [`plans/competitor-intel-migration.md`](../plans/competitor-intel-migration.md) Phase 4
