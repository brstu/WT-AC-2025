import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getMovies = async (req: Request, res: Response) => {
  try {
    // include collection relations but only select collectionId
    const movies = await prisma.movie.findMany({
      include: { collections: { select: { collectionId: true } } },
    });

    // Map to include collectionIds array
    const mapped = movies.map(
      (m: {
        id: any;
        title: any;
        year: any;
        genre: any;
        createdAt: any;
        updatedAt: any;
        collections: any[];
      }) => ({
        id: m.id,
        title: m.title,
        year: m.year,
        genre: m.genre,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        collectionIds: m.collections.map((c) => c.collectionId),
      })
    );

    res.json(mapped);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movies' });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(id) },
    });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching movie' });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  const { title, year, genre } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  try {
    const movie = await prisma.movie.create({
      data: { title, year, genre },
    });
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error creating movie' });
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, year, genre } = req.body;
  try {
    const movie = await prisma.movie.update({
      where: { id: parseInt(id) },
      data: { title, year, genre },
    });
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error updating movie' });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.movie.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting movie' });
  }
};
