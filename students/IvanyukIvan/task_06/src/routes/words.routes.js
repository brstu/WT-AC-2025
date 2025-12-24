const express = require('express');
const router = express.Router();
const WordsController = require('../controllers/words.controller');
const authMiddleware = require('../middleware/auth');
const { wordValidation } = require('../middleware/validation');

// Все маршруты требуют авторизации
router.use(authMiddleware);

// CRUD для слов
router.get('/', WordsController.getAllWords);
router.get('/stats', WordsController.getStats);
router.get('/:id', WordsController.getWord);
router.post('/', wordValidation, WordsController.createWord);
router.put('/:id', wordValidation, WordsController.updateWord);
router.delete('/:id', WordsController.deleteWord);
router.patch('/:id/progress', WordsController.updateProgress);

module.exports = router;