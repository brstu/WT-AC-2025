import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const processPayment = async (req: Request, res: Response) => {
  const { bookingId, amount } = req.body;
  const userId = (req as any).userId;

  if (!bookingId || !amount) {
    return res.status(400).json({ message: 'bookingId and amount are required' });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already exists for this booking' });
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        status: 'completed',
      },
      include: { booking: true },
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'paid' },
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error processing payment' });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const userId = (req as any).userId;

  try {
    const payment = await prisma.payment.findUnique({
      where: { bookingId: parseInt(bookingId) },
      include: { booking: true },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment' });
  }
};
