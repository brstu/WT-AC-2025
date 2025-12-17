import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import {
  authenticateToken,
  authorizeRoles,
} from '../middleware/auth.middleware';
import {
  validate,
  registerValidation,
  loginValidation,
} from '../middleware/validation.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/signup', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);

export default router;