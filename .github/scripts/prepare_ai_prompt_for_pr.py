#!/usr/bin/env python3
"""Fetch PR context, prepare AI prompt, and checkout the PR branch.

Optional: mark the PR with a comment and a label using --mark.
"""
from __future__ import annotations
import json
import os
import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable, Optional
import typer

try:
    import requests
except Exception as exc:  # pragma: no cover - dependency error is fatal
    print("This script requires the requests package: {}".format(exc), file=sys.stderr)
    sys.exit(2)

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_REPO = "brstu/RSiOT-2025"
PREPARE_SCRIPT = ROOT / ".github" / "scripts" / "prepare_AI_prompt.py"


def build_headers(token: str | None) -> dict[str, str]:
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


def fetch_pr(repo: str, pr_number: int, token: str | None) -> dict:
    url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}"
    resp = requests.get(url, headers=build_headers(token), timeout=30)
    if resp.status_code != 200:
        raise RuntimeError(f"Failed to fetch PR #{pr_number}: HTTP {resp.status_code} {resp.text}")
    return resp.json()


def fetch_pr_files(repo: str, pr_number: int, token: str | None) -> list[dict]:
    files: list[dict] = []
    page = 1
    while True:
        url = f"https://api.github.com/repos/{repo}/pulls/{pr_number}/files"
        resp = requests.get(
            url,
            headers=build_headers(token),
            params={"page": page, "per_page": 100},
            timeout=30,
        )
        if resp.status_code != 200:
            raise RuntimeError(
                f"Failed to fetch files for PR #{pr_number}: HTTP {resp.status_code} {resp.text}"
            )
        batch = resp.json()
        if not batch:
            break
        files.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    return files


def post_pr_comment(repo: str, pr_number: int, token: str | None, body: str) -> None:
    """Create an issue comment on the PR."""
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    resp = requests.post(url, headers=build_headers(token), json={"body": body}, timeout=30)
    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"Failed to post comment to PR #{pr_number}: HTTP {resp.status_code} {resp.text}"
        )


def add_pr_label(repo: str, pr_number: int, token: str | None, label: str) -> None:
    """Add a label to the PR issue."""
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/labels"
    # GitHub accepts either {"labels": [label]} or a JSON list payload [label]
    resp = requests.post(url, headers=build_headers(token), json=[label], timeout=30)
    if resp.status_code not in (200, 201):
        raise RuntimeError(
            f"Failed to add label '{label}' to PR #{pr_number}: HTTP {resp.status_code} {resp.text}"
        )


def detect_student_task(paths: Iterable[str]) -> tuple[str, str]:
    pairs: set[tuple[str, str]] = set()
    for path in paths:
        parts = path.split("/")
        if len(parts) < 3 or parts[0] != "students":
            continue
        student = parts[1]
        task_segment = parts[2]
        match = re.search(r"(\d+)", task_segment)
        if not match:
            continue
        task_number = int(match.group(1))
        task_name = f"task_{task_number:02d}"
        pairs.add((student, task_name))
    if not pairs:
        raise RuntimeError("Could not detect student/task from PR file list.")
    if len(pairs) > 1:
        raise RuntimeError(f"Multiple student/task combinations detected: {sorted(pairs)}")
    return pairs.pop()


def run_prepare_script(student: str, task: str) -> str:
    if not PREPARE_SCRIPT.exists():
        raise RuntimeError(f"prepare_AI_prompt.py not found at {PREPARE_SCRIPT}")
    cmd = [sys.executable, str(PREPARE_SCRIPT), "--student", student, "--task", task]
    env = os.environ.copy()
    env.setdefault("PYTHONIOENCODING", "utf-8")
    result = subprocess.run(
        cmd,
        cwd=ROOT,
        capture_output=True,
        text=True,
        env=env,
        encoding="utf-8",
        errors="replace",
    )
    if result.returncode != 0:
        raise RuntimeError(
            "prepare_AI_prompt.py failed with code {}: {}".format(
                result.returncode, result.stderr.strip()
            )
        )
    return result.stdout.strip()


def checkout_pr_branch(pr_number: int) -> None:
    """Create/update local branch for PR to the PR head commit.

    Avoids fetching directly into a checked-out branch (which Git refuses)
    by fetching to FETCH_HEAD and then resetting/creating the local branch.
    """
    local_branch = f"pr-{pr_number}"
    # Fetch PR head into FETCH_HEAD (no destination ref in the refspec!)
    fetch_ref = f"pull/{pr_number}/head"
    fetch_cmd = ["git", "fetch", "origin", fetch_ref]
    # Move/create the local branch to point at FETCH_HEAD even if it's the current branch
    checkout_cmd = ["git", "checkout", "-B", local_branch, "FETCH_HEAD"]
    try:
        subprocess.run(fetch_cmd, cwd=ROOT, check=True)
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(f"git fetch failed: {exc}") from exc
    try:
        subprocess.run(checkout_cmd, cwd=ROOT, check=True)
    except subprocess.CalledProcessError as exc:
        raise RuntimeError(
            "git checkout -B failed (do you have uncommitted changes preventing checkout?): {}".format(exc)
        ) from exc


