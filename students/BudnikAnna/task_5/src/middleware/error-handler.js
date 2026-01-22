const { HttpError } = require('../errors/http-errors');

function errorHandler(err, req, res, next) {
  const isHttp = err instanceof HttpError;

  const status = isHttp ? err.statusCode : 500;

  const payload = {
    error: isHttp ? err.name : 'InternalServerError',
    message: err.message || 'Internal Server Error'
  };

  if (isHttp && err.details) {
    payload.details = err.details;
  }

  if (!isHttp) console.error(err);

  res.status(status).json(payload);
}

module.exports = { errorHandler };
