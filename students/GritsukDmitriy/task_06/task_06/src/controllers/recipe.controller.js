const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Хелперы для работы с JSON строками
const parseJsonField = (field) => {
  try {
    return typeof field === 'string' ? JSON.parse(field) : field;
  } catch {
    return Array.isArray(field) ? field : [];
  }
};

const stringifyJsonField = (field) => {
  return Array.isArray(field) ? JSON.stringify(field) : '[]';
};

// Получить все рецепты пользователя
const getUserRecipes = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const recipes = await prisma.recipe.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Парсим JSON поля для каждого рецепта
    const parsedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: parseJsonField(recipe.ingredients),
      steps: parseJsonField(recipe.steps),
    }));

    res.json(parsedRecipes);
  } catch (error) {
    console.error('Ошибка получения рецептов:', error);
    res.status(500).json({ error: 'Ошибка при получении рецептов' });
  }
};

// Получить все рецепты (для администратора)
const getAllRecipes = async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Парсим JSON поля для каждого рецепта
    const parsedRecipes = recipes.map(recipe => ({
      ...recipe,
      ingredients: parseJsonField(recipe.ingredients),
      steps: parseJsonField(recipe.steps),
    }));

    res.json(parsedRecipes);
  } catch (error) {
    console.error('Ошибка получения всех рецептов:', error);
    res.status(500).json({ error: 'Ошибка при получении рецептов' });
  }
};

// Получить рецепт по ID
const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }

    // Проверка прав доступа (только автор или администратор)
    if (recipe.authorId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Парсим JSON поля
    recipe.ingredients = parseJsonField(recipe.ingredients);
    recipe.steps = parseJsonField(recipe.steps);

    res.json(recipe);
  } catch (error) {
    console.error('Ошибка получения рецепта:', error);
    res.status(500).json({ error: 'Ошибка при получении рецепта' });
  }
};

// Создать новый рецепт
const createRecipe = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description = '',
      ingredients = [],
      steps = [],
      cookingTime,
      difficulty = 'MEDIUM',
    } = req.body;

    // Валидация
    if (!title || !cookingTime) {
      return res.status(400).json({ error: 'Название и время приготовления обязательны' });
    }

    // Валидация сложности
    const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
    if (!validDifficulties.includes(difficulty.toUpperCase())) {
      return res.status(400).json({ error: 'Недопустимое значение сложности' });
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        ingredients: stringifyJsonField(ingredients),
        steps: stringifyJsonField(steps),
        cookingTime: parseInt(cookingTime),
        difficulty: difficulty.toUpperCase(),
        authorId: userId,
      },
    });

    // Парсим JSON поля для ответа
    recipe.ingredients = parseJsonField(recipe.ingredients);
    recipe.steps = parseJsonField(recipe.steps);

    res.status(201).json({
      message: 'Рецепт создан успешно',
      recipe,
    });
  } catch (error) {
    console.error('Ошибка создания рецепта:', error);
    res.status(500).json({ error: 'Ошибка при создании рецепта' });
  }
};

// Обновить рецепт
const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    let updateData = req.body;

    // Проверка существования рецепта и прав доступа
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRecipe) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }

    if (existingRecipe.authorId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Обрабатываем JSON поля
    if (updateData.ingredients) {
      updateData.ingredients = stringifyJsonField(updateData.ingredients);
    }
    
    if (updateData.steps) {
      updateData.steps = stringifyJsonField(updateData.steps);
    }

    // Валидация сложности
    if (updateData.difficulty) {
      const validDifficulties = ['EASY', 'MEDIUM', 'HARD'];
      if (!validDifficulties.includes(updateData.difficulty.toUpperCase())) {
        return res.status(400).json({ error: 'Недопустимое значение сложности' });
      }
      updateData.difficulty = updateData.difficulty.toUpperCase();
    }

    const recipe = await prisma.recipe.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Парсим JSON поля для ответа
    recipe.ingredients = parseJsonField(recipe.ingredients);
    recipe.steps = parseJsonField(recipe.steps);

    res.json({
      message: 'Рецепт обновлен успешно',
      recipe,
    });
  } catch (error) {
    console.error('Ошибка обновления рецепта:', error);
    res.status(500).json({ error: 'Ошибка при обновлении рецепта' });
  }
};

// Удалить рецепт
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Проверка существования рецепта и прав доступа
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingRecipe) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }

    if (existingRecipe.authorId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    await prisma.recipe.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Рецепт удален успешно' });
  } catch (error) {
    console.error('Ошибка удаления рецепта:', error);
    res.status(500).json({ error: 'Ошибка при удалении рецепта' });
  }
};

module.exports = {
  getUserRecipes,
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  parseJsonField,
  stringifyJsonField,
};