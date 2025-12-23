const express = require('express');
const router = express.Router();
const storage = require('../data/storage');
const { NotFoundError } = require('../middleware/errors');
const { validateBody, validateQuery } = require('../middleware/validate');
const {
  createArtSchema,
  updateArtSchema,
  getArtsQuerySchema
} = require('../validators/artValidator');

router.get('/', validateQuery(getArtsQuerySchema), (req, res) => {
  let arts = storage.getArts();
  const { q, artType, origin, isFeatured, limit, offset, sortBy, order } = req.query;

  if (q) {
    const searchLower = q.toLowerCase();
    arts = arts.filter(a => 
      a.name.toLowerCase().includes(searchLower) ||
      a.style.toLowerCase().includes(searchLower) ||
      (a.description && a.description.toLowerCase().includes(searchLower))
    );
  }

  if (artType) {
    arts = arts.filter(a => a.artType.toLowerCase() === artType.toLowerCase());
  }

  if (origin) {
    arts = arts.filter(a => a.origin.toLowerCase() === origin.toLowerCase());
  }

  if (typeof isFeatured !== 'undefined') {
    arts = arts.filter(a => a.isFeatured === isFeatured);
  }

  arts.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    if (sortBy === 'createdYear' || sortBy === 'createdAt') {
      aVal = aVal ? new Date(aVal).getTime() : 0;
      bVal = bVal ? new Date(bVal).getTime() : 0;
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (order === 'asc') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    }
    return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
  });

  const total = arts.length;
  const paginated = arts.slice(offset, offset + limit);

  res.json({
    data: paginated,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  });
});

router.get('/:id', (req, res, next) => {
  const art = storage.getArtById(req.params.id);
  if (!art) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  res.json(art);
});

router.post('/', validateBody(createArtSchema), (req, res) => {
  const art = storage.createArt(req.body);
  res.status(201).json(art);
});

router.put('/:id', validateBody(createArtSchema), (req, res, next) => {
  const art = storage.updateArt(req.params.id, req.body);
  if (!art) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  res.json(art);
});

router.patch('/:id', validateBody(updateArtSchema), (req, res, next) => {
  const art = storage.updateArt(req.params.id, req.body);
  if (!art) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  res.json(art);
});

router.delete('/:id', (req, res, next) => {
  const deleted = storage.deleteArt(req.params.id);
  if (!deleted) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  res.status(204).send();
});

router.post('/:id/like', (req, res, next) => {
  const art = storage.getArtById(req.params.id);
  if (!art) {
    return next(new NotFoundError(`Арт с ID ${req.params.id} не найден`));
  }
  const updated = storage.updateArt(req.params.id, { likes: art.likes + 1 });
  res.json(updated);
});

module.exports = router;