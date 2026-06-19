# DigitalOcean App Platform deployment

Production runs on **DigitalOcean App Platform** with **managed PostgreSQL** for bookmark storage. Local development uses **SQLite** (`data/dev.db`).

## Architecture

```text
git push (main) → DO App Platform → Node.js build → Web service (port 8080)
                                              ↘ Managed Postgres (bookmarks)
```

## Cheapest setup

| Component | Recommendation | Approx. cost |
|-----------|----------------|--------------|
| Web service | `apps-s-1vcpu-0.5gb` (512 MiB) | $5/mo |
| Database | Managed Postgres, smallest tier | from ~$15/mo |

Use the app spec at [`.do/app.yaml`](../.do/app.yaml). Region: London (`lon1`).

## Environment variables (production)

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | Server-side Anthropic API key |
| `DATABASE_URL` | Yes | Postgres connection string (injected when DB is linked) |
| `PORT` | No | Default `8080` |

`NODE_ENV=production` is set by `npm start`. Node 24 is pinned via `.nvmrc` and `engines`.

## Deploy steps

1. Create a Postgres cluster in DigitalOcean.
2. Create an App Platform app from this repo (Node.js buildpack).
3. Build command: `npm ci && npm run build`. Run command: `npm start`.
4. Link the database and set `ANTHROPIC_API_KEY` as a secret.
5. HTTP port: **8080**, instance size: **512 MiB**.

On each deploy, `npm start` runs `prisma migrate deploy` (Postgres) then starts the server.

## Migrate legacy JSON bookmarks

```bash
DATABASE_URL="postgresql://..." npm run db:import-json --workspace=server
```

## Local vs production databases

| Environment | Engine | Schema sync |
|-------------|--------|-------------|
| Local dev | SQLite (`data/dev.db`) | `prisma db push` (runs automatically on `npm run dev`) |
| Production | PostgreSQL | `prisma migrate deploy` (runs on `npm start`) |

Two Prisma schema files share the same model:

- `server/prisma/schema.sqlite.prisma` — local dev
- `server/prisma/schema.postgres.prisma` — production migrations
