# DigitalOcean App Platform deployment

Production runs on **DigitalOcean App Platform** with an app-attached **dev PostgreSQL database** for bookmark storage. Local development uses **SQLite** (`data/dev.db`).

## Architecture

```text
git push (main) → DO App Platform → Node.js build → Web service (port 8080)
                                              ↘ App dev Postgres (bookmarks)
```

## Cheapest setup

| Component | Recommendation | Approx. cost |
|-----------|----------------|--------------|
| Web service | `apps-s-1vcpu-0.5gb` (512 MiB) | $5/mo |
| Database | App Platform dev database (`db`, PG 18) | smallest option |

Dev databases only accept connections from the app and have no automated backups. To reach one, run `doctl apps console <app-id> web`, then `psql "$DATABASE_URL"`.

Use the app spec at [`.do/app.yaml`](../.do/app.yaml). Region: London (`lon1`).

## Environment variables (production)

| Variable | Required | Purpose |
|----------|----------|---------|
| `ANTHROPIC_API_KEY` | Yes | Server-side Anthropic API key |
| `DATABASE_URL` | Yes | Postgres connection string (injected when DB is linked) |
| `PORT` | No | Default `8080` |

`NODE_ENV=production` is set by `pnpm start`. The buildpack reads Node 24 from `engines.node` and the pnpm version from `packageManager`. Keep both in sync with `mise.toml`.

## Deploy steps

1. Create an App Platform app from this repo (Node.js buildpack).
2. Build command: `pnpm build`. Run command: `pnpm start`. The buildpack runs `pnpm install` itself.
3. Add a dev database named `db` and set `ANTHROPIC_API_KEY` as a secret.
5. HTTP port: **8080**, instance size: **512 MiB**.

On each deploy, `pnpm start` runs `prisma migrate deploy` (Postgres) then starts the server.

## Migrate legacy JSON bookmarks

```bash
DATABASE_URL="postgresql://..." pnpm --filter server db:import-json
```

## Local vs production databases

| Environment | Engine | Schema sync |
|-------------|--------|-------------|
| Local dev | SQLite (`data/dev.db`) | `prisma db push` (runs automatically on `pnpm dev`) |
| Production | PostgreSQL | `prisma migrate deploy` (runs on `pnpm start`) |

Two Prisma schema files share the same model:

- `server/prisma/schema.sqlite.prisma` — local dev
- `server/prisma/schema.postgres.prisma` — production migrations
