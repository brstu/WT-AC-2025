const { createAlbumSchema, updateAlbumSchema } = require('../schemas/albumSchema');
const db = require('../data/db');
const AppError = require('../utils/AppError');

function parseIntOrDefault(val, def) {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? def : n;
}

exports.getAll = (req, res, next) => {
  try {
    let items = db.getAll();

    if (req.query.q) {
      const q = req.query.q.toLowerCase();
      items = items.filter(a =>
        String(a.title).toLowerCase().includes(q) ||
        String(a.artist).toLowerCase().includes(q)
      );
    }

    const page = parseIntOrDefault(req.query.page, 1);
    const limit = parseIntOrDefault(req.query.limit, 10);
    const start = (page - 1) * limit;
    const end = start + limit;

    const paged = items.slice(start, end);

    res.json({
      status: 'success',
      results: items.length,
      page,
      limit,
      data: paged
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return next(new AppError('Invalid id', 400));
    const album = db.getById(id);
    if (!album) return next(new AppError('Album not found', 404));
    res.json({ status: 'success', data: album });
  } catch (err) {
    next(err);
  }
};

exports.create = (req, res, next) => {
  try {
    const parsed = createAlbumSchema.parse(req.body);
    const newAlbum = db.create(parsed);
    res.status(201).json({ status: 'success', data: newAlbum });
  } catch (err) {
    next(err);
  }
};

exports.update = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return next(new AppError('Invalid id', 400));
    const parsed = updateAlbumSchema.parse(req.body);
    const updated = db.update(id, parsed);
    if (!updated) return next(new AppError('Album not found', 404));
    res.json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
};

exports.remove = (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return next(new AppError('Invalid id', 400));
    const ok = db.remove(id);
    if (!ok) return next(new AppError('Album not found', 404));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
