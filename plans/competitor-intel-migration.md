# Plan: Competitor Intelligence Monitor Migration

> Source PRD: [`docs/PRD.md`](../docs/PRD.md)

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes (API)**
  - `POST /api/messages` — Anthropic Messages API proxy
  - `GET /api/projects` — list bookmarks
  - `GET /api/projects/:id` — load one bookmark
  - `POST /api/projects` — create bookmark
  - `PUT /api/projects/:id` — update bookmark (refresh)
  - `DELETE /api/projects/:id` — optional, delete bookmark
- **Storage**: JSON files at `data/projects/{id}.json` in the same Git repo, accessed via GitHub Contents API (local dev and production use the same code path and same remote data)
- **Key models**: `Project`, `Brand`, `Opportunity`, `CrossThemes` — same shapes as current app (see PRD)
- **Auth**: None for v1
- **Hosting**: Single Cloud Run service serves Vite `dist/` + API; Blaze GCP/Firebase project
- **Deploy trigger**: Cloud Build on push to `main`; `ignoredFiles: ['data/**']`; bookmark commits include `[skip ci]`
- **Secrets**: `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_DATA_PATH`

## Prerequisites (before Phase 1)

- [ ] Node.js 22+ installed locally
- [ ] Anthropic API key available
- [ ] GitHub PAT with `contents: read/write` on the repo (fine-grained or classic)
- [ ] GCP/Firebase project created on **Blaze** plan (can wait until Phase 4, but needed for production)

---

## Phase 1: Monorepo scaffold + local dev + Anthropic proxy

**User stories**: 1, 2, 14, 19, 22

### What to build

Bootstrap the project structure and prove the full dev loop works end-to-end with a minimal UI that calls Claude through a server-side proxy.

- Root `package.json` with workspaces or scripts orchestrating `client/` and `server/`
- **Client**: Vite + React (latest) + TypeScript + Tailwind v4 (`@tailwindcss/vite`)
- **Server**: Express + TypeScript; `POST /api/messages` proxies to Anthropic (parity with current `Code.gs`)
- Vite dev server proxies `/api/*` → Express
- `.env.example` documenting `ANTHROPIC_API_KEY`, `PORT`, and (stubbed for later) GitHub vars
- `.gitignore` for `node_modules`, `dist`, `.env`
- Tailwind theme tokens matching current dark UI (page bg, card bg, accent green, serif/sans fonts)

Include a minimal proof screen (e.g. “Test Claude” button) that sends one message through `/api/messages` and displays the response. This validates the tracer bullet before porting the full UI.

### Acceptance criteria

- [ ] `npm install` at repo root succeeds
- [ ] `npm run dev` starts client + server; app loads at `localhost:5173` (or configured port)
- [ ] Hot reload works on client file changes
- [ ] `POST /api/messages` returns a valid Anthropic response; API key is not visible in browser network tab or bundled JS
- [ ] TypeScript compiles without errors for client and server
- [ ] Tailwind styles render correctly on the proof screen

### Verify

```bash
npm install
npm run dev
# Open app → trigger test call → see Claude response
```

---

## Phase 2: Port full research UI (setup + dashboard)

**User stories**: 3, 4, 5, 6, 7, 20, 21

### What to build

Migrate all functionality from `index.html` into structured React components with feature parity. Project state lives in React state only (no persistence yet — same as opening a fresh browser session today).

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

### Acceptance criteria

- [ ] User can complete full “Build dashboard” flow locally
- [ ] Dashboard matches current app behavior (research, filter, detail, refresh)
- [ ] All Claude calls go through `/api/messages`; no hardcoded Apps Script URL remains
- [ ] UI visually matches the original dark theme (acceptable minor Tailwind translation differences)
- [ ] No `localStorage` reads/writes for project data in this phase (in-memory only)

### Verify

```bash
npm run dev
# Build dashboard with 2–3 competitors → explore dashboard → refresh one brand → regenerate opportunities
```

Compare side-by-side with current `index.html` opened locally if needed.

---

## Phase 3: GitHub storage layer + bookmark API

**User stories**: 8, 9, 10, 12, 13, 16, 24

### What to build

