#!/usr/bin/env python3
"""Read check_result.json and comment + label the PR on failure.

Features added:
- Logging (stdout)
- Avoid duplicate labels (checks existing labels first)
- Avoid duplicate bot comments (searches comments for identical body or marker)
- Short and long templates for comments
"""
import os
import json
import sys
import logging
from typing import Any, List

try:
    import requests
except Exception:
    print('requests not installed')
    sys.exit(1)


LOG = logging.getLogger('comment_and_label')
LOG.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s: %(message)s'))
LOG.addHandler(handler)


SHORT_TEMPLATE = '⚠️ Обнаружены изменения вне вашей разрешённой директории. Пожалуйста, перенесите изменения в свою папку.'

LONG_TEMPLATE = (
    '⚠️ Обнаружены изменения вне вашей разрешённой директории.\n\n'
    'Разрешённая директория: **{allowed}**\n\n'
    'Изменённые файлы, которые нужно перенести:\n{files}\n\n'
    'Инструкция: перенесите ваши файлы в указанную папку students/NameLatin/task_xx/ и создайте новый PR. Если вы считаете, что изменения вне папки обоснованы, ответьте на этот комментарий и преподаватель рассмотрит ваш случай.'
)

MULTI_TASK_TEMPLATE = (
    '⚠️ В одном pull request обнаружены изменения сразу по нескольким заданиям: {tasks}.\n\n'
    'Пожалуйста, разделите каждое задание в отдельный PR (например, task_01 — один PR, task_02 — другой).'
)


def get_issue_comments(repo: str, pr_number: str, headers: dict) -> List[dict]:
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/comments'
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        LOG.warning('Failed to fetch comments: %s %s', r.status_code, r.text)
        return []
    return r.json()


def get_issue_labels(repo: str, pr_number: str, headers: dict) -> List[str]:
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/labels'
    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        LOG.warning('Failed to fetch labels: %s %s', r.status_code, r.text)
        return []
    return [lbl['name'] for lbl in r.json()]


def post_comment(repo: str, pr_number: str, headers: dict, body: str) -> int:
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/comments'
    r = requests.post(url, headers=headers, json={'body': body})
    LOG.info('post_comment status=%s', r.status_code)
    return r.status_code


def add_label(repo: str, pr_number: str, headers: dict, label: str) -> int:
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/labels'
    r = requests.post(url, headers=headers, json=[label])
    LOG.info('add_label status=%s', r.status_code)
    return r.status_code


def remove_label(repo: str, pr_number: str, headers: dict, label: str) -> int:
    # DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}
    import urllib.parse
    name = urllib.parse.quote(label, safe='')
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}/labels/{name}'
    r = requests.delete(url, headers=headers)
    LOG.info('remove_label(%s) status=%s', label, r.status_code)
    return r.status_code


def close_pull_request(repo: str, pr_number: str, headers: dict) -> int:
    url = f'https://api.github.com/repos/{repo}/issues/{pr_number}'
    r = requests.patch(url, headers=headers, json={'state': 'closed'})
    LOG.info('close_pr status=%s', r.status_code)
    return r.status_code


def main() -> int:
    repo = os.environ.get('REPO')
    pr = os.environ.get('PR_NUMBER')
    token = os.environ.get('GITHUB_TOKEN')
    path = os.environ.get('CHECK_RESULT_PATH', '.github/check_result.json')

    if not repo or not pr or not token:
        LOG.error('Missing required environment variables (REPO, PR_NUMBER, GITHUB_TOKEN)')
        return 1

    if not os.path.exists(path):
        LOG.info('No result file at %s', path)
        return 0

    data: Any = json.load(open(path, encoding='utf-8'))
    exit_code = int(data.get('exit_code', 1))
    headers = {'Authorization': f'token {token}', 'Accept': 'application/vnd.github.v3+json'}

    # Success path (exit_code == 0): ensure label 'Dir approved', remove 'Wrong dir'
    if exit_code == 0:
        existing_labels = get_issue_labels(repo, pr, headers)
        if 'Wrong dir' in existing_labels:
            remove_label(repo, pr, headers, 'Wrong dir')
        if 'Dir approved' not in existing_labels:
            add_label(repo, pr, headers, 'Dir approved')
        # no comment, do not close
        LOG.info('Success: ensured label Dir approved and removed Wrong dir (if present)')
        return 0

    # Treat 2 (outside dir), 3 (no mapping), 4 (multiple tasks), 5 (non-task files) as failures
    if exit_code not in (2, 3, 4, 5):
        LOG.info('No failure detected (exit_code=%s), nothing to do', exit_code)
        return 0

    violations = data.get('violations', [])
    non_task_files = data.get('non_task_files', [])
    author = data.get('author', 'unknown')
    allowed = data.get('allowed', 'unknown')
    tasks = data.get('tasks', [])

    # Prepare body
    if exit_code == 3:
        body = f"⚠️ Невозможно сопоставить пользователя **{author}** с `students/students.csv`. Пожалуйста, проверьте вручную."
    elif exit_code == 4:
        tasks_list = ', '.join(f'`{t}`' for t in tasks[:10])
        body = MULTI_TASK_TEMPLATE.format(tasks=tasks_list or '—')
    else:
        # For exit_code 2 -> files outside allowed directory (violations)
        # For exit_code 5 -> files inside student dir but outside task_* (non_task_files)
        files_src = non_task_files if exit_code == 5 else violations
        files_list = '\n'.join(f'- {v}' for v in files_src[:20])
        body = LONG_TEMPLATE.format(allowed=allowed, files=files_list)

    # Avoid duplicate comments: look for an existing bot comment with marker and update it
    marker = '<!-- student-dir-checker -->'
    marked_body = marker + '\n' + body
    comments = get_issue_comments(repo, pr, headers)
    existing_id = None
    for c in comments:
        if marker in (c.get('body') or ''):
            existing_id = c.get('id')
            LOG.info('Found existing bot comment id=%s, will update', existing_id)
            break

    if existing_id:
        # update comment via PATCH
        url = f'https://api.github.com/repos/{repo}/issues/comments/{existing_id}'
        r = requests.patch(url, headers=headers, json={'body': marked_body})
        LOG.info('update_comment status=%s', r.status_code)
    else:
        post_comment(repo, pr, headers, marked_body)

    # Remove previous success label and ensure failure label
    existing_labels = get_issue_labels(repo, pr, headers)
    if 'Dir approved' in existing_labels:
        remove_label(repo, pr, headers, 'Dir approved')
    if 'Wrong dir' not in existing_labels:
        add_label(repo, pr, headers, 'Wrong dir')

    close_pull_request(repo, pr, headers)

    return 0


if __name__ == '__main__':
    sys.exit(main())
