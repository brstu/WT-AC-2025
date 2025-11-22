# Validate student directory

This folder contains a GitHub Actions workflow and a small helper script that validates whether a student PR modifies files only inside their assigned directory (defined in `students/students.csv`).

Files
- `.github/workflows/validate-student-dir.yml` - Action triggered on PRs.
- `.github/scripts/check_student_directory.py` - Python script that performs the check.

Exit codes from `check_student_directory.py`:
- 0 — OK (all changed files are inside allowed directory)
- 1 — Generic error or missing event payload
- 2 — Validation failed: changed files outside allowed directory
- 3 — Author not found in `students/students.csv` (manual check required)

Notes
- The action uses the GitHub event payload and `git diff base...head` to list changed files. Ensure the action checks out history (fetch-depth: 0) so the diff works.
- To allow maintainers to edit any file, add them to a whitelist in the script (future enhancement).

## PR AI review

Workflow: `.github/workflows/pr-ai-review.yml`

What it does:
- Runs only when manually dispatched from the *Actions → PR AI review* page (you must provide the PR number and can optionally override the model/label).
- Generates an AI grading prompt via `.github/scripts/prepare_ai_prompt_for_pr.py` and collects the student's files from the PR head.
- Calls `.github/scripts/run_ai_check.py` against GitHub Models using the workflow `AI_GITHUB_TOKEN` environment variable (populated from the repository `GITHUB_TOKEN`, so models access must still be enabled in repo/org settings).
- Posts the AI response back to the PR using `.github/scripts/comment_and_label.py` in "AI review" mode and labels the PR (default label `AI-reviewed`).

Requirements/Setup:
1. Enable GitHub Models for this repository/organization and allow the default `GITHUB_TOKEN` to access Models in the workflow permissions screen (the workflow exports it as `AI_GITHUB_TOKEN` for the model call).
2. (`Optional`) Adjust the default model/label by editing the `AI_REVIEW_MODEL` and `AI_REVIEW_LABEL` env values near the top of the job or override them per-run via the dispatch inputs.
3. Ensure the workflow run permissions include `issues: write`/`pull-requests: write` (already configured in the YAML).
4. To trigger the workflow: open **Actions → PR AI review → Run workflow**, enter the PR number, and (optionally) custom model/label values.

Important: the workflow only copies the `students/<NameLatin>` directory from the PR head into the safe checkout before calling the AI. It never executes code from the contributor's branch while secrets are available.
