import { body } from 'express-validator';

export const signupValidator = [
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password too short (min 6)')
];

export const projectCreateValidator = [
  body('title').isLength({ min: 1 }).withMessage('Title required'),
  body('description').optional().isString(),
  body('isPublic').optional().isBoolean()
];
