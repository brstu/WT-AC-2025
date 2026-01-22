const { prisma } = require('../models');

class WordsController {
  // Получение всех слов пользователя
  static async getAllWords(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20,
        language,
        category,
        isActive,
        search 
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {
        userId: req.user.id
      };

      // Фильтрация
      if (language) where.language = language;
      if (category) where.category = category;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (search) {
        where.OR = [
          { original: { contains: search, mode: 'insensitive' } },
          { translation: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [words, total] = await Promise.all([
        prisma.word.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.word.count({ where })
      ]);

      res.json({
        success: true,
        data: words,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get all words error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении слов'
      });
    }
  }

  // Получение одного слова
  static async getWord(req, res) {
    try {
      const { id } = req.params;

      const word = await prisma.word.findFirst({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!word) {
        return res.status(404).json({
          success: false,
          message: 'Слово не найдено'
        });
      }

      res.json({
        success: true,
        data: word
      });
    } catch (error) {
      console.error('Get word error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении слова'
      });
    }
  }

  // Создание слова
  static async createWord(req, res) {
    try {
      const wordData = {
        ...req.body,
        userId: req.user.id
      };

      const word = await prisma.word.create({
        data: wordData
      });

      res.status(201).json({
        success: true,
        data: word
      });
    } catch (error) {
      console.error('Create word error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при создании слова'
      });
    }
  }

  // Обновление слова
  static async updateWord(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Проверяем, принадлежит ли слово пользователю
      const existingWord = await prisma.word.findFirst({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!existingWord) {
        return res.status(404).json({
          success: false,
          message: 'Слово не найдено'
        });
      }

      const word = await prisma.word.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        data: word
      });
    } catch (error) {
      console.error('Update word error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении слова'
      });
    }
  }

  // Удаление слова
  static async deleteWord(req, res) {
    try {
      const { id } = req.params;

      // Проверяем, принадлежит ли слово пользователю
      const existingWord = await prisma.word.findFirst({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!existingWord) {
        return res.status(404).json({
          success: false,
          message: 'Слово не найдено'
        });
      }

      await prisma.word.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Слово удалено'
      });
    } catch (error) {
      console.error('Delete word error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при удалении слова'
      });
    }
  }

  // Обновление прогресса слова
  static async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { isCorrect } = req.body;

      if (isCorrect === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Поле isCorrect обязательно'
        });
      }

      // Проверяем, принадлежит ли слово пользователю
      const existingWord = await prisma.word.findFirst({
        where: {
          id,
          userId: req.user.id
        }
      });

      if (!existingWord) {
        return res.status(404).json({
          success: false,
          message: 'Слово не найдено'
        });
      }

      const updateData = {
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) // Через 24 часа
      };

      if (isCorrect) {
        updateData.correctCount = existingWord.correctCount + 1;
      } else {
        updateData.wrongCount = existingWord.wrongCount + 1;
      }

      const word = await prisma.word.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        data: word
      });
    } catch (error) {
      console.error('Update progress error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при обновлении прогресса'
      });
    }
  }

  // Получение статистики
  static async getStats(req, res) {
    try {
      const stats = await prisma.word.groupBy({
        by: ['language', 'category', 'difficulty'],
        where: {
          userId: req.user.id
        },
        _count: true,
        _avg: {
          correctCount: true,
          wrongCount: true
        }
      });

      const totalStats = await prisma.word.aggregate({
        where: {
          userId: req.user.id
        },
        _count: true,
        _sum: {
          correctCount: true,
          wrongCount: true
        }
      });

      res.json({
        success: true,
        data: {
          byGroup: stats,
          total: totalStats
        }
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Ошибка при получении статистики'
      });
    }
  }
}

module.exports = WordsController;