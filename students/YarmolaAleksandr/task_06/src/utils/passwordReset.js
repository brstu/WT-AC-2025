const crypto = require('crypto');

/**
 * Generate a random password reset token
 * @returns {string} Random hex token (64 characters)
 */
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash reset token for storage
 * @param {string} token - Plain token
 * @returns {string} Hashed token
 */
function hashResetToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Get token expiration date (1 hour from now)
 * @returns {Date} Expiration date
 */
function getResetTokenExpiration() {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}

module.exports = {
  generateResetToken,
  hashResetToken,
  getResetTokenExpiration,
};
