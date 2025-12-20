import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCollections = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const collections = await prisma.collection.findMany({
      where: { ownerId: userId },
      include: { movies: { include: { movie: true } } },
    });

    // Map collections so each contains a `movies` array with movie info + role
    const mapped = collections.map(
      (c: {
        id: any;
        title: any;
        description: any;
        ownerId: any;
        createdAt: any;
        updatedAt: any;
        movies: { movie: { id: any; title: any; year: any; genre: any }; role: any }[];
      }) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        ownerId: c.ownerId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        movies: c.movies.map(
          (cm: { movie: { id: any; title: any; year: any; genre: any }; role: any }) => ({
            id: cm.movie.id,
            title: cm.movie.title,
            year: cm.movie.year,
            genre: cm.movie.genre,
            role: cm.role,
          })
        ),
      })
    );

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collections' });
  }
};

export const getCollectionById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
    });
    if (!collection || collection.ownerId !== userId) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching collection' });
  }
};

export const createCollection = async (req: Request, res: Response) => {
  const { title, description } = req.body;
  const userId = (req as any).user.id;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  try {
    const collection = await prisma.collection.create({
      data: { title, description, ownerId: userId },
    });
    res.status(201).json(collection);
  } catch (error) {
    res.status(500).json({ message: 'Error creating collection' });
  }
};

export const updateCollection = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const userId = (req as any).user.id;
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
    });
    if (!collection || collection.ownerId !== userId) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    const updatedCollection = await prisma.collection.update({
      where: { id: parseInt(id) },
      data: { title, description },
    });
    res.json(updatedCollection);
  } catch (error) {
    res.status(500).json({ message: 'Error updating collection' });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  try {
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
    });
    if (!collection || collection.ownerId !== userId) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    await prisma.collection.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting collection' });
  }
};
