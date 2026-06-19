# Competitor Intelligence Monitor

Internal tool for researching competitor positioning, themes, and differentiation. The app proxies Claude API calls server-side and stores bookmarked research sessions as JSON files in this repository via the GitHub Contents API.

## Architecture

```
client/          Vite + React + TypeScript + Tailwind (frontend)
server/          Express API (Anthropic proxy + bookmark CRUD)
data/projects/   Bookmark JSON files (one file per saved session)
legacy/          Deprecated Apps Script app (index.html, Code.gs)
```

A single Express process serves the API and, in production, the built client assets. Local development runs Vite (port 5173) with `/api` proxied to Express (default port 8080).

**Bookmark storage:** In production, bookmarks are committed to `data/projects/` via the GitHub Contents API. Locally, the server auto-detects the best backend: GitHub API when `GITHUB_TOKEN` or `gh auth token` is available, otherwise plain JSON files on disk under `data/projects/`.

**Deploy skip:** Cloud Build triggers ignore `data/**`, so bookmark-only commits do not redeploy. Commit messages also include `[skip ci]` as a secondary safeguard (`Save bookmark: … [skip ci]`, `Refresh bookmark: … [skip ci]`).

## Local development

**Prerequisites:** Node.js 26+, npm, and an Anthropic API key. GitHub credentials are optional locally — see bookmark storage below.

```bash
git clone <repo-url>
cd thef-competitor-analysis
cp .env.example .env   # at minimum set ANTHROPIC_API_KEY (and PORT if 8080 is taken)
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to Express (default port 8080; set `PORT` in `.env` if you need another).

On startup the server logs which bookmark backend is active (`local files` or `GitHub Contents API`).

### Local bookmark storage options

| Setup | What happens |
|---|---|
| Nothing GitHub-related in `.env`, no `gh` login | Bookmarks save to `data/projects/*.json` on disk |
| `gh auth login` (GitHub CLI) | Token auto-detected; bookmarks commit via GitHub API |
| `GITHUB_TOKEN=ghp_...` in `.env` | Bookmarks commit via GitHub API |
| `BOOKMARK_STORAGE=local` | Force disk storage even if a token exists |

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Server-side Anthropic API key |
| `GITHUB_TOKEN` | Prod only | `gh auth token` | PAT for GitHub Contents API (`contents: read/write`) |
| `GITHUB_REPO` | No (local) / Yes (prod) | `git remote origin` | Repository in `owner/repo` form |
| `GITHUB_DATA_PATH` | No | `data/projects` | Path to bookmark JSON files in the repo |
| `BOOKMARK_STORAGE` | No | auto | `github`, `local`, or auto-detect in dev |
| `PORT` | No | `8080` | Express listen port (Vite dev proxy reads the same value) |
| `NODE_ENV` | No | — | Set to `production` for static asset serving |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Express + Vite dev servers |
| `npm run build` | Production build (client + server) |
| `npm start` | Run production server (after build) |
| `npm test` | Run server API tests |
| `npm run typecheck` | TypeScript check across workspaces |

## GCP deployment

Production runs on **Google Cloud Run** with **Cloud Build** CI on push to `main`.

One-time setup (requires Blaze billing):

1. Enable Cloud Run, Cloud Build, Artifact Registry, and Secret Manager.
2. Store `ANTHROPIC_API_KEY` and `GITHUB_TOKEN` in Secret Manager.
3. Configure Cloud Run with `GITHUB_REPO`, `GITHUB_DATA_PATH`, and secret references.
4. Create a Cloud Build trigger on `main` with `ignoredFiles: ['data/**']` so bookmark saves skip deploy.
5. Set `min-instances: 0` for scale-to-zero cost savings.

Build and run locally with Docker:

```bash
docker build -t competitor-intel .
docker run -p 8080:8080 --env-file .env competitor-intel
```

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full GCP operator checklist. See [`docs/PRD.md`](docs/PRD.md) for migration context and acceptance criteria.

## Legacy

The original Google Apps Script application (`index.html`, `Code.gs`) is archived under [`legacy/`](legacy/README.md). It is no longer used or deployed.
