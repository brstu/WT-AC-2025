const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { signup, login, refreshToken } = require('../controllers/auth.controller');

// Валидация
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Маршруты
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);

module.exports = router;