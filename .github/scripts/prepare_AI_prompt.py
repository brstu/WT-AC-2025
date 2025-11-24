"""Prepare AI prompt for grading a student's lab.

Usage: python prepare_AI_prompt.py --student <StudentDirectoryName> --task <taskN>

The script reads `students/students.csv` to determine the variant number for the given
student, reads `tasks/task_<taskN>/readme.md` and `tasks/task_<taskN>/Варианты.md` and
assembles the prompt according to the required template.

It prints the prompt to stdout.
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def read_students_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        return list(reader)


def find_student_variant(students: list[dict], student_dir_name: str) -> str | None:
    # students.csv has a column 'Directory' with paths like './students/Name'
    for row in students:
        directory = (row.get('Directory') or '').replace('\\', '/').strip()
        # accept either the NameLatin or last segment
        last = Path(directory).name
        if last == student_dir_name or (row.get('NameLatin') or '') == student_dir_name:
            return row.get('Вариант') or row.get('Variant') or row.get('Вариант ')
    return None


def _build_marker_regex(tag: str, keywords: tuple[str, ...]) -> re.Pattern[str]:
    joined = "|".join(keywords)
    return re.compile(
        rf"<!--\s*(?:{joined})\s*(?:[:\-]\s*|\s+){re.escape(tag)}\s*-->",
        re.IGNORECASE,
    )


def extract_section_by_markers(readme_text: str, tags: list[str] | None) -> str:
    if not tags:
        return ""
    for tag in tags:
        start_pattern = _build_marker_regex(tag, ("START",))
        end_pattern = _build_marker_regex(tag, ("END", "STOP"))
        start_match = start_pattern.search(readme_text)
        if not start_match:
            continue
        end_match = end_pattern.search(readme_text, pos=start_match.end())
        if not end_match:
            continue
        return readme_text[start_match.end() : end_match.start()].strip()
    return ""


def extract_section_by_headers(readme_text: str, headers: list[str]) -> str:
    lines = readme_text.splitlines()
    for header in headers:
        pattern = re.compile(rf"^##\s+{re.escape(header)}\s*$", re.IGNORECASE)
        start = None
        for i, line in enumerate(lines):
            if pattern.match(line.strip()):
                start = i + 1
                break
        if start is None:
            continue
        collected: list[str] = []
        for line in lines[start:]:
            if re.match(r"^##\s+", line):
                break
            collected.append(line)
        return "\n".join(collected).strip()
    return ""


def strip_leading_header(text: str, headers: list[str]) -> str:
    if not text:
        return ""
    lines = text.splitlines()
    while lines and not lines[0].strip():
        lines.pop(0)
    if not lines:
        return ""
    first = lines[0].strip()
    for header in headers:
        pattern = re.compile(rf"^##\s+{re.escape(header)}\s*$", re.IGNORECASE)
        if pattern.match(first):
            lines.pop(0)
            while lines and not lines[0].strip():
                lines.pop(0)
            break
    return "\n".join(lines).strip()


def extract_section(readme_text: str, headers: list[str], marker_tags: list[str] | None = None) -> str:
    marker_content = extract_section_by_markers(readme_text, marker_tags)
    if marker_content:
        return strip_leading_header(marker_content, headers)
    return extract_section_by_headers(readme_text, headers)


def load_file(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def assemble_prompt(student: str, task: str, variant: str, readme_text: str, variants_text: str) -> str:
    description = extract_section(readme_text, ['Описание'], ['description'])
    criteria = extract_section(
        readme_text,
        ['Критерии оценивания (100 баллов)', 'Критерии оценивания'],
        ['criteria'],
    )
    artifacts = extract_section(readme_text, ['Артефакты (что сдаём)', 'Артефакты'], ['artifacts'])
    bonuses = extract_section(readme_text, ['Бонусы (+ до 10)', 'Бонусы'], ['bonuses'])

    criteria_parts: list[str] = []
    if criteria:
        criteria_parts.append(criteria)
    if bonuses:
        criteria_parts.append('Бонусы (+ до 10)\n' + bonuses)
    criteria_text = '\n\n'.join(criteria_parts).strip()

    # Get variant description from variants_text
    variant_desc = ""
    try:
        variant_num = int(variant)
        lines = variants_text.splitlines()
        for line in lines:
            m = re.match(rf"^{variant_num}\.\s+(.*)", line)
            if m:
                variant_desc = m.group(1).strip()
                break
    except Exception:
        pass

    system_message = (
        "Ты строгий проверяющий лабораторных работ. Оценивай только по критериям, не рассуждай вне шаблона, "
        "не проявляй эмпатию, не добавляй лишних комментариев. Следуй формату вывода и инструкциям промпта."
    )
    prompt_lines = [
        "[System message для AI]:",
        system_message,
        "[Рекомендация: использовать temperature=0.3 для консистентности оценок]",
        "",
        "Оцени лабораторную работу.",
        f"Смотреть файлы только в папке: (\"students\\{student}\\{task}\").",
        f"Проверять только лабораторную работу в папке : \"{task}\".",
        "Игнорируй все изображения(\".jpg\", \".jpeg\", \".png\", \".gif\", \".svg\", \".webp\", \".avif\").",
        "Игнорируй служебные и временные файлы(\".tmp\",\".bak\",\".zip\",\".rar\",\".7z\"),",
        "Описание работы:",
        description or "(Описание не найдено в readme)",
        "",
        "Проверить соответствие теме варианту задания:",
        f"Вариант {variant}: {variant_desc if variant_desc else '(описание варианта не найдено)'}",
        "Явно проверь, что тема работы соответствует описанию варианта.",
        "",
        "Оценить по критериям:",
    criteria_text or "(Критерии не найдены в readme)",
        "",
        "лабораторная работа должна содержать:",
    artifacts or "(Артефакты не найдены в readme)",
        "",
        "Выводи строго в формате:",
        "критерии: NNN / XXX",
        "Итого: NNN / 100",
        "",
        "Предлагай фиксы по улучшению, максимум 2 и кратко(по 1 предложению каждый).",
        "анализируй только файлы, которые есть в папке.",
        "Не описывай найденные файлы, только используй их для оценки.",
    ]
    return "\n".join(prompt_lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--student', '-s', required=True, help='Student directory name (NameLatin)')
    parser.add_argument('--task', '-t', required=True, help='Task number, e.g. task_01 or task_1 or 01')
    args = parser.parse_args(argv)

    student = args.student
    task_raw = args.task
    # normalize task folder name to task_XX
    m = re.search(r'(\d+)', task_raw)
    if not m:
        print('Invalid task name, specify a number like 01 or task_01', file=sys.stderr)
        return 2
    task_num = int(m.group(1))
    task_folder = f'task_{task_num:02d}'

    students_csv = ROOT / 'students' / 'students.csv'
    students = []
    if students_csv.exists():
        students = read_students_csv(students_csv)
    variant = find_student_variant(students, student) or '(unknown)'

    readme_path = ROOT / 'tasks' / task_folder / 'readme.md'
    variants_path = ROOT / 'tasks' / task_folder / 'Варианты.md'

    readme_text = load_file(readme_path)
    variants_text = load_file(variants_path)

    prompt = assemble_prompt(student, task_folder, variant, readme_text, variants_text)
    print(prompt)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