app = typer.Typer(add_completion=False, help="Prepare AI prompt for a PR or mark it with a comment/label.")


@app.command()
def cli(
    pr: int = typer.Option(..., "--pr", help="Pull request number"),
    repo: str = typer.Option(DEFAULT_REPO, "--repo", help="Repository in owner/name format"),
    token: Optional[str] = typer.Option(None, "--token", help="GitHub token (or use env GITHUB_TOKEN/GH_TOKEN)"),
    skip_checkout: bool = typer.Option(False, "--skip-checkout", help="Do not checkout the PR branch"),
    mark: bool = typer.Option(False, "--mark", help="Only add a comment and a label to the PR"),
    message: Optional[str] = typer.Option(None, "--message", help="Comment body to post (used with --mark)"),
    label: Optional[str] = typer.Option(None, "--label", help="Label to apply: 'rated' or 'defend' (used with --mark)"),
    prompt_file: Optional[Path] = typer.Option(None, "--prompt-file", help="Write the prepared prompt to this path"),
    metadata_json: Optional[Path] = typer.Option(None, "--json-output", help="Write detected metadata (student/task/prompt path) to this JSON file"),
) -> None:
    """CLI entry using Typer. Matches prior argparse behavior, plus early-exit marking."""
    eff_token = token or os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")

    if mark:
        # Validation for mark-only path
        if not message or not label:
            typer.secho("Error: --mark requires both --message and --label", fg=typer.colors.RED, err=True)
            raise typer.Exit(code=2)
        if label.lower() not in ("rated", "defend"):
            typer.secho("Error: --label must be either 'rated' or 'defend'", fg=typer.colors.RED, err=True)
            raise typer.Exit(code=2)
        if not eff_token:
            typer.secho("Error: --mark requires authentication via --token or GITHUB_TOKEN/GH_TOKEN", fg=typer.colors.RED, err=True)
            raise typer.Exit(code=2)
        # Optional title fetch (non-fatal)
        try:
            pr_obj = fetch_pr(repo, pr, eff_token)
            print(f"PR #{pr} -> {pr_obj.get('title', '(no title)')}")
        except Exception as exc:  # pragma: no cover
            print(f"Warning: could not fetch PR details: {exc}")
        print("Adding comment and label as requested by --mark ...")
        post_pr_comment(repo, pr, eff_token, message)
        add_pr_label(repo, pr, eff_token, label.lower())
        print(f"Added label '{label.lower()}' and posted a comment to PR #{pr}.")
        return

    # Normal flow: prepare prompt and optionally checkout
    pr_obj = fetch_pr(repo, pr, eff_token)
    print(f"PR #{pr} -> {pr_obj.get('title', '(no title)')}")

    pr_files = fetch_pr_files(repo, pr, eff_token)
    filenames = [item.get("filename", "") for item in pr_files]
    print("Changed files:")
    for item in pr_files:
        name = item.get("filename", "(unknown)")
        status = item.get("status", "?")
        print(f" - {status:>7} {name}")

    student, task = detect_student_task(filenames)
    print(f"Detected student='{student}' task='{task}'")

    prompt_text = run_prepare_script(student, task)
    print("\n=== Prepared prompt ===\n")
    print(prompt_text)
    print("\n=== End prompt ===\n")

    written_prompt: Optional[Path] = None
    if prompt_file:
        prompt_path = prompt_file
        if not prompt_path.is_absolute():
            prompt_path = Path.cwd() / prompt_path
        prompt_path.parent.mkdir(parents=True, exist_ok=True)
        prompt_path.write_text(prompt_text, encoding="utf-8")
        written_prompt = prompt_path
        print(f"Saved prompt to {prompt_path}")

    if metadata_json:
        meta_path = metadata_json
        if not meta_path.is_absolute():
            meta_path = Path.cwd() / meta_path
        meta_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "pr": pr,
            "repo": repo,
            "student": student,
            "task": task,
            "prompt_file": str(written_prompt) if written_prompt else None,
        }
        meta_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Saved metadata to {meta_path}")

    if not skip_checkout:
        checkout_pr_branch(pr)
        print(f"Checked out local branch pr-{pr}")


def main() -> int:
    app()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
