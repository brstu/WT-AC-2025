const recipesService = require('../services/recipes.service');
const { ApiError } = require('../utils/errors');
const config = require('../config/config');

/**
 * Контроллер для работы с рецептами
 */
class RecipesController {
  /**
   * Получить все рецепты
   */
  async getAllRecipes(req, res, next) {
    try {
      const result = await recipesService.getAllRecipes(req.query);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        meta: {
          total: result.pagination.total,
          returned: result.data.length,
          filters: req.query,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить рецепт по ID
   */
  async getRecipeById(req, res, next) {
    try {
      const { id } = req.params;
      const recipe = await recipesService.getRecipeById(id);

      res.status(200).json({
        success: true,
        data: recipe,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Создать новый рецепт
   */
  async createRecipe(req, res, next) {
    try {
      const recipe = await recipesService.createRecipe(req.body);

      res.status(201).json({
        success: true,
        message: 'Рецепт успешно создан',
        data: recipe,
        links: {
          self: `/api/${config.apiVersion}/recipes/${recipe.id}`,
          all: `/api/${config.apiVersion}/recipes`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Обновить рецепт
   */
  async updateRecipe(req, res, next) {
    try {
      const { id } = req.params;
      const recipe = await recipesService.updateRecipe(id, req.body);

      res.status(200).json({
        success: true,
        message: 'Рецепт успешно обновлен',
        data: recipe,
        links: {
          self: `/api/${config.apiVersion}/recipes/${recipe.id}`,
          all: `/api/${config.apiVersion}/recipes`,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Удалить рецепт
   */
  async deleteRecipe(req, res, next) {
    try {
      const { id } = req.params;
      const result = await recipesService.deleteRecipe(id);

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
   * Получить рецепты по категории
   */
  async getRecipesByCategory(req, res, next) {
    try {
      const { categoryId } = req.params;
      const result = await recipesService.getRecipesByCategory(categoryId, req.query);

      res.status(200).json({
        success: true,
        data: result.data,
        category: result.category,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Поиск рецептов
   */
  async searchRecipes(req, res, next) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === '') {
        throw new ApiError('Поисковый запрос не может быть пустым', 400);
      }

      const results = await recipesService.searchRecipes(q, {
        limit: parseInt(req.query.limit) || 20,
      });

      res.status(200).json({
        success: true,
        data: results,
        meta: {
          query: q,
          count: results.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получить статистику рецептов
   */
  async getStats(req, res, next) {
    try {
      const stats = await recipesService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
        meta: {
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check для рецептов
   */
  async healthCheck(req, res, next) {
    try {
      const stats = await recipesService.getStats();

      res.status(200).json({
        status: 'healthy',
        service: 'recipes-api',
        timestamp: new Date().toISOString(),
        stats: {
          totalRecipes: stats.totalRecipes,
          totalCategories: stats.totalCategories,
        },
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        service: 'recipes-api',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  }
}

module.exports = new RecipesController();
