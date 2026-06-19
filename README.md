# Competitor Intelligence Monitor

Internal tool for researching competitor positioning, themes, and differentiation. The app proxies Claude API calls server-side and stores bookmarked research sessions in a database (SQLite locally, PostgreSQL in production).

## Architecture

```
client/          Vite + React + TypeScript + Tailwind (frontend)
server/          Express API (Anthropic proxy + bookmark CRUD)
server/prisma/   Database schemas (SQLite dev, PostgreSQL prod)
data/dev.db      Local SQLite database (created on first dev run)
legacy/          Deprecated Apps Script app (index.html, Code.gs)
```

A single Express process serves the API and, in production, the built client assets. Local development runs Vite (port 5173) with `/api` proxied to Express (default port 8080).

**Bookmark storage:** SQLite file at `data/dev.db` locally (zero setup). PostgreSQL on DigitalOcean in production. One Prisma data layer for both.

## Local development

**Prerequisites:** Node.js 24, npm, and an Anthropic API key.

```bash
git clone <repo-url>
cd thef-competitor-analysis
cp .env.example .env   # at minimum set ANTHROPIC_API_KEY
npm install
npm run dev
```

On first run, the server creates/syncs the SQLite schema at `data/dev.db`. Open http://localhost:5173.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Server-side Anthropic API key |
| `DATABASE_URL` | No (local) | `file:../../data/dev.db` | SQLite file or Postgres connection string |
| `PORT` | No | `8080` | Express listen port (Vite dev proxy reads the same value) |
| `NODE_ENV` | No | — | Set to `production` for static asset serving |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Sync SQLite schema and start Express + Vite |
| `npm run build` | Production build (client + server + Prisma client) |
| `npm start` | Run Postgres migrations and production server |
| `npm test` | Run server tests (SQLite) |
| `npm run typecheck` | TypeScript check across workspaces |
| `npm run db:push --workspace=server` | Sync local SQLite schema |
| `npm run db:migrate --workspace=server` | Apply Postgres migrations (production) |
| `npm run db:import-json --workspace=server` | Import legacy JSON bookmarks into the database |

## DigitalOcean deployment

Production runs on **DigitalOcean App Platform** with **managed PostgreSQL**.

1. Create a Postgres database cluster in DigitalOcean.
2. Create an App Platform app from this repo (Node.js buildpack).
3. Link the database — `DATABASE_URL` is injected automatically.
4. Set `ANTHROPIC_API_KEY` as an encrypted env var.
5. Use the smallest instance size (`apps-s-1vcpu-0.5gb`, ~$5/mo).

Build and run locally:

```bash
npm ci && npm run build
NODE_ENV=production ANTHROPIC_API_KEY=sk-ant-... DATABASE_URL=postgresql://... npm start
```

See [`docs/DEPLOY.md`](docs/DEPLOY.md) for the full operator checklist.

## Legacy

The original Google Apps Script application (`index.html`, `Code.gs`) is archived under [`legacy/`](legacy/README.md). JSON files under `data/projects/` can be imported with `db:import-json`.
