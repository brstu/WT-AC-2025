#!/usr/bin/env python3
"""Run AI check for a given student/task using GitHub Models or OpenAI.

Usage:
    python .github/scripts/run_ai_check.py --student NameLatin --task task_XX --prompt-file ai_prompt.txt --out ai_response.md --engine github

Env (github engine):
    AI_GITHUB_TOKEN: GitHub token with access to Models API (falls back to GITHUB_TOKEN if unset)
        MODEL: Optional, defaults to gpt5-mini

Env (openai engine):
    OPENAI_API_KEY: OpenAI API key
        MODEL or OPENAI_MODEL: Optional, choose OpenAI model (defaults to gpt-4o-mini)

This script:
    - Reads the prepared prompt text
    - Reads student files (text only) under students/NameLatin/task_XX
    - Calls either GitHub Models or OpenAI chat completions endpoint
    - Writes the AI response to the output file
"""
from __future__ import annotations

import argparse
import os
import sys
import json
from pathlib import Path
import re

from typing import Callable

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


def estimate_token_count(text: str) -> int:
    """Very rough heuristic: 1 token ≈ 4 characters."""
    return max(1, len(text) // 4)


def env_flag(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {'1', 'true', 'yes', 'on'}


def int_env(name: str, default: int) -> int:
    value = os.environ.get(name)
    if value is None:
        return default
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def call_github_file_completion(
    token: str,
    model: str,
    prompt_text: str,
    attachment_payload: str,
    max_tokens: int,
    dbg: Callable[[str], None],
) -> tuple[requests.Response, str, dict]:
    file_bytes = attachment_payload.encode('utf-8')
    upload_endpoint = 'https://api.github.com/models/files'
    upload_headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
    }
    files = {
        'file': ('student_submission.txt', file_bytes, 'text/plain')
    }
    if dbg:
        dbg(f'Uploading {len(file_bytes)} bytes to {upload_endpoint}')
    upload_resp = requests.post(upload_endpoint, headers=upload_headers, files=files, timeout=180)
    if upload_resp.status_code not in (200, 201):
        detail = upload_resp.text[:500]
        raise RuntimeError(f'File upload failed (status {upload_resp.status_code}): {detail}')
    upload_json = upload_resp.json()
    file_id = upload_json.get('id')
    if not file_id:
        raise RuntimeError('File upload response missing "id" field')
    dbg(f'Uploaded file id: {file_id}')

    prompt_body = prompt_text.strip()
    attachment_instruction = os.environ.get(
        'AI_FILE_PROMPT_INSTRUCTION',
        'Analyze the uploaded student submission file to produce the requested review.',
    ).strip()
    if attachment_instruction:
        prompt_body = f"{prompt_body}\n\n{attachment_instruction}"

    endpoint = f'https://api.github.com/models/{model}/completions'
    payload = {
        'prompt': prompt_body,
        'file': file_id,
        'max_tokens': max_tokens,
        'temperature': 0.3,
    }
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
    resp = requests.post(endpoint, headers=headers, json=payload, timeout=180)
    return resp, endpoint, payload


def call_github_chat_completion(
    token: str,
    model: str,
    inline_prompt: str,
    max_tokens: int,
    dbg: Callable[[str], None],
) -> tuple[requests.Response, str, dict]:
    endpoint = 'https://models.inference.ai.azure.com/v1/chat/completions'
    payload = {
        'model': model,
        'messages': [
            {'role': 'user', 'content': inline_prompt}
        ],
        'temperature': 0.3,
        'max_tokens': max_tokens,
    }
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    if dbg:
        redacted = {k: ('***' if k.lower() == 'authorization' else v) for k, v in headers.items()}
        dbg('GitHub chat headers: ' + json.dumps(redacted))
    resp = requests.post(endpoint, headers=headers, json=payload, timeout=120)
    return resp, endpoint, payload


def call_openai_chat_completion(
    token: str,
    model: str,
    inline_prompt: str,
    max_tokens: int,
    dbg: Callable[[str], None],
) -> tuple[requests.Response, str, dict]:
    endpoint = 'https://api.openai.com/v1/chat/completions'
    payload = {
        'model': model,
        'messages': [
            {'role': 'user', 'content': inline_prompt}
        ],
        'temperature': 0.3,
        'max_tokens': max_tokens,
    }
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
    }
    resp = requests.post(endpoint, headers=headers, json=payload, timeout=120)
    return resp, endpoint, payload


