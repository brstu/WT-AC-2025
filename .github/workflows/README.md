Validate student directory
=========================

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
