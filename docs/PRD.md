# Competitor Intelligence Monitor — Migration PRD

## Problem Statement

The Competitor Intelligence Monitor is a Google Apps Script application: a single HTML file with in-browser React (CDN + Babel) and a thin Apps Script proxy that holds the Anthropic API key. It works, but it cannot run locally in a modern dev workflow, depends on Google Workspace for deployment, stores project data only in the browser (`localStorage`), and cannot persist or share bookmarked research sessions across the team.

The team needs a version that runs locally with hot reload, can be hosted affordably for low internal usage, stores bookmarked competitor research so sessions can be retrieved and refreshed later, and keeps operational complexity to an absolute minimum.

## Solution

Migrate the app to a Vite + React + TypeScript + Tailwind frontend and an Express backend that proxies Anthropic API calls and persists bookmarked searches as JSON files in the same Git repository via the GitHub Contents API. Deploy to Google Cloud Run (Firebase/GCP project) with Cloud Build continuous deployment that ignores changes under `data/**` so bookmark saves do not trigger rebuilds.

Local development and production share the same bookmark data through the GitHub API. No authentication for v1. No traditional database.

## User Stories

1. As an internal team member, I want to run the app locally with `npm run dev`, so that I can develop and test without deploying to Google Apps Script.

2. As an internal team member, I want hot reload and a proper build pipeline, so that frontend changes are fast to iterate on.

3. As an internal team member, I want to enter my anchor brand and a list of competitors, so that I can build a competitor intelligence dashboard as I do today.

4. As an internal team member, I want Claude to research each brand's positioning, themes, tone, and channel scale, so that I get the same intelligence output as the current app.

5. As an internal team member, I want to view a dashboard of researched brands with search, filters, and detail panels, so that I can explore competitive intelligence visually.

6. As an internal team member, I want to refresh individual brands or all brands, so that I can update stale research without starting over.

7. As an internal team member, I want to regenerate differentiation opportunities and cross-brand themes, so that synthesis stays current after refreshes.

8. As an internal team member, I want to save a research session as a bookmark with a recognizable name, so that I can return to it later without re-running the full build.

9. As an internal team member, I want to see a list of all saved bookmarks, so that I can open any previous research session.

10. As an internal team member, I want to load a saved bookmark and see the full dashboard state, so that I can continue where the team left off.

11. As an internal team member, I want to refresh a loaded bookmark, so that I can update research for an saved session in place.

12. As an internal team member, I want bookmark data to be shared across the team, so that anyone with the app URL sees the same saved searches.

13. As an internal team member, I want local development to read and write the same bookmark data as production, so that I am never working against a separate local dataset.

14. As an internal team member, I want the Anthropic API key to stay server-side, so that it is never exposed in the browser.

15. As an internal team member, I want the hosted app to cost as little as possible, so that a low-usage internal tool does not incur unnecessary monthly fees.

16. As an internal team member, I want bookmark saves to commit to Git automatically, so that data is versioned and recoverable without a database.

17. As an internal team member, I want bookmark saves not to redeploy the application, so that saves are fast and invisible to other users.

18. As a developer, I want code pushes to automatically deploy a new Cloud Run revision, so that releases do not require manual deployment steps.

19. As a developer, I want TypeScript across frontend and backend, so that domain types (brands, projects, API responses) are enforced.

20. As a developer, I want Tailwind CSS with a theme matching the current dark UI, so that the visual identity is preserved during the refactor.

21. As a developer, I want the frontend split into logical components and modules, so that the monolithic HTML file is maintainable.

22. As a developer, I want environment variables for secrets (`ANTHROPIC_API_KEY`, `GITHUB_TOKEN`), so that credentials are not committed to the repository.

23. As a developer, I want Cloud Build to ignore `data/**` when deciding whether to deploy, so that data-only commits skip the build pipeline.

24. As a developer, I want bookmark save commits to include `[skip ci]` in the message as a secondary safeguard, so that deploy skips remain reliable even if path filters change.

25. As an internal team member, I want the app to remain accessible without login for v1, so that we can ship quickly without building auth.

## Implementation Decisions

