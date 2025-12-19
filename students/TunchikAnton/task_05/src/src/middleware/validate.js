const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
    next(new ApiError(422, `Validation error: ${errorMessages.join(', ')}`));
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    const validatedQuery = schema.parse(req.query);
    req.query = validatedQuery;
    next();
  } catch (error) {
    next(new ApiError(400, 'Invalid query parameters'));
  }
};

module.exports = {
  validate,
  validateQuery
};