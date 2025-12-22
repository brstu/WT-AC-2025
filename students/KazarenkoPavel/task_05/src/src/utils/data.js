const { v4: uuidv4 } = require('uuid');

/**
 * Хранилище данных в памяти
 */
class InMemoryStorage {
  constructor() {
    this.recipes = new Map();
    this.categories = new Map();
    this.initializeSampleData();
  }

  /**
   * Инициализация тестовыми данными
   */
  initializeSampleData() {
    // Категории
    const categories = [
      { id: 'cat1', name: 'Завтрак', description: 'Рецепты для завтрака', color: '#FF6B6B' },
      { id: 'cat2', name: 'Обед', description: 'Рецепты для обеда', color: '#4ECDC4' },
      { id: 'cat3', name: 'Ужин', description: 'Рецепты для ужина', color: '#FFD166' },
      { id: 'cat4', name: 'Десерт', description: 'Сладкие рецепты', color: '#EF476F' },
      { id: 'cat5', name: 'Вегетарианское', description: 'Без мяса', color: '#06D6A0' },
    ];

    categories.forEach(category => {
      this.categories.set(category.id, {
        ...category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Рецепты
    const sampleRecipes = [
      {
        id: 'rec1',
        title: 'Спагетти Карбонара',
        description: 'Классический итальянский рецепт пасты',
        category: 'cat3', // Ужин
        difficulty: 'легко',
        time: 25,
        servings: 4,
        ingredients: [
          { name: 'Спагетти', amount: '400 г' },
          { name: 'Бекон', amount: '200 г' },
          { name: 'Яйца', amount: '4 шт' },
          { name: 'Пармезан', amount: '100 г' },
        ],
        steps: [
          'Отварите спагетти',
          'Обжарьте бекон',
          'Смешайте все ингредиенты',
        ],
        tags: ['итальянская', 'паста', 'быстро'],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'rec2',
        title: 'Омлет с овощами',
        description: 'Легкий и полезный завтрак',
        category: 'cat1', // Завтрак
        difficulty: 'легко',
        time: 15,
        servings: 2,
        ingredients: [
          { name: 'Яйца', amount: '4 шт' },
          { name: 'Помидоры', amount: '2 шт' },
          { name: 'Болгарский перец', amount: '1 шт' },
        ],
        steps: [
          'Нарежьте овощи',
          'Взбейте яйца',
          'Обжарьте все вместе',
        ],
        tags: ['завтрак', 'легко', 'полезно'],
        createdAt: '2024-01-10T08:15:00Z',
        updatedAt: '2024-01-12T09:20:00Z',
      },
    ];

    sampleRecipes.forEach(recipe => {
      this.recipes.set(recipe.id, recipe);
    });
  }

  /**
   * Рецепты
   */
  // Получить все рецепты
  getAllRecipes(filters = {}, pagination = {}) {
    let recipes = Array.from(this.recipes.values());

    // Применение фильтров
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      recipes = recipes.filter(recipe =>
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description.toLowerCase().includes(searchLower) ||
        recipe.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    if (filters.category) {
      recipes = recipes.filter(recipe => recipe.category === filters.category);
    }

    if (filters.difficulty) {
      recipes = recipes.filter(recipe => recipe.difficulty === filters.difficulty);
    }

    if (filters.minTime) {
      recipes = recipes.filter(recipe => recipe.time >= filters.minTime);
    }

    if (filters.maxTime) {
      recipes = recipes.filter(recipe => recipe.time <= filters.maxTime);
    }

    // Сортировка
    if (filters.sortBy) {
      recipes.sort((a, b) => {
        let aVal = a[filters.sortBy];
        let bVal = b[filters.sortBy];

        // Для строк - регистронезависимая сортировка
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Пагинация
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedRecipes = recipes.slice(startIndex, endIndex);

    return {
      data: paginatedRecipes,
      pagination: {
        total: recipes.length,
        page,
        limit,
        totalPages: Math.ceil(recipes.length / limit),
        hasNext: endIndex < recipes.length,
        hasPrev: startIndex > 0,
      },
    };
  }

  // Получить рецепт по ID
  getRecipeById(id) {
    return this.recipes.get(id);
  }

  // Создать рецепт
  createRecipe(recipeData) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const recipe = {
      id,
      ...recipeData,
      createdAt: now,
      updatedAt: now,
    };

    this.recipes.set(id, recipe);
    return recipe;
  }

  // Обновить рецепт
  updateRecipe(id, updateData) {
    const existingRecipe = this.recipes.get(id);

    if (!existingRecipe) {
      return null;
    }

    const updatedRecipe = {
      ...existingRecipe,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    this.recipes.set(id, updatedRecipe);
    return updatedRecipe;
  }

  // Удалить рецепт
  deleteRecipe(id) {
    return this.recipes.delete(id);
  }

  /**
   * Категории
   */
  // Получить все категории
  getAllCategories() {
    return Array.from(this.categories.values());
  }

  // Получить категорию по ID
  getCategoryById(id) {
    return this.categories.get(id);
  }

  // Создать категорию
  createCategory(categoryData) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const category = {
      id,
      ...categoryData,
      createdAt: now,
      updatedAt: now,
    };

    this.categories.set(id, category);
    return category;
  }

  // Обновить категорию
  updateCategory(id, updateData) {
    const existingCategory = this.categories.get(id);

    if (!existingCategory) {
      return null;
    }

    const updatedCategory = {
      ...existingCategory,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  // Удалить категорию
  deleteCategory(id) {
    return this.categories.delete(id);
  }

  /**
   * Вспомогательные методы
   */
  // Проверить существование рецепта
  recipeExists(id) {
    return this.recipes.has(id);
  }

  // Проверить существование категории
  categoryExists(id) {
    return this.categories.has(id);
  }

  // Получить статистику
  getStats() {
    const recipes = Array.from(this.recipes.values());

    const stats = {
      totalRecipes: recipes.length,
      totalCategories: this.categories.size,
      recipesByCategory: {},
      recipesByDifficulty: {
        легко: 0,
        средне: 0,
        сложно: 0,
      },
      averageTime: 0,
      totalIngredients: 0,
    };

    if (recipes.length > 0) {
      let totalTime = 0;
      let totalIngredients = 0;

      recipes.forEach(recipe => {
        // Статистика по категориям
        if (recipe.category) {
          const categoryName = this.getCategoryById(recipe.category)?.name || 'Без категории';
          stats.recipesByCategory[categoryName] = (stats.recipesByCategory[categoryName] || 0) + 1;
        }

        // Статистика по сложности
        if (recipe.difficulty && stats.recipesByDifficulty[recipe.difficulty] !== undefined) {
          stats.recipesByDifficulty[recipe.difficulty]++;
        }

        // Общее время
        totalTime += recipe.time || 0;

        // Общее количество ингредиентов
        totalIngredients += (recipe.ingredients?.length || 0);
      });

      stats.averageTime = Math.round(totalTime / recipes.length);
      stats.totalIngredients = totalIngredients;
    }

    return stats;
  }
}

// Создаем singleton экземпляр хранилища
const storage = new InMemoryStorage();

module.exports = storage;
