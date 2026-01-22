const { PrismaClient } = require('@prisma/client');
const { parseJsonField } = require('./recipe.controller');

const prisma = new PrismaClient();

// Получить избранные рецепты пользователя
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        recipe: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Преобразование структуры ответа с парсингом JSON полей
    const recipes = favorites.map(fav => ({
      ...fav.recipe,
      ingredients: parseJsonField(fav.recipe.ingredients),
      steps: parseJsonField(fav.recipe.steps),
    }));

    res.json(recipes);
  } catch (error) {
    console.error('Ошибка получения избранного:', error);
    res.status(500).json({ error: 'Ошибка при получении избранного' });
  }
};

// Добавить рецепт в избранное
const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).json({ error: 'ID рецепта обязателен' });
    }

    // Проверка существования рецепта
    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(recipeId) },
    });

    if (!recipe) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }

    // Проверка, не добавлен ли уже в избранное
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: parseInt(recipeId),
        },
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ error: 'Рецепт уже в избранном' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        recipeId: parseInt(recipeId),
      },
    });

    res.status(201).json({
      message: 'Рецепт добавлен в избранное',
      favorite,
    });
  } catch (error) {
    console.error('Ошибка добавления в избранное:', error);
    res.status(500).json({ error: 'Ошибка при добавлении в избранное' });
  }
};

// Удалить рецепт из избранного
const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    // Проверка существования записи в избранном
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: parseInt(recipeId),
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Рецепт не найден в избранном' });
    }

    await prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId: parseInt(recipeId),
        },
      },
    });

    res.json({ message: 'Рецепт удален из избранного' });
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error);
    res.status(500).json({ error: 'Ошибка при удалении из избранного' });
  }
};

// Проверить, находится ли рецепт в избранном
const checkFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId: parseInt(recipeId),
        },
      },
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Ошибка проверки избранного:', error);
    res.status(500).json({ error: 'Ошибка при проверке избранного' });
  }
};

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
};