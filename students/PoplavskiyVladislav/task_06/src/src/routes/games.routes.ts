import { Router } from 'express';
import { GameController } from '../controllers/games.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate, gameValidation } from '../middleware/validation.middleware';

const router = Router();
const gameController = new GameController();

// Все маршруты требуют аутентификации
router.use(authenticateToken);

// CRUD операций
router.post('/', validate(gameValidation), gameController.createGame);
router.get('/', gameController.getGames);
router.get('/stats', gameController.getStats);
router.get('/:id', gameController.getGame);
router.put('/:id', validate(gameValidation), gameController.updateGame);
router.delete('/:id', gameController.deleteGame);

export default router;