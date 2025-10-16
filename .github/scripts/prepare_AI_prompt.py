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


def extract_section_from_readme(readme_text: str, header: str) -> str:
    # Find markdown header like '## Описание' and return the following paragraph(s) up to next header
    pattern = rf"^##\s+{re.escape(header)}\s*$"
    lines = readme_text.splitlines()
    start = None
    for i, line in enumerate(lines):
        if re.match(pattern, line.strip()):
            start = i + 1
            break
    if start is None:
        return ""
    collected = []
    for line in lines[start:]:
        if re.match(r"^##\s+", line):
            break
        collected.append(line)
    return "\n".join(collected).strip()


def load_file(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")


def assemble_prompt(student: str, task: str, variant: str, readme_text: str, variants_text: str) -> str:
    description = extract_section_from_readme(readme_text, 'Описание')
    criteria = extract_section_from_readme(readme_text, 'Критерии оценивания (100 баллов)')
    if not criteria:
        # fallback to shorter header
        criteria = extract_section_from_readme(readme_text, 'Критерии оценивания')
    artifacts = extract_section_from_readme(readme_text, 'Артефакты (что сдаём)')
    if not artifacts:
        artifacts = extract_section_from_readme(readme_text, 'Артефакты')

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
        f"Проверять только лабу в папке : \"{task}\".",
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
        criteria or "(Критерии не найдены в readme)",
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
