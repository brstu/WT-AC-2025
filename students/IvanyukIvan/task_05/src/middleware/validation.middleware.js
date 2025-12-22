const { ValidationError } = require('../utils/errors');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse({
        ...req.body,
        ...req.query,
        ...req.params
      });

      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        throw new ValidationError('Validation failed', errors);
      }

      req.validatedData = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return next(new ValidationError('File is required'));
  }
  next();
};

module.exports = { validate, validateFileUpload };