import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listSlots = async (req: Request, res: Response) => {
  try {
    const slots = await prisma.slot.findMany({
      orderBy: { startTime: 'asc' },
    });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slots' });
  }
};

export const getSlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const slot = await prisma.slot.findUnique({
      where: { id: parseInt(id) },
      include: { bookings: true },
    });
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slot' });
  }
};

export const createSlot = async (req: Request, res: Response) => {
  const { startTime, endTime, capacity, price } = req.body;
  
  if (!startTime || !endTime || !capacity) {
    return res.status(400).json({ message: 'startTime, endTime, and capacity are required' });
  }

  try {
    const slot = await prisma.slot.create({
      data: {
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        capacity,
        price: price || 0,
      },
    });
    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating slot' });
  }
};

export const updateSlot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { startTime, endTime, capacity, price } = req.body;

  try {
    const slot = await prisma.slot.update({
      where: { id: parseInt(id) },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        capacity: capacity || undefined,
        price: price || undefined,
      },
    });
    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Error updating slot' });
  }
};

export const deleteSlot = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.slot.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting slot' });
  }
};
