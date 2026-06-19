# DigitalOcean App Platform deployment

Production runs on **DigitalOcean App Platform** with **managed PostgreSQL** for bookmark storage.

## Architecture

```text
git push (main) → DO App Platform → Node.js build → Web service (port 8080)
                                              ↘ Managed Postgres (bookmarks)
```

One Express process serves the API and the built client. Bookmarks are stored in Postgres — no Git commits on save.

## Cheapest setup

| Component | Recommendation | Approx. cost |
|-----------|----------------|--------------|
| Web service | `apps-s-1vcpu-0.5gb` (512 MiB) | $5/mo |
| Database | Managed Postgres, smallest tier (link separately) | from ~$15/mo |

Use the app spec at [`.do/app.yaml`](../.do/app.yaml) as a starting point. Instance size is already set to the smallest slug.

## Prerequisites

- DigitalOcean account
- GitHub repo connected to App Platform (or deploy via `doctl`)
- Anthropic API key
- Managed Postgres cluster (create in DO, then link to the app)

## One-time setup

### 1. Create the Postgres database

In the DigitalOcean control panel:

1. **Databases → Create Database Cluster** — PostgreSQL, pick the smallest size that fits your needs.
2. Or, for minimal internal use only, add a dev database in the app spec (see comments in `.do/app.yaml`).

Note the connection string; App Platform can inject it automatically when the database is linked to the app.

### 2. Create the App Platform app

**Option A — Control panel**

1. **Apps → Create App → GitHub** — select this repository, branch `main`.
2. App Platform detects **Node.js** from the repo (see `.nvmrc` / `engines` in `package.json`).
3. Build command: `npm ci && npm run build`. Run command: `npm start`.
4. Set HTTP port to **8080**.
5. Instance size: **512 MiB / 0.5 GB RAM** (`apps-s-1vcpu-0.5gb`).
6. **Resources → Add Resource → Database** — link your Postgres cluster (or create a dev DB).
7. **Settings → App-Level Environment Variables:**

| Variable | Type | Value |
|----------|------|--------|
| `ANTHROPIC_API_KEY` | Secret | Your Anthropic API key |
| `DATABASE_URL` | Secret | Injected when DB is linked (`${db.DATABASE_URL}`) |
| `NODE_ENV` | Plain | `production` |

**Option B — App spec + doctl**

```bash
doctl apps create --spec .do/app.yaml
```

After linking a database in the control panel, update `DATABASE_URL` in the spec to `${your-db-name.DATABASE_URL}`.

### 3. Deploy

Push to `main` (if auto-deploy is enabled) or trigger a manual deploy. On each deploy:

1. App Platform runs `npm ci && npm run build` (Node 24, Prisma generate included).
2. The service starts with `npm start`, which runs `prisma migrate deploy` then the server.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | Server-side Anthropic API key |
| `DATABASE_URL` | Yes (prod) | Postgres connection string from linked database |
| `NODE_ENV` | Yes (prod) | Set to `production` |
| `PORT` | No | Default `8080` (DO sets this automatically) |
| `BOOKMARK_STORAGE` | No | Force `postgres`, `local`, or `github` |

GitHub variables (`GITHUB_TOKEN`, `GITHUB_REPO`) are only needed if you use legacy GitHub bookmark storage in development.

## Migrate existing bookmarks

If you have JSON files under `data/projects/` or in GitHub from the old storage:

```bash
DATABASE_URL="postgresql://..." npm run db:import-json --workspace=server
```

Pass a directory path to import from a custom location. Existing IDs are skipped.

## Local production-like testing

```bash
npm ci && npm run build
NODE_ENV=production \
  ANTHROPIC_API_KEY=sk-ant-... \
  DATABASE_URL=postgresql://... \
  npm start
```

Or with Docker (optional):

```bash
docker build -t competitor-intel .
docker run -p 8080:8080 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e DATABASE_URL=postgresql://... \
  -e NODE_ENV=production \
  competitor-intel
```

## Post-deploy verification

- [ ] App URL loads the UI
- [ ] Research session works (`/api/messages`)
- [ ] Save a bookmark → appears in list after refresh
- [ ] Bookmark persists after redeploy (data in Postgres, not the container)
- [ ] `ANTHROPIC_API_KEY` and `DATABASE_URL` are set as encrypted env vars only

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Build fails on Prisma | `server/prisma/schema.prisma` and migrations are in the repo |
| 503 on bookmark routes | `DATABASE_URL` is set and the database is reachable from the app |
| Migration errors on start | Postgres user can create tables; run `npm run db:migrate --workspace=server` locally against the same URL |
| 500 on `/api/messages` | `ANTHROPIC_API_KEY` secret is set |

## Legacy GCP deployment

The previous Cloud Run setup (`cloudbuild.yaml`, GCP Secret Manager) is no longer the primary path. Those files remain for reference but are not required for DigitalOcean deployment.
