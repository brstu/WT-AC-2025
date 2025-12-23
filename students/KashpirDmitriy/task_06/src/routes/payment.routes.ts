import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authMiddleware, paymentController.processPayment);
router.get('/:bookingId', authMiddleware, paymentController.getPaymentStatus);

export default router;
