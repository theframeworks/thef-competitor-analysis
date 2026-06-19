# Migration issues

Vertical slices for the Competitor Intelligence Monitor migration.

Source: [`plans/competitor-intel-migration.md`](../plans/competitor-intel-migration.md) · [`docs/PRD.md`](../docs/PRD.md)

## Dependency graph

```text
#1 ──┬──► #2 ──┐
     │         ├──► #4 ──► #7
     └──► #3 ──┘
```

#2 and #3 can run in parallel after #1.

## Issues

| # | File | Type | Blocked by |
|---|------|------|------------|
| 1 | [001-monorepo-scaffold-anthropic-proxy.md](./001-monorepo-scaffold-anthropic-proxy.md) | AFK | — |
| 2 | [002-port-full-research-ui.md](./002-port-full-research-ui.md) | AFK | #1 |
| 3 | [003-github-storage-bookmark-api.md](./003-github-storage-bookmark-api.md) | AFK | #1 |
| 4 | [004-bookmark-library-ui.md](./004-bookmark-library-ui.md) | AFK | #2, #3 |
| 7 | [007-tests-docs-cleanup.md](./007-tests-docs-cleanup.md) | AFK | #4 |

Production deploy is documented in [`docs/DEPLOY.md`](../docs/DEPLOY.md) (DigitalOcean App Platform + Postgres).

All issues are tracked locally in this directory only.
