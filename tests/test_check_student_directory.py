import os
import json
import tempfile
from pathlib import Path
import importlib.util


def load_helpers():
    script = os.path.abspath('tests/_helpers.py')
    spec = importlib.util.spec_from_file_location('tests_helpers', script)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_load_students_map(tmp_path):
    csv = tmp_path / 'students.csv'
    csv.write_text('NameLatin,Directory,Github Username\nJohn,./students/John,johnsmith\n', encoding='utf-8')
    helpers = load_helpers()
    mapping = helpers.load_students_map(str(csv))
    assert 'johnsmith' in mapping


def test_fetch_changed_files_via_api_paginates(requests_mock, monkeypatch):
    script_path = os.path.abspath('.github/scripts/check_student_directory.py')
    spec = importlib.util.spec_from_file_location('checker', script_path)
    checker = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(checker)

    pr_url = 'https://api.github.com/repos/org/repo/pulls/42'
    first_page = f'{pr_url}/files?per_page=100'
    second_page = f'{pr_url}/files?page=2'

    requests_mock.get(
        first_page,
        json=[{'filename': 'a.txt'}, {'filename': 'b.txt'}],
        headers={'Link': f'<{second_page}>; rel="next"'}
    )
    requests_mock.get(
        second_page,
        json=[{'filename': 'c.txt'}],
    )

    files = checker.fetch_changed_files_via_api({'url': pr_url})

    assert files == ['a.txt', 'b.txt', 'c.txt']


def test_collect_task_dirs_detects_multiple_tasks():
    script_path = os.path.abspath('.github/scripts/check_student_directory.py')
    spec = importlib.util.spec_from_file_location('checker', script_path)
    checker = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(checker)

    files = [
        'students/User/task_01/src/index.html',
        'students/User/task_02/doc/readme.md',
        'students/User/task_02/src/app.js',
    ]

    tasks = checker.collect_task_dirs(files, 'students/User')

    assert tasks == {'task_01', 'task_02'}


def test_find_non_task_files_flags_readme_and_misc():
    script_path = os.path.abspath('.github/scripts/check_student_directory.py')
    spec = importlib.util.spec_from_file_location('checker', script_path)
    checker = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(checker)

    files = [
        'students/User/README.md',
        'students/User/task_01/src/index.html',
        'students/User/docs/note.txt',
        'some/other/place.txt',
    ]

    non_task = checker.find_non_task_files(files, 'students/User')

    assert 'students/User/README.md' in non_task
    assert 'students/User/docs/note.txt' in non_task
    # file outside student dir should not be listed here
    assert 'some/other/place.txt' not in non_task
