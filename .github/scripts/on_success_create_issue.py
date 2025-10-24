#!/usr/bin/env python3
"""On validation success: label PR as 'Dir approved' and create an issue.

Inputs via env:
- REPO: owner/repo
- PR_NUMBER: number
- GITHUB_TOKEN: token
- CHECK_RESULT_PATH: path to .github/check_result.json (optional)

Issue requirements:
- Title: [LABS][NameLatin][taskN]
- Body contains:
  NameLatin = ...\n
  taskN = ...\n
This script detects NameLatin and task folder from check_result.json and changed files.
"""
import os
import json
import sys
import logging
from typing import List

import re

try:
    import requests
except Exception:
    print('requests not installed')
    sys.exit(1)


LOG = logging.getLogger('on_success_create_issue')
LOG.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
LOG.addHandler(handler)


def get_pr_changed_files(repo: str, pr_number: str, headers: dict) -> List[str]:
    url = f'https://api.github.com/repos/{repo}/pulls/{pr_number}/files?per_page=100'
    files = []
    while url:
        r = requests.get(url, headers=headers)
        if r.status_code != 200:
            LOG.warning('Failed to fetch PR files: %s %s', r.status_code, r.text)
            break
        data = r.json()
        for item in data:
            name = item.get('filename')
            if name:
                files.append(name)
        # pagination
        link = r.headers.get('Link', '')
        next_url = None
        for part in link.split(','):
            part = part.strip()
            if part.endswith('rel="next"'):
                m = re.match(r'<([^>]+)>;\s*rel="next"', part)
                if m:
                    next_url = m.group(1)
        url = next_url
    return files


def add_label(repo: str, pr_number: str, headers: dict, label: str) -> int:
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/labels'
    r = requests.post(url, headers=headers, json=[label])
    LOG.info('add_label status=%s', r.status_code)
    return r.status_code


def ensure_label(repo: str, pr_number: str, headers: dict, label: str):
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/labels'
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        names = [x['name'] for x in r.json()]
        if label in names:
            return
    add_label(repo, pr_number, headers, label)


def create_issue(repo: str, headers: dict, title: str, body: str) -> int:
    url = f'https://api.github.com/repos/{repo}/issues'
    r = requests.post(url, headers=headers, json={"title": title, "body": body})
    LOG.info('create_issue status=%s', r.status_code)
    if r.status_code in (200,201):
        return r.json().get('number')
    return 0


def comment_pr(repo: str, pr_number: str, headers: dict, body: str):
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/comments'
    r = requests.post(url, headers=headers, json={'body': body})
    LOG.info('comment_pr status=%s', r.status_code)


def detect_student_and_task(files: List[str], fallback_allowed: str | None) -> tuple[str, str]:
    # Expect paths like students/NameLatin/task_XX/...
    student = ''
    task = ''
    for f in files:
        m = re.match(r'^students/([^/]+)/((task_|Task_)(\d{1,2}))/.*', f)
        if m:
            student = m.group(1)
            task = m.group(2)
            break
        m2 = re.match(r'^students/([^/]+)/(task_\d{2})/.*', f)
        if m2:
            student = m2.group(1)
            task = m2.group(2)
            break
    if not student and fallback_allowed:
        # allowed path like students/NameLatin
        m = re.match(r'/?\.?/?students/([^/]+)', fallback_allowed.replace('\\','/'))
        if m:
            student = m.group(1)
    if not task:
        # try to find explicit task folder among files
        for f in files:
            m = re.search(r'(task_\d{2})', f, re.IGNORECASE)
            if m:
                task = m.group(1)
                break
    return student, task


def main() -> int:
    repo = os.environ.get('REPO')
    pr = os.environ.get('PR_NUMBER')
    token = os.environ.get('GITHUB_TOKEN')
    path = os.environ.get('CHECK_RESULT_PATH', '.github/check_result.json')

    if not repo or not pr or not token:
        LOG.error('Missing required environment variables (REPO, PR_NUMBER, GITHUB_TOKEN)')
        return 1

    headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}

    # Only proceed if success
    allowed = None
    if os.path.exists(path):
        try:
            data = json.load(open(path, encoding='utf-8'))
            if int(data.get('exit_code', 1)) != 0:
                LOG.info('Validation not successful, skipping success handler')
                return 0
            allowed = data.get('allowed')
        except Exception:
            pass

    files = get_pr_changed_files(repo, pr, headers)
    student, task = detect_student_and_task(files, allowed)
    if not student or not task:
        LOG.warning('Could not detect student or task from PR files')
        # still label as approved, but skip issue creation
        ensure_label(repo, pr, headers, 'Dir approved')
        return 0

    # Normalize task to task_N (no leading zeros in title as per requirement)
    m = re.search(r'(\d{1,2})', task)
    taskN = f'task{int(m.group(1))}' if m else task

    ensure_label(repo, pr, headers, 'Dir approved')

    title = f'[LABS][{student}][{taskN}]'
    body = f'NameLatin = {student}\n\n' \
           f'taskN = {taskN}\n\n' \
           f'(Auto-created by CI on directory approval)'

    issue_number = create_issue(repo, headers, title, body)
    if issue_number:
        comment_pr(repo, pr, headers, f'Created tracking issue #{issue_number} for AI check: {title}')
    else:
        LOG.warning('Issue creation failed')

    return 0


if __name__ == '__main__':
    sys.exit(main())
