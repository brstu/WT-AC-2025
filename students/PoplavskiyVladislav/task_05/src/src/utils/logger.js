const config = require('../config');

const logger = {
  info: (...args) => {
    if (config.nodeEnv !== 'test') {
      console.log('[INFO]', new Date().toISOString(), ...args);
    }
  },
  error: (...args) => {
    console.error('[ERROR]', new Date().toISOString(), ...args);
  },
  warn: (...args) => {
    console.warn('[WARN]', new Date().toISOString(), ...args);
  }
};

module.exports = logger;