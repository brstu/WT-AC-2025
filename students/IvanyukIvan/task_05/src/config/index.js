const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key',
    expiry: process.env.TOKEN_EXPIRY || '24h'
  },
  
  storage: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf,text/plain').split(','),
    storagePath: process.env.STORAGE_PATH || path.join(__dirname, '../../storage/files'),
    metadataPath: path.join(__dirname, '../../storage/metadata.json')
  }
};