const storage = require('../utils/data');
const { NotFoundError, ConflictError } = require('../utils/errors');
const config = require('../config/config');

/**
 * Сервис для работы с рецептами
 */
class RecipesService {
  /**
   * Получить все рецепты с пагинацией и фильтрацией
   */
  async getAllRecipes(query = {}) {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      search,
      category,
      difficulty,
      minTime,
      maxTime,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filters = {
      ...(search && { search }),
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(minTime && { minTime: parseInt(minTime) }),
      ...(maxTime && { maxTime: parseInt(maxTime) }),
      sortBy,
      sortOrder,
    };

    const pagination = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), config.pagination.maxLimit),
    };

    return storage.getAllRecipes(filters, pagination);
  }

  /**
   * Получить рецепт по ID
   */
  async getRecipeById(id) {
    const recipe = storage.getRecipeById(id);

    if (!recipe) {
      throw new NotFoundError('Рецепт');
    }

    // Получаем информацию о категории
    if (recipe.category) {
      const category = storage.getCategoryById(recipe.category);
      recipe.categoryDetails = category || null;
    }

    return recipe;
  }

  /**
   * Создать новый рецепт
   */
  async createRecipe(recipeData) {
    // Проверяем существование категории
    if (recipeData.category && !storage.categoryExists(recipeData.category)) {
      throw new NotFoundError('Категория');
    }

    // Проверяем уникальность названия (опционально)
    const existingRecipes = Array.from(storage.recipes.values());
    const duplicate = existingRecipes.find(
      recipe => recipe.title.toLowerCase() === recipeData.title.toLowerCase()
    );

    if (duplicate) {
      throw new ConflictError('Рецепт с таким названием уже существует');
    }

    return storage.createRecipe(recipeData);
  }

  /**
   * Обновить рецепт
   */
  async updateRecipe(id, updateData) {
    // Проверяем существование рецепта
    if (!storage.recipeExists(id)) {
      throw new NotFoundError('Рецепт');
    }

    // Проверяем существование категории (если она меняется)
    if (updateData.category && !storage.categoryExists(updateData.category)) {
      throw new NotFoundError('Категория');
    }

    // Проверяем уникальность названия (если оно меняется)
    if (updateData.title) {
      const existingRecipes = Array.from(storage.recipes.values());
      const duplicate = existingRecipes.find(
        recipe => recipe.id !== id && recipe.title.toLowerCase() === updateData.title.toLowerCase()
      );

      if (duplicate) {
        throw new ConflictError('Рецепт с таким названием уже существует');
      }
    }

    const updatedRecipe = storage.updateRecipe(id, updateData);

    if (!updatedRecipe) {
      throw new NotFoundError('Рецепт');
    }

    return updatedRecipe;
  }

  /**
   * Удалить рецепт
   */
  async deleteRecipe(id) {
    if (!storage.recipeExists(id)) {
      throw new NotFoundError('Рецепт');
    }

    const deleted = storage.deleteRecipe(id);

    if (!deleted) {
      throw new NotFoundError('Рецепт');
    }

    return { success: true, message: 'Рецепт успешно удален' };
  }

  /**
   * Получить рецепты по категории
   */
  async getRecipesByCategory(categoryId, query = {}) {
    // Проверяем существование категории
    const category = storage.getCategoryById(categoryId);

    if (!category) {
      throw new NotFoundError('Категория');
    }

    const recipes = Array.from(storage.recipes.values())
      .filter(recipe => recipe.category === categoryId);

    const { page = 1, limit = 10 } = query;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRecipes = recipes.slice(startIndex, endIndex);

    return {
      data: paginatedRecipes,
      category,
      pagination: {
        total: recipes.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(recipes.length / limit),
      },
    };
  }

  /**
   * Поиск рецептов
   */
  async searchRecipes(searchQuery, options = {}) {
    const recipes = Array.from(storage.recipes.values());

    const searchLower = searchQuery.toLowerCase();
    const results = recipes.filter(recipe => {
      // Поиск в названии
      if (recipe.title.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Поиск в описании
      if (recipe.description.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Поиск в ингредиентах
      if (recipe.ingredients?.some(ing =>
        ing.name.toLowerCase().includes(searchLower)
      )) {
        return true;
      }

      // Поиск в тегах
      if (recipe.tags?.some(tag =>
        tag.toLowerCase().includes(searchLower)
      )) {
        return true;
      }

      return false;
    });

    // Сортировка по релевантности (простая реализация)
    results.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, searchLower);
      const bScore = this.calculateRelevanceScore(b, searchLower);
      return bScore - aScore;
    });

    const { limit = 20 } = options;
    return results.slice(0, limit);
  }

  /**
   * Рассчитать оценку релевантности для поиска
   */
  calculateRelevanceScore(recipe, searchTerm) {
    let score = 0;

    // Название имеет наибольший вес
    if (recipe.title.toLowerCase().includes(searchTerm)) {
      score += 10;

      // Если совпадение в начале названия - дополнительный бонус
      if (recipe.title.toLowerCase().startsWith(searchTerm)) {
        score += 5;
      }
    }

    // Описание
    if (recipe.description.toLowerCase().includes(searchTerm)) {
      score += 3;
    }

    // Ингредиенты
    if (recipe.ingredients?.some(ing => ing.name.toLowerCase().includes(searchTerm))) {
      score += 2;
    }

    // Теги
    if (recipe.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
      score += 1;
    }

    return score;
  }

  /**
   * Получить статистику
   */
  async getStats() {
    return storage.getStats();
  }
}

module.exports = new RecipesService();
