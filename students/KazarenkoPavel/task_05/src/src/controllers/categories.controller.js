const categoriesService = require('../services/categories.service');
const config = require('../config/config');

/**
 * Контроллер для работы с категориями
 */
class CategoriesController {
  /**
   * Получить все категории
   */
  async getAllCategories(req, res, next) {
    try {
      const categories = await categoriesService.getAllCategories();

      res.status(200).json({
        success: true,
        data: categories,
        meta: {
          count: categories.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить категорию по ID
   */
  async getCategoryById(req, res, next) {
    try {
      const { id } = req.params;
      const category = await categoriesService.getCategoryById(id);

      res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Создать новую категорию
   */
  async createCategory(req, res, next) {
    try {
      const category = await categoriesService.createCategory(req.body);

      res.status(201).json({
        success: true,
        message: 'Категория успешно создана',
        data: category,
        links: {
          self: `/api/${config.apiVersion}/categories/${category.id}`,
          all: `/api/${config.apiVersion}/categories`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Обновить категорию
   */
  async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = await categoriesService.updateCategory(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Категория успешно обновлена',
        data: category,
        links: {
          self: `/api/${config.apiVersion}/categories/${category.id}`,
          all: `/api/${config.apiVersion}/categories`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Удалить категорию
   */
  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const result = await categoriesService.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить популярные категории
   */
  async getPopularCategories(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const categories = await categoriesService.getPopularCategories(limit);

      res.status(200).json({
        success: true,
        data: categories,
        meta: {
          limit,
          count: categories.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check для категорий
   */
  async healthCheck(req, res) {
    res.status(200).json({
      status: 'healthy',
      service: 'categories-api',
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = new CategoriesController();
