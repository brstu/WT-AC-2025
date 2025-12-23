const fs = require('fs/promises');
const path = require('path');

const DEFAULT_DATA_FILE = path.resolve(process.cwd(), 'data', 'playlists.json');

let cache = null;

function getDataFilePath() {
  const p = process.env.DATA_FILE ? path.resolve(process.cwd(), process.env.DATA_FILE) : DEFAULT_DATA_FILE;
  return p;
}

async function ensureFileExists(filePath) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, '[]', 'utf-8');
  }
}

async function loadAll() {
  const filePath = getDataFilePath();
  await ensureFileExists(filePath);

  if (cache) return cache;

  const raw = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(raw);
  cache = Array.isArray(data) ? data : [];
  return cache;
}

async function saveAll(items) {
  const filePath = getDataFilePath();
  await ensureFileExists(filePath);

  cache = items;
  await fs.writeFile(filePath, JSON.stringify(items, null, 2), 'utf-8');
}

module.exports = {
  loadAll,
  saveAll
};
