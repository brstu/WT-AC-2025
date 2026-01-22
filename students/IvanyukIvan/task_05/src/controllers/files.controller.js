const fileModel = require('../models/file.model');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');
const { generateToken } = require('../middleware/auth.middleware');
const config = require('../config');

class FilesController {
  // Auth endpoints
  async login(req, res, next) {
    try {
      // Simplified auth - in production use proper user management
      const { userId } = req.body;
      
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const token = generateToken(userId);
      
      res.status(200).json({
        status: 'success',
        token,
        user: { id: userId }
      });
    } catch (error) {
      next(error);
    }
  }

  // File endpoints
  async uploadFile(req, res, next) {
    try {
      const { name, description, tags, isPublic } = req.body;
      const userId = req.user.id;
      
      const result = await fileModel.createFile(
        req.file,
        { name, description, tags: tags ? JSON.parse(tags) : [], isPublic: isPublic === 'true' },
        userId
      );

      res.status(201).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getFiles(req, res, next) {
    try {
      const userId = req.user.id;
      const query = req.validatedData;
      
      const result = await fileModel.getFiles(query, userId);
      
      res.status(200).json({
        status: 'success',
        data: result.files,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
          hasMore: result.offset + result.limit < result.total
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getFile(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const file = await fileModel.getFileById(id, userId);
      
      if (!file) {
        throw new NotFoundError('File');
      }
      
      res.status(200).json({
        status: 'success',
        data: file
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadFile(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const file = await fileModel.getFileById(id, userId);
      
      if (!file) {
        throw new NotFoundError('File');
      }

      const content = await fileModel.getVersionContent(id, file.currentVersion, userId);
      
      if (!content) {
        throw new NotFoundError('File content');
      }

      res.set({
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.name}"`,
        'Content-Length': content.length
      });

      res.send(content);
    } catch (error) {
      next(error);
    }
  }

  async updateFile(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const userId = req.user.id;
      
      const file = await fileModel.updateFile(id, updates, userId);
      
      if (!file) {
        throw new ForbiddenError('You do not have permission to update this file');
      }
      
      res.status(200).json({
        status: 'success',
        data: file
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFile(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const deleted = await fileModel.deleteFile(id, userId);
      
      if (!deleted) {
        throw new ForbiddenError('You do not have permission to delete this file');
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Version endpoints
  async uploadVersion(req, res, next) {
    try {
      const { id } = req.params;
      const { changes } = req.body;
      const userId = req.user.id;
      
      const version = await fileModel.createVersion(id, req.file, userId, changes);
      
      if (!version) {
        throw new ForbiddenError('You do not have permission to upload new version');
      }
      
      res.status(201).json({
        status: 'success',
        data: version
      });
    } catch (error) {
      next(error);
    }
  }

  async getVersions(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const versions = await fileModel.getFileVersions(id, userId);
      
      if (versions === null) {
        throw new NotFoundError('File');
      }
      
      res.status(200).json({
        status: 'success',
        data: versions
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadVersion(req, res, next) {
    try {
      const { id, versionId } = req.params;
      const userId = req.user.id;
      
      const file = await fileModel.getFileById(id, userId);
      
      if (!file) {
        throw new NotFoundError('File');
      }

      const content = await fileModel.getVersionContent(id, versionId, userId);
      
      if (!content) {
        throw new NotFoundError('Version');
      }

      res.set({
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.name}_v${versionId.slice(0, 8)}"`,
        'Content-Length': content.length
      });

      res.send(content);
    } catch (error) {
      next(error);
    }
  }

  // Permission endpoints
  async updatePermissions(req, res, next) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const userId = req.user.id;
      
      const file = await fileModel.updatePermissions(id, permissions, userId);
      
      if (!file) {
        throw new ForbiddenError('Only owner can update permissions');
      }
      
      res.status(200).json({
        status: 'success',
        data: file.permissions
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FilesController();