import { Router } from 'express';
import { matchesController } from '../controllers/matches.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  matchCreateSchema,
  matchUpdateSchema
} from '../validators/match.schema.js';

const router = Router();

router.get('/', matchesController.getAll);
router.get('/:id', matchesController.getOne);
router.post('/', validate(matchCreateSchema), matchesController.create);
router.patch('/:id', validate(matchUpdateSchema), matchesController.update);
router.delete('/:id', matchesController.delete);

export default router;
