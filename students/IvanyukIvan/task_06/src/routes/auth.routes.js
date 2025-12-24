const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

// Регистрация
router.post('/signup', registerValidation, AuthController.register);

// Логин
router.post('/login', loginValidation, AuthController.login);

// Получение текущего пользователя
router.get('/me', authMiddleware, AuthController.getMe);

module.exports = router;