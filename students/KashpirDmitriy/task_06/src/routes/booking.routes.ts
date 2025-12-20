import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, bookingController.listUserBookings);
router.get('/:id', authMiddleware, bookingController.getBooking);
router.post('/', authMiddleware, bookingController.createBooking);
router.put('/:id', authMiddleware, bookingController.updateBooking);
router.delete('/:id', authMiddleware, bookingController.deleteBooking);

export default router;
