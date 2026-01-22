const storage = require('../utils/data');
const { NotFoundError, ConflictError } = require('../utils/errors');

/**
 * Сервис для работы с категориями
 */
class CategoriesService {
  /**
   * Получить все категории
   */
  async getAllCategories() {
    const categories = storage.getAllCategories();

    // Добавляем количество рецептов в каждой категории
    const categoriesWithStats = categories.map(category => {
      const recipesCount = Array.from(storage.recipes.values())
        .filter(recipe => recipe.category === category.id)
        .length;

      return {
        ...category,
        recipesCount,
      };
    });

    return categoriesWithStats;
  }

  /**
   * Получить категорию по ID
   */
  async getCategoryById(id) {
    const category = storage.getCategoryById(id);

    if (!category) {
      throw new NotFoundError('Категория');
    }

    // Добавляем рецепты этой категории
    const recipes = Array.from(storage.recipes.values())
      .filter(recipe => recipe.category === id);

    return {
      ...category,
      recipes,
      recipesCount: recipes.length,
    };
  }

  /**
   * Создать новую категорию
   */
  async createCategory(categoryData) {
    // Проверяем уникальность названия
    const existingCategories = storage.getAllCategories();
    const duplicate = existingCategories.find(
      cat => cat.name.toLowerCase() === categoryData.name.toLowerCase()
    );

    if (duplicate) {
      throw new ConflictError('Категория с таким названием уже существует');
    }

    return storage.createCategory(categoryData);
  }

  /**
   * Обновить категорию
   */
  async updateCategory(id, updateData) {
    // Проверяем существование категории
    if (!storage.categoryExists(id)) {
      throw new NotFoundError('Категория');
    }

    // Проверяем уникальность названия (если оно меняется)
    if (updateData.name) {
      const existingCategories = storage.getAllCategories();
      const duplicate = existingCategories.find(
        cat => cat.id !== id && cat.name.toLowerCase() === updateData.name.toLowerCase()
      );

      if (duplicate) {
        throw new ConflictError('Категория с таким названием уже существует');
      }
    }

    const updatedCategory = storage.updateCategory(id, updateData);

    if (!updatedCategory) {
      throw new NotFoundError('Категория');
    }

    return updatedCategory;
  }

  /**
   * Удалить категорию
   */
  async deleteCategory(id) {
    // Проверяем существование категории
    if (!storage.categoryExists(id)) {
      throw new NotFoundError('Категория');
    }

    // Проверяем, есть ли рецепты в этой категории
    const recipesInCategory = Array.from(storage.recipes.values())
      .filter(recipe => recipe.category === id);

    if (recipesInCategory.length > 0) {
      throw new ConflictError('Невозможно удалить категорию, так как в ней есть рецепты');
    }

    const deleted = storage.deleteCategory(id);

    if (!deleted) {
      throw new NotFoundError('Категория');
    }

    return { success: true, message: 'Категория успешно удалена' };
  }

  /**
   * Получить популярные категории
   */
  async getPopularCategories(limit = 5) {
    const categories = storage.getAllCategories();

    // Считаем рецепты в каждой категории
    const categoriesWithCount = categories.map(category => {
      const recipesCount = Array.from(storage.recipes.values())
        .filter(recipe => recipe.category === category.id)
        .length;

      return {
        ...category,
        recipesCount,
      };
    });

    // Сортируем по количеству рецептов
    const sortedCategories = categoriesWithCount
      .sort((a, b) => b.recipesCount - a.recipesCount)
      .slice(0, limit);

    return sortedCategories;
  }
}

module.exports = new CategoriesService();
