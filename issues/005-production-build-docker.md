# Production build + Docker container

**Type:** AFK  
**Status:** completed  
**Blocked by:** #4  
**User stories:** 15 (partial), 18 (partial)

## What to build

Containerize the app for production. Express serves the Vite build and API from a single process.

- `npm run build` — production client + server build
- `npm start` — production server entry (port 8080)
- Dockerfile: install deps → build client → build server → run Express
- Express serves static assets from client build output and `/api/*` routes
- Local smoke test via `docker build` + `docker run`

## Acceptance criteria

- [x] `npm run build` produces production artifacts without errors
- [x] `npm start` serves app + API on port 8080
- [x] `docker build` succeeds
- [x] `docker run -p 8080:8080 --env-file .env` serves working app (research + bookmarks)
- [x] Secrets not baked into image layers

## Blocked by

- #4 Bookmark library UI + wire persistence

---

Source: [`plans/competitor-intel-migration.md`](../plans/competitor-intel-migration.md) Phase 5 (container half)
