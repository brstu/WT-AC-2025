export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (e) {
    res.status(422).json({
      message: 'Validation error',
      errors: e.errors
    });
  }
};
