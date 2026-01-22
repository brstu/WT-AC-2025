const { NotFoundError } = require('../errors/http-errors');

function notFound(req, res, next) {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { notFound };
