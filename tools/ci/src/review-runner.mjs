// Review runner for lab01 using Copilot
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { globby } from 'globby';

function readArg(name, def) {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i+1]) return process.argv[i+1];
  return def;
}

const studentTask = readArg('student-task', '');
if (!studentTask) {
  console.log('No student task provided');
  process.exit(0);
}

const repoRoot = path.resolve(process.cwd());
const studentRoot = path.join(repoRoot, studentTask);

// Read prompt
const promptFile = path.join(repoRoot, 'docs', 'lab01_review_prompt_en.md');
const reviewPrompt = fs.readFileSync(promptFile, 'utf8');

// Read files
const textFiles = await globby(['**/*'], { cwd: studentRoot, ignore: ['*.png', '*.jpg', '*.jpeg', '*.gif', '*.svg', '*.webp', '*.pdf', '*.zip', '*.rar', '*.7z', '*.docx', '*.pptx', '*.xlsx', '*.log', '**/*.mp4', '**/*.mov', '**/*.avi', '**/*.mp3', '**/*.wav', 'node_modules/**', 'dist/**', 'build/**', '.cache/**'] });
const files = [];
for (const f of textFiles) {
  const p = path.join(studentRoot, f);
  if (fs.statSync(p).isFile()) {
    const content = fs.readFileSync(p, 'utf8').slice(0, 10000); // limit to 10k
    files.push({ name: f, content });
  }
}

// Construct AI prompt
const aiPrompt = reviewPrompt + '\n\nStudent files:\n' + files.map(f => `## ${f.name}\n${f.content}`).join('\n\n');

// Call GitHub Models
async function askGitHubModels(prompt) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('No GITHUB_TOKEN');
  const endpoint = 'https://models.inference.ai.azure.com';
  const model = 'gpt-4o-mini';
  const data = JSON.stringify({ model, messages: [{ role: 'user', content: prompt }], temperature: 0.2 });

  return new Promise((resolve, reject) => {
    const req = https.request(new URL('/v1/chat/completions', endpoint), {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    });
    req.on('response', (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(body);
          const text = j.choices?.[0]?.message?.content || 'No response';
          resolve(text);
        } catch (e) {
          reject(new Error('Bad JSON'));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

try {
  const review = await askGitHubModels(aiPrompt);
  fs.writeFileSync('review.md', review);
  console.log('Review generated');
} catch (e) {
  console.error('Error', e);
  fs.writeFileSync('review.md', 'Error generating review: ' + e.message);
}