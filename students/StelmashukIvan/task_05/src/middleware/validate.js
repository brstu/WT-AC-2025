const validate = (schema) => (req, res, next) => {
  try {
    if (schema) {
      const result = schema.parse(req.body);
      req.body = result;
    }
    next();
  } catch (error) {
    const details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    const validationError = new Error('Validation failed');
    validationError.status = 422;
    validationError.details = details;
    next(validationError);
  }
};

const validateQuery = (schema) => (req, res, next) => {
  try {
    if (schema) {
      const result = schema.parse(req.query);
      req.query = result;
    }
    next();
  } catch (error) {
    const details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    const validationError = new Error('Query validation failed');
    validationError.status = 422;
    validationError.details = details;
    next(validationError);
  }
};

module.exports = { validate, validateQuery };