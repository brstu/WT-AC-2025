const AppError = require('./utils/AppError');
const { postSchema, postUpdateSchema, commentSchema } = require('./utils/validation');

exports.validatePost = (req, res, next) => {
  try {
    req.body = postSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors.map(e => e.message).join(', '), 422));
  }
};

exports.validatePostUpdate = (req, res, next) => {
  try {
    req.body = postUpdateSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors.map(e => e.message).join(', '), 422));
  }
};

exports.validateComment = (req, res, next) => {
  try {
    req.body = commentSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors.map(e => e.message).join(', '), 422));
  }
};

const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack
    });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
};

module.exports = errorMiddleware;