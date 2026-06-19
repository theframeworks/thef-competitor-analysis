# Monorepo scaffold + local dev + Anthropic proxy

**Status:** completed

**Type:** AFK  
**Blocked by:** None — can start immediately  
**User stories:** 1, 2, 14, 19, 22

## What to build

Bootstrap the project structure and prove the full dev loop works end-to-end with a minimal UI that calls Claude through a server-side proxy.

- Root package orchestration for `client/` (Vite + React + TypeScript + Tailwind v4) and `server/` (Express + TypeScript)
- `POST /api/messages` proxies to Anthropic Messages API (parity with current Apps Script `Code.gs`)
- Vite dev server proxies `/api/*` to Express
- `.env.example` for `ANTHROPIC_API_KEY`, `PORT`, and stubbed GitHub vars
- Tailwind theme tokens matching the current dark UI (page bg, card bg, accent green, Source Serif 4 + Inter)
- Minimal proof screen (e.g. "Test Claude" button) that sends one message through `/api/messages` and displays the response

## Acceptance criteria

- [x] `npm install` at repo root succeeds
- [x] `npm run dev` starts client + server; app loads at localhost
- [x] Hot reload works on client file changes
- [x] `POST /api/messages` returns a valid Anthropic response; API key is not visible in browser network tab or bundled JS
- [x] TypeScript compiles without errors for client and server
- [x] Tailwind styles render correctly on the proof screen

## Blocked by

None — can start immediately

---

Source: [`plans/competitor-intel-migration.md`](../plans/competitor-intel-migration.md) Phase 1
