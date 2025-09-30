// Rubric for task_01 (HTML/CSS semantics, responsive, a11y, quality, artifacts, bonuses)
import fs from 'node:fs';
import path from 'node:path';
import cheerio from 'cheerio';
import postcss from 'postcss';
import safeParser from 'postcss-safe-parser';
import { spawn, execSync } from 'node:child_process';
import { globbySync } from 'globby';
import { askMCP } from '../mcp-client.mjs';
import https from 'node:https';

async function askGitHubModels({ endpoint, model, prompt }) {
  // Uses GitHub-hosted Models API via GITHUB_TOKEN
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) return { ok: false, reason: 'No GitHub token' };
  return new Promise((resolve) => {
    const url = new URL('/v1/chat/completions', endpoint);
    const data = JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.2 });
    const req = https.request(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(body || '{}');
          const text = j.choices?.[0]?.message?.content || '';
          resolve({ ok: true, data: { text } });
        } catch {
          resolve({ ok: false, reason: 'Bad JSON from GH Models' });
        }
      });
    });
    req.on('error', () => resolve({ ok: false, reason: 'Request error' }));
    req.write(data); req.end();
  });
}

export function detect(task) { return task === 'task_01'; }
export const title = 'ЛР01: HTML/CSS';

function load(p) { return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; }
function exists(p) { return fs.existsSync(p); }
function clamp(v, a=0, b=100){ return Math.max(a, Math.min(b, Math.round(v))); }

function checkSemantics(html) {
  const $ = cheerio.load(html);
  const issues = [];
  const need = ['header','nav','main','footer'];
  need.forEach(t => { if ($(t).length === 0) issues.push(`Нет <${t}>`); });
  if ($('section').length === 0 && $('article').length === 0) issues.push('Нет <section>/<article>');
  if ($('h1').length !== 1) issues.push('Должен быть один <h1>');
  $('img').each((_,el)=>{ if(!$(el).attr('alt')) issues.push('img без alt'); });
  $('input,select,textarea').each((_, el) => {
    const $el = $(el); const id = $el.attr('id');
    const hasLabel = $(`label[for="${id}"]`).length>0 || $el.attr('aria-label') || $el.attr('aria-labelledby');
    if(!hasLabel) issues.push(`${$el[0].name} без label/aria`);
  });
  return { ok: issues.length===0, issues };
}

function checkCSS(css) {
  const root = postcss().process(css || '', { parser: safeParser }).root;
  let hasFlex=false, hasGrid=false, hasFocus=false; const mqs=new Set();
  if (root) {
    root.walkDecls('display', d=>{ if((d.value||'').includes('flex')) hasFlex=true; if((d.value||'').includes('grid')) hasGrid=true; });
    root.walkRules(r=>{ if((r.selector||'').includes(':focus')) hasFocus=true; });
    root.walkAtRules('media', at=> mqs.add((at.params||'').replace(/\s+/g,'')));
  }
  const mqText=[...mqs].join('|');
  const has600 = /max-width:\s*600px|min-width:\s*0(px)?/.test(mqText);
  const has1024 = /(min-width:\s*601px|max-width:\s*1024px)/.test(mqText);
  const hasBig = /(min-width:\s*1025px|min-width:\s*1200px)/.test(mqText);
  return { hasFlex, hasGrid, hasFocus, breakpointsOK: has600 && has1024 && hasBig, mqText };
}

function detectBonuses(html, css) {
  const $ = cheerio.load(html);
  const bonuses=[];
  if ((css||'').includes('prefers-color-scheme')) bonuses.push('dark_theme');
  if ($('picture').length>0 || $('img[srcset], source[srcset]').length>0) bonuses.push('adaptive_images');
  const hasLazy = $('img[loading="lazy"]').length>0;
  const hasPreconnect = $('link[rel="preconnect"]').length>0 || $('link[rel="preload"]').length>0;
  const hasWH = $('img[width][height]').length>0;
  if (hasLazy || hasPreconnect || hasWH) bonuses.push('web_vitals');
  return { bonuses };
}

