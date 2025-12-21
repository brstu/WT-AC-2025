const crypto = require('crypto');
const { loadAll, saveAll } = require('../repositories/playlists.repo');
const { NotFoundError } = require('../errors/http-errors');

function isIsoDateString(value) {
  if (typeof value !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;

  const [y, m, day] = value.split('-').map(Number);
  return d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m && d.getUTCDate() === day;
}

function validateCreate(body) {
  const errors = [];

  if (typeof body.title !== 'string' || body.title.trim().length < 1 || body.title.trim().length > 100) {
    errors.push({ field: 'title', message: 'title must be a string with length 1..100' });
  }

  if (body.done !== undefined && typeof body.done !== 'boolean') {
    errors.push({ field: 'done', message: 'done must be boolean' });
  }

  if (body.dueDate !== undefined && body.dueDate !== null) {
    if (!isIsoDateString(body.dueDate)) {
      errors.push({ field: 'dueDate', message: 'dueDate must be ISO date string YYYY-MM-DD' });
    }
  }

  return errors;
}

function validateUpdate(body) {
  const errors = [];

  const allowed = ['title', 'done', 'dueDate'];
  const keys = Object.keys(body || {});
  const unknown = keys.filter((k) => !allowed.includes(k));
  if (unknown.length) {
    errors.push({ field: '_', message: `unknown fields: ${unknown.join(', ')}` });
  }

  if (keys.length === 0) {
    errors.push({ field: '_', message: 'body must contain at least one field to update' });
  }

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length < 1 || body.title.trim().length > 100) {
      errors.push({ field: 'title', message: 'title must be a string with length 1..100' });
    }
  }

  if (body.done !== undefined && typeof body.done !== 'boolean') {
    errors.push({ field: 'done', message: 'done must be boolean' });
  }

  if (body.dueDate !== undefined && body.dueDate !== null) {
    if (!isIsoDateString(body.dueDate)) {
      errors.push({ field: 'dueDate', message: 'dueDate must be ISO date string YYYY-MM-DD' });
    }
  }

  return errors;
}

async function list({ q, limit, offset }) {
  const items = await loadAll();

  const query = (q || '').trim().toLowerCase();
  let filtered = items;

  if (query) {
    filtered = items.filter((p) => String(p.title || '').toLowerCase().includes(query));
  }

  const lim = Math.max(0, Math.min(Number.isFinite(limit) ? limit : 10, 100));
  const off = Math.max(0, Number.isFinite(offset) ? offset : 0);

  const page = filtered.slice(off, off + lim);

  return {
    total: filtered.length,
    limit: lim,
    offset: off,
    items: page
  };
}

async function getById(id) {
  const items = await loadAll();
  const found = items.find((p) => p.id === id);
  if (!found) throw new NotFoundError(`Playlist not found: ${id}`);
  return found;
}

async function create({ title, done, dueDate }) {
  const items = await loadAll();
  const now = new Date().toISOString();

  const entity = {
    id: crypto.randomUUID(),
    title: title.trim(),
    done: done ?? false,
    dueDate: dueDate ?? null,
    createdAt: now,
    updatedAt: now
  };

  const next = [entity, ...items];
  await saveAll(next);

  return entity;
}

async function replace(id, { title, done, dueDate }) {
  const items = await loadAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) throw new NotFoundError(`Playlist not found: ${id}`);

  const now = new Date().toISOString();
  const prev = items[idx];

  const nextEntity = {
    ...prev,
    title: title.trim(),
    done: done,
    dueDate: dueDate ?? null,
    updatedAt: now
  };

  const next = items.slice();
  next[idx] = nextEntity;
  await saveAll(next);

  return nextEntity;
}

async function update(id, patch) {
  const items = await loadAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) throw new NotFoundError(`Playlist not found: ${id}`);

  const now = new Date().toISOString();
  const prev = items[idx];

  const nextEntity = {
    ...prev,
    ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
    ...(patch.done !== undefined ? { done: patch.done } : {}),
    ...(patch.dueDate !== undefined ? { dueDate: patch.dueDate } : {}),
    updatedAt: now
  };

  const next = items.slice();
  next[idx] = nextEntity;
  await saveAll(next);

  return nextEntity;
}

async function remove(id) {
  const items = await loadAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) throw new NotFoundError(`Playlist not found: ${id}`);

  const next = items.slice(0, idx).concat(items.slice(idx + 1));
  await saveAll(next);
}

module.exports = {
  validateCreate,
  validateUpdate,
  list,
  getById,
  create,
  replace,
  update,
  remove
};
