const { ValidationError } = require('../utils/errors');

module.exports = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (error) {
    const details = error.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
    next(new ValidationError('Invalid input data', details));
  }
};