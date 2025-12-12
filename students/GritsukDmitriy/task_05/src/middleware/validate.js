const AppError = require('../utils/AppError');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        message: detail.message,
        path: detail.path
      }));
      
      return next(new AppError('Validation Error', 422, errorDetails));
    }
    
    // Заменяем валидированные данные
    req[property] = value;
    next();
  };
};

module.exports = validate;