const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const {
  getUserRecipes,
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} = require('../controllers/recipe.controller');

// Валидация для создания/обновления рецепта
const recipeValidation = [
  body('title').notEmpty().trim().withMessage('Название обязательно'),
  body('cookingTime').isInt({ min: 1 }).withMessage('Время приготовления должно быть положительным числом'),
  body('difficulty').optional().isIn(['EASY', 'MEDIUM', 'HARD']).withMessage('Недопустимое значение сложности'),
  body('ingredients').optional().isArray().withMessage('Ингредиенты должны быть массивом'),
  body('steps').optional().isArray().withMessage('Шаги должны быть массивом'),
];

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Маршруты для пользователя
router.get('/', getUserRecipes);
router.get('/:id', getRecipeById);
router.post('/', recipeValidation, createRecipe);
router.put('/:id', recipeValidation, updateRecipe);
router.delete('/:id', deleteRecipe);

// Админ-маршруты
router.get('/admin/all', adminMiddleware, getAllRecipes);

module.exports = router;