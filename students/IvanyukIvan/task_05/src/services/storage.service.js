const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');
const { pipeline } = require('stream');
const streamPipeline = promisify(pipeline);
const config = require('../config');
const { AppError } = require('../utils/errors');

class StorageService {
  constructor() {
    this.storagePath = config.storage.storagePath;
    this.initStorage();
  }

  /**
   * Инициализация хранилища
   */
  async initStorage() {
    try {
      await fs.mkdir(this.storagePath, { recursive: true });
      console.log(`Storage initialized at: ${this.storagePath}`);
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw new AppError('Storage initialization failed', 500);
    }
  }

  /**
   * Сохранить файл на диск
   * @param {Buffer} buffer - содержимое файла
   * @param {string} fileName - имя файла
   * @returns {Promise<string>} путь к сохраненному файлу
   */
  async saveFile(buffer, fileName) {
    try {
      const filePath = path.join(this.storagePath, fileName);
      await fs.writeFile(filePath, buffer);
      return filePath;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new AppError('Failed to save file', 500);
    }
  }

  /**
   * Сохранить файл через поток (для больших файлов)
   * @param {ReadableStream} readStream - поток чтения
   * @param {string} fileName - имя файла
   * @returns {Promise<string>} путь к сохраненному файлу
   */
  async saveFileStream(readStream, fileName) {
    try {
      const filePath = path.join(this.storagePath, fileName);
      const writeStream = fs.createWriteStream(filePath);
      
      await streamPipeline(readStream, writeStream);
      return filePath;
    } catch (error) {
      console.error('Error saving file stream:', error);
      throw new AppError('Failed to save file stream', 500);
    }
  }

  /**
   * Прочитать файл с диска
   * @param {string} fileName - имя файла
   * @returns {Promise<Buffer>} содержимое файла
   */
  async readFile(fileName) {
    try {
      const filePath = path.join(this.storagePath, fileName);
      await this.checkFileExists(filePath);
      return await fs.readFile(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new AppError('File not found', 404);
      }
      console.error('Error reading file:', error);
      throw new AppError('Failed to read file', 500);
    }
  }

  /**
   * Создать поток чтения файла
   * @param {string} fileName - имя файла
   * @returns {ReadableStream} поток чтения
   */
  createReadStream(fileName) {
    try {
      const filePath = path.join(this.storagePath, fileName);
      return fs.createReadStream(filePath);
    } catch (error) {
      console.error('Error creating read stream:', error);
      throw new AppError('Failed to create read stream', 500);
    }
  }

