# WT-AC-2025 CI Tooling

Универсальный проверяющий/оценивающий инструмент для лабораторных работ с интеграцией AI: GitHub Models (Copilot backend) и/или внешнего MCP‑сервера.

Состав:
- GitHub Actions workflow: `.github/workflows/lab-ci.yml` (универсальный для всех ЛР).
- Модульные рубрики в `tools/ci/src/rubrics/task_xx.mjs`.
- Универсальный раннер: `tools/ci/src/check-runner.mjs`.
- AI‑клиенты: GitHub Models (через GITHUB_TOKEN) и MCP (`tools/ci/src/mcp-client.mjs`).

## Что проверяется
- Задания: семантика HTML5 (landmarks, заголовки), наличие Flex/Grid, брейкпойнты для адаптивности.
- Минимальные технические требования: валидность HTML (html-validate), общая корректность/лучшие практики (Lighthouse Best Practices), видимый фокус и пр.
- Артефакты (что сдаём): наличие `doc/readme.md`, скриншоты (Lighthouse/брейкпойнты), ссылка на публикацию (GitHub Pages/Netlify/Vercel).
- Критерии оценивания: баллы по разделам (семантика, адаптивность, доступность, валидность/качество, оформление/структура, публикация/отчёт). Вес взят из описания ЛР.
- Бонусы: тёмная тема (`prefers-color-scheme`), адаптивные изображения (`<picture>`, `srcset`, `sizes`), Web Vitals‑улучшения (lazy/preload/preconnect, размеры изображений).

## Как это работает
1. Триггер: PR, затрагивающий `students/**` (см. `.github/workflows/lab-ci.yml`).
2. По git‑диффу определяется список затронутых директорий `students/<id>/task_xx`.
3. Раннер `check-runner.mjs` динамически находит рубрику по имени работы (`task_01`, `task_02`, …) и передаёт ей управление.
4. Внутри рубрики:
   - Парсится `src/index.html`, `src/styles.css`, `doc/readme.md` (если есть).
   - Запускается локальный `http-server` + Lighthouse (headless) для метрик Accessibility и Best Practices.
   - Проводится валидность HTML (html-validate) и эвристические проверки CSS (брейкпойнты, Flex/Grid, фокус).
   - Опционально вызывается AI:
     - MCP: внешний сервер по `MCP_SERVER_URL` + `MCP_API_KEY`.
     - Либо GitHub Models (Copilot backend) с использованием `GITHUB_TOKEN` — краткие рекомендации.
5. Считаются баллы по рубрике, формируется отчёт `tools/ci/out/<student>/<task>/report.md`, сводка `tools/ci/out/summary.md` и ведомость `tools/ci/out/grades.json`.
6. В PR добавляется комментарий со сводкой; джоб падает, если какой‑то результат ниже порога `SCORE_MIN` (по умолчанию 50).

Артефакты CI:
- `tools/ci/out/summary.md` — сводный отчёт по всем затронутым работам.
- `tools/ci/out/grades.json` — JSON с оценками и тех. деталями.
- `tools/ci/out/<student>/<task>/report.md` — подробный отчёт по одной работе.

## Как расширить на все лабораторные

Добавляйте по одному файлу рубрики на каждую работу в `tools/ci/src/rubrics/`:
- Имя файла: `task_XX.mjs` (например, `task_02.mjs`).
- Экспортируйте минимум:
  - `export function detect(task) { return task === 'task_02'; }`
  - `export async function check({ repoRoot, studentTaskPath, thresholds, ai }) { ... }`
  - (необязательно) `export const title = 'ЛР02: ...'`

Рекомендованный скелет `check`:
1. Определите пути: `srcDir`, `docDir`, файлы `index.html`, `styles.css`, отчёт.
2. Загрузите содержимое (если есть), проверьте существование обязательных файлов.
3. Проведите проверки по критериям ЛРXX: семантика/структура/JS‑логика (если требуется), адаптивность, доступность, валидность, артефакты.
4. При необходимости запустите Lighthouse/валидаторы/линтеры (можете реиспользовать вспомогательные функции из других рубрик — выделяйте их в `src/lib/*` при росте проекта).
5. Подсчитайте баллы согласно весам из `tasks/task_XX/readme.md`.
6. Обнаружьте бонусы, рассчитайте бонусные баллы (cap до +10, если политика та же).
7. Сформируйте `report.md` и верните объект результата:
   ```js
   return {
     student, task,
     score: Math.min(100, score), rawScore: score,
     details, lighthouse,
     hasReport, hasPublication, bonuses,
     reportPath: path.join(outDir, 'report.md')
   };
   ```

Роутинг: раннер автоматически подберёт рубрику по `detect(task)`. Ничего менять в раннере не нужно.

Подсказки:
- Чтобы не дублировать общие проверки (например, Lighthouse/валидность HTML), вынесите их в отдельные модули (`src/lib/…`) и используйте в рубриках.
- Для ЛР с JS можно добавить ESLint/Stylelint/Unit tests (Jest/Vitest) и подключить их в рубрике.
- Если у разных ЛР похожие веса критериев, выделите общую функцию `computeScore(...)` для консистентности.

## Установка и локальный запуск (Windows, PowerShell)

```powershell
# Установка зависимостей
npm i --prefix tools/ci --no-audit --no-fund

# Прогон одной работы локально
# <ваш_идентификатор> = <группа>-<№ п/п>-<SurnameName>-v<вариант> (например, AC100-1-NiasiukAndrei-2)
node tools/ci/src/check-runner.mjs --paths '["students/<ваш_идентификатор>/task_01"]'

# (опционально) MCP для локального прогона
$env:MCP_SERVER_URL="https://your-mcp.example.com"
$env:MCP_API_KEY="<token>"
node tools/ci/src/check-runner.mjs --paths '["students/<ваш_идентификатор>/task_01"]'
```

## Секреты и переменные

- MCP (опционально):
  - `MCP_SERVER_URL`, `MCP_API_KEY` — на уровне репозитория/организации (Secrets). Если не заданы, будет использован GitHub Models (Copilot backend) для кратких рекомендаций.
- GitHub Models (Copilot backend):
  - Использует `GITHUB_TOKEN` автоматически (предоставляется Actions).
  - Дополнительно можно завести Variables: `GH_MODELS_MODEL` (по умолчанию `gpt-4o-mini`), `GH_MODELS_ENDPOINT` (по умолчанию `https://models.inference.ai.azure.com`).

## Траблшутинг
- Lighthouse падает с ошибкой запуска Chrome: проверьте флаги `--no-sandbox` и порт (в рубриках по умолчанию используются разные порты для одновременных запусков).
- Валидатор HTML не стартует: убедитесь, что зависимости установлены (`npm i --prefix tools/ci`).
- Нет комментария в PR: убедитесь, что workflow имеет `pull-requests: write` и запускается на PR из форка (при необходимости используйте `pull_request_target`, учитывая риски безопасности).
- AI не сработал: для MCP проверьте Secrets и URL; для GitHub Models убедитесь, что GITHUB_TOKEN доступен шагу (по умолчанию так и есть).

## FAQ
- Можно ли менять пороги (A11Y/BP/SCORE_MIN)? — Да, меняйте `env` в `.github/workflows/lab-ci.yml`.
- Можно ли отключить AI? — Да, просто не настраивайте MCP; GitHub Models используется только для текстовых советов, их можно закомментировать в рубрике.
- Как добавить общий отчёт в артефакты? — Уже загружается артефакт `lab-reports` с содержимым `tools/ci/out/**`.
