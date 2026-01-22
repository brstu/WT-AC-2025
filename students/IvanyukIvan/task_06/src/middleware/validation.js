const { body, param, validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
};

// Валидация регистрации
const registerValidation = validate([
  body('email')
    .isEmail()
    .withMessage('Введите корректный email')
    .normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Имя пользователя должно быть от 3 до 30 символов')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Имя пользователя может содержать только буквы, цифры и подчеркивания'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Пароль должен содержать минимум 6 символов'),
]);

// Валидация логина
const loginValidation = validate([
  body('email').isEmail().withMessage('Введите корректный email'),
  body('password').notEmpty().withMessage('Введите пароль'),
]);

// Валидация слова
const wordValidation = validate([
  body('original')
    .notEmpty()
    .withMessage('Введите слово')
    .isLength({ max: 100 })
    .withMessage('Слово слишком длинное'),
  body('translation')
    .notEmpty()
    .withMessage('Введите перевод')
    .isLength({ max: 100 })
    .withMessage('Перевод слишком длинный'),
  body('language')
    .optional()
    .isLength({ max: 50 }),
  body('category')
    .optional()
    .isLength({ max: 50 }),
  body('difficulty')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Сложность должна быть от 1 до 5'),
]);

// Валидация заметки
const noteValidation = validate([
  body('title')
    .notEmpty()
    .withMessage('Введите заголовок')
    .isLength({ max: 200 })
    .withMessage('Заголовок слишком длинный'),
  body('content')
    .notEmpty()
    .withMessage('Введите содержание заметки')
    .isLength({ max: 5000 })
    .withMessage('Содержание слишком длинное'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Теги должны быть массивом'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate должен быть boolean'),
]);

module.exports = {
  registerValidation,
  loginValidation,
  wordValidation,
  noteValidation,
};