async function runLighthouse(serveDir, entry, outDir) {
  const port = 5181;
  const server = spawn('npx', ['http-server', serveDir, '-p', String(port), '-c-1', '--silent'], { stdio: 'ignore' });
  await new Promise(r=>setTimeout(r,1500));
  let a11y=0,bp=0;
  try {
    const outJson = path.join(outDir, 'lighthouse.json');
    execSync(`npx lighthouse "http://127.0.0.1:${port}/${entry}" --only-categories=accessibility,best-practices --output=json --output-path=${outJson} --quiet --chrome-flags="--headless --no-sandbox"`, { stdio: 'pipe' });
    const rep = JSON.parse(fs.readFileSync(outJson,'utf8'));
    a11y = Math.round((rep.categories.accessibility.score||0)*100);
    bp = Math.round((rep.categories['best-practices'].score||0)*100);
  } catch(e) {}
  server.kill();
  return { a11y, bestPractices: bp };
}

async function htmlValidate(file) {
  try {
    const { default: { HtmlValidate } } = await import('html-validate');
    const v = new HtmlValidate();
    const res = v.validateString(fs.readFileSync(file,'utf8'));
    return { ok: res.valid, messages: res.results?.[0]?.messages || [] };
  } catch(e) {
    return { ok: false, messages: [{ message: 'html-validate failed' }] };
  }
}

function computeScore(parts) {
  let score=0; const details=[];
  const semScore = clamp(20 - parts.semantics.issues.length*4, 0, 20); score+=semScore; details.push({key:'semantics',score:semScore});
  let adapt=0; if(parts.css.breakpointsOK) adapt+=12; if(parts.css.hasFlex) adapt+=6; if(parts.css.hasGrid) adapt+=7; score+=adapt; details.push({key:'responsive',score:adapt});
  let a11y=0; if(parts.css.hasFocus) a11y+=6; a11y += Math.min(14, Math.floor((parts.lighthouse.a11y/100)*14)); score+=a11y; details.push({key:'a11y',score:a11y});
  let qual=0; if(parts.lighthouse.bestPractices>=parts.thresholds.bpMin) qual+=8; if(parts.htmlValidate.ok) qual+=7; score+=qual; details.push({key:'quality',score:qual});
  let proj=0; if(parts.filesOk) proj+=4; if(parts.artifacts.ok) proj+=6; score+=proj; details.push({key:'project',score:proj});
  let pub=0; if(parts.hasPublication) pub+=5; if(parts.hasReport) pub+=5; score+=pub; details.push({key:'report',score:pub});
  let bonus=0; if(parts.bonus.bonuses.includes('dark_theme')) bonus+=3; if(parts.bonus.bonuses.includes('adaptive_images')) bonus+=3; if(parts.bonus.bonuses.includes('web_vitals')) bonus+=4; score += Math.min(10, bonus);
  return { score: clamp(score, 0, 110), bonus: Math.min(10, bonus), details };
}

