const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError } = require('../utils/errors');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError();
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiry });
};

module.exports = { authenticate, generateToken };