  /**
   * Удалить файл с диска
   * @param {string} fileName - имя файла
   * @returns {Promise<boolean>} успех операции
   */
  async deleteFile(fileName) {
    try {
      const filePath = path.join(this.storagePath, fileName);
      await this.checkFileExists(filePath);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return false; // Файл уже не существует
      }
      console.error('Error deleting file:', error);
      throw new AppError('Failed to delete file', 500);
    }
  }

  /**
   * Проверить существование файла
   * @param {string} filePath - путь к файлу
   * @returns {Promise<boolean>} существует ли файл
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Проверить и выбросить ошибку если файл не существует
   * @param {string} filePath - путь к файлу
   */
  async checkFileExists(filePath) {
    const exists = await this.fileExists(filePath);
    if (!exists) {
      throw new AppError('File not found', 404);
    }
  }

  /**
   * Получить информацию о файле
   * @param {string} fileName - имя файла
   * @returns {Promise<Object>} информация о файле
   */
  async getFileInfo(fileName) {
    try {
      const filePath = path.join(this.storagePath, fileName);
      await this.checkFileExists(filePath);
      
      const stats = await fs.stat(filePath);
      
      return {
        fileName,
        filePath,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw new AppError('Failed to get file info', 500);
    }
  }

  /**
   * Вычислить хэш файла
   * @param {Buffer} buffer - содержимое файла
   * @returns {string} хэш SHA-256
   */
  calculateHash(buffer) {
    try {
      return crypto.createHash('sha256').update(buffer).digest('hex');
    } catch (error) {
      console.error('Error calculating hash:', error);
      throw new AppError('Failed to calculate file hash', 500);
    }
  }

  /**
   * Вычислить хэш файла на диске
   * @param {string} fileName - имя файла
   * @returns {Promise<string>} хэш SHA-256
   */
  async calculateFileHash(fileName) {
    try {
      const filePath = path.join(this.storagePath, fileName);
      await this.checkFileExists(filePath);
      
      const hash = crypto.createHash('sha256');
      const readStream = fs.createReadStream(filePath);
      
      return new Promise((resolve, reject) => {
        readStream.on('data', chunk => hash.update(chunk));
        readStream.on('end', () => resolve(hash.digest('hex')));
        readStream.on('error', reject);
      });
    } catch (error) {
      console.error('Error calculating file hash:', error);
      throw new AppError('Failed to calculate file hash', 500);
    }
  }

  /**
   * Скопировать файл
   * @param {string} sourceFileName - исходный файл
   * @param {string} targetFileName - целевой файл
   * @returns {Promise<string>} путь к скопированному файлу
   */
  async copyFile(sourceFileName, targetFileName) {
    try {
      const sourcePath = path.join(this.storagePath, sourceFileName);
      const targetPath = path.join(this.storagePath, targetFileName);
      
      await this.checkFileExists(sourcePath);
      await fs.copyFile(sourcePath, targetPath);
      
      return targetPath;
    } catch (error) {
      console.error('Error copying file:', error);
      throw new AppError('Failed to copy file', 500);
    }
  }

  /**
   * Переместить/переименовать файл
   * @param {string} oldFileName - старое имя файла
   * @param {string} newFileName - новое имя файла
   * @returns {Promise<string>} новый путь к файлу
   */
  async moveFile(oldFileName, newFileName) {
    try {
      const oldPath = path.join(this.storagePath, oldFileName);
      const newPath = path.join(this.storagePath, newFileName);
      
      await this.checkFileExists(oldPath);
      await fs.rename(oldPath, newPath);
      
      return newPath;
    } catch (error) {
      console.error('Error moving file:', error);
      throw new AppError('Failed to move file', 500);
    }
  }

  /**
   * Получить список файлов в директории
   * @param {string} subDir - поддиректория (опционально)
   * @returns {Promise<string[]>} список файлов
   */
  async listFiles(subDir = '') {
    try {
      const dirPath = subDir 
        ? path.join(this.storagePath, subDir)
        : this.storagePath;
      
      await fs.access(dirPath);
      const files = await fs.readdir(dirPath);
      
      // Фильтруем скрытые файлы и возвращаем только файлы
      const fileInfos = await Promise.all(
        files
          .filter(file => !file.startsWith('.'))
          .map(async file => {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);
            return {
              name: file,
              path: subDir ? path.join(subDir, file) : file,
              size: stats.size,
              isDirectory: stats.isDirectory(),
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime
            };
          })
      );
      
      return fileInfos;
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      console.error('Error listing files:', error);
      throw new AppError('Failed to list files', 500);
    }
  }

  /**
   * Создать директорию
   * @param {string} dirName - имя директории
   * @returns {Promise<string>} путь к созданной директории
   */
  async createDirectory(dirName) {
    try {
      const dirPath = path.join(this.storagePath, dirName);
      await fs.mkdir(dirPath, { recursive: true });
      return dirPath;
    } catch (error) {
      console.error('Error creating directory:', error);
      throw new AppError('Failed to create directory', 500);
    }
  }

  /**
   * Удалить директорию
   * @param {string} dirName - имя директории
   * @returns {Promise<boolean>} успех операции
   */
  async deleteDirectory(dirName) {
    try {
      const dirPath = path.join(this.storagePath, dirName);
      await fs.rm(dirPath, { recursive: true, force: true });
      return true;
    } catch (error) {
      console.error('Error deleting directory:', error);
      throw new AppError('Failed to delete directory', 500);
    }
  }

  /**
   * Получить статистику использования хранилища
   * @returns {Promise<Object>} статистика
   */
  async getStorageStats() {
    try {
      const files = await this.listFiles();
      
      let totalSize = 0;
      let fileCount = 0;
      let dirCount = 0;
      
      for (const file of files) {
        if (file.isDirectory) {
          dirCount++;
        } else {
          fileCount++;
          totalSize += file.size;
        }
      }
      
      const diskStats = await this.getDiskStats();
      
      return {
        totalSize,
        fileCount,
        dirCount,
        freeSpace: diskStats.free,
        totalSpace: diskStats.total,
        usedPercentage: diskStats.usedPercentage
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw new AppError('Failed to get storage stats', 500);
    }
  }

  /**
   * Получить статистику диска
   * @returns {Promise<Object>} статистика диска
   */
  async getDiskStats() {
    try {
      const stats = await fs.statfs(this.storagePath);
      
      const blockSize = stats.bsize;
      const totalBlocks = stats.blocks;
      const freeBlocks = stats.bfree;
      const availableBlocks = stats.bavail;
      
      const total = totalBlocks * blockSize;
      const free = freeBlocks * blockSize;
      const available = availableBlocks * blockSize;
      const used = total - free;
      const usedPercentage = (used / total) * 100;
      
      return {
        total,
        free,
        available,
        used,
        usedPercentage: Math.round(usedPercentage * 100) / 100
      };
    } catch (error) {
      console.error('Error getting disk stats:', error);
      return {
        total: 0,
        free: 0,
        available: 0,
        used: 0,
        usedPercentage: 0
      };
    }
  }

  /**
   * Очистить старые файлы
   * @param {number} maxAgeHours - максимальный возраст в часах
   * @returns {Promise<number>} количество удаленных файлов
   */
  async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = await this.listFiles();
      const now = Date.now();
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      
      let deletedCount = 0;
      
      for (const file of files) {
        if (!file.isDirectory) {
          const fileAge = now - new Date(file.modifiedAt).getTime();
          
          if (fileAge > maxAgeMs) {
            await this.deleteFile(file.path);
            deletedCount++;
          }
        }
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old files:', error);
      throw new AppError('Failed to cleanup old files', 500);
    }
  }

  /**
   * Проверить целостность файла
   * @param {string} fileName - имя файла
   * @param {string} expectedHash - ожидаемый хэш
   * @returns {Promise<boolean>} целостность не нарушена
   */
  async verifyFileIntegrity(fileName, expectedHash) {
    try {
      const actualHash = await this.calculateFileHash(fileName);
      return actualHash === expectedHash;
    } catch (error) {
      console.error('Error verifying file integrity:', error);
      return false;
    }
  }

  /**
   * Сжать файл (gzip)
   * @param {string} fileName - имя файла
   * @param {string} compressedFileName - имя сжатого файла
   * @returns {Promise<string>} путь к сжатому файлу
   */
  async compressFile(fileName, compressedFileName = null) {
    try {
      const zlib = require('zlib');
      const compress = promisify(zlib.gzip);
      
      const fileBuffer = await this.readFile(fileName);
      const compressedBuffer = await compress(fileBuffer);
      
      const targetFileName = compressedFileName || `${fileName}.gz`;
      await this.saveFile(compressedBuffer, targetFileName);
      
      return path.join(this.storagePath, targetFileName);
    } catch (error) {
      console.error('Error compressing file:', error);
      throw new AppError('Failed to compress file', 500);
    }
  }

  /**
   * Распаковать файл (gzip)
   * @param {string} fileName - имя файла
   * @param {string} decompressedFileName - имя распакованного файла
   * @returns {Promise<string>} путь к распакованному файлу
   */
  async decompressFile(fileName, decompressedFileName = null) {
    try {
      const zlib = require('zlib');
      const decompress = promisify(zlib.gunzip);
      
      const fileBuffer = await this.readFile(fileName);
      const decompressedBuffer = await decompress(fileBuffer);
      
      const targetFileName = decompressedFileName || 
        fileName.replace(/\.gz$/, '');
      
      await this.saveFile(decompressedBuffer, targetFileName);
      
      return path.join(this.storagePath, targetFileName);
    } catch (error) {
      console.error('Error decompressing file:', error);
      throw new AppError('Failed to decompress file', 500);
    }
  }
}

// Создаем singleton экземпляр
module.exports = new StorageService();