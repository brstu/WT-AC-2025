const service = require('../services/playlists.service');
const { ValidationError, BadRequestError } = require('../errors/http-errors');

function parsePagination(req) {
  const q = req.query.q ? String(req.query.q) : '';
  const limitRaw = req.query.limit !== undefined ? Number(req.query.limit) : 10;
  const offsetRaw = req.query.offset !== undefined ? Number(req.query.offset) : 0;

  if (Number.isNaN(limitRaw) || Number.isNaN(offsetRaw)) {
    throw new BadRequestError('limit and offset must be numbers');
  }

  return { q, limit: limitRaw, offset: offsetRaw };
}

async function list(req, res, next) {
  try {
    const { q, limit, offset } = parsePagination(req);
    const result = await service.list({ q, limit, offset });
    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const entity = await service.getById(req.params.id);
    res.status(200).json(entity);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const errors = service.validateCreate(req.body || {});
    if (errors.length) throw new ValidationError('Invalid body', errors);

    const entity = await service.create(req.body);
    res.status(201).json(entity);
  } catch (e) {
    next(e);
  }
}

async function replace(req, res, next) {
  try {
    const body = req.body || {};
    const errors = service.validateCreate(body);
    if (typeof body.done !== 'boolean') {
      errors.push({ field: 'done', message: 'done is required for PUT and must be boolean' });
    }
    if (errors.length) throw new ValidationError('Invalid body', errors);

    const entity = await service.replace(req.params.id, body);
    res.status(200).json(entity);
  } catch (e) {
    next(e);
  }
}

async function patch(req, res, next) {
  try {
    const body = req.body || {};
    const errors = service.validateUpdate(body);
    if (errors.length) throw new ValidationError('Invalid body', errors);

    const entity = await service.update(req.params.id, body);
    res.status(200).json(entity);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = {
  list,
  getById,
  create,
  replace,
  patch,
  remove
};
