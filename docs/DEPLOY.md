# GCP Cloud Run deployment

Repo-side CI/CD is defined in [`cloudbuild.yaml`](../cloudbuild.yaml). One-time GCP console setup is **human-in-the-loop (HITL)** — an operator with project access must complete the steps below.

## Architecture

```text
git push (main) → Cloud Build trigger → Docker build → Artifact Registry → Cloud Run
```

Bookmark saves commit only `data/projects/*.json` and should **not** redeploy the app. Two safeguards:

1. Cloud Build trigger `ignoredFiles: ['data/**']` — data-only pushes skip the build.
2. Bookmark commit messages include `[skip ci]` as a secondary safeguard.

## Prerequisites

- GCP/Firebase project on the **Blaze** (pay-as-you-go) billing plan
- `gcloud` CLI authenticated with Owner or equivalent permissions
- GitHub repo connected to Cloud Build (2nd gen recommended) or manual `gcloud builds submit`

## One-time GCP setup (HITL checklist)

### 1. Enable APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --project=PROJECT_ID
```

### 2. Artifact Registry repository

```bash
gcloud artifacts repositories create competitor-intel \
  --repository-format=docker \
  --location=us-central1 \
  --project=PROJECT_ID
```

Adjust `competitor-intel` and `us-central1` if you override `_REPOSITORY` / `_REGION` in the trigger.

### 3. Secret Manager secrets

Create secrets (values **not** in this repo):

```bash
echo -n 'sk-ant-...' | gcloud secrets create ANTHROPIC_API_KEY \
  --data-file=- --project=PROJECT_ID

echo -n 'ghp_...' | gcloud secrets create GITHUB_TOKEN \
  --data-file=- --project=PROJECT_ID
```

Grant the Cloud Run service account access:

```bash
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format='value(projectNumber)')
RUN_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in ANTHROPIC_API_KEY GITHUB_TOKEN; do
  gcloud secrets add-iam-policy-binding "$SECRET" \
    --member="serviceAccount:${RUN_SA}" \
    --role="roles/secretmanager.secretAccessor" \
    --project=PROJECT_ID
done
```

### 4. Cloud Build permissions

Cloud Build’s service account needs permission to deploy to Cloud Run and push images:

```bash
PROJECT_NUMBER=$(gcloud projects describe PROJECT_ID --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

for ROLE in roles/run.admin roles/iam.serviceAccountUser roles/artifactregistry.writer; do
  gcloud projects add-iam-policy-binding PROJECT_ID \
    --member="serviceAccount:${CB_SA}" \
    --role="$ROLE"
done
```

### 5. Cloud Build trigger

Create a trigger on push to `main` with **ignored files** so bookmark saves do not rebuild:

**Console:** Cloud Build → Triggers → Create trigger

| Setting | Value |
|---------|--------|
| Event | Push to branch |
| Branch | `^main$` |
| Configuration | Cloud Build configuration file |
| Location | Repository root |
| Cloud Build config | `cloudbuild.yaml` |
| **Ignored files** | `data/**` |

**Substitution variables** (match your project):

| Variable | Example |
|----------|---------|
| `_REGION` | `us-central1` |
| `_SERVICE_NAME` | `competitor-intel` |
| `_REPOSITORY` | `competitor-intel` |
| `_GITHUB_REPO` | `theframeworks/thef-competitor-analysis` |

`PROJECT_ID` is set automatically by Cloud Build.

**gcloud (2nd gen GitHub connection):**

```bash
gcloud builds triggers create github \
  --name="deploy-competitor-intel" \
  --repo-name="REPO_NAME" \
  --repo-owner="ORG_OR_USER" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml" \
  --ignored-files="data/**" \
  --substitutions="_REGION=us-central1,_SERVICE_NAME=competitor-intel,_REPOSITORY=competitor-intel,_GITHUB_REPO=owner/repo" \
  --project=PROJECT_ID
```

### 6. Budget alert (recommended)

Cloud Console → Billing → Budgets & alerts → create a monthly budget (e.g. $10) with email notifications.

## Cloud Run service configuration

`cloudbuild.yaml` deploys with:

| Setting | Value |
|---------|--------|
| Port | `8080` |
| Min instances | `0` (scale to zero) |
| Max instances | `1` (optional; reduces concurrent GitHub writes) |
| Memory | `512Mi` |
| CPU | `1` |
| Auth | `--allow-unauthenticated` (internal URL only for v1) |

**Environment variables (non-secret):**

| Variable | Value |
|----------|--------|
| `GITHUB_REPO` | `owner/repo` (via `_GITHUB_REPO` substitution) |
| `GITHUB_DATA_PATH` | `data/projects` |
| `NODE_ENV` | `production` |

**Secrets (Secret Manager → env):**

| Env var | Secret |
|---------|--------|
| `ANTHROPIC_API_KEY` | `ANTHROPIC_API_KEY:latest` |
| `GITHUB_TOKEN` | `GITHUB_TOKEN:latest` |

Secrets are mounted at runtime; they are **not** copied into the Docker image (see `.dockerignore`).

## Manual deploy (without trigger)

```bash
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_REGION=us-central1,_SERVICE_NAME=competitor-intel,_REPOSITORY=competitor-intel,_GITHUB_REPO=owner/repo \
  --project=PROJECT_ID
```

## Post-deploy verification (HITL)

- [ ] Open the Cloud Run HTTPS URL; app loads
- [ ] Run a short research session via the UI
- [ ] Save a bookmark → JSON appears on GitHub under `data/projects/`
- [ ] Cloud Build **does not** run on bookmark-only commits (check Build history)
- [ ] Push a trivial code change → Cloud Build runs → new revision serves traffic
- [ ] Confirm secrets are in Secret Manager only (not in image layers or repo)

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Build fails on push | Cloud Build history → logs; IAM for Cloud Build SA |
| 500 on `/api/messages` | Secret `ANTHROPIC_API_KEY` exists and Run SA has accessor |
| Bookmark save fails | `GITHUB_TOKEN` secret; PAT has `contents: read/write` |
| Deploy runs on data save | Trigger `ignoredFiles` includes `data/**`; commit has `[skip ci]` |
