import { Request, Response, NextFunction } from 'express';
import { validationResult, body } from 'express-validator';

export const validate = (validations: any[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/),
  body('password').isLength({ min: 6 }),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

export const gameValidation = [
  body('title').isLength({ min: 1, max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('genre').isLength({ min: 1, max: 50 }),
  body('platform').isLength({ min: 1, max: 50 }),
  body('releaseYear').isInt({ min: 1970, max: new Date().getFullYear() }),
  body('rating').optional().isFloat({ min: 0, max: 10 }),
  body('imageUrl').optional().isURL(),
];