Add the GitHub Contents API storage layer and Express CRUD routes. No bookmark UI yet — verify with curl/HTTP client first (tracer bullet for storage).

**GitHub storage module**
- List files in `data/projects/`
- Read JSON by path
- Create file (commit + push) with message: `Save bookmark: {name} [skip ci]`
- Update file with SHA (optimistic locking) with message: `Refresh bookmark: {name} [skip ci]`
- Handle 409 conflict gracefully (retry or error response)
- Config via env: `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_DATA_PATH`

**API routes**
- `GET /api/projects` — returns array of project summaries (id, name, anchorName, createdAt, updatedAt)
- `GET /api/projects/:id` — returns full `Project` JSON
- `POST /api/projects` — creates new bookmark file
- `PUT /api/projects/:id` — updates existing bookmark file

**Repo setup**
- Add empty `data/projects/.gitkeep` (or README) so directory exists in repo

### Acceptance criteria

- [ ] `POST /api/projects` creates a JSON file visible on GitHub in `data/projects/`
- [ ] Commit message contains `[skip ci]`
- [ ] `GET /api/projects` lists the saved bookmark
- [ ] `GET /api/projects/:id` returns full project data
- [ ] `PUT /api/projects/:id` updates file and increments content on GitHub
- [ ] Local dev with `.env` credentials reads/writes the same remote data production will use
- [ ] Missing/invalid token returns clear 500/503 error, not a crash

### Verify

```bash
npm run dev

# Create
curl -X POST http://localhost:3001/api/projects \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","anchorName":"Acme","brands":[],"opportunities":[],"crossThemes":null}'

# List
curl http://localhost:3001/api/projects

# Load
curl http://localhost:3001/api/projects/{id}

# Confirm file exists on GitHub web UI
```

---

## Phase 4: Bookmark UI + wire persistence

**User stories**: 8, 9, 10, 11, 12, 13, 16, 17

### What to build

Replace in-memory-only project lifecycle with Git-backed bookmarks in the UI.

**New / updated UI**
- **Home / library view** when no project loaded: list saved bookmarks + “New research” button
- **Save bookmark** action from dashboard (prompt for name or auto-generate from anchor)
- **Load bookmark** from library → opens dashboard with full state
- **Refresh loaded bookmark** persists updates back via `PUT /api/projects/:id`
- Remove `localStorage` as primary store; GitHub API is source of truth
- Loading and error states for bookmark operations
- Optional: delete bookmark

**Flow changes**
- App entry: bookmark library (not immediately setup screen)
- After build completes: offer save (or auto-save with editable name)
- Refresh operations on loaded bookmark update the stored JSON on completion

### Acceptance criteria

- [ ] Saved bookmark appears in library for all team members (same GitHub data)
- [ ] Loading a bookmark restores full dashboard state
- [ ] Refreshing brands/opportunities on a loaded bookmark persists to GitHub
- [ ] Local dev and production (once deployed) show identical bookmark lists
- [ ] Save/load errors show user-friendly toast/message
- [ ] No `competitor_intel_project_v1` localStorage dependency remains

### Verify

```bash
npm run dev
# Save bookmark → confirm on GitHub → restart dev server → bookmark still listed
# Open in second browser/incognito → same bookmark visible
# Load → refresh one brand → confirm JSON updated on GitHub
```

---

## Phase 5: Production build + Cloud Run deployment

**User stories**: 15, 17, 18, 23

### What to build

Containerize the app and configure automated deployment to Cloud Run.

**Docker**
- Multi-stage or single Dockerfile: install deps → build client → build server → run Express on port 8080
- Express serves `client/dist` static files and `/api/*` routes
- Production `npm start` command

**Cloud Build (`cloudbuild.yaml`)**
- Build Docker image → push to Artifact Registry → deploy to Cloud Run
- Trigger: push to `main`
- **`ignoredFiles`: `['data/**']`** on the trigger (via console or trigger config)

**GCP setup**
- Enable Cloud Run, Cloud Build, Artifact Registry, Secret Manager APIs
- Secrets: `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`
- Cloud Run service env vars: `GITHUB_REPO`, `GITHUB_DATA_PATH`, secret refs
- `min-instances: 0`, `max-instances: 1` (optional, reduces write races)
- Blaze billing + budget alert recommended

