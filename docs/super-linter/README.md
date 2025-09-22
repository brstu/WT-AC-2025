# Run GitHub Super‑Linter locally (Windows)

This guide shows how to run Super‑Linter in Docker with the same settings used in `.github/workflows/lint.yml`.

## Prerequisites

- Docker Desktop installed and running (Linux container mode)
- Run commands from the repository root

Optional (first run may be faster):

```powershell
docker pull ghcr.io/github/super-linter:slim-v6
```

## Run with the same env as CI

Multi‑line (PowerShell backticks for readability):

```powershell
docker run --rm `
  -e RUN_LOCAL=true `
  -e DEFAULT_BRANCH=main `
  -e VALIDATE_ALL_CODEBASE=true `
  -e VALIDATE_MARKDOWN=true `
  -e VALIDATE_HTML=true `
  -e VALIDATE_JAVASCRIPT_ES=true `
  -e VALIDATE_CSS=true `
  -e VALIDATE_YAML=true `
  -e VALIDATE_JSON=true `
  -e VALIDATE_TYPESCRIPT_ES=true `
  -e VALIDATE_CSHARP=true `
  -e VALIDATE_DOCKERFILE_HADOLINT=true `
  -e VALIDATE_SQL=true `
  -e VALIDATE_XML=true `
  -e VALIDATE_POWERSHELL=true `
  -e VALIDATE_BASH=true `
  -e VALIDATE_PYTHON=true `
  -v "${PWD}:/tmp/lint" `
  ghcr.io/github/super-linter:slim-v6
```

One‑liner:

```powershell
docker run --rm -e RUN_LOCAL=true -e DEFAULT_BRANCH=main -e VALIDATE_ALL_CODEBASE=true -e VALIDATE_MARKDOWN=true -e VALIDATE_HTML=true -e VALIDATE_JAVASCRIPT_ES=true -e VALIDATE_CSS=true -e VALIDATE_YAML=true -e VALIDATE_JSON=true -e VALIDATE_TYPESCRIPT_ES=true -e VALIDATE_CSHARP=true -e VALIDATE_DOCKERFILE_HADOLINT=true -e VALIDATE_SQL=true -e VALIDATE_XML=true -e VALIDATE_POWERSHELL=true -e VALIDATE_BASH=true -e VALIDATE_PYTHON=true -v "${PWD}:/tmp/lint" ghcr.io/github/super-linter:slim-v6
```

Notes
- `RUN_LOCAL=true` makes `GITHUB_TOKEN` optional for local runs
- The bind mount `-v "${PWD}:/tmp/lint"` must point to the repo root so Super‑Linter can see `.git` and your config (e.g., `.markdownlint.yaml`)
- These env flags mirror `.github/workflows/lint.yml`

## Variations

- Lint only a subfolder (faster, not CI‑equivalent):
  - Navigate into the subfolder and run the same command; or mount the sub‑path instead of `${PWD}`
- Speed up re‑runs: keep the image cached (`docker pull` occasionally)

## Troubleshooting

- "docker: command not found" or exit code 1
  - Ensure Docker Desktop is installed, running, and in Linux container mode
- Permission/path errors
  - Run from the repo root; verify the `-v` path resolves on Windows PowerShell
- Unexpected markdown rule failures
  - Confirm your local run sees `.markdownlint.yaml` inside the container (`/tmp/lint/.markdownlint.yaml`)