def send_models_request(
    *,
    engine: str,
    token: str,
    model: str,
    inline_prompt: str,
    attachment_payload: str,
    prompt_text: str,
    use_file_upload: bool,
    max_tokens: int,
    dbg: Callable[[str], None],
) -> tuple[requests.Response, str, dict, bool]:
    if engine == 'github':
        if use_file_upload:
            try:
                resp, endpoint, payload = call_github_file_completion(
                    token, model, prompt_text, attachment_payload, max_tokens, dbg
                )
                return resp, endpoint, payload, True
            except Exception as exc:
                print(f'File upload flow failed ({exc}); falling back to inline prompt.', file=sys.stderr)
        resp, endpoint, payload = call_github_chat_completion(token, model, inline_prompt, max_tokens, dbg)
        return resp, endpoint, payload, False
    if engine == 'openai':
        resp, endpoint, payload = call_openai_chat_completion(token, model, inline_prompt, max_tokens, dbg)
        return resp, endpoint, payload, False
    raise ValueError(f'Unsupported engine: {engine}')


def extract_response_text(data: dict) -> str | None:
    choices = data.get('choices') or []
    if choices:
        first = choices[0] or {}
        message = first.get('message') or {}
        if isinstance(message, dict):
            content = message.get('content')
            if content:
                return content
        text = first.get('text')
        if text:
            return text
    if 'output_text' in data:
        return data['output_text']
    return None


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description='Run AI check (GitHub Models or OpenAI)')
    ap.add_argument('--student', required=True)
    ap.add_argument('--task', required=True, help='task folder name like task_01 or task_1 or 01')
    ap.add_argument('--prompt-file', required=True)
    ap.add_argument('--out', default='ai_response.md')
    ap.add_argument('--engine', choices=['github', 'openai'], default='github', help='Which API to use: github (default) or openai')
    ap.add_argument('--debug', action='store_true', help='Enable verbose debug output')
    args = ap.parse_args(argv)

    engine = args.engine
    debug = args.debug or os.environ.get('DEBUG') == '1'

    # tokens / keys per engine
    if engine == 'github':
        token = os.environ.get('AI_GITHUB_TOKEN') or os.environ.get('GITHUB_TOKEN')
        if not token:
            print('AI_GITHUB_TOKEN (or legacy GITHUB_TOKEN) is required in env for github engine', file=sys.stderr)
            return 2
        model = os.environ.get('MODEL', 'gpt5-mini')
    else:  # openai
        token = os.environ.get('OPENAI_API_KEY')
        if not token:
            print('OPENAI_API_KEY is required in env for openai engine', file=sys.stderr)
            return 2
        # map a common env name to OpenAI model name; user can set MODEL env var to choose
        model = os.environ.get('MODEL', os.environ.get('OPENAI_MODEL', 'gpt-4o-mini'))

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
    student_files_section = 'Student files (text only):\n' + '\n\n'.join(
        [f"## {f['name']}\n{f['content']}" for f in files]
    )
    combined = prompt_text + '\n\n' + student_files_section
    dbg(f'Combined prompt size: {len(combined)} characters')
    if debug and len(combined) > 50000:
        dbg('Warning: very large prompt may be truncated or rejected by model API')

    approx_tokens = estimate_token_count(combined)
    upload_threshold = int_env('AI_PROMPT_UPLOAD_THRESHOLD', 3600)
    max_tokens = int_env('AI_COMPLETION_MAX_TOKENS', 1800)
    force_upload = env_flag('AI_FORCE_FILE_UPLOAD', False)
    disable_upload = env_flag('AI_DISABLE_FILE_UPLOAD', False)
    use_file_upload = engine == 'github' and not disable_upload and (
        force_upload or approx_tokens >= upload_threshold
    )

    print(
        f'Calling model {model} with {len(files)} files, prompt length={len(combined)}, '
        f'file_upload={use_file_upload}'
    )

    try:
        resp, endpoint, payload, used_upload = send_models_request(
            engine=engine,
            token=token,
            model=model,
            inline_prompt=combined,
            attachment_payload=student_files_section,
            prompt_text=prompt_text,
            use_file_upload=use_file_upload,
            max_tokens=max_tokens,
            dbg=dbg,
        )
    except Exception as e:
        message = 'Error calling models API: ' + str(e)
        Path(args.out).write_text(message, encoding='utf-8')
        print(message, file=sys.stderr)
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
            'debug': debug,
            'used_file_upload': used_upload,
        }
        if remediation:
            diagnostic['remediation'] = remediation
        if debug:
            dbg('Response status: ' + str(resp.status_code))
            dbg('Raw response (truncated 500 chars): ' + resp.text[:500])
        diagnostic_text = json.dumps(diagnostic, ensure_ascii=False, indent=2)
        Path(args.out).write_text('Error invoking model:\n' + diagnostic_text, encoding='utf-8')
        print('Error invoking model (see ai_review.md for full details):', file=sys.stderr)
        print(diagnostic_text, file=sys.stderr)
        return 1

    data = resp.json()
    if debug:
        dbg('Parsed JSON keys: ' + ','.join(data.keys()))
        dbg('Choices length: ' + str(len(data.get('choices', []))))
    text = extract_response_text(data) or 'No response'
    Path(args.out).write_text(text, encoding='utf-8')
    if debug:
        dbg('Wrote AI response with length ' + str(len(text)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
