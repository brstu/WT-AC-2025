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

Debugging:
- The scripts log to stdout; view the Actions run logs.
- The script writes `.github/check_result.json` on the runner — useful to debug locally: mimic that file.

Roll-out plan:
1. Test on a small sample or a test repository.
2. Add `STUDENT_DIR_WHITELIST` and `CODEOWNERS` for instructors.
3. Enable workflow in main repo; monitor a few PRs and refine templates.
