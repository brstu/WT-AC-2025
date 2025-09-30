# Lab 01 — Minimal Auto‑Review Prompt (EN)

Use this prompt to run a fast, accurate, and low‑cost review of a Lab 01 submission. It limits scope, avoids unnecessary reads, and standardizes the output.

## Goal

Review the student’s Lab 01 work strictly against the official requirements and their specific variant, using only local files. Do not use the network or external tools.

## Constraints

- Local only: do not make any network requests; do not run Lighthouse or validators. Judge quality by code and the student’s report only.
- Read only the listed files; do not open images; do not quote long code blocks (short snippets only if essential).
- If required files are missing, mark them as “missing” and proceed with what’s available.
- Be concise and fact‑based. Do not restate the assignment text.

## Context locations (fixed)

- Variants (topic list): `tasks/task_01/Варианты.md`
- Requirements: `tasks/task_01/readme.md` — sections “Задания”, “Минимальные технические требования”, “Артефакты”, “Критерии оценивания”, “Бонусы”
- Student work root: `students/<ID>/task_01/{src,doc}`

Variant detection rule:
- Parse `<ID>` following the pattern `<group>-<index>-<SurnameName>-v<variant>`.
- If the `v` prefix is missing (e.g., ends with `-6`), infer the variant from the trailing number.
- Match the topic against the corresponding item in `Варианты.md`.

## Files to read (scope)

Read all text-based files under `students/<ID>/task_01` recursively, excluding the following:

- Images: `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.svg`, `*.webp`
- Binaries/documents/archives: `*.pdf`, `*.zip`, `*.rar`, `*.7z`, `*.docx`, `*.pptx`, `*.xlsx`
- Logs and large artifacts: `*.log`, video/audio files (`*.mp4`, `*.mov`, `*.avi`, `*.mp3`, `*.wav`)
- Build and cache folders: `node_modules/`, `dist/`, `build/`, `.cache/`

Within the included scope, prioritize for evaluation (when present):

- `src/index.html`, `src/styles.css`, `src/script.js`
- `doc/readme.md` or a project `README.md`

Do not open excluded types (e.g., images under `img/`) and do not traverse unrelated folders outside `students/<ID>/task_01`.

## What to do

1) Determine variant from `<ID>` and verify the topic matches the variant in `Варианты.md`.
2) Check compliance with “Задания” (1–7), “Минимальные технические требования”, and “Артефакты” based on the listed files only.
3) Score using the rubric from `tasks/task_01/readme.md`.
4) Identify bonus items implemented (dark theme via `prefers-color-scheme`, responsive images, Web Vitals notes).

## Output format (strict)

- Variant and topic: [variant number and match/mismatch]
- Tasks (1–7): For each item, mark Yes/Partial/No and add 1–2 factual evidence points from code/report.
- Minimal technical requirements: For each item, mark Yes/Partial/No with 1 evidence point.
- Artifacts: list what is present/missing (explicitly state if a publication link to GitHub Pages/Netlify/Vercel is present or missing).
- Rubric scoring (sum = 100):
  - Semantics/Structure — X/20 (one‑sentence justification)
  - Responsive layout — X/25
  - Accessibility — X/20
  - Quality/Validity — X/15
  - Code/Project structure — X/10
  - Publication & Report — X/10
- Bonuses (+ up to 10): list achieved items.
- Total: N/100 (+B bonus points)
- Critical issues: 3–5 concise bullets.
- Recommendations to reach max: 3–5 concrete fixes.

## Additional guidance

- Accessibility is judged by code indicators (headings hierarchy, alt texts, focus visibility, keyboard handling, contrast by palette) — do not run Lighthouse.
- If a requirement is partially met (e.g., Flex used, Grid nominal), mark “Partial” and explain briefly.
- If publication link is absent in code/report, mark it missing (do not invent links).
- Keep the whole response compact, bullet‑based, and free of large code quotations.