### Current state

- Single `index.html` (~1,150 lines): inline CSS, React 18 via CDN, Babel in-browser transpilation, all components inline.
- `Code.gs`: Apps Script `doPost` proxy to Anthropic Messages API; API key in Script Properties.
- Project state stored in `localStorage` under `competitor_intel_project_v1`.
- Hardcoded Apps Script proxy URL for all API calls.

### Target architecture

- **Monorepo layout** with separate `client/` (Vite + React) and `server/` (Express) packages or directories.
- **Single Cloud Run service** serves the Vite production build (static assets) and Express API routes. Firebase Hosting is optional for v1; Cloud Run alone is sufficient.
- **Express responsibilities:**
  - `POST /api/messages` — proxy to Anthropic Messages API (same behavior as current `Code.gs`).
  - `GET /api/projects` — list saved bookmarks (reads JSON files from GitHub).
  - `GET /api/projects/:id` — load one bookmark.
  - `POST /api/projects` — create bookmark (write JSON file via GitHub API, commit, push).
  - `PUT /api/projects/:id` — update bookmark after refresh (update file via GitHub API with SHA for optimistic locking).
  - Optional: `DELETE /api/projects/:id` — remove bookmark.
- **GitHub Contents API** used for all storage operations in both local development and production. Same code path, same repository, same data. No git binary required in the container.
- **Storage layout:** one JSON file per bookmark under `data/projects/{id}.json`. Each file contains the full project object: `anchorName`, `brands[]`, `opportunities[]`, `crossThemes`, `createdAt`, `updatedAt`, and a user-facing bookmark name.
- **Bookmark ID:** derived from slugified anchor/competitor set or cuid; must be stable across updates.
- **Git commit messages** for bookmark saves: `Save bookmark: {name} [skip ci]` (or similar). Updates on refresh: `Refresh bookmark: {name} [skip ci]`.

### Frontend migration

- React (latest), TypeScript, Tailwind CSS v4 with `@tailwindcss/vite`.
- Structured refactor: extract components (SetupScreen, Dashboard, BrandCard, DetailPanel, BookmarkList, etc.), hooks, API client, and shared types.
- Preserve existing UI design: dark theme, accent green (`#4FD1B3`), Source Serif 4 + Inter typography, Tabler icons.
- Replace hardcoded proxy URL with relative `/api/messages` (Vite dev proxy to Express in development).
- Add bookmark UI: save current project, list saved projects, load project, refresh loaded project.
- Remove `localStorage` as primary persistence; GitHub-backed API becomes source of truth.

### Domain model (project / bookmark)

```
Project {
  id: string
  name: string              // user-given bookmark label
  anchorName: string
  brands: Brand[]
  opportunities: Opportunity[]
  crossThemes: CrossThemes | null
  createdAt: ISO8601 string
  updatedAt: ISO8601 string
}

Brand {
  id, name, isAnchor, tagline, tier, keyMessage, themes[], formats[],
  notable, tone, activity, linkedin, instagram, youtube, differentiator
}
```

Same shapes as the current app; migrated from inline JS to TypeScript interfaces.

### Hosting and deployment

- **Platform:** Google Cloud / Firebase project on **Blaze** (pay-as-you-go) plan — required for outbound Anthropic API calls.
- **Runtime:** Cloud Run, `min-instances: 0`, scale to zero for cost savings.
- **CI/CD:** Cloud Build trigger on push to main branch.
- **Deploy skip for data saves:** Cloud Build trigger configured with `ignoredFiles: ['data/**']`. Pushes that only change files under `data/` do not invoke a build. Code changes under `client/` or `server/` trigger deploy.
- **Container:** Dockerfile builds client, builds server, runs Express serving `dist/` and API.
- **Secrets:** Google Secret Manager (or Cloud Run env from secrets) for `ANTHROPIC_API_KEY` and `GITHUB_TOKEN`. GitHub token needs `contents: read/write` on the repository.

### Local development

- `npm run dev` starts Vite dev server and Express API concurrently.
- Vite proxies `/api/*` to Express.
- Express uses GitHub Contents API with `GITHUB_TOKEN` from `.env` — same shared data as production. Network required for bookmark operations.
- No Docker required locally. No Firestore emulator. No Postgres.