export async function check({ repoRoot, studentTaskPath, thresholds, ai }) {
  const student = studentTaskPath.split('/')[1];
  const task = studentTaskPath.split('/')[2];
  const srcDir = path.join(repoRoot, studentTaskPath, 'src');
  const docDir = path.join(repoRoot, studentTaskPath, 'doc');
  const idx = path.join(srcDir, 'index.html');
  const cssFile = path.join(srcDir, 'styles.css');
  const reportFile = path.join(docDir, 'readme.md');

  const filesOk = exists(idx) && exists(cssFile);
  const hasReport = exists(reportFile);
  const html = load(idx);
  const css = load(cssFile);
  const docReadme = load(reportFile);

  const semantics = html ? checkSemantics(html) : { ok:false, issues:['Нет index.html'] };
  const cssInfo = css ? checkCSS(css) : { breakpointsOK:false, hasFlex:false, hasGrid:false, hasFocus:false };
  const artifacts = (()=>{
    const issues=[]; if(!hasReport) issues.push('Нет отчёта doc/readme.md');
    const hasPub = /(github\.io|netlify|vercel)/i.test(docReadme);
    if (!hasPub) issues.push('Нет ссылки на публикацию');
    const hasLH = /lighthouse/i.test(docReadme);
  const imgs = globbySync(['**/*.{png,jpg,jpeg,webp}'], { cwd: docDir, dot: false });
    if (!hasLH || imgs.length < 3) issues.push('Нет скриншотов (Lighthouse/брейкпоинты)');
    return { ok: issues.length===0, issues };
  })();
  const hasPublication = /(github\.io|netlify|vercel)/i.test(docReadme);

  const outDir = path.join(repoRoot, 'tools/ci/out', student, task);
  fs.mkdirSync(outDir, { recursive: true });

  const lighthouse = filesOk ? await runLighthouse(srcDir, 'index.html', outDir) : { a11y: 0, bestPractices: 0 };
  const htmlVal = filesOk ? await htmlValidate(idx) : { ok:false, messages:['Нет index.html'] };
  const bonus = detectBonuses(html, css);

  let aiSummary = '—';
  if (ai.mcpUrl && ai.mcpKey && html) {
    const aiRes = await askMCP({ serverUrl: ai.mcpUrl, apiKey: ai.mcpKey, payload: {
      task: 'task_01', rubric: { semantics:['landmarks','headings'], accessibility:['labels','focus'], responsive:['breakpoints','flex-grid'], bonuses:['dark_theme','adaptive_images','web_vitals'] }, code: { html, css }, doc: docReadme || ''
    }});
    if (aiRes.ok) aiSummary = aiRes.data?.summary || JSON.stringify(aiRes.data).slice(0,500);
  } else if (ai.ghEndpoint && ai.ghModel && html) {
    const text = [
      'Оцени лабораторную работу (task_01) по критериям:',
      '- Семантика/структура (landmarks, заголовки)',
      '- Адаптивность (брейкпойнты, Flex/Grid)',
      '- Доступность (label/aria, фокус, клавиатура)',
      '- Качество/валидность (валидаторы, best practices)',
      '- Бонусы (dark theme, picture/srcset, web vitals)',
      'Код HTML:\n```html\n'+(html.slice(0,5000))+'\n```',
      'CSS:\n```css\n'+(css.slice(0,5000))+'\n```',
      'Кратко сформулируй рекомендации (до 6 пунктов).'
    ].join('\n');
    const gh = await askGitHubModels({ endpoint: ai.ghEndpoint, model: ai.ghModel, prompt: text });
    if (gh.ok) aiSummary = gh.data.text;
  }

  const parts = { semantics, css: cssInfo, artifacts, lighthouse, htmlValidate: htmlVal, filesOk, hasPublication, hasReport, bonus, thresholds };
  const { score, details, bonus: bonusScore } = computeScore(parts);

  const reportMd = [
    `# Отчёт по ${student}/${task}`,
    `- Итог: ${Math.min(100, score)} / 100 (сырые: ${score}, бонусы +${bonusScore})`,
    `- Lighthouse: A11y ${lighthouse.a11y}, Best Practices ${lighthouse.bestPractices}`,
    `- Семантика: ${semantics.issues.length? 'проблемы' : 'OK'} ${semantics.issues.length? '('+semantics.issues.join('; ')+')':' '}`,
    `- Адаптивность: MQ=${cssInfo.breakpointsOK}, Flex=${cssInfo.hasFlex}, Grid=${cssInfo.hasGrid}`,
    `- Доступность: focus=${cssInfo.hasFocus}`,
    `- Валидность HTML: ${htmlVal.ok? 'OK' : 'Issues'} (${(htmlVal.messages||[]).length})`,
    `- Артефакты: ${artifacts.ok? 'OK' : artifacts.issues.join('; ')}`,
    `- Публикация: ${hasPublication? 'есть':'нет'}`,
    `- Бонусы: ${bonus.bonuses.join(', ') || '—'}`,
    `- AI (MCP): ${aiSummary}`
  ].join('\n');
  fs.writeFileSync(path.join(outDir, 'report.md'), reportMd, 'utf8');

  return {
    student, task,
    score: Math.min(100, score), rawScore: score,
    details, lighthouse,
    hasReport, hasPublication, bonuses: bonus.bonuses,
    reportPath: path.join(outDir, 'report.md')
  };
}
