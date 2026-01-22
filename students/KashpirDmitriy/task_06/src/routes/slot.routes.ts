import { Router } from 'express';
import * as slotController from '../controllers/slot.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, slotController.listSlots);
router.get('/:id', authMiddleware, slotController.getSlot);
router.post('/', authMiddleware, (req, res, next) => {
  if ((req as any).role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can create slots' });
  }
  slotController.createSlot(req, res);
});
router.put('/:id', authMiddleware, (req, res, next) => {
  if ((req as any).role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update slots' });
  }
  slotController.updateSlot(req, res);
});
router.delete('/:id', authMiddleware, (req, res, next) => {
  if ((req as any).role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can delete slots' });
  }
  slotController.deleteSlot(req, res);
});

export default router;
