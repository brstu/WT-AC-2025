Validate student directory — Actions notes
=======================================

This page explains how to test and deploy the `validate-student-dir` workflow and related scripts.

Quick checklist before enabling:
- Settings → Actions → Workflow permissions = Read and write permissions
- (optional) Add secret `STUDENT_DIR_WHITELIST` with comma-separated usernames
- (optional) Add `.github/CODEOWNERS` to list instructors/maintainers
- Create label `invalid-directory` in Issues → Labels

Manual run (recommended for testing):
- Use Actions → Validate student directory → Run workflow → set `pr_number` to a PR you control.
- Or use GitHub CLI:
  gh workflow run validate-student-dir.yml -f pr_number=123 -R owner/repo

How the manual run works:
- If `pr_number` is provided, the workflow downloads the PR payload and runs the same checks as for webhook PR events.

Testing tips:
- Create a test PR that modifies a file outside your own `./students/...` folder; the workflow should comment & label the PR.
- Use a forked PR to verify behavior without writing repo secrets (note: secrets are not available to forked workflows).
- When violations are found the validation job now fails, labels the PR, posts guidance, and closes the pull request automatically — the status check must be green before merging.
- If один PR затрагивает несколько `task_XX`, проверка завершится ошибкой: каждое задание должно отправляться отдельным PR.

Debugging:
- The scripts log to stdout; view the Actions run logs.
- The script writes `.github/check_result.json` on the runner — useful to debug locally: mimic that file.
- Changed files are now sourced exclusively through the GitHub REST API (`GET /repos/{owner}/{repo}/pulls/{pull_number}/files`). Ensure the workflow has a valid `GITHUB_TOKEN` and watch for `Fetched ... changed files via GitHub API` log entries.
- New debug step: the workflow now prints the `validate` step outcome and the contents of `.github/check_result.json` (including `exit_code`) in the logs. This helps diagnose why a run passed or failed.

Exit codes produced by the validator (written to `.github/check_result.json`):
- `0` — success; all changed files are within the allowed directory.
- `2` — one or more files were changed outside the allowed directory (validation failure).
- `3` — the PR author could not be mapped to `students/students.csv` (manual check required).
- `4` — the PR touches more than one `task_XX` directory; one PR must contain a single task.

Note about comment/label step:
- The `Comment, label, and close PR on failure` step runs only when the validation step fails. The debug step runs always and prints details you can copy into issues for troubleshooting.

No `jq` dependency: the workflow prints `exit_code` using a small Python one-liner, so runners don't need `jq` installed.

Roll-out plan:
1. Test on a small sample or a test repository.
2. Add `STUDENT_DIR_WHITELIST` and `CODEOWNERS` for instructors.
3. Enable workflow in main repo; monitor a few PRs and refine templates.
