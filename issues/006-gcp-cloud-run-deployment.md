# GCP Cloud Run deployment + CI

**Type:** HITL  
**Status:** completed (repo artifacts done; HITL GCP console steps remain for operator)  
**Blocked by:** #5  
**User stories:** 15, 17, 18, 23

## What to build

Deploy to Google Cloud Run with automated CI. Requires GCP/Firebase console access and Blaze billing.

**Cloud Build (`cloudbuild.yaml`)**
- Build Docker image → push to Artifact Registry → deploy to Cloud Run
- Trigger on push to `main`
- **`ignoredFiles`: `['data/**']`** on trigger so bookmark saves do not rebuild

**GCP setup**
- Blaze plan project
- Enable Cloud Run, Cloud Build, Artifact Registry, Secret Manager
- Secrets: `ANTHROPIC_API_KEY`, `GITHUB_TOKEN`
- Cloud Run env: `GITHUB_REPO`, `GITHUB_DATA_PATH`, secret refs
- `min-instances: 0`, `max-instances: 1` (optional)
- Budget alert recommended

## Repo artifacts

- [`cloudbuild.yaml`](../cloudbuild.yaml) — build, push, deploy with `_REGION`, `_SERVICE_NAME`, `_REPOSITORY`, `_GITHUB_REPO` substitutions (`PROJECT_ID` built-in)
- [`docs/DEPLOY.md`](../docs/DEPLOY.md) — HITL checklist: APIs, Artifact Registry, secrets, IAM, trigger with `ignoredFiles`, verification steps
- [`.gcloudignore`](../.gcloudignore) — excludes `data/`, docs, and local artifacts from Cloud Build uploads

## Acceptance criteria

- [x] Push to `main` with code changes triggers Cloud Build and deploys new Cloud Run revision — *trigger config documented in `docs/DEPLOY.md`; verify after operator completes GCP setup*
- [x] Push that only changes `data/projects/*.json` does **not** trigger Cloud Build — *trigger `ignoredFiles: data/**` documented; verify after GCP setup*
- [ ] Production HTTPS URL loads app, runs research, saves/loads bookmarks — *operator verification after deploy*
- [x] Secrets in Secret Manager, not in repo or image — *`cloudbuild.yaml` uses `--set-secrets`; `.dockerignore` excludes `.env`; secret creation is HITL*
- [ ] Cloud Build history verifiable in GCP console — *operator verification after first deploy*

## Blocked by

- #5 Production build + Docker container

---

Source: [`plans/competitor-intel-migration.md`](../plans/competitor-intel-migration.md) Phase 5 (deploy half)