### Auth

- **None for v1.** Internal tool secured by URL obscurity. Anthropic key remains server-side only.
- Google OAuth or HTTP Basic Auth deferred to a future iteration.

### Cost expectations

- Cloud Run, Cloud Build, and GitHub API usage expected to remain within free tiers at current traffic (~$0/month).
- Blaze billing account required; budget alerts recommended.

### API contract (Anthropic proxy)

- Accepts POST body as JSON passthrough to `https://api.anthropic.com/v1/messages`.
- Forwards `x-api-key` and `anthropic-version` headers server-side.
- Returns Anthropic response JSON or structured error.

### Concurrency and conflicts

- Low usage assumed; last-write-wins acceptable.
- GitHub Contents API returns 409 on SHA mismatch; server should retry or surface error.
- Optional: Cloud Run `max-instances: 1` to avoid concurrent writes (not required for v1).

## Testing Decisions

- Test external behavior, not implementation details.
- **Server integration tests:** Express routes with mocked Anthropic and mocked GitHub API clients. Verify proxy forwards correctly; verify project CRUD calls GitHub with expected paths and commit messages.
- **Client tests (optional for v1):** Key user flows with React Testing Library — setup form validation, bookmark list rendering, load bookmark switches view from setup to dashboard.
- **Manual test plan:** Local dev against real GitHub test repo or dedicated branch; verify save/load/refresh; verify code push deploys but data save does not (check Cloud Build history).
- Prior art: none in repo (greenfield migration from single-file Apps Script).

## Out of Scope

- User authentication (Google OAuth, Basic Auth, Firebase Auth).
- Firestore, Postgres, or any traditional database.
- Firebase App Hosting (Next.js/Angular-oriented; not applicable).
- Firebase Hosting CDN (optional follow-up; Cloud Run serves static for v1).
- DigitalOcean deployment.
- YAML storage format (JSON only).
- Separate data repository (same repo with path-based deploy ignore).
- Git binary in container (GitHub API only).
- UI redesign beyond Tailwind migration of existing styles.
- Multi-tenant or per-user bookmark isolation.
- Real-time collaboration or WebSocket updates.
- Export/import UI (Git history provides versioning).
- Rate limiting or API usage quotas per user.
- Custom domain and SSL configuration (can use default Cloud Run URL initially).

## Further Notes

### Migration path from current app

1. Scaffold monorepo (client + server + Dockerfile + cloudbuild.yaml).
2. Port React components and styles from `index.html` into Vite/Tailwind structure.
3. Implement Express Anthropic proxy (replace `Code.gs`).
4. Implement GitHub storage layer and project API routes.
5. Add bookmark UI (list, save, load, refresh).
6. Configure GCP project, secrets, Cloud Run, Cloud Build with `ignoredFiles`.
7. Deploy and verify shared bookmarks work local + production.

### Deploy vs save behavior

| Action | Git change | Cloud Build |
|---|---|---|
| Save bookmark | `data/projects/*.json` only | Skipped (`ignoredFiles`) |
| Refresh bookmark | Update JSON in `data/` | Skipped |
| Push app code | `client/` or `server/` changes | Triggers Cloud Run deploy |

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Server (secret) | Anthropic API proxy |
| `GITHUB_TOKEN` | Server (secret) | Read/write bookmark JSON |
| `GITHUB_REPO` | Server | `owner/repo` for Contents API |
| `GITHUB_DATA_PATH` | Server | `data/projects` |
| `PORT` | Server | Cloud Run port (8080) |

### Reference: original stack

- Apps Script proxy: `Code.gs`
- Frontend monolith: `index.html`
- Browser storage key: `competitor_intel_project_v1`

### Future considerations

- Google OAuth restricted to `@theframeworks.com` when auth is needed.
- Firebase Hosting in front of Cloud Run for CDN caching of static assets.
- Path-filtered GitHub Actions as alternative to Cloud Build.
- Budget alerts on GCP Blaze plan.
