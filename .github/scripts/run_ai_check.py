#!/usr/bin/env python3
"""Run AI check for a given student/task using GitHub Models.

Usage:
  python .github/scripts/run_ai_check.py --student NameLatin --task task_XX --prompt-file ai_prompt.txt --out ai_response.md

Env:
  GITHUB_TOKEN: GitHub token with access to Models API
    MODEL: Optional, defaults to gpt5-mini

This script:
  - Reads the prepared prompt text
  - Reads student files (text only) under students/NameLatin/task_XX
  - Calls GitHub Models chat completions endpoint
  - Writes the AI response to the output file
"""
from __future__ import annotations

import argparse
import os
import sys
import json
from pathlib import Path
import re

try:
    import requests
except Exception:
    print('This script requires the requests package. Install it first.')
    sys.exit(2)


ROOT = Path(__file__).resolve().parents[2]

TEXT_EXTS = {
    '.txt', '.md', '.html', '.css', '.js', '.ts', '.tsx', '.jsx', '.json', '.yml', '.yaml', '.xml', '.ini', '.cfg', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.rs', '.go', '.sh', '.bat', '.ps1'
}

IGNORE_DIRS = {'node_modules', 'dist', 'build', '.cache', '.git'}
IGNORE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.zip', '.rar', '.7z', '.pdf', '.mp4', '.mov', '.avi', '.mp3', '.wav'}


def is_text_file(p: Path) -> bool:
    ext = p.suffix.lower()
    if ext in IGNORE_EXTS:
        return False
    if ext in TEXT_EXTS:
        return True
    # Fallback: try to read as utf-8 small chunk
    try:
        with p.open('r', encoding='utf-8') as f:
            f.read(1024)
        return True
    except Exception:
        return False


def collect_files(student: str, task_folder: str, limit_files: int = 50, limit_bytes_per_file: int = 15000) -> list[dict]:
    base = ROOT / 'students' / student / task_folder
    result: list[dict] = []
    if not base.exists():
        return result
    for root, dirs, files in os.walk(base):
        # prune ignored dirs
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for name in files:
            p = Path(root) / name
            rel = p.relative_to(base).as_posix()
            if not is_text_file(p):
                continue
            try:
                content = p.read_text(encoding='utf-8')[:limit_bytes_per_file]
            except Exception:
                continue
            result.append({'name': rel, 'content': content})
            if len(result) >= limit_files:
                return result
    return result


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description='Run AI check (GitHub Models)')
    ap.add_argument('--student', required=True)
    ap.add_argument('--task', required=True, help='task folder name like task_01 or task_1 or 01')
    ap.add_argument('--prompt-file', required=True)
    ap.add_argument('--out', default='ai_response.md')
    ap.add_argument('--debug', action='store_true', help='Enable verbose debug output')
    args = ap.parse_args(argv)

    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        print('GITHUB_TOKEN is required in env', file=sys.stderr)
        return 2
    model = os.environ.get('MODEL', 'gpt5-mini')
    debug = args.debug or os.environ.get('DEBUG') == '1'

    def dbg(msg: str):
        if debug:
            print(f'[DEBUG] {msg}', file=sys.stderr)

    # sanitize student (remove stray brackets/colons)
    student_clean = re.sub(r'[^A-Za-z0-9_-]', '', args.student)
    if not student_clean:
        print('Invalid student name after sanitization', file=sys.stderr)
        return 2

    # normalize task to task_XX
    m = re.search(r'(\d+)', args.task)
    if not m:
        print('Invalid task format, expected a number', file=sys.stderr)
        return 2
    task_folder = f'task_{int(m.group(1)):02d}'

    prompt_path = Path(args.prompt_file)
    if not prompt_path.exists():
        print(f'Prompt file not found: {prompt_path}', file=sys.stderr)
        return 2
    prompt_text = prompt_path.read_text(encoding='utf-8')

    files = collect_files(student_clean, task_folder)
    if not files:
        print(f'Warning: no files collected under students/{student_clean}/{task_folder}', file=sys.stderr)
    else:
        dbg(f'Collected {len(files)} files (showing up to first 5 names): ' + ', '.join(f["name"] for f in files[:5]))

    # Combine prompt and files
    combined = prompt_text + '\n\nStudent files (text only):\n' + '\n\n'.join(
        [f"## {f['name']}\n{f['content']}" for f in files]
    )
    dbg(f'Combined prompt size: {len(combined)} characters')
    if debug and len(combined) > 50000:
        dbg('Warning: very large prompt may be truncated or rejected by model API')

    endpoint = 'https://models.inference.ai.azure.com/v1/chat/completions'
    payload = {
        'model': model,
        'messages': [
            {'role': 'user', 'content': combined}
        ],
        'temperature': 0.3,
    }
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }

    try:
        print(f'Calling model {model} with {len(files)} files, prompt length={len(combined)}')
        if debug:
            redacted_headers = {k: ('***' if k.lower() == 'authorization' else v) for k, v in headers.items()}
            dbg('Request headers: ' + json.dumps(redacted_headers))
            dbg('Payload keys: ' + ','.join(payload.keys()))
            dbg('Messages count: ' + str(len(payload.get('messages', []))))
        resp = requests.post(endpoint, headers=headers, data=json.dumps(payload), timeout=120)
    except Exception as e:
        Path(args.out).write_text('Error calling models API: ' + str(e), encoding='utf-8')
        return 1

    if resp.status_code != 200:
        detail = resp.text
        # Try to extract message field if JSON
        try:
            j = resp.json()
            msg = j.get('error') or j.get('message') or j
            detail = json.dumps(msg, ensure_ascii=False)
        except Exception:
            pass
        latency = resp.elapsed.total_seconds() if hasattr(resp, 'elapsed') else None
        remediation = ''
        if resp.status_code in (401, 403):
            remediation = (
                'Remediation: The token used lacks the models permission. '\
                'Create a fine-grained PAT (or org secret) with "models:read" (and if required, "models:write") scope, '\
                'store it as GH_MODELS_TOKEN secret, and re-run. ' \
                'Alternatively, if using the default GITHUB_TOKEN, ensure GitHub Models are enabled for this repository and workflow permissions include models.'
            )
        diagnostic = {
            'status': resp.status_code,
            'detail': detail[:2000],
            'endpoint': endpoint,
            'model': model,
            'files_count': len(files),
            'latency_seconds': latency,
            'debug': debug
        }
        if remediation:
            diagnostic['remediation'] = remediation
        if debug:
            dbg('Response status: ' + str(resp.status_code))
            dbg('Raw response (truncated 500 chars): ' + resp.text[:500])
        Path(args.out).write_text('Error invoking model:\n' + json.dumps(diagnostic, ensure_ascii=False, indent=2), encoding='utf-8')
        return 1

    data = resp.json()
    if debug:
        dbg('Parsed JSON keys: ' + ','.join(data.keys()))
        dbg('Choices length: ' + str(len(data.get('choices', []))))
    text = data.get('choices', [{}])[0].get('message', {}).get('content') or 'No response'
    Path(args.out).write_text(text, encoding='utf-8')
    if debug:
        dbg('Wrote AI response with length ' + str(len(text)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
