import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addMovieToCollection = async (req: Request, res: Response) => {
  const { collectionId, movieId, role } = req.body;
  const userId = (req as any).user.id;
  if (!collectionId || !movieId || !role) {
    return res.status(400).json({ message: 'collectionId, movieId, and role are required' });
  }
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });
    if (!collection || collection.ownerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to add to this collection' });
    }
    const collectionMovie = await prisma.collectionMovie.create({
      data: { collectionId, movieId, role },
    });
    res.status(201).json(collectionMovie);
  } catch (error) {
    res.status(500).json({ message: 'Error adding movie to collection' });
  }
};

export const getCollectionMovies = async (req: Request, res: Response) => {
  const { collectionId } = req.params;
  const userId = (req as any).user.id;
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(collectionId) },
    });
    if (!collection || collection.ownerId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const collectionMovies = await prisma.collectionMovie.findMany({
      where: { collectionId: parseInt(collectionId) },
      include: { movie: true },
    });
    res.json(collectionMovies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collection movies' });
  }
};

export const updateCollectionMovie = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const userId = (req as any).user.id;
  try {
    const collectionMovie = await prisma.collectionMovie.findUnique({
      where: { id: parseInt(id) },
      include: { collection: true },
    });
    if (!collectionMovie || collectionMovie.collection.ownerId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await prisma.collectionMovie.update({
      where: { id: parseInt(id) },
      data: { role },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating collection movie' });
  }
};

export const deleteCollectionMovie = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  try {
    const collectionMovie = await prisma.collectionMovie.findUnique({
      where: { id: parseInt(id) },
      include: { collection: true },
    });
    if (!collectionMovie || collectionMovie.collection.ownerId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await prisma.collectionMovie.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting collection movie' });
  }
};
