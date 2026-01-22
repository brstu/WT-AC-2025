const storageService = require('../services/storage.service');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

class FileStorage {
  constructor() {
    this.metadataPath = config.storage.metadataPath;
    this.storagePath = config.storage.storagePath;
    this.initStorage();
  }

  async initStorage() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      await this.ensureMetadataFile();
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async ensureMetadataFile() {
    try {
      await fs.access(this.metadataPath);
    } catch {
      await fs.writeFile(this.metadataPath, JSON.stringify({ files: [], versions: [] }, null, 2));
    }
  }

  async readMetadata() {
    const data = await fs.readFile(this.metadataPath, 'utf8');
    return JSON.parse(data);
  }

  async writeMetadata(metadata) {
    await fs.writeFile(this.metadataPath, JSON.stringify(metadata, null, 2));
  }

  async createFile(fileData, metadata, userId) {
    const fileId = uuidv4();
    const versionId = uuidv4();
    const timestamp = new Date().toISOString();

    const fileMetadata = {
      id: fileId,
      name: metadata.name,
      originalName: fileData.originalname,
      description: metadata.description || '',
      mimeType: fileData.mimetype,
      size: fileData.size,
      ownerId: userId,
      tags: metadata.tags || [],
      isPublic: metadata.isPublic || false,
      permissions: [{
        userId,
        canRead: true,
        canWrite: true,
        canDelete: true
      }],
      createdAt: timestamp,
      updatedAt: timestamp,
      currentVersion: versionId
    };

    const version = {
      id: versionId,
      fileId,
      versionNumber: 1,
      size: fileData.size,
      hash: await this.calculateHash(fileData.buffer),
      uploadedBy: userId,
      uploadedAt: timestamp,
      changes: 'Initial version'
    };

    const storageData = await this.readMetadata();
    storageData.files.push(fileMetadata);
    storageData.versions.push(version);
    await this.writeMetadata(storageData);

    // Save file to disk
    const fileName = `${fileId}_${versionId}`;
    await storageService.saveFile(fileData.buffer, fileName);

    return { file: fileMetadata, version };
  }

  async getFileById(fileId, userId) {
    const storageData = await this.readMetadata();
    const file = storageData.files.find(f => f.id === fileId);
    
    if (!file) return null;
    
    // Check permissions
    if (!file.isPublic && file.ownerId !== userId) {
      const userPermission = file.permissions.find(p => p.userId === userId);
      if (!userPermission || !userPermission.canRead) {
        return null;
      }
    }
    
    return file;
  }

