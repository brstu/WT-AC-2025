const AppError = require('../utils/AppError');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new AppError('Ошибка валидации', 400, { errors });
      }
      
      req.validatedData = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        throw new AppError('Ошибка валидации параметров запроса', 400, { errors });
      }
      
      req.validatedQuery = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validate,
  validateQuery
};