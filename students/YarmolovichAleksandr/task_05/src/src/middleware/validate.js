const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(422).json({
      error: 'Validation failed',
      details: error.errors,
    });
  }
};

module.exports = validate;