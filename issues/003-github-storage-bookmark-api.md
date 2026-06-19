# GitHub storage layer + bookmark API

**Type:** AFK  
**Status:** completed  
**Blocked by:** #1  
**User stories:** 8, 9, 10, 12, 13, 16, 24

## What to build

Add the GitHub Contents API storage layer and Express CRUD routes. No bookmark UI yet — verify with curl/HTTP client first.

**GitHub storage module**
- List files in `data/projects/`
- Read JSON by path
- Create file (commit + push) with message: `Save bookmark: {name} [skip ci]`
- Update file with SHA (optimistic locking) with message: `Refresh bookmark: {name} [skip ci]`
- Handle 409 conflict gracefully (retry or error response)
- Config via env: `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_DATA_PATH`

**API routes**
- `GET /api/projects` — array of project summaries (id, name, anchorName, createdAt, updatedAt)
- `GET /api/projects/:id` — full `Project` JSON
- `POST /api/projects` — create bookmark file
- `PUT /api/projects/:id` — update bookmark file

**Repo setup**
- Add `data/projects/.gitkeep` (or README) so directory exists in repo

## Acceptance criteria

- [x] `POST /api/projects` creates a JSON file visible on GitHub in `data/projects/`
- [x] Commit message contains `[skip ci]`
- [x] `GET /api/projects` lists the saved bookmark
- [x] `GET /api/projects/:id` returns full project data
- [x] `PUT /api/projects/:id` updates file on GitHub
- [x] Local dev with `.env` credentials reads/writes the same remote data production will use
- [x] Missing/invalid token returns clear error, not a crash

## Blocked by

- #1 Monorepo scaffold + local dev + Anthropic proxy

---

Source: [`plans/competitor-intel-migration.md`](../plans/competitor-intel-migration.md) Phase 3
