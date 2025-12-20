const { ValidationError } = require('./errorHandler');

const validate = (schema, source) => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    throw new ValidationError(result.error.errors.map((e) => e.message).join(', '));
  }
  req[source] = result.data;
  next();
};

module.exports = validate;
