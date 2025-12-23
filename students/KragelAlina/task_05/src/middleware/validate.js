const { ValidationError } = require('./errors');
const validateBody = (schema) => (req, res, next) => {
try {
const validated = schema.parse(req.body);
req.body = validated;
next();
} catch (error) {
next(error);
}
};
const validateQuery = (schema) => (req, res, next) => {
try {
const validated = schema.parse(req.query);
req.query = validated;
next();
} catch (error) {
next(error);
}
};
const validateParams = (schema) => (req, res, next) => {
try {
const validated = schema.parse(req.params);
req.params = validated;
next();
} catch (error) {
next(error);
}
};
module.exports = {
validateBody,
validateQuery,
validateParams
};