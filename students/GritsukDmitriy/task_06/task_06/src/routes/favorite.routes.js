const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  checkFavorite,
} = require('../controllers/favorite.controller');

// Все маршруты требуют авторизации
router.use(authMiddleware);

// Маршруты
router.get('/', getFavorites);
router.post('/', addToFavorites);
router.delete('/:recipeId', removeFromFavorites);
router.get('/check/:recipeId', checkFavorite);

module.exports = router;