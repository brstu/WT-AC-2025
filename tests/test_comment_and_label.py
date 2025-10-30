import os
import json
import tempfile
import requests_mock
import importlib.util


def run_script(script_path, env):
    spec = importlib.util.spec_from_file_location('mod', script_path)
    mod = importlib.util.module_from_spec(spec)
    original = {k: os.environ.get(k) for k in env}
    for k, v in env.items():
        os.environ[k] = v
    try:
        spec.loader.exec_module(mod)
        return mod.main()
    finally:
        for k, old in original.items():
            if old is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = old


def test_comment_and_label_adds_comment_and_label(tmp_path, requests_mock):
    # prepare fake check_result.json
    cr = tmp_path / 'check_result.json'
    data = {'exit_code': 2, 'author': 'student', 'allowed': './students/StudentFolder', 'violations': ['students/Other/file.txt']}
    cr.write_text(json.dumps(data), encoding='utf-8')

    repo = 'owner/repo'
    pr = '42'
    # mock comments and labels endpoints
    comments_url = f'https://api.github.com/repos/{repo}/issues/{pr}/comments'
    labels_url = f'https://api.github.com/repos/{repo}/issues/{pr}/labels'
    requests_mock.get(comments_url, json=[])
    # existing labels include 'Dir approved' to verify removal on failure
    requests_mock.get(labels_url, json=[{'name': 'Dir approved'}])
    requests_mock.post(comments_url, json={'id': 1}, status_code=201)
    requests_mock.post(labels_url, json=[{'name': 'invalid-directory'}], status_code=200)
    requests_mock.delete(f'https://api.github.com/repos/{repo}/issues/{pr}/labels/Dir%20approved', status_code=200)
    close_url = f'https://api.github.com/repos/{repo}/issues/{pr}'
    requests_mock.patch(close_url, json={'state': 'closed'}, status_code=200)

    env = {'REPO': repo, 'PR_NUMBER': pr, 'GITHUB_TOKEN': 'x', 'CHECK_RESULT_PATH': str(cr)}
    exit_code = run_script(os.path.abspath('.github/scripts/comment_and_label.py'), env)

    assert exit_code == 0
    requested_urls = [req.url for req in requests_mock.request_history]
    assert close_url in requested_urls
    # ensure label remove was called
    assert f'https://api.github.com/repos/{repo}/issues/{pr}/labels/Dir%20approved' in requested_urls


def test_comment_for_multiple_tasks(tmp_path, requests_mock):
    cr = tmp_path / 'check_result.json'
    data = {'exit_code': 4, 'author': 'student', 'allowed': './students/StudentFolder', 'tasks': ['task_01', 'task_02']}
    cr.write_text(json.dumps(data), encoding='utf-8')

    repo = 'owner/repo'
    pr = '77'
    comments_url = f'https://api.github.com/repos/{repo}/issues/{pr}/comments'
    labels_url = f'https://api.github.com/repos/{repo}/issues/{pr}/labels'
    close_url = f'https://api.github.com/repos/{repo}/issues/{pr}'

    requests_mock.get(comments_url, json=[])
    requests_mock.get(labels_url, json=[])
    requests_mock.post(comments_url, json={'id': 10}, status_code=201)
    requests_mock.post(labels_url, json=[{'name': 'invalid-directory'}], status_code=200)
    requests_mock.patch(close_url, json={'state': 'closed'}, status_code=200)

    env = {'REPO': repo, 'PR_NUMBER': pr, 'GITHUB_TOKEN': 'x', 'CHECK_RESULT_PATH': str(cr)}
    exit_code = run_script(os.path.abspath('.github/scripts/comment_and_label.py'), env)

    assert exit_code == 0
    comment_requests = [req for req in requests_mock.request_history if req.url == comments_url and req.method == 'POST']
    assert comment_requests, 'Expected a comment to be created'
    body_payload = comment_requests[0].json()
    assert 'task_01' in body_payload['body']
    assert 'task_02' in body_payload['body']


def test_comment_for_non_task_files(tmp_path, requests_mock):
    cr = tmp_path / 'check_result.json'
    data = {
        'exit_code': 5,
        'author': 'student',
        'allowed': 'students/StudentFolder',
        'non_task_files': [
            'students/StudentFolder/README.md',
            'students/StudentFolder/docs/file.txt'
        ]
    }
    cr.write_text(json.dumps(data), encoding='utf-8')

    repo = 'owner/repo'
    pr = '88'
    comments_url = f'https://api.github.com/repos/{repo}/issues/{pr}/comments'
    labels_url = f'https://api.github.com/repos/{repo}/issues/{pr}/labels'
    close_url = f'https://api.github.com/repos/{repo}/issues/{pr}'

    requests_mock.get(comments_url, json=[])
    requests_mock.get(labels_url, json=[])
    requests_mock.post(comments_url, json={'id': 11}, status_code=201)
    requests_mock.post(labels_url, json=[{'name': 'invalid-directory'}], status_code=200)
    requests_mock.patch(close_url, json={'state': 'closed'}, status_code=200)

    env = {'REPO': repo, 'PR_NUMBER': pr, 'GITHUB_TOKEN': 'x', 'CHECK_RESULT_PATH': str(cr)}
    exit_code = run_script(os.path.abspath('.github/scripts/comment_and_label.py'), env)

    assert exit_code == 0
    comment_requests = [req for req in requests_mock.request_history if req.url == comments_url and req.method == 'POST']
    assert comment_requests, 'Expected a comment to be created'
    body_payload = comment_requests[0].json()
    assert 'README.md' in body_payload['body']
    assert 'docs/file.txt' in body_payload['body']


def test_success_adds_dir_approved_and_removes_wrong_dir(tmp_path, requests_mock):
    cr = tmp_path / 'check_result.json'
    data = {
        'exit_code': 0,
        'author': 'student',
        'allowed': 'students/StudentFolder'
    }
    cr.write_text(json.dumps(data), encoding='utf-8')

    repo = 'owner/repo'
    pr = '99'
    comments_url = f'https://api.github.com/repos/{repo}/issues/{pr}/comments'
    labels_url = f'https://api.github.com/repos/{repo}/issues/{pr}/labels'
    # existing labels include Wrong dir, expect delete; then add Dir approved
    requests_mock.get(labels_url, json=[{'name': 'Wrong dir'}])
    requests_mock.delete(f'https://api.github.com/repos/{repo}/issues/{pr}/labels/Wrong%20dir', status_code=200)
    requests_mock.post(labels_url, json=[{'name': 'Dir approved'}], status_code=200)

    env = {'REPO': repo, 'PR_NUMBER': pr, 'GITHUB_TOKEN': 'x', 'CHECK_RESULT_PATH': str(cr)}
    exit_code = run_script(os.path.abspath('.github/scripts/comment_and_label.py'), env)

    assert exit_code == 0
    # No comment expected for success path
    posted_comments = [req for req in requests_mock.request_history if req.url == comments_url and req.method == 'POST']
    assert not posted_comments
