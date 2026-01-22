import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listUserBookings = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { slot: true, payment: true },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const getBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { slot: true, payment: true },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  const { slotId } = req.body;
  const userId = (req as any).userId;

  if (!slotId) {
    return res.status(400).json({ message: 'slotId is required' });
  }

  try {
    const slot = await prisma.slot.findUnique({
      where: { id: slotId },
      include: { bookings: true },
    });

    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.bookings.length >= slot.capacity) {
      return res.status(400).json({ message: 'Slot is at full capacity' });
    }

    const booking = await prisma.booking.create({
      data: {
        slotId,
        userId,
        status: 'confirmed',
      },
      include: { slot: true },
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = (req as any).userId;

  if (!status) {
    return res.status(400).json({ message: 'status is required' });
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status },
      include: { slot: true, payment: true },
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await prisma.booking.delete({
      where: { id: parseInt(id) },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking' });
  }
};
