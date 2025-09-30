// Universal lab checker/grader routed by task rubric plugins
import fs from 'node:fs';
import path from 'node:path';
import { globby, globbySync } from 'globby';
import { pathToFileURL } from 'node:url';

function readJsonArg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i+1]) return JSON.parse(process.argv[i+1]);
  return def;
}
function readArg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i+1]) return process.argv[i+1];
  return def;
}

const onlyTask = readArg('only', '');
const pathsArg = readJsonArg('paths', []);
const a11yMin = Number(readArg('a11y-min', '90'));
const bpMin = Number(readArg('bp-min', '90'));
const mcpUrl = readArg('mcp-url', '');
const mcpKey = readArg('mcp-key', '');
const ghModel = readArg('gh-model', process.env.GH_MODELS_MODEL || 'gpt-4o-mini');
const ghEndpoint = readArg('gh-endpoint', process.env.GH_MODELS_ENDPOINT || 'https://models.inference.ai.azure.com');

// Run from repo root (workflow calls node tools/ci/src/check-runner.mjs)
const repoRoot = path.resolve(process.cwd());
const outRoot = path.join(repoRoot, 'tools/ci/out');
fs.mkdirSync(outRoot, { recursive: true });

// Load rubrics dynamically
const rubricFiles = globbySync(['src/rubrics/task_*.mjs'], { cwd: path.join(repoRoot, 'tools/ci') });
const rubrics = await Promise.all(
  rubricFiles.map(async f => {
    const abs = path.join(repoRoot, 'tools/ci', f);
    const url = pathToFileURL(abs).href;
    return { file: f, mod: await import(url) };
  })
);

function taskOf(p) { return p.split('/')[2]; }

const targets = (pathsArg.length ? pathsArg : []).filter(Boolean).filter(p => p.startsWith('students/'));

if (!targets.length) {
  console.log('No student task paths provided.');
  process.exit(0);
}

const all = [];

for (const t of targets) {
  const task = taskOf(t);
  if (onlyTask && onlyTask !== task) continue;
  const rubric = rubrics.find(r => r.mod.detect(task));
  if (!rubric) {
    console.log(`No rubric for ${task}, skipping.`);
    continue;
  }
  const res = await rubric.mod.check({ repoRoot, studentTaskPath: t, thresholds: { a11yMin, bpMin }, ai: { mcpUrl, mcpKey, ghModel, ghEndpoint } });
  // write per-task report location to summary later
  all.push(res);
}

// Write summary and grades
const summary = ['## Автоматическая проверка лабораторных', ''];
for (const r of all) {
  const rel = path.relative(repoRoot, r.reportPath).replace(/\\/g,'/');
  summary.push(`### ${r.student}/${r.task}`);
  summary.push(`- Итог: ${r.score} / 100`);
  summary.push(`- Lighthouse: A11y ${r.lighthouse?.a11y ?? '—'}, Best Practices ${r.lighthouse?.bestPractices ?? '—'}`);
  summary.push(`- Публикация: ${r.hasPublication ? 'есть' : 'нет'}`);
  summary.push(`- Бонусы: ${(r.bonuses||[]).join(', ') || '—'}`);
  summary.push(`- Отчёт: ${r.hasReport ? 'есть' : 'нет'}`);
  summary.push(`[Детальный отчёт](/${rel})`);
  summary.push('');
}
fs.writeFileSync(path.join(outRoot, 'summary.md'), summary.join('\n'), 'utf8');
fs.writeFileSync(path.join(outRoot, 'grades.json'), JSON.stringify(all, null, 2), 'utf8');

console.log('Done.');
