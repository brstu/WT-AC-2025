#!/usr/bin/env python3
"""Run AI check for a given student/task using GitHub Models, OpenAI, Copilot Codex, or OpenRouter.

Usage:
    python .github/scripts/run_ai_check.py \
        --student NameLatin --task task_XX \
        --prompt-file ai_prompt.txt --out ai_response.md \
    [--engine github|openai|codex|openrouter] [--no-stream] \
        [--max-files-per-call 10] [--max-chars-per-call 10000]

Env (github engine):
    GITHUB_TOKEN or AI_GITHUB_TOKEN: token with access to Models API
        MODEL: Optional, defaults to tngtech/deepseek-r1t2-chimera:free

Env (openai engine):
    OPENAI_API_KEY: OpenAI API key
        MODEL or OPENAI_MODEL: Optional, choose OpenAI model (defaults to gpt-4o-mini)

Env (codex engine):
    CODEX_TOKEN or CODEX_API_KEY: token with access to Copilot Codex endpoint
        CODEX_MODEL or MODEL: Optional, defaults to copilot-codex
        CODEX_ENDPOINT: Optional, defaults to https://api.githubcopilot.com/v1/chat/completions

Env (openrouter engine):
    OPENROUTER_API_KEY or OPENROUTER_TOKEN: token with access to OpenRouter
        OPENROUTER_MODEL or MODEL: Optional, defaults to tngtech/deepseek-r1t2-chimera:free
        OPENROUTER_ENDPOINT: Optional, defaults to https://openrouter.ai/api/v1/chat/completions
        OPENROUTER_HTTP_REFERER / OPENROUTER_TITLE: Optional headers recommended by OpenRouter

This script:
    - Reads the prepared prompt text
    - Reads student files (text only) under students/NameLatin/task_XX
    - Calls either GitHub Models or OpenAI chat completions endpoint
    - Streams responses live by default (disable with --no-stream) and/or chunks submissions across calls
    - Writes the AI response(s) to the output file
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Callable

try:
    import requests
except Exception:
    print('This script requires the requests package. Install it first.')
    sys.exit(2)


ROOT = Path(__file__).resolve().parents[2]

DEFAULT_GITHUB_MODEL = 'tngtech/deepseek-r1t2-chimera:free'
DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'
DEFAULT_CODEX_MODEL = 'copilot-codex'
DEFAULT_OPENROUTER_MODEL = 'tngtech/deepseek-r1t2-chimera:free'

TEXT_EXTS = {
    '.txt', '.md', '.html', '.css', '.js', '.ts', '.tsx', '.jsx', '.json', '.yml', '.yaml', '.xml', '.ini', '.cfg', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.rs', '.go', '.sh', '.bat', '.ps1'
}

IGNORE_DIRS = {'node_modules', 'dist', 'build', '.cache', '.git'}
IGNORE_EXTS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.avif', '.zip', '.rar', '.7z', '.pdf', '.mp4', '.mov', '.avi', '.mp3', '.wav'}

def first_env(names: tuple[str, ...], default: str) -> str:
    for name in names:
        value = os.environ.get(name)
        if value:
            return value
    return default


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


def collect_files(
    student: str,
    task_folder: str,
    limit_files: int = 50,
    limit_bytes_per_file: int = 15000,
    exclude_relative: set[str] | None = None,
) -> list[dict]:
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
            if exclude_relative and rel in exclude_relative:
                continue
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


def chunk_files(files: list[dict], max_files: int, max_chars: int) -> list[list[dict]]:
    if not files:
        return [[]]
    if max_files <= 0 and max_chars <= 0:
        return [files]

    chunks: list[list[dict]] = []
    current: list[dict] = []
    current_chars = 0

    for file_entry in files:
        entry_len = len(file_entry.get('content', ''))
        threshold = (
            (max_files > 0 and len(current) >= max_files)
            or (max_chars > 0 and current_chars + entry_len > max_chars)
        )
        if current and threshold:
            chunks.append(current)
            current = []
            current_chars = 0
        current.append(file_entry)
        current_chars += entry_len

    if current:
        chunks.append(current)
    return chunks or [[]]


def build_request(
    *,
    engine: str,
    token: str,
    model: str,
    combined_prompt: str,
    stream: bool,
    max_tokens: int | None,
) -> tuple[str, dict, dict]:
    payload: dict = {
        'model': model,
        'messages': [
            {'role': 'user', 'content': combined_prompt}
        ],
        'temperature': 0.3,
    }
    if max_tokens:
        payload['max_tokens'] = max_tokens
    if stream:
        payload['stream'] = True

    if engine == 'github':
        endpoint = 'https://models.inference.ai.azure.com/v1/chat/completions'
    elif engine == 'codex':
        endpoint = os.environ.get('CODEX_ENDPOINT', 'https://api.githubcopilot.com/v1/chat/completions')
    elif engine == 'openrouter':
        endpoint = os.environ.get('OPENROUTER_ENDPOINT', 'https://openrouter.ai/api/v1/chat/completions')
    else:
        endpoint = 'https://api.openai.com/v1/chat/completions'

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream' if stream else 'application/json',
    }
    if engine == 'openrouter':
        referer = os.environ.get('OPENROUTER_HTTP_REFERER')
        title = os.environ.get('OPENROUTER_TITLE')
        if referer:
            headers['HTTP-Referer'] = referer
        if title:
            headers['X-Title'] = title
    return endpoint, headers, payload


def extract_response_text(data: dict) -> str:
    choices = data.get('choices') or []
    if not choices:
        return ''
    first = choices[0] or {}
    message = first.get('message') or {}
    content = message.get('content')
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        text = ''
        for block in content:
            if isinstance(block, dict) and block.get('type') == 'text':
                text += block.get('text', '')
        if text:
            return text
    if first.get('text'):
        return first['text']
    return ''


def stream_sse_response(resp: requests.Response, dbg: Callable[[str], None]) -> str:
    parts: list[str] = []
    try:
        for raw_line in resp.iter_lines(decode_unicode=True):
            if raw_line is None:
                continue
            line = raw_line.strip()
            if not line or line.startswith(':'):
                continue
            if not line.startswith('data:'):
                continue
            payload = line[5:].strip()
            if payload == '[DONE]':
                break
            if not payload:
                continue
            try:
                data = json.loads(payload)
            except json.JSONDecodeError:
                continue
            chunk = ''
            for choice in data.get('choices', []):
                delta = choice.get('delta') or {}
                content = delta.get('content')
                if isinstance(content, str):
                    chunk += content
                elif isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and block.get('type') == 'text':
                            chunk += block.get('text', '')
            if chunk:
                print(chunk, end='', flush=True)
                parts.append(chunk)
    finally:
        if parts:
            print()
    aggregated = ''.join(parts)
    if dbg:
        dbg('Streamed content length: ' + str(len(aggregated)))
    return aggregated


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description='Run AI check (GitHub Models, OpenAI, Codex, or OpenRouter) with optional streaming/chunking')
    parser.add_argument('--student', required=True)
    parser.add_argument('--task', required=True, help='task folder name like task_01 or task_1 or 01')
    parser.add_argument('--prompt-file', required=True)
    parser.add_argument('--out', default='ai_response.md')
    parser.add_argument('--engine', choices=['github', 'openai', 'codex', 'openrouter'], default='github', help='Which API to use: github (default), openai, codex, or openrouter')
    parser.add_argument('--debug', action='store_true', help='Enable verbose debug output')
    stream_group = parser.add_mutually_exclusive_group()
    stream_group.add_argument('--stream', dest='stream', action='store_true', help='Stream responses to stdout (default)')
    stream_group.add_argument('--no-stream', dest='stream', action='store_false', help='Disable streaming (use blocking response)')
    parser.set_defaults(stream=True)
    parser.add_argument('--max-files-per-call', type=int, default=0, help='If > 0, split files into batches of this size per request')
    parser.add_argument('--max-chars-per-call', type=int, default=0, help='If > 0, split when file contents exceed this many characters')
    parser.add_argument('--max-tokens', type=int, default=0, help='Optional max_tokens value to forward to the model')
    args = parser.parse_args(argv)

    engine = args.engine
    debug = args.debug or os.environ.get('DEBUG') == '1'
    stream_enabled = args.stream

    def dbg(msg: str):
        if debug:
            print(f'[DEBUG] {msg}', file=sys.stderr)

    if engine == 'github':
        token = os.environ.get('AI_GITHUB_TOKEN') or os.environ.get('GITHUB_TOKEN')
        if not token:
            print('AI_GITHUB_TOKEN (or fallback GITHUB_TOKEN) is required in env for github engine', file=sys.stderr)
            return 2
        model = first_env(('MODEL',), DEFAULT_GITHUB_MODEL)
    elif engine == 'openai':
        token = os.environ.get('OPENAI_API_KEY')
        if not token:
            print('OPENAI_API_KEY is required in env for openai engine', file=sys.stderr)
            return 2
        model = first_env(('MODEL', 'OPENAI_MODEL'), DEFAULT_OPENAI_MODEL)
    elif engine == 'codex':
        token = os.environ.get('CODEX_TOKEN') or os.environ.get('CODEX_API_KEY') or os.environ.get('AI_GITHUB_TOKEN')
        if not token:
            print('CODEX_TOKEN (or CODEX_API_KEY / AI_GITHUB_TOKEN) is required in env for codex engine', file=sys.stderr)
            return 2
        model = first_env(('MODEL', 'CODEX_MODEL'), DEFAULT_CODEX_MODEL)
    else:  # openrouter
        token = os.environ.get('OPENROUTER_API_KEY') or os.environ.get('OPENROUTER_TOKEN')
        if not token:
            print('OPENROUTER_API_KEY (or OPENROUTER_TOKEN) is required in env for openrouter engine', file=sys.stderr)
            return 2
        model = first_env(('MODEL', 'OPENROUTER_MODEL'), DEFAULT_OPENROUTER_MODEL)

    student_clean = re.sub(r'[^A-Za-z0-9_-]', '', args.student)
    if not student_clean:
        print('Invalid student name after sanitization', file=sys.stderr)
        return 2

    match = re.search(r'(\d+)', args.task)
    if not match:
        print('Invalid task format, expected a number', file=sys.stderr)
        return 2
    task_folder = f'task_{int(match.group(1)):02d}'

    prompt_path = Path(args.prompt_file)
    if not prompt_path.exists():
        print(f'Prompt file not found: {prompt_path}', file=sys.stderr)
        return 2
    prompt_text = prompt_path.read_text(encoding='utf-8')

    task_dir = ROOT / 'students' / student_clean / task_folder
    exclude_relative: set[str] = set()
    try:
        rel_out = Path(args.out).resolve().relative_to(task_dir.resolve())
        exclude_relative.add(rel_out.as_posix())
    except Exception:
        pass

    files = collect_files(student_clean, task_folder, exclude_relative=exclude_relative or None)
    if not files:
        print(f'Warning: no files collected under students/{student_clean}/{task_folder}', file=sys.stderr)
    else:
        dbg('Collected {count} files (showing up to first 5 names): {names}'.format(
            count=len(files),
            names=', '.join(f["name"] for f in files[:5])
        ))

    batches = chunk_files(files, args.max_files_per_call, args.max_chars_per_call)
    total_chunks = len(batches)
    outputs: list[str] = []

    for chunk_index, batch in enumerate(batches, start=1):
        chunk_title = ''
        if total_chunks > 1:
            chunk_title = f'Chunk {chunk_index}/{total_chunks}: {len(batch)} files'

        if batch:
            files_blob = '\n\n'.join(
                [f"## {f['name']}\n{f['content']}" for f in batch]
            )
        else:
            files_blob = 'No student files provided in this chunk.'

        student_section = 'Student files (text only):\n' + files_blob
        sections = [prompt_text, student_section]
        if chunk_title:
            sections.insert(1, chunk_title)
        combined = '\n\n'.join(filter(None, sections))

        dbg(f'Combined prompt size (chunk {chunk_index}): {len(combined)} characters')
        if debug and len(combined) > 50000:
            dbg('Warning: very large prompt may be truncated or rejected by model API')

        endpoint, headers, payload = build_request(
            engine=engine,
            token=token,
            model=model,
            combined_prompt=combined,
            stream=stream_enabled,
            max_tokens=args.max_tokens or None,
        )

        if debug:
            redacted_headers = {k: ('***' if k.lower() == 'authorization' else v) for k, v in headers.items()}
            dbg('Request headers: ' + json.dumps(redacted_headers))
            dbg('Payload keys: ' + ','.join(payload.keys()))
            dbg('Messages count: ' + str(len(payload.get('messages', []))))

        print(
            f'Calling model {model} with {len(batch)} files (chunk {chunk_index}/{total_chunks}), '
            f'prompt length={len(combined)}, stream={stream_enabled}'
        )

        try:
            resp = requests.post(
                endpoint,
                headers=headers,
                json=payload,
                timeout=180,
                stream=stream_enabled,
            )
        except Exception as exc:
            message = f'Error calling models API (chunk {chunk_index}): {exc}'
            Path(args.out).write_text(message, encoding='utf-8')
            print(message, file=sys.stderr)
            return 1

        if resp.status_code != 200:
            detail = resp.text
            try:
                body = resp.json()
                detail = json.dumps(body.get('error') or body.get('message') or body, ensure_ascii=False)
            except Exception:
                pass
            diagnostic = {
                'status': resp.status_code,
                'detail': detail[:2000],
                'endpoint': endpoint,
                'model': model,
                'files_count': len(batch),
                'chunk_index': chunk_index,
                'chunks_total': total_chunks,
                'debug': debug,
            }
            if resp.status_code in (401, 403):
                diagnostic['remediation'] = (
                    'Remediation: ensure the token/key has access to the selected models endpoint.'
                )
            Path(args.out).write_text('Error invoking model:\n' + json.dumps(diagnostic, ensure_ascii=False, indent=2), encoding='utf-8')
            print('Error invoking model (see output file for details).', file=sys.stderr)
            print(json.dumps(diagnostic, ensure_ascii=False, indent=2), file=sys.stderr)
            return 1

        if stream_enabled:
            text = stream_sse_response(resp, dbg)
        else:
            data = resp.json()
            if debug:
                dbg('Parsed JSON keys: ' + ','.join(data.keys()))
                dbg('Choices length: ' + str(len(data.get('choices', []))))
            text = extract_response_text(data) or 'No response'

        heading = f"## Chunk {chunk_index}/{total_chunks}\n\n" if total_chunks > 1 else ''
        outputs.append(heading + text)

    final_text = '\n\n'.join(outputs).strip() or 'No response'
    Path(args.out).write_text(final_text, encoding='utf-8')
    if debug:
        dbg('Wrote AI response with total length ' + str(len(final_text)))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