  async getFiles(query = {}, userId) {
    const storageData = await this.readMetadata();
    let files = storageData.files;

    // Apply permissions filter
    files = files.filter(file => 
      file.isPublic || 
      file.ownerId === userId || 
      file.permissions.some(p => p.userId === userId && p.canRead)
    );

    // Apply filters
    if (query.q) {
      const search = query.q.toLowerCase();
      files = files.filter(file => 
        file.name.toLowerCase().includes(search) ||
        file.description.toLowerCase().includes(search) ||
        file.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (query.tag) {
      files = files.filter(file => 
        file.tags.some(tag => tag.toLowerCase() === query.tag.toLowerCase())
      );
    }

    if (query.ownerId) {
      files = files.filter(file => file.ownerId === query.ownerId);
    }

    if (query.isPublic !== undefined) {
      files = files.filter(file => file.isPublic === query.isPublic);
    }

    // Apply pagination
    const total = files.length;
    const limit = query.limit || 20;
    const offset = query.offset || 0;
    
    files = files.slice(offset, offset + limit);

    return { files, total, limit, offset };
  }

  async updateFile(fileId, updates, userId) {
    const storageData = await this.readMetadata();
    const fileIndex = storageData.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) return null;

    const file = storageData.files[fileIndex];
    
    // Check permissions
    if (file.ownerId !== userId) {
      const userPermission = file.permissions.find(p => p.userId === userId);
      if (!userPermission || !userPermission.canWrite) {
        return null;
      }
    }

    // Update file metadata
    storageData.files[fileIndex] = {
      ...file,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.writeMetadata(storageData);
    return storageData.files[fileIndex];
  }

  async deleteFile(fileId, userId) {
    const storageData = await this.readMetadata();
    const fileIndex = storageData.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) return false;

    const file = storageData.files[fileIndex];
    
    // Check permissions
    if (file.ownerId !== userId) {
      const userPermission = file.permissions.find(p => p.userId === userId);
      if (!userPermission || !userPermission.canDelete) {
        return false;
      }
    }

    // Remove file metadata
    storageData.files.splice(fileIndex, 1);
    
    // Remove associated versions
    storageData.versions = storageData.versions.filter(v => v.fileId !== fileId);
    
    await this.writeMetadata(storageData);

    // Delete physical files
    const versions = storageData.versions.filter(v => v.fileId === fileId);
    for (const version of versions) {
      const fileName = `${fileId}_${versionId}`;
      try {
        await storageService.deleteFile(fileName);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }

    return true;
  }

  async createVersion(fileId, fileData, userId, changes = '') {
    const storageData = await this.readMetadata();
    const fileIndex = storageData.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) return null;

    const file = storageData.files[fileIndex];
    
    // Check permissions
    if (file.ownerId !== userId) {
      const userPermission = file.permissions.find(p => p.userId === userId);
      if (!userPermission || !userPermission.canWrite) {
        return null;
      }
    }

    const versionId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Get next version number
    const fileVersions = storageData.versions.filter(v => v.fileId === fileId);
    const versionNumber = fileVersions.length + 1;

    const version = {
      id: versionId,
      fileId,
      versionNumber,
      size: fileData.size,
      hash: await this.calculateHash(fileData.buffer),
      uploadedBy: userId,
      uploadedAt: timestamp,
      changes: changes || `Version ${versionNumber}`
    };

    // Update file metadata
    storageData.files[fileIndex].currentVersion = versionId;
    storageData.files[fileIndex].updatedAt = timestamp;
    storageData.files[fileIndex].size = fileData.size;

    storageData.versions.push(version);
    await this.writeMetadata(storageData);

    // Save new version file
    const filePath = path.join(this.storagePath, `${fileId}_${versionId}`);
    await fs.writeFile(filePath, fileData.buffer);

    return version;
  }

  async getFileVersions(fileId, userId) {
    const file = await this.getFileById(fileId, userId);
    if (!file) return null;

    const storageData = await this.readMetadata();
    return storageData.versions.filter(v => v.fileId === fileId);
  }

  async getVersionContent(fileId, versionId, userId) {
    const file = await this.getFileById(fileId, userId);
    if (!file) return null;

    const storageData = await this.readMetadata();
    const version = storageData.versions.find(v => v.id === versionId && v.fileId === fileId);
    
    if (!version) return null;

    const fileName = `${fileId}_${versionId}`;
    try {
      return await storageService.readFile(fileName);
    } catch {
      return null;
    }
  }

  async updatePermissions(fileId, permissions, userId) {
    const storageData = await this.readMetadata();
    const fileIndex = storageData.files.findIndex(f => f.id === fileId);
    
    if (fileIndex === -1) return null;

    const file = storageData.files[fileIndex];
    
    // Only owner can update permissions
    if (file.ownerId !== userId) return null;

    storageData.files[fileIndex].permissions = permissions;
    storageData.files[fileIndex].updatedAt = new Date().toISOString();

    await this.writeMetadata(storageData);
    return storageData.files[fileIndex];
  }

  async calculateHash(buffer) {
    // Simple hash calculation (in production use crypto)
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  async readMetadata() {
    try {
      const data = await fs.readFile(this.metadataPath, 'utf8');
      const metadata = JSON.parse(data);
      
      // Валидация структуры
      await this.validateMetadata(metadata);
      
      return metadata;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Если файл не существует, создаем новый
        await this.initializeMetadata();
        return await this.readMetadata();
      }
      throw error;
    }
  }

  async writeMetadata(metadata) {
    // Обновляем статистику перед сохранением
    metadata.lastUpdated = new Date().toISOString();
    metadata.statistics = this.calculateStatistics(metadata);
    
    await fs.writeFile(this.metadataPath, JSON.stringify(metadata, null, 2));
  }

  async validateMetadata(metadata) {
    try {
      // Используем схему валидации
      const result = metadataSchema.safeParse(metadata);
      if (!result.success) {
        console.warn('Metadata validation failed:', result.error.errors);
        // Можно принять решение: исправить автоматически или выбросить ошибку
        await this.repairMetadata(metadata);
      }
    } catch (error) {
      console.error('Metadata validation error:', error);
    }
  }

  calculateStatistics(metadata) {
    const totalFiles = metadata.files.filter(f => !f.deleted).length;
    const totalVersions = metadata.versions.length;
    const totalUsers = metadata.users ? metadata.users.filter(u => u.isActive).length : 0;
    
    const totalSizeBytes = metadata.files
      .filter(f => !f.deleted)
      .reduce((sum, file) => sum + file.size, 0);
    
    return {
      totalFiles,
      totalVersions,
      totalUsers,
      totalSizeBytes,
      lastCleanup: metadata.statistics?.lastCleanup || null
    };
  }

  async addAuditLog(metadata, entry) {
    if (!metadata.auditLog) {
      metadata.auditLog = [];
    }
    
    metadata.auditLog.push({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...entry
    });
    
    // Ограничиваем размер лога (последние 1000 записей)
    if (metadata.auditLog.length > 1000) {
      metadata.auditLog = metadata.auditLog.slice(-1000);
    }
    
    await this.writeMetadata(metadata);
  }
}

module.exports = new FileStorage();