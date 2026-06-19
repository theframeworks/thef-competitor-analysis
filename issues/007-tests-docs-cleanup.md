# Tests, documentation, and legacy cleanup

**Type:** AFK  
**Status:** completed  
**Blocked by:** #4  
**User stories:** 19, 25

## What to build

Add automated tests for critical paths, remove legacy files, document operations.

**Tests**
- Server: mock Anthropic + mock GitHub client; test proxy passthrough, project CRUD, commit message format, 409 handling
- Optional client: setup form validation, bookmark list renders

**Cleanup**
- Deprecate or remove `Code.gs` and monolithic `index.html` (keep in git history; note in README)
- Remove Apps Script proxy URL references

**Documentation (`README.md`)**
- Local dev setup (clone, `.env`, `npm run dev`)
- Required env vars table
- GCP deploy overview (one-time setup steps)
- How bookmark storage works (GitHub API, `data/projects/`)
- How deploy skip works (`ignoredFiles` + `[skip ci]`)

## Acceptance criteria

- [x] `npm test` passes (server tests at minimum)
- [x] README enables a new developer to run locally without oral handoff
- [x] Legacy `index.html` / `Code.gs` marked deprecated or removed with README note
- [ ] Production smoke checklist completed (see plan)

## Blocked by

- #4 Bookmark library UI

---

Source: [`plans/competitor-intel-migration.md`](../plans/competitor-intel-migration.md) Phase 6