**Root scripts**
- `npm run build` — production client + server build
- `npm start` — production server entry

### Acceptance criteria

- [ ] `docker build` + `docker run` serves app locally on port 8080 with working API
- [ ] Push to `main` with code changes triggers Cloud Build and deploys new Cloud Run revision
- [ ] Push that **only** changes `data/projects/*.json` does **not** trigger Cloud Build
- [ ] Production URL loads app, runs research, saves/loads bookmarks
- [ ] Secrets not in image layers or repo
- [ ] Cloud Run service responds over HTTPS with default URL

### Verify

```bash
# Local container smoke test
docker build -t competitor-intel .
docker run -p 8080:8080 --env-file .env competitor-intel

# After GCP setup:
# 1. Push code change → Cloud Build runs → new revision live
# 2. Save bookmark in prod → JSON on GitHub → Cloud Build does NOT run
# 3. Check Cloud Build history in GCP console
```

---

## Phase 6: Tests, cleanup, and documentation

**User stories**: 19 (quality), 25

### What to build

Add automated tests for critical paths, remove legacy files, document ops.

**Tests**
- Server: mock Anthropic + mock GitHub client; test proxy passthrough, project CRUD, commit message format, 409 handling
- Optional client: setup form validation, bookmark list renders

**Cleanup**
- Archive or remove dependency on `Code.gs` and monolithic `index.html` (keep in git history; add note in README pointing to migration)
- Remove Apps Script proxy URL references

**Documentation (`README.md`)**
- Local dev setup (clone, `.env`, `npm run dev`)
- Required env vars table
- GCP deploy overview (one-time setup steps)
- How bookmark storage works (GitHub API, `data/projects/`)
- How deploy skip works (`ignoredFiles` + `[skip ci]`)

### Acceptance criteria

- [ ] `npm test` passes (server tests at minimum)
- [ ] README enables a new developer to run locally without oral handoff
- [ ] Legacy `index.html` / `Code.gs` marked deprecated or removed with README note
- [ ] Manual smoke checklist completed on production URL (see below)

### Production smoke checklist

- [ ] Build new research session (3 brands)
- [ ] Save bookmark
- [ ] Reload page → bookmark in library
- [ ] Load bookmark → dashboard correct
- [ ] Refresh one brand → GitHub JSON updated
- [ ] Confirm Cloud Build did not run on bookmark save
- [ ] Push trivial code change → Cloud Build runs → app still works

---

## Execution order summary

| Phase | Delivers | Depends on |
|-------|----------|------------|
| 1 | Local dev + Anthropic proxy | Prerequisites |
| 2 | Full UI parity (no persistence) | Phase 1 |
| 3 | GitHub storage API (curl-verified) | Phase 1 |
| 4 | Bookmark UI wired to storage | Phases 2 + 3 |
| 5 | Cloud Run production deploy | Phase 4 |
| 6 | Tests, docs, cleanup | Phase 5 |

Phases 2 and 3 can run **in parallel** if two people work on the migration; Phase 4 requires both.

---

## Environment variables reference

| Variable | Phase needed | Description |
|----------|--------------|-------------|
| `ANTHROPIC_API_KEY` | 1 | Anthropic API key for proxy |
| `PORT` | 1 | Server port (8080 in prod) |
| `GITHUB_TOKEN` | 3 | PAT with repo read/write |
| `GITHUB_REPO` | 3 | `owner/repo` |
| `GITHUB_DATA_PATH` | 3 | `data/projects` |

---

## Risk mitigations

| Risk | Mitigation |
|------|------------|
| GitHub API rate limits | Low usage; cache list briefly if needed later |
| SHA conflict on concurrent saves | `max-instances: 1`; show retry toast on 409 |
| Accidental deploy on data save | `ignoredFiles: data/**` + `[skip ci]` |
| Anthropic costs (no auth) | Internal URL only; add auth later if needed |
| Large JSON files in Git | Fine at current scale; one file per bookmark |

---

## Out of scope (defer)

- Firebase Auth / Google OAuth
- Firestore or Postgres
- Firebase Hosting CDN (add later if needed)
- DigitalOcean deployment
- Custom domain setup
- Export/import UI (Git history is the backup)
