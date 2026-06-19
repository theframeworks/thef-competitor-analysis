# Competitor Intelligence Monitor

Internal tool for researching competitor positioning, themes, and differentiation. The app proxies Claude API calls server-side and stores bookmarked research sessions in PostgreSQL (production) or local JSON files (development).

## Architecture

```
client/          Vite + React + TypeScript + Tailwind (frontend)
server/          Express API (Anthropic proxy + bookmark CRUD)
server/prisma/   Postgres schema and migrations
data/projects/   Local dev bookmark JSON (optional; legacy GitHub import source)
legacy/          Deprecated Apps Script app (index.html, Code.gs)
```

A single Express process serves the API and, in production, the built client assets. Local development runs Vite (port 5173) with `/api` proxied to Express (default port 8080).

**Bookmark storage:** In production on DigitalOcean, bookmarks are stored in linked managed Postgres. Locally, the server auto-detects the best backend: Postgres when `DATABASE_URL` is set, GitHub API when a token is available, otherwise plain JSON files on disk under `data/projects/`.

## Local development

**Prerequisites:** Node.js 24, npm, and an Anthropic API key. Postgres is optional locally — see bookmark storage below.

```bash
git clone <repo-url>
cd thef-competitor-analysis
cp .env.example .env   # at minimum set ANTHROPIC_API_KEY (and PORT if 8080 is taken)
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to Express (default port 8080; set `PORT` in `.env` if you need another).

On startup the server logs which bookmark backend is active.

### Local bookmark storage options

| Setup | What happens |
|---|---|
| Nothing GitHub-related in `.env`, no `gh` login | Bookmarks save to `data/projects/*.json` on disk |
| `DATABASE_URL=postgresql://...` in `.env` | Bookmarks save to Postgres |
| `gh auth login` (GitHub CLI) | Token auto-detected; bookmarks commit via GitHub API |
| `GITHUB_TOKEN=ghp_...` in `.env` | Bookmarks commit via GitHub API |
| `BOOKMARK_STORAGE=local` | Force disk storage even if a token or DB URL exists |

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Server-side Anthropic API key |
| `DATABASE_URL` | Prod | — | Postgres connection string |
| `BOOKMARK_STORAGE` | No | auto | `postgres`, `github`, `local`, or auto-detect |
| `GITHUB_TOKEN` | No | `gh auth token` | Legacy PAT for GitHub Contents API |
| `GITHUB_REPO` | No | `git remote origin` | Repository in `owner/repo` form |
| `GITHUB_DATA_PATH` | No | `data/projects` | Path for local/GitHub JSON files |
| `PORT` | No | `8080` | Express listen port (Vite dev proxy reads the same value) |
| `NODE_ENV` | No | — | Set to `production` for static asset serving |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Express + Vite dev servers |
| `npm run build` | Production build (client + server + Prisma client) |
| `npm start` | Run migrations and production server (after build) |
| `npm test` | Run server API tests |
| `npm run typecheck` | TypeScript check across workspaces |
| `npm run db:migrate --workspace=server` | Apply Prisma migrations |
| `npm run db:import-json --workspace=server` | Import JSON bookmarks into Postgres |

## DigitalOcean deployment

Production runs on **DigitalOcean App Platform** with **managed PostgreSQL**.

1. Create a Postgres database cluster (or dev DB) in DigitalOcean.
2. Create an App Platform app from this repo (Node.js buildpack, not Docker).
3. Link the database — `DATABASE_URL` is injected automatically.
4. Set `ANTHROPIC_API_KEY` as an encrypted env var.
5. Use the smallest instance size (`apps-s-1vcpu-0.5gb`, ~$5/mo).

Build and run locally:

```bash
npm ci && npm run build
NODE_ENV=production ANTHROPIC_API_KEY=sk-ant-... DATABASE_URL=postgresql://... npm start
```

Optional Docker smoke test:

```bash
docker build -t competitor-intel .
docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e DATABASE_URL=postgresql://... \
  -e NODE_ENV=production \
  competitor-intel
```

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full operator checklist. See [`docs/PRD.md`](docs/PRD.md) for product context.

## Legacy

The original Google Apps Script application (`index.html`, `Code.gs`) is archived under [`legacy/`](legacy/README.md). It is no longer used or deployed.
