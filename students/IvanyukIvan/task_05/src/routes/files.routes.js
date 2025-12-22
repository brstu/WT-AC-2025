const express = require('express');
const router = express.Router();
const multer = require('multer');
const filesController = require('../controllers/files.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate, validateFileUpload } = require('../middleware/validation.middleware');
const { querySchema, fileUpdateSchema, filePermissionsUpdateSchema } = require('../schemas/file.schema');
const config = require('../config');

// Configure multer for file upload
const upload = multer({
  limits: {
    fileSize: config.storage.maxFileSize
  },
  fileFilter: (req, file, cb) => {
    if (config.storage.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Public routes
router.post('/auth/login', filesController.login);

// Protected routes
router.use(authenticate);

// File CRUD operations
router.post('/files', 
  upload.single('file'),
  validateFileUpload,
  filesController.uploadFile
);

router.get('/files',
  validate(querySchema),
  filesController.getFiles
);

router.get('/files/:id',
  filesController.getFile
);

router.get('/files/:id/download',
  filesController.downloadFile
);

router.patch('/files/:id',
  validate(fileUpdateSchema),
  filesController.updateFile
);

router.delete('/files/:id',
  filesController.deleteFile
);

// File versions
router.post('/files/:id/versions',
  upload.single('file'),
  validateFileUpload,
  filesController.uploadVersion
);

router.get('/files/:id/versions',
  filesController.getVersions
);

router.get('/files/:id/versions/:versionId/download',
  filesController.downloadVersion
);

// File permissions
router.put('/files/:id/permissions',
  validate(filePermissionsUpdateSchema),
  filesController.updatePermissions
);

module.exports = router;