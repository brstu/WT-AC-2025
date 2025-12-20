import { Router } from 'express';
import { leaguesController } from '../controllers/leagues.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { leagueCreateSchema, leagueUpdateSchema } from '../validators/league.schema.js';

const router = Router();

router.get('/', leaguesController.getAll);
router.get('/:id', leaguesController.getOne);
router.post('/', validate(leagueCreateSchema), leaguesController.create);
router.patch('/:id', validate(leagueUpdateSchema), leaguesController.update);
router.delete('/:id', leaguesController.delete);

export default router;
